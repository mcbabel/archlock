import {
  type ArchModule,
  type ArchSymbol,
  compareNames,
  INFERRED,
  type Signature,
} from "../core/model.js";
import { countLines } from "../fs/files.js";
import { findCycles } from "./compare.js";

export function compressionRatio(codeLines: number, sketchLines: number): number {
  return sketchLines === 0 ? 0 : codeLines / sketchLines;
}

export function sketchLineCount(texts: string[]): number {
  return texts.reduce((n, t) => n + countLines(t), 0);
}

export interface ArchStats {
  modules: number;
  symbols: number;
  edges: number;
  codeLines: number;
  sketchLines: number;
  ratio: number;
  /** Type positions (parameters, returns, fields, constants, aliases) in the sketches. */
  typePositions: number;
  inferred: number;
  cycles: string[][];
}

function countTypes(sym: ArchSymbol, acc: { total: number; inferred: number }): void {
  const add = (t: string | null) => {
    if (t === null) return;
    acc.total++;
    if (t === INFERRED) acc.inferred++;
  };
  const sig = (s: Signature) => {
    for (const p of s.params) if (p.kind !== "star" && p.kind !== "slash") add(p.type ?? INFERRED);
    add(s.returns);
  };
  switch (sym.kind) {
    case "function":
      sym.signatures.forEach(sig);
      break;
    case "const":
    case "type":
      add(sym.type);
      break;
    case "class":
    case "interface":
      for (const m of sym.members) {
        if (m.kind === "field") add(m.type);
        else m.signatures.forEach(sig);
      }
      break;
    case "enum":
      break;
  }
}

export function computeStats(
  modules: ArchModule[],
  sketchTexts: string[],
  codeLines: number,
): ArchStats {
  const acc = { total: 0, inferred: 0 };
  for (const m of modules) for (const s of m.symbols) countTypes(s, acc);
  const graph = new Map(modules.map((m) => [m.name, [...m.dependsOn].sort(compareNames)]));
  const sketchLines = sketchLineCount(sketchTexts);
  return {
    modules: modules.length,
    symbols: modules.reduce((n, m) => n + m.symbols.length, 0),
    edges: modules.reduce((n, m) => n + m.dependsOn.length, 0),
    codeLines,
    sketchLines,
    ratio: compressionRatio(codeLines, sketchLines),
    typePositions: acc.total,
    inferred: acc.inferred,
    cycles: findCycles(graph),
  };
}
