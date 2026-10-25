import { describe, expect, it } from "vitest";
import { type ArchSymbol, type ClassLikeSymbol, positionalFirst } from "../../src/core/model.js";
import { diffSymbol } from "../../src/engine/compare.js";
import { parseSketch } from "../../src/sketch/parse.js";

/** The first symbol of a sketch made of these lines. */
async function symbol(body: string): Promise<ArchSymbol> {
  const text = `__module__ = "m"\n__paths__ = ["m/**"]\n__depends_on__ = []\n\n${body}\n`;
  const result = await parseSketch(text, "m.arch.py");
  expect(result.errors).toEqual([]);
  return result.module?.symbols[0] as ArchSymbol;
}

describe("comparing the newer notation", () => {
  it("an open enum value (`= ...`) matches any value; a given one must match", async () => {
    const code = await symbol("class S(Enum):\n    A = 1\n    B = 2");
    expect(diffSymbol(await symbol("class S(Enum):\n    A = ...\n    B = 2"), code)).toEqual([]);
    expect(diffSymbol(await symbol("class S(Enum):\n    A = 3\n    B = 2"), code)).toEqual([
      "~ sketch: A = 3 · code: A = 1",
    ]);
    expect(diffSymbol(await symbol("class S(Enum):\n    A = ...\n    C = ..."), code)).toEqual([
      "+ B = 2 (in code, not in sketch)",
      "- C (in sketch, not in code)",
    ]);
  });

  it("enum payloads are compared", async () => {
    const code = await symbol("class S(Enum):\n    Circle: '{ r: f64 }'");
    expect(diffSymbol(await symbol("class S(Enum):\n    Circle: '{ r: f32 }'"), code)).toEqual([
      "~ sketch: Circle: '{ r: f32 }' · code: Circle: '{ r: f64 }'",
    ]);
  });

  it("the constructor order of a dataclass is compared, other fields are not", async () => {
    const code = (await symbol(
      "@dataclass\nclass P:\n    x: float\n    y: float\n    label: str\n    name: str",
    )) as ClassLikeSymbol;
    positionalFirst(code, ["x", "y"]);
    const sketch = (body: string) => symbol(`@dataclass\nclass P:\n${body}`);
    expect(
      diffSymbol(await sketch("    x: float\n    y: float\n    name: str\n    label: str"), code),
    ).toEqual([]);
    expect(
      diffSymbol(await sketch("    y: float\n    x: float\n    label: str\n    name: str"), code),
    ).toEqual(["field order: sketch (y, x) · code (x, y)"]);
  });

  it("receivers and signature decorators are part of the signature", async () => {
    const code = await symbol(
      "class B:\n    def push(self: '&mut Self', b: u8): ...\n    @throws(IOException)\n    def read(self) -> str: ...",
    );
    const diff = diffSymbol(
      await symbol("class B:\n    def push(self, b: u8): ...\n    def read(self) -> str: ..."),
      code,
    );
    expect(diff.join("\n")).toContain("self: '&mut Self'");
    expect(diff.join("\n")).toContain("@throws(IOException)");
  });
});
