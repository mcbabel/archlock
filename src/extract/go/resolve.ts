/**
 * Go import resolution. Import paths under the module path of a `go.mod` in the repository
 * (including local `replace` targets) resolve to a file of that package's directory; paths whose
 * first element has no dot are the standard library; everything else is an external module,
 * named by the longest matching `require` of the repository's `go.mod` files.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { relPosix } from "../../fs/paths.js";
import type { Resolution, Resolver } from "../resolution.js";

const SKIP = new Set(["node_modules", "vendor", "testdata"]);

interface GoModule {
  /** Module path, e.g. `github.com/acme/shop`. */
  path: string;
  /** Repo-relative directory ("" for the root). */
  dir: string;
}

export interface GoModFacts {
  modules: GoModule[];
  requires: string[];
}

/** Parses the `module`, `require` and `replace` directives of a go.mod file. */
export function parseGoMod(text: string): {
  module: string | null;
  requires: string[];
  replaces: { from: string; to: string }[];
} {
  let module: string | null = null;
  const requires: string[] = [];
  const replaces: { from: string; to: string }[] = [];
  let block: string | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\/\/.*$/, "").trim();
    if (line === "") continue;
    if (block !== null) {
      if (line === ")") block = null;
      else directive(block, line);
      continue;
    }
    const m = /^(module|require|replace)\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, keyword, rest] = m as unknown as [string, string, string];
    if (rest === "(") block = keyword;
    else directive(keyword, rest);
  }
  return { module, requires, replaces };

  function directive(keyword: string, rest: string): void {
    const words = rest.split(/\s+/).map((w) => w.replace(/^"|"$/g, ""));
    if (keyword === "module" && words[0]) module = words[0];
    else if (keyword === "require" && words[0]) requires.push(words[0]);
    else if (keyword === "replace") {
      const arrow = words.indexOf("=>");
      const from = words[0];
      const to = arrow >= 0 ? words[arrow + 1] : undefined;
      if (from && to && (to.startsWith("./") || to.startsWith("../"))) replaces.push({ from, to });
    }
  }
}

/** All go.mod files of the repository (outside vendor/, testdata/ and hidden directories). */
export function readGoMods(root: string): GoModFacts {
  const modules: GoModule[] = [];
  const requires = new Set<string>();
  const walk = (abs: string, rel: string, depth: number) => {
    if (depth > 8) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.isFile() && e.name === "go.mod")) {
      const mod = parseGoMod(readFileSync(join(abs, "go.mod"), "utf8"));
      if (mod.module) modules.push({ path: mod.module, dir: rel });
      for (const r of mod.requires) requires.add(r);
      for (const r of mod.replaces) {
        const dir = posix.normalize(posix.join(rel, r.to));
        if (!dir.startsWith("..")) modules.push({ path: r.from, dir: dir === "." ? "" : dir });
      }
    }
    for (const e of entries) {
      if (!e.isDirectory() || SKIP.has(e.name) || /^[._]/.test(e.name)) continue;
      walk(join(abs, e.name), rel === "" ? e.name : `${rel}/${e.name}`, depth + 1);
    }
  };
  walk(root, "", 0);
  const byLength = (a: string, b: string) => b.length - a.length || (a < b ? -1 : 1);
  return {
    modules: modules.sort((a, b) => byLength(a.path, b.path)),
    requires: [...requires].sort(byLength),
  };
}

/** An external module's name when no `require` matches: `github.com/o/r/pkg` → `github.com/o/r`. */
function guessModule(importPath: string): string {
  const parts = importPath.split("/");
  const host = parts[0] ?? "";
  const segments =
    /^(github\.com|gitlab\.com|bitbucket\.org|golang\.org|go\.googlesource\.com)$/.test(host)
      ? 3
      : host === "gopkg.in"
        ? 2
        : parts.length;
  return parts.slice(0, segments).join("/");
}

export class GoResolver implements Resolver {
  private readonly memo = new Map<string, Resolution>();
  private readonly dirFile = new Map<string, string>();

  constructor(
    private readonly root: string,
    private readonly mods: GoModFacts,
    files: string[],
  ) {
    for (const f of [...files].sort()) {
      if (!f.endsWith(".go")) continue;
      const dir = posix.dirname(f) === "." ? "" : posix.dirname(f);
      const current = this.dirFile.get(dir);
      if (current === undefined || (current.endsWith("_test.go") && !f.endsWith("_test.go"))) {
        this.dirFile.set(dir, f);
      }
    }
  }

  resolve(specifier: string): Resolution {
    const hit = this.memo.get(specifier);
    if (hit) return hit;
    const r = this.resolveUncached(specifier);
    this.memo.set(specifier, r);
    return r;
  }

  private resolveUncached(specifier: string): Resolution {
    if (specifier === "C") return { kind: "builtin" };
    for (const m of this.mods.modules) {
      if (specifier !== m.path && !specifier.startsWith(`${m.path}/`)) continue;
      const rest = specifier.slice(m.path.length + 1);
      const dir = [m.dir, rest].filter(Boolean).join("/");
      const file = this.dirFile.get(dir) ?? this.firstGoFile(dir);
      return file ? { kind: "file", path: file } : { kind: "unresolved" };
    }
    if (!(specifier.split("/")[0] ?? "").includes(".")) return { kind: "builtin" };
    const required = this.mods.requires.find(
      (r) => specifier === r || specifier.startsWith(`${r}/`),
    );
    return { kind: "external", package: required ?? guessModule(specifier) };
  }

  /** A package directory that was not scanned (e.g. excluded): any of its Go files. */
  private firstGoFile(dir: string): string | null {
    const abs = join(this.root, dir);
    try {
      const names = readdirSync(abs)
        .filter((n) => n.endsWith(".go") && !n.endsWith("_test.go"))
        .sort();
      const first = names[0];
      return first && statSync(join(abs, first)).isFile()
        ? relPosix(this.root, join(abs, first))
        : null;
    } catch {
      return null;
    }
  }
}
