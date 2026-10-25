/**
 * Parses `.arch.py` text into an ArchModule, attaching comments to the elements they describe.
 *
 * Attachment rules (docs/FORMAT.md):
 * - a comment on the same line as an element (after it) is that element's trailing comment;
 *   for classes and functions, the line of the header's `:` counts,
 * - a full-line comment attaches to the next element at the same level (leading),
 * - comments at the end of a class or inside a function body are body comments,
 * - comments after the last top-level element are file-trailing comments.
 */

import type { Node } from "web-tree-sitter";
import { canonicalType, decodePythonString, pythonString } from "../core/canonical.js";
import {
  type ArchModule,
  type ArchSymbol,
  type ClassLikeSymbol,
  type EnumMember,
  type EnumSymbol,
  emptyModuleSoft,
  emptySoft,
  type FieldMember,
  type FunctionSymbol,
  HEADER_KEYS,
  type HeaderKey,
  type HeaderSoft,
  type Member,
  type MethodMember,
  type Param,
  type ReExport,
  type Signature,
  type Soft,
  STRICTNESS_VALUES,
  type Strictness,
} from "../core/model.js";
import {
  colonRow,
  dedentDocstring,
  isDocstring,
  isOverloaded,
  kids,
  named,
  param,
  PySyntaxError as SketchSyntaxError,
  splitDecorated,
  typeAliasParams,
  typeOf,
  typeParam,
  typeParams,
  unwrapType,
  unwrapWrapper,
} from "./pysyntax.js";
import { FIELD_WRAPPERS } from "./render.js";
import { getPythonParser } from "./treesitter.js";

export interface SketchError {
  file: string;
  line: number;
  column: number;
  message: string;
}

export interface ParseResult {
  module: ArchModule | null;
  errors: SketchError[];
}

export const MODULE_NAME = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/;

const ENUM_BASES = new Set(["Enum", "IntEnum", "StrEnum", "Flag", "IntFlag"]);
const METHOD_DECORATORS = new Set([
  "overload",
  "staticmethod",
  "classmethod",
  "abstractmethod",
  "optional",
]);
/** Decorators that belong to one signature: modifiers that are part of a contract. */
const SIGNATURE_DECORATORS = new Set(["unsafe", "const", "extern", "throws", "build", "cfg"]);

/** The name of a decorator expression: `throws` for `@throws(IOException)`. */
function decoratorName(d: Node): string {
  return d.type === "call" ? (d.childForFieldName("function")?.text ?? "") : d.text;
}

/** Signature decorators of a definition, canonical, in source order. */
function signatureDecorators(decorators: Node[]): string[] {
  return decorators
    .filter((d) => SIGNATURE_DECORATORS.has(decoratorName(d)))
    .map((d) => canonicalType(d.text));
}

/**
 * An enum member's value as a canonical Python literal: numbers as written, strings in the
 * quoting `pythonString` produces; `...` and anything else leave the value open.
 */
function enumValue(node: Node): string | undefined {
  if (node.type === "integer" || node.type === "float") return node.text;
  if (node.type === "unary_operator" && /^-\s*\d/.test(node.text))
    return node.text.replace(/\s+/g, "");
  if (node.type === "true" || node.type === "false") return node.text;
  if (node.type === "string") {
    const decoded = decodePythonString(node.text);
    return decoded === null ? undefined : pythonString(decoded);
  }
  return undefined;
}

/** Something comments can attach to. */
interface Anchor {
  start: number;
  startRow: number;
  endRow: number;
  /** Row of a compound header's `:`; equals endRow for one-line elements. */
  headerRow: number;
  /** Whether a same-line comment after the element's end counts as trailing. */
  oneLine: boolean;
  leading: string[];
  setTrailing: (text: string) => void;
}

function commentText(node: Node): string {
  return node.text.trimEnd();
}

function firstSyntaxError(node: Node): Node | null {
  if (node.type === "ERROR" || node.isMissing) return node;
  if (!node.hasError) return null;
  for (const child of kids(node)) {
    const found = firstSyntaxError(child);
    if (found) return found;
  }
  return node;
}

