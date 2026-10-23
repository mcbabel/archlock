/**
 * Cargo manifests: the crates of a repository, their root files and their dependencies. Reads the
 * subset of TOML that Cargo.toml files use for this (tables, strings, arrays, inline tables).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { globMatcher } from "../../fs/paths.js";

export interface RustDependency {
  /** The crate's package name on crates.io (after `package = "…"` renames). */
  package: string;
  /** A path dependency, repo-relative. */
  path: string | null;
}

export interface RustCrate {
  /** Repo-relative directory of Cargo.toml ("" for the root). */
  dir: string;
  packageName: string;
  /** The name code uses for the library (`my-crate` → `my_crate`, or `[lib] name`). */
  libName: string;
  /** Root file of the library target, if any. */
  libRoot: string | null;
  /** Root files of the binary targets. */
  binRoots: string[];
  /** Name used in code → dependency. */
  deps: Map<string, RustDependency>;
}

type TomlValue = string | boolean | number | TomlValue[] | { [key: string]: TomlValue };
type TomlTable = { [key: string]: TomlValue };

/** Parses the TOML subset of Cargo manifests; unknown syntax is skipped, never fatal. */
export function parseToml(text: string): TomlTable {
  const root: TomlTable = {};
  let table = root;
  let i = 0;
  const n = text.length;
  const ws = () => {
    while (i < n && /[ \t]/.test(text[i] as string)) i++;
  };
  const skipBlank = () => {
    for (;;) {
      while (i < n && /\s/.test(text[i] as string)) i++;
      if (text[i] === "#") while (i < n && text[i] !== "\n") i++;
      else return;
    }
  };
  const key = (): string[] => {
    const parts: string[] = [];
    for (;;) {
      ws();
      const ch = text[i];
      if (ch === '"' || ch === "'") parts.push(str());
      else {
        const m = /^[A-Za-z0-9_-]+/.exec(text.slice(i));
        if (!m) break;
        parts.push(m[0]);
        i += m[0].length;
      }
      ws();
      if (text[i] !== ".") break;
      i++;
    }
    return parts;
  };
  const str = (): string => {
    const q = text[i] as string;
    const triple = text.startsWith(q.repeat(3), i);
    const end = triple ? q.repeat(3) : q;
    i += end.length;
    let out = "";
    while (i < n && !text.startsWith(end, i)) {
      if (q === '"' && text[i] === "\\") {
        out += text[i + 1] ?? "";
        i += 2;
      } else out += text[i++];
    }
    i += end.length;
    return out;
  };
  const value = (): TomlValue => {
    skipBlank();
    const ch = text[i];
    if (ch === '"' || ch === "'") return str();
    if (ch === "[") {
      i++;
      const arr: TomlValue[] = [];
      for (;;) {
        skipBlank();
        if (text[i] === "]" || i >= n) {
          i++;
          return arr;
        }
        arr.push(value());
        skipBlank();
        if (text[i] === ",") i++;
      }
    }
    if (ch === "{") {
      i++;
      const t: TomlTable = {};
      for (;;) {
        skipBlank();
        if (text[i] === "}" || i >= n) {
          i++;
          return t;
        }
        const k = key();
        ws();
        if (text[i] === "=") i++;
        set(t, k, value());
        skipBlank();
        if (text[i] === ",") i++;
      }
    }
    const m = /^[^\s,\]}#]+/.exec(text.slice(i));
    i += m ? m[0].length : 1;
    const raw = m?.[0] ?? "";
    return raw === "true" ? true : raw === "false" ? false : raw;
  };
  const set = (t: TomlTable, path: string[], v: TomlValue) => {
    let cur = t;
    path.forEach((p, idx) => {
      if (idx === path.length - 1) cur[p] = v;
      else {
        if (typeof cur[p] !== "object" || Array.isArray(cur[p])) cur[p] = {};
        cur = cur[p] as TomlTable;
      }
    });
  };
  const tableAt = (path: string[], arrayOfTables: boolean): TomlTable => {
    let cur = root;
    path.forEach((p, idx) => {
      const last = idx === path.length - 1;
      if (last && arrayOfTables) {
        const list = Array.isArray(cur[p]) ? (cur[p] as TomlValue[]) : [];
        const t: TomlTable = {};
        list.push(t);
        cur[p] = list;
        cur = t;
      } else {
        const existing = cur[p];
        if (Array.isArray(existing)) cur = existing[existing.length - 1] as TomlTable;
        else {
          if (typeof existing !== "object") cur[p] = {};
          cur = cur[p] as TomlTable;
        }
      }
    });
    return cur;
  };
  while (i < n) {
    skipBlank();
    if (i >= n) break;
    if (text[i] === "[") {
      const arrayOfTables = text[i + 1] === "[";
      i += arrayOfTables ? 2 : 1;
      const path = key();
      while (i < n && text[i] !== "\n") i++;
      table = tableAt(path, arrayOfTables);
      continue;
    }
    const k = key();
    ws();
    if (k.length === 0 || text[i] !== "=") {
      while (i < n && text[i] !== "\n") i++;
      continue;
    }
    i++;
    set(table, k, value());
  }
  return root;
}

