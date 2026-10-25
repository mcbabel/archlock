/**
 * The C# project pass. `using` imports namespaces, and code may use the types of its own and its
 * parent namespaces without one, so dependencies come from names: every capitalized name a file
 * uses is resolved like C# does (own namespace and its parents, `using` directives, project-wide
 * `global using`s, aliases) against the types declared by the file's project and the projects it
 * references, and becomes an import of the declaring file. `using` directives of namespaces in
 * the repository count too. Partial types are merged into their first file. Specifiers are
 * `file:<path>` or `external:<namespace>`.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { compareNames, type Member } from "../../core/model.js";
import type { FileFacts, ImportFact } from "../facts.js";

const SKIP = new Set(["bin", "obj", "node_modules", ".git", "packages"]);

export interface CsProject {
  /** Repo-relative directory of the `.csproj` file. */
  dir: string;
  /** Directories of the projects it references (`<ProjectReference Include="…">`). */
  refs: string[];
}

/** The projects (`.csproj`) of the repository, longest directory first. */
export function readCsProjects(root: string): CsProject[] {
  const projects: CsProject[] = [];
  const walk = (abs: string, rel: string, depth: number) => {
    if (depth > 8) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    const csproj = entries
      .filter((e) => e.isFile() && e.name.endsWith(".csproj"))
      .map((e) => e.name)
      .sort()[0];
    if (csproj) {
      let text = "";
      try {
        text = readFileSync(join(abs, csproj), "utf8");
      } catch {
        // An unreadable project file still makes a project.
      }
      const refs = [...text.matchAll(/<ProjectReference\s+Include\s*=\s*"([^"]+)"/g)].map((m) => {
        const target = posix.normalize(
          posix.join(rel, posix.dirname((m[1] as string).replace(/\\/g, "/"))),
        );
        return target === "." ? "" : target;
      });
      projects.push({ dir: rel, refs: [...new Set(refs)].sort() });
    }
    for (const e of entries) {
      if (!e.isDirectory() || SKIP.has(e.name) || e.name.startsWith(".")) continue;
      walk(join(abs, e.name), rel === "" ? e.name : `${rel}/${e.name}`, depth + 1);
    }
  };
  walk(root, "", 0);
  return projects.sort((a, b) => b.dir.length - a.dir.length || (a.dir < b.dir ? -1 : 1));
}

/** `Acme.Shop.Orders` → `Acme.Shop.Orders`, `Acme.Shop`, `Acme`, `` (the global namespace). */
function enclosing(namespace: string): string[] {
  const parts = namespace === "" ? [] : namespace.split(".");
  const out: string[] = [];
  for (let n = parts.length; n >= 0; n--) out.push(parts.slice(0, n).join("."));
  return out;
}

/** An external namespace's name: `Newtonsoft.Json.Linq` → `Newtonsoft.Json`. */
function externalName(namespace: string): string {
  return namespace.split(".").slice(0, 2).join(".");
}