/** Parses a sketch. Never throws for bad input; problems are returned as errors. */
export async function parseSketch(text: string, file: string): Promise<ParseResult> {
  const parser = await getPythonParser();
  const tree = parser.parse(text.replace(/\r\n?/g, "\n"));
  if (!tree) {
    return {
      module: null,
      errors: [{ file, line: 1, column: 1, message: "could not parse file" }],
    };
  }
  try {
    const root = tree.rootNode;
    const bad = firstSyntaxError(root);
    if (bad) {
      const snippet = bad.text.split("\n")[0]?.slice(0, 40) ?? "";
      const what = bad.isMissing ? `missing \`${bad.type}\`` : `unexpected \`${snippet}\``;
      return {
        module: null,
        errors: [
          {
            file,
            line: bad.startPosition.row + 1,
            column: bad.startPosition.column + 1,
            message: `invalid Python syntax: ${what}`,
          },
        ],
      };
    }
    return new SketchParser(file).parseModule(root);
  } finally {
    tree.delete();
  }
}

class SketchParser {
  private errors: SketchError[] = [];

  constructor(private readonly file: string) {}

  private error(node: Node, message: string): void {
    this.errors.push({
      file: this.file,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
      message,
    });
  }

  parseModule(root: Node): ParseResult {
    const soft = emptyModuleSoft();
    const header: Partial<Record<HeaderKey, { value: string | string[]; node: Node }>> = {};
    const symbols: ArchSymbol[] = [];
    const reexports: ReExport[] = [];
    const anchors: Anchor[] = [];
    const comments: Node[] = [];

    const statements = named(root);
    let seenStatement = false;
    for (const stmt of statements) {
      if (stmt.type === "comment") {
        comments.push(stmt);
        continue;
      }
      try {
        if (!seenStatement && isDocstring(stmt)) {
          soft.docstring = dedentDocstring(stmt.text);
          anchors.push({
            ...simpleAnchor(stmt),
            leading: soft.fileLeading,
            setTrailing: (t) => {
              soft.docstringTrailing = t;
            },
          });
        } else if (stmt.type === "expression_statement") {
          this.parseTopAssignment(stmt, header, soft, symbols, anchors);
        } else if (stmt.type === "type_alias_statement") {
          const sym = this.parseTypeAliasStatement(stmt);
          symbols.push(sym);
          anchors.push(symbolAnchor(stmt, sym.soft));
        } else if (stmt.type === "import_from_statement") {
          const re = this.parseReExport(stmt);
          reexports.push(re);
          anchors.push({ ...simpleAnchor(stmt), leading: re.leading, setTrailing: () => {} });
        } else if (
          stmt.type === "class_definition" ||
          stmt.type === "function_definition" ||
          stmt.type === "decorated_definition"
        ) {
          const sym = this.parseDefinition(stmt);
          if (sym.kind === "function") {
            const prev = symbols.find((s) => s.kind === "function" && s.name === sym.name);
            if (prev && prev.kind === "function") {
              if (!isOverloaded(stmt) || prev.signatures.length === 0) {
                throw new SketchSyntaxError(
                  `duplicate function \`${sym.name}\` (mark every variant with @overload)`,
                  stmt,
                );
              }
              prev.signatures.push(...sym.signatures);
              prev.soft.body.push(...sym.soft.leading, ...sym.soft.body);
              anchors.push(symbolAnchor(stmt, prev.soft, true));
              continue;
            }
          }
          symbols.push(sym);
          anchors.push(definitionAnchor(stmt, sym.soft));
        } else {
          throw new SketchSyntaxError(
            `unsupported statement (${stmt.type.replace(/_/g, " ")}); sketches contain only the ` +
              "header, classes, `def`s, constants and type aliases",
            stmt,
          );
        }
      } catch (e) {
        if (e instanceof SketchSyntaxError) this.error(e.node, e.message);
        else throw e;
      }
      seenStatement = true;
    }

    attachComments(comments, anchors, soft.fileTrailing);
    this.checkDuplicates(symbols);

    const name = header.__module__;
    const paths = header.__paths__;
    if (!name) this.error(root, 'missing `__module__ = "<name>"` in the sketch header');
    if (!paths) this.error(root, 'missing `__paths__ = ["<glob>", ...]` in the sketch header');
    if (this.errors.length > 0 || !name || !paths) {
      return { module: null, errors: this.errors };
    }

    const module: ArchModule = {
      name: name.value as string,
      paths: paths.value as string[],
      entry: (header.__entry__?.value as string | undefined) ?? null,
      dependsOn: (header.__depends_on__?.value as string[] | undefined) ?? [],
      external: (header.__external__?.value as string[] | undefined) ?? null,
      strictness: (header.__strictness__?.value as Strictness | undefined) ?? "signatures",
      reexports,
      symbols,
      soft,
      headerLines: Object.fromEntries(
        Object.entries(header).map(([k, v]) => [k, v.node.startPosition.row + 1]),
      ),
    };
    return { module, errors: [] };
  }

