import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ArchlockConfig } from "../config/config.js";
import { abbreviateSymbols } from "../core/abbreviate.js";
import { type ArchlockCache, hashText } from "../fs/cache.js";
import {
  GO_EXTENSIONS,
  JAVA_EXTENSIONS,
  listSourceFiles,
  PY_EXTENSIONS,
  RS_EXTENSIONS,
  TS_EXTENSIONS,
} from "../fs/files.js";
import {
  getGoParser,
  getJavaParser,
  getPythonParser,
  getRustParser,
} from "../sketch/treesitter.js";
import { extractComponentFile } from "./components/component.js";
import { frameworkOf } from "./components/sfc.js";
import { deserializeFacts, type FileFacts, type SerializedFacts, serializeFacts } from "./facts.js";
import { attachGoMethods, extractGoFile } from "./go/file.js";
import { GoResolver, readGoMods } from "./go/resolve.js";
import { extractJavaFile } from "./java/file.js";
import { JavaResolver, javaSourceRoots } from "./java/resolve.js";
import { buildProject, type CodeProject, type ModuleSpec, Ownership } from "./project.js";
import { extractPythonFile } from "./python/file.js";
import { PythonResolver, pythonRoots } from "./python/resolve.js";
import type { Resolver } from "./resolution.js";
import { readCargoCrates } from "./rust/cargo.js";
import { linkRustCrates, rustResolver } from "./rust/crate.js";
import { extractRustFile } from "./rust/file.js";
import { extractTypeScriptFile } from "./typescript/file.js";
import { TypeScriptResolver } from "./typescript/resolve.js";
import { readWorkspacePackages } from "./workspaces.js";

export { parseGoMod } from "./go/resolve.js";
export {
  type CodeModule,
  type CodeProject,
  type DeepImport,
  defaultEntryCandidates,
  type ImportSite,
  type ModuleSpec,
  Ownership,
} from "./project.js";
export { type RustCrate, readCargoCrates } from "./rust/cargo.js";
export { readWorkspacePackages, type WorkspacePackage } from "./workspaces.js";

export interface ExtractResult {
  project: CodeProject;
  /** All scanned source files (repo-relative, sorted). */
  files: string[];
}

export function sourceExtensions(config: ArchlockConfig): string[] {
  const ext: string[] = [];
  if (config.languages.includes("typescript")) ext.push(...TS_EXTENSIONS);
  if (config.languages.includes("python")) ext.push(...PY_EXTENSIONS);
  if (config.languages.includes("go")) ext.push(...GO_EXTENSIONS);
  if (config.languages.includes("rust")) ext.push(...RS_EXTENSIONS);
  if (config.languages.includes("java")) ext.push(...JAVA_EXTENSIONS);
  return ext;
}

/** Scans the repository and builds the code model for the given modules. */
export async function extractProject(
  root: string,
  config: ArchlockConfig,
  specs: ModuleSpec[],
  cache?: ArchlockCache,
): Promise<ExtractResult> {
  const files = listSourceFiles(root, {
    include: config.include,
    exclude: config.exclude,
    extensions: sourceExtensions(config),
  });
  const python = files.some((f) => f.endsWith(".py")) ? await getPythonParser() : null;
  const go = files.some((f) => f.endsWith(".go")) ? await getGoParser() : null;
  const rust = files.some((f) => f.endsWith(".rs")) ? await getRustParser() : null;
  const java = files.some((f) => f.endsWith(".java")) ? await getJavaParser() : null;
  const extract = (file: string, text: string): FileFacts => {
    if (python && file.endsWith(".py")) return extractPythonFile(python, file, text);
    if (go && file.endsWith(".go")) return extractGoFile(go, file, text);
    if (rust && file.endsWith(".rs")) return extractRustFile(rust, file, text);
    if (java && file.endsWith(".java")) return extractJavaFile(java, file, text);
    if (frameworkOf(file)) return extractComponentFile(file, text);
    return extractTypeScriptFile(file, text);
  };
  const facts: FileFacts[] = files.map((file) => {
    const text = readFileSync(join(root, file), "utf8");
    const hash = hashText(text);
    const cached = cache?.get<SerializedFacts>("facts", file, hash);
    if (cached) return deserializeFacts(cached);
    const extracted = extract(file, text);
    cache?.set("facts", file, hash, serializeFacts(extracted));
    return extracted;
  });
  attachGoMethods(facts);
  const ownership = new Ownership(specs);
  if (rust) linkRustCrates(root, facts, readCargoCrates(root), (f) => ownership.owner(f));

  const workspaceModules = new Map<string, string>();
  for (const pkg of readWorkspacePackages(root)) {
    const owner = ownership.owner(pkg.dir === "" ? "package.json" : `${pkg.dir}/package.json`);
    if (owner) workspaceModules.set(pkg.name, owner);
  }
  const tsResolver = new TypeScriptResolver(root, workspaceModules);
  const pyResolver = python
    ? new PythonResolver(root, new Set(files.filter((f) => f.endsWith(".py"))), pythonRoots(root))
    : null;
  const goResolver = go ? new GoResolver(root, readGoMods(root), files) : null;
  const javaResolver = java ? new JavaResolver(javaSourceRoots(facts), files) : null;
  const resolverFor = (f: FileFacts): Resolver => {
    if (f.language === "python" && pyResolver) return pyResolver;
    if (f.language === "go" && goResolver) return goResolver;
    if (f.language === "rust") return rustResolver;
    if (f.language === "java" && javaResolver) return javaResolver;
    return tsResolver;
  };
  const project = buildProject(facts, specs, resolverFor);
  for (const mod of project.modules.values()) {
    mod.symbols = abbreviateSymbols(mod.symbols, config.maxTypeLength);
  }
  return { project, files };
}
