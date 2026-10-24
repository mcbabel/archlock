/**
 * Syntactic Java extraction: one file → FileFacts, using the tree-sitter Java grammar.
 *
 * Public names are the `public` types of the file and their `public` nested types
 * (`Outer__Inner`); members are the `public` fields, methods and constructors (in interfaces and
 * annotation types every member that is not `private`). Imports are fully qualified names, and
 * so are qualified type names used in code (`java.util.function.Function<T, R>`).
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
import type { FileFacts } from "../facts.js";

const TYPE_DECLARATIONS = new Set([
  "class_declaration",
  "interface_declaration",
  "enum_declaration",
  "record_declaration",
  "annotation_type_declaration",
]);

function named(node: Node): Node[] {
  return node.namedChildren.filter(
    (c): c is Node => c !== null && c.type !== "line_comment" && c.type !== "block_comment",
  );
}

function typeText(node: Node): string {
  return canonicalType(node.text);
}

/** Modifier keywords (`public`, `static`, `final`, …) without annotations. */
function modifiers(node: Node): Set<string> {
  const m = named(node).find((c) => c.type === "modifiers");
  if (!m) return new Set();
  const words = new Set<string>();
  for (const c of m.children) {
    if (c && !c.isNamed) words.add(c.text);
  }
  return words;
}

function typeParams(node: Node): string[] {
  const list = node.childForFieldName("type_parameters");
  return list ? named(list).map((p) => typeText(p)) : [];
}

function params(node: Node): Param[] {
  const list = node.childForFieldName("parameters");
  const out: Param[] = [];
  for (const p of list ? named(list) : []) {
    if (p.type === "formal_parameter") {
      const type = p.childForFieldName("type");
      const dims = p.childForFieldName("dimensions")?.text ?? "";
      out.push({
        kind: "normal",
        name: toSketchName(p.childForFieldName("name")?.text ?? `_${out.length + 1}`),
        type: type ? canonicalType(`${type.text}${dims}`) : canonicalType("?"),
        optional: false,
      });
    } else if (p.type === "spread_parameter") {
      // `String... tags` is a rest parameter of `String`.
      const type = named(p).find((c) => c.type !== "variable_declarator" && c.type !== "modifiers");
      const decl = named(p).find((c) => c.type === "variable_declarator");
      out.push({
        kind: "rest",
        name: toSketchName(decl?.childForFieldName("name")?.text ?? `_${out.length + 1}`),
        type: type ? typeText(type) : canonicalType("?"),
        optional: false,
      });
    }
  }
  return out;
}

function signature(node: Node, isConstructor: boolean): Signature {
  const ret = node.childForFieldName("type");
  const dims = node.childForFieldName("dimensions")?.text ?? "";
  return {
    typeParams: typeParams(node),
    params: params(node),
    returns: isConstructor ? null : ret ? canonicalType(`${ret.text}${dims}`) : null,
    async: false,
  };
}

export function extractJavaFile(parser: Parser, path: string, text: string): FileFacts {
  const tree = parser.parse(text);
  if (!tree) throw new Error(`could not parse ${path}`);
  try {
    return new JavaFileExtractor(path).run(tree.rootNode, countLines(text));
  } finally {
    tree.delete();
  }
}

class JavaFileExtractor {
  private readonly facts: FileFacts;

  constructor(private readonly path: string) {
    this.facts = {
      path,
      language: "java",
      lines: 0,
      imports: [],
      exports: new Map(),
      stars: [],
      declarations: new Map(),
      bindings: new Map(),
      javaPackage: "",
    };
  }

