import type { Location } from "../core/model.js";
import type { Violation } from "../engine/compare.js";
import { type Colors, formatNumber, plural } from "./format.js";

export interface Summary {
  errors: number;
  warnings: number;
  infos: number;
}

export function summarize(violations: Violation[]): Summary {
  return {
    errors: violations.filter((v) => v.severity === "error").length,
    warnings: violations.filter((v) => v.severity === "warn").length,
    infos: violations.filter((v) => v.severity === "info").length,
  };
}

function loc(l: Location | undefined, withColumn = true): string | null {
  if (!l) return null;
  return withColumn && l.column > 1 ? `${l.file}:${l.line}:${l.column}` : `${l.file}:${l.line}`;
}

const MAX_UNASSIGNED = 10;

/** The terminal report for `archlock check`, grouped by module. */
export function renderHumanReport(
  violations: Violation[],
  c: Colors,
  opts: { quiet: boolean; modules: number; symbols: number },
): string {
  const shown = opts.quiet ? violations.filter((v) => v.severity === "error") : violations;
  const s = summarize(violations);
  const lines: string[] = [];

  if (s.errors === 0 && s.warnings === 0) {
    if (!opts.quiet) {
      lines.push(
        `${c.green("✔")} archlock check: the code matches the sketches (${plural(opts.modules, "module")}, ${plural(opts.symbols, "public symbol")})`,
      );
      if (s.infos > 0) lines.push("");
    }
  }

  const groups = new Map<string, Violation[]>();
  for (const v of shown) {
    const key = v.module ?? "";
    groups.set(key, [...(groups.get(key) ?? []), v]);
  }
  const icon = (v: Violation) =>
    v.severity === "error" ? c.red("✖") : v.severity === "warn" ? c.yellow("⚠") : c.blue("ℹ");

  for (const [module, list] of groups) {
    lines.push(c.bold(module === "" ? "(no module)" : module));
    const unassigned = list.filter((v) => v.rule === "unassigned_file");
    const others = list.filter((v) => v.rule !== "unassigned_file");
    for (const v of others) {
      lines.push(`  ${icon(v)} ${c.dim(v.rule)}  ${v.message}`);
      for (const d of v.details ?? []) lines.push(`      ${colorDetail(d, c)}`);
      const where = [
        loc(v.code) && `code ${loc(v.code)}`,
        loc(v.sketch, false) && `sketch ${loc(v.sketch, false)}`,
      ]
        .filter(Boolean)
        .join(c.dim(" · "));
      if (where) lines.push(`      ${c.dim("at")} ${c.cyan(where)}`);
      if (v.hint) lines.push(`      ${c.dim("→")} ${v.hint}`);
    }
    if (unassigned.length > 0) {
      const first = unassigned[0] as Violation;
      lines.push(
        `  ${icon(first)} ${c.dim("unassigned_file")}  ${plural(unassigned.length, "file belongs", "files belong")} to no module`,
      );
      for (const v of unassigned.slice(0, MAX_UNASSIGNED))
        lines.push(`      ${c.cyan(v.code?.file ?? "")}`);
      if (unassigned.length > MAX_UNASSIGNED) {
        lines.push(
          `      ${c.dim(`… and ${formatNumber(unassigned.length - MAX_UNASSIGNED)} more`)}`,
        );
      }
      if (first.hint) lines.push(`      ${c.dim("→")} ${first.hint}`);
    }
    lines.push("");
  }

  if (s.errors > 0 || s.warnings > 0) {
    const parts = [
      s.errors > 0 ? c.red(plural(s.errors, "error")) : null,
      s.warnings > 0 ? c.yellow(plural(s.warnings, "warning")) : null,
      s.infos > 0 && !opts.quiet ? c.blue(plural(s.infos, "note")) : null,
    ].filter(Boolean);
    lines.push(`archlock check: ${parts.join(", ")}`);
    if (s.errors > 0) {
      lines.push(
        c.dim(
          "The code and the sketches disagree. Accept intended changes with `archlock accept`, or let your agent fix the code with `archlock push`.",
        ),
      );
    }
  }
  return `${lines.join("\n").replace(/\n+$/, "")}\n`;
}

function colorDetail(d: string, c: Colors): string {
  if (d.startsWith("+ ")) return c.green(d);
  if (d.startsWith("- ")) return c.red(d);
  if (d.startsWith("sketch:") || d.startsWith("~ sketch:")) return c.red(d);
  if (d.startsWith("code:") || d.startsWith("  code:")) return c.green(d);
  return d;
}
