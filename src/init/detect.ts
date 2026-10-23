/**
 * Heuristic module detection for `archlock init`. Go code becomes one module per package
 * (directory). For other code the first strategy that finds modules wins:
 * 1. workspace packages of a monorepo,
 * 2. subpackages of a single top-level Python package,
 * 3. subdirectories of `src/` (plus a module for files directly in `src/`),
 * 4. top-level directories that contain code.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { DEFAULT_EXCLUDE, type Language } from "../config/config.js";
import {
  defaultEntryCandidates,
  type ModuleSpec,
  parseGoMod,
  readWorkspacePackages,
} from "../extract/index.js";
import { GO_EXTENSIONS, listSourceFiles, PY_EXTENSIONS, TS_EXTENSIONS } from "../fs/files.js";

export interface Detection {
  languages: Language[];
  strategy: "go-packages" | "workspaces" | "python-package" | "src" | "top-level";
  modules: ModuleSpec[];
  include: string[];
}

const NOT_MODULES = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  "test",
  "tests",
  "__tests__",
  "spec",
  "docs",
  "examples",
  "scripts",
  "archlock",
  "vendor",
  "public",
  "static",
]);

export function detectLanguages(root: string): Language[] {
  const langs: Language[] = [];
  const has = (f: string) => existsSync(join(root, f));
  const files = listSourceFiles(root, {
    include: ["**"],
    exclude: DEFAULT_EXCLUDE,
    extensions: [...TS_EXTENSIONS, ...PY_EXTENSIONS, ...GO_EXTENSIONS],
  });
  if (
    has("tsconfig.json") ||
    has("package.json") ||
    files.some((f) => TS_EXTENSIONS.some((e) => f.endsWith(e)))
  ) {
    langs.push("typescript");
  }
  if (has("pyproject.toml") || has("setup.py") || files.some((f) => f.endsWith(".py")))
    langs.push("python");
  if (has("go.mod") || files.some((f) => f.endsWith(".go"))) langs.push("go");
  return langs.length > 0 ? langs : ["typescript"];
}

/** Turns a package or directory name into a module name (a Python-style identifier). */
export function moduleName(raw: string): string {
  const base = raw.replace(/^@[^/]+\//, "");
  let name = base
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (name === "" || /^[0-9]/.test(name)) name = `m_${name}`;
  return name;
}

function uniqueNames(entries: { raw: string; scoped?: string }[]): string[] {
  const names = entries.map((e) => moduleName(e.raw));
  return names.map((n, i) => {
    if (names.indexOf(n) === names.lastIndexOf(n)) return n;
    const scoped = entries[i]?.scoped;
    return scoped ? moduleName(scoped.replace(/^@/, "").replace("/", "_")) : `${n}_${i}`;
  });
}

function withEntry(spec: Omit<ModuleSpec, "entry">, files: Set<string>): ModuleSpec {
  const entry = defaultEntryCandidates({ ...spec, entry: null }).find((c) => files.has(c)) ?? null;
  return { ...spec, entry };
}

function dirsWithCode(files: string[], prefix: string): string[] {
  const dirs = new Set<string>();
  for (const f of files) {
    if (!f.startsWith(prefix)) continue;
    const rest = f.slice(prefix.length);
    const slash = rest.indexOf("/");
    if (slash > 0) dirs.add(rest.slice(0, slash));
  }
  return [...dirs].sort();
}

function packageNameOf(root: string): string | null {
  try {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { name?: string };
    return typeof pkg.name === "string" ? pkg.name : null;
  } catch {
    return null;
  }
}

export function detectModules(root: string, languages: Language[]): Detection {
  const extensions = [
    ...(languages.includes("typescript") ? TS_EXTENSIONS : []),
    ...(languages.includes("python") ? PY_EXTENSIONS : []),
    ...(languages.includes("go") ? GO_EXTENSIONS : []),
  ];
  const files = listSourceFiles(root, { include: ["**"], exclude: DEFAULT_EXCLUDE, extensions });
  const goFiles = files.filter((f) => f.endsWith(".go"));
  if (goFiles.length === 0) return detectOther(root, languages, files);

  const go = goPackages(root, goFiles);
  const rest = files.filter((f) => !f.endsWith(".go"));
  if (rest.length === 0) {
    return {
      languages,
      strategy: "go-packages",
      modules: sortSpecs(go.modules),
      include: go.include,
    };
  }
  // A mixed repository (e.g. a Go service with a web frontend): the rest is detected as usual.
  const other = detectOther(
    root,
    languages.filter((l) => l !== "go"),
    rest,
  );
  const taken = new Set(go.modules.map((m) => m.name));
  const renamed = other.modules.map((m) =>
    taken.has(m.name) ? { ...m, name: `${m.name}_web` } : m,
  );
  return {
    languages,
    strategy: "go-packages",
    modules: sortSpecs([...go.modules, ...renamed]),
    include: [...new Set([...go.include, ...other.include])].sort(),
  };
}

/**
 * One module per Go package directory, named after its path (`internal/store` →
 * `internal.store`); the root package is named after the last element of the module path.
 */
function goPackages(root: string, goFiles: string[]): { modules: ModuleSpec[]; include: string[] } {
  const dirs = [...new Set(goFiles.map((f) => (posix.dirname(f) === "." ? "" : posix.dirname(f))))]
    .filter((d) => {
      if (d === "") return true;
      const parts = d.split("/");
      return (
        !NOT_MODULES.has(parts[0] as string) &&
        !parts.some((p) => /^[._]/.test(p) || p === "testdata")
      );
    })
    .sort();
  const rootName = (() => {
    try {
      const mod = parseGoMod(readFileSync(join(root, "go.mod"), "utf8")).module ?? "";
      const parts = mod.split("/").filter((p) => !/^v[0-9]+$/.test(p));
      return moduleName(parts[parts.length - 1] ?? "") || "app";
    } catch {
      return "app";
    }
  })();
  const names = dirs.map((d) => (d === "" ? rootName : d.split("/").map(moduleName).join(".")));
  const modules = dirs.map((d, i) => {
    let name = names[i] as string;
    if (d === "" && names.indexOf(name) !== names.lastIndexOf(name)) name = `${name}_root`;
    return { name, paths: [d === "" ? "*.go" : `${d}/*.go`], entry: null };
  });
  const include = [
    ...new Set(dirs.map((d) => (d === "" ? "*.go" : `${d.split("/")[0]}/**`))),
  ].sort();
  return { modules, include };
}

function detectOther(root: string, languages: Language[], all: string[]): Detection {
  const fileSet = new Set(all);

  // 1. Workspace packages.
  const packages = readWorkspacePackages(root).filter((p) =>
    all.some((f) => f.startsWith(`${p.dir}/`)),
  );
  if (packages.length > 0) {
    // The root package may have its own code in src/ (e.g. a framework with adapter packages).
    const names = uniqueNames(packages.map((p) => ({ raw: p.name, scoped: p.name })));
    const modules = packages.map((p, i) =>
      withEntry({ name: names[i] as string, paths: [`${p.dir}/**`] }, fileSet),
    );
    const rootSrc = srcModules(root, all, fileSet, names);
    modules.push(...rootSrc);
    const include = [
      ...new Set([
        ...packages.map((p) => `${p.dir.split("/")[0]}/**`),
        ...(rootSrc.length > 0 ? ["src/**"] : []),
      ]),
    ].sort();
    return { languages, strategy: "workspaces", modules: sortSpecs(modules), include };
  }

  // 2. Subpackages of the one Python package of a src/ or flat layout.
  const pkg = mainPythonPackage(all);
  if (pkg !== null) {
    const subdirs = dirsWithCode(all, `${pkg}/`).filter((d) => !NOT_MODULES.has(d));
    const loose = all.some(
      (f) => f.startsWith(`${pkg}/`) && !f.slice(pkg.length + 1).includes("/"),
    );
    if (subdirs.length > 0) {
      const names = uniqueNames(subdirs.map((d) => ({ raw: d })));
      const modules = subdirs.map((d, i) =>
        withEntry({ name: names[i] as string, paths: [`${pkg}/${d}/**`] }, fileSet),
      );
      if (loose) {
        let name = moduleName(pkg.split("/").pop() as string);
        if (names.includes(name)) name = `${name}_root`;
        modules.push(withEntry({ name, paths: [`${pkg}/*`] }, fileSet));
      }
      return {
        languages,
        strategy: "python-package",
        modules: sortSpecs(modules),
        include: [`${pkg}/**`],
      };
    }
  }

  // 3. Subdirectories of src/ (plus a module for files directly in src/).
  const src = srcModules(root, all, fileSet, []);
  if (src.length > 0) {
    return { languages, strategy: "src", modules: sortSpecs(src), include: ["src/**"] };
  }

  // 4. Top-level directories with code.
  const topDirs = dirsWithCode(all, "").filter((d) => !NOT_MODULES.has(d) && !d.startsWith("."));
  const names = uniqueNames(topDirs.map((d) => ({ raw: d })));
  const modules = topDirs.map((d, i) =>
    withEntry({ name: names[i] as string, paths: [`${d}/**`] }, fileSet),
  );
  return {
    languages,
    strategy: "top-level",
    modules: sortSpecs(modules),
    include: topDirs.map((d) => `${d}/**`),
  };
}

/**
 * The single top-level Python package (`src/<pkg>` or `<pkg>` with an `__init__.py`) when all
 * non-test code lives inside it; null otherwise.
 */
function mainPythonPackage(files: string[]): string | null {
  const packages = new Set<string>();
  for (const f of files) {
    const m = /^((?:src\/)?[A-Za-z_][A-Za-z0-9_]*)\/__init__\.py$/.exec(f);
    if (m) packages.add(m[1] as string);
  }
  if (packages.size !== 1) return null;
  const pkg = [...packages][0] as string;
  // Root-level scripts (setup.py, manage.py, noxfile.py) do not count.
  const outside = files.filter(
    (f) =>
      f.includes("/") &&
      !f.startsWith(`${pkg}/`) &&
      !/(^|\/)(tests?|docs|scripts|examples)\//.test(f),
  );
  return outside.length === 0 ? pkg : null;
}

/** Modules for `src/<dir>/**` and, for files directly in `src/`, one named after the package. */
function srcModules(
  root: string,
  all: string[],
  fileSet: Set<string>,
  taken: string[],
): ModuleSpec[] {
  const srcDirs = dirsWithCode(all, "src/").filter((d) => !NOT_MODULES.has(d));
  const loose = all.some((f) => f.startsWith("src/") && !f.slice(4).includes("/"));
  const names = uniqueNames([
    ...taken.map((t) => ({ raw: t })),
    ...srcDirs.map((d) => ({ raw: d })),
  ]).slice(taken.length);
  const modules = srcDirs.map((d, i) =>
    withEntry({ name: names[i] as string, paths: [`src/${d}/**`] }, fileSet),
  );
  if (loose) {
    let name = moduleName(packageNameOf(root) ?? "app");
    if (names.includes(name) || taken.includes(name)) name = `${name}_root`;
    modules.push(withEntry({ name, paths: ["src/*"] }, fileSet));
  }
  return modules;
}

function sortSpecs(specs: ModuleSpec[]): ModuleSpec[] {
  return [...specs].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
