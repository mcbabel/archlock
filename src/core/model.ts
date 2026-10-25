/**
 * The language-neutral architecture model.
 *
 * Extractors produce it from code, the sketch parser produces it from `.arch.py` files,
 * the renderer turns it back into a sketch, and compare/merge work only on it.
 * All type strings are canonical (see `canonical.ts`).
 */

export type Strictness = "signatures" | "names" | "deps";

export const STRICTNESS_VALUES: readonly Strictness[] = ["signatures", "names", "deps"];

/** Public symbol kinds. The render order of groups follows this list. */
export type SymbolKind = "enum" | "type" | "interface" | "class" | "function" | "const";

export const SYMBOL_KIND_ORDER: readonly SymbolKind[] = [
  "enum",
  "type",
  "interface",
  "class",
  "function",
  "const",
];

/** A position in a file. Lines and columns are 1-based. */
export interface Location {
  file: string;
  line: number;
  column: number;
}

/**
 * Soft (never CI-blocking) human content attached to an element.
 * Comments are stored verbatim, including the leading `#`.
 */
export interface Soft {
  /** Full-line comments directly above the element. */
  leading: string[];
  /** A comment on the element's (header) line. */
  trailing: string | null;
  /** The raw docstring literal, e.g. `"""Create invoices."""`, with continuation lines dedented. */
  docstring: string | null;
  /** Comments inside the element's body (functions, classes). */
  body: string[];
}

export function emptySoft(): Soft {
  return { leading: [], trailing: null, docstring: null, body: [] };
}

export type ParamKind =
  /** a regular parameter */
  | "normal"
  /** `*name` (TS rest parameter, Python *args) */
  | "rest"
  /** `**name` (Python **kwargs) */
  | "kwrest"
  /** a bare `*` separator (keyword-only parameters follow) */
  | "star"
  /** a bare `/` separator (preceding parameters are positional-only) */
  | "slash";

export interface Param {
  kind: ParamKind;
  /** Empty for `star` and `slash` separators. */
  name: string;
  /** Canonical type, or null when the parameter has no annotation. */
  type: string | null;
  /** Has a default value / is optional (`name: T = ...`). */
  optional: boolean;
}

export interface Signature {
  /** Canonical type parameters, e.g. `T`, `K extends keyof T`, `T: Base`. */
  typeParams: string[];
  params: Param[];
  /**
   * Canonical return type. `INFERRED` when the code has no annotation.
   * null means "no return annotation is rendered" (constructors).
   */
  returns: string | null;
  async: boolean;
  /**
   * The receiver when it is not the language's usual one: Go `*T` and Rust `&self` are usual;
   * a Go value receiver (`T`) or Rust `&mut self` (`&mut Self`) is recorded. Rendered as
   * `self: T`.
   */
  receiver?: string;
  /**
   * Modifiers that are part of the contract, as decorator expressions without `@`:
   * `unsafe`, `const`, `extern("C")`, `throws(IOException)`, and for build variants
   * `build("linux")` or `cfg(unix)`.
   */
  decorators?: string[];
}

export interface FieldMember {
  kind: "field";
  name: string;
  type: string;
  readonly: boolean;
  optional: boolean;
  static: boolean;
  soft: Soft;
  loc?: Location;
}

export interface MethodMember {
  kind: "method";
  name: string;
  /** One entry, or several for overloads (rendered with `@overload`). */
  signatures: Signature[];
  static: boolean;
  classmethod: boolean;
  abstract: boolean;
  optional: boolean;
  soft: Soft;
  loc?: Location;
}

export type Member = FieldMember | MethodMember;

export interface EnumMember {
  name: string;
  /**
   * Canonical type of the data a variant carries (Rust: `(u8, u8)`, `{ x: i32 }`); absent for
   * members without data. Rendered as an annotation, `Name: '(u8, u8)'`.
   */
  payload?: string;
  /**
   * The member's value as a Python literal (`2`, `-1`, `"paid"`), when the code gives one.
   * Rendered as `Name = 2`; `Name = ...` leaves the value open.
   */
  value?: string;
  soft: Soft;
}

