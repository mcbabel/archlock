/**
 * Opt-in abbreviation of long types (`maxTypeLength`).
 *
 * A type over the limit becomes `<head … (N chars, #sha256-prefix)>`, e.g.
 * `<"A-IM" | "Accept" … (4664 chars, #3f9a1c2e)>`. Code and sketches go through the same
 * function, so the placeholder compares equal exactly when the full type is unchanged.
 */

import { createHash } from "node:crypto";
import type { ArchSymbol, Member, Signature } from "./model.js";
import { COMPLEX, INFERRED } from "./model.js";

/** Smallest accepted `maxTypeLength`: the placeholder itself needs about 30 characters. */
export const MIN_TYPE_LENGTH = 40;

const PLACEHOLDER = /^<.* … \(\d+ chars, #[0-9a-f]{8}\)>$/s;

export function isAbbreviatedType(type: string): boolean {
  return PLACEHOLDER.test(type);
}

export function abbreviateType(type: string, max: number): string {
  if (type.length <= max || type === INFERRED || type === COMPLEX || isAbbreviatedType(type)) {
    return type;
  }
  const hash = createHash("sha256").update(type).digest("hex").slice(0, 8);
  const keep = Math.min(60, max - 30);
  let head = type.slice(0, keep);
  // Cut at a space so the visible part does not end in the middle of a name.
  const space = head.lastIndexOf(" ");
  if (space > keep / 2) head = head.slice(0, space);
  return `<${head.trimEnd()} … (${type.length} chars, #${hash})>`;
}

function signature(sig: Signature, max: number): Signature {
  return {
    ...sig,
    params: sig.params.map((p) =>
      p.type === null ? p : { ...p, type: abbreviateType(p.type, max) },
    ),
    returns: sig.returns === null ? null : abbreviateType(sig.returns, max),
  };
}

function member(m: Member, max: number): Member {
  return m.kind === "field"
    ? { ...m, type: abbreviateType(m.type, max) }
    : { ...m, signatures: m.signatures.map((s) => signature(s, max)) };
}

/**
 * Returns copies of `symbols` with long types abbreviated: alias and constant types,
 * parameter, return and field types. Names, type parameters and bases stay as they are.
 */
export function abbreviateSymbols(symbols: ArchSymbol[], max: number | null): ArchSymbol[] {
  if (max === null) return symbols;
  return symbols.map((s): ArchSymbol => {
    switch (s.kind) {
      case "type":
      case "const":
        return { ...s, type: abbreviateType(s.type, max) };
      case "function":
        return { ...s, signatures: s.signatures.map((sig) => signature(sig, max)) };
      case "class":
      case "interface":
        return { ...s, members: s.members.map((m) => member(m, max)) };
      default:
        return s;
    }
  });
}
