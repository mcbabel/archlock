import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ArchlockConfig } from "../config/config.js";
import { abbreviateSymbols } from "../core/abbreviate.js";
import { type ArchlockCache, hashText } from "../fs/cache.js";
import { listSourceFiles, PY_EXTENSIONS, TS_EXTENSIONS } from "../fs/files.js";
import { getPythonParser } from "../sketch/treesitter.js";
import { extractComponentFile } from "./components/component.js";
import { frameworkOf } from "./components/sfc.js";
import { deserializeFacts, type FileFacts, type SerializedFacts, serializeFacts } from "./facts.js";
import { buildProject, type CodeProject, type ModuleSpec, Ownership } from "./project.js";
import { extractPythonFile } from "./python/file.js";
import { PythonResolver, pythonRoots } from "./python/resolve.js";
import { extractTypeScriptFile } from "./typescript/file.js";
import { TypeScriptResolver } from "./typescript/resolve.js";
import { readWorkspacePackages } from "./workspaces.js";

export {
  type CodeModule,
  type CodeProject,
  type DeepImport,
  defaultEntryCandidates,
  type ImportSite,
  type ModuleSpec,
  Ownership,
} from "./project.js";
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
  const facts: FileFacts[] = files.map((file) => {
    const text = readFileSync(join(root, file), "utf8");
    const hash = hashText(text);
    const cached = cache?.get<SerializedFacts>("facts", file, hash);
    if (cached) return deserializeFacts(cached);
    const extracted =
      python && file.endsWith(".py")
        ? extractPythonFile(python, file, text)
        : frameworkOf(file)
          ? extractComponentFile(file, text)
          : extractTypeScriptFile(file, text);
    cache?.set("facts", file, hash, serializeFacts(extracted));
    return extracted;
  });

  const ownership = new Ownership(specs);
  const workspaceModules = new Map<string, string>();
  for (const pkg of readWorkspacePackages(root)) {
    const owner = ownership.owner(pkg.dir === "" ? "package.json" : `${pkg.dir}/package.json`);
    if (owner) workspaceModules.set(pkg.name, owner);
  }
  const tsResolver = new TypeScriptResolver(root, workspaceModules);
  const pyResolver = python
    ? new PythonResolver(root, new Set(files.filter((f) => f.endsWith(".py"))), pythonRoots(root))
    : null;
  const project = buildProject(facts, specs, (f) =>
    f.language === "python" && pyResolver ? pyResolver : tsResolver,
  );
  for (const mod of project.modules.values()) {
    mod.symbols = abbreviateSymbols(mod.symbols, config.maxTypeLength);
  }
  return { project, files };
}
