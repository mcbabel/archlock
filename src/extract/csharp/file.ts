/**
 * Syntactic C# extraction: one file → FileFacts, using the tree-sitter C# grammar.
 *
 * Public names are the `public` types of the file and their `public` nested types
 * (`Outer__Inner`); members are `public` fields, properties, events, indexers, methods and
 * constructors (in interfaces every member without an access modifier). Namespaces, `using`
 * directives, all declared types and the capitalized names used in code are recorded for the
 * project pass (`linkCSharp`), which turns them into dependencies.
 */

import type { Node, Parser } from "web-tree-sitter";
import { canonicalType, toSketchName } from "../../core/canonical.js";
import {
  type ArchSymbol,
  type ClassLikeSymbol,
  type EnumSymbol,
  emptySoft,
  type FieldMember,
  type Location,
  type Member,
  type MethodMember,
  type Param,
  type Signature,
} from "../../core/model.js";
import { countLines } from "../../fs/files.js";
import type { CSharpFacts, FileFacts } from "../facts.js";

const TYPE_DECLARATIONS = new Set([
  "class_declaration",
  "struct_declaration",
  "interface_declaration",
  "enum_declaration",
  "record_declaration",
  "record_struct_declaration",
  "delegate_declaration",
]);

const ACCESS = new Set(["public", "private", "protected", "internal", "file"]);

function named(node: Node): Node[] {
  return node.namedChildren.filter((c): c is Node => c !== null && c.type !== "comment");
}

function typeText(node: Node): string {
  return canonicalType(node.text);
}

function modifiers(node: Node): Set<string> {
  return new Set(
    named(node)
      .filter((c) => c.type === "modifier")
      .map((c) => c.text),
  );
}

/** Keywords among a node's anonymous children (`record struct`, `global using`, `static`). */
function keywords(node: Node): Set<string> {
  const out = new Set<string>();
  for (const c of node.children) if (c && !c.isNamed) out.add(c.text);
  return out;
}

/** `<T, U>` with `where T : class, new()` → `T: class, new ()`, `U`. */
function typeParams(node: Node): string[] {
  const list = named(node).find((c) => c.type === "type_parameter_list");
  const names = list ? named(list).map((p) => p.childForFieldName("name")?.text ?? p.text) : [];
  const bounds = new Map<string, string[]>();
  for (const clause of named(node).filter((c) => c.type === "type_parameter_constraints_clause")) {
    const [target, ...constraints] = named(clause);
    if (target)
      bounds.set(
        target.text,
        constraints.map((c) => c.text),
      );
  }
  return names.map((n) => {
    const b = bounds.get(n);
    return b && b.length > 0 ? canonicalType(`${n}: ${b.join(", ")}`) : n;
  });
}

/**
 * Parameters with `ref`, `out`, `in` and `this` as part of the type. The grammar puts a
 * `params T[] name` parameter directly into the list as a type and a name.
 */
function params(list: Node | null): Param[] {
  const out: Param[] = [];
  if (!list) return out;
  let pendingType: Node | null = null;
  for (let i = 0; i < list.childCount; i++) {
    const c = list.child(i);
    if (!c?.isNamed) continue;
    if (c.type === "parameter") {
      const type = c.childForFieldName("type");
      const nameNode = c.childForFieldName("name");
      const prefix = named(c)
        .filter((m) => m.type === "modifier" && m.text !== "params" && m.text !== "scoped")
        .map((m) => m.text);
      // A default value is whatever follows the name (`int retries = 3`).
      const hasDefault =
        nameNode !== null && named(c).some((n) => n.startIndex > nameNode.endIndex);
      out.push({
        kind: "normal",
        name: toSketchName((nameNode?.text ?? `_${out.length + 1}`).replace(/^@/, "")),
        type: canonicalType([...prefix, type?.text ?? "var"].join(" ")),
        optional: hasDefault,
      });
    } else if (list.fieldNameForChild(i) === "type") {
      pendingType = c;
    } else if (list.fieldNameForChild(i) === "name" && pendingType) {
      out.push({
        kind: "rest",
        name: toSketchName(c.text),
        type: typeText(pendingType),
        optional: false,
      });
      pendingType = null;
    }
  }
  return out;
}

