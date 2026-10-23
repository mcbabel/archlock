/**
 * Renders an ArchModule as `.arch.py` text. Byte-stable: LF line endings, fixed group order,
 * alphabetical symbols, canonical types.
 */

import { isBareType, isPythonIdentifier, pythonString, renderType } from "../core/canonical.js";
import {
  type ArchModule,
  type ArchSymbol,
  type ClassLikeSymbol,
  compareNames,
  type EnumSymbol,
  type FieldMember,
  type FunctionSymbol,
  HEADER_KEYS,
  type HeaderKey,
  type Member,
  type MethodMember,
  type Param,
  type Signature,
  type Soft,
  SYMBOL_KIND_ORDER,
} from "../core/model.js";

export const INDENT = "    ";
export const MAX_LINE = 100;

/** Field type wrappers, outermost first. */
export const FIELD_WRAPPERS = ["ClassVar", "Readonly", "Opt"] as const;

export function renderSketch(mod: ArchModule): string {
  const blocks: string[][] = [];
  const soft = mod.soft;

  const top: string[] = [...soft.fileLeading];
  if (soft.docstring !== null) {
    top.push(withTrailing(renderDocstring(soft.docstring, ""), soft.docstringTrailing));
  }
  if (top.length > 0) blocks.push(top);

  const header: string[] = [];
  for (const key of HEADER_KEYS) {
    const value = headerValue(mod, key);
    if (value === undefined) continue;
    const hs = soft.header[key];
    if (hs) header.push(...hs.leading);
    header.push(withTrailing(renderAssignment(key, value), hs?.trailing ?? null));
  }
  blocks.push(header);

  if (mod.reexports.length > 0) {
    const lines: string[] = [];
    const sorted = [...mod.reexports].sort((a, b) => compareNames(a.from, b.from));
    for (const re of sorted) {
      lines.push(...re.leading);
      const names = [...re.names].sort(compareNames);
      const oneLine = `from ${re.from} import ${names.join(", ")}`;
      if (oneLine.length <= MAX_LINE) lines.push(oneLine);
      else lines.push(`from ${re.from} import (`, ...names.map((n) => `${INDENT}${n},`), ")");
    }
    blocks.push(lines);
  }

  for (const kind of SYMBOL_KIND_ORDER) {
    const symbols = mod.symbols.filter((s) => s.kind === kind).sort(compareSymbols);
    if (symbols.length === 0) continue;
    const rendered = symbols.map((s) => renderSymbol(s, ""));
    blocks.push(joinItems(rendered));
  }

  if (soft.fileTrailing.length > 0) blocks.push([...soft.fileTrailing]);

  return `${blocks.map((b) => b.join("\n")).join("\n\n")}\n`;
}

function compareSymbols(a: ArchSymbol, b: ArchSymbol): number {
  return compareNames(a.name, b.name);
}

/** Joins rendered items; multi-line items are separated from their neighbours by a blank line. */
function joinItems(items: string[][]): string[] {
  const out: string[] = [];
  const multiLine = (item: string[]) => item.length > 1 || item.some((l) => l.includes("\n"));
  items.forEach((item, i) => {
    const prev = items[i - 1];
    if (prev && (multiLine(prev) || multiLine(item))) out.push("");
    out.push(...item);
  });
  return out;
}

function headerValue(mod: ArchModule, key: HeaderKey): string | string[] | undefined {
  switch (key) {
    case "__module__":
      return mod.name;
    case "__paths__":
      return mod.paths;
    case "__entry__":
      return mod.entry ?? undefined;
    case "__depends_on__":
      return [...mod.dependsOn].sort(compareNames);
    case "__external__":
      return mod.external ? [...mod.external].sort(compareNames) : undefined;
    case "__strictness__":
      return mod.strictness === "signatures" ? undefined : mod.strictness;
  }
}

function renderAssignment(key: string, value: string | string[]): string {
  if (typeof value === "string") return `${key} = ${JSON.stringify(value)}`;
  const oneLine = `${key} = [${value.map((v) => JSON.stringify(v)).join(", ")}]`;
  if (oneLine.length <= MAX_LINE) return oneLine;
  return [`${key} = [`, ...value.map((v) => `${INDENT}${JSON.stringify(v)},`), "]"].join("\n");
}

