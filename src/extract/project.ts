/**
 * Language-neutral assembly: file facts + module specs → modules with public APIs,
 * dependency edges, external packages and deep imports.
 */

import { posix } from "node:path";
import { toSketchName } from "../core/canonical.js";
import type { ArchSymbol, ReExport } from "../core/model.js";
import { compareNames } from "../core/model.js";
import { globBase, globMatcher } from "../fs/paths.js";
import { ANONYMOUS_DEFAULT, type FileFacts } from "./facts.js";
import type { Resolution, Resolver } from "./resolution.js";

export interface ModuleSpec {
  name: string;
  paths: string[];
  entry: string | null;
}

export interface ImportSite {
  file: string;
  line: number;
  column: number;
}

export interface CodeModule {
  name: string;
  spec: ModuleSpec;
  files: string[];
  /** The entry file actually used (exists in the code), or null. */
  entry: string | null;
  lines: number;
  symbols: ArchSymbol[];
  reexports: ReExport[];
  /** Target module → import sites (sorted by file, line). */
  deps: Map<string, ImportSite[]>;
  /** External package → import sites. */
  externals: Map<string, ImportSite[]>;
  /** `file#local` keys of the declarations that make up the public API. */
  publicKeys: Set<string>;
}

export interface DeepImport {
  from: string;
  to: string;
  /** The imported name (`*` for a namespace import). */
  name: string;
  /** The file that defines the imported symbol (or is imported as a namespace). */
  target: string;
  site: ImportSite;
}

export interface CodeProject {
  files: Map<string, FileFacts>;
  modules: Map<string, CodeModule>;
  unassigned: string[];
  deepImports: DeepImport[];
  totalLines: number;
}

const ENTRY_NAMES = [
  "index.ts",
  "index.tsx",
  "index.mts",
  "index.cts",
  "index.js",
  "index.jsx",
  "index.mjs",
  "index.cjs",
  "__init__.py",
  "lib.rs",
  "main.rs",
  "mod.rs",
];

/**
 * A file's path inside its module as an identifier prefix: `src/ui/button/button.svelte` in
 * `src/**` → `ui_button_button`. For a Go package it is the package directory: `ui_button`.
 */
