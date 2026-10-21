import { describe, expect, it } from "vitest";
import { abbreviateType, isAbbreviatedType } from "../../src/core/abbreviate.js";
import { canonicalType } from "../../src/core/canonical.js";

const union = Array.from({ length: 40 }, (_, i) => `"Header-${i}"`).join(" | ");

describe("abbreviateType", () => {
  it("keeps types within the limit and placeholders as they are", () => {
    expect(abbreviateType("Promise[Invoice]", 40)).toBe("Promise[Invoice]");
    expect(abbreviateType("<inferred>", 40)).toBe("<inferred>");
    const once = abbreviateType(union, 40);
    expect(abbreviateType(once, 40)).toBe(once);
  });

  it("abbreviates deterministically: visible start, length and hash", () => {
    const a = abbreviateType(union, 80);
    expect(a).toBe(abbreviateType(union, 80));
    expect(a).toMatch(/^<"Header-0" \| "Header-1" \| .* … \(\d+ chars, #[0-9a-f]{8}\)>$/);
    expect(a).toContain(`(${union.length} chars, #`);
    expect(a.length).toBeLessThanOrEqual(80);
    expect(isAbbreviatedType(a)).toBe(true);
  });

  it("gives different types different placeholders", () => {
    expect(abbreviateType(`${union} | "X"`, 80)).not.toBe(abbreviateType(union, 80));
  });

  it("survives canonicalization unchanged (it is read back from sketches)", () => {
    const a = abbreviateType(union, 80);
    expect(canonicalType(a)).toBe(a);
  });
});