function withTrailing(text: string, trailing: string | null): string {
  if (trailing === null) return text;
  // The last line is a header's `:` line, a one-liner, or a docstring's closing line.
  const lines = text.split("\n");
  lines[lines.length - 1] = `${lines[lines.length - 1]}  ${trailing}`;
  return lines.join("\n");
}

export function renderDocstring(raw: string, indent: string): string {
  return raw
    .split("\n")
    .map((line, i) => (i === 0 || line === "" ? `${indent}${line}`.trimEnd() : `${indent}${line}`))
    .join("\n");
}

function renderSymbol(sym: ArchSymbol, indent: string): string[] {
  switch (sym.kind) {
    case "enum":
      return renderEnum(sym, indent);
    case "type": {
      const tp =
        sym.typeParams.length > 0 ? `[${sym.typeParams.map(renderTypeParam).join(", ")}]` : "";
      const line = `${indent}${sym.name}: TypeAlias${tp} = ${renderType(sym.type)}`;
      return [...indented(sym.soft.leading, indent), withTrailing(line, sym.soft.trailing)];
    }
    case "const": {
      const line = `${indent}${sym.name}: ${renderType(sym.type)}`;
      return [...indented(sym.soft.leading, indent), withTrailing(line, sym.soft.trailing)];
    }
    case "class":
    case "interface":
      return renderClass(sym, indent);
    case "function":
      return renderFunction(sym, indent);
  }
}

function indented(lines: string[], indent: string): string[] {
  return lines.map((l) => `${indent}${l}`);
}

export function renderTypeParam(param: string): string {
  if (isPythonIdentifier(param)) return param;
  const m = /^([\p{L}_][\p{L}\p{N}_]*): (.+)$/u.exec(param);
  if (m && isPythonIdentifier(m[1] as string) && isBareType(m[2] as string)) return param;
  return pythonString(param);
}

function classBody(
  indent: string,
  header: string,
  soft: Soft,
  bodyLines: string[],
  leadingDecorators: string[],
): string[] {
  const inner = indent + INDENT;
  const out: string[] = [...indented(soft.leading, indent), ...leadingDecorators];
  const contents: string[] = [];
  if (soft.docstring !== null) contents.push(renderDocstring(soft.docstring, inner));
  contents.push(...bodyLines);
  contents.push(...indented(soft.body, inner));
  if (contents.length === 0) {
    out.push(withTrailing(`${header} ...`, soft.trailing));
  } else {
    out.push(withTrailing(header, soft.trailing));
    out.push(...contents);
  }
  return out;
}

/** `Enum` goes last unless another enum base (`IntEnum`) is there: `class Color(str, Enum)`. */
const ENUM_BASES = new Set(["Enum", "IntEnum", "StrEnum", "Flag", "IntFlag"]);

function enumBases(sym: EnumSymbol): string {
  const bases = sym.bases.map((b) => renderType(b));
  if (!sym.bases.some((b) => ENUM_BASES.has(b))) bases.push("Enum");
  return bases.join(", ");
}

function renderEnum(sym: EnumSymbol, indent: string): string[] {
  const inner = indent + INDENT;
  const bases = enumBases(sym);
  const lines: string[] = [];
  for (const m of sym.members) {
    lines.push(...indented(m.soft.leading, inner));
    const value = m.payload === undefined ? "..." : pythonString(m.payload);
    lines.push(withTrailing(`${inner}${m.name} = ${value}`, m.soft.trailing));
  }
  for (const m of sortMembers(sym.methods ?? [])) {
    if (m.kind === "method") lines.push(...renderMethod(m, inner));
  }
  return classBody(indent, `${indent}class ${sym.name}(${bases}):`, sym.soft, lines, []);
}

