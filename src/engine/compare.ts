/** Compares sketches with code and returns violations in a deterministic order. */

import {
  type ArchSymbol,
  type ClassLikeSymbol,
  compareNames,
  type EnumSymbol,
  type Location,
  type Member,
  type Signature,
} from "../core/model.js";
import type { RuleName, Severity } from "../core/rules.js";
import type { CodeModule, CodeProject, ImportSite } from "../extract/index.js";
import type { LoadedSketch } from "../sketch/load.js";
import type { SketchError } from "../sketch/parse.js";
import { enumMemberLine, hasPositionalFields, memberLines, symbolLines } from "../sketch/render.js";

export type ActiveSeverity = Exclude<Severity, "off">;

export interface Violation {
  rule: RuleName;
  severity: ActiveSeverity;
  /** Module the violation belongs to (null for project-wide ones like unassigned files). */
  module: string | null;
  /** Symbol name inside the module, if any (e.g. `Invoice` or `Invoice.total`). */
  symbol?: string;
  message: string;
  /** Extra lines, e.g. sketch vs. code signatures. */
  details?: string[];
  code?: Location;
  sketch?: Location;
  /** What to do next. */
  hint?: string;
}

export interface CompareInput {
  sketches: LoadedSketch[];
  sketchErrors: SketchError[];
  /** Modules whose sketch could not be parsed: dependencies on them are not judged. */
  brokenModules?: string[];
  project: CodeProject;
  rules: Record<RuleName, Severity>;
}

export function compare(input: CompareInput): Violation[] {
  const { sketches, project, rules } = input;
  const out: Violation[] = [];
  const add = (v: Omit<Violation, "severity">) => {
    const severity = rules[v.rule];
    if (severity === "off") return;
    out.push({ ...v, severity });
  };

  for (const e of input.sketchErrors) {
    add({
      rule: "sketch_invalid",
      module: moduleFromSketchFile(e.file),
      message: e.message,
      sketch: { file: e.file, line: e.line, column: e.column },
      hint: "fix the sketch; see docs/FORMAT.md for the format",
    });
  }

  for (const sketch of sketches) {
    const code = project.modules.get(sketch.module.name);
    if (!code) continue;
    compareModule(sketch, code, add, new Set(input.brokenModules ?? []));
  }

  // Unassigned files are noise while a sketch is broken (its files look unassigned).
  if (input.sketchErrors.length === 0) {
    for (const file of project.unassigned) {
      add({
        rule: "unassigned_file",
        module: null,
        message: `${file} belongs to no module`,
        code: { file, line: 1, column: 1 },
        hint: "add a matching glob to a module's __paths__, or exclude the file in archlock.config.json",
      });
    }
  }

  for (const d of project.deepImports) {
    const what = d.name === "*" ? `the whole file ${d.target}` : `\`${d.name}\` from ${d.target}`;
    const entry = project.modules.get(d.to)?.entry;
    add({
      rule: "deep_import",
      module: d.from,
      message: `imports ${what}, which is not part of ${d.to}'s public API`,
      code: siteLoc(d.site),
      hint: entry
        ? `import it through ${entry}, or export it from there to make it public`
        : `make it public in ${d.to}, or stop depending on it`,
    });
  }

  if (rules.dependency_cycle !== "off") {
    const graph = new Map<string, string[]>();
    for (const mod of project.modules.values()) {
      graph.set(mod.name, [...mod.deps.keys()].sort(compareNames));
    }
    for (const cycle of findCycles(graph)) {
      const first = cycle[0] as string;
      const next = cycle[1 % cycle.length] as string;
      const site = project.modules.get(first)?.deps.get(next)?.[0];
      add({
        rule: "dependency_cycle",
        module: first,
        message: `dependency cycle: ${[...cycle, first].join(" → ")}`,
        code: site ? siteLoc(site) : undefined,
        hint: "break the cycle by moving shared code into its own module",
      });
    }
  }

  return sortViolations(out);
}

function moduleFromSketchFile(file: string): string | null {
  const m = /([^/]+)\.arch\.py$/.exec(file);
  return m ? (m[1] as string) : null;
}

function siteLoc(site: ImportSite): Location {
  return { file: site.file, line: site.line, column: site.column };
}

