/**
 * Syntactic Python extraction: one file → FileFacts, using the tree-sitter Python grammar.
 *
 * Public names: those listed in `__all__`; without `__all__`, every top-level definition whose
 * name does not start with an underscore (imports only when re-exported as `import x as x`).
 */

import type { Node, Parser } from "web-tree-sitter";
import { canonicalType } from "../../core/canonical.js";
import {
  type ArchSymbol,
  type ClassLikeSymbol,
  type EnumSymbol,
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
import {
  isDocstring,
  kids,
  named,
  param,
  splitDecorated,
  typeAliasParams,
  typeOf,
  typeParams,
  unwrapType,
} from "../../sketch/pysyntax.js";
import type { FileFacts, ImportFact } from "../facts.js";

const ENUM_BASES = new Set(["Enum", "IntEnum", "StrEnum", "Flag", "IntFlag"]);
const SKIPPED_DUNDERS = new Set([
  "__repr__",
  "__str__",
  "__post_init__",
  "__init_subclass__",
  "__class_getitem__",
  "__del__",
  "__hash__",
  "__slots__",
  "__module__",
  "__qualname__",
  "__annotations__",
]);
const TYPE_HELPERS = new Set(["TypeVar", "ParamSpec", "TypeVarTuple"]);
const TYPING_CONSTRUCTS = new Set([
  "Union",
  "Optional",
  "Literal",
  "Callable",
  "Annotated",
  "Dict",
  "List",
  "Tuple",
  "Set",
  "FrozenSet",
  "Type",
  "dict",
  "list",
  "tuple",
  "set",
  "frozenset",
  "type",
  "Mapping",
  "MutableMapping",
  "Sequence",
  "MutableSequence",
  "Iterable",
  "Iterator",
  "Awaitable",
  "Coroutine",
  "Generator",
  "AsyncIterator",
  "AsyncIterable",
  "AsyncGenerator",
]);

function lastSegment(name: string): string {
  return name.split(".").pop() ?? name;
}

function isPublic(name: string): boolean {
  return !name.startsWith("_");
}

function isDunder(name: string): boolean {
  return name.startsWith("__") && name.endsWith("__") && name.length > 4;
}

/** typeOf without failing: unsupported spellings fall back to the canonical source text. */
function safeType(node: Node): string {
  let t: string;
  try {
    t = typeOf(node);
  } catch {
    t = canonicalType(node.text);
  }
  return unquoteForwardRefs(t);
}

/**
 * Python forward references: `Optional["Session"]` is the type `Optional[Session]`. String
 * literals inside `Literal[...]` / `Annotated[...]` metadata are values and stay quoted.
 */
export function unquoteForwardRefs(type: string): string {
  if (!type.includes('"')) return type;
  let out = "";
  const stack: string[] = [];
  let changed = false;
  for (let i = 0; i < type.length; i++) {
    const ch = type[i] as string;
    if (ch === "[") {
      stack.push(/([A-Za-z_][\w.]*)\s*$/.exec(out)?.[1] ?? "");
      out += ch;
    } else if (ch === "]") {
      stack.pop();
      out += ch;
    } else if (ch === '"') {
      let j = i + 1;
      while (j < type.length && type[j] !== '"') j += type[j] === "\\" ? 2 : 1;
      const literal = type.slice(i, j + 1);
      const owner = lastSegment(stack[stack.length - 1] ?? "");
      if (stack.length > 0 && owner !== "Literal" && owner !== "Annotated") {
        out += literal.slice(1, -1);
        changed = true;
      } else out += literal;
      i = j;
    } else out += ch;
  }
  return changed ? canonicalType(out) : type;
}

function safeTypeParams(def: Node): string[] {
  try {
    return typeParams(def);
  } catch {
    return [];
  }
}

function decoratorName(d: Node): string {
  const callee = d.type === "call" ? (d.childForFieldName("function") ?? d) : d;
  return callee.text;
}

export function extractPythonFile(parser: Parser, path: string, text: string): FileFacts {
  const tree = parser.parse(text);
  if (!tree) throw new Error(`could not parse ${path}`);
  try {
    return new PythonFileExtractor(path).run(tree.rootNode, countLines(text));
  } finally {
    tree.delete();
  }
}

class PythonFileExtractor {
  private readonly facts: FileFacts;
  private all: string[] | null = null;
  private readonly reexported = new Set<string>();
  private readonly functions = new Map<string, Node[]>();

  constructor(private readonly path: string) {
    this.facts = {
      path,
      language: "python",
      lines: 0,
      imports: [],
      exports: new Map(),
      stars: [],
      declarations: new Map(),
      bindings: new Map(),
    };
  }

  run(root: Node, lines: number): FileFacts {
    this.facts.lines = lines;
    this.statements(named(root), false);
    for (const [name, defs] of this.functions) this.declare(name, this.functionSymbol(name, defs));

    if (this.all !== null) {
      this.facts.explicitExports = true;
      for (const name of this.all) this.facts.exports.set(name, { kind: "local", local: name });
    } else {
      for (const name of this.facts.declarations.keys()) {
        if (isPublic(name)) this.facts.exports.set(name, { kind: "local", local: name });
      }
      for (const name of this.reexported)
        this.facts.exports.set(name, { kind: "local", local: name });
      // A package's __init__.py re-exports what it imports from its own submodules.
      if (/(^|\/)__init__\.py$/.test(this.path)) {
        for (const [local, b] of this.facts.bindings) {
          if (b.specifier.startsWith(".") && isPublic(local)) {
            this.facts.exports.set(local, { kind: "local", local });
          }
        }
      }
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
    // The first definition wins (e.g. `try: ... except ImportError: ...` fallbacks).
    if (this.facts.declarations.has(name)) return;
    this.facts.declarations.set(name, [symbol]);
  }

  private statements(nodes: Node[], typeOnly: boolean): void {
    for (const stmt of nodes) {
      switch (stmt.type) {
        case "import_statement":
          this.importStatement(stmt, typeOnly);
          break;
        case "import_from_statement":
          this.importFrom(stmt, typeOnly);
          break;
        case "function_definition":
        case "decorated_definition":
        case "class_definition":
          this.definition(stmt);
          break;
        case "expression_statement":
          this.expression(stmt);
          break;
        case "type_alias_statement":
          this.typeAliasStatement(stmt);
          break;
        case "if_statement": {
          const cond = stmt.childForFieldName("condition")?.text ?? "";
          const checking = /^(typing\.)?TYPE_CHECKING$/.test(cond);
          for (const block of this.blocks(stmt))
            this.statements(named(block), typeOnly || checking);
          break;
        }
        case "try_statement":
          for (const block of this.blocks(stmt)) this.statements(named(block), typeOnly);
          break;
        default:
          break;
      }
    }
  }

  /** All statement blocks of an if/try statement, in source order. */
  private blocks(stmt: Node): Node[] {
    const out: Node[] = [];
    const visit = (n: Node) => {
      for (const c of named(n)) {
        if (c.type === "block") out.push(c);
        else if (
          [
            "elif_clause",
            "else_clause",
            "except_clause",
            "finally_clause",
            "except_group_clause",
          ].includes(c.type)
        ) {
          visit(c);
        }
      }
    };
    visit(stmt);
    return out;
  }

  private addImport(fact: Omit<ImportFact, "line" | "column">, node: Node): void {
    const loc = this.loc(node);
    this.facts.imports.push({ ...fact, line: loc.line, column: loc.column });
  }

  private importStatement(stmt: Node, typeOnly: boolean): void {
    for (const n of named(stmt)) {
      if (n.type === "dotted_name") {
        this.addImport({ specifier: n.text, names: ["*"], typeOnly }, stmt);
        const top = n.text.split(".")[0] as string;
        this.facts.bindings.set(top, { specifier: top, name: "*" });
      } else if (n.type === "aliased_import") {
        const name = n.childForFieldName("name")?.text ?? "";
        const alias = n.childForFieldName("alias")?.text ?? name;
        this.addImport({ specifier: name, names: ["*"], typeOnly }, stmt);
        this.facts.bindings.set(alias, { specifier: name, name: "*" });
        if (alias === name) this.reexported.add(alias);
      }
    }
  }

  private importFrom(stmt: Node, typeOnly: boolean): void {
    const moduleNode = stmt.childForFieldName("module_name");
    if (!moduleNode) return;
    const specifier = moduleNode.text.replace(/\s+/g, "");
    if (specifier === "__future__") return;
    if (named(stmt).some((n) => n.type === "wildcard_import")) {
      this.facts.stars.push(specifier);
      this.addImport({ specifier, names: ["*"], typeOnly }, stmt);
      return;
    }
    for (const n of stmt.childrenForFieldName("name")) {
      if (!n) continue;
      const imported =
        n.type === "aliased_import" ? (n.childForFieldName("name")?.text ?? "") : n.text;
      const alias =
        n.type === "aliased_import" ? (n.childForFieldName("alias")?.text ?? imported) : imported;
      this.addImport({ specifier, names: [imported], typeOnly, submodule: imported }, stmt);
      this.facts.bindings.set(alias, { specifier, name: imported, submodule: true });
      if (n.type === "aliased_import" && alias === imported) this.reexported.add(alias);
    }
  }

  private definition(stmt: Node): void {
    const { def } = splitDecorated(stmt);
    const name = def.childForFieldName("name")?.text;
    if (!name) return;
    if (def.type === "function_definition") {
      const list = this.functions.get(name) ?? [];
      list.push(stmt);
      this.functions.set(name, list);
    } else if (def.type === "class_definition") {
      this.declare(name, this.classSymbol(stmt));
    }
  }

  private expression(stmt: Node): void {
    const node = named(stmt)[0];
    if (!node) return;
    if (node.type === "augmented_assignment") {
      // __all__ += [...]
      if (node.childForFieldName("left")?.text === "__all__") {
        this.all = [...(this.all ?? []), ...stringList(node.childForFieldName("right"))];
      }
      return;
    }
    if (node.type !== "assignment") return;
    const left = node.childForFieldName("left");
    const typeNode = node.childForFieldName("type");
    const right = node.childForFieldName("right");
    if (!left) return;
    if (left.type !== "identifier") {
      if (left.type === "pattern_list" || left.type === "tuple_pattern") {
        for (const id of named(left).filter((n) => n.type === "identifier")) {
          this.declare(id.text, {
            kind: "const",
            name: id.text,
            type: INFERRED,
            soft: emptySoft(),
            loc: this.loc(id),
          });
        }
      }
      return;
    }
    const name = left.text;
    if (name === "__all__") {
      this.all = stringList(right);
      return;
    }
    if (typeNode) {
      const aliasParams = typeAliasParams(typeNode);
      if (aliasParams && right) {
        this.declare(name, {
          kind: "type",
          name,
          typeParams: aliasParams.map((p) => safeType(p)),
          type: safeType(right),
          soft: emptySoft(),
          loc: this.loc(stmt),
        });
        return;
      }
      this.declare(name, {
        kind: "const",
        name,
        type: safeType(typeNode),
        soft: emptySoft(),
        loc: this.loc(stmt),
      });
      return;
    }
    if (!right) return;
    if (right.type === "call") {
      const fn = lastSegment(right.childForFieldName("function")?.text ?? "");
      if (TYPE_HELPERS.has(fn)) return;
      if (fn === "NewType") {
        const args = named(right.childForFieldName("arguments") as Node);
        const base = args[1];
        this.declare(name, {
          kind: "type",
          name,
          typeParams: [],
          type: canonicalType(`NewType[${base ? safeType(base) : INFERRED}]`),
          soft: emptySoft(),
          loc: this.loc(stmt),
        });
        return;
      }
    }
    if (looksLikeType(right)) {
      this.declare(name, {
        kind: "type",
        name,
        typeParams: [],
        type: safeType(right),
        soft: emptySoft(),
        loc: this.loc(stmt),
      });
      return;
    }
    this.declare(name, {
      kind: "const",
      name,
      type: INFERRED,
      soft: emptySoft(),
      loc: this.loc(stmt),
    });
  }

  private typeAliasStatement(stmt: Node): void {
    const left = stmt.childForFieldName("left");
    const right = stmt.childForFieldName("right");
    if (!left || !right) return;
    const inner = unwrapType(left);
    const name = inner.type === "generic_type" ? (named(inner)[0]?.text ?? "") : inner.text;
    const tp =
      inner.type === "generic_type"
        ? named(inner).find((n) => n.type === "type_parameter")
        : undefined;
    this.declare(name, {
      kind: "type",
      name,
      typeParams: tp ? named(tp).map((p) => safeType(p)) : [],
      type: safeType(right),
      soft: emptySoft(),
      loc: this.loc(stmt),
    });
  }

  private signature(def: Node, self: boolean, isInit: boolean): Signature {
    const paramsNode = def.childForFieldName("parameters");
    const nodes = paramsNode ? named(paramsNode).filter((n) => n.type !== "comment") : [];
    if (self && nodes[0]?.type === "identifier") nodes.shift();
    const params: Param[] = nodes.map((n) => {
      try {
        return param(n);
      } catch {
        return { kind: "normal", name: n.text, type: null, optional: false };
      }
    });
    const ret = def.childForFieldName("return_type");
    return {
      typeParams: safeTypeParams(def),
      params,
      returns: isInit ? null : ret ? safeType(ret) : INFERRED,
      async: kids(def).some((c) => c.type === "async"),
    };
  }

  private functionSymbol(name: string, stmts: Node[]): FunctionSymbol {
    const overloads = stmts.filter((s) =>
      splitDecorated(s).decorators.some((d) => lastSegment(decoratorName(d)) === "overload"),
    );
    const chosen = overloads.length > 0 ? overloads : stmts.slice(-1);
    const first = splitDecorated(stmts[0] as Node).def;
    return {
      kind: "function",
      name,
      signatures: chosen.map((s) => this.signature(splitDecorated(s).def, false, false)),
      soft: emptySoft(),
      loc: this.loc(first),
    };
  }

  private classSymbol(stmt: Node): ArchSymbol {
    const { def, decorators } = splitDecorated(stmt);
    const name = def.childForFieldName("name")?.text ?? "";
    const bases: string[] = [];
    const superclasses = def.childForFieldName("superclasses");
    for (const arg of superclasses ? named(superclasses) : []) {
      if (arg.type === "keyword_argument" || arg.type === "comment") continue;
      bases.push(safeType(arg));
    }
    const baseNames = bases.map((b) => lastSegment(b.replace(/\[.*$/, "")));
    const body = def.childForFieldName("body");
    const statements = body ? named(body).filter((n) => n.type !== "comment") : [];
    const loc = this.loc(def);

    if (baseNames.some((b) => ENUM_BASES.has(b))) {
      const members = [];
      for (const s of statements) {
        const a = s.type === "expression_statement" ? named(s)[0] : undefined;
        const left = a?.type === "assignment" ? a.childForFieldName("left") : null;
        if (left?.type === "identifier" && isPublic(left.text) && !a?.childForFieldName("type")) {
          members.push({ name: left.text, soft: emptySoft() });
        }
      }
      const enumBases = bases.filter((b) => lastSegment(b) !== "Enum");
      const sym: EnumSymbol = {
        kind: "enum",
        name,
        bases: enumBases,
        members,
        soft: emptySoft(),
        loc,
      };
      return sym;
    }

    const isProtocol = baseNames.includes("Protocol");
    const members = new Map<string, Member>();
    const add = (m: Member) => {
      if (!members.has(`${m.kind}:${m.name}`) && !members.has(`field:${m.name}`))
        members.set(`${m.kind}:${m.name}`, m);
    };
    const methods = new Map<string, Node[]>();
    const properties = new Map<string, { getter: Node; setter: boolean }>();

    for (const s of statements) {
      if (isDocstring(s)) continue;
      if (s.type === "expression_statement") {
        const a = named(s)[0];
        if (a?.type !== "assignment") continue;
        const left = a.childForFieldName("left");
        if (left?.type !== "identifier" || !isPublic(left.text) || SKIPPED_DUNDERS.has(left.text))
          continue;
        const typeNode = a.childForFieldName("type");
        add(this.field(left.text, typeNode, typeNode === null, s));
        continue;
      }
      if (s.type !== "function_definition" && s.type !== "decorated_definition") continue;
      const { def: fn, decorators: decos } = splitDecorated(s);
      if (fn.type !== "function_definition") continue;
      const mname = fn.childForFieldName("name")?.text ?? "";
      const names = decos.map((d) => decoratorName(d));
      if (names.some((d) => ["property", "cached_property"].includes(lastSegment(d)))) {
        properties.set(mname, { getter: fn, setter: properties.get(mname)?.setter ?? false });
        continue;
      }
      if (names.some((d) => d === `${mname}.setter`)) {
        const p = properties.get(mname);
        if (p) p.setter = true;
        continue;
      }
      if (names.some((d) => /\.(getter|deleter)$/.test(d))) continue;
      if (mname === "__init__") this.instanceAttributes(fn, add);
      if ((!isPublic(mname) && !isDunder(mname)) || SKIPPED_DUNDERS.has(mname)) continue;
      methods.set(mname, [...(methods.get(mname) ?? []), s]);
    }
    for (const [pname, { getter, setter }] of properties) {
      if (!isPublic(pname)) continue;
      const ret = getter.childForFieldName("return_type");
      add({
        kind: "field",
        name: pname,
        type: ret ? safeType(ret) : INFERRED,
        readonly: !setter,
        optional: false,
        static: false,
        soft: emptySoft(),
        loc: this.loc(getter),
      });
    }
    for (const [mname, stmts] of methods) add(this.method(mname, stmts));

    const classDecorators = decorators
      .filter((d) => lastSegment(decoratorName(d)) === "dataclass")
      .map((d) => d.text.replace(/\s+/g, " "));
    const sym: ClassLikeSymbol = {
      kind: isProtocol ? "interface" : "class",
      name,
      typeParams: safeTypeParams(def),
      bases: bases.filter((b) => !/^(typing\.)?Protocol(\[.*\])?$/.test(b)),
      decorators: classDecorators,
      members: [...members.values()],
      soft: emptySoft(),
      loc,
    };
    return sym;
  }

  private field(
    name: string,
    typeNode: Node | null,
    classAttribute: boolean,
    node: Node,
  ): FieldMember {
    let type = INFERRED;
    let isStatic = classAttribute;
    let readonly = false;
    if (typeNode) {
      type = safeType(typeNode);
      const m = /^(?:typing\.)?(ClassVar|Final)\[(.*)\]$/.exec(type);
      if (m) {
        if (m[1] === "ClassVar") isStatic = true;
        else readonly = true;
        type = canonicalType(m[2] as string);
      } else if (/^(typing\.)?(ClassVar|Final)$/.test(type)) {
        if (type.endsWith("ClassVar")) isStatic = true;
        else readonly = true;
        type = INFERRED;
      }
    }
    return {
      kind: "field",
      name,
      type,
      readonly,
      optional: false,
      static: isStatic,
      soft: emptySoft(),
      loc: this.loc(node),
    };
  }

  /** `self.x = ...` / `self.x: T = ...` in `__init__` are public instance attributes. */
  private instanceAttributes(init: Node, add: (m: Member) => void): void {
    const body = init.childForFieldName("body");
    if (!body) return;
    // `self.url = url` takes the annotated type of the `url` parameter.
    const paramTypes = new Map<string, string>();
    for (const p of this.signature(init, true, true).params) {
      if (p.type !== null) paramTypes.set(p.name, p.type);
    }
    for (const s of named(body)) {
      if (s.type !== "expression_statement") continue;
      const a = named(s)[0];
      if (a?.type !== "assignment") continue;
      const left = a.childForFieldName("left");
      if (left?.type !== "attribute" || left.childForFieldName("object")?.text !== "self") continue;
      const attr = left.childForFieldName("attribute")?.text ?? "";
      if (!isPublic(attr)) continue;
      const field = this.field(attr, a.childForFieldName("type"), false, s);
      const right = a.childForFieldName("right");
      if (field.type === INFERRED && right?.type === "identifier") {
        field.type = paramTypes.get(right.text) ?? INFERRED;
      }
      add(field);
    }
  }

  private method(name: string, stmts: Node[]): MethodMember {
    const decoNames = (s: Node) =>
      splitDecorated(s).decorators.map((d) => lastSegment(decoratorName(d)));
    const overloads = stmts.filter((s) => decoNames(s).includes("overload"));
    const chosen = overloads.length > 0 ? overloads : stmts.slice(-1);
    const names = decoNames(chosen[0] as Node);
    const isStatic = names.includes("staticmethod");
    const isClassmethod = names.includes("classmethod");
    return {
      kind: "method",
      name,
      signatures: chosen.map((s) =>
        this.signature(splitDecorated(s).def, !isStatic, name === "__init__"),
      ),
      static: isStatic,
      classmethod: isClassmethod,
      abstract: names.includes("abstractmethod"),
      optional: false,
      soft: emptySoft(),
      loc: this.loc(splitDecorated(chosen[0] as Node).def),
    };
  }
}

function stringList(node: Node | null): string[] {
  if (!node || !["list", "tuple"].includes(node.type)) return [];
  return named(node)
    .filter((n) => n.type === "string")
    .map((n) => n.text.replace(/^[rRuUbB]*(['"]{1,3})([\s\S]*)\1$/, "$2"));
}

const BUILTIN_TYPES = new Set([
  "int",
  "str",
  "float",
  "bool",
  "bytes",
  "complex",
  "object",
  "list",
  "dict",
  "set",
  "tuple",
  "frozenset",
  "type",
]);

/** `X = Union[A, B]`, `X = list[int]`, `X = A | None`: module-level type aliases without annotation. */
function looksLikeType(node: Node): boolean {
  if (node.type === "subscript") {
    const value = node.childForFieldName("value")?.text ?? "";
    return TYPING_CONSTRUCTS.has(lastSegment(value));
  }
  if (node.type === "binary_operator" && node.childForFieldName("operator")?.text === "|") {
    const operand = (n: Node | null): boolean =>
      n !== null &&
      (n.type === "none" ||
        (n.type === "identifier" && (/^[A-Z]/.test(n.text) || BUILTIN_TYPES.has(n.text))) ||
        (n.type === "attribute" && /^[A-Z]/.test(lastSegment(n.text))) ||
        looksLikeType(n) ||
        (n.type === "subscript" && /^[A-Z]/.test(n.childForFieldName("value")?.text ?? "")));
    return operand(node.childForFieldName("left")) && operand(node.childForFieldName("right"));
  }
  return false;
}