  private checkDuplicates(symbols: ArchSymbol[]): void {
    const seen = new Set<string>();
    for (const s of symbols) {
      const key = `${s.kind}:${s.name}`;
      if (seen.has(key)) {
        const line = s.loc?.line ?? 1;
        this.errors.push({
          file: this.file,
          line,
          column: 1,
          message: `duplicate ${s.kind} \`${s.name}\``,
        });
      }
      seen.add(key);
    }
  }

  private parseTopAssignment(
    stmt: Node,
    header: Partial<Record<HeaderKey, { value: string | string[]; node: Node }>>,
    soft: ArchModule["soft"],
    symbols: ArchSymbol[],
    anchors: Anchor[],
  ): void {
    const assign = named(stmt)[0];
    if (assign?.type !== "assignment" || named(stmt).length !== 1) {
      throw new SketchSyntaxError("unsupported expression; expected an assignment", stmt);
    }
    const left = assign.childForFieldName("left");
    const typeNode = assign.childForFieldName("type");
    const right = assign.childForFieldName("right");
    if (left?.type !== "identifier") {
      throw new SketchSyntaxError("the left side of an assignment must be a plain name", stmt);
    }
    const name = left.text;

    if ((HEADER_KEYS as readonly string[]).includes(name)) {
      const key = name as HeaderKey;
      if (typeNode || !right) {
        throw new SketchSyntaxError(`\`${key}\` must be a plain assignment`, stmt);
      }
      if (header[key]) throw new SketchSyntaxError(`\`${key}\` is set twice`, stmt);
      header[key] = { value: this.headerValue(key, right), node: stmt };
      const hs: HeaderSoft = { leading: [], trailing: null };
      soft.header[key] = hs;
      anchors.push({
        ...simpleAnchor(stmt),
        leading: hs.leading,
        setTrailing: (t) => {
          hs.trailing = t;
        },
      });
      return;
    }
    if (/^__\w+__$/.test(name)) {
      throw new SketchSyntaxError(
        `unknown header field \`${name}\`; known fields: ${HEADER_KEYS.join(", ")}`,
        left,
      );
    }
    if (!typeNode) {
      throw new SketchSyntaxError(
        `\`${name} = ...\` needs a type: write \`${name}: Type\` for a constant or ` +
          `\`${name}: TypeAlias = Type\` for a type alias`,
        stmt,
      );
    }
    const alias = typeAliasParams(typeNode);
    let sym: ArchSymbol;
    if (alias) {
      if (!right) throw new SketchSyntaxError(`type alias \`${name}\` needs a value`, stmt);
      sym = {
        kind: "type",
        name,
        typeParams: alias.map((n) => typeParam(n)),
        type: typeOf(right),
        soft: emptySoft(),
        loc: this.loc(stmt),
      };
    } else {
      if (right) {
        throw new SketchSyntaxError(
          `constant \`${name}\` must not have a value in a sketch; write \`${name}: Type\``,
          right,
        );
      }
      sym = {
        kind: "const",
        name,
        type: typeOf(typeNode),
        soft: emptySoft(),
        loc: this.loc(stmt),
      };
    }
    symbols.push(sym);
    anchors.push(symbolAnchor(stmt, sym.soft));
  }

