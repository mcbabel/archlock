/**
 * `archlock accept`: merges the code model into an existing sketch.
 *
 * Dependencies, symbols and signatures come from the code. Human-written content is kept:
 * docstrings, comments, `__strictness__`, `__paths__`, `__entry__` and whether `__external__`
 * is checked. Comments follow symbols by kind + name. A symbol (or class member) that was
 * renamed and is otherwise unchanged keeps its comments when exactly one removed and one added
 * symbol have the same shape; the comments of other removed symbols are `lost`.
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
  /**
   * A symbol's or member's text without its name and comments; equal shapes mark a rename.
   * Without it, comments follow names only.
   */
  shape?: Shapes;
}

export interface Shapes {
  symbol(s: ArchSymbol): string;
  member(m: Member): string;
}

/** Comments that followed a renamed symbol or member. */
export interface MovedComment {
  module: string;
  from: string;
  to: string;
}

export interface MergeResult {
  module: ArchModule;
  lost: LostComment[];
  moved: MovedComment[];
}

/**
 * Pairs each unmatched new item with the one unmatched old item of the same shape, when that
 * shape occurs exactly once on each side; ambiguous shapes stay unpaired.
 */
function renamed<T>(
  added: T[],
  removed: T[],
  shape: (x: T) => string,
  oldShape: (x: T) => string = shape,
): Map<T, T> {
  const count = (xs: T[], key: (x: T) => string) => {
    const m = new Map<string, T[]>();
    for (const x of xs) m.set(key(x), [...(m.get(key(x)) ?? []), x]);
    return m;
  };
  const a = count(added, shape);
  const r = count(removed, oldShape);
  const out = new Map<T, T>();
  for (const [key, xs] of a) {
    const ys = r.get(key);
    if (xs.length === 1 && ys?.length === 1) out.set(xs[0] as T, ys[0] as T);
  }
  return out;
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
  const moved: MovedComment[] = [];
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
    return { module: structuredClone(out), lost, moved };

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
  const shape = options.shape;
  if (shape) {
    // Renaming `Invoice` to `Bill` also changes `def create() -> Invoice`: each round applies
    // the renames found so far to the old shapes, until no new pair is found.
    const names = new Map<string, string>();
    for (;;) {
      const added = pairs.filter((p) => !p[1]).map((p) => p[0]);
      const removed = unmatched.filter((s) => hasAnySoft(s));
      const found = renamed(
        added,
        removed,
        (s) => `${s.kind}\0${shape.symbol(s)}`,
        (s) => `${s.kind}\0${renameWords(shape.symbol(s), names)}`,
      );
      if (found.size === 0) break;
      for (const [c, s] of found) {
        const pair = pairs.find((p) => p[0] === c) as [ArchSymbol, ArchSymbol | undefined];
        pair[1] = take((x) => x === s);
        names.set(s.name, c.name);
        moved.push({ module: sketch.name, from: s.name, to: c.name });
      }
    }
  }

  out.symbols = pairs.map(([c, s]) => {
    const merged = structuredClone(c);
    if (s) mergeSymbolSoft(merged, s, sketch.name, lost, moved, shape);
    return merged;
  });
  for (const s of unmatched) collectLost(s, sketch.name, lost);
  lost.sort((a, b) => compareNames(a.symbol, b.symbol));
  moved.sort((a, b) => compareNames(a.from, b.from));
  return { module: structuredClone(out), lost, moved };
}

/** `text` with each whole-word old name replaced by its new name. */
function renameWords(text: string, names: Map<string, string>): string {
  if (names.size === 0) return text;
  return text.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (w) => names.get(w) ?? w);
}

/** Whether a symbol or any of its members carries comments. */
function hasAnySoft(s: ArchSymbol): boolean {
  if (hasSoft(s.soft)) return true;
  if (s.kind === "enum") return s.members.some((m) => hasSoft(m.soft));
  if (s.kind === "class" || s.kind === "interface") return s.members.some((m) => hasSoft(m.soft));
  return false;
}

function mergeSymbolSoft(
  target: ArchSymbol,
  source: ArchSymbol,
  module: string,
  lost: LostComment[],
  moved: MovedComment[],
  shape: Shapes | undefined,
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
    const oldMethods = source.kind === "enum" ? (source.methods ?? []) : [];
    for (const m of target.methods ?? []) {
      const prev = oldMethods.find((o) => o.name === m.name);
      if (prev) m.soft = cloneSoft(prev.soft);
    }
    for (const o of oldMethods) {
      if (!(target.methods ?? []).some((m) => m.name === o.name) && hasSoft(o.soft)) {
        lost.push({ module, symbol: `${source.name}.${o.name}`, lines: softLines(o.soft) });
      }
    }
    return;
  }
  if (target.kind === "class" || target.kind === "interface") {
    const old: Member[] =
      source.kind === "class" || source.kind === "interface" ? source.members : [];
    const unmatched = [...old];
    const fresh: Member[] = [];
    for (const m of target.members) {
      let i = unmatched.findIndex((o) => o.kind === m.kind && o.name === m.name);
      if (i === -1) i = unmatched.findIndex((o) => o.name === m.name);
      if (i === -1) {
        fresh.push(m);
        continue;
      }
      const prev = unmatched.splice(i, 1)[0] as Member;
      m.soft = cloneSoft(prev.soft);
    }
    if (shape) {
      const removed = unmatched.filter((o) => hasSoft(o.soft));
      const byShape = (m: Member) => `${m.kind}\0${shape.member(m)}`;
      for (const [m, prev] of renamed(fresh, removed, byShape)) {
        m.soft = cloneSoft(prev.soft);
        unmatched.splice(unmatched.indexOf(prev), 1);
        moved.push({ module, from: `${source.name}.${prev.name}`, to: `${target.name}.${m.name}` });
      }
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
