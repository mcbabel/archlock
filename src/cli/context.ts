import { existsSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { createColors } from "picocolors";
import type { Colors } from "../report/format.js";
import type { GlobalOptions, RunIO } from "./program.js";

/** Everything a command needs: where to run, how to print. */
export interface Context {
  cwd: string;
  configPath?: string;
  json: boolean;
  quiet: boolean;
  color: Colors;
  interactive: boolean;
  /** Use the file-hash cache (`--no-cache` turns it off). */
  cache: boolean;
  out: (text: string) => void;
  err: (text: string) => void;
}

export function createContext(opts: GlobalOptions, io: RunIO): Context {
  const forceColor = "FORCE_COLOR" in process.env && process.env.FORCE_COLOR !== "0";
  const colorEnabled =
    opts.color !== false &&
    !opts.json &&
    !("NO_COLOR" in process.env) &&
    ((process.stdout.isTTY ?? false) || forceColor);
  return {
    cwd: canonicalDir(resolve(opts.cwd ?? process.cwd())),
    configPath: opts.config,
    json: opts.json,
    quiet: opts.quiet,
    color: createColors(colorEnabled),
    interactive: (process.stdin.isTTY ?? false) && (process.stdout.isTTY ?? false) && !opts.json,
    cache: opts.cache !== false && process.env.ARCHLOCK_NO_CACHE !== "1",
    out: (t) => io.stdout(t.endsWith("\n") ? t : `${t}\n`),
    err: (t) => io.stderr(t.endsWith("\n") ? t : `${t}\n`),
  };
}

/** An expected failure: printed without a stack trace, exits with `code`. */
export class CliError extends Error {
  constructor(
    message: string,
    readonly code = 2,
  ) {
    super(message);
  }
}

/**
 * Resolves symlinks (e.g. macOS /var → /private/var) so paths reported by the TypeScript
 * resolver, which are real paths, line up with the repository root.
 */
function canonicalDir(dir: string): string {
  return existsSync(dir) ? realpathSync.native(dir) : dir;
}