export function sortViolations(list: Violation[]): Violation[] {
  const key = (v: Violation) => [
    v.module ?? "￿",
    v.rule,
    v.symbol ?? "",
    v.code?.file ?? v.sketch?.file ?? "",
    String(v.code?.line ?? v.sketch?.line ?? 0).padStart(8, "0"),
    v.message,
  ];
  return [...list].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i++) {
      const c = compareNames(ka[i] as string, kb[i] as string);
      if (c !== 0) return c;
    }
    return 0;
  });
}

function compareModule(
  sketch: LoadedSketch,
  code: CodeModule,
  add: (v: Omit<Violation, "severity">) => void,
  broken: Set<string>,
): void {
  const mod = sketch.module;
  const name = mod.name;
  const depsLine = mod.headerLines?.__depends_on__ ?? mod.headerLines?.__module__ ?? 1;
  const sketchAt = (line: number): Location => ({ file: sketch.file, line, column: 1 });
  const hasCode = code.files.length > 0;

  for (const [target, sites] of [...code.deps.entries()].sort(([a], [b]) => compareNames(a, b))) {
    if (mod.dependsOn.includes(target)) continue;
    const first = sites[0] as ImportSite;
    add({
      rule: "undeclared_dependency",
      module: name,
      message: `new dependency: ${target} (not in __depends_on__)`,
      details:
        sites.length > 1
          ? [`imported in ${sites.length} places; first at ${first.file}:${first.line}`]
          : undefined,
      code: siteLoc(first),
      sketch: sketchAt(depsLine),
      hint: `run \`archlock accept ${name}\` if this dependency is intended; otherwise remove the import`,
    });
  }
  if (hasCode) {
    for (const dep of mod.dependsOn) {
      if (code.deps.has(dep) || broken.has(dep)) continue;
      add({
        rule: "unused_dependency",
        module: name,
        message: `declares a dependency on ${dep} but never imports it`,
        sketch: sketchAt(depsLine),
        hint: `remove "${dep}" from __depends_on__, or run \`archlock accept ${name}\``,
      });
    }
  }
  if (mod.external !== null) {
    const allowed = new Set(mod.external);
    const extLine = mod.headerLines?.__external__ ?? depsLine;
    for (const [pkg, sites] of [...code.externals.entries()].sort(([a], [b]) =>
      compareNames(a, b),
    )) {
      if (allowed.has(pkg)) continue;
      add({
        rule: "undeclared_external",
        module: name,
        message: `uses external package ${pkg} (not in __external__)`,
        code: siteLoc(sites[0] as ImportSite),
        sketch: sketchAt(extLine),
        hint: `add "${pkg}" to __external__ if it is allowed, or run \`archlock accept ${name}\``,
      });
    }
  }

  if (mod.strictness === "deps") return;
  compareSymbols(sketch, code, add);
}

