import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ignore, { type Ignore } from "ignore";
import { globMatcher } from "./paths.js";

/** Never scanned, regardless of configuration. */
export const ALWAYS_EXCLUDE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.archlock-cache/**",
  "**/__pycache__/**",
  "**/.venv/**",
  "**/venv/**",
  "**/*.d.ts",
  "**/*.d.mts",
  "**/*.d.cts",
  // Sketches are Python syntax but never Python sources.
  "**/*.arch.py",
];

/** Single-file components (Vue, Svelte, Astro); their scripts are TypeScript or JavaScript. */
const COMPONENT_EXTENSIONS = [".vue", ".svelte", ".astro"];
export const TS_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ...COMPONENT_EXTENSIONS,
];
export const PY_EXTENSIONS = [".py"];
export const GO_EXTENSIONS = [".go"];
export const RS_EXTENSIONS = [".rs"];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".hg",
  ".svn",
  "__pycache__",
  ".archlock-cache",
  ".venv",
  "venv",
]);

interface IgnoreLayer {
  /** POSIX directory relative to the root ("" for the root). */
  dir: string;
  ig: Ignore;
}

function loadGitignore(absDir: string, dir: string): IgnoreLayer | null {
  const file = join(absDir, ".gitignore");
  if (!existsSync(file)) return null;
  return { dir, ig: ignore().add(readFileSync(file, "utf8")) };
}

function ignored(layers: IgnoreLayer[], path: string, isDir: boolean): boolean {
  for (const layer of layers) {
    const rel = layer.dir === "" ? path : path.slice(layer.dir.length + 1);
    if (rel === "") continue;
    if (layer.ig.ignores(isDir ? `${rel}/` : rel)) return true;
  }
  return false;
}

export interface ListOptions {
  include: string[];
  exclude: string[];
  extensions: string[];
}

/**
 * Lists source files under `root` as sorted repo-relative POSIX paths. Respects `.gitignore`
 * files, skips dependency and VCS directories, then applies include/exclude globs.
 */
export function listSourceFiles(root: string, options: ListOptions): string[] {
  const include = globMatcher(options.include);
  const exclude = globMatcher([...ALWAYS_EXCLUDE, ...options.exclude]);
  const out: string[] = [];

  const walk = (absDir: string, dir: string, layers: IgnoreLayer[]) => {
    const own = loadGitignore(absDir, dir);
    const active = own ? [...layers, own] : layers;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const path = dir === "" ? entry.name : `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        if (ignored(active, path, true)) continue;
        walk(join(absDir, entry.name), path, active);
      } else if (entry.isFile()) {
        if (!options.extensions.some((ext) => entry.name.endsWith(ext))) continue;
        if (ignored(active, path, false)) continue;
        if (!include(path) || exclude(path)) continue;
        out.push(path);
      }
    }
  };
  walk(root, "", []);
  return out.sort();
}

/** Counts non-blank lines; used for the compression ratio. */
export function countLines(text: string): number {
  let n = 0;
  for (const line of text.split("\n")) if (line.trim() !== "") n++;
  return n;
}
