import type { Command } from "commander";
import { checkWorkspace, openWorkspace } from "../../engine/workspace.js";
import { renderGithubAnnotations } from "../../report/github.js";
import { renderHumanReport, summarize } from "../../report/human.js";
import { checkJson } from "../../report/json.js";
import type { Context } from "../context.js";
import { CliError } from "../context.js";

export interface CheckOptions {
  format?: string;
}

export async function runCheckCommand(ctx: Context, opts: CheckOptions): Promise<number> {
  const format = ctx.json ? "json" : (opts.format ?? "human");
  if (!["human", "json", "github"].includes(format)) {
    throw new CliError(`unknown --format "${format}" (use human, json or github)`);
  }
  const ws = await openWorkspace(ctx.cwd, { configPath: ctx.configPath, cache: ctx.cache });
  const result = await checkWorkspace(ws);
  const modules = result.sketches.length;
  const symbols = result.sketches.reduce((n, s) => n + s.module.symbols.length, 0);
  const summary = summarize(result.violations);

  if (format === "json") {
    ctx.out(checkJson(result.violations, { modules, symbols }));
  } else {
    if (format === "github") ctx.out(renderGithubAnnotations(result.violations));
    if (!(format === "github" && summary.errors + summary.warnings === 0 && ctx.quiet)) {
      ctx.out(
        renderHumanReport(result.violations, ctx.color, { quiet: ctx.quiet, modules, symbols }),
      );
    }
  }
  return summary.errors > 0 ? 1 : 0;
}

export function registerCheck(
  program: Command,
  context: () => Context,
  setExit: (code: number) => void,
): void {
  program
    .command("check")
    .description(
      "compare the code with the sketches and report every difference (exit 1 on errors)",
    )
    .option("--format <format>", "output format: human, json or github (annotations)", "human")
    .addHelpText(
      "after",
      "\nNo LLM, no network, no git needed. Same input, same output.\nExit codes: 0 = ok (warnings allowed), 1 = errors found, 2 = archlock could not run.",
    )
    .action(async (opts: CheckOptions) => {
      setExit(await runCheckCommand(context(), opts));
    });
}