function compareSymbols(
  sketch: LoadedSketch,
  code: CodeModule,
  add: (v: Omit<Violation, "severity">) => void,
): void {
  const mod = sketch.module;
  const name = mod.name;
  const namesOnly = mod.strictness === "names";
  const byName = (list: ArchSymbol[]) => {
    const map = new Map<string, ArchSymbol[]>();
    for (const s of list) map.set(s.name, [...(map.get(s.name) ?? []), s]);
    return map;
  };
  const sketchSyms = byName(mod.symbols);
  const codeSyms = byName(code.symbols);
  const allNames = [...new Set([...sketchSyms.keys(), ...codeSyms.keys()])].sort(compareNames);
  const accept = `run \`archlock accept ${name}\` to keep the code's version, or \`archlock push\` to make the code match the sketch`;

  for (const symName of allNames) {
    const s = [...(sketchSyms.get(symName) ?? [])];
    const c = [...(codeSyms.get(symName) ?? [])];
    // Pair symbols of the same kind first.
    for (const sk of [...s]) {
      const idx = c.findIndex((x) => x.kind === sk.kind);
      if (idx === -1) continue;
      const cd = c.splice(idx, 1)[0] as ArchSymbol;
      s.splice(s.indexOf(sk), 1);
      if (namesOnly) continue;
      const details = diffSymbol(sk, cd);
      if (details.length > 0) {
        add({
          rule: "signature_changed",
          module: name,
          symbol: symName,
          message: `${kindLabel(sk)} ${symName} differs from the sketch`,
          details,
          code: cd.loc,
          sketch: sk.loc,
          hint: accept,
        });
      }
    }
    // Same name, different kind.
    while (s.length > 0 && c.length > 0) {
      const sk = s.shift() as ArchSymbol;
      const cd = c.shift() as ArchSymbol;
      add({
        rule: "kind_changed",
        module: name,
        symbol: symName,
        message: `${symName} is a ${kindLabel(sk)} in the sketch but a ${kindLabel(cd)} in the code`,
        details: [`sketch: ${symbolLines(sk)[0]}`, `code:   ${symbolLines(cd)[0]}`],
        code: cd.loc,
        sketch: sk.loc,
        hint: accept,
      });
    }
    for (const sk of s) {
      add({
        rule: "planned_not_implemented",
        module: name,
        symbol: symName,
        message: `${kindLabel(sk)} ${symName} is in the sketch but not in the code`,
        details: symbolLines(sk).map((l) => `sketch: ${l}`),
        sketch: sk.loc,
        hint:
          code.files.length === 0
            ? `this module has no code yet; implement it, or run \`archlock push\` to let your agent do it`
            : `implement it (it must be exported${code.entry ? ` from ${code.entry}` : ""}), or run \`archlock push\``,
      });
    }
    for (const cd of c) {
      add({
        rule: "public_symbol_added",
        module: name,
        symbol: symName,
        message: `new public ${kindLabel(cd)} ${symName} is not in the sketch`,
        details: symbolLines(cd).map((l) => `code:   ${l}`),
        code: cd.loc,
        hint: `run \`archlock accept ${name}\` if this change is intended, or make it non-public`,
      });
    }
  }
}

function kindLabel(sym: ArchSymbol): string {
  return sym.kind === "type" ? "type alias" : sym.kind === "const" ? "constant" : sym.kind;
}

function sigKey(sig: Signature): string {
  return JSON.stringify([
    sig.typeParams,
    sig.params,
    sig.returns,
    sig.async,
    sig.receiver ?? null,
    sig.decorators ?? [],
  ]);
}

/** Human-readable differences between two symbols of the same kind; empty when equal. */
export function diffSymbol(sketch: ArchSymbol, code: ArchSymbol): string[] {
  switch (sketch.kind) {
    case "function": {
      const c = code as typeof sketch;
      const same =
        sketch.signatures.length === c.signatures.length &&
        sketch.signatures.every((s, i) => sigKey(s) === sigKey(c.signatures[i] as Signature));
      return same ? [] : sketchVsCode(symbolLines(sketch), symbolLines(code));
    }
    case "const":
    case "type": {
      return JSON.stringify(symbolLines(sketch)) === JSON.stringify(symbolLines(code))
        ? []
        : sketchVsCode(symbolLines(sketch), symbolLines(code));
    }
    case "enum":
      return diffEnum(sketch, code as EnumSymbol);
    case "class":
    case "interface":
      return diffClass(sketch, code as ClassLikeSymbol);
  }
}

function sketchVsCode(sketch: string[], code: string[]): string[] {
  return [...sketch.map((l) => `sketch: ${l}`), ...code.map((l) => `code:   ${l}`)];
}

function diffEnum(sketch: EnumSymbol, code: EnumSymbol): string[] {
  const out: string[] = [];
  if (sketch.bases.join() !== code.bases.join())
    out.push(...sketchVsCode(symbolLines(sketch), symbolLines(code)));
  const s = sketch.members.map((m) => m.name);
  const c = code.members.map((m) => m.name);
  // A member without payload or value is named alone, without the `= ...` placeholder.
  const label = (m: EnumSymbol["members"][number]) =>
    m.payload === undefined && m.value === undefined ? m.name : enumMemberLine(m);
  for (const m of code.members) {
    if (!s.includes(m.name)) out.push(`+ ${label(m)} (in code, not in sketch)`);
  }
  for (const m of sketch.members) {
    if (!c.includes(m.name)) out.push(`- ${label(m)} (in sketch, not in code)`);
  }
  for (const m of sketch.members) {
    const other = code.members.find((x) => x.name === m.name);
    if (!other) continue;
    // `Name = ...` in a sketch leaves the value open; a value it gives must match.
    const valueDiffers = m.value !== undefined && m.value !== other.value;
    if (other.payload !== m.payload || valueDiffers) {
      out.push(`~ sketch: ${enumMemberLine(m)} · code: ${enumMemberLine(other)}`);
    }
  }
  out.push(...diffMembers(sketch.methods ?? [], code.methods ?? []));
  if (out.length === 0 && s.join() !== c.join())
    out.push(`member order: sketch (${s.join(", ")}) · code (${c.join(", ")})`);
  return out;
}

