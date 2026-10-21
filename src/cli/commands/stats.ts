import type { Command } from "commander";
import { computeStats } from "../../engine/stats.js";
import { checkWorkspace, openWorkspace } from "../../engine/workspace.js";
import { badgeMarkdown, compressionLine, formatNumber } from "../../report/format.js";
import { jsonPayload } from "../../report/json.js";
import type { Context } from "../context.js";

export async function runStatsCommand(ctx: Context, opts: { badge?: boolean }): Promise<number> {
  const ws = await openWorkspace(ctx.cwd, { configPath: ctx.configPath, cache: ctx.cache });
  const result = await checkWorkspace(ws);
  const modules = result.sketches.map((s) => s.module);
  const stats = computeStats(
    modules,
    result.sketches.map((s) => s.text),
    result.project.totalLines,
  );
  const badge = badgeMarkdown(
    stats.modules,
    stats.codeLines,
    stats.sketchLines,
    `${ws.config.sketchDir}/README.md`,
  );
  if (ctx.json) {
    ctx.out(jsonPayload("stats", { ...stats, badge }));
    return 0;
  }
  if (opts.badge) {
    ctx.out(badge);
    return 0;
  }
  const c = ctx.color;
  const pct =
    stats.typePositions === 0 ? 0 : Math.round((stats.inferred / stats.typePositions) * 100);
  const rows: [string, string][] = [
    ["Modules", formatNumber(stats.modules)],
    ["Public symbols", formatNumber(stats.symbols)],
    ["Declared dependencies", formatNumber(stats.edges)],
    ["Lines of code", formatNumber(stats.codeLines)],
    ["Lines of architecture", formatNumber(stats.sketchLines)],
    [
      "Inferred types",
      `${formatNumber(stats.inferred)} of ${formatNumber(stats.typePositions)} (${pct}%)`,
    ],
    [
      "Dependency cycles",
      stats.cycles.length === 0 ? "none" : stats.cycles.map((cy) => cy.join(" → ")).join("; "),
    ],
  ];
  const width = Math.max(...rows.map(([k]) => k.length));
  const lines = [c.bold(compressionLine(stats.codeLines, stats.sketchLines)), ""];
  for (const [k, v] of rows) lines.push(`  ${k.padEnd(width)}  ${v}`);
  if (stats.inferred > 0) {
    lines.push("");
    lines.push(
      c.dim(
        `Hint: annotate your public API for stronger checks ('<inferred>' types only match '<inferred>').`,
      ),
    );
  }
  ctx.out(lines.join("\n"));
  return 0;
}

export function registerStats(
  program: Command,
  context: () => Context,
  setExit: (code: number) => void,
): void {
  program
    .command("stats")
    .description("compression ratio, modules, symbols, dependencies, inferred types, cycles")
    .option("--badge", "print a Markdown snippet for a static shields.io badge")
    .action(async (opts: { badge?: boolean }) => {
      setExit(await runStatsCommand(context(), opts));
    });
}
