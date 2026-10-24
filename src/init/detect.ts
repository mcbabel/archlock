/**
 * Heuristic module detection for `archlock init`. Go code becomes one module per package
 * (directory), Rust code one per crate or top-level module, Java code one per source root or
 * top-level package, C# code one per project. For other code the first strategy that finds modules wins:
 * 1. workspace packages of a monorepo,
 * 2. subpackages of a single top-level Python package,
 * 3. subdirectories of `src/` (plus a module for files directly in `src/`),
 * 4. top-level directories that contain code.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { DEFAULT_EXCLUDE, type Language } from "../config/config.js";
import {
  defaultEntryCandidates,
  type ModuleSpec,
  parseGoMod,
  readCargoCrates,
  readCsProjects,
  readWorkspacePackages,
} from "../extract/index.js";
import {
  CS_EXTENSIONS,
  GO_EXTENSIONS,
  JAVA_EXTENSIONS,
  listSourceFiles,
  PY_EXTENSIONS,
  RS_EXTENSIONS,
  TS_EXTENSIONS,
} from "../fs/files.js";

export interface Detection {
  languages: Language[];
  strategy:
    | "go-packages"
    | "rust-crates"
    | "java-packages"
    | "csharp-projects"
    | "workspaces"
    | "python-package"
    | "src"
    | "top-level";
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
    extensions: [
      ...TS_EXTENSIONS,
      ...PY_EXTENSIONS,
      ...GO_EXTENSIONS,
      ...RS_EXTENSIONS,
      ...JAVA_EXTENSIONS,
      ...CS_EXTENSIONS,
    ],
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
  if (has("Cargo.toml") || files.some((f) => f.endsWith(".rs"))) langs.push("rust");
  if (
    has("pom.xml") ||
    has("build.gradle") ||
    has("build.gradle.kts") ||
    files.some((f) => f.endsWith(".java"))
  ) {
    langs.push("java");
  }
  if (files.some((f) => f.endsWith(".cs"))) langs.push("csharp");
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
    ...(languages.includes("rust") ? RS_EXTENSIONS : []),
    ...(languages.includes("java") ? JAVA_EXTENSIONS : []),
    ...(languages.includes("csharp") ? CS_EXTENSIONS : []),
  ];
  const files = listSourceFiles(root, { include: ["**"], exclude: DEFAULT_EXCLUDE, extensions });

  // Go and Rust have their own units (packages, crates); everything else is detected as usual.
  const parts: { strategy: Detection["strategy"]; modules: ModuleSpec[]; include: string[] }[] = [];
  const goFiles = files.filter((f) => f.endsWith(".go"));
  if (goFiles.length > 0) parts.push({ strategy: "go-packages", ...goPackages(root, goFiles) });
  const rsFiles = files.filter((f) => f.endsWith(".rs"));
  if (rsFiles.length > 0) {
    const rust = rustCrates(root, rsFiles);
    if (rust.modules.length > 0) parts.push({ strategy: "rust-crates", ...rust });
  }
  const javaFiles = files.filter((f) => f.endsWith(".java"));
  if (javaFiles.length > 0) {
    const java = javaPackages(root, javaFiles);
    if (java.modules.length > 0) parts.push({ strategy: "java-packages", ...java });
  }
  const csFiles = files.filter((f) => f.endsWith(".cs"));
  if (csFiles.length > 0) {
    const cs = csharpProjects(root, csFiles);
    if (cs.modules.length > 0) parts.push({ strategy: "csharp-projects", ...cs });
  }
  const first = parts[0];
  if (!first) return detectOther(root, languages, files);

  const modules: ModuleSpec[] = [];
  const taken = new Set<string>();
  const add = (m: ModuleSpec, suffix: string) => {
    const name = taken.has(m.name) ? `${m.name}_${suffix}` : m.name;
    taken.add(name);
    modules.push({ ...m, name });
  };
  const suffix: Partial<Record<Detection["strategy"], string>> = {
    "go-packages": "go",
    "rust-crates": "rs",
    "java-packages": "java",
    "csharp-projects": "cs",
  };
  for (const p of parts) for (const m of p.modules) add(m, suffix[p.strategy] ?? "x");
  const include = parts.flatMap((p) => p.include);
  const own = [".go", ".rs", ".java", ".cs"];
  const rest = files.filter((f) => !own.some((e) => f.endsWith(e)));
  if (rest.length > 0) {
    // A mixed repository (e.g. a Go service with a web frontend).
    const other = detectOther(
      root,
      languages.filter((l) => l !== "go" && l !== "rust" && l !== "java" && l !== "csharp"),
      rest,
    );
    // A folder that is already a module of its language (a C# project with web assets) stays one.
    const taken = new Set(modules.map((m) => m.paths.join("\0")));
    const kept = other.modules.filter((m) => !taken.has(m.paths.join("\0")));
    for (const m of kept) add(m, "web");
    // Without the dropped modules, their broad includes (`src/**`) would pull in skipped code.
    include.push(
      ...(kept.length === other.modules.length ? other.include : kept.flatMap((m) => m.paths)),
    );
  }
  return {
    languages,
    strategy: first.strategy,
    modules: sortSpecs(modules),
    include: [...new Set(include)].sort(),
  };
}

/** The last segment of a test, benchmark or sample project's name (`Shop.Tests`, `TestConsole`). */
const CS_NOT_PROJECT = /(^|\.)(test\w*|\w*(tests?|specs?|benchmarks?|samples?|examples?))$/i;
const CS_NOT_PROJECT_DIR = /(^|\/)(tests?|samples?|examples?|benchmarks?)(\/|$)/i;

