import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  version: string;
};

export default defineConfig({
  entry: { cli: "src/cli.ts", index: "src/index.ts" },
  format: ["esm"],
  target: "node20",
  platform: "node",
  // tsup injects `baseUrl`, which TypeScript 6 flags as deprecated.
  dts: { entry: { index: "src/index.ts" }, compilerOptions: { ignoreDeprecations: "6.0" } },
  clean: true,
  sourcemap: false,
  splitting: true,
  shims: false,
  // Ship the grammar WASM files in the package so installing archlock compiles nothing.
  onSuccess: async () => {
    const require = createRequire(import.meta.url);
    mkdirSync("dist/wasm", { recursive: true });
    // npm package → WASM file name (the C# grammar's file differs from its package name).
    const grammars: [string, string][] = [
      ["tree-sitter-python", "tree-sitter-python.wasm"],
      ["tree-sitter-go", "tree-sitter-go.wasm"],
      ["tree-sitter-rust", "tree-sitter-rust.wasm"],
      ["tree-sitter-java", "tree-sitter-java.wasm"],
      ["tree-sitter-c-sharp", "tree-sitter-c_sharp.wasm"],
    ];
    for (const [pkg, file] of grammars) {
      copyFileSync(require.resolve(`${pkg}/${file}`), `dist/wasm/${file}`);
    }
  },
  define: {
    __ARCHLOCK_VERSION__: JSON.stringify(pkg.version),
  },
});
