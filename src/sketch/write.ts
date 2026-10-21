import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Writes a text file with LF line endings, creating parent directories. */
export function writeText(root: string, relPath: string, text: string): void {
  const abs = join(root, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, text.replace(/\r\n/g, "\n"), "utf8");
}