/**
 * C#: one module per project (`.csproj`), named after it (`Ordering.API`); a single project is
 * split into its subdirectories when it has two or more with code. Test, benchmark and sample
 * projects are skipped.
 */
function csharpProjects(
  root: string,
  csFiles: string[],
): { modules: ModuleSpec[]; include: string[] } {
  const projects: { dir: string; name: string }[] = [];
  const skipped: string[] = [];
  for (const { dir } of readCsProjects(root)) {
    let csproj: string | undefined;
    try {
      csproj = readdirSync(join(root, dir))
        .filter((f) => f.endsWith(".csproj"))
        .sort()[0];
    } catch {
      continue;
    }
    if (!csproj) continue;
    const name = csproj.slice(0, -".csproj".length);
    let text = "";
    try {
      text = readFileSync(join(root, dir, csproj), "utf8");
    } catch {
      // An unreadable project file still names a project.
    }
    const isTest =
      CS_NOT_PROJECT.test(name) ||
      CS_NOT_PROJECT_DIR.test(dir) ||
      /Microsoft\.NET\.Test\.Sdk|<IsTestProject>\s*true/i.test(text);
    const prefix = dir === "" ? "" : `${dir}/`;
    if (isTest) skipped.push(dir);
    else if (csFiles.some((f) => f.startsWith(prefix))) projects.push({ dir, name });
  }
  // Source folders outside every project, shared by several of them through `<Compile Include>`.
  const inside = (f: string, dir: string) => dir === "" || f.startsWith(`${dir}/`);
  const loose = csFiles.filter(
    (f) =>
      ![...projects.map((p) => p.dir), ...skipped].some((d) => inside(f, d)) &&
      !CS_NOT_PROJECT_DIR.test(f),
  );
  const looseDirs = [
    ...new Set(loose.map((f) => (posix.dirname(f) === "." ? "" : posix.dirname(f)))),
  ].sort();
  for (const dir of looseDirs) {
    if (dir === "" || looseDirs.some((d) => d !== dir && inside(dir, d))) continue;
    projects.push({ dir, name: posix.basename(dir) });
  }
  projects.sort((a, b) => (a.dir < b.dir ? -1 : a.dir > b.dir ? 1 : 0));
  const under = (dir: string) => (dir === "" ? "**" : `${dir}/**`);
  const dotted = (name: string) => name.split(".").map(moduleName).join(".");
  if (projects.length > 1) {
    const seen = new Set<string>();
    const modules = projects.map((p) => {
      let name = dotted(p.name);
      if (seen.has(name)) name = `${name}_${moduleName(p.dir)}`;
      seen.add(name);
      return { name, paths: [under(p.dir)], entry: null };
    });
    return { modules, include: projects.map((p) => under(p.dir)).sort() };
  }
  const project = projects[0];
  if (!project) return { modules: [], include: [] };
  const prefix = project.dir === "" ? "" : `${project.dir}/`;
  const subdirs = dirsWithCode(
    csFiles.filter((f) => f.startsWith(prefix)),
    prefix,
  ).filter((d) => !["bin", "obj", "Properties"].includes(d));
  const name = dotted(project.name);
  if (subdirs.length < 2) {
    return {
      modules: [{ name, paths: [under(project.dir)], entry: null }],
      include: [under(project.dir)],
    };
  }
  const names = uniqueNames(subdirs.map((d) => ({ raw: d })));
  const modules: ModuleSpec[] = subdirs.map((d, i) => ({
    name: names[i] as string,
    paths: [`${prefix}${d}/**`],
    entry: null,
  }));
  // The project's own files: loose ones and `Properties/` (assembly attributes).
  const own = csFiles.filter((f) => f.startsWith(prefix) && !f.slice(prefix.length).includes("/"));
  const properties = csFiles.some((f) => f.startsWith(`${prefix}Properties/`));
  if (own.length > 0 || properties) {
    modules.push({
      name: names.includes(name) ? `${name}_root` : name,
      paths: [`${prefix}*.cs`, ...(properties ? [`${prefix}Properties/**`] : [])],
      entry: null,
    });
  }
  return { modules, include: [under(project.dir)] };
}

