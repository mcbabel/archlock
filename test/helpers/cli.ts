import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const CLI_PATH = fileURLToPath(new URL("../../dist/cli.js", import.meta.url));

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** Runs the bundled CLI in a child process, like a user would. */
export function runCli(
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): CliResult {
  const result = spawnSync(process.execPath, [CLI_PATH, ...args], {
    cwd: options.cwd,
    env: { ...process.env, NO_COLOR: "1", ...options.env },
    encoding: "utf8",
  });
  return { code: result.status ?? -1, stdout: result.stdout, stderr: result.stderr };
}
