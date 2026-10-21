/**
 * Language-neutral facts about one source file. Extractors (TypeScript, Python) produce them;
 * `project.ts` turns them into modules, dependency edges and public APIs.
 */

import type { ArchSymbol } from "../core/model.js";

export type SourceLanguage = "typescript" | "python";

export interface ImportFact {
  specifier: string;
  /**
   * Imported names: `"*"` for a namespace import (or an import whose names are unknown, like a
   * dynamic `import()`), `"default"` for a default import. Empty for side-effect imports and
   * `export * from`.
   */
  names: string[];
  line: number;
  column: number;
  typeOnly: boolean;
  /**
   * Python `from pkg import name`: `name` may be a submodule (`pkg/name.py`) rather than an
   * attribute of `pkg`. Resolution tries the submodule first.
   */
  submodule?: string;
}

export type ExportEntry =
  /** A declaration (or import binding) in this file, by local name. */
  | { kind: "local"; local: string }
  /** `export { name } from "specifier"` / `export * as name from "specifier"` (name `*`). */
  | { kind: "reexport"; specifier: string; name: string };

export interface ImportBinding {
  specifier: string;
  /** The imported name: `*` (namespace), `default`, or a named export. */
  name: string;
  /** Python: the name may be a submodule of `specifier` (see ImportFact.submodule). */
  submodule?: boolean;
}

export interface FileFacts {
  /** Repo-relative POSIX path. */
  path: string;
  language: SourceLanguage;
  /** Non-blank lines. */
  lines: number;
  imports: ImportFact[];
  /** Export name → what it refers to. Insertion order is irrelevant; consumers sort. */
  exports: Map<string, ExportEntry>;
  /** Specifiers of `export * from "..."` (Python: `from x import *` in `__init__.py`). */
  stars: string[];
  /** Local name → top-level declarations with that name (a type and a value may share a name). */
  declarations: Map<string, ArchSymbol[]>;
  /** Local name → import binding, for exports of imported names. */
  bindings: Map<string, ImportBinding>;
  /** Python only: `__all__` was declared, so only listed names are public. */
  explicitExports?: boolean;
}

/** Local name used for anonymous default exports. */
export const ANONYMOUS_DEFAULT = "*default*";

/** JSON-safe form of FileFacts (for the cache). */
export interface SerializedFacts extends Omit<FileFacts, "exports" | "declarations" | "bindings"> {
  exports: [string, ExportEntry][];
  declarations: [string, ArchSymbol[]][];
  bindings: [string, ImportBinding][];
}

export function serializeFacts(f: FileFacts): SerializedFacts {
  return {
    ...f,
    exports: [...f.exports],
    declarations: [...f.declarations],
    bindings: [...f.bindings],
  };
}

export function deserializeFacts(f: SerializedFacts): FileFacts {
  return {
    ...f,
    exports: new Map(f.exports),
    declarations: new Map(f.declarations),
    bindings: new Map(f.bindings),
  };
}
