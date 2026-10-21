import type { Command } from "commander";
import { diffWorkspace, openWorkspace } from "../../engine/workspace.js";
import { GitError, shortSha } from "../../git/git.js";
import { renderDiffMarkdown, renderDiffTerminal } from "../../report/diff.js";
import { jsonPayload } from "../../report/json.js";
import { CliError, type Context } from "../context.js";

export interface DiffOptions {
  base?: string;
  format?: string;
}

export async function runDiffCommand(ctx: Context, opts: DiffOptions): Promise<number> {
  const format = ctx.json ? "json" : (opts.format ?? "terminal");
  if (!["terminal", "markdown", "json"].includes(format)) {
    throw new CliError(`unknown --format "${format}" (use terminal, markdown or json)`);
  }
  const ws = await openWorkspace(ctx.cwd, { configPath: ctx.configPath, cache: ctx.cache });
  let result: Awaited<ReturnType<typeof diffWorkspace>>;
  try {
    result = await diffWorkspace(ws, opts.base);
  } catch (e) {
    if (e instanceof GitError) throw new CliError(`archlock diff needs git: ${e.message}`);
    throw e;
  }
  const baseLabel = `${result.base.ref} @ ${shortSha(result.base.sha)}`;
  if (format === "json") {
    ctx.out(
      jsonPayload("diff", {
        base: result.base,
        changes: result.changes,
        codeLinesChanged: result.codeLinesChanged,
        architectureLinesChanged: result.changes.length,
      }),
    );
  } else if (format === "markdown") {
    ctx.out(renderDiffMarkdown(result.changes, result.codeLinesChanged, baseLabel));
  } else {
    ctx.out(renderDiffTerminal(result.changes, result.codeLinesChanged, baseLabel, ctx.color));
  }
  return 0;
}

export function registerDiff(
  program: Command,
  context: () => Context,
  setExit: (code: number) => void,
): void {
  program
    .command("diff")
    .description("show how the architecture changed compared with a base commit (for PR reviews)")
    .option(
      "--base <ref>",
      "git ref to compare with (default: merge base with origin/main, main or master)",
    )
    .option("--format <format>", "terminal, markdown (for PR comments) or json", "terminal")
    .addHelpText(
      "after",
      "\nThe code of both states is analysed, so changes show up even if nobody ran `archlock accept`.\nThe base is checked out in a temporary git worktree; your working tree is never touched.",
    )
    .action(async (opts: DiffOptions) => {
      setExit(await runDiffCommand(context(), opts));
    });
}