  private headerValue(key: HeaderKey, node: Node): string | string[] {
    const listKeys: HeaderKey[] = ["__paths__", "__depends_on__", "__external__"];
    if (listKeys.includes(key)) {
      if (node.type !== "list") {
        throw new SketchSyntaxError(`\`${key}\` must be a list of strings, e.g. ["a", "b"]`, node);
      }
      return named(node)
        .filter((c) => c.type !== "comment")
        .map((item) => this.stringValue(item, key));
    }
    const value = this.stringValue(node, key);
    if (key === "__strictness__" && !(STRICTNESS_VALUES as readonly string[]).includes(value)) {
      throw new SketchSyntaxError(
        `\`__strictness__\` must be one of ${STRICTNESS_VALUES.map((s) => `"${s}"`).join(", ")}`,
        node,
      );
    }
    if (key === "__module__" && !MODULE_NAME.test(value)) {
      throw new SketchSyntaxError(
        "`__module__` must be a Python-style name: letters, digits and `_`, optionally dotted (e.g. `billing` or `billing.api`)",
        node,
      );
    }
    return value;
  }

  private stringValue(node: Node, key: string): string {
    const value = node.type === "string" ? decodePythonString(node.text) : null;
    if (value === null) throw new SketchSyntaxError(`\`${key}\` expects a string literal`, node);
    return value;
  }

  private parseReExport(stmt: Node): ReExport {
    const moduleNode = stmt.childForFieldName("module_name");
    const names = stmt.childrenForFieldName("name").filter((n): n is Node => n !== null);
    if (!moduleNode || names.length === 0 || names.some((n) => n.type !== "dotted_name")) {
      throw new SketchSyntaxError("re-exports must look like `from .module import a, b`", stmt);
    }
    return { from: moduleNode.text, names: names.map((n) => n.text), leading: [] };
  }

  private parseTypeAliasStatement(stmt: Node): ArchSymbol {
    const left = stmt.childForFieldName("left");
    const right = stmt.childForFieldName("right");
    if (!left || !right) throw new SketchSyntaxError("incomplete `type` statement", stmt);
    const inner = unwrapType(left);
    let name: string;
    let params: Node[] = [];
    if (inner.type === "identifier") name = inner.text;
    else if (inner.type === "generic_type") {
      name = named(inner)[0]?.text ?? "";
      const tp = named(inner).find((n) => n.type === "type_parameter");
      params = tp ? named(tp) : [];
    } else throw new SketchSyntaxError("unsupported `type` statement", stmt);
    return {
      kind: "type",
      name,
      typeParams: params.map((p) => typeParam(p)),
      type: typeOf(right),
      soft: emptySoft(),
      loc: this.loc(stmt),
    };
  }

  private loc(node: Node) {
    return {
      file: this.file,
      line: node.startPosition.row + 1,
      column: node.startPosition.column + 1,
    };
  }

  private parseDefinition(stmt: Node): ArchSymbol {
    const { def, decorators } = splitDecorated(stmt);
    if (def.type === "class_definition") return this.parseClass(stmt, def, decorators);
    if (def.type === "function_definition") {
      const unknown = decorators.filter(
        (d) => d.text !== "overload" && !SIGNATURE_DECORATORS.has(decoratorName(d)),
      );
      if (unknown.length > 0) {
        throw new SketchSyntaxError(
          `unsupported decorator \`@${unknown[0]?.text}\` on a function (allowed: @overload, ${[...SIGNATURE_DECORATORS].map((x) => `@${x}`).join(", ")})`,
          unknown[0] as Node,
        );
      }
      const fn: FunctionSymbol = {
        kind: "function",
        name: def.childForFieldName("name")?.text ?? "",
        signatures: [this.signature(def, null, signatureDecorators(decorators))],
        soft: emptySoft(),
        loc: this.loc(def),
      };
      this.functionSoft(stmt, def, fn.soft);
      return fn;
    }
    throw new SketchSyntaxError(`unsupported definition (${def.type})`, def);
  }

