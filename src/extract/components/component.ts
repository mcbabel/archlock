/**
 * Facts for Vue, Svelte and Astro single-file components.
 *
 * The script blocks are parsed by the TypeScript extractor on a copy of the file in which
 * everything else is blanked, so imports keep their original line and column. The component
 * itself becomes the file's default export: a class whose fields are its props, with one
 * `on<Event>` handler field per emitted event.
 */

import ts from "typescript";
import { canonicalType } from "../../core/canonical.js";
import type { ArchSymbol, ClassLikeSymbol, Member } from "../../core/model.js";
import { countLines } from "../../fs/files.js";
import { ANONYMOUS_DEFAULT, type FileFacts, type ImportFact } from "../facts.js";
import { extractTypeScriptFile } from "../typescript/file.js";
import { type Framework, findBlocks, frameworkOf, maskOutside, type ScriptBlock } from "./sfc.js";

const BASE: Record<Framework, string> = {
  vue: "VueComponent",
  svelte: "SvelteComponent",
  astro: "AstroComponent",
};

export function extractComponentFile(path: string, text: string): FileFacts {
  const framework = frameworkOf(path);
  if (!framework) throw new Error(`not a component file: ${path}`);
  const blocks = findBlocks(text, framework);
  const kind = blocks.some((b) => /^(tsx|jsx)$/i.test(b.attrs.get("lang") ?? ""))
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;

  const all = extractTypeScriptFile(path, maskOutside(text, blocks), kind);
  const exporting = blocks.filter((b) => canExport(b, framework));
  const facts =
    exporting.length === blocks.length
      ? all
      : extractTypeScriptFile(path, maskOutside(text, exporting), kind);
  facts.imports = [...all.imports, ...srcImports(text, blocks)];
  facts.lines = countLines(text);

  facts.exports.delete("default");
  facts.declarations.delete(ANONYMOUS_DEFAULT);
  const name = componentName(path);
  if (name !== null) {
    const local = facts.declarations.has(name) ? `${name}Component` : name;
    facts.declarations.set(local, [componentSymbol(path, text, blocks, framework, local, kind)]);
    facts.exports.set("default", { kind: "local", local });
  }
  return facts;
}

/** Blocks whose `export` statements export from the file (not props, not client code). */
function canExport(block: ScriptBlock, framework: Framework): boolean {
  if (framework === "astro") return block.kind === "frontmatter";
  if (framework === "vue") return !block.attrs.has("setup");
  return isSvelteModuleScript(block);
}

function isSvelteModuleScript(block: ScriptBlock): boolean {
  return block.attrs.has("module") || block.attrs.get("context") === "module";
}