export function linkCSharp(facts: FileFacts[], projects: CsProject[]): void {
  const files = facts
    .filter((f) => f.language === "csharp" && f.csharp)
    .sort((a, b) => (a.path < b.path ? -1 : 1));
  if (files.length === 0) return;
  for (const f of files) {
    f.declarations = new Map([...f.declarations].map(([k, v]) => [k, structuredClone(v)]));
    f.exports = new Map(f.exports);
  }
  // A file belongs to the project of the nearest `.csproj`; files outside every project (shared
  // source folders) have none, and their types are visible everywhere.
  const projectOf = (path: string): string | null =>
    projects.find((p) => p.dir === "" || path.startsWith(`${p.dir}/`))?.dir ?? null;
  // What a project's code can see: the project and, transitively, the projects it references.
  const visibleFrom = new Map<string, Set<string>>();
  const visible = (dir: string | null): Set<string> | null => {
    if (dir === null) return null;
    const known = visibleFrom.get(dir);
    if (known) return known;
    const out = new Set<string>();
    const stack = [dir];
    while (stack.length > 0) {
      const d = stack.pop() as string;
      if (out.has(d)) continue;
      out.add(d);
      stack.push(...(projects.find((p) => p.dir === d)?.refs ?? []));
    }
    visibleFrom.set(dir, out);
    return out;
  };

  // Every declared type by full name, and every namespace by its first file in each project.
  const typeFiles = new Map<string, string[]>();
  const namespaceFiles = new Map<string, Map<string | null, string>>();
  for (const f of files) {
    for (const t of f.csharp?.types ?? []) {
      const full = [t.namespace, t.name].filter(Boolean).join(".");
      typeFiles.set(full, [...(typeFiles.get(full) ?? []), f.path]);
      const byProject = namespaceFiles.get(t.namespace) ?? new Map<string | null, string>();
      if (!byProject.has(projectOf(f.path))) byProject.set(projectOf(f.path), f.path);
      namespaceFiles.set(t.namespace, byProject);
    }
  }
  /** The declaring files `from` can see: its own project's first, then referenced ones. */
  const seenFrom = (from: string, declaring: string[]): string[] => {
    const own = projectOf(from);
    const sees = visible(own);
    const ok = declaring.filter((file) => {
      const p = projectOf(file);
      return sees === null || p === null || sees.has(p);
    });
    return [
      ...ok.filter((file) => projectOf(file) === own),
      ...ok.filter((file) => projectOf(file) !== own),
    ];
  };
  // Extension methods by name, with the namespace that has to be in scope.
  const extensions = new Map<string, { file: string; namespace: string }[]>();
  for (const f of files) {
    for (const e of f.csharp?.extensions ?? []) {
      extensions.set(e.name, [
        ...(extensions.get(e.name) ?? []),
        { file: f.path, namespace: e.namespace },
      ]);
    }
  }
  const globalUsings = new Map<string | null, Set<string>>();
  for (const f of files) {
    for (const u of f.csharp?.usings ?? []) {
      if (!u.global || u.alias || u.static) continue;
      const p = projectOf(f.path);
      const set = globalUsings.get(p) ?? new Set<string>();
      set.add(u.name);
      globalUsings.set(p, set);
    }
  }

  for (const f of files) {
    const cs = f.csharp;
    if (!cs) continue;
    const scopes = [
      ...new Set((cs.namespaces.length > 0 ? cs.namespaces : [""]).flatMap(enclosing)),
    ];
    const usings = [
      ...cs.usings.filter((u) => !u.alias && !u.static).map((u) => u.name),
      ...(globalUsings.get(projectOf(f.path)) ?? []),
    ];
    const aliases = new Map(
      cs.usings.filter((u) => u.alias).map((u) => [u.alias as string, u.name]),
    );
    const typeFile = (full: string): string | null =>
      seenFrom(f.path, typeFiles.get(full) ?? [])[0] ?? null;
    const lookup = (name: string): string | null => {
      const [head, ...rest] = name.split(".");
      const alias = head ? aliases.get(head) : undefined;
      if (alias) return typeFile([alias, ...rest].join("."));
      for (const ns of scopes) {
        const hit = typeFile(ns === "" ? name : `${ns}.${name}`);
        if (hit) return hit;
      }
      for (const u of usings) {
        const hit = typeFile(`${u}.${name}`);
        if (hit) return hit;
      }
      return null;
    };
    const imports: ImportFact[] = [];
    const targets = new Set<string>([f.path]);
    const add = (specifier: string, at: { line: number; column: number }) =>
      imports.push({ specifier, names: ["*"], line: at.line, column: at.column, typeOnly: false });
    for (const u of cs.usings) {
      // Framework namespaces are no dependency, even where a project adds extension methods to
      // them (`namespace Microsoft.Extensions.Hosting` is an ASP.NET convention); the types such
      // a project declares still count when code names them.
      if (/^(global::)?(System|Microsoft)(\.|$)/.test(u.name)) continue;
      const declaring = u.static
        ? [typeFile(u.name)].filter((x): x is string => x !== null)
        : seenFrom(f.path, [...(namespaceFiles.get(u.name)?.values() ?? [])]);
      for (const file of declaring) {
        if (!targets.has(file)) {
          targets.add(file);
          add(`file:${file}`, u);
        }
      }
      if (declaring.length === 0 && !typeFiles.has(u.name) && !namespaceFiles.has(u.name)) {
        add(`external:${externalName(u.name)}`, u);
      }
    }
    for (const ref of cs.refs) {
      // `Acme.Shop.Money.Zero`: the longest prefix that names a type.
      const parts = ref.name.split(".");
      for (let n = parts.length; n >= 1; n--) {
        const file = lookup(parts.slice(0, n).join("."));
        if (!file) continue;
        if (!targets.has(file)) {
          targets.add(file);
          add(`file:${file}`, ref);
        }
        break;
      }
    }
    // `services.AddEventBus()`: an extension method whose namespace is in scope, as the
    // compiler picks it (also framework namespaces that a project extends).
    const inScope = new Set([...scopes, ...usings]);
    for (const call of cs.calls ?? []) {
      const candidates = (extensions.get(call.name) ?? []).filter((e) => inScope.has(e.namespace));
      const file = seenFrom(
        f.path,
        candidates.map((e) => e.file),
      )[0];
      if (file && !targets.has(file)) {
        targets.add(file);
        add(`file:${file}`, call);
      }
    }
    f.imports = imports;
  }

  // Partial types: members and bases of all parts go to the part in the first file.
  const first = new Map<string, FileFacts>();
  for (const f of files) {
    for (const t of f.csharp?.types ?? []) {
      if (!t.partial || !t.exported) continue;
      const key = [t.namespace, t.name].join(".");
      const owner = first.get(key);
      if (!owner) {
        first.set(key, f);
        continue;
      }
      const target = owner.declarations.get(t.exported)?.[0];
      const part = f.declarations.get(t.exported)?.[0];
      if (!target || !part || owner === f) continue;
      if ((target.kind === "class" || target.kind === "interface") && part.kind === target.kind) {
        for (const b of part.bases) if (!target.bases.includes(b)) target.bases.push(b);
        for (const m of part.members) mergeMember(target.members, m);
        for (const d of part.decorators)
          if (!target.decorators.includes(d)) target.decorators.push(d);
        target.decorators.sort(compareNames);
      }
      f.declarations.delete(t.exported);
      f.exports.delete(t.exported);
    }
  }
}

function mergeMember(members: Member[], m: Member): void {
  const existing = members.find((x) => x.kind === m.kind && x.name === m.name);
  if (!existing) {
    members.push(structuredClone(m));
    return;
  }
  if (existing.kind === "method" && m.kind === "method")
    existing.signatures.push(...structuredClone(m.signatures));
}
