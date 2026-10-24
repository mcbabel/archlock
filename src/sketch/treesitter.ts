import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Language, Parser } from "web-tree-sitter";

/** Grammars shipped in `dist/wasm/`: npm package → WASM file name. */
const GRAMMARS = {
  "tree-sitter-python": "tree-sitter-python.wasm",
  "tree-sitter-go": "tree-sitter-go.wasm",
  "tree-sitter-rust": "tree-sitter-rust.wasm",
  "tree-sitter-java": "tree-sitter-java.wasm",
  "tree-sitter-c-sharp": "tree-sitter-c_sharp.wasm",
} as const;

type Grammar = keyof typeof GRAMMARS;

const parsers = new Map<Grammar, Promise<Parser>>();

/**
 * Finds a grammar. The published package ships it in `dist/wasm/`; in development it comes
 * from the dev dependency of the same name.
 */
function wasmPath(grammar: Grammar): string {
  const file = GRAMMARS[grammar];
  const candidates = [
    new URL(`./wasm/${file}`, import.meta.url),
    new URL(`../wasm/${file}`, import.meta.url),
  ];
  for (const url of candidates) {
    const path = fileURLToPath(url);
    if (existsSync(path)) return path;
  }
  try {
    const require = createRequire(import.meta.url);
    return require.resolve(`${grammar}/${file}`);
  } catch {
    throw new Error(
      `archlock: could not find ${file}. Reinstall archlock; if you are developing archlock ` +
        "itself, run `pnpm install`.",
    );
  }
}

function getParser(grammar: Grammar): Promise<Parser> {
  let parser = parsers.get(grammar);
  if (!parser) {
    parser = (async () => {
      await Parser.init();
      const language = await Language.load(readFileSync(wasmPath(grammar)));
      const p = new Parser();
      p.setLanguage(language);
      return p;
    })();
    parsers.set(grammar, parser);
  }
  return parser;
}

/** Returns a shared tree-sitter parser for Python (sketches and Python sources). */
export function getPythonParser(): Promise<Parser> {
  return getParser("tree-sitter-python");
}

/** Returns a shared tree-sitter parser for Go sources. */
export function getGoParser(): Promise<Parser> {
  return getParser("tree-sitter-go");
}

/** Returns a shared tree-sitter parser for Rust sources. */
export function getRustParser(): Promise<Parser> {
  return getParser("tree-sitter-rust");
}

/** Returns a shared tree-sitter parser for Java sources. */
export function getJavaParser(): Promise<Parser> {
  return getParser("tree-sitter-java");
}

/** Returns a shared tree-sitter parser for C# sources. */
export function getCSharpParser(): Promise<Parser> {
  return getParser("tree-sitter-c-sharp");
}
