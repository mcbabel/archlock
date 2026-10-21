import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ArchModule } from "../core/model.js";
import { type ArchlockCache, hashText } from "../fs/cache.js";
import { type ParseResult, parseSketch, type SketchError } from "./parse.js";

export const SKETCH_SUFFIX = ".arch.py";

export interface LoadedSketch {
  /** Repo-relative POSIX path. */
  file: string;
  text: string;
  module: ArchModule;
}

export interface SketchSet {
  sketches: LoadedSketch[];
  errors: SketchError[];
  /** True when the sketch directory does not exist. */
  missing: boolean;
  /** Module names (from file names) whose sketches could not be parsed. */
  broken: string[];
}

export function sketchPath(sketchDir: string, module: string): string {
  return `${sketchDir.replace(/\/+$/, "")}/${module}${SKETCH_SUFFIX}`;
}

/** Loads and validates all sketches in `sketchDir` (repo-relative). */
export async function loadSketches(
  root: string,
  sketchDir: string,
  cache?: ArchlockCache,
): Promise<SketchSet> {
  const abs = join(root, sketchDir);
  if (!existsSync(abs)) return { sketches: [], errors: [], missing: true, broken: [] };
  const names = readdirSync(abs)
    .filter((f) => f.endsWith(SKETCH_SUFFIX))
    .sort();
  const sketches: LoadedSketch[] = [];
  const errors: SketchError[] = [];
  const broken: string[] = [];
  for (const name of names) {
    const file = sketchPath(sketchDir, name.slice(0, -SKETCH_SUFFIX.length));
    const text = readFileSync(join(abs, name), "utf8");
    const hash = hashText(text);
    let result = cache?.get<ParseResult>("sketches", file, hash) ?? null;
    if (!result) {
      result = await parseSketch(text, file);
      cache?.set("sketches", file, hash, result);
    }
    errors.push(...result.errors);
    if (!result.module) {
      broken.push(name.slice(0, -SKETCH_SUFFIX.length));
      continue;
    }
    const expected = name.slice(0, -SKETCH_SUFFIX.length);
    if (result.module.name !== expected) {
      errors.push({
        file,
        line: result.module.headerLines?.__module__ ?? 1,
        column: 1,
        message: `__module__ is "${result.module.name}" but the file is named ${name}; rename the file to ${result.module.name}${SKETCH_SUFFIX} or fix __module__`,
      });
      continue;
    }
    sketches.push({ file, text, module: result.module });
  }

  // Broken sketches still count as known modules, so one syntax error does not cascade.
  const known = new Set([...sketches.map((s) => s.module.name), ...broken]);
  for (const s of sketches) {
    const line = s.module.headerLines?.__depends_on__ ?? 1;
    for (const dep of s.module.dependsOn) {
      if (dep === s.module.name) {
        errors.push({
          file: s.file,
          line,
          column: 1,
          message: `module "${dep}" lists itself in __depends_on__`,
        });
      } else if (!known.has(dep)) {
        errors.push({
          file: s.file,
          line,
          column: 1,
          message: `__depends_on__ names unknown module "${dep}"; known modules: ${[...known].sort().join(", ") || "(none)"}`,
        });
      }
    }
    if (s.module.paths.length === 0) {
      errors.push({
        file: s.file,
        line: s.module.headerLines?.__paths__ ?? 1,
        column: 1,
        message: '__paths__ is empty; list at least one glob such as "src/<module>/**"',
      });
    }
  }
  return { sketches, errors, missing: false, broken };
}
