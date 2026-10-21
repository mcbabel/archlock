/**
 * Python import resolution: relative imports, and absolute imports against the package roots
 * of the repository (flat layout, `src/` layout, and every directory with a pyproject.toml,
 * setup.py or setup.cfg).
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import type { Resolution, Resolver } from "../resolution.js";
import { PYTHON_STDLIB } from "./stdlib.js";

const SKIP = new Set(["node_modules", ".git", ".venv", "venv", "__pycache__", "dist", "build"]);

/** Directories that may contain top-level packages ("" is the repository root). */
export function pythonRoots(root: string): string[] {
  const roots = new Set<string>(["", "src"]);
  const walk = (abs: string, rel: string, depth: number) => {
    if (depth > 3) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    if (
      entries.some(
        (e) => e.isFile() && ["pyproject.toml", "setup.py", "setup.cfg"].includes(e.name),
      )
    ) {
      roots.add(rel);
      roots.add(rel === "" ? "src" : `${rel}/src`);
    }
    for (const e of entries) {
      if (e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith(".")) {
        walk(join(abs, e.name), rel === "" ? e.name : `${rel}/${e.name}`, depth + 1);
      }
    }
  };
  walk(root, "", 0);
  return [...roots].sort((a, b) => b.length - a.length || (a < b ? -1 : 1));
}

export class PythonResolver implements Resolver {
  private readonly memo = new Map<string, Resolution>();

  constructor(
    private readonly root: string,
    private readonly files: Set<string>,
    private readonly roots: string[],
  ) {}

  private exists(path: string): boolean {
    if (this.files.has(path)) return true;
    try {
      return statSync(join(this.root, path)).isFile();
    } catch {
      return false;
    }
  }

  private isDir(path: string): boolean {
    try {
      return statSync(join(this.root, path)).isDirectory();
    } catch {
      return false;
    }
  }

  /** `a/b` → `a/b.py` or `a/b/__init__.py` if either exists. */
  private moduleFile(base: string): string | null {
    for (const candidate of [`${base}.py`, `${base}/__init__.py`]) {
      if (this.exists(candidate)) return candidate;
    }
    return null;
  }

  resolve(specifier: string, fromFile: string): Resolution {
    const key = `${posix.dirname(fromFile)}\0${specifier}`;
    const hit = this.memo.get(key);
    if (hit) return hit;
    const r = this.resolveUncached(specifier, fromFile);
    this.memo.set(key, r);
    return r;
  }

  private resolveUncached(specifier: string, fromFile: string): Resolution {
    const dots = /^\.*/.exec(specifier)?.[0].length ?? 0;
    const rest = specifier.slice(dots);
    const parts = rest === "" ? [] : rest.split(".");

    if (dots > 0) {
      let base = posix.dirname(fromFile);
      for (let i = 1; i < dots; i++) base = posix.dirname(base);
      if (base === ".") base = "";
      const join2 = (p: string[]) => [base, ...p].filter(Boolean).join("/");
      if (parts.length === 0) return { kind: "file", path: join2(["__init__.py"]) };
      const found = this.moduleFile(join2(parts));
      return { kind: "file", path: found ?? `${join2(parts)}.py` };
    }

    for (const r of this.roots) {
      // `import a.b.c` where c is an attribute: try the longest existing module prefix.
      for (let n = parts.length; n >= 1; n--) {
        const base = [r, ...parts.slice(0, n)].filter(Boolean).join("/");
        const found = this.moduleFile(base);
        if (found) return { kind: "file", path: found };
        if (n === parts.length && this.isDir(base) && existsSync(join(this.root, base))) {
          // Namespace package (no __init__.py): still owned by whatever module owns the folder.
          if (this.hasPythonFiles(base)) return { kind: "file", path: `${base}/__init__.py` };
        }
      }
    }
    const top = parts[0] ?? "";
    if (PYTHON_STDLIB.has(top)) return { kind: "builtin" };
    return top ? { kind: "external", package: top } : { kind: "unresolved" };
  }

  private hasPythonFiles(dir: string): boolean {
    const prefix = `${dir}/`;
    for (const f of this.files) if (f.startsWith(prefix)) return true;
    return false;
  }
}
