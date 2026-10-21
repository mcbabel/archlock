import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
// @ts-expect-error: plain JavaScript script without type declarations
import { checkNumbers } from "../scripts/check-numbers.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const dirs: string[] = [];
afterAll(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
});

const GOOD = "Hono 25,971 → 1,743 (15×)";

function tree(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "archlock-numbers-"));
  dirs.push(dir);
  const base: Record<string, string> = {
    "examples/real-world/numbers.json": JSON.stringify({
      hono: { codeLines: 25971, sketchLines: 1743, modules: 19, symbols: 550 },
    }),
    "package.json": JSON.stringify({ version: "0.1.0" }),
    "README.md": GOOD,
    "site/index.html": GOOD,
    "examples/real-world/README.md": GOOD,
  };
  for (const [file, text] of Object.entries({ ...base, ...files })) {
    mkdirSync(join(dir, file, ".."), { recursive: true });
    writeFileSync(join(dir, file), text);
  }
  return dir;
}

describe("scripts/check-numbers.mjs", () => {
  it("passes on this repository", () => {
    expect(checkNumbers(ROOT)).toEqual([]);
  });

  it("passes when everything agrees", () => {
    expect(checkNumbers(tree({}))).toEqual([]);
  });

  it("catches wrong architecture lines, a wrong ratio and missing numbers", () => {
    const problems: string[] = checkNumbers(
      tree({
        "README.md": "Hono 25,971 → 1,550 (17×)",
        "site/index.html": "Hono 25,971 → 1,743 lines, 17×",
        "examples/real-world/README.md": "nothing here",
      }),
    );
    expect(problems).toEqual([
      "README.md: hono has 25,971 lines of code but not 1,743 lines of architecture next to it",
      "site/index.html: hono should have the ratio 15×",
      "examples/real-world/README.md: the numbers for hono (25,971 → 1,743, 15×) are missing",
    ]);
  });

  it("checks docs and launch texts wherever they mention a project's numbers", () => {
    const problems: string[] = checkNumbers(
      tree({ "launch/x.md": "Hono: 25,971 lines of code → 1,550 lines of architecture (17×)" }),
    );
    expect(problems).toEqual([
      "launch/x.md: hono has 25,971 lines of code but not 1,743 lines of architecture next to it",
    ]);
  });

  it("checks a mentioned version", () => {
    const problems: string[] = checkNumbers(
      tree({ "README.md": `${GOOD}. Install archlock@0.0.9.` }),
    );
    expect(problems).toEqual(["README.md: mentions archlock@0.0.9, package.json says 0.1.0"]);
  });

  it("works without the optional docs/ and launch/ folders", () => {
    // tree() creates neither folder; only README, site and the examples README are checked.
    expect(checkNumbers(tree({}))).toEqual([]);
  });
});
