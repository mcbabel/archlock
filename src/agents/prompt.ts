/**
 * The work order for `archlock push`: everything a coding agent needs to make the code match
 * the sketches, and nothing else. Deterministic for a given repository state.
 */

import type { ArchModule, ArchSymbol } from "../core/model.js";
import type { RuleName } from "../core/rules.js";
import type { Violation } from "../engine/compare.js";
import type { CheckResult } from "../engine/workspace.js";
import { renderSymbolText } from "../sketch/render.js";

/** Violations that a code change can fix, in the order they are presented. */
export const PUSH_RULES: readonly RuleName[] = [
  "planned_not_implemented",
  "signature_changed",
  "kind_changed",
  "public_symbol_added",
  "undeclared_dependency",
  "undeclared_external",
  "deep_import",
  "dependency_cycle",
];

export function pushViolations(violations: Violation[]): Violation[] {
  return violations
    .filter((v) => (PUSH_RULES as string[]).includes(v.rule))
    .sort((a, b) => PUSH_RULES.indexOf(a.rule) - PUSH_RULES.indexOf(b.rule));
}

export interface PromptOptions {
  /** How the agent runs the check, e.g. `npx archlock check`. */
  checkCommand: string;
  /** `agent.verifyCommands`: build, typecheck or test commands the agent should also run. */
  verifyCommands?: string[];
  sketchDir: string;
  round: number;
  maxRounds: number;
}

const SOFT_PREFIX = /^#\s*(invariant|must|never)\b/i;

