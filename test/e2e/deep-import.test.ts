import { afterAll, describe, expect, it } from "vitest";
import { archlock, checkJson, cleanupFixtures, copyFixture, edit } from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

/** ts-edge: module `a` exposes `helpers.ts` as a namespace and re-exports `Shape`/`Point`. */
async function deepImports(imports: string, shapesExtra = ""): Promise<string[]> {
  const dir = copyFixture("ts-edge");
  await archlock(dir, "init", "--yes");
  if (shapesExtra) edit(dir, "src/a/shapes.ts", /$/, `\n${shapesExtra}\n`);
  edit(dir, "src/b/index.ts", /^/, `${imports}\n`);
  const r = await checkJson(dir);
  return r.violations
    .filter((v) => v.rule === "deep_import" && v.module === "b")
    .map((v) => v.message);
}

describe("deep_import", () => {
  it("allows names and whole-file imports of a file the entry exposes as a namespace", async () => {
    // src/a/index.ts: export * as helpers from "./helpers"
    expect(
      await deepImports(
        'import { double } from "../a/helpers";\nimport * as h from "../a/helpers";\nh.parse("1"); double(1);',
      ),
    ).toEqual([]);
  });

  it("allows a whole-file import when every export of the file is public", async () => {
    // Point and Shape, all that shapes.ts exports, are re-exported from the entry.
    expect(await deepImports('import * as shapes from "../a/shapes";\nshapes.Shape;')).toEqual([]);
  });

  it("still reports a whole-file import that reaches a private export", async () => {
    const found = await deepImports(
      'import * as shapes from "../a/shapes";\nshapes.hidden;',
      "export const hidden = 1;",
    );
    expect(found).toHaveLength(1);
    expect(found[0]).toContain("src/a/shapes.ts");
  });
});
