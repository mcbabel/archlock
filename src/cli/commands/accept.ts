import * as p from "@clack/prompts";
import type { Command } from "commander";
import { type LostComment, type MovedComment, mergeModule } from "../../core/merge.js";
import { compareNames } from "../../core/model.js";
import { moduleFromCode } from "../../engine/fromcode.js";
import { checkWorkspace, openWorkspace } from "../../engine/workspace.js";
import { plural } from "../../report/format.js";
import { jsonPayload } from "../../report/json.js";
import { unifiedDiff } from "../../report/textdiff.js";
import { memberShape, renderSketch, symbolShape } from "../../sketch/render.js";
import { writeText } from "../../sketch/write.js";
import { CliError, type Context } from "../context.js";
import { writeSketchReadme } from "./readme.js";

export interface AcceptOptions {
  yes?: boolean;
  depsOnly?: boolean;
  symbolsOnly?: boolean;
}

export async function runAcceptCommand(
  ctx: Context,
  modules: string[],
  opts: AcceptOptions,
): Promise<number> {
  if (opts.depsOnly && opts.symbolsOnly) {
    throw new CliError(
      "--deps-only and --symbols-only cannot be combined (omit both to accept everything)",
    );
  }
  const ws = await openWorkspace(ctx.cwd, { configPath: ctx.configPath, cache: ctx.cache });
  const known = ws.sketches.sketches.map((s) => s.module.name);
  for (const m of modules) {
    if (!known.includes(m)) {
      throw new CliError(`unknown module "${m}". Known modules: ${known.join(", ") || "(none)"}`);
    }
  }
  const selected = modules.length > 0 ? new Set(modules) : new Set(known);
  const brokenSelected = ws.sketches.errors.filter((e) =>
    modules.length === 0 ? true : modules.some((m) => e.file.endsWith(`/${m}.arch.py`)),
  );
  if (brokenSelected.length > 0) {
    const e = brokenSelected[0] as (typeof brokenSelected)[number];
    throw new CliError(
      `cannot accept while a sketch is invalid: ${e.file}:${e.line}:${e.column}: ${e.message}. Fix the sketch first (\`archlock check\` lists all problems).`,
    );
  }

  const result = await checkWorkspace(ws);
  const options = { deps: !opts.symbolsOnly, symbols: !opts.depsOnly };
  const changes: { module: string; file: string; before: string; after: string }[] = [];
  const lost: LostComment[] = [];
  const moved: MovedComment[] = [];
  const finalModules = [];
  const finalTexts: string[] = [];
  for (const sketch of result.sketches) {
    const code = result.project.modules.get(sketch.module.name);
    if (!selected.has(sketch.module.name) || !code) {
      finalModules.push(sketch.module);
      finalTexts.push(sketch.text);
      continue;
    }
    const externals = [...code.externals.keys()].sort(compareNames);
    const merged = mergeModule(sketch.module, moduleFromCode(code), externals, {
      ...options,
      shape: { symbol: symbolShape, member: memberShape },
    });
    const after = renderSketch(merged.module);
    lost.push(...merged.lost);
    moved.push(...merged.moved);
    finalModules.push(merged.module);
    finalTexts.push(after);
    if (after !== sketch.text)
      changes.push({ module: sketch.module.name, file: sketch.file, before: sketch.text, after });
  }

  const c = ctx.color;
  if (changes.length === 0) {
    // The generated README may still be stale (e.g. after editing docstrings by hand).
    const readme = writeSketchReadme(
      ws.root,
      ws.config.sketchDir,
      finalModules,
      finalTexts,
      result.project.totalLines,
    );
    if (ctx.json)
      ctx.out(
        jsonPayload("accept", {
          changed: [],
          lostComments: [],
          movedComments: [],
          readme: readme.changed,
        }),
      );
    else if (!ctx.quiet) {
      ctx.out(`${c.green("✔")} Nothing to accept: the sketches already describe the code.`);
      if (readme.changed) ctx.out(c.dim(`Updated ${readme.file}.`));
    }
    return 0;
  }

  if (!ctx.json && !ctx.quiet) {
    for (const ch of changes) ctx.out(unifiedDiff(ch.before, ch.after, ch.file, c));
    if (moved.length > 0) ctx.out(renderMoved(moved, ctx));
    if (lost.length > 0) ctx.out(renderLost(lost, ctx, false));
  }

  if (!opts.yes) {
    if (!ctx.interactive) {
      ctx.err(
        `archlock accept: ${plural(changes.length, "sketch", "sketches")} would change. Run \`archlock accept --yes\` to write them (no terminal to ask for confirmation).`,
      );
      return 1;
    }
    const ok = await p.confirm({
      message: `Write ${plural(changes.length, "sketch", "sketches")}?`,
    });
    if (p.isCancel(ok) || !ok) {
      ctx.err("archlock accept: cancelled, nothing was written.");
      return 1;
    }
  }

  for (const ch of changes) writeText(ws.root, ch.file, ch.after);
  writeSketchReadme(
    ws.root,
    ws.config.sketchDir,
    finalModules,
    finalTexts,
    result.project.totalLines,
  );

  if (ctx.json) {
    ctx.out(
      jsonPayload("accept", {
        changed: changes.map((ch) => ({ module: ch.module, file: ch.file })),
        lostComments: lost,
        movedComments: moved,
      }),
    );
    return 0;
  }
  if (!ctx.quiet) {
    ctx.out(`${c.green("✔")} Accepted changes in ${changes.map((ch) => ch.module).join(", ")}.`);
    if (lost.length > 0) ctx.out(renderLost(lost, ctx, true));
    ctx.out(c.dim("Review the diff and commit the sketches together with the code."));
  }
  return 0;
}

function renderMoved(moved: MovedComment[], ctx: Context): string {
  const c = ctx.color;
  return [
    c.dim("Comments that follow a renamed symbol (same shape, new name):"),
    ...moved.map((m) => c.dim(`  ${m.module}.${m.from} → ${m.module}.${m.to}`)),
  ].join("\n");
}

function renderLost(lost: LostComment[], ctx: Context, written: boolean): string {
  const c = ctx.color;
  const lines = [
    c.yellow(
      written
        ? `These comments belonged to symbols that no longer exist and were removed with them:`
        : `These comments belong to symbols that no longer exist and will be removed with them:`,
    ),
  ];
  for (const l of lost) {
    lines.push(`  ${c.bold(`${l.module}.${l.symbol}`)}`);
    for (const line of l.lines) lines.push(`    ${line.split("\n").join("\n    ")}`);
  }
  return lines.join("\n");
}

export function registerAccept(
  program: Command,
  context: () => Context,
  setExit: (code: number) => void,
): void {
  program
    .command("accept")
    .argument("[modules...]", "modules to accept (default: all)")
    .description(
      "code → sketch: adopt intended code changes into the sketches, keeping all comments",
    )
    .option("-y, --yes", "write without asking")
    .option("--deps-only", "only update __depends_on__ / __external__")
    .option("--symbols-only", "only update public symbols")
    .addHelpText(
      "after",
      '\n`accept` says: "this code change is intended". It rewrites the hard parts of the sketches\n(dependencies, symbols, signatures) from the code and keeps docstrings, comments and invariants.\nThe opposite direction is `archlock push` (sketch → code).',
    )
    .action(async (modules: string[], opts: AcceptOptions) => {
      setExit(await runAcceptCommand(context(), modules, opts));
    });
}
