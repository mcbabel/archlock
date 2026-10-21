import { afterAll, describe, expect, it } from "vitest";
import {
  archlock,
  checkJson,
  cleanupFixtures,
  copyFixture,
  edit,
  read,
} from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

async function initialized(fixture = "ts-single"): Promise<string> {
  const dir = copyFixture(fixture);
  expect((await archlock(dir, "init", "--yes")).code).toBe(0);
  return dir;
}

describe("archlock accept", () => {
  it("adopts code changes so that check passes again, keeping comments", async () => {
    const dir = await initialized();
    edit(
      dir,
      "archlock/billing.arch.py",
      "def createInvoice(",
      "# invariant: at least one line\ndef createInvoice(",
    );
    edit(dir, "src/billing/invoice.ts", "customer: CustomerId, lines", "customer: string, lines");
    edit(dir, "src/billing/payments.ts", /^/, 'import { connectRaw } from "../db";\n');
    expect((await checkJson(dir)).summary.errors).toBeGreaterThan(0);

    const accept = await archlock(dir, "accept", "--yes");
    expect(accept.code).toBe(0);
    expect(accept.stdout).toContain("Accepted changes in billing");
    const check = await checkJson(dir);
    expect(check.violations.filter((v) => v.severity === "error")).toEqual([]);
    const sketch = read(dir, "archlock/billing.arch.py");
    expect(sketch).toContain(
      "# invariant: at least one line\ndef createInvoice(db: Database, customer: string,",
    );
  });

  it("only touches the named modules", async () => {
    const dir = await initialized();
    edit(dir, "src/billing/invoice.ts", /$/, "\nexport function voidInvoice(): void {}\n");
    edit(dir, "src/events/index.ts", /$/, "\nexport function off(): void {}\n");
    expect((await archlock(dir, "accept", "events", "--yes")).code).toBe(0);
    const remaining = (await checkJson(dir)).violations.map((v) => `${v.module}:${v.symbol}`);
    expect(remaining).toEqual(["billing:voidInvoice"]);
  });

  it("refuses to write without --yes when there is no terminal", async () => {
    const dir = await initialized();
    edit(dir, "src/events/index.ts", /$/, "\nexport function off(): void {}\n");
    const before = read(dir, "archlock/events.arch.py");
    const result = await archlock(dir, "accept");
    expect(result.code).toBe(1);
    expect(result.stdout).toContain("+def off() -> void: ...");
    expect(result.stderr).toContain("archlock accept --yes");
    expect(read(dir, "archlock/events.arch.py")).toBe(before);
  });

  it("reports comments of deleted symbols", async () => {
    const dir = await initialized();
    edit(dir, "archlock/events.arch.py", "def emit(", "# must: never throw\ndef emit(");
    edit(dir, "src/events/index.ts", "export function emit(", "function emit(");
    const result = await archlock(dir, "--json", "accept", "--yes");
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout).lostComments).toEqual([
      { module: "events", symbol: "emit", lines: ["# must: never throw"] },
    ]);
  });

  it("says so when there is nothing to accept", async () => {
    const dir = await initialized();
    const result = await archlock(dir, "accept");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Nothing to accept");
  });

  it("rejects unknown modules and broken sketches", async () => {
    const dir = await initialized();
    const unknown = await archlock(dir, "accept", "nope");
    expect(unknown.code).toBe(2);
    expect(unknown.stderr).toContain('unknown module "nope"');
    edit(dir, "archlock/db.arch.py", "class Database:", "class Database(:");
    const broken = await archlock(dir, "accept", "--yes");
    expect(broken.code).toBe(2);
    expect(broken.stderr).toContain(
      "cannot accept while a sketch is invalid: archlock/db.arch.py:",
    );
  });

  it("regenerates archlock/README.md", async () => {
    const dir = await initialized();
    edit(dir, "archlock/billing.arch.py", /^/, '"""Invoices and payments."""\n\n');
    edit(dir, "src/events/index.ts", /$/, "\nexport function off(): void {}\n");
    await archlock(dir, "accept", "--yes");
    expect(read(dir, "archlock/README.md")).toContain(
      "| [billing](./billing.arch.py) | Invoices and payments. | 5 | db, events |",
    );
  });
});

describe("archlock stats and graph", () => {
  it("prints the compression ratio and a badge", async () => {
    const dir = await initialized();
    const stats = await archlock(dir, "--json", "stats");
    const data = JSON.parse(stats.stdout);
    expect(data).toMatchObject({
      schemaVersion: 1,
      command: "stats",
      modules: 4,
      symbols: 11,
      edges: 4,
    });
    expect(data.badge).toContain("https://img.shields.io/badge/architecture-4%20modules");
    expect((await archlock(dir, "stats")).stdout).toMatch(
      /lines of code → \d+ lines of architecture/,
    );
  });

  it("prints the module graph as Mermaid", async () => {
    const dir = await initialized();
    const graph = await archlock(dir, "graph");
    expect(graph.stdout).toBe(
      "graph LR\n  billing --> db\n  billing --> events\n  shop --> billing\n  shop --> db\n",
    );
  });
});
