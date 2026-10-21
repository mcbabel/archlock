/**
 * `archlock accept`: merges the code model into an existing sketch.
 *
 * Dependencies, symbols and signatures come from the code. Human-written content is kept:
 * docstrings, comments, `__strictness__`, `__paths__`, `__entry__` and whether `__external__`
 * is checked. Comments follow symbols by kind + name; those of removed symbols are `lost`.
 */

import {
  type ArchModule,
  type ArchSymbol,
  compareNames,
  type EnumSymbol,
  type Member,
  type Soft,
} from "./model.js";

export interface LostComment {
  module: string;
  /** e.g. `Invoice`, `Invoice.total`, `InvoiceStatus.Draft` */
  symbol: string;
  lines: string[];
}

export interface MergeOptions {
  deps: boolean;
  symbols: boolean;
}

export interface MergeResult {
  module: ArchModule;
  lost: LostComment[];
}

function softLines(soft: Soft): string[] {
  return [
    ...soft.leading,
    ...(soft.docstring !== null ? [soft.docstring] : []),
    ...(soft.trailing !== null ? [soft.trailing] : []),
    ...soft.body,
  ];
}

function hasSoft(soft: Soft): boolean {
  return softLines(soft).length > 0;
}

function cloneSoft(soft: Soft): Soft {
  return {
    leading: [...soft.leading],
    trailing: soft.trailing,
    docstring: soft.docstring,
    body: [...soft.body],
  };
}

/**
 * @param code the sketch as generated from the code (no soft content)
 * @param externals external packages the module's code uses (sorted)
 */
export function mergeModule(
  sketch: ArchModule,
  code: ArchModule,
  externals: string[],
  options: MergeOptions,
): MergeResult {
  const lost: LostComment[] = [];
  const out: ArchModule = {
    name: sketch.name,
    paths: [...sketch.paths],
    entry: sketch.entry,
    dependsOn: options.deps ? [...code.dependsOn] : [...sketch.dependsOn],
    external:
      sketch.external === null ? null : options.deps ? [...externals] : [...sketch.external],
    strictness: sketch.strictness,
    reexports: sketch.reexports,
    symbols: sketch.symbols,
    soft: sketch.soft,
  };

  // With `__strictness__ = "deps"` the symbols are deliberately not part of the contract.
  if (!options.symbols || sketch.strictness === "deps")
    return { module: structuredClone(out), lost };

  out.reexports = code.reexports.map((r) => ({
    ...r,
    leading: [...(sketch.reexports.find((s) => s.from === r.from)?.leading ?? [])],
  }));
  for (const old of sketch.reexports) {
    if (!code.reexports.some((r) => r.from === old.from) && old.leading.length > 0) {
      lost.push({
        module: sketch.name,
        symbol: `from ${old.from} import …`,
        lines: [...old.leading],
      });
    }
  }

  const unmatched = [...sketch.symbols];
  const take = (pred: (s: ArchSymbol) => boolean): ArchSymbol | undefined => {
    const i = unmatched.findIndex(pred);
    return i === -1 ? undefined : unmatched.splice(i, 1)[0];
  };
  const pairs: [ArchSymbol, ArchSymbol | undefined][] = code.symbols.map((c) => [
    c,
    take((s) => s.name === c.name && s.kind === c.kind),
  ]);
  // A symbol whose kind changed keeps its comments too.
  for (const pair of pairs) {
    if (!pair[1]) pair[1] = take((s) => s.name === pair[0].name);
  }

  out.symbols = pairs.map(([c, s]) => {
    const merged = structuredClone(c);
    if (s) mergeSymbolSoft(merged, s, sketch.name, lost);
    return merged;
  });
  for (const s of unmatched) collectLost(s, sketch.name, lost);
  lost.sort((a, b) => compareNames(a.symbol, b.symbol));
  return { module: structuredClone(out), lost };
}

function mergeSymbolSoft(
  target: ArchSymbol,
  source: ArchSymbol,
  module: string,
  lost: LostComment[],
): void {
  target.soft = cloneSoft(source.soft);
  if (target.kind === "enum") {
    const old = source.kind === "enum" ? source.members : [];
    for (const m of target.members) {
      const prev = old.find((o) => o.name === m.name);
      if (prev) m.soft = cloneSoft(prev.soft);
    }
    for (const o of old) {
      if (!target.members.some((m) => m.name === o.name) && hasSoft(o.soft)) {
        lost.push({ module, symbol: `${source.name}.${o.name}`, lines: softLines(o.soft) });
      }
    }
    return;
  }
  if (target.kind === "class" || target.kind === "interface") {
    const old: Member[] =
      source.kind === "class" || source.kind === "interface" ? source.members : [];
    const unmatched = [...old];
    for (const m of target.members) {
      let i = unmatched.findIndex((o) => o.kind === m.kind && o.name === m.name);
      if (i === -1) i = unmatched.findIndex((o) => o.name === m.name);
      if (i === -1) continue;
      const prev = unmatched.splice(i, 1)[0] as Member;
      m.soft = cloneSoft(prev.soft);
    }
    for (const o of unmatched) {
      if (hasSoft(o.soft))
        lost.push({ module, symbol: `${source.name}.${o.name}`, lines: softLines(o.soft) });
    }
    return;
  }
  // Members of an enum/class that became something else lose their member comments.
  if (source.kind === "enum") {
    for (const o of (source as EnumSymbol).members) {
      if (hasSoft(o.soft))
        lost.push({ module, symbol: `${source.name}.${o.name}`, lines: softLines(o.soft) });
    }
  } else if (source.kind === "class" || source.kind === "interface") {
    for (const o of source.members) {
      if (hasSoft(o.soft))
        lost.push({ module, symbol: `${source.name}.${o.name}`, lines: softLines(o.soft) });
    }
  }
}

function collectLost(s: ArchSymbol, module: string, lost: LostComment[]): void {
  const lines = softLines(s.soft);
  if (s.kind === "enum") {
    for (const m of s.members) lines.push(...softLines(m.soft));
  } else if (s.kind === "class" || s.kind === "interface") {
    for (const m of s.members) lines.push(...softLines(m.soft));
  }
  if (lines.length > 0) lost.push({ module, symbol: s.name, lines });
}
