import { describe, expect, it } from "vitest";
import { badgeMarkdown, compressionLine, ratioIsMeaningful } from "../../src/report/format.js";

describe("compression ratio", () => {
  it("is shown for projects of at least 300 lines whose sketches are shorter than the code", () => {
    expect(compressionLine(48213, 912)).toBe(
      "48,213 lines of code → 912 lines of architecture (53×)",
    );
    expect(compressionLine(751, 253)).toBe("751 lines of code → 253 lines of architecture (3.0×)");
    expect(compressionLine(300, 300)).toBe("300 lines of code → 300 lines of architecture (1.0×)");
  });

  it("is replaced by a neutral note for small projects", () => {
    expect(ratioIsMeaningful(120, 40)).toBe(false);
    expect(compressionLine(120, 40)).toBe(
      "120 lines of code (no compression ratio below 300 lines)",
    );
    expect(compressionLine(120, 200)).toBe(
      "120 lines of code (no compression ratio below 300 lines)",
    );
  });

  it("is replaced by a neutral note when the sketches are longer than the code", () => {
    expect(compressionLine(2000, 2400)).toBe(
      "2,000 lines of code (no compression ratio: the public API is most of the code)",
    );
  });

  it("is left out of the badge when it would not mean much", () => {
    expect(badgeMarkdown(13, 8849, 736, "archlock/README.md")).toContain(
      "13%20modules%20%C2%B7%2012%C3%97",
    );
    expect(badgeMarkdown(4, 120, 40, "archlock/README.md")).toBe(
      "[![architecture: 4 modules](https://img.shields.io/badge/architecture-4%20modules-4c1)](archlock/README.md)",
    );
  });
});
