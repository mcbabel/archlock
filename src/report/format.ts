import type { createColors } from "picocolors";

export type Colors = ReturnType<typeof createColors>;

/** Thousands separators without locale dependence: 48213 → "48,213". */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function plural(n: number, word: string, pluralWord = `${word}s`): string {
  return `${formatNumber(n)} ${n === 1 ? word : pluralWord}`;
}

export function formatRatio(codeLines: number, sketchLines: number): string {
  const r = sketchLines === 0 ? 0 : codeLines / sketchLines;
  return `${r >= 10 ? formatNumber(r) : r.toFixed(1)}×`;
}

/** Below this many lines of code, a compression ratio says more about the project's size. */
export const MIN_RATIO_CODE_LINES = 300;

/** Whether to show a ratio: enough code (MIN_RATIO_CODE_LINES) and sketches shorter than it. */
export function ratioIsMeaningful(codeLines: number, sketchLines: number): boolean {
  return codeLines >= MIN_RATIO_CODE_LINES && sketchLines > 0 && codeLines >= sketchLines;
}

/** "48,213 lines of code → 912 lines of architecture (53×)", or the code size with a note. */
export function compressionLine(codeLines: number, sketchLines: number): string {
  if (ratioIsMeaningful(codeLines, sketchLines)) {
    return `${formatNumber(codeLines)} lines of code → ${formatNumber(sketchLines)} lines of architecture (${formatRatio(codeLines, sketchLines)})`;
  }
  const note =
    codeLines < MIN_RATIO_CODE_LINES
      ? `no compression ratio below ${MIN_RATIO_CODE_LINES} lines`
      : "no compression ratio: the public API is most of the code";
  return `${formatNumber(codeLines)} lines of code (${note})`;
}

/** Markdown for a static shields.io badge (rendered by shields.io when viewed). */
export function badgeMarkdown(
  modules: number,
  codeLines: number,
  sketchLines: number,
  link: string,
): string {
  const esc = (s: string) => encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__"));
  const message = ratioIsMeaningful(codeLines, sketchLines)
    ? `${modules} modules · ${formatRatio(codeLines, sketchLines)}`
    : `${modules} modules`;
  return `[![architecture: ${message}](https://img.shields.io/badge/${esc("architecture")}-${esc(message)}-4c1)](${link})`;
}
