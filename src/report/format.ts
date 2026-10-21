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

/**
 * Whether a compression ratio is worth showing: the project has at least
 * MIN_RATIO_CODE_LINES lines of code and its sketches are shorter than the code.
 */
export function ratioIsMeaningful(codeLines: number, sketchLines: number): boolean {
  return codeLines >= MIN_RATIO_CODE_LINES && sketchLines > 0 && codeLines >= sketchLines;
}

/**
 * "48,213 lines of code → 912 lines of architecture (53×)", or, when the ratio would not
 * mean much, the code size with a short neutral note instead of the ratio.
 */
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

/** Static shields.io badge (the image is rendered by shields.io when someone views it). */
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
