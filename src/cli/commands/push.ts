import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import * as p from "@clack/prompts";
import type { Command } from "commander";
import {
  ADAPTERS,
  type AgentAdapter,
  type AgentInvocation,
  customInvocation,
  detectAgent,
  onPath,
} from "../../agents/adapters.js";
import { buildPushPrompt } from "../../agents/prompt.js";
import { openTodo, runPushLoop } from "../../agents/push.js";
import {
  AGENT_NAMES,
  type AgentName,
  type ArchlockConfig,
  isPlainCommand,
} from "../../config/config.js";
import type { Violation } from "../../engine/compare.js";
import { checkWorkspace, openWorkspace } from "../../engine/workspace.js";
import { cacheDir } from "../../fs/cache.js";
import { relPosix } from "../../fs/paths.js";
import { uncommittedChanges } from "../../git/git.js";
import { plural } from "../../report/format.js";
import { jsonPayload } from "../../report/json.js";
import { CliError, type Context } from "../context.js";

export interface PushOptions {
  agent?: string;
  printPrompt?: boolean;
  maxRounds?: string;
  yes?: boolean;
  checkCommand?: string;
}

/** How the agent should run the check: the same archlock that is running now. */
export function defaultCheckCommand(root: string): string {
  if (existsSync(join(root, "node_modules", ".bin", "archlock"))) return "npx archlock check";
  const self = process.argv[1];
  if (self && /\.(c|m)?js$/.test(self)) {
    const rel = relative(root, self).split("\\").join("/");
    return `node ${rel.startsWith("..") ? self : rel} check`;
  }
  return "npx archlock check";
}

function label(v: Violation): string {
  return `${v.module ?? "(project)"}${v.symbol ? `.${v.symbol}` : ""}: ${v.message}`;
}

/** What the agent did about a violation that is gone, in the words of the work order. */
function doneLabel(v: Violation): string {
  const name = `${v.module ?? "(project)"}${v.symbol ? `.${v.symbol}` : ""}`;
  switch (v.rule) {
    case "planned_not_implemented":
      return `${name}: implemented`;
    case "signature_changed":
      return `${name}: signature now matches the sketch`;
    case "kind_changed":
      return `${name}: kind now matches the sketch`;
    case "public_symbol_added":
      return `${name}: no longer public`;
    default:
      return `${label(v)} (resolved)`;
  }
}

