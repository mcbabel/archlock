import { Command, CommanderError } from "commander";
import pc from "picocolors";
import { ConfigError } from "../config/config.js";
import { VERSION } from "../core/version.js";
import { NotInitializedError } from "../engine/workspace.js";
import { registerAccept } from "./commands/accept.js";
import { registerCheck } from "./commands/check.js";
import { registerDiff } from "./commands/diff.js";
import { registerGraph } from "./commands/graph.js";
import { registerInit } from "./commands/init.js";
import { registerMcp } from "./commands/mcp.js";
import { registerPush } from "./commands/push.js";
import { registerStats } from "./commands/stats.js";
import { CliError, type Context, createContext } from "./context.js";

/** Options shared by every command. */
export interface GlobalOptions {
  cwd?: string;
  config?: string;
  json: boolean;
  color: boolean;
  quiet: boolean;
  cache: boolean;
}

export interface RunIO {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

const defaultIO: RunIO = {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
};

const HELP_FOOTER = `
The two directions:
  archlock accept   code → sketch   "This code change is intended, update the sketch."
  archlock push     sketch → code   "The sketch is the truth, let my agent change the code."
  archlock check only reports where the two disagree.

Docs: https://github.com/mcbabel/archlock`;

export function createProgram(
  io: RunIO = defaultIO,
  setExit: (code: number) => void = () => {},
): Command {
  const program = new Command();
  program
    .name("archlock")
    .description(
      "A lockfile for your architecture. You own the design, your agent writes the code.",
    )
    .version(VERSION, "-v, --version", "print the archlock version")
    .option("--cwd <dir>", "run as if archlock was started in <dir>")
    .option("--config <file>", "path to archlock.config.json")
    .option("--json", "machine-readable JSON output", false)
    .option("--no-color", "disable colored output")
    .option("--quiet", "only print errors", false)
    .option("--no-cache", "do not read or write the file-hash cache")
    .showHelpAfterError("(run `archlock --help` for usage)")
    .configureOutput({
      writeOut: io.stdout,
      writeErr: io.stderr,
      outputError: (text, write) => write(pc.red(text)),
    })
    .addHelpText("after", HELP_FOOTER)
    .exitOverride();

  const context = (): Context => createContext(program.opts<GlobalOptions>(), io);
  registerInit(program, context, setExit);
  registerCheck(program, context, setExit);
  registerAccept(program, context, setExit);
  registerDiff(program, context, setExit);
  registerPush(program, context, setExit);
  registerMcp(program, context);
  registerStats(program, context, setExit);
  registerGraph(program, context, setExit);
  for (const cmd of program.commands) cmd.exitOverride();
  return program;
}

/** Parses argv and runs the selected command. Returns the process exit code. */
export async function run(argv: string[], io: RunIO = defaultIO): Promise<number> {
  let exitCode = 0;
  const program = createProgram(io, (code) => {
    exitCode = code;
  });
  try {
    if (argv.length <= 2) {
      program.outputHelp();
      return 0;
    }
    await program.parseAsync(argv);
    return exitCode;
  } catch (error) {
    if (error instanceof CommanderError) {
      // --help and --version exit through commander with exitCode 0.
      return error.exitCode;
    }
    if (error instanceof CliError) {
      io.stderr(`${pc.red("archlock:")} ${error.message}\n`);
      return error.code;
    }
    if (error instanceof NotInitializedError) {
      io.stderr(`${pc.red("archlock:")} ${error.message}\n`);
      return 2;
    }
    if (error instanceof ConfigError) {
      io.stderr(`${pc.red("archlock:")} invalid config ${error.file}: ${error.message}\n`);
      return 2;
    }
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    io.stderr(
      `${pc.red("archlock: unexpected error.")} This is a bug; please report it at https://github.com/mcbabel/archlock/issues\n${message}\n`,
    );
    return 2;
  }
}
