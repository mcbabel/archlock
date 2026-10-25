/**
 * Syntactic Go extraction: one file → FileFacts, using the tree-sitter Go grammar.
 *
 * Public names are the exported (capitalized) top-level identifiers of a package that is not
 * `main`. Methods are collected by receiver type and attached to their type per package
 * (`attachGoMethods`), because Go allows declaring them in any file of the package.
 */

import type { Node, Parser } from "web-tree-sitter";
import { canonicalType, toSketchName } from "../../core/canonical.js";
import {
  type ArchSymbol,
  type ClassLikeSymbol,
  emptySoft,
  type FieldMember,
  type FunctionSymbol,
  INFERRED,
  type Location,
  type Member,
  type MethodMember,
  type Param,
  type Signature,
} from "../../core/model.js";
import { countLines } from "../../fs/files.js";
import type { FileFacts } from "../facts.js";

function named(node: Node): Node[] {
  return node.namedChildren.filter((c): c is Node => c !== null && c.type !== "comment");
}

function fields(node: Node, name: string): Node[] {
  return node.childrenForFieldName(name).filter((c): c is Node => c !== null);
}

export function isExported(name: string): boolean {
  return /^\p{Lu}/u.test(name);
}

function typeText(node: Node): string {
  return canonicalType(node.text);
}

/** `[K comparable, V any]` → `K comparable`, `V` (an `any` constraint is left out). */
function typeParams(list: Node | null): string[] {
  if (!list) return [];
  const out: string[] = [];
  for (const decl of named(list)) {
    if (decl.type !== "type_parameter_declaration") continue;
    const constraint = decl.childForFieldName("type");
    const c = constraint ? typeText(constraint) : "any";
    for (const n of fields(decl, "name")) out.push(c === "any" ? n.text : `${n.text} ${c}`);
  }
  return out;
}

/** Parameters; unnamed and blank (`_`) parameters are named `_1`, `_2`, … by position. */
function params(list: Node | null): Param[] {
  if (!list) return [];
  const out: Param[] = [];
  for (const decl of named(list)) {
    const type = decl.childForFieldName("type");
    const t = type ? typeText(type) : INFERRED;
    const kind = decl.type === "variadic_parameter_declaration" ? "rest" : "normal";
    const names = fields(decl, "name");
    for (const n of names.length > 0 ? names : [null]) {
      const name = n && n.text !== "_" ? toSketchName(n.text) : `_${out.length + 1}`;
      out.push({ kind, name, type: t, optional: false });
    }
  }
  return out;
}

/** Result types without their names: `(n int, err error)` → `(int, error)`; none → null. */
function results(result: Node | null): string | null {
  if (!result) return null;
  if (result.type !== "parameter_list") return typeText(result);
  const types: string[] = [];
  for (const decl of named(result)) {
    const type = decl.childForFieldName("type");
    const t = type ? typeText(type) : INFERRED;
    const count = Math.max(1, fields(decl, "name").length);
    for (let i = 0; i < count; i++) types.push(t);
  }
  if (types.length === 0) return null;
  return types.length === 1 ? (types[0] as string) : canonicalType(`(${types.join(", ")})`);
}

function signature(node: Node): Signature {
  return {
    typeParams: typeParams(node.childForFieldName("type_parameters")),
    params: params(node.childForFieldName("parameters")),
    returns: results(node.childForFieldName("result")),
    async: false,
  };
}

/** The receiver's type name: `(s *Store)` and `(p Pair[K, V])` → `Store`, `Pair`. */
function receiverName(receiver: Node | null): string | null {
  const decl = receiver ? named(receiver)[0] : undefined;
  let t = decl?.childForFieldName("type") ?? null;
  while (t && (t.type === "pointer_type" || t.type === "parenthesized_type"))
    t = named(t)[0] ?? null;
  if (t?.type === "generic_type") t = t.childForFieldName("type");
  return t?.type === "type_identifier" ? t.text : null;
}

const GOOS = new Set([
  "aix",
  "android",
  "darwin",
  "dragonfly",
  "freebsd",
  "illumos",
  "ios",
  "js",
  "linux",
  "netbsd",
  "openbsd",
  "plan9",
  "solaris",
  "wasip1",
  "windows",
]);
const GOARCH = new Set([
  "386",
  "amd64",
  "arm",
  "arm64",
  "loong64",
  "mips",
  "mips64",
  "mips64le",
  "mipsle",
  "ppc64",
  "ppc64le",
  "riscv64",
  "s390x",
  "wasm",
]);

