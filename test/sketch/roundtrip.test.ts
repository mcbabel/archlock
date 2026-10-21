import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canonicalType, renderType as renderTypeFor } from "../../src/core/canonical.js";
import { parseSketch } from "../../src/sketch/parse.js";
import { renderSketch } from "../../src/sketch/render.js";

const goldenDir = new URL("../golden/", import.meta.url);
const goldenFiles = readdirSync(goldenDir).filter((f) => f.endsWith(".arch.py"));
const normalizeDir = new URL("../golden/normalize/", import.meta.url);
const normalizeInputs = readdirSync(normalizeDir).filter((f) => f.endsWith(".input.arch.py"));

async function roundTrip(text: string, file: string): Promise<string> {
  const result = await parseSketch(text, file);
  expect(result.errors).toEqual([]);
  if (!result.module) throw new Error("no module");
  return renderSketch(result.module);
}

describe("sketch round-trip: render(parse(x)) === x", () => {
  it("has golden files", () => {
    expect(goldenFiles.length).toBeGreaterThanOrEqual(3);
  });

  for (const file of goldenFiles) {
    it(file, async () => {
      const text = readFileSync(new URL(file, goldenDir), "utf8");
      expect(await roundTrip(text, file)).toBe(text);
    });
  }
});

describe("sketch normalization", () => {
  for (const input of normalizeInputs) {
    it(`${input} renders to its canonical form`, async () => {
      const text = readFileSync(new URL(input, normalizeDir), "utf8");
      const expected = readFileSync(
        new URL(input.replace(".input.", ".expected."), normalizeDir),
        "utf8",
      );
      const once = await roundTrip(text, input);
      expect(once).toBe(expected);
      expect(await roundTrip(once, input)).toBe(once);
    });
  }

  it("normalizes CRLF input", async () => {
    const text = readFileSync(new URL("billing.arch.py", goldenDir), "utf8");
    expect(await roundTrip(text.replace(/\n/g, "\r\n"), "crlf.arch.py")).toBe(text);
  });
});

describe("bare types are valid in every position", () => {
  const types = [
    "Promise[Invoice]",
    'U["_zod"]["config"]',
    "A[B][C]",
    'Z[U["a"]["b"]]',
    "Callable[[int], str]",
    "Tuple[int, ...]",
    '"a" | "b"',
    "{ a: number }",
    "T extends string ? A : B",
  ];
  it("renders types that the sketch parser reads back unchanged", async () => {
    for (const t of types) {
      const c = canonicalType(t);
      const sketch = [
        '__module__ = "m"',
        '__paths__ = ["src/**"]',
        "__depends_on__ = []",
        "",
        "class C:",
        `    f: ${renderTypeFor(c)}`,
        `    def m(self, a: ${renderTypeFor(c)}) -> ${renderTypeFor(c)}: ...`,
        "",
        `def g[T: ${renderTypeFor(c)}](a: ${renderTypeFor(c)}) -> ${renderTypeFor(c)}: ...`,
        "",
      ].join("\n");
      const result = await parseSketch(sketch, "m.arch.py");
      expect(result.errors, t).toEqual([]);
      const g = result.module?.symbols.find((s) => s.name === "g");
      expect(g && g.kind === "function" && g.signatures[0]?.returns).toBe(c);
    }
  });
});