function renderClass(sym: ClassLikeSymbol, indent: string): string[] {
  const inner = indent + INDENT;
  const bases = sym.bases.map((b) => renderType(b));
  if (sym.kind === "interface") bases.push("Protocol");
  const tp = sym.typeParams.length > 0 ? `[${sym.typeParams.map(renderTypeParam).join(", ")}]` : "";
  const header = `${indent}class ${sym.name}${tp}${bases.length > 0 ? `(${bases.join(", ")})` : ""}:`;
  const decorators = [...sym.decorators].sort(compareNames).map((d) => `${indent}@${d}`);
  const members = sortMembers(sym.members);
  const lines: string[] = [];
  for (const m of members) {
    if (m.kind === "field") lines.push(...renderField(m, inner));
    else lines.push(...renderMethod(m, inner));
  }
  return classBody(indent, header, sym.soft, lines, decorators);
}

/** Fields first (alphabetical), then methods: `__init__` first, then alphabetical. */
export function sortMembers(members: Member[]): Member[] {
  const rank = (m: Member) => (m.kind === "field" ? 0 : m.name === "__init__" ? 1 : 2);
  return [...members].sort((a, b) => rank(a) - rank(b) || compareNames(a.name, b.name));
}

/**
 * A field type that literally starts with a wrapper name (e.g. TS `Readonly<Foo>`) is quoted,
 * so it cannot be confused with the `readonly` flag.
 */
function renderFieldType(type: string): string {
  const looksWrapped = FIELD_WRAPPERS.some((w) => type.startsWith(`${w}[`));
  return looksWrapped ? pythonString(type) : renderType(type);
}

export function renderFieldName(name: string): string {
  return isPythonIdentifier(name) ? name : `self[${JSON.stringify(name)}]`;
}

function renderField(field: FieldMember, indent: string): string[] {
  let type = renderFieldType(field.type);
  if (field.optional) type = `Opt[${type}]`;
  if (field.readonly) type = `Readonly[${type}]`;
  if (field.static) type = `ClassVar[${type}]`;
  const line = `${indent}${renderFieldName(field.name)}: ${type}`;
  return [...indented(field.soft.leading, indent), withTrailing(line, field.soft.trailing)];
}

function renderMethod(method: MethodMember, indent: string): string[] {
  const decorators: string[] = [];
  if (method.static) decorators.push("staticmethod");
  if (method.classmethod) decorators.push("classmethod");
  if (method.abstract) decorators.push("abstractmethod");
  if (method.optional) decorators.push("optional");
  const self = method.static ? null : method.classmethod ? "cls" : "self";
  return renderDefs(method.name, method.signatures, method.soft, indent, decorators, self);
}

function renderFunction(fn: FunctionSymbol, indent: string): string[] {
  return renderDefs(fn.name, fn.signatures, fn.soft, indent, [], null);
}

function renderDefs(
  name: string,
  signatures: Signature[],
  soft: Soft,
  indent: string,
  decorators: string[],
  self: string | null,
): string[] {
  const out: string[] = [...indented(soft.leading, indent)];
  const overloaded = signatures.length > 1;
  signatures.forEach((sig, i) => {
    for (const d of decorators) out.push(`${indent}@${d}`);
    if (overloaded) out.push(`${indent}@overload`);
    const header = renderDefHeader(name, sig, indent, self);
    // Docstring, body comments and the trailing comment belong to the first signature.
    const bodySoft = i === 0 ? soft : null;
    const inner = indent + INDENT;
    const hasBody = bodySoft !== null && (bodySoft.docstring !== null || bodySoft.body.length > 0);
    if (!hasBody) {
      out.push(withTrailing(`${header} ...`, bodySoft?.trailing ?? null));
      return;
    }
    out.push(withTrailing(header, bodySoft.trailing));
    if (bodySoft.docstring !== null) out.push(renderDocstring(bodySoft.docstring, inner));
    out.push(...indented(bodySoft.body, inner));
    out.push(`${inner}...`);
  });
  return out;
}

