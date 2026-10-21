import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Language, Parser } from "web-tree-sitter";

let pythonParser: Promise<Parser> | null = null;

/**
 * Finds the Python grammar. The published package ships it in `dist/wasm/`; in development
 * it comes from the `tree-sitter-python` dev dependency.
 */
function pythonWasmPath(): string {
  const candidates = [
    new URL("./wasm/tree-sitter-python.wasm", import.meta.url),
    new URL("../wasm/tree-sitter-python.wasm", import.meta.url),
  ];
  for (const url of candidates) {
    const path = fileURLToPath(url);
    if (existsSync(path)) return path;
  }
  try {
    const require = createRequire(import.meta.url);
    return require.resolve("tree-sitter-python/tree-sitter-python.wasm");
  } catch {
    throw new Error(
      "archlock: could not find tree-sitter-python.wasm. Reinstall archlock; if you are " +
        "developing archlock itself, run `pnpm install`.",
    );
  }
}

/** Returns a shared tree-sitter parser for Python (sketches and Python sources). */
export function getPythonParser(): Promise<Parser> {
  if (!pythonParser) {
    pythonParser = (async () => {
      await Parser.init();
      const language = await Language.load(readFileSync(pythonWasmPath()));
      const parser = new Parser();
      parser.setLanguage(language);
      return parser;
    })();
  }
  return pythonParser;
}
