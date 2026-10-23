/**
 * The crate pass: turns the raw Rust facts of all files into what the project builder needs.
 *
 * It builds each crate's module tree from its root files and `mod` declarations, resolves `use`
 * and inline paths (`crate::`, `self::`, `super::`, own modules, workspace crates, dependencies)
 * to files, computes each file's exports (`pub` items, `pub use` re-exports, the items of
 * `pub mod` children as `child__item`), and attaches `impl` blocks to their types. Paths become
 * `file:<path>` (a file of the repository) or `crate:<package>` (an external crate) specifiers.
 */

import { existsSync } from "node:fs";
import { join, posix } from "node:path";
import { canonicalType } from "../../core/canonical.js";
import { type ArchSymbol, compareNames } from "../../core/model.js";
import type { ExportEntry, FileFacts, ImportFact, RustPath } from "../facts.js";
import type { Resolution, Resolver } from "../resolution.js";
import type { RustCrate } from "./cargo.js";

const BUILTIN_CRATES = new Set(["std", "core", "alloc", "proc_macro", "test"]);

/** Resolves the specifiers the crate pass writes. */
export const rustResolver: Resolver = {
  resolve(specifier: string): Resolution {
    if (specifier.startsWith("file:")) return { kind: "file", path: specifier.slice(5) };
    if (specifier.startsWith("crate:")) return { kind: "external", package: specifier.slice(6) };
    return { kind: "unresolved" };
  },
};

interface ModuleInfo {
  crate: RustCrate;
  /** The root file of the target (library or binary) whose module tree contains the file. */
  root: string;
  path: string[];
}

type Resolved =
  | { kind: "file"; file: string; rest: string[] }
  | { kind: "external"; package: string }
  | { kind: "builtin" };