function signature(node: Node, isConstructor: boolean): Signature {
  const ret = node.childForFieldName("returns") ?? node.childForFieldName("type");
  return {
    typeParams: typeParams(node),
    params: params(
      node.childForFieldName("parameters") ??
        named(node).find((c) => c.type === "parameter_list") ??
        null,
    ),
    returns: isConstructor ? null : ret ? typeText(ret) : null,
    async: false,
  };
}

/** A name whose parent declares it (`class Order`, `int count`), so it is no use of a type. */
function isDeclarationName(node: Node): boolean {
  const parent = node.parent;
  if (!parent) return false;
  const name = parent.childForFieldName("name");
  return (
    parent.type !== "member_access_expression" &&
    name !== null &&
    name.startIndex === node.startIndex &&
    name.endIndex === node.endIndex
  );
}

export function extractCSharpFile(parser: Parser, path: string, text: string): FileFacts {
  const tree = parser.parse(text);
  if (!tree) throw new Error(`could not parse ${path}`);
  try {
    return new CSharpFileExtractor(path).run(tree.rootNode, countLines(text));
  } finally {
    tree.delete();
  }
}

class CSharpFileExtractor {
  private readonly facts: FileFacts;
  private readonly cs: CSharpFacts = { namespaces: [], usings: [], types: [], refs: [] };

  constructor(private readonly path: string) {
    this.facts = {
      path,
      language: "csharp",
      lines: 0,
      imports: [],
      exports: new Map(),
      stars: [],
      declarations: new Map(),
      bindings: new Map(),
      csharp: this.cs,
    };
  }