  run(root: Node, lines: number): FileFacts {
    this.facts.lines = lines;
    for (const decl of named(root)) {
      if (decl.type === "package_declaration") {
        const name = named(decl).find(
          (c) => c.type === "scoped_identifier" || c.type === "identifier",
        );
        this.facts.javaPackage = name?.text.replace(/\s+/g, "") ?? "";
      } else if (decl.type === "import_declaration") {
        this.import(decl);
      } else if (TYPE_DECLARATIONS.has(decl.type) && modifiers(decl).has("public")) {
        this.type(decl, "");
      }
    }
    this.qualifiedTypes(root);
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

  private import(decl: Node): void {
    const name = named(decl).find((c) => c.type === "scoped_identifier" || c.type === "identifier");
    if (!name) return;
    const star = named(decl).some((c) => c.type === "asterisk");
    const loc = this.loc(decl);
    this.facts.imports.push({
      specifier: `${name.text.replace(/\s+/g, "")}${star ? ".*" : ""}`,
      names: ["*"],
      line: loc.line,
      column: loc.column,
      typeOnly: false,
    });
  }

  /**
   * Qualified names used without an import: types (`java.util.List`, `com.acme.Order`) and, in
   * expressions, `a.b.Class` chains (`com.acme.billing.Billing.create()`). An expression chain
   * needs two lowercase segments before a capitalized one, so `order.id.length()` is no name.
   */
  private qualifiedTypes(root: Node): void {
    const seen = new Set<string>();
    const add = (fqn: string, node: Node) => {
      if (seen.has(fqn)) return;
      seen.add(fqn);
      const loc = this.loc(node);
      this.facts.imports.push({
        specifier: fqn,
        names: ["*"],
        line: loc.line,
        column: loc.column,
        typeOnly: false,
      });
    };
    const visit = (node: Node): void => {
      for (const c of node.namedChildren) {
        if (!c || c.type === "import_declaration" || c.type === "package_declaration") continue;
        if (c.type === "scoped_type_identifier") {
          const fqn = c.text.replace(/<[\s\S]*$/, "").replace(/\s+/g, "");
          if (/^[a-z_][\w]*\./.test(fqn)) add(fqn, c);
          continue;
        }
        if (c.type === "field_access" || c.type === "method_invocation") {
          const m = /^((?:[a-z_][\w]*\.){2,}[A-Z][\w]*)/.exec(c.text.replace(/\s+/g, ""));
          if (m) add(m[1] as string, c);
        }
        visit(c);
      }
    };
    visit(root);
  }

  private declare(name: string, symbol: ArchSymbol): void {
    if (this.facts.declarations.has(name)) return;
    symbol.name = name;
    this.facts.declarations.set(name, [symbol]);
  }

  /** A public type and its public nested types (`Outer__Inner`). */
  private type(decl: Node, prefix: string): void {
    const name = `${prefix}${decl.childForFieldName("name")?.text ?? ""}`;
    const body = decl.childForFieldName("body");
    const inInterface =
      decl.type === "interface_declaration" || decl.type === "annotation_type_declaration";
    const visible = (n: Node) => {
      const mods = modifiers(n);
      return mods.has("public") || (inInterface && !mods.has("private"));
    };
    const members: Member[] = [];
    const methods = new Map<string, MethodMember>();
    const addMethod = (mname: string, node: Node, isConstructor: boolean) => {
      const mods = modifiers(node);
      const key = isConstructor ? "__init__" : toSketchName(mname);
      const sig = signature(node, isConstructor);
      const existing = methods.get(key);
      if (existing) {
        existing.signatures.push(sig);
        return;
      }
      const m: MethodMember = {
        kind: "method",
        name: key,
        signatures: [sig],
        static: mods.has("static"),
        classmethod: false,
        abstract: mods.has("abstract"),
        optional: false,
        soft: emptySoft(),
        loc: this.loc(node),
      };
      methods.set(key, m);
      members.push(m);
    };
    const enumMembers: EnumSymbol["members"] = [];
    const declarations = body ? named(body) : [];
    // Enum bodies keep their methods in `enum_body_declarations`.
    const parts = declarations.flatMap((n) =>
      n.type === "enum_body_declarations" ? named(n) : [n],
    );
    for (const m of parts) {
      if (m.type === "enum_constant") {
        enumMembers.push({
          name: toSketchName(m.childForFieldName("name")?.text ?? ""),
          soft: emptySoft(),
        });
        continue;
      }
      if (TYPE_DECLARATIONS.has(m.type)) {
        if (visible(m)) this.type(m, `${name}__`);
        continue;
      }
      if (!visible(m)) continue;
      switch (m.type) {
        case "field_declaration":
        case "constant_declaration": {
          const mods = modifiers(m);
          const type = m.childForFieldName("type");
          for (const d of named(m)) {
            if (d.type !== "variable_declarator" || !type) continue;
            const dims = d.childForFieldName("dimensions")?.text ?? "";
            members.push(
              this.field(
                toSketchName(d.childForFieldName("name")?.text ?? ""),
                canonicalType(`${type.text}${dims}`),
                d,
                m.type === "constant_declaration" || mods.has("static"),
                m.type === "constant_declaration" || mods.has("final"),
              ),
            );
          }
          break;
        }
        case "method_declaration":
          addMethod(m.childForFieldName("name")?.text ?? "", m, false);
          break;
        case "annotation_type_element_declaration":
          addMethod(m.childForFieldName("name")?.text ?? "", m, false);
          break;
        case "constructor_declaration":
          if (decl.type !== "enum_declaration") addMethod("", m, true);
          break;
        default:
          break;
      }
    }
    const mods = modifiers(decl);
    const bases: string[] = [];
    const superclass = decl.childForFieldName("superclass");
    if (superclass) bases.push(...named(superclass).map((t) => typeText(t)));
    const interfaces =
      decl.childForFieldName("interfaces") ??
      named(decl).find((c) => c.type === "extends_interfaces");
    for (const list of interfaces ? named(interfaces) : []) {
      bases.push(...(list.type === "type_list" ? named(list) : [list]).map((t) => typeText(t)));
    }
    const loc = this.loc(decl);
    if (decl.type === "enum_declaration") {
      const sym: EnumSymbol = {
        kind: "enum",
        name,
        bases,
        members: enumMembers,
        soft: emptySoft(),
        loc,
      };
      const enumMethods = members.filter((m): m is MethodMember => m.kind === "method");
      if (enumMethods.length > 0) sym.methods = enumMethods;
      this.declare(name, sym);
      return;
    }
    if (decl.type === "record_declaration") {
      // A record's components are its (read-only) fields.
      const components = params(decl).map((p) =>
        this.field(p.name, p.type ?? canonicalType("?"), decl, false, true),
      );
      members.unshift(...components);
    }
    const decorators = [
      ...(decl.type === "record_declaration" ? ["record"] : []),
      ...(decl.type === "annotation_type_declaration" ? ["annotation"] : []),
      ...["abstract", "final", "sealed"].filter((m) => mods.has(m)),
      ...(mods.has("non-sealed") ? ["non_sealed"] : []),
    ];
    const sym: ClassLikeSymbol = {
      kind:
        decl.type === "interface_declaration" || decl.type === "annotation_type_declaration"
          ? "interface"
          : "class",
      name,
      typeParams: typeParams(decl),
      bases,
      decorators,
      members,
      soft: emptySoft(),
      loc,
    };
    this.declare(name, sym);
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
}
