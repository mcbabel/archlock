import type { ArchChange } from "../engine/diff.js";
import { type Colors, formatNumber, plural } from "./format.js";
import { PROJECT_URL } from "./readme.js";

export const STICKY_MARKER = "<!-- archlock:diff -->";

function subject(c: ArchChange): string {
  return c.symbol ? `${c.module}.${c.symbol}` : c.module;
}

function headline(changes: ArchChange[]): string {
  return changes.length === 0
    ? "archlock: no architecture changes"
    : `archlock: ${plural(changes.length, "architecture change")}`;
}

/** "1,284 lines of code changed → 3 lines of architecture" */
export function ratioLine(codeLines: number, changes: number): string {
  return `${formatNumber(codeLines)} line${codeLines === 1 ? "" : "s"} of code changed → ${formatNumber(changes)} line${changes === 1 ? "" : "s"} of architecture`;
}

function lines(changes: ArchChange[], color?: Colors): string[] {
  const width = Math.min(32, Math.max(0, ...changes.map((c) => subject(c).length)));
  return changes.map((c) => {
    const text = `${c.marker} ${subject(c).padEnd(width)}  ${c.summary}`;
    if (!color) return text;
    if (c.marker === "!") return color.yellow(text);
    if (c.marker === "+") return color.green(text);
    if (c.marker === "-") return color.red(text);
    return color.cyan(text);
  });
}

export function renderDiffTerminal(
  changes: ArchChange[],
  codeLines: number,
  base: string,
  c: Colors,
): string {
  const out = [`${c.bold(headline(changes))} ${c.dim(`(compared with ${base})`)}`];
  out.push(...lines(changes, c));
  out.push(c.bold(ratioLine(codeLines, changes.length)));
  return `${out.join("\n")}\n`;
}

/** Markdown for a PR comment (contains the sticky marker so the comment can be updated). */
export function renderDiffMarkdown(changes: ArchChange[], codeLines: number, base: string): string {
  const out = [STICKY_MARKER, `### ${headline(changes)}`, ""];
  if (changes.length > 0) {
    out.push(
      "```diff",
      ...lines(changes).map((l) => (l.startsWith("~") ? `!${l.slice(1)}` : l)),
      "```",
      "",
    );
  }
  out.push(`**${ratioLine(codeLines, changes.length)}**`, "");
  const undeclared = changes.filter((c) => c.marker === "!").length;
  if (undeclared > 0) {
    out.push(
      `> ${plural(undeclared, "dependency is", "dependencies are")} not declared in the sketches. If intended, run \`archlock accept\` and commit the sketches.`,
      "",
    );
  }
  out.push(
    `<sub>Compared with \`${base}\` by [archlock](${PROJECT_URL}), the lockfile for your architecture. Legend: \`+\` added, \`-\` removed, \`!\` changed or needs attention.</sub>`,
  );
  return `${out.join("\n")}\n`;
}