  run(root: Node, lines: number): FileFacts {
    this.facts.lines = lines;
    this.declarations(named(root), "");
    this.references(root);
    for (const name of this.facts.declarations.keys()) {
      this.facts.exports.set(name, { kind: "local", local: name });
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

  /** Namespace members; a file-scoped namespace applies to the declarations after it. */
  private declarations(nodes: Node[], namespace: string): void {
    let ns = namespace;
    for (const node of nodes) {
      switch (node.type) {
        case "using_directive":
          this.using(node);
          break;
        case "file_scoped_namespace_declaration":
          ns = [namespace, node.childForFieldName("name")?.text.replace(/\s+/g, "") ?? ""]
            .filter(Boolean)
            .join(".");
          this.cs.namespaces.push(ns);
          break;
        case "namespace_declaration": {
          const inner = [namespace, node.childForFieldName("name")?.text.replace(/\s+/g, "") ?? ""]
            .filter(Boolean)
            .join(".");
          this.cs.namespaces.push(inner);
          const body = node.childForFieldName("body");
          if (body) this.declarations(named(body), inner);
          break;
        }
        default:
          if (TYPE_DECLARATIONS.has(node.type)) this.type(node, ns, "", true);
      }
    }
  }

  private using(node: Node): void {
    const words = keywords(node);
    const aliasNode = node.childForFieldName("name");
    const alias = aliasNode?.text ?? null;
    const target = named(node).find((c) => c.startIndex !== aliasNode?.startIndex);
    if (!target) return;
    const loc = this.loc(node);
    this.cs.usings.push({
      name: target.text.replace(/\s+/g, ""),
      alias,
      static: words.has("static"),
      global: words.has("global"),
      line: loc.line,
      column: loc.column,
    });
  }

  private declare(name: string, symbol: ArchSymbol): void {
    if (this.facts.declarations.has(name)) return;
    symbol.name = name;
    this.facts.declarations.set(name, [symbol]);
  }

  /**
   * A type declaration. `outer` is the C# name of the enclosing type (`Order.`), `visible`
   * whether every enclosing type is public; non-public types are recorded for name resolution.
   */
  private type(decl: Node, namespace: string, outer: string, visible: boolean): void {
    const mods = modifiers(decl);
    const simple = decl.childForFieldName("name")?.text ?? "";
    const csName = `${outer}${simple}`;
    const isPublic = visible && mods.has("public");
    const exported = isPublic ? csName.replace(/\./g, "__") : null;
    this.cs.types.push({ name: csName, namespace, partial: mods.has("partial"), exported });
    const body = decl.childForFieldName("body");
    const inInterface = decl.type === "interface_declaration";
    const memberVisible = (n: Node) => {
      const m = modifiers(n);
      return m.has("public") || (inInterface && ![...m].some((x) => ACCESS.has(x)));
    };
    const nested = body ? named(body).filter((n) => TYPE_DECLARATIONS.has(n.type)) : [];
    for (const n of nested) this.type(n, namespace, `${csName}.`, isPublic && memberVisible(n));
    if (!exported) return;

    const loc = this.loc(decl);
    if (decl.type === "delegate_declaration") {
      const sig = signature(decl, false);
      const ps = sig.params.map((p) => `${p.type} ${p.name}`).join(", ");
      this.declare(exported, {
        kind: "type",
        name: exported,
        typeParams: sig.typeParams,
        type: canonicalType(`delegate ${sig.returns ?? "void"}(${ps})`),
        soft: emptySoft(),
        loc,
      });
      return;
    }
    const bases: string[] = [];
    const baseList = named(decl).find((c) => c.type === "base_list");
    for (const b of baseList ? named(baseList) : []) {
      if (b.type !== "argument_list") bases.push(typeText(b));
    }
    if (decl.type === "enum_declaration") {
      const members: EnumSymbol["members"] = [];
      for (const m of body ? named(body) : []) {
        if (m.type === "enum_member_declaration") {
          members.push({
            name: toSketchName(m.childForFieldName("name")?.text ?? ""),
            soft: emptySoft(),
          });
        }
      }
      this.declare(exported, {
        kind: "enum",
        name: exported,
        bases,
        members,
        soft: emptySoft(),
        loc,
      });
      return;
    }

    const members: Member[] = [];
    const methods = new Map<string, MethodMember>();
    const addMethod = (name: string, node: Node, isConstructor: boolean) => {
      const m = modifiers(node);
      const sig = signature(node, isConstructor);
      const existing = methods.get(name);
      if (existing) {
        existing.signatures.push(sig);
        return;
      }
      const method: MethodMember = {
        kind: "method",
        name,
        signatures: [sig],
        static: m.has("static"),
        classmethod: false,
        abstract: m.has("abstract"),
        optional: false,
        soft: emptySoft(),
        loc: this.loc(node),
      };
      methods.set(name, method);
      members.push(method);
    };
    const isRecord =
      decl.type === "record_declaration" || decl.type === "record_struct_declaration";
    if (isRecord) {
      // Positional records: the parameters are public init-only properties.
      const list = named(decl).find((c) => c.type === "parameter_list") ?? null;
      for (const p of params(list))
        members.push(this.field(p.name, p.type ?? "var", decl, false, true));
    }
    for (const m of body ? named(body) : []) {
      if (TYPE_DECLARATIONS.has(m.type) || !memberVisible(m)) continue;
      const mm = modifiers(m);
      switch (m.type) {
        case "field_declaration":
        case "event_field_declaration": {
          const vd = named(m).find((c) => c.type === "variable_declaration");
          const type = vd?.childForFieldName("type");
          if (!vd || !type) break;
          const t =
            m.type === "event_field_declaration"
              ? canonicalType(`event ${type.text}`)
              : typeText(type);
          for (const d of named(vd).filter((c) => c.type === "variable_declarator")) {
            members.push(
              this.field(
                toSketchName(d.childForFieldName("name")?.text ?? ""),
                t,
                d,
                mm.has("static") || mm.has("const"),
                mm.has("readonly") || mm.has("const"),
              ),
            );
          }
          break;
        }
        case "property_declaration":
        case "event_declaration": {
          const type = m.childForFieldName("type");
          const accessors = m.childForFieldName("accessors");
          // Read-only unless a public `set` accessor exists (`init` only sets at construction).
          const settable = accessors
            ? named(accessors).some(
                (a) =>
                  /^\s*set\b/.test(a.text) &&
                  !modifiers(a).has("private") &&
                  !modifiers(a).has("protected") &&
                  !modifiers(a).has("internal"),
              )
            : false;
          const t = type ? typeText(type) : canonicalType("var");
          members.push(
            this.field(
              toSketchName(m.childForFieldName("name")?.text ?? ""),
              m.type === "event_declaration" ? canonicalType(`event ${t}`) : t,
              m,
              mm.has("static"),
              m.type === "property_declaration" && !settable,
            ),
          );
          break;
        }
        case "indexer_declaration":
          addMethod("__getitem__", m, false);
          break;
        case "method_declaration":
          addMethod(toSketchName(m.childForFieldName("name")?.text ?? ""), m, false);
          break;
        case "constructor_declaration":
          if (!mm.has("static")) addMethod("__init__", m, true);
          break;
        default:
          break;
      }
    }
    const kw = keywords(decl);
    const isStruct =
      decl.type === "struct_declaration" ||
      decl.type === "record_struct_declaration" ||
      kw.has("struct");
    const decorators = [
      ...(isRecord ? ["record"] : []),
      ...(isStruct ? ["struct"] : []),
      ...["abstract", "sealed", "static", "readonly"].filter((x) => mods.has(x)),
    ];
    const sym: ClassLikeSymbol = {
      kind: decl.type === "interface_declaration" ? "interface" : "class",
      name: exported,
      typeParams: typeParams(decl),
      bases,
      decorators,
      members,
      soft: emptySoft(),
      loc,
    };
    this.declare(exported, sym);
  }

  private field(
    name: string,
    type: string,
    node: Node,
    isStatic: boolean,
    readonly: boolean,
  ): FieldMember {
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

  /**
   * Capitalized names used in code: simple names (`Invoice`), qualified names
   * (`Billing.Invoice`) and member-access chains (`Acme.Shop.Money.Zero()`). Declared names and
   * member names after a dot are skipped; the project pass keeps those that name a type.
   */
  private references(root: Node): void {
    const seen = new Set<string>();
    const add = (name: string, node: Node) => {
      const clean = name.replace(/<[\s\S]*?>/g, "").replace(/\s+/g, "");
      if (!/^@?[A-Z]/.test(clean) || seen.has(clean)) return;
      seen.add(clean);
      const loc = this.loc(node);
      this.cs.refs.push({ name: clean.replace(/^@/, ""), line: loc.line, column: loc.column });
    };
    const chain = (node: Node): string | null => {
      if (node.type === "identifier") return node.text;
      if (node.type === "member_access_expression") {
        const left = node.childForFieldName("expression");
        const right = node.childForFieldName("name");
        const l = left ? chain(left) : null;
        return l && right ? `${l}.${right.text}` : null;
      }
      return null;
    };
    const visit = (node: Node): void => {
      for (const c of node.namedChildren) {
        if (!c || c.type === "using_directive") continue;
        if (c.type === "namespace_declaration" || c.type === "file_scoped_namespace_declaration") {
          const body = c.childForFieldName("body");
          if (body) visit(body);
          continue;
        }
        if (c.type === "qualified_name") {
          add(c.text, c);
          continue;
        }
        if (c.type === "member_access_expression") {
          const text = chain(c);
          if (text && /^[A-Z]/.test(text)) {
            add(text, c);
            continue;
          }
        }
        if (c.type === "identifier" && /^[A-Z]/.test(c.text) && !isDeclarationName(c)) {
          const parent = c.parent;
          const isMemberName =
            parent?.type === "member_access_expression" &&
            parent.childForFieldName("name")?.startIndex === c.startIndex;
          if (!isMemberName) add(c.text, c);
        }
        visit(c);
      }
    };
    visit(root);
  }
}