const SKIP = new Set(["target", "node_modules", "vendor", ".git"]);
/** Directories whose manifests are tests, examples, benchmarks or fuzz targets. */
const NOT_CRATES = /(^|\/)(tests?|testdata|fixtures|examples?|bench(es)?|fuzz)([-_][\w-]*)?(\/|$)/;

function table(v: TomlValue | undefined): TomlTable {
  return v !== undefined && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function strings(v: TomlValue | undefined): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function dependencies(manifest: TomlTable, dir: string): Map<string, RustDependency> {
  const deps = new Map<string, RustDependency>();
  const add = (t: TomlTable) => {
    for (const [name, spec] of Object.entries(t)) {
      const s = table(spec);
      const pkg = typeof s.package === "string" ? s.package : name;
      const path = typeof s.path === "string" ? posix.normalize(posix.join(dir, s.path)) : null;
      deps.set(name.replace(/-/g, "_"), { package: pkg, path: path === "." ? "" : path });
    }
  };
  for (const k of ["dependencies", "dev-dependencies", "build-dependencies"])
    add(table(manifest[k]));
  for (const target of Object.values(table(manifest.target))) {
    for (const k of ["dependencies", "dev-dependencies", "build-dependencies"]) {
      add(table(table(target)[k]));
    }
  }
  return deps;
}

/** The crates of the repository (packages with a library or binary target), sorted by dir. */
export function readCargoCrates(root: string): RustCrate[] {
  const manifests: { dir: string; toml: TomlTable }[] = [];
  const walk = (abs: string, rel: string, depth: number) => {
    if (depth > 8) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.isFile() && e.name === "Cargo.toml")) {
      try {
        manifests.push({
          dir: rel,
          toml: parseToml(readFileSync(join(abs, "Cargo.toml"), "utf8")),
        });
      } catch {
        // An unreadable manifest is not a crate.
      }
    }
    for (const e of entries) {
      if (!e.isDirectory() || SKIP.has(e.name) || e.name.startsWith(".")) continue;
      walk(join(abs, e.name), rel === "" ? e.name : `${rel}/${e.name}`, depth + 1);
    }
  };
  walk(root, "", 0);

  // Directories a workspace excludes are not crates of the project.
  const excluded: ((dir: string) => boolean)[] = [];
  for (const m of manifests) {
    const ws = table(m.toml.workspace);
    const prefix = m.dir === "" ? "" : `${m.dir}/`;
    const globs = strings(ws.exclude).map((g) => `${prefix}${g.replace(/\/$/, "")}`);
    if (globs.length > 0) excluded.push(globMatcher(globs));
  }

  const crates: RustCrate[] = [];
  for (const m of manifests) {
    const pkg = table(m.toml.package);
    if (typeof pkg.name !== "string") continue;
    if (NOT_CRATES.test(m.dir) || excluded.some((isExcluded) => isExcluded(m.dir))) continue;
    const prefix = m.dir === "" ? "" : `${m.dir}/`;
    const exists = (f: string) => existsSync(join(root, f));
    const lib = table(m.toml.lib);
    const libPath =
      typeof lib.path === "string"
        ? posix.normalize(`${prefix}${lib.path}`)
        : `${prefix}src/lib.rs`;
    const binRoots = new Set<string>();
    if (exists(`${prefix}src/main.rs`)) binRoots.add(`${prefix}src/main.rs`);
    const bins = m.toml.bin;
    for (const b of Array.isArray(bins) ? bins : []) {
      const p = table(b).path;
      if (typeof p === "string" && exists(`${prefix}${p}`))
        binRoots.add(posix.normalize(`${prefix}${p}`));
    }
    try {
      for (const e of readdirSync(join(root, `${prefix}src/bin`), { withFileTypes: true })) {
        const f =
          e.isFile() && e.name.endsWith(".rs")
            ? `${prefix}src/bin/${e.name}`
            : `${prefix}src/bin/${e.name}/main.rs`;
        if (exists(f)) binRoots.add(f);
      }
    } catch {
      // No src/bin directory.
    }
    const libRoot = exists(libPath) ? libPath : null;
    if (!libRoot && binRoots.size === 0) continue;
    crates.push({
      dir: m.dir,
      packageName: pkg.name,
      libName: (typeof lib.name === "string" ? lib.name : pkg.name).replace(/-/g, "_"),
      libRoot,
      binRoots: [...binRoots].sort(),
      deps: dependencies(m.toml, m.dir),
    });
  }
  return crates.sort((a, b) => (a.dir < b.dir ? -1 : a.dir > b.dir ? 1 : 0));
}
