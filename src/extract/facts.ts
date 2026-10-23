/**
 * Language-neutral facts about one source file. Extractors (TypeScript, Python, Go, Rust) produce
 * them;
 * `project.ts` turns them into modules, dependency edges and public APIs.
 */

import type { ArchSymbol, FieldMember, MethodMember } from "../core/model.js";

export type SourceLanguage = "typescript" | "python" | "go" | "rust";

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
  /**
   * Go only: methods by receiver type name. A method may be declared in another file of the
   * package than its type, so they are attached per package after extraction.
   */
  goMethods?: { receiver: string; method: MethodMember }[];
  /** Rust only: what the crate pass (`linkRustCrates`) needs to resolve paths and re-exports. */
  rust?: RustFacts;
}

/** A `use` leaf (`use a::b::{c as d, e::*}` has two), or an inline path like `crate::x::f()`. */
export interface RustPath {
  /** Path segments, e.g. `["crate", "model", "User"]`. */
  segments: string[];
  /** `use … as alias`. */
  alias: string | null;
  /** `use path::*`. */
  glob: boolean;
  /** `pub use` (a re-export); false for private uses and inline paths. */
  pub: boolean;
  /** An inline path in code rather than a `use` declaration. */
  inline: boolean;
  line: number;
  column: number;
}

/** `mod name;`: a module whose code is in another file. */
export interface RustMod {
  name: string;
  pub: boolean;
  /** `pub(crate)`, `pub(super)` or `pub(in …)`: visible inside the crate. */
  restricted: boolean;
  /** `#[path = "…"]`, relative to the declaring file's directory. */
  path: string | null;
  line: number;
  column: number;
}

/** An `impl` block, attached to its type by the crate pass. */
export interface RustImpl {
  /** The implementing type's path, e.g. `["Config"]` or `["crate", "model", "User"]`. */
  type: string[];
  /** The implemented trait (canonical), or null for an inherent impl. */
  trait: string | null;
  /** Public methods (inherent impls only). */
  methods: MethodMember[];
  /** Public associated constants (inherent impls only). */
  consts: FieldMember[];
}

export interface RustFacts {
  mods: RustMod[];
  paths: RustPath[];
  impls: RustImpl[];
  /** `#[macro_export] macro_rules!` names: exported from the crate root. */
  macros: string[];
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
