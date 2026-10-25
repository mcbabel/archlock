import { describe, expect, it } from "vitest";
import { mergeModule } from "../../src/core/merge.js";
import type { ArchModule } from "../../src/core/model.js";
import { parseSketch } from "../../src/sketch/parse.js";
import { memberShape, renderSketch, symbolShape } from "../../src/sketch/render.js";

async function parse(text: string): Promise<ArchModule> {
  const r = await parseSketch(text, "m.arch.py");
  expect(r.errors).toEqual([]);
  return r.module as ArchModule;
}

/** Merges `code` (a comment-free sketch as generated from code) into `sketch`. */
async function merge(
  sketch: string,
  code: string,
  opts: { deps: boolean; symbols: boolean; renames?: boolean } = { deps: true, symbols: true },
  externals: string[] = [],
) {
  const shape = opts.renames ? { symbol: symbolShape, member: memberShape } : undefined;
  const result = mergeModule(await parse(sketch), await parse(code), externals, { ...opts, shape });
  return { text: renderSketch(result.module), lost: result.lost, moved: result.moved };
}

const header = (deps = "[]") =>
  `__module__ = "m"\n__paths__ = ["src/m/**"]\n__depends_on__ = ${deps}\n`;

const human = `"""Module docstring."""

# owner: team-billing
${header('["db"]')}__strictness__ = "names"

class Status(Enum):
    # first state
    Draft = ...
    Done = ...  # terminal

class Invoice:
    """An invoice."""
    # invariant: total is the sum of lines
    total: number
    def pay(self, amount: number) -> void:
        # must: idempotent
        ...

def create(a: string) -> Invoice: ...  # factory

# never: call twice
def delete(id: string) -> void: ...

# end
`;

describe("mergeModule (accept)", () => {
  it("keeps every comment when nothing changed", async () => {
    const code = `${header('["db"]')}
class Status(Enum):
    Draft = ...
    Done = ...

class Invoice:
    total: number
    def pay(self, amount: number) -> void: ...

def create(a: string) -> Invoice: ...
def delete(id: string) -> void: ...
`;
    const { text, lost } = await merge(human, code);
    expect(text).toBe(human);
    expect(lost).toEqual([]);
  });

  it("comments survive signature changes, renames of other symbols and reordering", async () => {
    const code = `${header('["db", "events"]')}
class Status(Enum):
    Done = ...
    Draft = ...
    Void = ...

class Invoice:
    lines: 'Line[]'
    total: bigint
    def pay(self, amount: number, at: Date) -> Promise[void]: ...

def delete(id: string, hard: boolean = ...) -> void: ...
def make(a: string) -> Invoice: ...
`;
    const { text, lost } = await merge(human, code);
    expect(text).toBe(`"""Module docstring."""

# owner: team-billing
${header('["db", "events"]')}__strictness__ = "names"

class Status(Enum):
    Done = ...  # terminal
    # first state
    Draft = ...
    Void = ...

class Invoice:
    """An invoice."""
    lines: 'Line[]'
    # invariant: total is the sum of lines
    total: bigint
    def pay(self, amount: number, at: Date) -> Promise[void]:
        # must: idempotent
        ...

# never: call twice
def delete(id: string, hard: boolean = ...) -> void: ...

def make(a: string) -> Invoice: ...

# end
`);
    expect(lost).toEqual([{ module: "m", symbol: "create", lines: ["# factory"] }]);
  });

  it("reports comments of removed members", async () => {
    const code = `${header('["db"]')}
class Status(Enum):
    Done = ...

class Invoice:
    total: number

def create(a: string) -> Invoice: ...
def delete(id: string) -> void: ...
`;
    const { lost } = await merge(human, code);
    expect(lost).toEqual([
      { module: "m", symbol: "Invoice.pay", lines: ["# must: idempotent"] },
      { module: "m", symbol: "Status.Draft", lines: ["# first state"] },
    ]);
  });

  it("keeps comments when a symbol changes its kind", async () => {
    const code = `${header('["db"]')}
class Status(Enum):
    Draft = ...
    Done = ...

class Invoice(Protocol):
    total: number
    def pay(self, amount: number) -> void: ...

def create(a: string) -> Invoice: ...
delete: '(id: string) => void'
`;
    const { text } = await merge(human, code);
    expect(text).toContain("# never: call twice\ndelete: '(id: string) => void'");
    expect(text).toContain('class Invoice(Protocol):\n    """An invoice."""');
  });

  it("--deps-only leaves symbols alone; --symbols-only leaves dependencies alone", async () => {
    const code = `${header('["events"]')}
def other() -> void: ...
`;
    const depsOnly = await merge(human, code, { deps: true, symbols: false });
    expect(depsOnly.text).toBe(human.replace('["db"]', '["events"]'));
    const symbolsOnly = await merge(human, code, { deps: false, symbols: true });
    expect(symbolsOnly.text).toContain('__depends_on__ = ["db"]');
    expect(symbolsOnly.text).toContain("def other() -> void: ...");
    expect(symbolsOnly.text).not.toContain("def create");
  });

  it("updates __external__ only when the sketch checks externals", async () => {
    const withExternal = `${header()}__external__ = ["left-pad"]\n`;
    const out = await merge(withExternal, header(), { deps: true, symbols: true }, ["stripe"]);
    expect(out.text).toContain('__external__ = ["stripe"]');
    const without = await merge(header(), header(), { deps: true, symbols: true }, ["stripe"]);
    expect(without.text).not.toContain("__external__");
  });

  it("does not touch symbols when __strictness__ is deps", async () => {
    const sketch = `${header()}__strictness__ = "deps"\n\ndef planned() -> void: ...\n`;
    const out = await merge(sketch, `${header()}\ndef real() -> void: ...\n`);
    expect(out.text).toBe(sketch);
  });

  it("comments follow a renamed symbol or member whose shape is unchanged", async () => {
    const sketch = `${header()}
# factory for invoices
def create(total: number) -> Invoice: ...

class Invoice:
    """An invoice."""
    total: number
    def send(self, to: string) -> Invoice: ...

class Mailer:
    # sends it once
    def send(self, to: string) -> bool: ...
`;
    const code = `${header()}
def make(total: number) -> Bill: ...

class Bill:
    total: number
    def send(self, to: string) -> Bill: ...

class Mailer:
    def deliver(self, to: string) -> bool: ...
`;
    const { text, lost, moved } = await merge(sketch, code, {
      deps: true,
      symbols: true,
      renames: true,
    });
    expect(lost).toEqual([]);
    expect(moved).toEqual([
      { module: "m", from: "create", to: "make" },
      { module: "m", from: "Invoice", to: "Bill" },
      { module: "m", from: "Mailer.send", to: "Mailer.deliver" },
    ]);
    expect(text).toContain("# factory for invoices\ndef make(total: number) -> Bill: ...");
    expect(text).toContain('class Bill:\n    """An invoice."""');
    expect(text).toContain("    # sends it once\n    def deliver(self, to: string) -> bool: ...");
  });

  it("a rename that is ambiguous or changes the shape loses the comments", async () => {
    const sketch = `${header()}
# first
def a(x: number) -> void: ...
# second
def b(x: number) -> void: ...
# third
def c(x: string) -> void: ...
`;
    const code = `${header()}
def d(x: number) -> void: ...
def e(x: number) -> void: ...
def f(x: number, y: number) -> void: ...
`;
    const { lost, moved } = await merge(sketch, code, { deps: true, symbols: true, renames: true });
    expect(moved).toEqual([]);
    expect(lost.map((l) => l.symbol)).toEqual(["a", "b", "c"]);
  });
});