export function linkRustCrates(
  root: string,
  facts: FileFacts[],
  crates: RustCrate[],
  owner: (file: string) => string | null,
): void {
  const byPath = new Map<string, FileFacts>();
  for (const f of facts) {
    if (f.language !== "rust" || !f.rust) continue;
    f.declarations = new Map([...f.declarations].map(([k, v]) => [k, structuredClone(v)]));
    byPath.set(f.path, f);
  }
  if (byPath.size === 0) return;
  const exists = (file: string) => byPath.has(file) || existsSync(join(root, file));

  // Module trees, one per target root file.
  const info = new Map<string, ModuleInfo>();
  const moduleFile = new Map<string, string>();
  const children = new Map<string, Map<string, string>>();
  /** Module key → its visibility, for path resolution. */
  const visibility = new Map<string, "pub" | "crate" | "private">();
  const key = (rootFile: string, path: string[]) => `${rootFile}\0${path.join("::")}`;
  for (const crate of crates) {
    for (const rootFile of [crate.libRoot, ...crate.binRoots]) {
      if (!rootFile || !exists(rootFile)) continue;
      const queue: { file: string; path: string[] }[] = [{ file: rootFile, path: [] }];
      while (queue.length > 0) {
        const { file, path } = queue.shift() as { file: string; path: string[] };
        if (moduleFile.has(key(rootFile, path))) continue;
        moduleFile.set(key(rootFile, path), file);
        if (!info.has(file)) info.set(file, { crate, root: rootFile, path });
        const isDirOwner = path.length === 0 || posix.basename(file) === "mod.rs";
        const dir = isDirOwner ? posix.dirname(file) : file.replace(/\.rs$/, "");
        for (const m of byPath.get(file)?.rust?.mods ?? []) {
          const candidates = m.path
            ? [posix.normalize(posix.join(posix.dirname(file), m.path))]
            : [`${dir}/${m.name}.rs`, `${dir}/${m.name}/mod.rs`];
          const child = candidates.find((c) => exists(c));
          if (!child) continue;
          const map = children.get(file) ?? new Map<string, string>();
          map.set(m.name, child);
          children.set(file, map);
          const k = key(rootFile, [...path, m.name]);
          if (!visibility.has(k)) {
            visibility.set(k, m.pub ? "pub" : m.restricted ? "crate" : "private");
          }
          queue.push({ file: child, path: [...path, m.name] });
        }
      }
    }
  }
  // Files no module tree reaches (e.g. behind a `cfg`): placed by the standard layout.
  for (const file of byPath.keys()) {
    if (info.has(file)) continue;
    const crate = [...crates]
      .filter((c) => file.startsWith(c.dir === "" ? "src/" : `${c.dir}/src/`))
      .sort((a, b) => b.dir.length - a.dir.length)[0];
    const rootFile = crate?.libRoot ?? crate?.binRoots[0];
    if (!crate || !rootFile) continue;
    const rel = file.slice(crate.dir === "" ? 4 : crate.dir.length + 5).replace(/\.rs$/, "");
    const path = rel.split("/").filter((p) => p !== "mod" && p !== "lib" && p !== "main");
    info.set(file, { crate, root: rootFile, path });
  }

  const byLibName = new Map<string, RustCrate>();
  for (const c of crates) if (c.libRoot && !byLibName.has(c.libName)) byLibName.set(c.libName, c);

  const resolve = (file: string, segments: string[], inline: boolean): Resolved | null => {
    const at = info.get(file);
    const first = segments[0];
    if (!at || first === undefined) return null;
    let rootFile = at.root;
    let path: string[];
    let i = 1;
    if (first === "crate") path = [];
    else if (first === "self") path = [...at.path];
    else if (first === "super") {
      path = [...at.path];
      i = 0;
      while (segments[i] === "super") {
        path.pop();
        i++;
      }
    } else if (moduleFile.has(key(rootFile, [...at.path, first]))) {
      path = [...at.path];
      i = 0;
    } else if (BUILTIN_CRATES.has(first)) return { kind: "builtin" };
    else {
      const dep = at.crate.deps.get(first);
      const local =
        byLibName.get(first) ??
        (dep?.path !== null && dep?.path !== undefined
          ? crates.find((c) => c.dir === dep.path)
          : undefined);
      if (local?.libRoot) {
        rootFile = local.libRoot;
        path = [];
      } else if (dep) return { kind: "external", package: dep.package };
      else return inline ? null : { kind: "external", package: first };
    }
    // Only visible modules are entered: from another crate (or a binary of the same package)
    // public ones; inside the crate also `pub(crate)` ones and private ones declared in the
    // current module or one of its ancestors. `axum::serve` is the re-exported function, not
    // the private module `serve`.
    const outside = rootFile !== at.root;
    while (i < segments.length) {
      const k = key(rootFile, [...path, segments[i] as string]);
      const vis = visibility.get(k);
      const ancestor = path.length <= at.path.length && path.every((p, j) => at.path[j] === p);
      const visible = vis === "pub" || (!outside && (vis === "crate" || ancestor));
      if (!moduleFile.has(k) || !visible) break;
      path.push(segments[i] as string);
      i++;
    }
    const target = moduleFile.get(key(rootFile, path));
    return target ? { kind: "file", file: target, rest: segments.slice(i) } : null;
  };

  // Exports, computed child-first; `pub mod` children of the same archlock module are inlined.
  const done = new Map<string, Map<string, ExportEntry>>();
  const stars = new Map<string, string[]>();
  const exportsOf = (file: string): Map<string, ExportEntry> => {
    const known = done.get(file);
    if (known) return known;
    const f = byPath.get(file);
    const out = new Map(f?.exports ?? []);
    done.set(file, out);
    const fileStars: string[] = [];
    stars.set(file, fileStars);
    if (!f?.rust) return out;
    const namespace = (name: string, child: string) => {
      if (owner(child) !== owner(file)) {
        out.set(name, { kind: "reexport", specifier: `file:${child}`, name: "*" });
        return;
      }
      for (const n of [...exportedNames(child)].sort(compareNames)) {
        if (!out.has(`${name}__${n}`)) {
          out.set(`${name}__${n}`, { kind: "reexport", specifier: `file:${child}`, name: n });
        }
      }
    };
    for (const p of f.rust.paths) {
      if (!p.pub) continue;
      const r = resolve(file, p.segments, false);
      if (r?.kind !== "file") continue;
      if (p.glob) {
        if (r.rest.length === 0) fileStars.push(`file:${r.file}`);
      } else if (r.rest.length === 0) {
        namespace(p.alias ?? (p.segments[p.segments.length - 1] as string), r.file);
      } else {
        out.set(p.alias ?? (r.rest[r.rest.length - 1] as string), {
          kind: "reexport",
          specifier: `file:${r.file}`,
          name: r.rest.join("__"),
        });
      }
    }
    for (const m of f.rust.mods) {
      const child = children.get(file)?.get(m.name);
      if (m.pub && child) namespace(m.name, child);
    }
    return out;
  };
  const exportedNames = (file: string, seen = new Set<string>()): Set<string> => {
    const names = new Set(exportsOf(file).keys());
    if (seen.has(file)) return names;
    seen.add(file);
    for (const s of stars.get(file) ?? []) {
      for (const n of exportedNames(s.slice(5), seen)) names.add(n);
    }
    return names;
  };

  const files = [...byPath.keys()].sort();
  for (const file of files) exportsOf(file);
  // `#[macro_export]` macros are items of the crate root.
  for (const file of files) {
    const at = info.get(file);
    const rootExports = at ? done.get(at.root) : undefined;
    for (const name of byPath.get(file)?.rust?.macros ?? []) {
      if (at && file !== at.root && rootExports && !rootExports.has(name)) {
        rootExports.set(name, { kind: "reexport", specifier: `file:${file}`, name });
      }
    }
  }

  // Imports: `use` leaves, inline paths and `pub mod` children.
  for (const file of files) {
    const f = byPath.get(file) as FileFacts;
    const rust = f.rust;
    if (!rust) continue;
    const imports: ImportFact[] = [];
    const add = (p: Pick<RustPath, "line" | "column">, specifier: string, names: string[]) =>
      imports.push({ specifier, names, line: p.line, column: p.column, typeOnly: false });
    for (const p of rust.paths) {
      const r = resolve(file, p.segments, p.inline);
      if (!r || r.kind === "builtin") continue;
      if (r.kind === "external") add(p, `crate:${r.package}`, ["*"]);
      else add(p, `file:${r.file}`, p.glob || r.rest.length === 0 ? ["*"] : [r.rest.join("__")]);
    }
    for (const m of rust.mods) {
      const child = children.get(file)?.get(m.name);
      if (m.pub && child) add(m, `file:${child}`, ["*"]);
    }
    f.imports = imports;
    // A binary cannot be depended on, so its module tree has no public API.
    const at = info.get(file);
    const inBinary = at !== undefined && at.root !== at.crate.libRoot;
    f.exports = inBinary ? new Map() : (done.get(file) ?? f.exports);
    f.stars = inBinary ? [] : (stars.get(file) ?? []);
  }

  // `impl` blocks: methods and implemented traits go to their type.
  const findType = (file: string, segments: string[]): ArchSymbol | null => {
    const lookup = (f: string, name: string) => byPath.get(f)?.declarations.get(name)?.[0] ?? null;
    if (segments.length === 1) {
      const name = segments[0] as string;
      const local = lookup(file, name);
      if (local) return local;
      const use = byPath
        .get(file)
        ?.rust?.paths.find(
          (p) => !p.inline && !p.glob && (p.alias ?? p.segments[p.segments.length - 1]) === name,
        );
      if (!use) return null;
      const r = resolve(file, use.segments, false);
      return r?.kind === "file" && r.rest.length > 0 ? lookup(r.file, r.rest.join("__")) : null;
    }
    const r = resolve(file, segments, false);
    return r?.kind === "file" && r.rest.length > 0 ? lookup(r.file, r.rest.join("__")) : null;
  };
  const touched = new Set<ArchSymbol>();
  for (const file of files) {
    for (const impl of byPath.get(file)?.rust?.impls ?? []) {
      const target = findType(file, impl.type);
      if (!target || (target.kind !== "class" && target.kind !== "enum")) continue;
      touched.add(target);
      if (impl.trait) {
        if (!target.bases.includes(impl.trait)) target.bases.push(impl.trait);
        continue;
      }
      if (target.kind === "class") {
        for (const m of [...impl.consts, ...impl.methods]) {
          if (!target.members.some((x) => x.name === m.name))
            target.members.push(structuredClone(m));
        }
      } else if (target.kind === "enum") {
        const methods = target.methods ?? [];
        for (const m of impl.methods) {
          if (!methods.some((x) => x.name === m.name)) methods.push(structuredClone(m));
        }
        if (methods.length > 0) target.methods = methods;
      }
    }
  }
  // Derived and implemented traits in a stable order, wherever the `impl` blocks are.
  for (const f of byPath.values()) {
    for (const [, symbols] of f.declarations) {
      for (const s of symbols) {
        if ((s.kind === "class" || s.kind === "enum") && (touched.has(s) || s.bases.length > 1)) {
          s.bases = [...new Set(s.bases.map((b) => canonicalType(b)))].sort(compareNames);
        }
      }
    }
  }
}
