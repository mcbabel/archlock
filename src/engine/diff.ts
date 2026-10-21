/**
 * Architecture diff between two code states (base and head), independent of the sketches:
 * changes show up even when nobody ran `accept`.
 */

import { renderType } from "../core/canonical.js";
import {
  type ArchModule,
  type ArchSymbol,
  compareNames,
  type Member,
  type Signature,
} from "../core/model.js";
import { defLine, memberLines, renderParam, symbolLines } from "../sketch/render.js";
import { diffSymbol } from "./compare.js";

export type ChangeKind =
  | "module_added"
  | "module_removed"
  | "dependency_added"
  | "dependency_removed"
  | "external_added"
  | "external_removed"
  | "symbol_added"
  | "symbol_removed"
  | "symbol_changed";

export interface ArchChange {
  kind: ChangeKind;
  /** `+` added, `-` removed, `~` changed, `!` needs attention (undeclared dependency). */
  marker: "+" | "-" | "~" | "!";
  module: string;
  symbol?: string;
  summary: string;
}

export interface ArchState {
  modules: ArchModule[];
  /** Module → external packages used by its code. */
  externals: Map<string, string[]>;
}

/**
 * @param declared head sketches' `__depends_on__` per module, to flag undeclared dependencies
 */
export function diffArchitecture(
  base: ArchState,
  head: ArchState,
  declared: Map<string, string[]>,
): ArchChange[] {
  const changes: ArchChange[] = [];
  const baseMods = new Map(base.modules.map((m) => [m.name, m]));
  const headMods = new Map(head.modules.map((m) => [m.name, m]));
  const names = [...new Set([...baseMods.keys(), ...headMods.keys()])].sort(compareNames);

  for (const name of names) {
    const b = baseMods.get(name);
    const h = headMods.get(name);
    if (!b && h) {
      const deps = h.dependsOn.length > 0 ? `; depends on ${h.dependsOn.join(", ")}` : "";
      changes.push({
        kind: "module_added",
        marker: "+",
        module: name,
        summary: `new module (${h.symbols.length} public symbol${h.symbols.length === 1 ? "" : "s"}${deps})`,
      });
      for (const dep of h.dependsOn) {
        if (!(declared.get(name)?.includes(dep) ?? false))
          changes.push(depChange(name, dep, "added", declared));
      }
      continue;
    }
    if (b && !h) {
      changes.push({
        kind: "module_removed",
        marker: "-",
        module: name,
        summary: "module removed",
      });
      continue;
    }
    if (!b || !h) continue;

    for (const dep of h.dependsOn)
      if (!b.dependsOn.includes(dep)) changes.push(depChange(name, dep, "added", declared));
    for (const dep of b.dependsOn)
      if (!h.dependsOn.includes(dep)) changes.push(depChange(name, dep, "removed", declared));

    const be = base.externals.get(name) ?? [];
    const he = head.externals.get(name) ?? [];
    for (const pkg of he) {
      if (!be.includes(pkg)) {
        changes.push({
          kind: "external_added",
          marker: "+",
          module: name,
          summary: `new external package: ${pkg}`,
        });
      }
    }
    for (const pkg of be) {
      if (!he.includes(pkg)) {
        changes.push({
          kind: "external_removed",
          marker: "-",
          module: name,
          summary: `no longer uses external package: ${pkg}`,
        });
      }
    }

    changes.push(...diffSymbols(name, b.symbols, h.symbols));
  }
  return changes;
}

function depChange(
  module: string,
  dep: string,
  how: "added" | "removed",
  declared: Map<string, string[]>,
): ArchChange {
  if (how === "removed") {
    return {
      kind: "dependency_removed",
      marker: "-",
      module,
      summary: `no longer depends on ${dep}`,
    };
  }
  const ok = declared.get(module)?.includes(dep) ?? false;
  return {
    kind: "dependency_added",
    marker: ok ? "+" : "!",
    module,
    summary: `new dependency: ${dep}${ok ? "" : " (not in __depends_on__)"}`,
  };
}

