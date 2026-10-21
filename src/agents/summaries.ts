/**
 * `archlock init --with-summaries`: the agent proposes module docstrings and invariants as
 * `# suggested: …` comments. A deterministic guard keeps only edits that add such lines; any
 * other change to a sketch is rolled back.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { diffLines } from "../report/textdiff.js";
import { writeText } from "../sketch/write.js";

export const SUGGESTION = /^\s*# suggested: /;

export function summariesPrompt(sketchDir: string, files: string[]): string {
  return [
    "# archlock: suggest module summaries and invariants",
    "",
    `The files below in \`${sketchDir}/\` are architecture sketches generated from this repository's code (Python syntax used as notation). Read each module's code and add, to its sketch:`,
    "",
    "1. directly above `__module__`, one line `# suggested: <one-sentence summary of what the module is for>`;",
    "2. above the symbols where it matters, up to three lines `# suggested: invariant: <rule the code relies on>` (for example ordering, uniqueness, idempotency, units).",
    "",
    "Rules: only ADD lines that start with `# suggested: `. Do not change, move or delete any existing line, and do not edit any other file. A human will review every suggestion.",
    "",
    "Sketches:",
    "",
    ...files.map((f) => `- ${f}`),
    "",
  ].join("\n");
}

export interface SummaryOutcome {
  file: string;
  added: number;
  /** The agent changed more than `# suggested:` lines; the file was restored. */
  restored: boolean;
}

/** Keeps sketch edits that only add `# suggested:` lines; restores everything else. */
export function guardSuggestions(root: string, before: Map<string, string>): SummaryOutcome[] {
  const out: SummaryOutcome[] = [];
  for (const [file, original] of before) {
    let current: string;
    try {
      current = readFileSync(join(root, file), "utf8").replace(/\r\n/g, "\n");
    } catch {
      writeText(root, file, original);
      out.push({ file, added: 0, restored: true });
      continue;
    }
    if (current === original) {
      out.push({ file, added: 0, restored: false });
      continue;
    }
    const ops = diffLines(original.split("\n"), current.split("\n"));
    const ok = ops.every((o) => o.op === "=" || (o.op === "+" && SUGGESTION.test(o.line)));
    if (!ok) {
      writeText(root, file, original);
      out.push({ file, added: 0, restored: true });
    } else {
      out.push({ file, added: ops.filter((o) => o.op === "+").length, restored: false });
    }
  }
  return out;
}

export function readAll(root: string, files: string[]): Map<string, string> {
  return new Map(files.map((f) => [f, readFileSync(join(root, f), "utf8")]));
}