  private parseClass(stmt: Node, def: Node, decoratorNodes: Node[]): ArchSymbol {
    const name = def.childForFieldName("name")?.text ?? "";
    const superclasses = def.childForFieldName("superclasses");
    const bases: string[] = [];
    if (superclasses) {
      for (const arg of named(superclasses)) {
        if (arg.type === "comment") continue;
        if (arg.type === "keyword_argument") {
          throw new SketchSyntaxError("keyword arguments in class bases are not supported", arg);
        }
        bases.push(typeOf(arg));
      }
    }
    const isEnum = bases.some((b) => ENUM_BASES.has(b));
    const isInterface = bases.includes("Protocol");
    const soft = emptySoft();
    const body = def.childForFieldName("body");
    const anchors: Anchor[] = [];
    const members: Member[] = [];
    const enumMembers: EnumMember[] = [];
    const memberNodes = body ? named(body).filter((n) => n.type !== "comment") : [];

    memberNodes.forEach((node, index) => {
      try {
        if (index === 0 && isDocstring(node)) {
          soft.docstring = dedentDocstring(node.text);
          return;
        }
        if (
          node.type === "pass_statement" ||
          (node.type === "expression_statement" && named(node)[0]?.type === "ellipsis")
        ) {
          return;
        }
        if (node.type === "function_definition" || node.type === "decorated_definition") {
          const method = this.parseMethod(node);
          const prev = members.find((m) => m.kind === "method" && m.name === method.name);
          if (prev && prev.kind === "method") {
            if (!isOverloaded(node)) {
              throw new SketchSyntaxError(
                `duplicate method \`${method.name}\` (mark every variant with @overload)`,
                node,
              );
            }
            prev.signatures.push(...method.signatures);
            prev.soft.body.push(...method.soft.leading, ...method.soft.body);
            anchors.push(symbolAnchor(node, prev.soft, true));
            return;
          }
          members.push(method);
          anchors.push(definitionAnchor(node, method.soft));
          return;
        }
        if (node.type === "expression_statement") {
          const assign = named(node)[0];
          if (assign?.type === "assignment") {
            if (isEnum) {
              const left = assign.childForFieldName("left");
              const right = assign.childForFieldName("right");
              const annotation = assign.childForFieldName("type");
              if (left?.type !== "identifier") {
                throw new SketchSyntaxError(
                  "enum members look like `Name = ...`, `Name = 2` or, with data, `Name: '(u8, u8)'`",
                  node,
                );
              }
              const m: EnumMember = { name: left.text, soft: emptySoft() };
              if (annotation) m.payload = typeOf(annotation);
              const value = right ? enumValue(right) : undefined;
              if (value !== undefined) m.value = value;
              if (enumMembers.some((e) => e.name === m.name)) {
                throw new SketchSyntaxError(`duplicate enum member \`${m.name}\``, node);
              }
              enumMembers.push(m);
              anchors.push(symbolAnchor(node, m.soft));
              return;
            }
            const field = this.parseField(assign);
            if (members.some((m) => m.kind === "field" && m.name === field.name)) {
              throw new SketchSyntaxError(`duplicate field \`${field.name}\``, node);
            }
            members.push(field);
            anchors.push(symbolAnchor(node, field.soft));
            return;
          }
        }
        throw new SketchSyntaxError(
          "unsupported statement in a class body; use fields (`name: Type`), methods " +
            "(`def name(self) -> Type: ...`) or enum members (`Name = ...`)",
          node,
        );
      } catch (e) {
        if (e instanceof SketchSyntaxError) this.error(e.node, e.message);
        else throw e;
      }
    });

    // Comments that belong to the class itself (not to a nested method's subtree).
    const headerRow = colonRow(def);
    const methodRanges = memberNodes
      .filter((n) => n.type === "function_definition" || n.type === "decorated_definition")
      .map((n) => [n.startIndex, n.endIndex] as const);
    const comments = stmt
      .descendantsOfType("comment")
      .filter((c): c is Node => c !== null)
      .filter((c) => !methodRanges.some(([s, e]) => c.startIndex >= s && c.startIndex < e));
    const rest: Node[] = [];
    for (const c of comments) {
      if (c.startPosition.row < def.startPosition.row) soft.leading.push(commentText(c));
      else if (c.startPosition.row === headerRow) soft.trailing = commentText(c);
      else rest.push(c);
    }
    attachComments(rest, anchors, soft.body);

    const decorators = decoratorNodes.map((d) => d.text.replace(/\s+/g, " "));
    if (isEnum) {
      if (decorators.length > 0) {
        throw new SketchSyntaxError(
          "decorators on enums are not supported",
          decoratorNodes[0] as Node,
        );
      }
      const sym: EnumSymbol = {
        kind: "enum",
        name,
        bases: bases.filter((b) => b !== "Enum"),
        members: enumMembers,
        soft,
        loc: this.loc(def),
      };
      const methods = members.filter((m): m is MethodMember => m.kind === "method");
      if (methods.length > 0) sym.methods = methods;
      return sym;
    }
    const sym: ClassLikeSymbol = {
      kind: isInterface ? "interface" : "class",
      name,
      typeParams: typeParams(def),
      bases: bases.filter((b) => b !== "Protocol"),
      decorators,
      members,
      soft,
      loc: this.loc(def),
    };
    return sym;
  }

