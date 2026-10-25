/**
 * Syntactic Rust extraction: one file → FileFacts, using the tree-sitter Rust grammar.
 *
 * A file's exports are its `pub` items (and the items of its `pub mod name { … }` blocks as
 * `name__item`). Everything that depends on other files (`mod` files, `use` paths, `pub use`
 * re-exports, `impl` blocks) is recorded raw in `facts.rust` and resolved by `linkRustCrates`.
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
  type MethodMember,
  type Param,
  type Signature,
} from "../../core/model.js";
import { countLines } from "../../fs/files.js";
import type { FileFacts, RustFacts, RustImpl, RustPath } from "../facts.js";

function named(node: Node): Node[] {
  return node.namedChildren.filter(
    (c): c is Node => c !== null && c.type !== "line_comment" && c.type !== "block_comment",
  );
}

/** A name without its raw-identifier prefix: `r#type` → `type`. */
function ident(text: string): string {
  return text.replace(/^r#/, "");
}

function typeText(node: Node): string {
  return canonicalType(node.text);
}

/** Plain `pub`; `pub(crate)`, `pub(super)` and `pub(in …)` are not part of the public API. */
function isPub(node: Node): boolean {
  return named(node).some((c) => c.type === "visibility_modifier" && c.text === "pub");
}

/** `#[cfg(test)]` and `#[test]` items are test code. */
function isTestOnly(attrs: Node[]): boolean {
  return attrs.some((a) =>
    /^#\[\s*(cfg\s*\(\s*test\s*\)|test)\s*\]$/.test(a.text.replace(/\s+/g, " ")),
  );
}

/** `#[derive(Debug, serde::Serialize)]` → `Debug`, `serde::Serialize`. */
function derives(attrs: Node[]): string[] {
  const out: string[] = [];
  for (const a of attrs) {
    const m = /^#\[\s*derive\s*\(([\s\S]*)\)\s*\]$/.exec(a.text);
    if (!m) continue;
    for (const part of (m[1] as string).split(",")) {
      const t = part.trim();
      if (t) out.push(canonicalType(t));
    }
  }
  return out;
}

/** `#[path = "x.rs"]` on a `mod` item. */
function pathAttribute(attrs: Node[]): string | null {
  for (const a of attrs) {
    const m = /^#\[\s*path\s*=\s*"([^"]+)"\s*\]$/.exec(a.text);
    if (m) return m[1] as string;
  }
  return null;
}

/** Generics plus `where` bounds: `<'a, T: Clone> … where T: Send` → `'a`, `T: Clone + Send`. */
function typeParams(node: Node): string[] {
  const list = node.childForFieldName("type_parameters");
  const order: string[] = [];
  const bounds = new Map<string, string[]>();
  const extra: string[] = [];
  for (const p of list ? named(list) : []) {
    const name = p.childForFieldName("name");
    if (p.type === "const_parameter" || !name) {
      order.push(typeText(p));
      continue;
    }
    const key = typeText(name);
    order.push(key);
    const b = p.childForFieldName("bounds");
    bounds.set(key, b ? [typeText(b).replace(/^:\s*/, "")] : []);
  }
  const where = named(node).find((c) => c.type === "where_clause");
  for (const pred of where ? named(where) : []) {
    const left = pred.childForFieldName("left");
    const b = pred.childForFieldName("bounds");
    if (!left || !b) continue;
    const key = typeText(left);
    const list = bounds.get(key);
    if (list) list.push(typeText(b).replace(/^:\s*/, ""));
    else extra.push(canonicalType(`where ${pred.text}`));
  }
  return [
    ...order.map((k) => {
      const b = bounds.get(k);
      return b && b.length > 0 ? canonicalType(`${k}: ${b.join(" + ")}`) : k;
    }),
    ...extra,
  ];
}

/** Parameters without `self`; patterns other than a name (`(a, b): (u8, u8)`) are `_1`, `_2`, …. */
/**
 * The receiver when it is not the usual `&self`: `&mut self` → `&mut Self`, `self` → `Self`,
 * `self: Box<Self>` → `Box[Self]`. The binding's own `mut` (`mut self`) is no part of it.
 */
function receiverOf(p: Node): string | undefined {
  if (p.type === "parameter") {
    const type = p.childForFieldName("type");
    return type ? typeText(type) : undefined;
  }
  const text = p.text.replace(/\s+/g, " ").trim();
  if (text === "&self") return undefined;
  const t = text.replace(/^mut\s+self$/, "self").replace(/\bself$/, "Self");
  return canonicalType(t);
}

function params(node: Node): { params: Param[]; self: boolean; receiver?: string } {
  const list = node.childForFieldName("parameters");
  const out: Param[] = [];
  let self = false;
  let receiver: string | undefined;
  for (const p of list ? named(list) : []) {
    const isTypedSelf = p.type === "parameter" && p.childForFieldName("pattern")?.text === "self";
    if (p.type === "self_parameter" || isTypedSelf) {
      self = true;
      receiver = receiverOf(p);
      continue;
    }
    if (p.type === "variadic_parameter") continue;
    const pattern = p.childForFieldName("pattern");
    const type = p.childForFieldName("type");
    const name =
      pattern?.type === "identifier" && pattern.text !== "_"
        ? toSketchName(ident(pattern.text))
        : `_${out.length + 1}`;
    out.push({
      kind: "normal",
      name,
      type: type ? typeText(type) : canonicalType("_"),
      optional: false,
    });
  }
  return receiver === undefined ? { params: out, self } : { params: out, self, receiver };
}

/** `unsafe fn`, `const fn` and `extern "C" fn` as decorators: `unsafe`, `const`, `extern("C")`. */
function modifierDecorators(modifiers: Node | undefined): string[] {
  if (!modifiers) return [];
  const text = modifiers.text;
  const out: string[] = [];
  if (/\bconst\b/.test(text)) out.push("const");
  if (/\bunsafe\b/.test(text)) out.push("unsafe");
  const ext = /\bextern\s*("[^"]*")?/.exec(text);
  if (ext) out.push(ext[1] ? canonicalType(`extern(${ext[1]})`) : "extern");
  return out;
}

function signature(node: Node): { sig: Signature; self: boolean } {
  const { params: ps, self, receiver } = params(node);
  const ret = node.childForFieldName("return_type");
  const modifiers = named(node).find((c) => c.type === "function_modifiers");
  const sig: Signature = {
    typeParams: typeParams(node),
    params: ps,
    returns: ret ? typeText(ret) : null,
    async: modifiers ? /\basync\b/.test(modifiers.text) : false,
  };
  if (receiver !== undefined) sig.receiver = receiver;
  const decorators = modifierDecorators(modifiers);
  if (decorators.length > 0) sig.decorators = decorators;
  return { sig, self };
}

/** `#[cfg(unix)]` → `cfg(unix)`, for telling variants apart. */
function cfgDecorator(attrs: Node[]): string | null {
  for (const a of attrs) {
    const m = /^#\[\s*(cfg\s*\([\s\S]*\))\s*\]$/.exec(a.text);
    if (m) return canonicalType(m[1] as string);
  }
  return null;
}

/** Use tree → leaves: `a::{b as c, d::*}` → `a::b` (alias c), `a::d::*`. */
function useLeaves(
  node: Node,
  prefix: string[],
  out: Omit<RustPath, "pub" | "inline" | "line" | "column">[],
): void {
  const segs = (n: Node) => n.text.replace(/\s+/g, "").split("::").filter(Boolean);
  switch (node.type) {
    case "use_as_clause": {
      const path = node.childForFieldName("path");
      const alias = node.childForFieldName("alias")?.text ?? null;
      if (path) out.push({ segments: [...prefix, ...segs(path)], alias, glob: false });
      break;
    }
    case "use_wildcard": {
      const path = named(node)[0];
      out.push({ segments: [...prefix, ...(path ? segs(path) : [])], alias: null, glob: true });
      break;
    }
    case "scoped_use_list": {
      const path = node.childForFieldName("path");
      const list = node.childForFieldName("list");
      const next = [...prefix, ...(path ? segs(path) : [])];
      if (list) useLeaves(list, next, out);
      break;
    }
    case "use_list":
      for (const item of named(node)) {
        // `use a::{self, b}`: `self` is `a` itself.
        if (item.type === "self") out.push({ segments: prefix, alias: null, glob: false });
        else useLeaves(item, prefix, out);
      }
      break;
    default:
      out.push({ segments: [...prefix, ...segs(node)], alias: null, glob: false });
  }
}

export function extractRustFile(parser: Parser, path: string, text: string): FileFacts {
  const tree = parser.parse(text);
  if (!tree) throw new Error(`could not parse ${path}`);
  try {
    return new RustFileExtractor(path, parser, text).run(tree.rootNode, countLines(text));
  } finally {
    tree.delete();
  }
}

class RustFileExtractor {
  private readonly facts: FileFacts;
  private readonly rust: RustFacts = { mods: [], paths: [], impls: [], macros: [] };
  /** Names bound in this file by `use`: inline paths starting with them add nothing new. */
  private readonly bound = new Set<string>();

  /** The `#[cfg]` of a function's first definition, for marking its variants. */
  private readonly cfgOf = new Map<ArchSymbol, string>();
  /** Nesting depth of macro bodies being read as items. */
  private macroDepth = 0;

  constructor(
    private readonly path: string,
    private readonly parser: Parser,
    private readonly text: string,
  ) {
    this.facts = {
      path,
      language: "rust",
      lines: 0,
      imports: [],
      exports: new Map(),
      stars: [],
      declarations: new Map(),
      bindings: new Map(),
      rust: this.rust,
    };
  }

  run(root: Node, lines: number): FileFacts {
    this.facts.lines = lines;
    this.items(named(root), "", true);
    this.inlinePaths(root);
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

  private declare(name: string, symbol: ArchSymbol): void {
    if (this.facts.declarations.has(name)) return;
    symbol.name = name;
    this.facts.declarations.set(name, [symbol]);
  }

  /**
   * Items of the file or of an inline module. `prefix` qualifies the names of a `pub mod x { }`
   * (`x__`); `top` is false inside inline modules, whose `mod`, `use` and `impl` are not read.
   */
  private items(nodes: Node[], prefix: string, top: boolean): void {
    let attrs: Node[] = [];
    for (const item of nodes) {
      if (item.type === "attribute_item") {
        attrs.push(item);
        continue;
      }
      const itemAttrs = attrs;
      attrs = [];
      if (isTestOnly(itemAttrs)) continue;
      const pub = isPub(item);
      const name = ident(item.childForFieldName("name")?.text ?? "");
      switch (item.type) {
        case "mod_item": {
          const body = item.childForFieldName("body");
          if (body) {
            if (pub) this.items(named(body), `${prefix}${name}__`, false);
          } else if (top) {
            const loc = this.loc(item);
            this.rust.mods.push({
              name,
              pub,
              restricted: !pub && named(item).some((c) => c.type === "visibility_modifier"),
              path: pathAttribute(itemAttrs),
              line: loc.line,
              column: loc.column,
            });
          }
          break;
        }
        case "use_declaration":
          if (top) this.use(item, pub);
          break;
        case "extern_crate_declaration": {
          // `pub extern crate grep_cli as cli;` re-exports a crate like `pub use`.
          const loc = this.loc(item);
          this.rust.paths.push({
            segments: [name],
            alias: item.childForFieldName("alias")?.text ?? null,
            glob: false,
            pub,
            inline: false,
            line: loc.line,
            column: loc.column,
          });
          break;
        }
        case "impl_item":
          if (top) this.impl(item);
          break;
        case "macro_invocation":
          this.macroItems(item, prefix, top);
          break;
        case "macro_definition":
          if (top && itemAttrs.some((a) => /^#\[\s*macro_export\b/.test(a.text))) {
            this.rust.macros.push(name);
            this.declare(name, {
              kind: "const",
              name,
              type: "macro_rules!",
              soft: emptySoft(),
              loc: this.loc(item),
            });
          }
          break;
        default:
          if (pub) this.item(item, `${prefix}${name}`, itemAttrs);
      }
    }
  }

  /**
   * Items inside an item-level macro, as in `cfg_rt! { pub mod runtime; }` or the branches of
   * `cfg_if! { if #[cfg(unix)] { … } else { … } }`. The body is parsed again as Rust with
   * everything else blanked (positions stay valid); a body that is not a list of items, like
   * `lazy_static! { … }`, is skipped.
   */
  private macroItems(item: Node, prefix: string, top: boolean): void {
    const body = named(item).find((c) => c.type === "token_tree");
    if (!body?.text.startsWith("{") || this.macroDepth >= 3) return;
    if (this.reparse(body, prefix, top)) return;
    for (const branch of named(body)) {
      if (branch.type === "token_tree" && branch.text.startsWith("{"))
        this.reparse(branch, prefix, top);
    }
  }

  private reparse(group: Node, prefix: string, top: boolean): boolean {
    const start = group.startIndex + 1;
    const end = group.endIndex - 1;
    const blank = (s: string) => s.replace(/[^\n\r]/g, " ");
    const masked =
      blank(this.text.slice(0, start)) + this.text.slice(start, end) + blank(this.text.slice(end));
    const tree = this.parser.parse(masked);
    if (!tree) return false;
    try {
      if (tree.rootNode.hasError) return false;
      this.macroDepth++;
      try {
        this.items(named(tree.rootNode), prefix, top);
        this.inlinePaths(tree.rootNode);
      } finally {
        this.macroDepth--;
      }
      return true;
    } finally {
      tree.delete();
    }
  }

  private item(item: Node, name: string, attrs: Node[]): void {
    const loc = this.loc(item);
    switch (item.type) {
      case "function_item": {
        const sig = signature(item).sig;
        const cfg = cfgDecorator(attrs);
        const existing = this.facts.declarations.get(name)?.[0];
        if (existing?.kind === "function") {
          // `#[cfg]` variants with different signatures are all listed, marked with their cfg.
          const key = (s: Signature) =>
            JSON.stringify([s.typeParams, s.params, s.returns, s.receiver ?? null]);
          if (!existing.signatures.some((s) => key(s) === key(sig))) {
            const firstCfg = this.cfgOf.get(existing);
            for (const s of existing.signatures) {
              if (firstCfg && !s.decorators?.includes(firstCfg))
                s.decorators = [...(s.decorators ?? []), firstCfg];
            }
            if (cfg) sig.decorators = [...(sig.decorators ?? []), cfg];
            existing.signatures.push(sig);
          }
          break;
        }
        const fn: ArchSymbol = {
          kind: "function",
          name,
          signatures: [sig],
          soft: emptySoft(),
          loc,
        };
        if (cfg) this.cfgOf.set(fn, cfg);
        this.declare(name, fn);
        break;
      }
      case "struct_item":
      case "union_item":
        this.declare(name, this.struct(item, name, attrs));
        break;
      case "enum_item":
        this.declare(name, this.enumSymbol(item, name, attrs));
        break;
      case "trait_item":
        this.declare(name, this.trait(item, name));
        break;
      case "type_item": {
        const type = item.childForFieldName("type");
        if (type) {
          this.declare(name, {
            kind: "type",
            name,
            typeParams: typeParams(item),
            type: typeText(type),
            soft: emptySoft(),
            loc,
          });
        }
        break;
      }
      case "const_item":
      case "static_item": {
        const type = item.childForFieldName("type");
        this.declare(name, {
          kind: "const",
          name,
          type: type ? typeText(type) : canonicalType("_"),
          soft: emptySoft(),
          loc,
        });
        break;
      }
      default:
        break;
    }
  }

  private struct(item: Node, name: string, attrs: Node[]): ClassLikeSymbol {
    const members: FieldMember[] = [];
    const body = item.childForFieldName("body");
    if (body?.type === "field_declaration_list") {
      for (const f of named(body)) {
        const fname = f.childForFieldName("name")?.text;
        const type = f.childForFieldName("type");
        if (f.type === "field_declaration" && fname && type && isPub(f)) {
          members.push(this.field(toSketchName(ident(fname)), typeText(type), f, false));
        }
      }
    } else if (body?.type === "ordered_field_declaration_list") {
      // Tuple struct: `pub struct Id(pub u64)` has the field `0`.
      let index = 0;
      let pub = false;
      for (const c of body.namedChildren) {
        if (!c) continue;
        if (c.type === "visibility_modifier") pub = c.text === "pub";
        else if (
          c.type !== "attribute_item" &&
          c.type !== "line_comment" &&
          c.type !== "block_comment"
        ) {
          if (pub) members.push(this.field(toSketchName(String(index)), typeText(c), c, false));
          index++;
          pub = false;
        }
      }
    }
    return {
      kind: "class",
      name,
      typeParams: typeParams(item),
      bases: derives(attrs),
      decorators: [],
      members,
      soft: emptySoft(),
      loc: this.loc(item),
    };
  }

  private enumSymbol(item: Node, name: string, attrs: Node[]): EnumSymbol {
    const members: EnumSymbol["members"] = [];
    const body = item.childForFieldName("body");
    for (const v of body ? named(body) : []) {
      if (v.type !== "enum_variant") continue;
      const vname = ident(v.childForFieldName("name")?.text ?? "");
      const data = v.childForFieldName("body");
      const m: EnumSymbol["members"][number] = { name: toSketchName(vname), soft: emptySoft() };
      if (data) m.payload = typeText(data);
      // An explicit discriminant (`Big = 10`) is the member's value.
      const value = v.childForFieldName("value");
      if (value && /^-?\s*(0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|[0-9][0-9_]*)$/.test(value.text)) {
        m.value = value.text.replace(/\s+|_/g, "");
      }
      members.push(m);
    }
    return {
      kind: "enum",
      name,
      bases: derives(attrs),
      members,
      soft: emptySoft(),
      loc: this.loc(item),
    };
  }

  private trait(item: Node, name: string): ClassLikeSymbol {
    const bounds = item.childForFieldName("bounds");
    const members: ClassLikeSymbol["members"] = [];
    const body = item.childForFieldName("body");
    for (const m of body ? named(body) : []) {
      const mname = ident(m.childForFieldName("name")?.text ?? "");
      if (m.type === "function_item" || m.type === "function_signature_item") {
        members.push(this.method(mname, m));
      } else if (m.type === "associated_type") {
        const b = m.childForFieldName("bounds");
        members.push(
          this.field(toSketchName(mname), canonicalType(b ? `type${b.text}` : "type"), m, false),
        );
      } else if (m.type === "const_item") {
        const type = m.childForFieldName("type");
        members.push(
          this.field(toSketchName(mname), type ? typeText(type) : canonicalType("_"), m, true),
        );
      }
    }
    return {
      kind: "interface",
      name,
      typeParams: typeParams(item),
      bases: bounds ? splitBounds(bounds) : [],
      decorators: [],
      members,
      soft: emptySoft(),
      loc: this.loc(item),
    };
  }

  private method(name: string, node: Node): MethodMember {
    const { sig, self } = signature(node);
    return {
      kind: "method",
      name: toSketchName(name),
      signatures: [sig],
      static: !self,
      classmethod: false,
      abstract: false,
      optional: false,
      soft: emptySoft(),
      loc: this.loc(node),
    };
  }

  private field(name: string, type: string, node: Node, isStatic: boolean): FieldMember {
    return {
      kind: "field",
      name,
      type,
      readonly: false,
      optional: false,
      static: isStatic,
      soft: emptySoft(),
      loc: this.loc(node),
    };
  }

  private impl(item: Node): void {
    const type = item.childForFieldName("type");
    if (!type) return;
    let t: Node | null = type;
    while (t?.type === "generic_type") t = t.childForFieldName("type");
    if (!t || (t.type !== "type_identifier" && t.type !== "scoped_type_identifier")) return;
    const trait = item.childForFieldName("trait");
    const impl: RustImpl = {
      type: t.text.replace(/\s+/g, "").split("::"),
      trait: trait ? typeText(trait) : null,
      methods: [],
      consts: [],
    };
    const body = item.childForFieldName("body");
    if (!trait && body) {
      let attrs: Node[] = [];
      for (const m of named(body)) {
        if (m.type === "attribute_item") {
          attrs.push(m);
          continue;
        }
        const testOnly = isTestOnly(attrs);
        attrs = [];
        if (testOnly || !isPub(m)) continue;
        const mname = ident(m.childForFieldName("name")?.text ?? "");
        if (m.type === "function_item") impl.methods.push(this.method(mname, m));
        else if (m.type === "const_item") {
          const ct = m.childForFieldName("type");
          impl.consts.push(
            this.field(toSketchName(mname), ct ? typeText(ct) : canonicalType("_"), m, true),
          );
        }
      }
    }
    this.rust.impls.push(impl);
  }

  private use(item: Node, pub: boolean): void {
    const arg = item.childForFieldName("argument");
    if (!arg) return;
    const leaves: Omit<RustPath, "pub" | "inline" | "line" | "column">[] = [];
    useLeaves(arg, [], leaves);
    const loc = this.loc(item);
    for (const leaf of leaves) {
      if (leaf.segments.length === 0) continue;
      this.rust.paths.push({ ...leaf, pub, inline: false, line: loc.line, column: loc.column });
      if (!leaf.glob)
        this.bound.add(leaf.alias ?? (leaf.segments[leaf.segments.length - 1] as string));
    }
  }

  /**
   * Paths used in code without a `use` (`crate::util::helper()`, `serde_json::to_string(…)`):
   * dependencies too. Paths whose first segment is a type (`Vec::new`) or a name bound by `use`
   * are skipped; test code is not read.
   */
  private inlinePaths(root: Node): void {
    const seen = new Set<string>();
    const visit = (node: Node): void => {
      let attrs: Node[] = [];
      for (const c of node.namedChildren) {
        if (!c) continue;
        if (c.type === "attribute_item") {
          attrs.push(c);
          continue;
        }
        const testOnly = isTestOnly(attrs);
        attrs = [];
        if (testOnly || c.type === "use_declaration") continue;
        if (c.type === "scoped_identifier" || c.type === "scoped_type_identifier") {
          this.inlinePath(c, seen);
          continue;
        }
        visit(c);
      }
    };
    visit(root);
  }

  private inlinePath(node: Node, seen: Set<string>): void {
    const segments = node.text
      .replace(/<[^<>]*(<[^<>]*>[^<>]*)*>/g, "")
      .replace(/\s+/g, "")
      .split("::")
      .filter(Boolean);
    const first = segments[0] ?? "";
    if (segments.length < 2 || seen.has(segments.join("::"))) return;
    if (
      !/^(crate|super|self|[a-z_][a-z0-9_]*)$/.test(first) ||
      (first !== "crate" && first !== "super" && first !== "self" && this.bound.has(first))
    ) {
      return;
    }
    seen.add(segments.join("::"));
    const loc = this.loc(node);
    this.rust.paths.push({
      segments,
      alias: null,
      glob: false,
      pub: false,
      inline: true,
      line: loc.line,
      column: loc.column,
    });
  }
}

/** `Send + Sync + 'static` → `Send`, `Sync`, `'static`. */
function splitBounds(bounds: Node): string[] {
  return named(bounds).map((b) => typeText(b));
}