export function renderParam(p: Param): string {
  switch (p.kind) {
    case "star":
      return "*";
    case "slash":
      return "/";
    default: {
      const prefix = p.kind === "rest" ? "*" : p.kind === "kwrest" ? "**" : "";
      const type = p.type === null ? "" : `: ${renderType(p.type)}`;
      const def = p.optional ? (p.type === null ? "=..." : " = ...") : "";
      return `${prefix}${p.name}${type}${def}`;
    }
  }
}

function renderDefHeader(
  name: string,
  sig: Signature,
  indent: string,
  self: string | null,
): string {
  const params = sig.params.map(renderParam);
  if (self !== null) params.unshift(self);
  const tp = sig.typeParams.length > 0 ? `[${sig.typeParams.map(renderTypeParam).join(", ")}]` : "";
  const ret = sig.returns === null ? "" : ` -> ${renderType(sig.returns)}`;
  const def = `${indent}${sig.async ? "async " : ""}def ${name}`;
  const prefix = `${def}${tp}(`;
  const oneLine = `${prefix}${params.join(", ")})${ret}:`;
  // `+ 4` leaves room for the ` ...` of one-liners.
  if (oneLine.length + 4 <= MAX_LINE || (params.length === 0 && prefix.length <= MAX_LINE)) {
    return oneLine;
  }
  const inner = indent + INDENT;
  // Type parameters that do not fit on the `def` line get one line each, like parameters.
  const head =
    prefix.length <= MAX_LINE
      ? [prefix]
      : [`${def}[`, ...sig.typeParams.map((p) => `${inner}${renderTypeParam(p)},`), `${indent}](`];
  if (params.length === 0) {
    head[head.length - 1] += `)${ret}:`;
    return head.join("\n");
  }
  return [...head, ...params.map((p) => `${inner}${p},`), `${indent})${ret}:`].join("\n");
}

/** One-line summaries used in reports (never wrapped, no trailing `:`). */
export function defLine(name: string, sig: Signature, self: string | null = null): string {
  const params = sig.params.map(renderParam);
  if (self !== null) params.unshift(self);
  const tp = sig.typeParams.length > 0 ? `[${sig.typeParams.map(renderTypeParam).join(", ")}]` : "";
  const ret = sig.returns === null ? "" : ` -> ${renderType(sig.returns)}`;
  return `${sig.async ? "async " : ""}def ${name}${tp}(${params.join(", ")})${ret}`;
}

export function fieldLine(field: FieldMember): string {
  return renderField(field, "")[field.soft.leading.length] as string;
}

export function memberLines(member: Member): string[] {
  if (member.kind === "field") return [fieldLine(member)];
  const self = member.static ? null : member.classmethod ? "cls" : "self";
  const flags = [
    member.static ? "@staticmethod " : "",
    member.classmethod ? "@classmethod " : "",
    member.abstract ? "@abstractmethod " : "",
    member.optional ? "@optional " : "",
  ].join("");
  return member.signatures.map((s) => `${flags}${defLine(member.name, s, self)}`);
}

export function symbolLines(sym: ArchSymbol): string[] {
  switch (sym.kind) {
    case "function":
      return sym.signatures.map((s) => defLine(sym.name, s));
    case "const":
      return [`${sym.name}: ${renderType(sym.type)}`];
    case "type": {
      const tp =
        sym.typeParams.length > 0 ? `[${sym.typeParams.map(renderTypeParam).join(", ")}]` : "";
      return [`${sym.name}: TypeAlias${tp} = ${renderType(sym.type)}`];
    }
    case "enum":
      return [`class ${sym.name}(${enumBases(sym)})`];
    case "class":
    case "interface": {
      const bases = sym.bases.map((b) => renderType(b));
      if (sym.kind === "interface") bases.push("Protocol");
      const tp =
        sym.typeParams.length > 0 ? `[${sym.typeParams.map(renderTypeParam).join(", ")}]` : "";
      return [`class ${sym.name}${tp}${bases.length > 0 ? `(${bases.join(", ")})` : ""}`];
    }
  }
}

/** A single symbol as it appears in a sketch (with its comments), for prompts and reports. */
export function renderSymbolText(sym: ArchSymbol): string {
  return renderSymbol(sym, "").join("\n");
}
