/**
 * Import resolution for TypeScript/JavaScript, using `ts.resolveModuleName` with the nearest
 * `tsconfig.json` (including `extends`, `paths`, `baseUrl` and solution-style `references`).
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, join, resolve, sep } from "node:path";
import ts from "typescript";
import { globMatcher, relPosix, toPosix } from "../../fs/paths.js";
import type { Resolution } from "../resolution.js";

const BUILTINS = new Set(builtinModules);

interface ProjectConfig {
  dir: string;
  options: ts.CompilerOptions;
  cache: ts.ModuleResolutionCache;
  includes: (path: string) => boolean;
  pathPatterns: string[];
}

const DEFAULT_OPTIONS: ts.CompilerOptions = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowJs: true,
  resolveJsonModule: true,
};

/** The package name of a bare specifier: `@scope/pkg/x` → `@scope/pkg`, `pkg/x` → `pkg`. */
export function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] as string);
}

export function isBuiltin(specifier: string): boolean {
  return (
    specifier.startsWith("node:") || BUILTINS.has(specifier) || BUILTINS.has(packageName(specifier))
  );
}

const parseHost: ts.ParseConfigHost = {
  useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  // Never enumerate the project's files: archlock only needs the compiler options.
  readDirectory: () => [],
};

export class TypeScriptResolver {
  private readonly configByDir = new Map<string, ProjectConfig[] | null>();
  private readonly parsed = new Map<string, ProjectConfig | null>();
  private readonly memo = new Map<string, Resolution>();

  constructor(
    private readonly root: string,
    /** Workspace package name → module name (for monorepos without installed node_modules). */
    private readonly workspacePackages: Map<string, string> = new Map(),
  ) {}

  resolve(specifier: string, fromFile: string): Resolution {
    const fromAbs = join(this.root, fromFile);
    const key = `${dirname(fromFile)}\0${specifier}`;
    const hit = this.memo.get(key);
    if (hit) return hit;
    const result = this.resolveUncached(specifier, fromAbs);
    this.memo.set(key, result);
    return result;
  }

  private resolveUncached(specifier: string, fromAbs: string): Resolution {
    const relative = specifier.startsWith(".") || specifier.startsWith("/");
    if (!relative && isBuiltin(specifier)) return { kind: "builtin" };

    const project = this.projectFor(fromAbs);
    const options = project?.options ?? DEFAULT_OPTIONS;
    const result = ts.resolveModuleName(specifier, fromAbs, options, ts.sys, project?.cache);
    const resolved = result.resolvedModule?.resolvedFileName;
    if (resolved) {
      const abs = resolve(resolved);
      const inRepo = abs.startsWith(this.root + sep) && !abs.includes(`${sep}node_modules${sep}`);
      if (inRepo) return { kind: "file", path: relPosix(this.root, abs) };
    }

    if (!relative) {
      // Files TypeScript does not resolve itself (e.g. `@/components/Button.vue`).
      const aliased =
        (project && aliasTarget(specifier, project)) ??
        frameworkAlias(specifier, fromAbs, this.root);
      if (aliased) return { kind: "file", path: relPosix(this.root, aliased) };
      const pkg = packageName(specifier);
      const workspaceModule = this.workspacePackages.get(pkg);
      if (workspaceModule) return { kind: "module", module: workspaceModule };
      if (resolved) return { kind: "external", package: pkg };
      // An unresolvable alias is a broken internal import, not an external package.
      const alias = project?.pathPatterns.some((p) => matchesPathPattern(p, specifier)) ?? false;
      if (alias || /^(\$lib|~~|@@|~|@)(\/|$)/.test(specifier)) return { kind: "unresolved" };
      return { kind: "external", package: pkg };
    }

    // Relative import that TypeScript cannot resolve (e.g. `./styles.css`, a missing file):
    // keep the path so the import still counts as an edge to the module that owns it.
    const abs = resolve(dirname(fromAbs), specifier);
    if (abs.startsWith(this.root + sep)) return { kind: "file", path: relPosix(this.root, abs) };
    return { kind: "unresolved" };
  }

  private projectFor(fileAbs: string): ProjectConfig | null {
    const candidates = this.configsForDir(dirname(fileAbs));
    if (!candidates || candidates.length === 0) return null;
    const rel = (p: ProjectConfig) => toPosix(fileAbs.slice(p.dir.length + 1));
    return candidates.find((p) => p.includes(rel(p))) ?? (candidates[0] as ProjectConfig);
  }

  /** The nearest tsconfig.json (or the projects it references, for solution-style configs). */
  private configsForDir(dir: string): ProjectConfig[] | null {
    if (this.configByDir.has(dir)) return this.configByDir.get(dir) ?? null;
    let result: ProjectConfig[] | null = null;
    const file = join(dir, "tsconfig.json");
    if (existsSync(file)) {
      const main = this.parseConfig(file);
      result = [];
      if (main) {
        result.push(
          ...main.references
            .map((r) => this.parseConfig(r)?.project)
            .filter((p): p is ProjectConfig => !!p),
        );
        // The solution config itself is the fallback when no reference includes the file.
        result.push(main.project);
      }
    } else {
      const parent = dirname(dir);
      const atRoot = dir === this.root || !dir.startsWith(this.root);
      result = atRoot || parent === dir ? null : this.configsForDir(parent);
    }
    this.configByDir.set(dir, result);
    return result;
  }

