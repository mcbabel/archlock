/**
 * `archlock mcp`: an MCP server over stdio so agents can read the architecture and check
 * their work without shelling out. Every call reads the current files (with the cache).
 * Nothing here writes to the repository.
 *
 * The protocol part is small: JSON-RPC 2.0 messages, one per line, with `initialize`, `ping`,
 * `tools/list` and `tools/call`. It is implemented here instead of using the MCP SDK, whose
 * HTTP transports pull in dependencies archlock does not need.
 */

import { createInterface } from "node:readline";
import { createColors } from "picocolors";
import { ConfigError } from "../config/config.js";
import { RULE_DEFAULTS, RULE_DESCRIPTIONS, RULE_NAMES, type RuleName } from "../core/rules.js";
import { VERSION } from "../core/version.js";
import {
  checkWorkspace,
  NotInitializedError,
  openWorkspace,
  specsFromSketches,
} from "../engine/workspace.js";
import { Ownership } from "../extract/index.js";
import { mermaidGraph } from "../report/graph.js";
import { renderHumanReport, summarize } from "../report/human.js";

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

const plain = createColors(false);

function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}

function failure(e: unknown): ToolResult {
  const message =
    e instanceof NotInitializedError || e instanceof ConfigError || e instanceof Error
      ? e.message
      : String(e);
  return { content: [{ type: "text", text: `archlock: ${message}` }], isError: true };
}

/** What each violation means and how to resolve it, for agents. */
const FIXES: Record<RuleName, string> = {
  undeclared_dependency:
    "Remove the import (use a module that is allowed in __depends_on__), or, if a human decided the dependency is intended, they run `archlock accept <module>`.",
  unused_dependency:
    "Informational. The dependency can be removed from __depends_on__ by a human (or by `archlock accept`).",
  undeclared_external: "Stop importing the package, or a human adds it to __external__.",
  public_symbol_added:
    "Make the symbol internal (stop exporting it), or propose adding it to the sketch. Do not run `archlock accept` yourself: changing the architecture is a human decision.",
  planned_not_implemented:
    "Implement the symbol exactly as the sketch declares it and export it from the module's entry.",
  signature_changed:
    "Change the code to match the sketch's signature (and update callers). If the new signature is intended, ask a human to accept it.",
  kind_changed:
    "Change the code back to the kind declared in the sketch, or ask a human to accept the change.",
  deep_import:
    "Import the symbol through the other module's entry (its public API) instead of a deep path.",
  unassigned_file:
    "Move the file into a module, or a human adds a matching glob to a sketch's __paths__.",
  dependency_cycle:
    "Move the shared code into a separate module so the modules no longer import each other in a cycle.",
  sketch_invalid:
    "The sketch cannot be parsed. Fix the syntax at the reported line (see docs/FORMAT.md).",
};

/** The JSON Schema subset the tools use: an object of optional or required strings. */
interface InputSchema {
  type: "object";
  properties: Record<string, { type: "string"; description?: string; enum?: string[] }>;
  required?: string[];
}

interface Tool {
  name: string;
  title: string;
  description: string;
  inputSchema: InputSchema;
  run(args: Record<string, string | undefined>): Promise<ToolResult>;
}

/** Thrown for a request whose parameters do not fit; becomes a JSON-RPC error. */
class InvalidParams extends Error {}

/** The arguments of a tool call, checked against its schema. */
function argumentsFor(tool: Tool, raw: unknown): Record<string, string | undefined> {
  if (raw !== undefined && (typeof raw !== "object" || raw === null || Array.isArray(raw)))
    throw new InvalidParams(`${tool.name}: arguments must be an object`);
  const args = (raw ?? {}) as Record<string, unknown>;
  const out: Record<string, string | undefined> = {};
  for (const [name, prop] of Object.entries(tool.inputSchema.properties)) {
    const value = args[name];
    if (value === undefined || value === null) {
      if (tool.inputSchema.required?.includes(name))
        throw new InvalidParams(`${tool.name}: the argument "${name}" is required`);
      continue;
    }
    if (typeof value !== "string")
      throw new InvalidParams(`${tool.name}: the argument "${name}" must be a string`);
    if (prop.enum && !prop.enum.includes(value))
      throw new InvalidParams(
        `${tool.name}: "${value}" is not a valid ${name}; expected one of ${prop.enum.join(", ")}`,
      );
    out[name] = value;
  }
  return out;
}

