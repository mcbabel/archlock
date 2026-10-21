/**
 * Import resolution for TypeScript/JavaScript, using `ts.resolveModuleName` with the nearest
 * `tsconfig.json` (including `extends`, `paths`, `baseUrl` and solution-style `references`).
 */

import { existsSync } from "node:fs";
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
      const pkg = packageName(specifier);
      const workspaceModule = this.workspacePackages.get(pkg);
      if (workspaceModule) return { kind: "module", module: workspaceModule };
      if (resolved) return { kind: "external", package: pkg };
      // An unresolvable `paths` alias is a broken internal import, not an external package.
      const aliased = project?.pathPatterns.some((p) => matchesPathPattern(p, specifier)) ?? false;
      return aliased ? { kind: "unresolved" } : { kind: "external", package: pkg };
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