/** The build constraint: a `//go:build` line, or the GOOS/GOARCH suffix of the file name. */
function buildConstraint(root: Node, path: string): string | null {
  for (const c of root.namedChildren) {
    if (!c || c.type === "package_clause") break;
    const m = c.type === "comment" ? /^\/\/go:build\s+(.+)$/.exec(c.text) : null;
    if (m) return (m[1] as string).trim().replace(/\s+/g, " ");
  }
  const parts = (path.split("/").pop() ?? "")
    .replace(/(_test)?\.go$/, "")
    .split("_")
    .slice(1);
  const tags = parts.slice(-2).filter((p) => GOOS.has(p) || GOARCH.has(p));
  return tags.length > 0 ? tags.join(" && ") : null;
}

/** `//go:build ignore` (or `// +build ignore`) before the package clause. */
function buildIgnored(root: Node): boolean {
  for (const c of root.namedChildren) {
    if (!c || c.type === "package_clause") break;
    if (c.type === "comment" && /^\/\/(go:build|\s*\+build)\s+ignore\b/.test(c.text)) return true;
  }
  return false;
}

export function extractGoFile(parser: Parser, path: string, text: string): FileFacts {
  const tree = parser.parse(text);
  if (!tree) throw new Error(`could not parse ${path}`);
  try {
    return new GoFileExtractor(path).run(tree.rootNode, countLines(text));
  } finally {
    tree.delete();
  }
}

class GoFileExtractor {
  private readonly facts: FileFacts;

  constructor(private readonly path: string) {
    this.facts = {
      path,
      language: "go",
      lines: 0,
      imports: [],
      exports: new Map(),
      stars: [],
      declarations: new Map(),
      bindings: new Map(),
      goMethods: [],
    };
  }

  run(root: Node, lines: number): FileFacts {
    this.facts.lines = lines;
    // Files excluded from every build (code generators and the like) are not part of the package.
    if (buildIgnored(root)) return this.facts;
    const constraint = buildConstraint(root, this.path);
    if (constraint) this.facts.goBuild = constraint;
    for (const decl of named(root)) {
      switch (decl.type) {
        case "import_declaration":
          this.imports(decl);
          break;
        case "function_declaration":
          this.function(decl);
          break;
        case "method_declaration":
          this.method(decl);
          break;
        case "type_declaration":
          for (const spec of named(decl)) this.typeSpec(spec);
          break;
        case "const_declaration":
          this.constants(decl);
          break;
        case "var_declaration":
          this.variables(decl);
          break;
        default:
          break;
      }
    }
    // A main package cannot be imported, so it has no public API.
    const pkg = named(root).find((n) => n.type === "package_clause");
    if (pkg && named(pkg)[0]?.text !== "main") {
      for (const name of this.facts.declarations.keys()) {
        this.facts.exports.set(name, { kind: "local", local: name });
      }
    } else {
      this.facts.declarations.clear();
      this.facts.goMethods = [];
    }
    return this.facts;
  }

  private loc(node: Node): Location {
    return {
      file: this.path,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
    };
  }

  private declare(name: string, symbol: ArchSymbol): void {
    if (!isExported(name) || this.facts.declarations.has(name)) return;
    this.facts.declarations.set(name, [symbol]);
  }

  private imports(decl: Node): void {
    const specs = named(decl).flatMap((n) => (n.type === "import_spec_list" ? named(n) : [n]));
    for (const spec of specs) {
      if (spec.type !== "import_spec") continue;
      const pathNode = spec.childForFieldName("path");
      if (!pathNode) continue;
      const loc = this.loc(spec);
      this.facts.imports.push({
        specifier: pathNode.text.slice(1, -1),
        names: ["*"],
        line: loc.line,
        column: loc.column,
        typeOnly: false,
      });
    }
  }

  private function(decl: Node): void {
    const name = decl.childForFieldName("name")?.text ?? "";
    this.declare(name, {
      kind: "function",
      name,
      signatures: [signature(decl)],
      soft: emptySoft(),
      loc: this.loc(decl),
    });
  }

  private method(decl: Node): void {
    const name = decl.childForFieldName("name")?.text ?? "";
    const receiverList = decl.childForFieldName("receiver");
    const receiver = receiverName(receiverList);
    if (!receiver || !isExported(name)) return;
    const method = this.methodMember(name, decl);
    // A pointer receiver is the usual one; a value receiver (`func (r Role)`) is recorded.
    const type = (receiverList ? named(receiverList)[0] : undefined)?.childForFieldName("type");
    if (type && type.type !== "pointer_type") {
      for (const sig of method.signatures) sig.receiver = typeText(type);
    }
    this.facts.goMethods?.push({ receiver, method });
  }

  private methodMember(name: string, node: Node): MethodMember {
    return {
      kind: "method",
      name: toSketchName(name),
      signatures: [signature(node)],
      static: false,
      classmethod: false,
      abstract: false,
      optional: false,
      soft: emptySoft(),
      loc: this.loc(node),
    };
  }

