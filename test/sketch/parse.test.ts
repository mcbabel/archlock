import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ClassLikeSymbol, FunctionSymbol } from "../../src/core/model.js";
import { parseSketch } from "../../src/sketch/parse.js";

const billing = readFileSync(new URL("../golden/billing.arch.py", import.meta.url), "utf8");
const sink = readFileSync(new URL("../golden/kitchen-sink.arch.py", import.meta.url), "utf8");

async function parseOk(text: string) {
  const result = await parseSketch(text, "x.arch.py");
  expect(result.errors).toEqual([]);
  if (!result.module) throw new Error("no module");
  return result.module;
}

describe("parseSketch: model", () => {
  it("reads the header", async () => {
    const m = await parseOk(billing);
    expect(m.name).toBe("billing");
    expect(m.paths).toEqual(["src/billing/**"]);
    expect(m.entry).toBe("src/billing/index.ts");
    expect(m.dependsOn).toEqual(["db", "events"]);
    expect(m.external).toEqual(["stripe"]);
    expect(m.strictness).toBe("signatures");
    expect(m.soft.header.__entry__?.trailing).toBe("# optional");
  });

  it("classifies symbols by kind", async () => {
    const m = await parseOk(billing);
    const kinds = Object.fromEntries(m.symbols.map((s) => [s.name, s.kind]));
    expect(kinds).toEqual({
      InvoiceStatus: "enum",
      CustomerId: "type",
      PaymentGateway: "interface",
      Invoice: "class",
      create_invoice: "function",
      mark_paid: "function",
    });
  });

  it("attaches invariants and body comments to their symbols", async () => {
    const m = await parseOk(billing);
    const invoice = m.symbols.find((s) => s.name === "Invoice") as ClassLikeSymbol;
    const total = invoice.members.find((x) => x.name === "total");
    expect(total?.soft.leading).toEqual([
      "# invariant: total equals the sum of line amounts",
      "# invariant: status only moves forward",
    ]);
    const markPaid = m.symbols.find((s) => s.name === "mark_paid") as FunctionSymbol;
    expect(markPaid.soft.body).toEqual(["# must: emits events.InvoicePaid exactly once"]);
    expect(markPaid.signatures[0]?.async).toBe(true);
    const gateway = m.symbols.find((s) => s.name === "PaymentGateway");
    expect(gateway?.soft.trailing).toBe("# TS interface");
  });

  it("reads field flags, quoted names, overloads and parameters", async () => {
    const m = await parseOk(sink);
    const cache = m.symbols.find((s) => s.name === "Cache") as ClassLikeSymbol;
    const options = cache.members.find((x) => x.name === "options");
    expect(options).toMatchObject({
      kind: "field",
      readonly: true,
      optional: true,
      static: false,
      type: "{ ttl: number; max?: number }",
    });
    expect(cache.members.find((x) => x.name === "wrapped")).toMatchObject({
      readonly: false,
      type: "Readonly[Foo]",
    });
    const get = cache.members.find((x) => x.name === "get");
    expect(get?.kind === "method" && get.signatures.length).toBe(2);
    expect(cache.soft.body).toEqual(["# invariant: size never exceeds options.max"]);
    const repo = m.symbols.find((s) => s.name === "Repository") as ClassLikeSymbol;
    expect(repo.kind).toBe("interface");
    expect(repo.typeParams).toEqual(["T: Entity"]);
    expect(repo.members.map((x) => x.name)).toContain("content-type");
    const fetchAll = m.symbols.find((s) => s.name === "fetch_all") as FunctionSymbol;
    expect(fetchAll.signatures[0]?.params.map((p) => p.kind)).toEqual([
      "normal",
      "star",
      "normal",
      "kwrest",
    ]);
    const result = m.symbols.find((s) => s.name === "Result");
    expect(result).toMatchObject({
      typeParams: ["T", "E extends Error = Error"],
      type: "Ok[T] | Err[E]",
    });
    expect(m.reexports).toHaveLength(2);
    expect(m.reexports[1]?.names).toHaveLength(8);
    expect(m.soft.fileLeading).toEqual(["# This sketch exercises every construct of the format."]);
    expect(m.soft.fileTrailing).toEqual(["# end of file"]);
  });

  it("treats a quoted and a bare spelling of a type as equal", async () => {
    const a = await parseOk(`__module__ = "a"\n__paths__ = []\nX: 'Promise<Array<Line>>'\n`);
    const b = await parseOk(`__module__ = "a"\n__paths__ = []\nX: Promise[Array[Line]]\n`);
    expect(a.symbols[0]).toMatchObject({ type: "Promise[Array[Line]]" });
    expect(b.symbols[0]).toMatchObject({ type: "Promise[Array[Line]]" });
  });
});

describe("parseSketch: errors carry line and column", () => {
  const header = `__module__ = "m"\n__paths__ = ["src/**"]\n`;
  const cases: [string, string, number, number, string][] = [
    ["syntax error", `${header}def broken(:\n`, 3, 12, "invalid Python syntax"],
    ["missing __module__", `__paths__ = []\n`, 1, 1, "missing `__module__"],
    ["missing __paths__", `__module__ = "m"\n`, 1, 1, "missing `__paths__"],
    ["unknown header", `${header}__owner__ = "x"\n`, 3, 1, "unknown header field `__owner__`"],
    ["paths not a list", `__module__ = "m"\n__paths__ = "src"\n`, 2, 13, "must be a list"],
    [
      "bad strictness",
      `${header}__strictness__ = "loose"\n`,
      3,
      18,
      "`__strictness__` must be one of",
    ],
    ["constant with value", `${header}X: int = 3\n`, 3, 10, "must not have a value"],
    ["untyped assignment", `${header}X = 3\n`, 3, 1, "needs a type"],
    ["real function body", `${header}def f() -> int:\n    return 1\n`, 4, 5, "only `...`"],
    [
      "method without self",
      `${header}class A:\n    def m(x) -> int: ...\n`,
      4,
      11,
      "must take `self`",
    ],
    ["import statement", `${header}import os\n`, 3, 1, "unsupported statement"],
    [
      "unknown method decorator",
      `${header}class A:\n    @cached\n    def m(self) -> int: ...\n`,
      4,
      6,
      "unsupported decorator `@cached`",
    ],
    [
      "duplicate function",
      `${header}def f() -> int: ...\ndef f() -> str: ...\n`,
      4,
      1,
      "duplicate function `f`",
    ],
    ["duplicate field", `${header}class A:\n    x: int\n    x: str\n`, 5, 5, "duplicate field `x`"],
  ];
  for (const [name, text, line, column, message] of cases) {
    it(name, async () => {
      const result = await parseSketch(text, "m.arch.py");
      expect(result.module).toBeNull();
      expect(result.errors[0]).toMatchObject({ file: "m.arch.py", line, column });
      expect(result.errors[0]?.message).toContain(message);
    });
  }
});