  private parseConfig(file: string): { project: ProjectConfig; references: string[] } | null {
    if (this.parsed.has(file)) {
      const p = this.parsed.get(file);
      return p ? { project: p, references: [] } : null;
    }
    const read = ts.readConfigFile(file, ts.sys.readFile);
    if (read.error || !read.config) {
      this.parsed.set(file, null);
      return null;
    }
    const dir = dirname(file);
    const content = ts.parseJsonConfigFileContent(read.config, parseHost, dir, undefined, file);
    const options: ts.CompilerOptions = {
      ...content.options,
      allowJs: true,
      resolveJsonModule: true,
    };
    if (options.moduleResolution === undefined)
      options.moduleResolution = ts.ModuleResolutionKind.Bundler;
    if (options.module === undefined) options.module = ts.ModuleKind.ESNext;
    const raw = read.config as { include?: string[]; files?: string[] };
    const include =
      raw.files && raw.files.length === 0 && !raw.include
        ? []
        : (raw.include ?? ["**/*"]).map(normalizeInclude);
    const project: ProjectConfig = {
      dir,
      options,
      cache: ts.createModuleResolutionCache(dir, (f) => f, options),
      includes: globMatcher(include),
      pathPatterns: Object.keys(options.paths ?? {}),
    };
    this.parsed.set(file, project);
    const references = (content.projectReferences ?? []).map((r) => {
      const p = resolve(dir, r.path);
      return p.endsWith(".json") ? p : join(p, "tsconfig.json");
    });
    return { project, references };
  }
}

