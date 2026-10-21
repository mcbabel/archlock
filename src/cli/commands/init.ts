import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import type { Command } from "commander";
import { agentsSection, withAgentsSection } from "../../agents/instructions.js";
import { runAgent } from "../../agents/push.js";
import { guardSuggestions, readAll, summariesPrompt } from "../../agents/summaries.js";
import {
  type ArchlockConfig,
  CONFIG_FILE,
  defaultConfig,
  loadConfig,
  serializeConfig,
} from "../../config/config.js";
import { moduleFromCode } from "../../engine/fromcode.js";
import { compressionRatio, sketchLineCount } from "../../engine/stats.js";
import { extractProject, type ModuleSpec } from "../../extract/index.js";
import { cacheDir } from "../../fs/cache.js";
import { relPosix } from "../../fs/paths.js";
import { detectLanguages, detectModules } from "../../init/detect.js";
import { compressionLine, plural } from "../../report/format.js";
import { jsonPayload } from "../../report/json.js";
import { SKETCH_SUFFIX, sketchPath } from "../../sketch/load.js";
import { renderSketch } from "../../sketch/render.js";
import { writeText } from "../../sketch/write.js";
import { CliError, type Context } from "../context.js";
import { chooseAgent, defaultCheckCommand } from "./push.js";
import { writeSketchReadme } from "./readme.js";

const CACHE_IGNORE = ".archlock-cache/";

/**
 * Without node_modules the cache lives in `.archlock-cache/`: make sure git ignores it.
 * Returns true when .gitignore was changed.
 */