  private typeSpec(spec: Node): void {
    const name = spec.childForFieldName("name")?.text ?? "";
    const type = spec.childForFieldName("type");
    if (!type) return;
    const tp = typeParams(spec.childForFieldName("type_parameters"));
    const loc = this.loc(spec);
    if (spec.type === "type_alias") {
      this.declare(name, {
        kind: "type",
        name,
        typeParams: tp,
        type: typeText(type),
        soft: emptySoft(),
        loc,
      });
      return;
    }
    if (spec.type !== "type_spec") return;
    const symbol: ClassLikeSymbol = {
      kind: type.type === "interface_type" ? "interface" : "class",
      name,
      typeParams: tp,
      bases: [],
      decorators: [],
      members: [],
      soft: emptySoft(),
      loc,
    };
    if (type.type === "struct_type") this.struct(type, symbol);
    else if (type.type === "interface_type") this.interface(type, symbol);
    // A defined type (`type Color int`) has its underlying type as the base.
    else symbol.bases.push(typeText(type));
    this.declare(name, symbol);
  }

  private struct(type: Node, symbol: ClassLikeSymbol): void {
    const list = named(type).find((n) => n.type === "field_declaration_list");
    for (const field of list ? named(list) : []) {
      if (field.type !== "field_declaration") continue;
      const t = field.childForFieldName("type");
      if (!t) continue;
      const names = fields(field, "name");
      if (names.length === 0) {
        // An embedded field: its fields and methods are promoted, like a base class.
        symbol.bases.push(canonicalType(field.text.slice(0, t.endIndex - field.startIndex)));
        continue;
      }
      for (const n of names) {
        if (isExported(n.text)) symbol.members.push(this.field(n.text, typeText(t), field));
      }
    }
  }

  private interface(type: Node, symbol: ClassLikeSymbol): void {
    for (const elem of named(type)) {
      if (elem.type === "method_elem") {
        const name = elem.childForFieldName("name")?.text ?? "";
        if (isExported(name)) symbol.members.push(this.methodMember(name, elem));
        // An unexported method keeps other packages from implementing the interface.
        else if (!symbol.decorators.includes("sealed")) symbol.decorators.push("sealed");
      } else if (elem.type === "type_elem") {
        // Embedded interfaces and type sets (`~int | ~string`).
        symbol.bases.push(typeText(elem));
      }
    }
  }

  private field(name: string, type: string, node: Node): FieldMember {
    return {
      kind: "field",
      name: toSketchName(name),
      type,
      readonly: false,
      optional: false,
      static: false,
      soft: emptySoft(),
      loc: this.loc(node),
    };
  }

  /**
   * Constants. A spec without type and value repeats the previous one (`iota` groups); an untyped
   * constant has Go's designation for its kind (`untyped string`).
   */
  private constants(decl: Node): void {
    let previous: (string | null)[] = [];
    for (const spec of named(decl)) {
      if (spec.type !== "const_spec") continue;
      const type = spec.childForFieldName("type");
      const values = spec.childForFieldName("value");
      const names = fields(spec, "name");
      if (type) previous = names.map(() => typeText(type));
      else if (values) {
        previous = named(values).map((v) => {
          const kind = constantKind(v);
          return kind ? `untyped ${kind}` : null;
        });
      }
      names.forEach((n, i) => {
        this.declare(n.text, {
          kind: "const",
          name: n.text,
          type: previous[i] ?? INFERRED,
          soft: emptySoft(),
          loc: this.loc(spec),
        });
      });
    }
  }

  /** Variables: the declared type, or the type of a value whose type is evident. */
  private variables(decl: Node): void {
    const specs = named(decl).flatMap((n) => (n.type === "var_spec_list" ? named(n) : [n]));
    for (const spec of specs) {
      if (spec.type !== "var_spec") continue;
      const type = spec.childForFieldName("type");
      const values = spec.childForFieldName("value");
      const valueNodes = values ? named(values) : [];
      fields(spec, "name").forEach((n, i) => {
        const value = valueNodes[i];
        this.declare(n.text, {
          kind: "const",
          name: n.text,
          type: type ? typeText(type) : ((value && valueType(value)) ?? INFERRED),
          soft: emptySoft(),
          loc: this.loc(spec),
        });
      });
    }
  }
}

const LITERAL_KINDS: Record<string, string> = {
  interpreted_string_literal: "string",
  raw_string_literal: "string",
  int_literal: "int",
  float_literal: "float",
  imaginary_literal: "complex",
  rune_literal: "rune",
  true: "bool",
  false: "bool",
  iota: "int",
};

const DEFAULT_TYPES: Record<string, string> = {
  string: "string",
  int: "int",
  float: "float64",
  complex: "complex128",
  rune: "rune",
  bool: "bool",
};

