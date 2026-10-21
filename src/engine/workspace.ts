/**
 * The deterministic core as functions: used by the CLI, the MCP server and `push`.
 * No network, no LLM, no clock: same repository state, same result.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type ArchlockConfig,
  CONFIG_FILE,
  type LoadedConfig,
  loadConfig,
} from "../config/config.js";
import { abbreviateSymbols } from "../core/abbreviate.js";
import {
  type CodeProject,
  extractProject,
  type ModuleSpec,
  sourceExtensions,
} from "../extract/index.js";
import { ArchlockCache } from "../fs/cache.js";
import { countLines } from "../fs/files.js";
import { type BaseRef, changedLines, resolveBase, withWorktree } from "../git/git.js";
import { type LoadedSketch, loadSketches, type SketchSet } from "../sketch/load.js";
import type { SketchError } from "../sketch/parse.js";
import { compare, type Violation } from "./compare.js";
import { type ArchChange, type ArchState, diffArchitecture } from "./diff.js";
import { moduleFromCode } from "./fromcode.js";

export class NotInitializedError extends Error {}

export interface Workspace {
  root: string;
  configFile: string;
  config: ArchlockConfig;
  sketches: SketchSet;
  cache: ArchlockCache;
}

export interface OpenOptions {
  configPath?: string;
  /** Use the file-hash cache (default true). */
  cache?: boolean;
}

export async function openWorkspace(cwd: string, options: OpenOptions = {}): Promise<Workspace> {
  const { configPath } = options;
  // Throws ConfigError for an invalid config file.
  const loaded: LoadedConfig | null = loadConfig(cwd, configPath);
  if (!loaded) {
    throw new NotInitializedError(
      `not set up here: no archlock.config.json in ${cwd} or its parent directories. Run \`archlock init\` first.`,
    );
  }
  const cache = new ArchlockCache(loaded.root, options.cache ?? true);
  const sketches = await loadSketches(loaded.root, loaded.config.sketchDir, cache);
  if (sketches.missing) {
    throw new NotInitializedError(
      `the sketch directory "${loaded.config.sketchDir}/" does not exist. Run \`archlock init\` to create it, or fix "sketchDir" in ${loaded.file}.`,
    );
  }
  // Sketches are abbreviated like the code (copies: the parse cache keeps the originals).
  const max = loaded.config.maxTypeLength;
  if (max !== null) {
    sketches.sketches = sketches.sketches.map((s) => ({
      ...s,
      module: { ...s.module, symbols: abbreviateSymbols(s.module.symbols, max) },
    }));
  }
  return { root: loaded.root, configFile: loaded.file, config: loaded.config, sketches, cache };
}

export function specsFromSketches(sketches: LoadedSketch[]): ModuleSpec[] {
  return sketches.map((s) => ({
    name: s.module.name,
    paths: s.module.paths,
    entry: s.module.entry,
  }));
}

export interface CheckResult {
  violations: Violation[];
  project: CodeProject;
  sketches: LoadedSketch[];
  sketchErrors: SketchError[];
}

export async function checkWorkspace(ws: Workspace): Promise<CheckResult> {
  const specs = specsFromSketches(ws.sketches.sketches);
  const { project } = await extractProject(ws.root, ws.config, specs, ws.cache);
  ws.cache.save();
  const violations = compare({
    sketches: ws.sketches.sketches,
    sketchErrors: ws.sketches.errors,
    brokenModules: ws.sketches.broken,
    project,
    rules: ws.config.rules,
  });
  return { violations, project, sketches: ws.sketches.sketches, sketchErrors: ws.sketches.errors };
}

/** The architecture as the code defines it (what `accept` would write), plus externals. */
export async function architectureOf(
  root: string,
  config: ArchlockConfig,
  specs: ModuleSpec[],
  cache?: ArchlockCache,
): Promise<{ state: ArchState; project: CodeProject }> {
  const { project } = await extractProject(root, config, specs, cache);
  const modules = specs
    .map((s) => project.modules.get(s.name))
    .filter((m): m is NonNullable<typeof m> => m !== undefined)
    .map(moduleFromCode);
  const externals = new Map(
    [...project.modules.values()].map((m) => [m.name, [...m.externals.keys()].sort()]),
  );
  return { state: { modules, externals }, project };
}

export interface DiffResult {
  base: BaseRef;
  changes: ArchChange[];
  codeLinesChanged: number;
}

/** Compares the architecture of the working tree with a base commit (`archlock diff`). */
export async function diffWorkspace(ws: Workspace, baseRef?: string): Promise<DiffResult> {
  const base = resolveBase(ws.root, baseRef);
  const headSpecs = specsFromSketches(ws.sketches.sketches);
  const head = await architectureOf(ws.root, ws.config, headSpecs, ws.cache);
  ws.cache.save();

  const baseState = await withWorktree(ws.root, base.sha, async (dir) => {
    let config = ws.config;
    let specs = headSpecs;
    if (existsSync(join(dir, CONFIG_FILE))) {
      try {
        const baseWs = await openWorkspace(dir, { cache: false });
        config = baseWs.config;
        if (baseWs.sketches.sketches.length > 0)
          specs = specsFromSketches(baseWs.sketches.sketches);
      } catch {
        // An unreadable base setup: compare with the head's module definitions instead.
      }
    }
    return (await architectureOf(dir, config, specs)).state;
  });

  const declared = new Map(ws.sketches.sketches.map((s) => [s.module.name, s.module.dependsOn]));
  const changes = diffArchitecture(baseState, head.state, declared);

  const isSource = (file: string) =>
    head.project.files.has(file) ||
    (sourceExtensions(ws.config).some((e) => file.endsWith(e)) && !file.endsWith(".arch.py"));
  let codeLinesChanged = 0;
  for (const [file, n] of changedLines(ws.root, base.sha)) {
    if (!isSource(file)) continue;
    if (n >= 0) codeLinesChanged += n;
    else {
      try {
        codeLinesChanged += countLines(readFileSync(join(ws.root, file), "utf8"));
      } catch {
        // unreadable untracked file: ignore
      }
    }
  }
  return { base, changes, codeLinesChanged };
}