interface SymbolBase {
  name: string;
  soft: Soft;
  loc?: Location;
}

export interface EnumSymbol extends SymbolBase {
  kind: "enum";
  /** Extra bases besides plain `Enum` (e.g. `IntEnum`), usually empty. */
  bases: string[];
  /** Kept in source order: enum member order can be meaningful. */
  members: EnumMember[];
  /** Methods (Rust: from `impl` blocks), rendered after the members; absent when none. */
  methods?: MethodMember[];
}

export interface TypeAliasSymbol extends SymbolBase {
  kind: "type";
  typeParams: string[];
  type: string;
}

export interface ClassLikeSymbol extends SymbolBase {
  kind: "class" | "interface";
  typeParams: string[];
  /** Canonical base types, in source order (`Protocol` is implied for interfaces). */
  bases: string[];
  /** Canonical decorator expressions without `@` (classes only, e.g. `dataclass`). */
  decorators: string[];
  members: Member[];
  /**
   * Dataclasses and records, code side only: the number of leading fields that are constructor
   * parameters, in declaration order. Not rendered; the sketch shows the order itself.
   */
  positional?: number;
}

export interface FunctionSymbol extends SymbolBase {
  kind: "function";
  signatures: Signature[];
}

export interface ConstSymbol extends SymbolBase {
  kind: "const";
  type: string;
}

export type ArchSymbol =
  | EnumSymbol
  | TypeAliasSymbol
  | ClassLikeSymbol
  | FunctionSymbol
  | ConstSymbol;

/** `from .other import a, b` lines: documentation only, never checked. */
export interface ReExport {
  from: string;
  names: string[];
  leading: string[];
}

export const HEADER_KEYS = [
  "__module__",
  "__paths__",
  "__entry__",
  "__depends_on__",
  "__external__",
  "__strictness__",
] as const;

export type HeaderKey = (typeof HEADER_KEYS)[number];

export interface HeaderSoft {
  leading: string[];
  trailing: string | null;
}

export interface ModuleSoft {
  /** Comments before the module docstring. */
  fileLeading: string[];
  /** Raw module docstring literal. */
  docstring: string | null;
  docstringTrailing: string | null;
  header: Partial<Record<HeaderKey, HeaderSoft>>;
  /** Comments after the last symbol. */
  fileTrailing: string[];
}

export function emptyModuleSoft(): ModuleSoft {
  return {
    fileLeading: [],
    docstring: null,
    docstringTrailing: null,
    header: {},
    fileTrailing: [],
  };
}

export interface ArchModule {
  name: string;
  /** Globs (POSIX, relative to the repo root) of the files that belong to this module. */
  paths: string[];
  entry: string | null;
  dependsOn: string[];
  /** null: external packages are not checked for this module. */
  external: string[] | null;
  strictness: Strictness;
  reexports: ReExport[];
  symbols: ArchSymbol[];
  soft: ModuleSoft;
  /** 1-based line of each header field in the sketch (set by the parser). */
  headerLines?: Partial<Record<HeaderKey, number>>;
}

export interface ArchModel {
  modules: ArchModule[];
}

/** Type placeholder for a missing annotation (syntactic extraction). */
export const INFERRED = "<inferred>";
/** Type placeholder for overly long types in `--typed` mode. */
export const COMPLEX = "<complex>";

/**
 * Puts the constructor fields `names` first, in that order, and sorts the other members by name,
 * so that only the constructor order depends on the source.
 */
export function positionalFirst(sym: ClassLikeSymbol, names: string[]): void {
  const head = names.flatMap((n) => {
    const m = sym.members.find((x) => x.kind === "field" && x.name === n);
    return m ? [m] : [];
  });
  const rest = sym.members
    .filter((m) => !head.includes(m))
    .sort((a, b) => compareNames(a.name, b.name));
  sym.members = [...head, ...rest];
  sym.positional = head.length;
}

/** Deterministic, locale-independent ordering: case-insensitive first, then exact. */
export function compareNames(a: string, b: string): number {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  if (la !== lb) return la < lb ? -1 : 1;
  if (a !== b) return a < b ? -1 : 1;
  return 0;
}