function ignoreCacheDir(root: string): boolean {
  if (existsSync(join(root, "node_modules"))) return false;
  if (!existsSync(join(root, ".git")) && !existsSync(join(root, ".gitignore"))) return false;
  const file = join(root, ".gitignore");
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  const listed = current
    .split(/\r?\n/)
    .some((l) => l.trim().replace(/^\//, "").replace(/\/$/, "") === ".archlock-cache");
  if (listed) return false;
  const prefix = current === "" || current.endsWith("\n") ? "" : "\n";
  writeFileSync(file, `${current}${prefix}${CACHE_IGNORE}\n`);
  return true;
}

export interface InitOptions {
  yes?: boolean;
  force?: boolean;
  agents?: boolean;
  withSummaries?: boolean;
}

/** `--agents`: append the archlock section to AGENTS.md and CLAUDE.md (never rewriting them). */
function writeAgentFiles(root: string, sketchDir: string): string[] {
  const changed: string[] = [];
  for (const file of ["AGENTS.md", "CLAUDE.md"]) {
    const abs = join(root, file);
    const existing = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    const updated = withAgentsSection(existing, agentsSection(sketchDir));
    if (updated === null) continue;
    writeFileSync(abs, updated);
    changed.push(file);
  }
  return changed;
}

/** `--with-summaries`: let the agent add `# suggested:` comments; anything else is rolled back. */
async function suggestSummaries(
  ctx: Context,
  root: string,
  config: ArchlockConfig,
  files: string[],
): Promise<string[]> {
  const notes: string[] = [];
  const chosen = chooseAgent(config.agent, undefined, defaultCheckCommand(root));
  if (chosen === null) {
    notes.push(
      "--with-summaries: no coding agent found (claude, codex, opencode or agent.command); skipped.",
    );
    return notes;
  }
  const promptFile = relPosix(root, join(cacheDir(root), "init", "summaries.md"));
  writeText(root, promptFile, summariesPrompt(config.sketchDir, files));
  const before = readAll(root, files);
  const inv = chosen.invocation(promptFile);
  if (!ctx.json && !ctx.quiet)
    ctx.err(ctx.color.dim(`Asking ${chosen.name} for summaries: ${inv.display}`));
  await runAgent(inv, root, ctx.json || ctx.quiet ? "ignore" : "inherit");
  const outcomes = guardSuggestions(root, before);
  const added = outcomes.reduce((n, o) => n + o.added, 0);
  notes.push(
    `--with-summaries: ${chosen.name} suggested ${plural(added, "line")} (marked \`# suggested:\`; review them).`,
  );
  for (const o of outcomes.filter((x) => x.restored)) {
    notes.push(
      `--with-summaries: ${o.file} was restored because the agent changed more than suggestion lines.`,
    );
  }
  return notes;
}

const STRATEGY_LABEL = {
  workspaces: "workspace packages",
  "python-package": "subpackages of the Python package",
  src: "subdirectories of src/",
  "top-level": "top-level directories",
} as const;

export async function runInitCommand(ctx: Context, opts: InitOptions): Promise<number> {
  const root = ctx.cwd;
  const config = defaultConfig();
  // `--force` starts over but keeps the rule severities and agent settings of a valid config.
  if (opts.force && existsSync(join(root, CONFIG_FILE))) {
    try {
      const previous = loadConfig(root, CONFIG_FILE)?.config;
      if (previous) {
        config.rules = previous.rules;
        config.agent = previous.agent;
      }
    } catch {
      // An invalid config is replaced.
    }
  }
  if (existsSync(join(root, CONFIG_FILE)) && !opts.force) {
    throw new CliError(
      `archlock is already set up here (${CONFIG_FILE} exists). Use \`archlock accept\` to update the sketches from the code, or \`archlock init --force\` to start over (this overwrites the sketches and loses your comments).`,
    );
  }
  const sketchDirAbs = join(root, config.sketchDir);
  if (
    !opts.force &&
    existsSync(sketchDirAbs) &&
    readdirSync(sketchDirAbs).some((f) => f.endsWith(SKETCH_SUFFIX))
  ) {
    throw new CliError(
      `${config.sketchDir}/ already contains sketches. Use \`archlock init --force\` to overwrite them.`,
    );
  }

  const languages = detectLanguages(root);
  const detection = detectModules(root, languages);
  let specs: ModuleSpec[] = detection.modules;
  if (specs.length === 0) {
    throw new CliError(
      `no source files found in ${root}. archlock looks for TypeScript, JavaScript and Python files outside node_modules, dist and test folders. Run it in your project root (or pass --cwd).`,
    );
  }

  // Prompts need a terminal with a known width (some CI shells report a TTY of width 0).
  const promptable = ctx.interactive && (process.stdout.columns ?? 0) >= 40;
  if (promptable && !opts.yes) {
    const chosen = await confirmModules(ctx, specs, detection.strategy);
    if (chosen === null) {
      ctx.err("archlock init: cancelled, nothing was written.");
      return 1;
    }
    specs = chosen;
  }

  config.languages = languages;
  config.include = detection.include;
  // The code decides the entries (an empty __init__.py is not one); sketches then name them.
  const { project } = await extractProject(
    root,
    config,
    specs.map((s) => ({ ...s, entry: null })),
  );
  const written: { file: string; text: string }[] = [];
  const archModules = [];
  for (const spec of specs) {
    const code = project.modules.get(spec.name);
    if (!code) continue;
    const mod = moduleFromCode(code);
    mod.entry = code.entry;
    archModules.push(mod);
    written.push({ file: sketchPath(config.sketchDir, spec.name), text: renderSketch(mod) });
  }
  writeText(root, CONFIG_FILE, serializeConfig(config));
  for (const w of written) writeText(root, w.file, w.text);
  const { file: readme } = writeSketchReadme(
    root,
    config.sketchDir,
    archModules,
    written.map((w) => w.text),
    project.totalLines,
  );
  const ignored = ignoreCacheDir(root);
  const agentFiles = opts.agents ? writeAgentFiles(root, config.sketchDir) : [];
  const summaryNotes = opts.withSummaries
    ? await suggestSummaries(
        ctx,
        root,
        config,
        written.map((w) => w.file),
      )
    : [];

  const sketchLines = sketchLineCount(written.map((w) => w.text));
  const codeLines = project.totalLines;
  const symbols = [...project.modules.values()].reduce((n, m) => n + m.symbols.length, 0);
  const edges = [...project.modules.values()].reduce((n, m) => n + m.deps.size, 0);

  if (ctx.json) {
    ctx.out(
      jsonPayload("init", {
        languages,
        strategy: detection.strategy,
        modules: specs.map((s) => ({
          ...s,
          symbols: project.modules.get(s.name)?.symbols.length ?? 0,
        })),
        files: [CONFIG_FILE, ...written.map((w) => w.file), readme, ...agentFiles],
        notes: summaryNotes,
        stats: {
          codeLines,
          sketchLines,
          ratio: compressionRatio(codeLines, sketchLines),
          symbols,
          edges,
        },
        unassigned: project.unassigned,
      }),
    );
    return 0;
  }
  if (ctx.quiet) return 0;
  const c = ctx.color;
  const lines: string[] = [];
  lines.push(`Found ${plural(specs.length, "module")} (${STRATEGY_LABEL[detection.strategy]}):`);
  const width = Math.max(...specs.map((s) => s.name.length));
  for (const s of specs) {
    const m = project.modules.get(s.name);
    lines.push(
      `  ${c.bold(s.name.padEnd(width))}  ${c.cyan(s.paths.join(", "))}  ${c.dim(`${plural(m?.symbols.length ?? 0, "public symbol")}, ${plural(m?.deps.size ?? 0, "dependency", "dependencies")}`)}`,
    );
  }
  lines.push("");
  lines.push(
    `Wrote ${CONFIG_FILE}, ${plural(written.length, "sketch", "sketches")} and README.md in ${config.sketchDir}/`,
  );
  if (ignored) lines.push(c.dim(`Added ${CACHE_IGNORE} to .gitignore (archlock's cache).`));
  if (agentFiles.length > 0) {
    lines.push(`Added archlock instructions for coding agents to ${agentFiles.join(" and ")}.`);
  }
  for (const note of summaryNotes) lines.push(note);
  lines.push("");
  lines.push(`  ${c.bold(compressionLine(codeLines, sketchLines))}`);
  lines.push("");
  if (project.unassigned.length > 0) {
    lines.push(
      c.yellow(
        `${plural(project.unassigned.length, "file")} belong to no module; \`archlock check\` lists them.`,
      ),
    );
    lines.push("");
  }
  lines.push("Next steps:");
  lines.push(
    `  1. Read the sketches in ${config.sketchDir}/ and add docstrings and \`# invariant:\` comments.`,
  );
  lines.push(`  2. Commit ${config.sketchDir}/ and ${CONFIG_FILE}.`);
  lines.push("  3. Run `archlock check` in CI so architecture changes are always deliberate.");
  ctx.out(lines.join("\n"));
  return 0;
}

async function confirmModules(
  ctx: Context,
  specs: ModuleSpec[],
  strategy: keyof typeof STRATEGY_LABEL,
): Promise<ModuleSpec[] | null> {
  p.intro("archlock init");
  p.note(
    specs
      .map(
        (s) =>
          `${s.name.padEnd(Math.max(...specs.map((x) => x.name.length)))}  ${ctx.color.dim(s.paths.join(", "))}`,
      )
      .join("\n"),
    `Detected modules (${STRATEGY_LABEL[strategy]})`,
  );
  const action = await p.select({
    message: "Create sketches for these modules?",
    options: [
      { value: "yes", label: "Yes, all of them" },
      { value: "pick", label: "Let me choose" },
      { value: "cancel", label: "Cancel" },
    ],
  });
  if (p.isCancel(action) || action === "cancel") return null;
  if (action === "yes") return specs;
  const picked = await p.multiselect({
    message:
      "Which modules should archlock track? (files of unselected modules show up as unassigned)",
    options: specs.map((s) => ({ value: s.name, label: s.name, hint: s.paths.join(", ") })),
    initialValues: specs.map((s) => s.name),
    required: true,
  });
  if (p.isCancel(picked)) return null;
  return specs.filter((s) => (picked as string[]).includes(s.name));
}

export function registerInit(
  program: Command,
  context: () => Context,
  setExit: (code: number) => void,
): void {
  program
    .command("init")
    .description("detect modules and write archlock.config.json plus one sketch per module")
    .option("-y, --yes", "do not ask for confirmation")
    .option("--force", "overwrite an existing setup (loses comments in existing sketches)")
    .option("--agents", "add instructions for coding agents to AGENTS.md and CLAUDE.md")
    .option(
      "--with-summaries",
      "let your coding agent suggest docstrings and invariants (as # suggested: comments)",
    )
    .action(async (opts: InitOptions) => {
      setExit(await runInitCommand(context(), opts));
    });
}