export function createTools(cwd: string, configPath?: string): Tool[] {
  const open = () => openWorkspace(cwd, { configPath });
  return [
    {
      name: "get_architecture",
      title: "Get architecture",
      description:
        "Returns the architecture sketches (archlock/*.arch.py): modules, their files, allowed dependencies, public API and invariants. Read this before changing code; stay within it.",
      inputSchema: {
        type: "object",
        properties: {
          module: { type: "string", description: "Only this module (default: all modules)" },
        },
      },
      async run({ module }) {
        try {
          const ws = await open();
          const sketches = ws.sketches.sketches;
          if (module !== undefined) {
            const s = sketches.find((x) => x.module.name === module);
            if (!s) {
              return failure(
                `unknown module "${module}"; modules: ${sketches.map((x) => x.module.name).join(", ")}`,
              );
            }
            return text(`# ${s.file}\n\n${s.text}`);
          }
          const parts = [
            `Modules: ${sketches.map((s) => s.module.name).join(", ")}`,
            "",
            "Module graph (Mermaid):",
            mermaidGraph(sketches.map((s) => s.module)),
            ...sketches.map((s) => `# ${s.file}\n\n${s.text}`),
          ];
          return text(parts.join("\n"));
        } catch (e) {
          return failure(e);
        }
      },
    },
    {
      name: "check",
      title: "Check architecture",
      description:
        "Runs `archlock check`: compares the code with the sketches and lists every difference (undeclared dependencies, signature changes, planned symbols, ...). Run it after changing code.",
      inputSchema: {
        type: "object",
        properties: {
          module: { type: "string", description: "Only report violations of this module" },
        },
      },
      async run({ module }) {
        try {
          const result = await checkWorkspace(await open());
          const violations =
            module === undefined
              ? result.violations
              : result.violations.filter((v) => v.module === module);
          const s = summarize(violations);
          const report = renderHumanReport(violations, plain, {
            quiet: false,
            modules: result.sketches.length,
            symbols: result.sketches.reduce((n, x) => n + x.module.symbols.length, 0),
          });
          const json = JSON.stringify({ ok: s.errors === 0, summary: s, violations }, null, 2);
          return text(`${report}\nJSON:\n${json}`);
        } catch (e) {
          return failure(e);
        }
      },
    },
    {
      name: "explain_violation",
      title: "Explain a violation",
      description:
        "Explains a violation type (and, with module/symbol, the current instance of it) and how to resolve it.",
      inputSchema: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            enum: [...RULE_NAMES],
            description: "The violation type, e.g. signature_changed",
          },
          module: { type: "string" },
          symbol: { type: "string" },
        },
        required: ["rule"],
      },
      async run({ rule: ruleName, module, symbol }) {
        const rule = ruleName as RuleName;
        const lines = [
          `${rule}: ${RULE_DESCRIPTIONS[rule]}.`,
          `Default severity: ${RULE_DEFAULTS[rule]}.`,
          `How to resolve: ${FIXES[rule]}`,
          "",
          "Directions: `archlock accept` adopts code changes into the sketches (a human decision); `archlock push` changes the code to match the sketches.",
        ];
        if (module !== undefined || symbol !== undefined) {
          try {
            const result = await checkWorkspace(await open());
            const hits = result.violations.filter(
              (v) =>
                v.rule === rule &&
                (module === undefined || v.module === module) &&
                (symbol === undefined || v.symbol === symbol),
            );
            lines.push("");
            if (hits.length === 0) lines.push("There is currently no such violation.");
            for (const v of hits) {
              lines.push(
                `Current: ${v.module ?? "(project)"}${v.symbol ? `.${v.symbol}` : ""}: ${v.message}`,
              );
              for (const d of v.details ?? []) lines.push(`  ${d}`);
              if (v.code) lines.push(`  code: ${v.code.file}:${v.code.line}`);
              if (v.sketch) lines.push(`  sketch: ${v.sketch.file}:${v.sketch.line}`);
            }
          } catch (e) {
            return failure(e);
          }
        }
        return text(lines.join("\n"));
      },
    },
    {
      name: "get_module_for_file",
      title: "Module for a file",
      description:
        "Tells which module a source file belongs to, what that module may import (__depends_on__, __external__) and where its sketch is.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path relative to the repository root" },
        },
        required: ["path"],
      },
      async run({ path }) {
        try {
          const ws = await open();
          const rel = (path as string).replace(/\\/g, "/").replace(/^\.\//, "");
          const owner = new Ownership(specsFromSketches(ws.sketches.sketches)).owner(rel);
          if (owner === null) {
            return text(
              `${rel} belongs to no module. Either move it into a module's __paths__, or a human adds a matching glob to a sketch.`,
            );
          }
          const s = ws.sketches.sketches.find((x) => x.module.name === owner);
          const m = s?.module;
          return text(
            [
              `${rel} belongs to module "${owner}" (sketch: ${s?.file}).`,
              `Paths: ${m?.paths.join(", ")}`,
              `Entry (public API): ${m?.entry ?? "none (all exported symbols of the module's files are public)"}`,
              `May import modules: ${m && m.dependsOn.length > 0 ? m.dependsOn.join(", ") : "none"}`,
              `External packages: ${m?.external === null || m?.external === undefined ? "not restricted" : m.external.join(", ") || "none allowed"}`,
            ].join("\n"),
          );
        } catch (e) {
          return failure(e);
        }
      },
    },
  ];
}

