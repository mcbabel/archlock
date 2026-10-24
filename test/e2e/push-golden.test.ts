import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { archlock, cleanupFixtures, copyFixture, edit, write } from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

const GOLDEN = fileURLToPath(new URL("../golden/push/", import.meta.url));

/** Compares with a golden file; set UPDATE_GOLDEN=1 to rewrite it. */
function golden(name: string, actual: string): void {
  const file = `${GOLDEN}${name}`;
  if (process.env.UPDATE_GOLDEN === "1" || !existsSync(file)) writeFileSync(file, actual);
  expect(actual).toBe(readFileSync(file, "utf8"));
}

async function prompt(dir: string): Promise<string> {
  const r = await archlock(dir, "push", "--print-prompt", "--check-command", "archlock check");
  expect(r.code).toBe(0);
  return r.stdout;
}

describe("push prompt golden files", () => {
  it("TypeScript: planned function, signature change, invariants, undeclared dependency, new public symbol", async () => {
    const dir = copyFixture("ts-single");
    await archlock(dir, "init", "--yes");
    edit(
      dir,
      "archlock/billing.arch.py",
      "__module__",
      '"""Billing: invoices and payments."""\n\n__module__',
    );
    edit(
      dir,
      "archlock/billing.arch.py",
      "async def markPaid(id: string, payment: '{ ref: string }') -> Promise[Invoice]: ...",
      "async def markPaid(id: string, payment: '{ ref: string }', at: Date) -> Promise[Invoice]:\n    # must: emit invoice.paid exactly once\n    ...\n\ndef refund(id: string) -> void: ...",
    );
    edit(
      dir,
      "archlock/billing.arch.py",
      "class InvoiceStatus(Enum):",
      "# invariant: status only moves forward\nclass InvoiceStatus(Enum):",
    );
    edit(dir, "src/db/types.ts", /^/, 'import { emit } from "../events";\nemit("row");\n');
    edit(dir, "src/events/index.ts", /$/, "\nexport function debugDump(): void {}\n");
    golden("ts-single.prompt.md", await prompt(dir));
  });

  it("Vue: a planned prop and event of a component", async () => {
    const dir = copyFixture("vue-app");
    await archlock(dir, "init", "--yes");
    edit(
      dir,
      "archlock/components.arch.py",
      "    onClose: Opt['() => void']",
      "    onArchive: Opt['(id: string) => void']\n    onClose: Opt['() => void']\n    rounded: Opt[boolean]",
    );
    golden("vue-app.prompt.md", await prompt(dir));
  });

  it("Go: a planned method and a changed function", async () => {
    const dir = copyFixture("go-service");
    await archlock(dir, "init", "--yes");
    edit(
      dir,
      "archlock/internal.store.arch.py",
      "    def Events(self) -> '<-chan model.ID': ...",
      "    def Close(self) -> error: ...\n    def Events(self) -> '<-chan model.ID': ...",
    );
    edit(
      dir,
      "archlock/internal.store.arch.py",
      "def DefaultPath() -> string: ...",
      "def DefaultPath(name: string) -> string: ...",
    );
    golden("go-service.prompt.md", await prompt(dir));
  });

  it("Rust: a planned enum variant and method", async () => {
    const dir = copyFixture("rust-crate");
    await archlock(dir, "init", "--yes");
    edit(dir, "archlock/lexer.arch.py", "    Newline = ...", "    Newline = ...\n    Tab = '(u8)'");
    edit(
      dir,
      "archlock/lexer.arch.py",
      'class Lexer["\'a"](Iterator):',
      'class Lexer["\'a"](Iterator):\n    def position(self) -> usize: ...',
    );
    golden("rust-crate.prompt.md", await prompt(dir));
  });

  it("Java: a planned method and enum constant", async () => {
    const dir = copyFixture("java-app");
    await archlock(dir, "init", "--yes");
    edit(
      dir,
      "archlock/order.arch.py",
      "    SHIPPED = ...",
      "    SHIPPED = ...\n    CANCELLED = ...",
    );
    edit(
      dir,
      "archlock/order.arch.py",
      "    def place(self, order: Order) -> Invoice: ...",
      "    def cancel(self, order: Order, reason: String) -> boolean: ...\n    def place(self, order: Order) -> Invoice: ...",
    );
    golden("java-app.prompt.md", await prompt(dir));
  });

  it("Python: new module planned in a sketch", async () => {
    const dir = copyFixture("py-src");
    await archlock(dir, "init", "--yes");
    write(
      dir,
      "archlock/notifications.arch.py",
      '"""Notifications: tell customers about their invoices."""\n\n__module__ = "notifications"\n__paths__ = ["src/shopkit/notifications/**"]\n__entry__ = "src/shopkit/notifications/__init__.py"\n__depends_on__ = ["events"]\n\n# never: send more than one email per invoice event\ndef notify(customer: str, message: str) -> None: ...\n',
    );
    golden("py-new-module.prompt.md", await prompt(dir));
  });
});