/** tsconfig `include` entries may be directories (`src`) or globs (`src/**\/*`). */
function normalizeInclude(pattern: string): string {
  const p = pattern.replace(/^\.\//, "");
  if (/[*?{]/.test(p)) return p;
  if (/\.[a-z]+$/i.test(p)) return p;
  return `${p.replace(/\/$/, "")}/**`;
}

function matchesPathPattern(pattern: string, specifier: string): boolean {
  const star = pattern.indexOf("*");
  if (star === -1) return pattern === specifier;
  return (
    specifier.startsWith(pattern.slice(0, star)) && specifier.endsWith(pattern.slice(star + 1))
  );
}

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

/** Applies tsconfig `paths` and returns the first target that exists. */
function aliasTarget(specifier: string, project: ProjectConfig): string | null {
  const paths = project.options.paths;
  if (!paths) return null;
  const base =
    project.options.baseUrl ??
    (project.options as { pathsBasePath?: string }).pathsBasePath ??
    project.dir;
  for (const [pattern, targets] of Object.entries(paths)) {
    const star = pattern.indexOf("*");
    let rest: string | null = null;
    if (star === -1) {
      if (pattern === specifier) rest = "";
    } else if (
      specifier.length >= pattern.length - 1 &&
      specifier.startsWith(pattern.slice(0, star)) &&
      specifier.endsWith(pattern.slice(star + 1))
    ) {
      rest = specifier.slice(star, specifier.length - (pattern.length - star - 1));
    }
    if (rest === null) continue;
    for (const target of targets) {
      const abs = resolve(base, target.replace("*", rest));
      if (isFile(abs)) return abs;
    }
  }
  return null;
}

/** The file a module specifier without extension can mean, or null. */
function firstFile(target: string): string | null {
  for (const candidate of [
    target,
    `${target}.ts`,
    `${target}.js`,
    join(target, "index.ts"),
    join(target, "index.js"),
  ]) {
    if (isFile(candidate)) return candidate;
  }
  return null;
}

const SVELTE_CONFIGS = ["svelte.config.js", "svelte.config.ts", "svelte.config.mjs"];
const NUXT_CONFIGS = ["nuxt.config.ts", "nuxt.config.js", "nuxt.config.mjs"];

/**
 * Aliases that frameworks declare in generated tsconfig files, which usually do not exist in a
 * fresh checkout: SvelteKit's `$lib` (`src/lib` next to `svelte.config.*`), and Nuxt's `~`/`@`
 * (the source directory: `srcDir` of the config, else `app/` if it exists, else the directory of
 * `nuxt.config.*`) and `~~`/`@@` (the directory of `nuxt.config.*`). Vite's `resolve.alias`
 * comes first.
 */
/** `srcDir: 'src/'` in a Nuxt config, read as text (the config is never run). */
/** The `srcDir` of a Nuxt config in `dir`, read as text; null without one. */
export function nuxtSrcDir(dir: string): string | null {
  for (const name of NUXT_CONFIGS) {
    try {
      const m = /\bsrcDir\s*:\s*['"`]([^'"`]+)['"`]/.exec(readFileSync(join(dir, name), "utf8"));
      if (m) return m[1] as string;
    } catch {
      // No config of this name.
    }
  }
  return null;
}

const VITE_CONFIGS = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"];
const viteAliasCache = new Map<string, [string, string][]>();

/**
 * Aliases of a Vite config, read as text: `alias: { '@': <dir> }` and
 * `alias: [{ find: '@', replacement: <dir> }]`, where `<dir>` is a string,
 * `fileURLToPath(new URL('./src', import.meta.url))` or `path.resolve(__dirname, 'src')`.
 */
export function viteAliases(dir: string): [string, string][] {
  const cached = viteAliasCache.get(dir);
  if (cached) return cached;
  const out: [string, string][] = [];
  for (const name of VITE_CONFIGS) {
    let text: string;
    try {
      text = readFileSync(join(dir, name), "utf8");
    } catch {
      continue;
    }
    const target = (expr: string): string | null => {
      const url = /new\s+URL\(\s*['"`]([^'"`]+)['"`]\s*,\s*import\.meta\.url\s*\)/.exec(expr);
      if (url) return url[1] as string;
      const res = /resolve\(\s*(?:__dirname|process\.cwd\(\))\s*,\s*['"`]([^'"`]+)['"`]/.exec(expr);
      if (res) return res[1] as string;
      const str = /^\s*['"`]([^'"`]+)['"`]\s*$/.exec(expr);
      return str && /^\.{0,2}\//.test(str[1] as string) ? (str[1] as string) : null;
    };
    const block = /\balias\s*:\s*([[{])/.exec(text);
    if (!block) break;
    // The alias block up to its matching bracket.
    let depth = 0;
    let end = block.index + block[0].length - 1;
    for (; end < text.length; end++) {
      const ch = text[end];
      if (ch === "{" || ch === "[" || ch === "(") depth++;
      else if (ch === "}" || ch === "]" || ch === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = text.slice(block.index + block[0].length, end);
    for (const m of body.matchAll(
      /find\s*:\s*['"`]([^'"`]+)['"`]\s*,\s*replacement\s*:\s*([^}]+)/g,
    )) {
      const t = target(m[2] as string);
      if (t) out.push([m[1] as string, t]);
    }
    for (const m of body.matchAll(
      /(?:^|[,{\s])['"`]?([@~#$][\w@~#$/-]*|[A-Za-z_][\w-]*)['"`]?\s*:\s*/g,
    )) {
      if (m[1] === "find" || m[1] === "replacement") continue;
      const t = target(valueAt(body, (m.index ?? 0) + m[0].length));
      if (t) out.push([m[1] as string, t]);
    }
    break;
  }
  out.sort((a, b) => b[0].length - a[0].length);
  viteAliasCache.set(dir, out);
  return out;
}

/** The expression starting at `start`, up to the next comma or brace outside brackets. */
function valueAt(text: string, start: number): string {
  let depth = 0;
  let end = start;
  for (; end < text.length; end++) {
    const ch = text[end];
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") {
      if (depth === 0) break;
      depth--;
    } else if (ch === "," && depth === 0) break;
  }
  return text.slice(start, end);
}

function frameworkAlias(specifier: string, fromAbs: string, root: string): string | null {
  for (let dir = dirname(fromAbs); dir.startsWith(root); dir = dirname(dir)) {
    for (const [key, target] of viteAliases(dir)) {
      if (specifier === key || specifier.startsWith(`${key}/`)) {
        const hit = firstFile(join(dir, target, specifier.slice(key.length)));
        if (hit) return hit;
      }
    }
    if (dir === root) break;
  }
  return frameworkDefaults(specifier, fromAbs, root);
}

function frameworkDefaults(specifier: string, fromAbs: string, root: string): string | null {
  const lib = /^\$lib(\/.*)?$/.exec(specifier);
  const nuxt = /^(~~|@@|~|@)(\/.*)?$/.exec(specifier);
  if (!lib && !nuxt) return null;
  for (let dir = dirname(fromAbs); dir.startsWith(root); dir = dirname(dir)) {
    const has = (names: string[]) => names.some((f) => existsSync(join(dir, f)));
    if (lib && has(SVELTE_CONFIGS)) return firstFile(join(dir, "src", "lib", lib[1] ?? ""));
    if (nuxt && has(NUXT_CONFIGS)) {
      const [, prefix, rest] = nuxt;
      const custom = nuxtSrcDir(dir);
      const srcDir =
        prefix === "~~" || prefix === "@@"
          ? dir
          : custom !== null
            ? join(dir, custom)
            : isDirectory(join(dir, "app"))
              ? join(dir, "app")
              : dir;
      return firstFile(join(srcDir, rest ?? ""));
    }
    if (dir === root) break;
  }
  return null;
}
