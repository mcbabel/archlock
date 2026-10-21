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

/** "48,213 lines of code → 912 lines of architecture (53×)" */
export function compressionLine(codeLines: number, sketchLines: number): string {
  return `${formatNumber(codeLines)} lines of code → ${formatNumber(sketchLines)} lines of architecture (${formatRatio(codeLines, sketchLines)})`;
}

/** Static shields.io badge (the image is rendered by shields.io when someone views it). */
export function badgeMarkdown(
  modules: number,
  codeLines: number,
  sketchLines: number,
  link: string,
): string {
  const esc = (s: string) => encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__"));
  const message = `${modules} modules · ${formatRatio(codeLines, sketchLines)}`;
  return `[![architecture: ${message}](https://img.shields.io/badge/${esc("architecture")}-${esc(message)}-4c1)](${link})`;
}
