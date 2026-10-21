import { describe, expect, it } from "vitest";
import { moduleFromCode } from "../../src/engine/fromcode.js";
import { buildProject } from "../../src/extract/project.js";
import type { Resolver } from "../../src/extract/resolution.js";
import { extractTypeScriptFile } from "../../src/extract/typescript/file.js";
import { renderSketch } from "../../src/sketch/render.js";

const noResolver: Resolver = { resolve: () => ({ kind: "unresolved" }) };

/** The symbol part of the sketch archlock writes for a single-file module. */
function sketchOf(code: string, file = "src/m/index.ts"): string {
  const facts = extractTypeScriptFile(file, code);
  const project = buildProject(
    [facts],
    [{ name: "m", paths: ["src/m/**"], entry: file }],
    () => noResolver,
  );
  const text = renderSketch(moduleFromCode(project.modules.get("m") as never));
  return text.split("\n").slice(4).join("\n").trim();
}

describe("TypeScript → sketch mapping", () => {
  it("functions: optional, rest, defaults, async, generics", () => {
    expect(
      sketchOf(
        "export async function f<T extends object>(a: T, b?: string, c = 1, ...rest: number[]): Promise<T> { return a; }",
      ),
    ).toBe(
      "async def f['T extends object'](a: T, b: string = ..., c=..., *rest: 'number[]') -> Promise[T]: ...",
    );
  });

  it("missing return annotation is <inferred>; untyped params stay bare", () => {
    expect(sketchOf("export function g(x) { return x; }")).toBe("def g(x) -> '<inferred>': ...");
  });

  it("arrow functions and function expressions are functions", () => {
    expect(sketchOf("export const h = (n: number): string => String(n);")).toBe(
      "def h(n: number) -> string: ...",
    );
  });

  it("overloads keep only the overload signatures", () => {
    expect(
      sketchOf(
        "export function p(a: string): number;\nexport function p(a: number): string;\nexport function p(a: any): any { return a; }",
      ),
    ).toBe(
      "@overload\ndef p(a: string) -> number: ...\n@overload\ndef p(a: number) -> string: ...",
    );
  });

  it("classes: fields, flags, accessors, constructor properties; private and protected are hidden", () => {
    const out = sketchOf(`
export class C extends Base<number> implements I {
  static count: number;
  readonly id: string;
  label?: string;
  private secret = 1;
  protected guarded = 2;
  #hash = 3;
  constructor(public readonly owner: string, private hidden: number) { super(); }
  get size(): number { return 1; }
  static create(): C { return new C("x", 1); }
  async load(): Promise<void> {}
}`);
    expect(out).toBe(
      [
        "class C(Base[number], I):",
        "    count: ClassVar[number]",
        "    id: Readonly[string]",
        "    label: Opt[string]",
        "    owner: Readonly[string]",
        "    size: Readonly[number]",
        "    def __init__(self, owner: string, hidden: number): ...",
        "    @staticmethod",
        "    def create() -> C: ...",
        "    async def load(self) -> Promise[void]: ...",
      ].join("\n"),
    );
  });

  it("interfaces: merged declarations, call/construct/index signatures, optional methods", () => {
    const out = sketchOf(`
export interface A extends B, C<string> { x: number; m?(): void; (n: number): string; new (s: string): A; [k: string]: unknown; }
export interface A { y: string }`);
    expect(out).toBe(
      [
        "class A(B, C[string], Protocol):",
        "    x: number",
        "    y: string",
        "    def __call__(self, n: number) -> string: ...",
        "    def __getitem__(self, k: string) -> unknown: ...",
        "    def __new__(self, s: string) -> A: ...",
        "    @optional",
        "    def m(self) -> void: ...",
      ].join("\n"),
    );
  });

  it("type aliases, enums, constants", () => {
    expect(
      sketchOf(`
export type Pair<A, B = A> = [A, B];
export type Status = 'a' | 'b';
export enum E { One = 1, "two-words" }
export const N: number = 1;
export let v = 2;`),
    ).toBe(
      [
        "class E(Enum):",
        "    One = ...",
        "    two_words = ...",
        "",
        "Pair: TypeAlias[A, 'B = A'] = '[A, B]'",
        'Status: TypeAlias = \'"a" | "b"\'',
        "",
        "N: number",
        "v: '<inferred>'",
      ].join("\n"),
    );
  });

  it("default exports are named `default`", () => {
    expect(sketchOf("export default function (x: number): number { return x; }")).toBe(
      "def default(x: number) -> number: ...",
    );
    expect(sketchOf("class K {}\nexport default K;")).toBe("class default: ...");
    expect(sketchOf("export default { a: 1 };")).toBe("default: '<inferred>'");
  });

  it("non-exported declarations are not public", () => {
    expect(sketchOf("function hidden(): void {}\nexport const shown = 1;")).toBe(
      "shown: '<inferred>'",
    );
  });

  it("local export lists and aliases", () => {
    expect(sketchOf("function a(): void {}\nexport { a, a as b };")).toBe(
      "def a() -> void: ...\ndef b() -> void: ...",
    );
  });

  it("records imports with names, type-only flag and dynamic imports", () => {
    const facts = extractTypeScriptFile(
      "src/x.ts",
      'import d, { a, b as c } from "./m";\nimport type { T } from "./t";\nimport * as ns from "pkg";\nimport "./side";\nexport * from "./star";\nconst z = () => import("./lazy");\nconst r = require("./cjs");',
    );
    expect(facts.imports.map((i) => [i.specifier, i.names.join(","), i.typeOnly])).toEqual([
      ["./m", "default,a,b", false],
      ["./t", "T", true],
      ["pkg", "*", false],
      ["./side", "", false],
      ["./star", "", false],
      ["./lazy", "*", false],
      ["./cjs", "*", false],
    ]);
    expect(facts.stars).toEqual(["./star"]);
  });
});
