/**
 * Typed extraction (opt-in, `"typed": true`): the TypeScript type checker supplies the types the
 * code does not write down. Files are grouped by their nearest `tsconfig.json` (repositories
 * without one get strict defaults) and each group becomes one program. The extractor asks the
 * checker only where it would otherwise write `<inferred>`.
 *
 * The result depends on the TypeScript version and on the type declarations the project has
 * installed: a type that cannot be resolved (missing `node_modules`) stays `<inferred>` instead
 * of becoming `any`.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";
import { canonicalType } from "../../core/canonical.js";
import { COMPLEX, INFERRED } from "../../core/model.js";

/** Inferred types longer than this become `<complex>`: their exact text is not a contract. */
export const MAX_INFERRED_LENGTH = 200;

export interface TypeInfo {
  sourceFile: ts.SourceFile;
  checker: ts.TypeChecker;
}

const DEFAULT_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  allowJs: true,
  jsx: ts.JsxEmit.Preserve,
};

/** The nearest `tsconfig.json` from `file` up to `root`, or null. */
function nearestConfig(root: string, file: string): string | null {
  for (let dir = dirname(join(root, file)); ; dir = dirname(dir)) {
    const candidate = join(dir, "tsconfig.json");
    if (existsSync(candidate)) return candidate;
    if (dir === root || dirname(dir) === dir) return null;
  }
}

function optionsOf(config: string | null): ts.CompilerOptions {
  if (config === null) return DEFAULT_OPTIONS;
  const read = ts.readConfigFile(config, ts.sys.readFile);
  if (read.error) return DEFAULT_OPTIONS;
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, dirname(config));
  return parsed.options;
}

/**
 * One type checker per `tsconfig.json` for the given repo-relative TypeScript and JavaScript
 * files; the map gives each file's source file in its program.
 */
export function typedPrograms(root: string, files: string[]): Map<string, TypeInfo> {
  const absRoot = resolve(root);
  const groups = new Map<string, string[]>();
  for (const file of files) {
    const key = nearestConfig(absRoot, file) ?? "";
    groups.set(key, [...(groups.get(key) ?? []), file]);
  }
  const out = new Map<string, TypeInfo>();
  for (const [config, group] of [...groups].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const options: ts.CompilerOptions = {
      ...optionsOf(config === "" ? null : config),
      allowJs: true,
      noEmit: true,
      skipLibCheck: true,
    };
    const program = ts.createProgram(
      group.map((f) => join(absRoot, f)),
      options,
    );
    const checker = program.getTypeChecker();
    for (const file of group) {
      const sourceFile = program.getSourceFile(join(absRoot, file));
      if (sourceFile) out.set(file, { sourceFile, checker });
    }
  }
  return out;
}

/** Whether a type is the checker's stand-in for something it could not resolve. */
function isUnresolved(type: ts.Type): boolean {
  return (type as { intrinsicName?: string }).intrinsicName === "error";
}

/**
 * A type as sketch text: `import("…").Name` qualifiers are dropped (the name is what a person
 * writes), unresolved types stay `<inferred>`, very long ones become `<complex>`.
 */
export function typeText(checker: ts.TypeChecker, type: ts.Type, at: ts.Node): string {
  if (isUnresolved(type)) return INFERRED;
  const text = checker
    .typeToString(
      type,
      at,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
    )
    .replace(/import\("[^"]*"\)\./g, "");
  if (/\bany\b/.test(text) && text !== "any") return INFERRED;
  const canonical = canonicalType(text);
  return canonical.length > MAX_INFERRED_LENGTH ? COMPLEX : canonical;
}