function memberKey(m: Member): string {
  return `${m.kind}:${m.name}`;
}

function diffClass(sketch: ClassLikeSymbol, code: ClassLikeSymbol): string[] {
  const out: string[] = [];
  const header = (s: ClassLikeSymbol) =>
    JSON.stringify([s.typeParams, s.bases, [...s.decorators].sort()]);
  if (header(sketch) !== header(code)) {
    out.push(...sketchVsCode(symbolLines(sketch), symbolLines(code)));
    if (sketch.decorators.join() !== code.decorators.join()) {
      out.push(
        `decorators: sketch (${sketch.decorators.map((d) => `@${d}`).join(", ") || "none"}) · code (${code.decorators.map((d) => `@${d}`).join(", ") || "none"})`,
      );
    }
  }
  out.push(...diffMembers(sketch.members, code.members));
  // Dataclasses and records: the field order is the constructor's parameter order.
  if (code.positional && hasPositionalFields(sketch)) {
    const co = code.members
      .filter((m) => m.kind === "field")
      .slice(0, code.positional)
      .map((m) => m.name);
    const so = sketch.members
      .filter((m) => m.kind === "field" && co.includes(m.name))
      .map((m) => m.name);
    if (so.join() !== co.filter((n) => so.includes(n)).join())
      out.push(`field order: sketch (${so.join(", ")}) · code (${co.join(", ")})`);
  }
  return out;
}

function diffMembers(sketch: Member[], code: Member[]): string[] {
  const out: string[] = [];
  const s = new Map(sketch.map((m) => [memberKey(m), m]));
  const c = new Map(code.map((m) => [memberKey(m), m]));
  const keys = [...new Set([...s.keys(), ...c.keys()])].sort(compareNames);
  for (const key of keys) {
    const sm = s.get(key);
    const cm = c.get(key);
    if (sm && !cm) out.push(...memberLines(sm).map((l) => `- ${l}  (in sketch, not in code)`));
    else if (cm && !sm) out.push(...memberLines(cm).map((l) => `+ ${l}  (in code, not in sketch)`));
    else if (sm && cm) {
      const sl = memberLines(sm);
      const cl = memberLines(cm);
      if (JSON.stringify(sl) !== JSON.stringify(cl)) {
        out.push(...sl.map((l) => `~ sketch: ${l}`), ...cl.map((l) => `  code:   ${l}`));
      }
    }
  }
  return out;
}

/** Cycles as strongly connected components (Tarjan) of more than one module, sorted. */
export function findCycles(graph: Map<string, string[]>): string[][] {
  let index = 0;
  const idx = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const sccs: string[][] = [];
  const strong = (v: string) => {
    idx.set(v, index);
    low.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);
    for (const w of graph.get(v) ?? []) {
      if (!idx.has(w)) {
        strong(w);
        low.set(v, Math.min(low.get(v) as number, low.get(w) as number));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v) as number, idx.get(w) as number));
      }
    }
    if (low.get(v) === idx.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop() as string;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      if (scc.length > 1) sccs.push(scc);
    }
  };
  for (const v of [...graph.keys()].sort(compareNames)) if (!idx.has(v)) strong(v);
  return sccs.map((scc) => orderCycle(scc, graph)).sort((a, b) => compareNames(a.join(), b.join()));
}

/** Orders an SCC as a walk starting at its smallest member (best effort, deterministic). */
function orderCycle(scc: string[], graph: Map<string, string[]>): string[] {
  const members = new Set(scc);
  const start = [...scc].sort(compareNames)[0] as string;
  const path = [start];
  const seen = new Set([start]);
  let cur = start;
  for (;;) {
    const next = (graph.get(cur) ?? []).find((n) => members.has(n) && !seen.has(n));
    if (!next) break;
    path.push(next);
    seen.add(next);
    cur = next;
  }
  for (const m of [...scc].sort(compareNames)) if (!seen.has(m)) path.push(m);
  return path;
}
