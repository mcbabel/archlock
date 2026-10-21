/**
 * Python syntax helpers on web-tree-sitter nodes, shared by the sketch parser and the
 * Python extractor: types, type parameters, parameters, decorators and docstrings.
 */

import type { Node } from "web-tree-sitter";
import { canonicalType, decodePythonString } from "../core/canonical.js";
import type { Param } from "../core/model.js";

/** A sketch/Python construct archlock cannot use, with the node to report. */
export class PySyntaxError extends Error {
  constructor(
    message: string,
    readonly node: Node,
  ) {
    super(message);
  }
}

/** Module names are Python-style (dotted) identifiers so `from .module import x` stays valid. */

export function kids(node: Node): Node[] {
  return node.children.filter((c): c is Node => c !== null);
}

export function named(node: Node): Node[] {
  return node.namedChildren.filter((c): c is Node => c !== null);
}

/** Canonical type from a type annotation or expression node. */
export function typeOf(node: Node): string {
  const inner = unwrapType(node);
  if (inner.type === "string") {
    const decoded = decodePythonString(inner.text);
    if (decoded === null) {
      throw new PySyntaxError("unsupported string literal (no prefixes like r'' or f'')", inner);
    }
    return canonicalType(decoded);
  }
  if (inner.type === "concatenated_string") {
    throw new PySyntaxError("write a quoted type as a single string literal", inner);
  }
  return canonicalType(inner.text);
}

export function typeParam(node: Node): string {
  const inner = unwrapType(node);
  if (inner.type === "constrained_type") {
    const [n, bound] = named(inner);
    if (n && bound) return `${unwrapType(n).text}: ${typeOf(bound)}`;
  }
  return typeOf(inner);
}

export function typeParams(def: Node): string[] {
  const tp = def.childForFieldName("type_parameters");
  return tp ? named(tp).map((p) => typeParam(p)) : [];
}

export function param(n: Node): Param {
  switch (n.type) {
    case "identifier":
      return { kind: "normal", name: n.text, type: null, optional: false };
    case "keyword_separator":
      return { kind: "star", name: "", type: null, optional: false };
    case "positional_separator":
      return { kind: "slash", name: "", type: null, optional: false };
    case "list_splat_pattern":
      return { kind: "rest", name: named(n)[0]?.text ?? "", type: null, optional: false };
    case "dictionary_splat_pattern":
      return { kind: "kwrest", name: named(n)[0]?.text ?? "", type: null, optional: false };
    case "default_parameter":
      return {
        kind: "normal",
        name: n.childForFieldName("name")?.text ?? "",
        type: null,
        optional: true,
      };
    case "typed_default_parameter":
      return {
        kind: "normal",
        name: n.childForFieldName("name")?.text ?? "",
        type: typeOf(n.childForFieldName("type") as Node),
        optional: true,
      };
    case "typed_parameter": {
      const target = named(n)[0] as Node;
      const type = typeOf(n.childForFieldName("type") as Node);
      if (target.type === "list_splat_pattern") {
        return { kind: "rest", name: named(target)[0]?.text ?? "", type, optional: false };
      }
      if (target.type === "dictionary_splat_pattern") {
        return { kind: "kwrest", name: named(target)[0]?.text ?? "", type, optional: false };
      }
      return { kind: "normal", name: target.text, type, optional: false };
    }
    default:
      throw new PySyntaxError(`unsupported parameter \`${n.text}\``, n);
  }
}

export function isDocstring(node: Node): boolean {
  if (node.type !== "expression_statement") return false;
  const children = named(node);
  return children.length === 1 && children[0]?.type === "string";
}

/** Strips the common indentation of a docstring's continuation lines. */
export function dedentDocstring(raw: string): string {
  const lines = raw.split("\n");
  if (lines.length === 1) return raw;
  const rest = lines.slice(1);
  const indents = rest
    .filter((l) => l.trim() !== "")
    .map((l) => (/^[ \t]*/.exec(l) as RegExpExecArray)[0].length);
  const cut = indents.length > 0 ? Math.min(...indents) : 0;
  return [lines[0], ...rest.map((l) => (l.trim() === "" ? "" : l.slice(cut).trimEnd()))].join("\n");
}

export function splitDecorated(stmt: Node): { def: Node; decorators: Node[] } {
  if (stmt.type !== "decorated_definition") return { def: stmt, decorators: [] };
  const def = stmt.childForFieldName("definition") as Node;
  const decorators = named(stmt)
    .filter((n) => n.type === "decorator")
    .map((d) => named(d)[0] as Node);
  return { def, decorators };
}

export function isOverloaded(stmt: Node): boolean {
  return splitDecorated(stmt).decorators.some((d) => d.text === "overload");
}

export function colonRow(def: Node): number {
  const colon = kids(def).find((c) => c.type === ":");
  return colon ? colon.startPosition.row : def.startPosition.row;
}

export function unwrapType(node: Node): Node {
  let n = node;
  while (n.type === "type" && named(n).length === 1) n = named(n)[0] as Node;
  return n;
}

/** `Wrapper[X]` → X (as a node), else null. */
export function unwrapWrapper(node: Node, wrapper: string): Node | null {
  const n = unwrapType(node);
  if (n.type === "generic_type") {
    const [id, tp] = named(n);
    if (id?.text === wrapper && tp?.type === "type_parameter" && named(tp).length === 1) {
      return named(tp)[0] as Node;
    }
  }
  if (n.type === "subscript" && n.childForFieldName("value")?.text === wrapper) {
    const subs = n.childrenForFieldName("subscript").filter((s): s is Node => s !== null);
    if (subs.length === 1) return subs[0] as Node;
  }
  return null;
}

/** For `TypeAlias` / `TypeAlias[T, U]` annotations: the type parameter nodes; else null. */
export function typeAliasParams(typeNode: Node): Node[] | null {
  const n = unwrapType(typeNode);
  if (n.type === "identifier" && n.text === "TypeAlias") return [];
  if (n.type === "generic_type") {
    const [id, tp] = named(n);
    if (id?.text === "TypeAlias" && tp?.type === "type_parameter") return named(tp);
  }
  if (n.type === "subscript" && n.childForFieldName("value")?.text === "TypeAlias") {
    return n.childrenForFieldName("subscript").filter((s): s is Node => s !== null);
  }
  return null;
}
