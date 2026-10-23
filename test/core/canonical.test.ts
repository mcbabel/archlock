import { describe, expect, it } from "vitest";
import {
  canonicalType,
  decodePythonString,
  isBareType,
  pythonString,
  renderType,
  toSketchName,
} from "../../src/core/canonical.js";

describe("canonicalType", () => {
  const cases: [string, string][] = [
    ["Promise<Invoice>", "Promise[Invoice]"],
    ["Promise< Array<Line> >", "Promise[Array[Line]]"],
    ["Map<string,number>", "Map[string, number]"],
    ["string|undefined", "string | undefined"],
    ["'draft' | 'sent'", '"draft" | "sent"'],
    ["\n  | 'a'\n  | 'b'", '"a" | "b"'],
    ["{a:number;b?:string;}", "{ a: number; b?: string }"],
    ["{}", "{}"],
    ["{\n  a?: A\n  b: B\n}", "{ a?: A; b: B }"],
    [
      "{\n  a:\n    | 'x'\n    | 'y'\n  b: string[]\n  [k: string]: unknown\n}",
      '{ a: "x" | "y"; b: string[]; [k: string]: unknown }',
    ],
    ["{ k: T[K]\n extends string ? A : B }", "{ k: T[K] extends string ? A : B }"],
    ["Record<\n  string,\n  number\n>", "Record[string, number]"],
    ["string[]", "string[]"],
    ["(a: number, b?: string) => void", "(a: number, b?: string) => void"],
    ["new (...args: any[]) => T", "new (...args: any[]) => T"],
    ["T extends string ? A : B", "T extends string ? A : B"],
    ["{ [K in keyof T]?: T[K] }", "{ [K in keyof T]?: T[K] }"],
    ["{ -readonly [K in keyof T]-?: T[K] }", "{ -readonly [K in keyof T]-?: T[K] }"],
    ["readonly string[]", "readonly string[]"],
    ["keyof typeof config", "keyof typeof config"],
    ['import("./x").Foo', 'import("./x").Foo'],
    ["z.infer<typeof schema>", "z.infer[typeof schema]"],
    // Go: gofmt spacing.
    ["map[string] []*User", "map[string][]*User"],
    ["[ 4 ]byte", "[4]byte"],
    ["chan<- int", "chan<- int"],
    ["<- chan error", "<-chan error"],
    ["func (a int, b * http.Request)(bool,error)", "func(a int, b *http.Request) (bool, error)"],
    ["struct {\n  A int\n  B string\n}", "struct{ A int; B string }"],
    ["interface { Close() error }", "interface{ Close() error }"],
    ["~int | ~ float64", "~int | ~float64"],
    // Rust: references, lifetimes, bounds, paths.
    ["&'a mut [u8]", "&'a mut [u8]"],
    ["& str", "str"],
    ["Box<dyn Error+Send + 'static>", "Box[dyn Error + Send + 'static]"],
    ["Cow<'a, str>", "Cow['a, str]"],
    ["std :: io :: Result<()>", "std::io::Result[()]"],
    ["T: ?Sized + Clone", "T: ?Sized + Clone"],
    ["where <T as Iterator>::Item: Send", "where [T as Iterator]::Item: Send"],
    ["macro_rules !", "macro_rules!"],
    ["a?.new<T>", "a?.new[T]"],
    ["[string, number, ...rest: T[]]", "[string, number, ...rest: T[]]"],
    ["(A | B)[]", "(A | B)[]"],
    ["{ a: number }[]", "{ a: number }[]"],
    // biome-ignore lint/suspicious/noTemplateCurlyInString: a TS template literal type
    ["`prefix-${string}`", "`prefix-${string}`"],
    ["Callable[[int, str], None]", "Callable[[int, str], None]"],
    ["Callable[..., Any]", "Callable[..., Any]"],
    ["A /* comment */ | B // trailing", "A | B"],
    ["-1 | 1", "-1 | 1"],
    ["asserts value is string", "asserts value is string"],
    ["<inferred>", "<inferred>"],
    ["<complex>", "<complex>"],
  ];
  for (const [input, expected] of cases) {
    it(`${JSON.stringify(input)} → ${expected}`, () => {
      expect(canonicalType(input)).toBe(expected);
      expect(canonicalType(expected)).toBe(expected);
    });
  }
});

describe("isBareType / renderType", () => {
  const bare = [
    "Promise[Invoice]",
    "string | null",
    "Array[Line]",
    "dict[str, int]",
    "Callable[[int], str]",
    'Literal["a", "b"]',
    "Tuple[int, ...]",
    "a.b.C[D]",
    "None",
  ];
  const quoted = [
    '"draft" | "sent"',
    "{ a: number }",
    "string[]",
    "keyof T",
    "(a: number) => void",
    "user$",
    'U["_zod"]["config"]',
    "A[B][C]",
    'Z[U["a"]["b"]]',
    "lambda",
    "<inferred>",
    "",
  ];
  for (const t of bare) it(`bare: ${t}`, () => expect(isBareType(t)).toBe(true));
  for (const t of quoted) it(`quoted: ${t}`, () => expect(isBareType(t)).toBe(false));

  it("quotes with single quotes, falling back to double quotes", () => {
    expect(renderType('"draft" | "sent"')).toBe(`'"draft" | "sent"'`);
    expect(renderType("`it's`")).toBe(`"\`it's\`"`);
    expect(pythonString(`a'b"c`)).toBe(`'a\\'b"c'`);
  });

  it("decodes what it encodes", () => {
    for (const s of [`a'b"c`, "back\\slash", "tab\tnew\nline", '"x"']) {
      expect(decodePythonString(pythonString(s))).toBe(s);
    }
  });
});

describe("toSketchName", () => {
  it("keeps valid identifiers", () => expect(toSketchName("createInvoice")).toBe("createInvoice"));
  it("suffixes Python keywords", () => expect(toSketchName("from")).toBe("from_"));
  it("replaces invalid characters", () => {
    expect(toSketchName("user$")).toBe("user_");
    expect(toSketchName("$store")).toBe("_store");
  });
});
