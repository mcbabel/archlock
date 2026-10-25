import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { linkAutoImports, nuxtComponentName } from "../../src/extract/components/autoimport.js";
import { extractComponentFile } from "../../src/extract/components/component.js";
import { TypeScriptResolver } from "../../src/extract/typescript/resolve.js";

const dirs: string[] = [];
afterAll(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
});

/** A temporary repository with these files. */
function repo(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "archlock-frameworks-"));
  dirs.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

/** The import specifiers of `file` after auto-imports are linked. */
function importsOf(root: string, files: Record<string, string>, file: string): string[] {
  const facts = Object.entries(files)
    .filter(([path]) => path.endsWith(".vue"))
    .map(([path, text]) => extractComponentFile(path, text));
  linkAutoImports(root, facts);
  return facts.find((f) => f.path === file)?.imports.map((i) => i.specifier) ?? [];
}

describe("auto-imported Vue components", () => {
  it("Nuxt names: the path below components/, without repeated prefixes", () => {
    expect(nuxtComponentName("CartSummary.vue")).toBe("CartSummary");
    expect(nuxtComponentName("base/Button.vue")).toBe("BaseButton");
    expect(nuxtComponentName("base/BaseButton.vue")).toBe("BaseButton");
    expect(nuxtComponentName("form/text-input.vue")).toBe("FormTextInput");
    expect(nuxtComponentName("user/index.vue")).toBe("User");
  });

  it("components.d.ts maps template tags to files", () => {
    const files = {
      "components.d.ts":
        "declare module 'vue' {\n  export interface GlobalComponents {\n    UserCard: typeof import('./src/components/UserCard.vue')['default']\n    RouterLink: typeof import('vue-router')['RouterLink']\n  }\n}\n",
      "src/components/UserCard.vue": "<template><div /></template>\n",
      "src/App.vue": "<template><UserCard /><RouterLink to='/' /></template>\n",
      "src/views/Home.vue": "<template><user-card /></template>\n",
    };
    const root = repo(files);
    expect(importsOf(root, files, "src/App.vue")).toEqual(["./components/UserCard.vue"]);
    expect(importsOf(root, files, "src/views/Home.vue")).toEqual(["../components/UserCard.vue"]);
  });

  it("Nuxt without components.d.ts: the naming rule, lazy components and a custom srcDir", () => {
    const files = {
      "nuxt.config.ts": "export default defineNuxtConfig({ srcDir: 'src/' });\n",
      "src/components/base/Button.vue": "<template><button /></template>\n",
      "src/pages/index.vue": "<template><BaseButton /><LazyBaseButton /><NuxtLink /></template>\n",
    };
    const root = repo(files);
    expect(importsOf(root, files, "src/pages/index.vue")).toEqual([
      "../components/base/Button.vue",
      "../components/base/Button.vue",
    ]);
  });

  it("a component that is imported explicitly is not linked twice", () => {
    const files = {
      "nuxt.config.ts": "export default {};\n",
      "components/PriceTag.vue": "<template><span /></template>\n",
      "pages/index.vue":
        '<script setup lang="ts">\nimport PriceTag from "~/components/PriceTag.vue";\n</script>\n<template><PriceTag /></template>\n',
    };
    const root = repo(files);
    expect(importsOf(root, files, "pages/index.vue")).toEqual(["~/components/PriceTag.vue"]);
  });
});

describe("framework path aliases", () => {
  it("Vite resolve.alias: object and array form", () => {
    const root = repo({
      "vite.config.ts":
        "import { fileURLToPath, URL } from 'node:url';\nexport default defineConfig({\n  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), '#shared': './shared' } },\n});\n",
      "src/util.ts": "export const a = 1;\n",
      "shared/types.ts": "export type T = 1;\n",
      "web/vite.config.js":
        "export default { resolve: { alias: [{ find: '~app', replacement: path.resolve(__dirname, 'app') }] } };\n",
      "web/app/x.ts": "export const x = 1;\n",
      "web/main.ts": "",
      "src/main.ts": "",
    });
    const r = new TypeScriptResolver(root);
    expect(r.resolve("@/util", "src/main.ts")).toEqual({ kind: "file", path: "src/util.ts" });
    expect(r.resolve("#shared/types", "src/main.ts")).toEqual({
      kind: "file",
      path: "shared/types.ts",
    });
    expect(r.resolve("~app/x", "web/main.ts")).toEqual({ kind: "file", path: "web/app/x.ts" });
  });

  it("Nuxt ~ and @ follow a custom srcDir; ~~ is the project root", () => {
    const root = repo({
      "nuxt.config.ts": "export default defineNuxtConfig({ srcDir: 'client' });\n",
      "client/utils/fmt.ts": "export const f = 1;\n",
      "server/db.ts": "export const db = 1;\n",
      "client/pages/a.ts": "",
    });
    const r = new TypeScriptResolver(root);
    expect(r.resolve("~/utils/fmt", "client/pages/a.ts")).toEqual({
      kind: "file",
      path: "client/utils/fmt.ts",
    });
    expect(r.resolve("@/utils/fmt", "client/pages/a.ts")).toEqual({
      kind: "file",
      path: "client/utils/fmt.ts",
    });
    expect(r.resolve("~~/server/db", "client/pages/a.ts")).toEqual({
      kind: "file",
      path: "server/db.ts",
    });
  });
});
