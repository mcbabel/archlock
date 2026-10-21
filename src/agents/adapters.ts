/**
 * How archlock starts the coding agent the user already has. Flags were checked against
 * `claude --help` (Claude Code 2.1), `codex exec --help` (Codex CLI 0.163) and
 * `opencode run --help` (OpenCode 1.19). `agent.command` in the config overrides all of them.
 */

import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";
import type { AgentName } from "../config/config.js";

export interface AgentInvocation {
  /** Executable and arguments (no shell), or a shell command line for custom templates. */
  command: string;
  args: string[];
  shell: boolean;
  /** Human-readable form for logs. */
  display: string;
}

export interface AgentAdapter {
  name: AgentName;
  binary: string;
  /**
   * @param promptFile repo-relative path of the work order
   * @param commands shell commands the agent may run without asking: the check command
   *   (e.g. `npx archlock check`) followed by `agent.verifyCommands`
   */
  invocation(promptFile: string, commands: string[]): AgentInvocation;
}

function instruction(promptFile: string): string {
  return `Read the archlock work order in ${promptFile} and carry it out completely. Do not edit the sketches in the archlock/ folder.`;
}

/**
 * Permission rules for one command: exactly `command`, or `command` followed by arguments.
 * The space before `*` keeps a word boundary (`Bash(npm test*)` would also allow `npm testx`).
 */
function bashRules(command: string): string[] {
  return [`Bash(${command})`, `Bash(${command} *)`];
}

function quote(arg: string): string {
  return /^[\w./:=@-]+$/.test(arg) ? arg : `"${arg.replace(/(["\\$`])/g, "\\$1")}"`;
}

function argv(command: string, args: string[]): AgentInvocation {
  return { command, args, shell: false, display: [command, ...args].map(quote).join(" ") };
}

export const ADAPTERS: Record<Exclude<AgentName, "custom">, AgentAdapter> = {
  claude: {
    name: "claude",
    binary: "claude",
    // -p: non-interactive; acceptEdits: may edit files; only the listed commands may run in Bash
    // (the check command and agent.verifyCommands). Everything else is refused, not asked.
    invocation: (promptFile, commands) =>
      argv("claude", [
        "-p",
        "--permission-mode",
        "acceptEdits",
        "--allowedTools",
        ...commands.flatMap(bashRules),
        "--",
        instruction(promptFile),
      ]),
  },
  codex: {
    name: "codex",
    binary: "codex",
    // exec: non-interactive; workspace-write: may edit files in the repository.
    invocation: (promptFile) =>
      argv("codex", ["exec", "--sandbox", "workspace-write", instruction(promptFile)]),
  },
  opencode: {
    name: "opencode",
    binary: "opencode",
    invocation: (promptFile) => argv("opencode", ["run", instruction(promptFile)]),
  },
};

/** `agent.command` template: `{prompt_file}` is replaced by the (quoted) prompt file path. */
export function customInvocation(template: string, promptFile: string): AgentInvocation {
  const line = template.includes("{prompt_file}")
    ? template.replaceAll("{prompt_file}", quote(promptFile))
    : `${template} ${quote(promptFile)}`;
  return { command: line, args: [], shell: true, display: line };
}

/** Finds an executable on PATH (with PATHEXT on Windows). */
export function onPath(binary: string, env: NodeJS.ProcessEnv = process.env): boolean {
  const dirs = (env.PATH ?? env.Path ?? "").split(delimiter).filter(Boolean);
  const exts = process.platform === "win32" ? (env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";") : [""];
  return dirs.some((d) => exts.some((e) => existsSync(join(d, binary + e))));
}

/** The first installed built-in agent, preferring `preferred`. */
export function detectAgent(preferred: AgentName): AgentAdapter | null {
  const order = [preferred, "claude", "codex", "opencode"].filter(
    (a, i, all) => a !== "custom" && all.indexOf(a) === i,
  );
  for (const name of order) {
    const adapter = ADAPTERS[name as keyof typeof ADAPTERS];
    if (adapter && onPath(adapter.binary)) return adapter;
  }
  return null;
}
