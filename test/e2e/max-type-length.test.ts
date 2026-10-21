import { afterAll, describe, expect, it } from "vitest";
import {
  archlock,
  checkJson,
  cleanupFixtures,
  copyFixture,
  edit,
  read,
  write,
} from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

const UNION = Array.from({ length: 30 }, (_, i) => `"h${i}"`).join(" | ");

function setMax(dir: string, max: number | null): void {
  const config = JSON.parse(read(dir, "archlock.config.json"));
  config.maxTypeLength = max;
  write(dir, "archlock.config.json", JSON.stringify(config, null, 2));
}

describe("maxTypeLength (opt-in)", () => {
  it("abbreviates long types, keeps check green, and still detects a change", async () => {
    const dir = copyFixture("ts-single");
    write(dir, "src/events/headers.ts", `export type Header = ${UNION};\n`);
    edit(dir, "src/events/index.ts", /^/, 'export type { Header } from "./headers";\n');
    await archlock(dir, "init", "--yes");
    expect(read(dir, "archlock/events.arch.py")).toContain('"h29"');

    // Turning it on does not need an accept: sketches are abbreviated like the code.
    setMax(dir, 60);
    expect((await checkJson(dir)).summary.errors).toBe(0);

    expect((await archlock(dir, "accept", "--yes")).code).toBe(0);
    const sketch = read(dir, "archlock/events.arch.py");
    expect(sketch).toMatch(/Header: TypeAlias = '<"h0" \| .* … \(\d+ chars, #[0-9a-f]{8}\)>'/);
    expect(sketch).not.toContain('"h29"');
    expect((await checkJson(dir)).summary.errors).toBe(0);

    edit(dir, "src/events/headers.ts", '"h29"', '"h30"');
    const changed = await checkJson(dir);
    expect(changed.violations.map((v) => `${v.rule}:${v.symbol}`)).toEqual([
      "signature_changed:Header",
    ]);
  });

  it("is off by default and validated", async () => {
    const dir = copyFixture("ts-single");
    await archlock(dir, "init", "--yes");
    expect(read(dir, "archlock.config.json")).not.toContain("maxTypeLength");
    setMax(dir, 10);
    const r = await archlock(dir, "check");
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("maxTypeLength: must be an integer of at least 40");
  });
});