const JAVA_TEST_ROOT =
  /(^|\/)(src\/test|src\/it|tests?|testFixtures|it|examples?|samples?)([-_][\w-]*)?(\/|$)/;

/**
 * Java: one module per source root (Maven or Gradle module); a single source root is split into
 * the direct subpackages of its common root package (`com.acme.shop.order`) plus one module for
 * the root package's own classes. Source roots follow from the files' `package` declarations;
 * test roots are skipped.
 */
function javaPackages(
  root: string,
  javaFiles: string[],
): { modules: ModuleSpec[]; include: string[] } {
  const packages = new Map<string, Set<string>>();
  for (const f of javaFiles) {
    let text = "";
    try {
      // Comments first: a long Javadoc can precede the declaration.
      text = readFileSync(join(root, f), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    } catch {
      continue;
    }
    const pkg = /^\s*package\s+([\w.]+)\s*;/m.exec(text)?.[1] ?? "";
    const dir = posix.dirname(f) === "." ? "" : posix.dirname(f);
    const pkgPath = pkg.replace(/\./g, "/");
    const sourceRoot =
      pkg === ""
        ? dir
        : dir === pkgPath
          ? ""
          : dir.endsWith(`/${pkgPath}`)
            ? dir.slice(0, -pkgPath.length - 1)
            : null;
    if (sourceRoot === null || JAVA_TEST_ROOT.test(sourceRoot)) continue;
    const set = packages.get(sourceRoot) ?? new Set<string>();
    set.add(pkg);
    packages.set(sourceRoot, set);
  }
  const roots = [...packages.keys()].sort();
  const under = (dir: string) => (dir === "" ? "**" : `${dir}/**`);
  if (roots.length > 1) {
    const names = uniqueNames(
      roots.map((r) => ({
        raw: posix.basename(r.replace(/\/?src\/main\/java$/, "")) || "app",
        scoped: r,
      })),
    );
    const modules = roots.map((r, i) => ({
      name: names[i] as string,
      paths: [under(r)],
      entry: null,
    }));
    return { modules, include: roots.map(under).sort() };
  }
  const sourceRoot = roots[0];
  if (sourceRoot === undefined) return { modules: [], include: [] };
  const pkgs = [...(packages.get(sourceRoot) as Set<string>)].map((p) =>
    p === "" ? [] : p.split("."),
  );
  const common: string[] = [];
  for (let i = 0; pkgs.every((p) => p[i] !== undefined && p[i] === pkgs[0]?.[i]); i++) {
    common.push(pkgs[0]?.[i] as string);
  }
  const base = [sourceRoot, ...common].filter(Boolean).join("/");
  const subs = [
    ...new Set(pkgs.filter((p) => p.length > common.length).map((p) => p[common.length] as string)),
  ].sort();
  const rootName = moduleName(common[common.length - 1] ?? (posix.basename(sourceRoot) || "app"));
  if (subs.length < 2) {
    return {
      modules: [{ name: rootName, paths: [under(base)], entry: null }],
      include: [under(sourceRoot)],
    };
  }
  const names = uniqueNames(subs.map((s) => ({ raw: s })));
  const modules: ModuleSpec[] = subs.map((sub, i) => ({
    name: names[i] as string,
    paths: [`${base}/${sub}/**`],
    entry: null,
  }));
  if (pkgs.some((p) => p.length === common.length)) {
    const name = names.includes(rootName) ? `${rootName}_root` : rootName;
    modules.push({ name, paths: [`${base}/*.java`], entry: null });
  }
  return { modules, include: [under(sourceRoot)] };
}

/**
 * Rust: in a workspace one module per crate; a single crate is split into its top-level modules
 * (`src/parser.rs` with `src/parser/**`) plus one module for the crate root, when it has two or
 * more of them.
 */
function rustCrates(root: string, rsFiles: string[]): { modules: ModuleSpec[]; include: string[] } {
  const crates = readCargoCrates(root).filter((c) => (c.libRoot ?? c.binRoots[0]) !== undefined);
  const baseOf = (entry: string) => posix.dirname(entry);
  if (crates.length > 1) {
    const names = uniqueNames(crates.map((c) => ({ raw: c.libName, scoped: c.dir })));
    const modules = crates.map((c, i) => {
      const entry = (c.libRoot ?? c.binRoots[0]) as string;
      return { name: names[i] as string, paths: [`${baseOf(entry)}/**`], entry };
    });
    return { modules, include: modules.map((m) => m.paths[0] as string).sort() };
  }
  const crate = crates[0];
  if (!crate) return { modules: [], include: [] };
  const entry = (crate.libRoot ?? crate.binRoots[0]) as string;
  const base = baseOf(entry);
  const prefix = base === "." ? "" : `${base}/`;
  const inBase = rsFiles.filter((f) => f.startsWith(prefix)).map((f) => f.slice(prefix.length));
  const tops = new Set<string>();
  for (const f of inBase) {
    const [head, ...rest] = f.split("/");
    if (!head || head === "bin") continue;
    if (rest.length === 0) {
      if (head.endsWith(".rs") && head !== "lib.rs" && head !== "main.rs")
        tops.add(head.slice(0, -3));
    } else if (inBase.includes(`${head}/mod.rs`) || inBase.includes(`${head}.rs`)) tops.add(head);
  }
  const crateName = moduleName(crate.libName);
  if (tops.size < 2) {
    return {
      modules: [{ name: crateName, paths: [`${prefix}**`], entry }],
      include: [`${prefix}**`],
    };
  }
  const modules: ModuleSpec[] = [...tops].sort().map((t) => {
    const file = inBase.includes(`${t}.rs`) ? `${prefix}${t}.rs` : `${prefix}${t}/mod.rs`;
    const hasDir = inBase.some((f) => f.startsWith(`${t}/`));
    const paths = [
      ...(inBase.includes(`${t}.rs`) ? [`${prefix}${t}.rs`] : []),
      ...(hasDir ? [`${prefix}${t}/**`] : []),
    ];
    const name = moduleName(t) === crateName ? `${crateName}_mod` : moduleName(t);
    return { name, paths, entry: file };
  });
  const rootPaths = [
    `${prefix}*.rs`,
    ...(inBase.some((f) => f.startsWith("bin/")) ? [`${prefix}bin/**`] : []),
  ];
  modules.push({ name: crateName, paths: rootPaths, entry });
  return { modules, include: [`${prefix}**`] };
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
