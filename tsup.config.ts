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
  // Ship the Python grammar WASM in the package so installing archlock compiles nothing.
  onSuccess: async () => {
    const require = createRequire(import.meta.url);
    mkdirSync("dist/wasm", { recursive: true });
    copyFileSync(
      require.resolve("tree-sitter-python/tree-sitter-python.wasm"),
      "dist/wasm/tree-sitter-python.wasm",
    );
  },
  define: {
    __ARCHLOCK_VERSION__: JSON.stringify(pkg.version),
  },
});