/** The kind of an untyped constant expression (`"a"`, `1 << iota`), or null if not evident. */
function constantKind(node: Node): string | null {
  const literal = LITERAL_KINDS[node.type];
  if (literal) return literal;
  if (node.type === "parenthesized_expression" || node.type === "unary_expression") {
    const inner = named(node)[0];
    return inner ? constantKind(inner) : null;
  }
  if (node.type === "binary_expression") {
    const op = node.childForFieldName("operator")?.text ?? "";
    if (["==", "!=", "<", "<=", ">", ">=", "&&", "||"].includes(op)) return "bool";
    const left = node.childForFieldName("left");
    const right = node.childForFieldName("right");
    const l = left ? constantKind(left) : null;
    if (op === "<<" || op === ">>") return l;
    const r = right ? constantKind(right) : null;
    return l !== null && l === r ? l : null;
  }
  return null;
}

/** The type of a variable's value when it is evident from the syntax. */
function valueType(node: Node): string | null {
  const kind = constantKind(node);
  if (kind) return DEFAULT_TYPES[kind] ?? null;
  if (node.type === "composite_literal") {
    const t = node.childForFieldName("type");
    return t ? typeText(t) : null;
  }
  if (node.type === "unary_expression" && node.childForFieldName("operator")?.text === "&") {
    const operand = node.childForFieldName("operand");
    const t = operand?.type === "composite_literal" ? operand.childForFieldName("type") : null;
    return t ? canonicalType(`*${t.text}`) : null;
  }
  if (node.type === "call_expression") {
    const fn = node.childForFieldName("function")?.text;
    if (fn === "errors.New" || fn === "fmt.Errorf") return "error";
  }
  return null;
}

/** Signatures that differ only in their decorators are the same. */
function sameSignature(a: Signature, b: Signature): boolean {
  const key = (s: Signature) =>
    JSON.stringify([s.typeParams, s.params, s.returns, s.receiver ?? null]);
  return key(a) === key(b);
}

/**
 * Build variants (`path_linux.go`, `path_windows.go`) with different signatures: each becomes
 * a signature of the first file's symbol, marked with its constraint (`@build("linux")`).
 */
function mergeVariant(
  target: Signature[],
  targetBuild: string | undefined,
  variant: Signature[],
  variantBuild: string | undefined,
): void {
  const mark = (sig: Signature, build: string | undefined) => {
    if (build && !sig.decorators?.some((d) => d.startsWith("build("))) {
      sig.decorators = [
        ...(sig.decorators ?? []),
        canonicalType(`build(${JSON.stringify(build)})`),
      ];
    }
  };
  for (const sig of variant) {
    if (target.some((t) => sameSignature(t, sig))) continue;
    for (const t of target) mark(t, targetBuild);
    const copy = structuredClone(sig);
    mark(copy, variantBuild);
    target.push(copy);
  }
}

/**
 * Attaches the methods collected by `extractGoFile` to their types, per package (directory).
 * Works on copies of the declarations, so cached facts stay as extracted.
 */
export function attachGoMethods(facts: FileFacts[]): void {
  const byDir = new Map<string, FileFacts[]>();
  for (const f of facts) {
    if (f.language !== "go") continue;
    f.declarations = new Map([...f.declarations].map(([k, v]) => [k, structuredClone(v)]));
    const dir = f.path.includes("/") ? f.path.slice(0, f.path.lastIndexOf("/")) : "";
    byDir.set(dir, [...(byDir.get(dir) ?? []), f]);
  }
  for (const files of byDir.values()) {
    const types = new Map<string, ClassLikeSymbol>();
    for (const f of files) {
      for (const [name, symbols] of f.declarations) {
        const s = symbols[0];
        if (s && (s.kind === "class" || s.kind === "interface") && !types.has(name)) {
          types.set(name, s);
        }
      }
    }
    const functions = new Map<string, { fn: FunctionSymbol; build: string | undefined }>();
    for (const f of files) {
      for (const [name, symbols] of f.declarations) {
        const s = symbols[0];
        if (s?.kind !== "function") continue;
        const first = functions.get(name);
        if (!first) functions.set(name, { fn: s, build: f.goBuild });
        else mergeVariant(first.fn.signatures, first.build, s.signatures, f.goBuild);
      }
    }
    const methodBuild = new Map<MethodMember, string | undefined>();
    for (const f of files) {
      for (const { receiver, method } of f.goMethods ?? []) {
        const t = types.get(receiver);
        if (t?.kind !== "class") continue;
        const members: Member[] = t.members;
        const existing = members.find((m) => m.kind === "method" && m.name === method.name);
        if (existing?.kind === "method") {
          mergeVariant(
            existing.signatures,
            methodBuild.get(existing),
            method.signatures,
            f.goBuild,
          );
        } else if (!existing) {
          const copy = structuredClone(method);
          methodBuild.set(copy, f.goBuild);
          members.push(copy);
        }
      }
    }
  }
}
