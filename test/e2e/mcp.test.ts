import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CLI_PATH } from "../helpers/cli.js";
import { archlock, cleanupFixtures, copyFixture, edit } from "../helpers/fixtures.js";

let client: Client;
let dir: string;

beforeAll(async () => {
  dir = copyFixture("ts-single");
  await archlock(dir, "init", "--yes");
  edit(dir, "src/db/types.ts", /^/, 'import { emit } from "../events";\nemit("x");\n');
  client = new Client({ name: "archlock-test", version: "1.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [CLI_PATH, "mcp"],
      cwd: dir,
      stderr: "pipe",
    }),
  );
});

afterAll(async () => {
  await client?.close();
  cleanupFixtures();
});

function textOf(result: Awaited<ReturnType<Client["callTool"]>>): string {
  return (result.content as { type: string; text: string }[]).map((c) => c.text).join("\n");
}

describe("archlock mcp", () => {
  it("lists the four tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "check",
      "explain_violation",
      "get_architecture",
      "get_module_for_file",
    ]);
  });

  it("get_architecture returns all sketches or one module", async () => {
    const all = textOf(await client.callTool({ name: "get_architecture", arguments: {} }));
    expect(all).toContain("Modules: billing, db, events, shop");
    expect(all).toContain("graph LR");
    const one = textOf(
      await client.callTool({ name: "get_architecture", arguments: { module: "db" } }),
    );
    expect(one.startsWith("# archlock/db.arch.py")).toBe(true);
    expect(one).toContain("class Database:");
    const bad = await client.callTool({ name: "get_architecture", arguments: { module: "nope" } });
    expect(bad.isError).toBe(true);
  });

  it("check reports the current violations", async () => {
    const out = textOf(await client.callTool({ name: "check", arguments: {} }));
    expect(out).toContain("undeclared_dependency  new dependency: events");
    const json = JSON.parse(out.slice(out.indexOf("JSON:\n") + 6));
    expect(json.ok).toBe(false);
    expect(json.violations[0]).toMatchObject({ rule: "undeclared_dependency", module: "db" });
  });

  it("explain_violation explains the rule and the current instance", async () => {
    const out = textOf(
      await client.callTool({
        name: "explain_violation",
        arguments: { rule: "undeclared_dependency", module: "db" },
      }),
    );
    expect(out).toContain("code imports a module that is not in __depends_on__");
    expect(out).toContain("Current: db: new dependency: events (not in __depends_on__)");
    expect(out).toContain("code: src/db/types.ts:1");
  });

  it("get_module_for_file names the module and its allowed dependencies", async () => {
    const out = textOf(
      await client.callTool({
        name: "get_module_for_file",
        arguments: { path: "src/billing/invoice.ts" },
      }),
    );
    expect(out).toContain('belongs to module "billing" (sketch: archlock/billing.arch.py)');
    expect(out).toContain("May import modules: db, events");
    const none = textOf(
      await client.callTool({ name: "get_module_for_file", arguments: { path: "scripts/x.ts" } }),
    );
    expect(none).toContain("belongs to no module");
  });

  it("rejects invalid arguments with a JSON-RPC error that names the argument", async () => {
    await expect(
      client.callTool({ name: "explain_violation", arguments: { rule: "no_such_rule" } }),
    ).rejects.toThrow(/"no_such_rule" is not a valid rule; expected one of undeclared_dependency/);
    await expect(client.callTool({ name: "get_module_for_file", arguments: {} })).rejects.toThrow(
      /the argument "path" is required/,
    );
  });

  it("answers ping and names the server", async () => {
    await expect(client.ping()).resolves.toBeDefined();
    expect(client.getServerVersion()?.name).toBe("archlock");
  });
});