/** Protocol versions this server speaks, newest first. */
const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

type JsonRpcId = string | number;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: JsonRpcId | null;
  method: string;
  params?: Record<string, unknown>;
}

type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: JsonRpcId | null; result: unknown }
  | { jsonrpc: "2.0"; id: JsonRpcId | null; error: { code: number; message: string } };

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

/**
 * Handles one JSON-RPC message; returns the response, or null for a notification (a message
 * without `id`), which gets none.
 */
export async function handleMessage(
  tools: Tool[],
  message: unknown,
): Promise<JsonRpcResponse | null> {
  const req = message as Partial<JsonRpcRequest> | null;
  const id = req && typeof req === "object" && "id" in req ? (req.id ?? null) : null;
  const error = (code: number, msg: string): JsonRpcResponse => ({
    jsonrpc: "2.0",
    id,
    error: { code, message: msg },
  });
  if (!req || typeof req !== "object" || req.jsonrpc !== "2.0" || typeof req.method !== "string")
    return error(INVALID_REQUEST, "not a JSON-RPC 2.0 request");
  const notification = !("id" in req);
  const ok = (result: unknown): JsonRpcResponse | null =>
    notification ? null : { jsonrpc: "2.0", id, result };
  try {
    switch (req.method) {
      case "initialize": {
        const asked = req.params?.protocolVersion;
        const version =
          typeof asked === "string" && PROTOCOL_VERSIONS.includes(asked)
            ? asked
            : (PROTOCOL_VERSIONS[0] as string);
        return ok({
          protocolVersion: version,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "archlock", version: VERSION },
        });
      }
      case "ping":
        return ok({});
      case "tools/list":
        return ok({
          tools: tools.map(({ name, title, description, inputSchema }) => ({
            name,
            title,
            description,
            inputSchema,
          })),
        });
      case "tools/call": {
        const name = req.params?.name;
        const tool = tools.find((t) => t.name === name);
        if (!tool) {
          return notification
            ? null
            : error(
                INVALID_PARAMS,
                `unknown tool "${String(name)}"; tools: ${tools.map((t) => t.name).join(", ")}`,
              );
        }
        return ok(await tool.run(argumentsFor(tool, req.params?.arguments)));
      }
      default:
        // Notifications (`notifications/initialized`, `notifications/cancelled`) need no answer.
        if (notification) return null;
        return error(METHOD_NOT_FOUND, `method not supported: ${req.method}`);
    }
  } catch (e) {
    if (notification) return null;
    if (e instanceof InvalidParams) return error(INVALID_PARAMS, e.message);
    return error(INTERNAL_ERROR, e instanceof Error ? e.message : String(e));
  }
}

/** Serves MCP over stdio (one JSON-RPC message per line) until stdin closes. */
export async function startMcpServer(cwd: string, configPath?: string): Promise<void> {
  const tools = createTools(cwd, configPath);
  const send = (response: JsonRpcResponse) => {
    process.stdout.write(`${JSON.stringify(response)}\n`);
  };
  const lines = createInterface({ input: process.stdin, crlfDelay: Number.POSITIVE_INFINITY });
  const pending: Promise<void>[] = [];
  for await (const line of lines) {
    if (line.trim() === "") continue;
    let message: unknown;
    try {
      message = JSON.parse(line);
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: PARSE_ERROR, message: "invalid JSON" } });
      continue;
    }
    const batch = Array.isArray(message) ? message : [message];
    // Requests run concurrently, as a client may send several before awaiting the answers.
    pending.push(
      Promise.all(batch.map((m) => handleMessage(tools, m))).then((responses) => {
        const out = responses.filter((r): r is JsonRpcResponse => r !== null);
        if (out.length === 0) return;
        if (Array.isArray(message)) process.stdout.write(`${JSON.stringify(out)}\n`);
        else send(out[0] as JsonRpcResponse);
      }),
    );
  }
  await Promise.all(pending);
}