function filePrefix(spec: ModuleSpec, file: string, packageDir: boolean): string {
  let base = "";
  for (const p of spec.paths) {
    if (p.startsWith("!") || !globMatcher([p])(file)) continue;
    const b = globBase(p);
    if (b.length > base.length) base = b;
  }
  const target = packageDir ? posix.dirname(file) : file.replace(/\.[^./]+$/, "");
  let rel = base === "" ? target : target === base ? "" : target.slice(base.length + 1);
  if (rel === "" || rel === ".") rel = posix.basename(base) || "root";
  return toSketchName(rel.replace(/\//g, "_"));
}

/**
 * Default entry candidates: `index.*`, `__init__.py`, `lib.rs`, `main.rs` or `mod.rs` in the
 * module root or its `src/`; a module whose first path is a Rust file (`src/parser.rs`) has
 * that file as its entry.
 */
export function defaultEntryCandidates(spec: ModuleSpec): string[] {
  const base = spec.paths.find((p) => !p.startsWith("!"));
  if (base === undefined) return [];
  if (base.endsWith(".rs") && globBase(base) === base) return [base];
  const root = globBase(base);
  const dirs = [root, root === "" ? "src" : `${root}/src`];
  return dirs.flatMap((d) => ENTRY_NAMES.map((n) => (d === "" ? n : `${d}/${n}`)));
}

/** Assigns each path to the module whose matching glob is most specific. */
export class Ownership {
  private readonly matchers: {
    name: string;
    patterns: { base: number; match: (p: string) => boolean }[];
    exclude: (p: string) => boolean;
  }[];
  private readonly memo = new Map<string, string | null>();

  constructor(specs: ModuleSpec[]) {
    this.matchers = [...specs]
      .sort((a, b) => compareNames(a.name, b.name))
      .map((s) => ({
        name: s.name,
        patterns: s.paths
          .filter((p) => !p.startsWith("!"))
          .map((p) => ({ base: globBase(p).length, match: globMatcher([p]) })),
        exclude: globMatcher(s.paths.filter((p) => p.startsWith("!")).map((p) => p.slice(1))),
      }));
  }

  owner(path: string): string | null {
    const hit = this.memo.get(path);
    if (hit !== undefined) return hit;
    let best: { name: string; score: number } | null = null;
    for (const m of this.matchers) {
      if (m.exclude(path)) continue;
      for (const p of m.patterns) {
        if (p.match(path) && (best === null || p.base > best.score))
          best = { name: m.name, score: p.base };
      }
    }
    const result = best?.name ?? null;
    this.memo.set(path, result);
    return result;
  }
}

type Def =
  | { kind: "decl"; file: string; local: string }
  | { kind: "namespace"; file: string }
  | { kind: "module"; module: string };

export function buildProject(
  facts: FileFacts[],
  specs: ModuleSpec[],
  resolverFor: (file: FileFacts) => Resolver,
): CodeProject {
  const files = new Map(facts.map((f) => [f.path, f]));
  const ownership = new Ownership(specs);
  const resolutions = new Map<string, Resolution>();

  const resolveSpecifier = (file: string, specifier: string): Resolution => {
    const key = `${file}\0${specifier}`;
    let r = resolutions.get(key);
    if (!r) {
      const f = files.get(file);
      r = f ? resolverFor(f).resolve(specifier, file) : { kind: "unresolved" };
      resolutions.set(key, r);
    }
    return r;
  };

  const resolveExport = (file: string, name: string, seen = new Set<string>()): Def | null => {
    const key = `${file}#${name}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const f = files.get(file);
    if (!f) return null;
    const entry = f.exports.get(name);
    if (entry) {
      if (entry.kind === "local") {
        const binding = f.bindings.get(entry.local);
        if (binding && !f.declarations.has(entry.local)) {
          return follow(file, binding.specifier, binding.name, seen, binding.submodule === true);
        }
        if (f.declarations.has(entry.local)) return { kind: "decl", file, local: entry.local };
        // Python: a name listed in __all__ may come from `from x import *`.
      } else {
        return follow(file, entry.specifier, entry.name, seen);
      }
    }
    if (name !== "default") {
      for (const star of f.stars) {
        const r = resolveSpecifier(file, star);
        if (r.kind !== "file") continue;
        const def = resolveExport(r.path, name, seen);
        if (def) return def;
      }
    }
    return null;
  };

  /** Python `from pkg import name`: the submodule `pkg.name`, if it is a scanned file. */
  const submoduleFile = (file: string, specifier: string, name: string): string | null => {
    const spec = specifier.endsWith(".") ? `${specifier}${name}` : `${specifier}.${name}`;
    const r = resolveSpecifier(file, spec);
    if (r.kind !== "file" || !files.has(r.path)) return null;
    // Only an exact match counts (the resolver also returns the longest existing prefix).
    return r.path.endsWith(`/${name}.py`) || r.path.endsWith(`/${name}/__init__.py`)
      ? r.path
      : null;
  };

  const follow = (
    file: string,
    specifier: string,
    name: string,
    seen: Set<string>,
    submodule = false,
  ): Def | null => {
    if (submodule) {
      const sub = submoduleFile(file, specifier, name);
      if (sub) return { kind: "namespace", file: sub };
    }
    const r = resolveSpecifier(file, specifier);
    if (r.kind === "module") return { kind: "module", module: r.module };
    if (r.kind !== "file") return null;
    if (!files.has(r.path)) {
      const owner = ownership.owner(r.path);
      return owner ? { kind: "module", module: owner } : null;
    }
    if (name === "*") return { kind: "namespace", file: r.path };
    return resolveExport(r.path, name, seen);
  };

  const exportedNames = (file: string, seen = new Set<string>()): Set<string> => {
    const out = new Set<string>();
    if (seen.has(file)) return out;
    seen.add(file);
    const f = files.get(file);
    if (!f) return out;
    for (const name of f.exports.keys()) out.add(name);
    // Python: with __all__, the listed names are the whole API (stars only supply them).
    if (f.explicitExports) return out;
    for (const star of f.stars) {
      const r = resolveSpecifier(file, star);
      if (r.kind !== "file") continue;
      for (const n of exportedNames(r.path, seen)) if (n !== "default") out.add(n);
    }
    return out;
  };

  const defOwner = (def: Def): string | null =>
    def.kind === "module" ? def.module : ownership.owner(def.file);

  // Assign files.
  const modules = new Map<string, CodeModule>();
  for (const spec of specs) {
    modules.set(spec.name, {
      name: spec.name,
      spec,
      files: [],
      entry: null,
      lines: 0,
      symbols: [],
      reexports: [],
      deps: new Map(),
      externals: new Map(),
      publicKeys: new Set(),
    });
  }
  const unassigned: string[] = [];
  let totalLines = 0;
  for (const f of [...facts].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))) {
    totalLines += f.lines;
    const owner = ownership.owner(f.path);
    const mod = owner ? modules.get(owner) : undefined;
    if (!mod) {
      unassigned.push(f.path);
      continue;
    }
    mod.files.push(f.path);
    mod.lines += f.lines;
  }

  // Public APIs.
  for (const mod of modules.values()) {
    const fileSet = new Set(mod.files);
    const explicit = mod.spec.entry;
    if (explicit !== null) mod.entry = fileSet.has(explicit) ? explicit : null;
    else {
      // An entry that exports nothing (e.g. an empty __init__.py) does not define the API.
      const exportsSomething = (c: string) => {
        const f = files.get(c);
        return f !== undefined && (f.exports.size > 0 || f.stars.length > 0);
      };
      mod.entry =
        defaultEntryCandidates(mod.spec).find((c) => fileSet.has(c) && exportsSomething(c)) ?? null;
    }

    const symbols = new Map<string, ArchSymbol>();
    const reexports = new Map<string, Set<string>>();
    const addSymbol = (exportName: string, def: Def & { kind: "decl" | "namespace" }) => {
      const name = exportName === "default" ? "default" : toSketchName(exportName);
      if (def.kind === "namespace") {
        mod.publicKeys.add(`${def.file}#*`);
        const key = `const:${name}`;
        if (!symbols.has(key)) {
          symbols.set(key, {
            kind: "const",
            name,
            type: "namespace",
            soft: { leading: [], trailing: null, docstring: null, body: [] },
          });
        }
        return;
      }
      mod.publicKeys.add(`${def.file}#${def.local}`);
      const decls = files.get(def.file)?.declarations.get(def.local) ?? [];
      for (const decl of decls) {
        const key = `${decl.kind}:${name}`;
        if (symbols.has(key)) continue;
        const copy = structuredClone(decl);
        copy.name = name;
        symbols.set(key, copy);
      }
    };
    const addReexport = (exportName: string, module: string) => {
      const set = reexports.get(module) ?? new Set();
      set.add(toSketchName(exportName));
      reexports.set(module, set);
    };

    if (mod.entry !== null) {
      const names = [...exportedNames(mod.entry)].sort(compareNames);
      for (const name of names) {
        const def = resolveExport(mod.entry, name);
        if (!def) continue;
        const owner = defOwner(def);
        if (owner === mod.name && def.kind !== "module") addSymbol(name, def);
        else if (owner !== null && owner !== mod.name) addReexport(name, owner);
      }
    } else {
      const found: { file: string; name: string; def: Def & { kind: "decl" } }[] = [];
      for (const file of mod.files) {
        const f = files.get(file) as FileFacts;
        const names = [...f.exports.keys()].sort(compareNames);
        for (const name of names) {
          const def = resolveExport(file, name);
          if (!def) continue;
          const owner = defOwner(def);
          if (owner !== null && owner !== mod.name) {
            addReexport(name, owner);
            continue;
          }
          if (def.kind !== "decl" || def.file !== file) continue;
          // Without an entry, several files may have a default export: name it after the
          // declaration (or the file) instead.
          const exportName =
            name === "default"
              ? def.local !== ANONYMOUS_DEFAULT
                ? def.local
                : posix.basename(file).replace(/\.[^.]+$/, "")
              : name;
          found.push({ file, name: toSketchName(exportName), def });
        }
      }
      // A name defined in several files is qualified with each file's path in the module. In
      // Go and Java the unit is the package (directory): files of one Go package that define
      // the same name are build variants (`open_linux.go`, `open_windows.go`), and the first one
      // wins.
      // Go and Java packages are directories.
      const inPackageDir = (file: string) => {
        const language = files.get(file)?.language;
        return language === "go" || language === "java";
      };
      const unitOf = (file: string) => (inPackageDir(file) ? `${posix.dirname(file)}/` : file);
      const unitsOf = new Map<string, Set<string>>();
      for (const { file, name } of found) {
        const set = unitsOf.get(name) ?? new Set();
        set.add(unitOf(file));
        unitsOf.set(name, set);
      }
      for (const { file, name, def } of found) {
        const shared = (unitsOf.get(name) as Set<string>).size > 1;
        addSymbol(
          shared ? `${filePrefix(mod.spec, file, inPackageDir(file))}__${name}` : name,
          def,
        );
      }
    }
    mod.symbols = [...symbols.values()];
    mod.reexports = [...reexports.entries()]
      .sort(([a], [b]) => compareNames(a, b))
      .map(([from, names]) => ({
        from: `.${from}`,
        names: [...names].sort(compareNames),
        leading: [],
      }));
  }

  // Whether every name `file` exports is part of `mod`'s public API (e.g. the entry has
  // `export * from "./errors"`): then importing the whole file reaches nothing private.
  const allPublic = (file: string, mod: CodeModule): boolean => {
    const names = [...exportedNames(file)];
    return (
      names.length > 0 &&
      names.every((name) => {
        const def = resolveExport(file, name);
        return def?.kind === "decl" && mod.publicKeys.has(`${def.file}#${def.local}`);
      })
    );
  };

  // Dependencies and deep imports.
  const deepImports: DeepImport[] = [];
  for (const mod of modules.values()) {
    for (const file of mod.files) {
      const f = files.get(file) as FileFacts;
      for (const imp of f.imports) {
        const site = { file, line: imp.line, column: imp.column };
        let r = resolveSpecifier(file, imp.specifier);
        let names = imp.names;
        const sub = imp.submodule ? submoduleFile(file, imp.specifier, imp.submodule) : null;
        if (sub) {
          r = { kind: "file", path: sub };
          names = ["*"];
        }
        if (r.kind === "external") {
          push(mod.externals, r.package, site);
          continue;
        }
        const target =
          r.kind === "module" ? r.module : r.kind === "file" ? ownership.owner(r.path) : null;
        if (target === null || target === mod.name || !modules.has(target)) continue;
        push(mod.deps, target, site);
        if (r.kind !== "file" || !files.has(r.path)) continue;
        const targetMod = modules.get(target) as CodeModule;
        const targetFile = r.path;
        // A file the entry re-exports as a namespace (`export * as util from "./util"`) is
        // public as a whole, so importing it or a name from it directly is not a deep import.
        const publicNamespace = targetMod.publicKeys.has(`${targetFile}#*`);
        for (const name of names) {
          if (name === "*") {
            if (
              targetMod.entry !== null &&
              targetFile !== targetMod.entry &&
              !publicNamespace &&
              !allPublic(targetFile, targetMod)
            ) {
              deepImports.push({ from: mod.name, to: target, name, target: targetFile, site });
            }
            continue;
          }
          if (publicNamespace) continue;
          const def = resolveExport(targetFile, name);
          if (def?.kind !== "decl") continue;
          if (ownership.owner(def.file) !== target) continue;
          if (!targetMod.publicKeys.has(`${def.file}#${def.local}`)) {
            deepImports.push({ from: mod.name, to: target, name, target: def.file, site });
          }
        }
      }
    }
  }

  return { files, modules, unassigned, deepImports, totalLines };
}

function push(map: Map<string, ImportSite[]>, key: string, site: ImportSite): void {
  const list = map.get(key);
  if (list) list.push(site);
  else map.set(key, [site]);
}
