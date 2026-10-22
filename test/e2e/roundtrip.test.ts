import { afterAll, describe, expect, it } from "vitest";
import { parseSketch } from "../../src/sketch/parse.js";
import { renderSketch } from "../../src/sketch/render.js";
import {
  archlock,
  checkJson,
  cleanupFixtures,
  copyFixture,
  read,
  snapshotDir,
} from "../helpers/fixtures.js";

const FIXTURES = [
  "ts-single",
  "ts-monorepo",
  "ts-edge",
  "py-src",
  "py-flat",
  "mixed",
  "vue-app",
  "svelte-app",
  "astro-site",
  "nuxt-app",
];

/** Warnings a fixture contains on purpose (edge cases); errors are never expected. */
const EXPECTED_WARNINGS: Record<string, string[]> = {
  "py-flat": ["deep_import:api"],
  "svelte-app": ["deep_import:routes"],
};

afterAll(cleanupFixtures);

describe.each(FIXTURES)("round-trip guarantee: %s", (fixture) => {
  it("init then check reports no errors (and only the intended warnings)", async () => {
    const dir = copyFixture(fixture);
    const init = await archlock(dir, "init", "--yes");
    expect(init.stderr).toBe("");
    expect(init.code).toBe(0);
    const check = await checkJson(dir);
    expect(check.violations.filter((v) => v.severity === "error")).toEqual([]);
    const warnings = check.violations
      .filter((v) => v.severity === "warn")
      .map((v) => `${v.rule}:${v.module}`);
    expect(warnings).toEqual(EXPECTED_WARNINGS[fixture] ?? []);
    expect(check.code).toBe(0);
  });

  it("render(parse(sketch)) === sketch for every generated sketch", async () => {
    const dir = copyFixture(fixture);
    await archlock(dir, "init", "--yes");
    const sketches = snapshotDir(dir, "archlock");
    expect(Object.keys(sketches).length).toBeGreaterThan(0);
    for (const [file, text] of Object.entries(sketches)) {
      if (!file.endsWith(".arch.py")) continue;
      const parsed = await parseSketch(text, file);
      expect(parsed.errors).toEqual([]);
      expect(renderSketch(parsed.module as NonNullable<typeof parsed.module>)).toBe(text);
    }
  });

  it("init twice produces byte-identical files", async () => {
    const a = copyFixture(fixture);
    const b = copyFixture(fixture);
    await archlock(a, "init", "--yes");
    await archlock(b, "init", "--yes");
    expect(snapshotDir(b, "archlock")).toEqual(snapshotDir(a, "archlock"));
    expect(read(b, "archlock.config.json")).toBe(read(a, "archlock.config.json"));
    // And again over an existing setup.
    await archlock(b, "init", "--yes", "--force");
    expect(snapshotDir(b, "archlock")).toEqual(snapshotDir(a, "archlock"));
  });
});
