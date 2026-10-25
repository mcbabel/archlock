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

describe("typed mode", () => {
  it("init --typed fills in the types the code leaves out and stores the choice", async () => {
    const dir = copyFixture("ts-typed");
    expect((await archlock(dir, "init", "--yes", "--typed")).code).toBe(0);
    expect(JSON.parse(read(dir, "archlock.config.json")).typed).toBe(true);
    expect(read(dir, "archlock/shop.arch.py")).toContain(`class Cart:
    double: Readonly[number]
    size: number
    def open(self, force: boolean = ...) -> '"open" | null': ...

def rows() -> 'Row[]': ...
def sum(xs: 'number[]', start: number = ...) -> number: ...

broken: '<inferred>'
LIMIT: '10'
names: 'string[]'`);
    expect((await checkJson(dir)).violations).toEqual([]);
    // Deterministic: a second run (which keeps the setting) writes the same bytes.
    const first = read(dir, "archlock/shop.arch.py");
    expect((await archlock(dir, "init", "--yes", "--force")).code).toBe(0);
    expect(read(dir, "archlock/shop.arch.py")).toBe(first);
    expect(JSON.parse(read(dir, "archlock.config.json")).typed).toBe(true);
  });

  it("a changed inferred type is a signature change", async () => {
    const dir = copyFixture("ts-typed");
    await archlock(dir, "init", "--yes", "--typed");
    edit(dir, "src/shop/index.ts", 'return force ? "open" : null;', "return force;");
    const check = await checkJson(dir);
    expect(check.violations.map((v) => `${v.rule}:${v.symbol}`)).toEqual([
      "signature_changed:Cart",
    ]);
  });

  it("without typed mode the same code is '<inferred>'", async () => {
    const dir = copyFixture("ts-typed");
    await archlock(dir, "init", "--yes");
    expect(read(dir, "archlock.config.json")).not.toContain("typed");
    expect(read(dir, "archlock/shop.arch.py")).toContain("def rows() -> '<inferred>': ...");
  });
});
