/**
 * Java import resolution. The source roots come from the files themselves: a file
 * `src/main/java/com/acme/Order.java` with `package com.acme` has the root `src/main/java`, so
 * Maven, Gradle and other layouts work alike. A fully qualified name resolves to the file of its
 * outermost class (`com.acme.Order.Line` → `Order.java`), a wildcard import to a file of the
 * package. The JDK is no dependency; other names are external, named by their first two
 * package segments (`org.springframework`).
 */

import { posix } from "node:path";
import type { FileFacts } from "../facts.js";
import type { Resolution, Resolver } from "../resolution.js";

const JDK = /^(java|javax|jdk|sun|com\.sun|org\.w3c\.dom|org\.xml\.sax|org\.ietf\.jgss)(\.|$)/;

/** Source roots of the given Java files, longest first. */
export function javaSourceRoots(facts: FileFacts[]): string[] {
  const roots = new Set<string>();
  for (const f of facts) {
    if (f.language !== "java") continue;
    const dir = posix.dirname(f.path) === "." ? "" : posix.dirname(f.path);
    const pkg = (f.javaPackage ?? "").replace(/\./g, "/");
    if (pkg === "") roots.add(dir);
    else if (dir === pkg) roots.add("");
    else if (dir.endsWith(`/${pkg}`)) roots.add(dir.slice(0, -pkg.length - 1));
  }
  return [...roots].sort((a, b) => b.length - a.length || (a < b ? -1 : 1));
}

export class JavaResolver implements Resolver {
  private readonly files: Set<string>;
  private readonly packageFile = new Map<string, string>();
  private readonly memo = new Map<string, Resolution>();

  constructor(
    private readonly roots: string[],
    files: string[],
  ) {
    this.files = new Set(files.filter((f) => f.endsWith(".java")));
    for (const f of [...this.files].sort()) {
      const dir = posix.dirname(f);
      if (!this.packageFile.has(dir)) this.packageFile.set(dir, f);
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
    if (JDK.test(specifier)) return { kind: "builtin" };
    const wildcard = specifier.endsWith(".*");
    const parts = (wildcard ? specifier.slice(0, -2) : specifier).split(".");
    for (const root of this.roots) {
      const at = (p: string[]) => [root, ...p].filter(Boolean).join("/");
      if (wildcard) {
        const file = this.packageFile.get(at(parts));
        if (file) return { kind: "file", path: file };
      }
      // The outermost class: `a.b.Outer.Inner.member` lives in `a/b/Outer.java`.
      for (let n = parts.length; n >= 1; n--) {
        const file = `${at(parts.slice(0, n))}.java`;
        if (this.files.has(file)) return { kind: "file", path: file };
      }
    }
    return { kind: "external", package: parts.slice(0, 2).join(".") };
  }
}