  private parseField(assign: Node): FieldMember {
    const left = assign.childForFieldName("left");
    const typeNode = assign.childForFieldName("type");
    if (!left || !typeNode) {
      throw new SketchSyntaxError("class fields look like `name: Type`", assign);
    }
    if (assign.childForFieldName("right")) {
      throw new SketchSyntaxError("class fields must not have a value in a sketch", assign);
    }
    let name: string;
    if (left.type === "identifier") name = left.text;
    else if (left.type === "subscript" && left.childForFieldName("value")?.text === "self") {
      const sub = left.childForFieldName("subscript");
      const decoded = sub?.type === "string" ? decodePythonString(sub.text) : null;
      if (decoded === null) {
        throw new SketchSyntaxError('quoted field names look like `self["name"]: Type`', left);
      }
      name = decoded;
    } else throw new SketchSyntaxError("unsupported field name", left);

    const flags = { static: false, readonly: false, optional: false };
    let node = typeNode;
    const keys = ["static", "readonly", "optional"] as const;
    FIELD_WRAPPERS.forEach((wrapper, i) => {
      const inner = unwrapWrapper(node, wrapper);
      if (inner) {
        flags[keys[i] as (typeof keys)[number]] = true;
        node = inner;
      }
    });
    return {
      kind: "field",
      name,
      type: typeOf(node),
      ...flags,
      soft: emptySoft(),
      loc: this.loc(assign),
    };
  }

  private parseMethod(stmt: Node): MethodMember {
    const { def, decorators } = splitDecorated(stmt);
    if (def.type !== "function_definition") {
      throw new SketchSyntaxError("nested classes are not supported in sketches", def);
    }
    const flags = { static: false, classmethod: false, abstract: false, optional: false };
    for (const d of decorators) {
      if (SIGNATURE_DECORATORS.has(decoratorName(d))) continue;
      if (!METHOD_DECORATORS.has(d.text)) {
        throw new SketchSyntaxError(
          `unsupported decorator \`@${d.text}\`; methods allow ${[...METHOD_DECORATORS, ...SIGNATURE_DECORATORS].map((x) => `@${x}`).join(", ")}`,
          d,
        );
      }
      if (d.text === "staticmethod") flags.static = true;
      if (d.text === "classmethod") flags.classmethod = true;
      if (d.text === "abstractmethod") flags.abstract = true;
      if (d.text === "optional") flags.optional = true;
    }
    const self = flags.static ? null : flags.classmethod ? "cls" : "self";
    const method: MethodMember = {
      kind: "method",
      name: def.childForFieldName("name")?.text ?? "",
      signatures: [this.signature(def, self, signatureDecorators(decorators))],
      ...flags,
      soft: emptySoft(),
      loc: this.loc(def),
    };
    this.functionSoft(stmt, def, method.soft);
    return method;
  }