function fence(text: string, lang = "python"): string {
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

function findSymbol(mod: ArchModule | undefined, name: string | undefined): ArchSymbol | undefined {
  return name === undefined ? undefined : mod?.symbols.find((s) => s.name === name);
}

/** Builds the work order from a full check result: errors and warnings are the work items. */
export function buildPushPrompt(result: CheckResult, opts: PromptOptions): string {
  const todo = pushViolations(result.violations).filter((v) => v.severity !== "info");
  const sketches = new Map(result.sketches.map((s) => [s.module.name, s]));
  const affected = [
    ...new Set(todo.map((v) => v.module).filter((m): m is string => m !== null)),
  ].sort();
  const out: string[] = [];

  out.push("# archlock push: make the code match the architecture sketches", "");
  out.push(
    `This repository describes its architecture in \`${opts.sketchDir}/*.arch.py\` ("sketches"): one file per module with the module's files (\`__paths__\`), the modules it may import (\`__depends_on__\`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.`,
    "",
  );
  if (opts.round > 1) {
    out.push(
      `This is round ${opts.round} of ${opts.maxRounds}. The previous round left the issues below unresolved; \`${opts.checkCommand}\` still reports them.`,
      "",
    );
  }

  out.push("## Changes to make", "");
  // A new module is introduced once, at its first planned symbol.
  const planned = new Map<string, number>();
  for (const v of todo)
    if (v.rule === "planned_not_implemented" && v.module)
      planned.set(v.module, (planned.get(v.module) ?? 0) + 1);
  const introduced = new Set<string>();
  todo.forEach((v, i) => {
    out.push(...describe(v, i + 1, sketches, result, { planned, introduced }), "");
  });

  // Info notes are not work items, but a dependency the plan declares and nothing uses yet
  // usually means "wire the new code in" (e.g. the entry point should start a new module).
  const wiring = result.violations.filter(
    (v) => v.rule === "unused_dependency" && v.module !== null && sketches.has(v.module),
  );
  if (wiring.length > 0) {
    out.push(
      "## Dependencies declared but not used yet",
      "",
      "These are not errors, but they show where the plan expects the code to be connected. Use the dependency where the plan needs it (for example, start a new module from the entry point); if nothing needs it, leave it unused.",
      "",
      ...wiring.map((v) => {
        const target = /dependency on (\S+)/.exec(v.message)?.[1] ?? "?";
        return `- \`${v.module}\` may import \`${target}\` (${v.sketch ? `${v.sketch.file}:${v.sketch.line}` : "its sketch"}) but does not yet.`;
      }),
      "",
    );
  }

  out.push("## How to read a sketch", "");
  out.push(
    "- Sketches use Python syntax as notation, whatever the project's language. Types are written in the module's own language: TypeScript types stay TypeScript (`Promise[T]` means `Promise<T>`; quoted types like `'{ a: number }'` are verbatim).",
    "- `def f(a: T, b: U = ...) -> R` is a function; `b` is optional. `*rest: T` is a rest parameter. Methods take `self`; `@staticmethod` has none.",
    "- `class X(Protocol)` is an interface; `class E(Enum)` an enum; `X: TypeAlias = T` a type alias; `NAME: T` an exported constant.",
    "- Field flags: `Readonly[T]`, `Opt[T]` (optional property), `ClassVar[T]` (static). `'<inferred>'` means the code has no type annotation there.",
    "- Everything listed in a sketch must be public (exported from the module's `__entry__` when one is set); nothing else may be.",
    "- Names a sketch uses but does not define (e.g. `Customer`) are public symbols of the modules in its `__depends_on__`; import them from that module's entry.",
    "",
  );

  const notes: string[] = [];
  for (const name of affected) {
    const mod = sketches.get(name)?.module;
    if (!mod) continue;
    const lines = [
      ...mod.soft.fileLeading,
      ...mod.symbols.flatMap((s) => [
        ...s.soft.leading,
        ...s.soft.body,
        ...(s.soft.trailing ? [s.soft.trailing] : []),
      ]),
    ].filter((l) => SOFT_PREFIX.test(l));
    for (const l of lines) notes.push(`- ${name}: \`${l.trim()}\``);
  }
  if (notes.length > 0) {
    out.push(
      "## Invariants to respect",
      "",
      "The sketches state these rules; keep them true in the code you write:",
      "",
      ...notes,
      "",
    );
  }

  out.push("## Sketches of the affected modules", "");
  for (const name of affected) {
    const s = sketches.get(name);
    if (!s) continue;
    out.push(`### ${s.file}`, "", fence(s.text.trimEnd()), "");
  }

  out.push("## Rules", "");
  out.push(
    `- Do not edit anything under \`${opts.sketchDir}/\`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.`,
    "- Do not change the public API of any module beyond the changes listed above.",
    "- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).",
    "- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.",
    `- When you are done, run \`${opts.checkCommand}\` and iterate until it reports no errors. Do not run \`archlock accept\`: that would change the sketches instead of the code.`,
  );
  const verify = opts.verifyCommands ?? [];
  if (verify.length > 0) {
    out.push(`- Also run ${verify.map((c) => `\`${c}\``).join(", ")} and fix what they report.`);
  }
  out.push(
    "- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.",
  );
  return `${out.join("\n")}\n`;
}

function where(v: Violation): string {
  return v.code ? `${v.code.file}:${v.code.line}` : "";
}

function describe(
  v: Violation,
  n: number,
  sketches: Map<string, CheckResult["sketches"][number]>,
  result: CheckResult,
  newModules: { planned: Map<string, number>; introduced: Set<string> },
): string[] {
  const sketch = v.module ? sketches.get(v.module) : undefined;
  const code = v.module ? result.project.modules.get(v.module) : undefined;
  const target = findSymbol(sketch?.module, v.symbol);
  const current = v.symbol ? code?.symbols.find((s) => s.name === v.symbol) : undefined;
  const at = (l: { file: string; line: number } | undefined) => (l ? ` (${l.file}:${l.line})` : "");
  const entry = code?.entry ?? sketch?.module.entry ?? null;

  switch (v.rule) {
    case "planned_not_implemented": {
      const lines = [
        `### ${n}. ${v.module}: implement \`${v.symbol}\` (new)`,
        "",
        `Target${at(v.sketch)}:`,
        "",
        fence(target ? renderSymbolText(target) : (v.details ?? []).join("\n")),
      ];
      if (code && code.files.length === 0) {
        if (v.module === null || newModules.introduced.has(v.module)) return lines;
        newModules.introduced.add(v.module);
        const more = (newModules.planned.get(v.module) ?? 0) > 1;
        lines.push(
          "",
          `Module \`${v.module}\` has no code yet. Create it under ${sketch?.module.paths.map((p) => `\`${p}\``).join(", ")}${sketch?.module.entry ? ` with the entry \`${sketch.module.entry}\`` : ""}.${more ? ` The other new symbols of \`${v.module}\` below belong there too.` : ""}`,
        );
      } else if (entry) {
        lines.push("", `Export it from \`${entry}\`.`);
      }
      return lines;
    }
    case "signature_changed":
    case "kind_changed": {
      const verb = v.rule === "kind_changed" ? "change the kind of" : "change";
      const lines = [
        `### ${n}. ${v.module}: ${verb} \`${v.symbol}\``,
        "",
        `Target${at(v.sketch)}:`,
        "",
        fence(target ? renderSymbolText(target) : ""),
      ];
      if (current)
        lines.push("", `Current code${at(v.code)}:`, "", fence(renderSymbolText(current)));
      if (v.details && v.rule === "signature_changed")
        lines.push("", "Differences:", "", fence(v.details.join("\n"), "diff"));
      lines.push("", "Update every caller.");
      return lines;
    }
    case "public_symbol_added":
      return [
        `### ${n}. ${v.module}: \`${v.symbol}\` must not be public`,
        "",
        `It is public in the code${at(v.code)} but not part of the sketch. Stop exporting it${entry ? ` from \`${entry}\`` : ""} (keep it internal), or remove it if nothing uses it.`,
      ];
    case "undeclared_dependency": {
      const target2 = /new dependency: (\S+)/.exec(v.message)?.[1] ?? "?";
      const allowed = sketch?.module.dependsOn ?? [];
      return [
        `### ${n}. ${v.module}: remove the dependency on \`${target2}\``,
        "",
        `\`${v.module}\` imports \`${target2}\` (${where(v)}${v.details ? `; ${v.details.join("; ")}` : ""}), but it may only depend on: ${allowed.length > 0 ? allowed.map((d) => `\`${d}\``).join(", ") : "nothing"}. Restructure the code so the import is not needed.`,
      ];
    }
    case "undeclared_external": {
      const pkg = /package (\S+)/.exec(v.message)?.[1] ?? "?";
      return [
        `### ${n}. ${v.module}: stop using \`${pkg}\``,
        "",
        `The external package \`${pkg}\` is imported at ${where(v)}, but \`__external__\` only allows: ${(sketch?.module.external ?? []).map((d) => `\`${d}\``).join(", ") || "nothing"}.`,
      ];
    }
    case "deep_import":
      return [
        `### ${n}. ${v.module}: avoid a deep import`,
        "",
        `${where(v)} ${v.message}. Use the other module's public API${v.hint ? ` (${v.hint})` : ""}.`,
      ];
    case "dependency_cycle":
      return [
        `### ${n}. Break the ${v.message}`,
        "",
        `Move shared code so that the modules no longer import each other in a cycle${v.code ? ` (one edge: ${where(v)})` : ""}.`,
      ];
    default:
      return [`### ${n}. ${v.module ?? "project"}: ${v.message}`];
  }
}
