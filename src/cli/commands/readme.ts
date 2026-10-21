import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ArchModule } from "../../core/model.js";
import { sketchLineCount } from "../../engine/stats.js";
import { renderReadme } from "../../report/readme.js";
import { writeText } from "../../sketch/write.js";

/** Regenerates `<sketchDir>/README.md` from the sketches (used by `init` and `accept`). */
export function writeSketchReadme(
  root: string,
  sketchDir: string,
  modules: ArchModule[],
  sketchTexts: string[],
  codeLines: number,
): { file: string; changed: boolean } {
  const file = `${sketchDir.replace(/\/+$/, "")}/README.md`;
  const text = renderReadme(modules, codeLines, sketchLineCount(sketchTexts));
  const abs = join(root, file);
  if (existsSync(abs) && readFileSync(abs, "utf8") === text) return { file, changed: false };
  writeText(root, file, text);
  return { file, changed: true };
}