function duration(ms: number): string {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

export async function runPushCommand(ctx: Context, opts: PushOptions): Promise<number> {
  const ws = await openWorkspace(ctx.cwd, { configPath: ctx.configPath, cache: ctx.cache });
  if (ws.sketches.errors.length > 0) {
    const e = ws.sketches.errors[0] as (typeof ws.sketches.errors)[number];
    throw new CliError(
      `cannot push while a sketch is invalid: ${e.file}:${e.line}:${e.column}: ${e.message}`,
    );
  }
  const maxRounds =
    opts.maxRounds !== undefined ? Number(opts.maxRounds) : ws.config.agent.maxRounds;
  if (!Number.isInteger(maxRounds) || maxRounds < 1)
    throw new CliError("--max-rounds must be a positive integer");
  const checkCommand = opts.checkCommand ?? defaultCheckCommand(ws.root);
  if (!isPlainCommand(checkCommand))
    throw new CliError(
      `the check command \`${checkCommand}\` cannot be allowed for the agent: it must be one plain command without * ( ) , ; & | < > \` $. Pass --check-command, e.g. --check-command "npx archlock check".`,
    );
  const first = await checkWorkspace(ws);
  const todo = openTodo(first);
  const c = ctx.color;

  if (todo.length === 0) {
    if (ctx.json) ctx.out(jsonPayload("push", { rounds: 0, fixed: [], remaining: [] }));
    else if (!ctx.quiet)
      ctx.out(`${c.green("✔")} Nothing to push: the code already matches the sketches.`);
    return 0;
  }

  const { verifyCommands } = ws.config.agent;
  const prompt = () =>
    buildPushPrompt(first, {
      checkCommand,
      verifyCommands,
      sketchDir: ws.config.sketchDir,
      round: 1,
      maxRounds,
    });
  if (opts.printPrompt) {
    ctx.out(prompt());
    return 0;
  }

  const chosen = chooseAgent(ws.config.agent, opts.agent, checkCommand);
  if (chosen === null) {
    ctx.out(prompt());
    ctx.err(
      c.yellow(
        "archlock push: no coding agent found (looked for claude, codex and opencode on PATH). Paste the work order above into your agent, or set agent.command in archlock.config.json.",
      ),
    );
    return 0;
  }

  if (!opts.yes && opts.agent === undefined) {
    if (!ctx.interactive) {
      ctx.err(
        `archlock push: would run ${chosen.name} to make ${plural(todo.length, "change")}. Pass --yes (or --agent ${chosen.name}) to start it, or --print-prompt to see the work order.`,
      );
      return 1;
    }
    const ok = await p.confirm({
      message: `Run ${chosen.name} to make ${plural(todo.length, "change")}? It will edit files in this repository.`,
    });
    if (p.isCancel(ok) || !ok) {
      ctx.err("archlock push: cancelled.");
      return 1;
    }
  }

  // The cache holds the work order; changes there are not the user's.
  const dirty = uncommittedChanges(ws.root, [
    ws.config.sketchDir,
    relPosix(ws.root, cacheDir(ws.root)),
  ]);
  if (!ctx.json && !ctx.quiet) {
    if (dirty === null) {
      ctx.err(
        c.yellow(
          "Warning: this is not a git repository, so reviewing or undoing the agent's changes will be hard.",
        ),
      );
    } else if (dirty.length > 0) {
      ctx.err(
        c.yellow(
          `Warning: ${plural(dirty.length, "file has", "files have")} uncommitted changes outside ${ws.config.sketchDir}/ (e.g. ${dirty[0]}). Commit or stash them first so you can review exactly what the agent changes. archlock never commits.`,
        ),
      );
    }
  }

  const sketchTexts = new Map(ws.sketches.sketches.map((s) => [s.file, s.text]));
  const summary = await runPushLoop(ws, first, {
    invocation: chosen.invocation,
    maxRounds,
    checkCommand,
    verifyCommands,
    stdio: ctx.json || ctx.quiet ? "ignore" : "inherit",
    events: {
      round: (round, items, file, inv) => {
        if (ctx.json || ctx.quiet) return;
        ctx.err(
          c.bold(
            `\narchlock push: round ${round}/${maxRounds}: ${chosen.name} works on ${plural(items.length, "change")}`,
          ),
        );
        ctx.err(c.dim(`work order: ${file}`));
        ctx.err(c.dim(`command:    ${inv.display}`));
        ctx.err(
          c.dim(
            `${chosen.name} runs without a terminal and may print nothing until it is done (often a few minutes)…\n`,
          ),
        );
      },
      agentExit: (round, code, ms) => {
        if (ctx.json || ctx.quiet) return;
        ctx.err(
          code === 0
            ? c.dim(`\nRound ${round} took ${duration(ms)}. Checking again…`)
            : c.yellow(
                `\nThe agent exited with code ${code} in round ${round} after ${duration(ms)}. Checking what it changed…`,
              ),
        );
      },
    },
  });
  const touchedSketches = [...sketchTexts].filter(([file, text]) => {
    try {
      return readFileSync(join(ws.root, file), "utf8") !== text;
    } catch {
      return true;
    }
  });

  if (ctx.json) {
    ctx.out(
      jsonPayload("push", {
        agent: chosen.name,
        rounds: summary.rounds,
        fixed: summary.fixed,
        remaining: summary.remaining,
        promptFiles: summary.promptFiles,
        sketchesModified: touchedSketches.map(([f]) => f),
      }),
    );
  } else {
    const lines = [""];
    lines.push(
      c.bold(
        `archlock push: ${summary.rounds} round${summary.rounds === 1 ? "" : "s"} with ${chosen.name}`,
      ),
    );
    for (const v of summary.fixed) lines.push(`  ${c.green("✔ done")}  ${doneLabel(v)}`);
    for (const v of summary.remaining) lines.push(`  ${c.red("✖ open")}  ${label(v)}`);
    if (touchedSketches.length > 0) {
      lines.push(
        c.yellow(
          `Warning: the agent modified ${touchedSketches.map(([f]) => f).join(", ")}. Review that change carefully: sketches are the specification.`,
        ),
      );
    }
    lines.push(
      summary.remaining.length === 0
        ? c.green("The code matches the sketches. Review the changes (git diff) and commit them.")
        : c.yellow(
            `${plural(summary.remaining.length, "issue")} left after ${maxRounds} round${maxRounds === 1 ? "" : "s"}. Run \`archlock check\` for details, or \`archlock push\` again.`,
          ),
    );
    if (chosen.name === "claude" && verifyCommands.length === 0) {
      lines.push(
        c.dim(
          'Note: claude could only run the archlock check, not your build or tests. To let it, add e.g. "verifyCommands": ["npm test"] to "agent" in archlock.config.json.',
        ),
      );
    }
    ctx.out(lines.join("\n"));
  }
  return summary.remaining.some((v) => v.severity === "error") ? 1 : 0;
}

export interface ChosenAgent {
  name: AgentName;
  invocation: (promptFile: string) => AgentInvocation;
}

export function chooseAgent(
  agent: ArchlockConfig["agent"],
  requested: string | undefined,
  checkCommand: string,
): ChosenAgent | null {
  const { command } = agent;
  const fromAdapter = (adapter: AgentAdapter): ChosenAgent => ({
    name: adapter.name,
    invocation: (f) => adapter.invocation(f, [checkCommand, ...agent.verifyCommands]),
  });
  if (requested !== undefined) {
    if (!(AGENT_NAMES as readonly string[]).includes(requested)) {
      throw new CliError(`unknown --agent "${requested}" (use ${AGENT_NAMES.join(", ")})`);
    }
    if (requested === "custom") {
      if (!command)
        throw new CliError(
          '--agent custom needs "agent.command" in archlock.config.json, e.g. "my-agent --task {prompt_file}"',
        );
      return { name: "custom", invocation: (f) => customInvocation(command, f) };
    }
    const adapter = ADAPTERS[requested as keyof typeof ADAPTERS];
    if (!onPath(adapter.binary))
      throw new CliError(`${adapter.binary} is not installed (not found on PATH)`);
    return fromAdapter(adapter);
  }
  if (command) return { name: "custom", invocation: (f) => customInvocation(command, f) };
  const detected = detectAgent(agent.default);
  return detected ? fromAdapter(detected) : null;
}

export function registerPush(
  program: Command,
  context: () => Context,
  setExit: (code: number) => void,
): void {
  program
    .command("push")
    .description(
      "sketch → code: let your coding agent change the code until it matches the sketches",
    )
    .option("--agent <name>", `agent to run: ${AGENT_NAMES.join(", ")} (custom uses agent.command)`)
    .option("--print-prompt", "only print the work order (paste it into any agent)")
    .option("--max-rounds <n>", "maximum agent runs (default: agent.maxRounds, 3)")
    .option("--check-command <cmd>", "how the agent runs archlock check (default: detected)")
    .option("-y, --yes", "start the agent without asking")
    .addHelpText(
      "after",
      '\n`push` says: "the sketch is the truth". It builds a precise work order from every\ndifference, runs your agent (Claude Code, Codex, OpenCode or agent.command), re-checks,\nand repeats with what is left. Nothing is committed. The opposite direction is `archlock accept`.',
    )
    .action(async (opts: PushOptions) => {
      setExit(await runPushCommand(context(), opts));
    });
}
