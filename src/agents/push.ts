/**
 * The `archlock push` loop: run the agent with the work order, re-check, repeat with what is
 * left, at most `maxRounds` times. archlock never commits anything.
 */

import { spawn } from "node:child_process";
import { join } from "node:path";
import type { Violation } from "../engine/compare.js";
import { type CheckResult, checkWorkspace, type Workspace } from "../engine/workspace.js";
import { cacheDir } from "../fs/cache.js";
import { relPosix } from "../fs/paths.js";
import { writeText } from "../sketch/write.js";
import type { AgentInvocation } from "./adapters.js";
import { buildPushPrompt, pushViolations } from "./prompt.js";

export interface PushEvents {
  round?: (
    round: number,
    todo: Violation[],
    promptFile: string,
    invocation: AgentInvocation,
  ) => void;
  agentExit?: (round: number, code: number | null, ms: number) => void;
}

export interface PushRunOptions {
  invocation: (promptFile: string) => AgentInvocation;
  maxRounds: number;
  checkCommand: string;
  verifyCommands?: string[];
  /** "inherit" shows the agent's output; "ignore" hides it (--json, --quiet, tests). */
  stdio: "inherit" | "ignore";
  events?: PushEvents;
}

export interface PushSummary {
  rounds: number;
  initial: Violation[];
  fixed: Violation[];
  remaining: Violation[];
  promptFiles: string[];
}

function key(v: Violation): string {
  return `${v.rule}|${v.module ?? ""}|${v.symbol ?? ""}|${v.message}`;
}

/** Violations `push` must resolve: everything except notes (info). */
export function openTodo(result: CheckResult): Violation[] {
  return pushViolations(result.violations).filter((v) => v.severity !== "info");
}

export function promptPath(ws: Workspace, round: number): string {
  return relPosix(ws.root, join(cacheDir(ws.root), "push", `round-${round}.md`));
}

export function runAgent(
  inv: AgentInvocation,
  cwd: string,
  stdio: "inherit" | "ignore",
): Promise<number | null> {
  return new Promise((resolve, reject) => {
    // Windows cannot spawn .cmd shims (how npm installs CLIs) without a shell.
    const useShell = inv.shell || process.platform === "win32";
    // The agent runs headless and gets everything from the work order: no stdin. Inheriting a
    // non-terminal stdin made `claude -p` wait 3 s for input and print a warning.
    const io: ("ignore" | "inherit")[] = ["ignore", stdio, stdio];
    const child = useShell
      ? spawn(inv.display, { cwd, stdio: io, shell: true })
      : spawn(inv.command, inv.args, { cwd, stdio: io });
    child.on("error", reject);
    child.on("close", (code) => resolve(code));
  });
}

export async function runPushLoop(
  ws: Workspace,
  first: CheckResult,
  opts: PushRunOptions,
): Promise<PushSummary> {
  const initial = openTodo(first);
  let todo = initial;
  let result = first;
  const promptFiles: string[] = [];
  let round = 0;
  while (todo.length > 0 && round < opts.maxRounds) {
    round++;
    const file = promptPath(ws, round);
    const prompt = buildPushPrompt(result, {
      checkCommand: opts.checkCommand,
      verifyCommands: opts.verifyCommands,
      sketchDir: ws.config.sketchDir,
      round,
      maxRounds: opts.maxRounds,
    });
    writeText(ws.root, file, prompt);
    promptFiles.push(file);
    const inv = opts.invocation(file);
    opts.events?.round?.(round, todo, file, inv);
    const started = Date.now();
    const code = await runAgent(inv, ws.root, opts.stdio);
    opts.events?.agentExit?.(round, code, Date.now() - started);
    result = await checkWorkspace(ws);
    todo = openTodo(result);
  }
  const remainingKeys = new Set(todo.map(key));
  return {
    rounds: round,
    initial,
    fixed: initial.filter((v) => !remainingKeys.has(key(v))),
    remaining: todo,
    promptFiles,
  };
}
