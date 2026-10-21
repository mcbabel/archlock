/**
 * `archlock mcp`: an MCP server over stdio so agents can read the architecture and check
 * their work without shelling out. Every call reads the current files (with the cache).
 * Nothing here writes to the repository.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createColors } from "picocolors";
import { z } from "zod";
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

export function createMcpServer(cwd: string, configPath?: string): McpServer {
  const server = new McpServer({ name: "archlock", version: VERSION });
  const open = () => openWorkspace(cwd, { configPath });

  server.registerTool(
    "get_architecture",
    {
      title: "Get architecture",
      description:
        "Returns the architecture sketches (archlock/*.arch.py): modules, their files, allowed dependencies, public API and invariants. Read this before changing code; stay within it.",
      inputSchema: {
        module: z.string().optional().describe("Only this module (default: all modules)"),
      },
    },
    async ({ module }) => {
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
  );

  server.registerTool(
    "check",
    {
      title: "Check architecture",
      description:
        "Runs `archlock check`: compares the code with the sketches and lists every difference (undeclared dependencies, signature changes, planned symbols, ...). Run it after changing code.",
      inputSchema: {
        module: z.string().optional().describe("Only report violations of this module"),
      },
    },
    async ({ module }) => {
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
  );

  server.registerTool(
    "explain_violation",
    {
      title: "Explain a violation",
      description:
        "Explains a violation type (and, with module/symbol, the current instance of it) and how to resolve it.",
      inputSchema: {
        rule: z
          .enum(RULE_NAMES as [RuleName, ...RuleName[]])
          .describe("The violation type, e.g. signature_changed"),
        module: z.string().optional(),
        symbol: z.string().optional(),
      },
    },
    async ({ rule, module, symbol }) => {
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
  );

  server.registerTool(
    "get_module_for_file",
    {
      title: "Module for a file",
      description:
        "Tells which module a source file belongs to, what that module may import (__depends_on__, __external__) and where its sketch is.",
      inputSchema: { path: z.string().describe("File path relative to the repository root") },
    },
    async ({ path }) => {
      try {
        const ws = await open();
        const rel = path.replace(/\\/g, "/").replace(/^\.\//, "");
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
  );

  return server;
}

/** Serves MCP over stdio until the client disconnects. */
export async function startMcpServer(cwd: string, configPath?: string): Promise<void> {
  const server = createMcpServer(cwd, configPath);
  await server.connect(new StdioServerTransport());
}