  private signature(def: Node, self: string | null, decorators: string[] = []): Signature {
    const paramsNode = def.childForFieldName("parameters");
    const params: Param[] = [];
    const nodes = paramsNode ? named(paramsNode).filter((n) => n.type !== "comment") : [];
    let receiver: string | undefined;
    if (self !== null) {
      const first = nodes.shift();
      // `self: '&mut Self'` records a receiver that is not the usual one.
      const typedSelf =
        first?.type === "typed_parameter" &&
        named(first)[0]?.type === "identifier" &&
        named(first)[0]?.text === self;
      if (typedSelf) {
        const t = first?.childForFieldName("type");
        if (t) receiver = typeOf(t);
      } else if (first?.type !== "identifier" || first.text !== self) {
        throw new SketchSyntaxError(
          `method \`${def.childForFieldName("name")?.text}\` must take \`${self}\` as its first ` +
            "parameter (or use @staticmethod)",
          first ?? def,
        );
      }
    }
    for (const n of nodes) params.push(param(n));
    const ret = def.childForFieldName("return_type");
    const body = def.childForFieldName("body");
    if (body) {
      const stmts = named(body).filter((n) => n.type !== "comment");
      stmts.forEach((s, i) => {
        const ok =
          (i === 0 && isDocstring(s)) ||
          s.type === "pass_statement" ||
          (s.type === "expression_statement" && named(s)[0]?.type === "ellipsis");
        if (!ok) {
          throw new SketchSyntaxError(
            "function bodies in sketches contain only `...` (plus an optional docstring and comments)",
            s,
          );
        }
      });
    }
    const sig: Signature = {
      typeParams: typeParams(def),
      params,
      returns: ret ? typeOf(ret) : null,
      async: kids(def).some((c) => c.type === "async"),
    };
    if (receiver !== undefined) sig.receiver = receiver;
    if (decorators.length > 0) sig.decorators = decorators;
    return sig;
  }

  /** Docstring and comments of a (possibly decorated) function definition. */
  private functionSoft(stmt: Node, def: Node, soft: Soft): void {
    const body = def.childForFieldName("body");
    const first = body ? named(body).find((n) => n.type !== "comment") : undefined;
    if (first && isDocstring(first)) soft.docstring = dedentDocstring(first.text);
    const defRow = def.startPosition.row;
    const headerRow = colonRow(def);
    for (const c of stmt.descendantsOfType("comment")) {
      if (!c) continue;
      const row = c.startPosition.row;
      if (row < defRow) soft.leading.push(commentText(c));
      else if (row === headerRow) soft.trailing = commentText(c);
      else soft.body.push(commentText(c));
    }
  }
}

function simpleAnchor(node: Node): Omit<Anchor, "leading" | "setTrailing"> {
  return {
    start: node.startIndex,
    startRow: node.startPosition.row,
    endRow: node.endPosition.row,
    headerRow: node.endPosition.row,
    oneLine: true,
  };
}

function symbolAnchor(node: Node, soft: Soft, ignoreLeading = false): Anchor {
  return {
    ...simpleAnchor(node),
    leading: ignoreLeading ? soft.body : soft.leading,
    setTrailing: (t) => {
      soft.trailing = t;
    },
  };
}

/** Anchor for a class/def: same-line comments after a one-liner are trailing. */
function definitionAnchor(node: Node, soft: Soft): Anchor {
  const { def } = splitDecorated(node);
  const headerRow = colonRow(def);
  return {
    ...simpleAnchor(node),
    headerRow,
    oneLine: def.endPosition.row === headerRow,
    leading: soft.leading,
    setTrailing: (t) => {
      soft.trailing = t;
    },
  };
}

/**
 * Attaches comments at one nesting level: same-line comments after an element become its
 * trailing comment, full-line comments lead the next element, the rest go to `rest`.
 */
function attachComments(comments: Node[], anchors: Anchor[], rest: string[]): void {
  const sorted = [...anchors].sort((a, b) => a.start - b.start);
  const leading = new Map<Anchor, string[]>();
  for (const c of [...comments].sort((a, b) => a.startIndex - b.startIndex)) {
    const row = c.startPosition.row;
    const before = sorted.filter((a) => a.start < c.startIndex);
    const prev = before[before.length - 1];
    if (prev?.oneLine && prev.endRow === row) {
      prev.setTrailing(commentText(c));
      continue;
    }
    const next = sorted.find((a) => a.start > c.startIndex);
    if (next) leading.set(next, [...(leading.get(next) ?? []), commentText(c)]);
    else rest.push(commentText(c));
  }
  // Comments above an element come before any collected from inside it (e.g. between decorators).
  for (const [anchor, lines] of leading) anchor.leading.unshift(...lines);
}