function diffSymbols(module: string, base: ArchSymbol[], head: ArchSymbol[]): ArchChange[] {
  const out: ArchChange[] = [];
  const remaining = [...base];
  const sorted = [...head].sort((a, b) => compareNames(a.name, b.name));
  for (const h of sorted) {
    let i = remaining.findIndex((b) => b.name === h.name && b.kind === h.kind);
    if (i === -1) i = remaining.findIndex((b) => b.name === h.name);
    if (i === -1) {
      out.push({
        kind: "symbol_added",
        marker: "+",
        module,
        symbol: h.name,
        summary: symbolLines(h)[0] ?? h.name,
      });
      continue;
    }
    const b = remaining.splice(i, 1)[0] as ArchSymbol;
    const summary = changeSummary(b, h);
    if (summary !== null)
      out.push({ kind: "symbol_changed", marker: "~", module, symbol: h.name, summary });
  }
  for (const b of remaining.sort((x, y) => compareNames(x.name, y.name))) {
    out.push({
      kind: "symbol_removed",
      marker: "-",
      module,
      symbol: b.name,
      summary: `removed (${symbolLines(b)[0]})`,
    });
  }
  return out;
}

function params(sig: Signature): string {
  return `(${sig.params.map(renderParam).join(", ")})`;
}

/**
 * `(id, payment) → (id, payment, at: Date)`: parameters that exist unchanged on both sides are
 * shown by name only, new or changed ones with their type.
 */
function compactParams(x: Signature, y: Signature): string {
  const key = (p: Signature["params"][number]) => renderParam(p);
  const before = new Map(x.params.map((p) => [p.name, key(p)]));
  const after = new Map(y.params.map((p) => [p.name, key(p)]));
  const show = (sig: Signature, other: Map<string, string>) =>
    `(${sig.params
      .map((p) =>
        p.name !== "" && other.get(p.name) === key(p)
          ? `${p.kind === "rest" ? "*" : p.kind === "kwrest" ? "**" : ""}${p.name}`
          : key(p),
      )
      .join(", ")})`;
  return `${show(x, after)} → ${show(y, before)}`;
}

function memberKey(m: Member): string {
  return `${m.kind}:${m.name}`;
}

/** A compact one-line description of how a symbol changed; null when it did not. */
export function changeSummary(b: ArchSymbol, h: ArchSymbol): string | null {
  if (b.kind !== h.kind) return `${b.kind} → ${h.kind}`;
  if (diffSymbol(b, h).length === 0) return null;
  switch (h.kind) {
    case "function": {
      const bs = (b as typeof h).signatures;
      const hs = h.signatures;
      if (bs.length === 1 && hs.length === 1) {
        const [x, y] = [bs[0] as Signature, hs[0] as Signature];
        const sameParams = params(x) === params(y) && x.typeParams.join() === y.typeParams.join();
        const sameRet = x.returns === y.returns && x.async === y.async;
        if (!sameParams && sameRet && x.typeParams.join() === y.typeParams.join()) {
          return compactParams(x, y);
        }
        if (sameParams && !sameRet) {
          const r = (s: Signature) =>
            `${s.async ? "async " : ""}-> ${s.returns === null ? "None" : renderType(s.returns)}`;
          return `${r(x)} → ${r(y)}`;
        }
        return `${defLine(h.name, x)} → ${defLine(h.name, y)}`;
      }
      return `${bs.length} → ${hs.length} overloads`;
    }
    case "const":
    case "type": {
      const bt = (b as typeof h).type;
      return `${renderType(bt)} → ${renderType(h.type)}`;
    }
    case "enum": {
      const bm = (b as typeof h).members.map((m) => m.name);
      const hm = h.members.map((m) => m.name);
      const parts = [
        ...hm.filter((m) => !bm.includes(m)).map((m) => `+ ${m}`),
        ...bm.filter((m) => !hm.includes(m)).map((m) => `- ${m}`),
      ];
      return parts.length > 0 ? parts.join(", ") : "member order changed";
    }
    case "class":
    case "interface": {
      const bc = b as typeof h;
      const parts: string[] = [];
      if (bc.bases.join() !== h.bases.join())
        parts.push(`bases (${bc.bases.join(", ")}) → (${h.bases.join(", ")})`);
      if (bc.typeParams.join() !== h.typeParams.join()) parts.push("type parameters");
      const bm = new Map(bc.members.map((m) => [memberKey(m), m]));
      const hm = new Map(h.members.map((m) => [memberKey(m), m]));
      const label = (m: Member) => (m.kind === "method" ? `${m.name}()` : m.name);
      for (const [k, m] of hm) if (!bm.has(k)) parts.push(`+ ${label(m)}`);
      for (const [k, m] of bm) if (!hm.has(k)) parts.push(`- ${label(m)}`);
      for (const [k, m] of hm) {
        const old = bm.get(k);
        if (old && memberLines(old).join() !== memberLines(m).join()) parts.push(`~ ${label(m)}`);
      }
      return parts.length > 0 ? parts.join(", ") : "decorators changed";
    }
  }
}