/** `<script src="./logic.ts">` imports that file. */
function srcImports(text: string, blocks: ScriptBlock[]): ImportFact[] {
  const out: ImportFact[] = [];
  for (const b of blocks) {
    const src = b.attrs.get("src");
    if (!src || /^(https?:)?\/\//.test(src)) continue;
    const before = text.slice(0, b.tagStart);
    const line = before.split("\n").length;
    const column = b.tagStart - before.lastIndexOf("\n");
    out.push({ specifier: src, names: [], line, column, typeOnly: false });
  }
  return out;
}

/**
 * `UserCard.vue` and `user-card.vue` → `UserCard`; `button/index.vue` → `Button`.
 * Route files (SvelteKit `+page.svelte`, files under `pages/`) are loaded by the framework,
 * not imported, so they export no component.
 */
export function componentName(path: string): string | null {
  const parts = path.split("/");
  const file = parts[parts.length - 1] as string;
  if (file.startsWith("+") || parts.slice(0, -1).includes("pages")) return null;
  let stem = file.replace(/\.[^.]+$/, "");
  if (stem === "index" && parts.length > 1) stem = parts[parts.length - 2] as string;
  const words = stem.split(/[^A-Za-z0-9$]+/).filter(Boolean);
  if (words.length === 0) return null;
  const pascal = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  return /^[0-9]/.test(pascal) ? `_${pascal}` : pascal;
}

// --- Component signature ---------------------------------------------------------------------

interface Props {
  /** TypeScript member declarations, e.g. `label: string` or `"onUpdate:modelValue"?: (v: T) => void`. */
  members: string[];
  /** Prop types that cannot be expanded here (imported types, utility types). */
  bases: string[];
}

function componentSymbol(
  path: string,
  text: string,
  blocks: ScriptBlock[],
  framework: Framework,
  name: string,
  kind: ts.ScriptKind,
): ClassLikeSymbol {
  const sf = ts.createSourceFile(
    "component.ts",
    maskOutside(text, blocks),
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const types = localTypes(sf);
  const inBlocks = (pick: (b: ScriptBlock) => boolean) => {
    const ranges = blocks.filter(pick);
    return sf.statements.filter((s) =>
      ranges.some((b) => s.getStart(sf) >= b.start && s.end <= b.end),
    );
  };
  const props: Props = { members: [], bases: [] };
  let generic: string | undefined;
  if (framework === "vue") {
    vueProps(
      inBlocks(() => true),
      types,
      sf,
      props,
    );
    generic = blocks.find((b) => b.attrs.has("setup"))?.attrs.get("generic");
  } else if (framework === "svelte") {
    const instance = (b: ScriptBlock) => b.kind === "script" && !isSvelteModuleScript(b);
    svelteProps(inBlocks(instance), types, sf, props);
    generic = blocks.find(instance)?.attrs.get("generics");
  } else {
    astroProps(
      inBlocks((b) => b.kind === "frontmatter"),
      types,
      sf,
      props,
    );
  }

  const first = blocks[0];
  const line = first ? text.slice(0, first.start).split("\n").length : 1;
  const loc = { file: path, line, column: 1 };
  const synthetic = extractTypeScriptFile(
    "props.ts",
    `interface Props${generic ? `<${generic}>` : ""} {\n${props.members.join(";\n")}\n}`,
  ).declarations.get("Props")?.[0] as ClassLikeSymbol | undefined;
  const members: Member[] = (synthetic?.members ?? []).map((m) => ({ ...m, loc }));
  return {
    kind: "class",
    name,
    typeParams: synthetic?.typeParams ?? [],
    bases: [BASE[framework], ...props.bases.filter((b, i, all) => all.indexOf(b) === i)],
    decorators: [],
    members,
    soft: { leading: [], trailing: null, docstring: null, body: [] },
    loc,
  } satisfies ArchSymbol;
}

type LocalType = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;

function localTypes(sf: ts.SourceFile): Map<string, LocalType[]> {
  const out = new Map<string, LocalType[]>();
  for (const s of sf.statements) {
    if (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) {
      out.set(s.name.text, [...(out.get(s.name.text) ?? []), s]);
    }
  }
  return out;
}

/** Expands a props type into member declarations, following local interfaces and aliases. */
function addPropsType(
  node: ts.TypeNode,
  types: Map<string, LocalType[]>,
  sf: ts.SourceFile,
  props: Props,
  seen = new Set<string>(),
): void {
  if (ts.isParenthesizedTypeNode(node)) {
    addPropsType(node.type, types, sf, props, seen);
    return;
  }
  if (ts.isTypeLiteralNode(node)) {
    for (const m of node.members) props.members.push(m.getText(sf));
    return;
  }
  if (ts.isIntersectionTypeNode(node)) {
    for (const t of node.types) addPropsType(t, types, sf, props, seen);
    return;
  }
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    !node.typeArguments &&
    addLocalType(node.typeName.text, types, sf, props, seen)
  ) {
    return;
  }
  props.bases.push(canonicalType(node.getText(sf)));
}

/** Adds the members of a local interface or type alias; false if there is none. */
function addLocalType(
  name: string,
  types: Map<string, LocalType[]>,
  sf: ts.SourceFile,
  props: Props,
  seen = new Set<string>(),
): boolean {
  const local = types.get(name);
  if (!local || seen.has(name)) return false;
  seen.add(name);
  for (const decl of local) {
    if (ts.isTypeAliasDeclaration(decl)) {
      addPropsType(decl.type, types, sf, props, seen);
      continue;
    }
    for (const m of decl.members) props.members.push(m.getText(sf));
    for (const clause of decl.heritageClauses ?? []) {
      for (const h of clause.types) {
        const own =
          !h.typeArguments &&
          ts.isIdentifier(h.expression) &&
          addLocalType(h.expression.text, types, sf, props, seen);
        if (!own) props.bases.push(canonicalType(h.getText(sf)));
      }
    }
  }
  return true;
}

/** `id: string` declarations from a destructuring pattern; defaults make a prop optional. */
function addPatternProps(pattern: ts.ObjectBindingPattern, props: Props): void {
  for (const el of pattern.elements) {
    if (el.dotDotDotToken) continue;
    const name = el.propertyName ?? el.name;
    if (!ts.isIdentifier(name) && !ts.isStringLiteral(name)) continue;
    props.members.push(`${propertyKey(name.text)}${el.initializer ? "?" : ""}`);
  }
}

function propertyKey(name: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
}

/** `change` → `onChange`, `update:modelValue` → `"onUpdate:modelValue"`. */
function handlerKey(event: string): string {
  return propertyKey(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`);
}

function addEvent(props: Props, event: string, params: string | null): void {
  props.members.push(
    params === null ? `${handlerKey(event)}?` : `${handlerKey(event)}?: (${params}) => void`,
  );
}

/** Vue listens to `calendar-change` as `onCalendarChange` (`toHandlerKey(camelize(event))`). */
function addVueEvent(props: Props, event: string, params: string | null): void {
  addEvent(
    props,
    event.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()),
    params,
  );
}

/** Props or emits given as an object defined elsewhere (`defineProps(buttonProps)`). */
function addRuntimeBase(arg: ts.Expression, sf: ts.SourceFile, props: Props): boolean {
  let e = arg;
  while (ts.isAsExpression(e) || ts.isParenthesizedExpression(e)) e = e.expression;
  if (!ts.isIdentifier(e) && !ts.isPropertyAccessExpression(e)) return false;
  props.bases.push(canonicalType(`typeof ${e.getText(sf)}`));
  return true;
}

function stringLiterals(node: ts.TypeNode): string[] | null {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [node.literal.text];
  if (ts.isUnionTypeNode(node)) {
    const out: string[] = [];
    for (const t of node.types) {
      const s = stringLiterals(t);
      if (!s) return null;
      out.push(...s);
    }
    return out;
  }
  return null;
}

/** Calls anywhere below the given statements, in source order. */
function calls(stmts: readonly ts.Statement[], name: string): ts.CallExpression[] {
  const out: ts.CallExpression[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === name) {
      out.push(n);
    }
    ts.forEachChild(n, visit);
  };
  for (const s of stmts) visit(s);
  return out;
}

// --- Vue ---

const VUE_CONSTRUCTORS: Record<string, string> = {
  String: "string",
  Number: "number",
  Boolean: "boolean",
  BigInt: "bigint",
  Symbol: "symbol",
  Array: "unknown[]",
  Object: "Record<string, unknown>",
  Function: "Function",
};

function vueRuntimeType(node: ts.Expression, sf: ts.SourceFile): string | null {
  if (ts.isAsExpression(node)) {
    const t = node.type;
    if (ts.isTypeReferenceNode(t) && t.typeName.getText(sf) === "PropType" && t.typeArguments) {
      return (t.typeArguments[0] as ts.TypeNode).getText(sf);
    }
    return vueRuntimeType(node.expression, sf);
  }
  if (ts.isIdentifier(node)) return VUE_CONSTRUCTORS[node.text] ?? node.text;
  if (ts.isArrayLiteralExpression(node)) {
    const parts = node.elements.map((e) => vueRuntimeType(e, sf));
    return parts.every((p) => p !== null) ? parts.join(" | ") : null;
  }
  return null;
}

function vueRuntimeProps(arg: ts.Expression, sf: ts.SourceFile, props: Props): void {
  if (addRuntimeBase(arg, sf, props)) return;
  if (ts.isArrayLiteralExpression(arg)) {
    for (const e of arg.elements)
      if (ts.isStringLiteral(e)) props.members.push(`${propertyKey(e.text)}?`);
    return;
  }
  if (!ts.isObjectLiteralExpression(arg)) return;
  for (const p of arg.properties) {
    if (!ts.isPropertyAssignment(p) || !p.name || ts.isComputedPropertyName(p.name)) continue;
    const key = propertyKey(p.name.getText(sf).replace(/^["']|["']$/g, ""));
    let type: string | null = null;
    let required = false;
    if (ts.isObjectLiteralExpression(p.initializer)) {
      for (const q of p.initializer.properties) {
        if (!ts.isPropertyAssignment(q)) continue;
        const qn = q.name.getText(sf);
        if (qn === "type") type = vueRuntimeType(q.initializer, sf);
        if (qn === "required") required = q.initializer.kind === ts.SyntaxKind.TrueKeyword;
      }
    } else {
      type = vueRuntimeType(p.initializer, sf);
    }
    props.members.push(`${key}${required ? "" : "?"}${type ? `: ${type}` : ""}`);
  }
}

function vueEmitsType(
  node: ts.TypeNode,
  types: Map<string, LocalType[]>,
  sf: ts.SourceFile,
  props: Props,
): void {
  const members: ts.TypeElement[] = [];
  if (ts.isTypeLiteralNode(node)) members.push(...node.members);
  else if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    types.has(node.typeName.text)
  ) {
    for (const d of types.get(node.typeName.text) ?? []) {
      if (ts.isInterfaceDeclaration(d)) members.push(...d.members);
      else if (ts.isTypeLiteralNode(d.type)) members.push(...d.type.members);
    }
  } else {
    // An emits type defined elsewhere is part of the signature as a base.
    props.bases.push(canonicalType(node.getText(sf)));
  }
  for (const m of members) {
    if (ts.isCallSignatureDeclaration(m)) {
      const [first, ...rest] = m.parameters;
      const names = first?.type ? stringLiterals(first.type) : null;
      for (const event of names ?? []) {
        addVueEvent(props, event, rest.map((p) => p.getText(sf)).join(", "));
      }
    } else if (ts.isPropertySignature(m) && m.type && ts.isTupleTypeNode(m.type)) {
      const params = m.type.elements.map((e, i) =>
        ts.isNamedTupleMember(e) ? e.getText(sf) : `arg${i}: ${e.getText(sf)}`,
      );
      addVueEvent(props, m.name.getText(sf).replace(/^["']|["']$/g, ""), params.join(", "));
    }
  }
}

function vueRuntimeEmits(arg: ts.Expression, sf: ts.SourceFile, props: Props): void {
  if (addRuntimeBase(arg, sf, props)) return;
  if (ts.isArrayLiteralExpression(arg)) {
    for (const e of arg.elements) if (ts.isStringLiteral(e)) addVueEvent(props, e.text, null);
  } else if (ts.isObjectLiteralExpression(arg)) {
    for (const p of arg.properties) {
      if (!p.name || ts.isComputedPropertyName(p.name)) continue;
      const event = p.name.getText(sf).replace(/^["']|["']$/g, "");
      const fn =
        ts.isPropertyAssignment(p) &&
        (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer))
          ? p.initializer
          : ts.isMethodDeclaration(p)
            ? p
            : null;
      addVueEvent(props, event, fn ? fn.parameters.map((q) => q.getText(sf)).join(", ") : null);
    }
  }
}

function vueProps(
  stmts: readonly ts.Statement[],
  types: Map<string, LocalType[]>,
  sf: ts.SourceFile,
  props: Props,
): void {
  for (const call of calls(stmts, "defineProps")) {
    const typeArg = call.typeArguments?.[0];
    if (typeArg) addPropsType(typeArg, types, sf, props);
    else if (call.arguments[0]) vueRuntimeProps(call.arguments[0], sf, props);
  }
  for (const call of calls(stmts, "defineEmits")) {
    const typeArg = call.typeArguments?.[0];
    if (typeArg) vueEmitsType(typeArg, types, sf, props);
    else if (call.arguments[0]) vueRuntimeEmits(call.arguments[0], sf, props);
  }
  for (const call of calls(stmts, "defineModel")) {
    const [first, second] = call.arguments;
    const name = first && ts.isStringLiteral(first) ? first.text : "modelValue";
    const options = (first && ts.isObjectLiteralExpression(first) ? first : second) as
      | ts.Expression
      | undefined;
    const required =
      !!options &&
      ts.isObjectLiteralExpression(options) &&
      options.properties.some(
        (p) =>
          ts.isPropertyAssignment(p) &&
          p.name.getText(sf) === "required" &&
          p.initializer.kind === ts.SyntaxKind.TrueKeyword,
      );
    const type = call.typeArguments?.[0]?.getText(sf);
    props.members.push(`${propertyKey(name)}${required ? "" : "?"}${type ? `: ${type}` : ""}`);
    addVueEvent(props, `update:${name}`, type ? `value: ${type}` : null);
  }
  // Options API: `export default { props, emits }` or `export default defineComponent({ ... })`.
  for (const s of stmts) {
    if (!ts.isExportAssignment(s)) continue;
    let obj: ts.Expression = s.expression;
    if (ts.isCallExpression(obj) && obj.arguments[0]) obj = obj.arguments[0];
    if (!ts.isObjectLiteralExpression(obj)) continue;
    for (const p of obj.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const key = p.name.getText(sf);
      if (key === "props") vueRuntimeProps(p.initializer, sf, props);
      if (key === "emits") vueRuntimeEmits(p.initializer, sf, props);
    }
  }
}

// --- Svelte ---

function svelteProps(
  stmts: readonly ts.Statement[],
  types: Map<string, LocalType[]>,
  sf: ts.SourceFile,
  props: Props,
): void {
  const declared = addLocalType("$$Props", types, sf, props);
  for (const s of stmts) {
    if (!ts.isVariableStatement(s)) continue;
    const exported = s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
    const isLet = (s.declarationList.flags & ts.NodeFlags.Let) !== 0;
    for (const d of s.declarationList.declarations) {
      // Svelte 5: `let { a, b = 1 }: Props = $props()`.
      if (
        d.initializer &&
        ts.isCallExpression(d.initializer) &&
        ts.isIdentifier(d.initializer.expression) &&
        d.initializer.expression.text === "$props"
      ) {
        if (d.type) addPropsType(d.type, types, sf, props);
        else if (ts.isObjectBindingPattern(d.name)) addPatternProps(d.name, props);
        continue;
      }
      // Svelte 4: `export let name: T = default`.
      if (exported && isLet && !declared && ts.isIdentifier(d.name)) {
        const type = d.type ? `: ${d.type.getText(sf)}` : "";
        props.members.push(`${d.name.text}${d.initializer ? "?" : ""}${type}`);
      }
    }
  }
  // Svelte 4 events: `createEventDispatcher<{ change: T }>()`.
  for (const call of calls(stmts, "createEventDispatcher")) {
    const t = call.typeArguments?.[0];
    if (!t || !ts.isTypeLiteralNode(t)) continue;
    for (const m of t.members) {
      if (!ts.isPropertySignature(m) || !m.type) continue;
      const event = m.name.getText(sf).replace(/^["']|["']$/g, "");
      addEvent(props, event, `event: CustomEvent<${m.type.getText(sf)}>`);
    }
  }
}

// --- Astro ---

function astroProps(
  stmts: readonly ts.Statement[],
  types: Map<string, LocalType[]>,
  sf: ts.SourceFile,
  props: Props,
): void {
  if (addLocalType("Props", types, sf, props)) return;
  // Without a Props type: `const { a, b = 1 } = Astro.props`.
  for (const s of stmts) {
    if (!ts.isVariableStatement(s)) continue;
    for (const d of s.declarationList.declarations) {
      let init = d.initializer;
      while (init && (ts.isAsExpression(init) || ts.isParenthesizedExpression(init))) {
        init = init.expression;
      }
      if (init && init.getText(sf) === "Astro.props" && ts.isObjectBindingPattern(d.name)) {
        addPatternProps(d.name, props);
      }
    }
  }
}
