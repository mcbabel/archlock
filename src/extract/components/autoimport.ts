/**
 * Auto-imported Vue components (Nuxt, `unplugin-vue-components`): a component that a template
 * uses without importing it becomes an import of its file. The names come from the
 * `components.d.ts` files these tools generate (`UserCard: typeof import('./src/…/UserCard.vue')`)
 * and, for Nuxt projects without one, from Nuxt's naming rule (`components/base/Button.vue` →
 * `BaseButton`).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import type { FileFacts } from "../facts.js";
import { nuxtSrcDir } from "../typescript/resolve.js";
import { componentName } from "./component.js";

const SKIP = new Set(["node_modules", ".git", "dist", ".output"]);
const NUXT_CONFIGS = ["nuxt.config.ts", "nuxt.config.js", "nuxt.config.mjs"];

/** `components.d.ts` files of the repository: component name → repo-relative file. */
function declaredComponents(root: string): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (abs: string, rel: string, depth: number) => {
    if (depth > 6) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isFile() && e.name === "components.d.ts") {
        const text = readFileSync(join(abs, e.name), "utf8");
        for (const m of text.matchAll(
          /\b([A-Z][A-Za-z0-9]*)\s*:\s*typeof import\(\s*['"]([^'"]+\.vue)['"]\s*\)/g,
        )) {
          const target = posix.normalize(posix.join(rel, m[2] as string));
          if (!target.startsWith("..") && !out.has(m[1] as string)) out.set(m[1] as string, target);
        }
      } else if (
        e.isDirectory() &&
        !SKIP.has(e.name) &&
        (e.name === ".nuxt" || !e.name.startsWith("."))
      ) {
        walk(join(abs, e.name), rel === "" ? e.name : `${rel}/${e.name}`, depth + 1);
      }
    }
  };
  walk(root, "", 0);
  return out;
}

/** Nuxt's component names: the path below `components/`, PascalCase, without repeated parts. */
export function nuxtComponentName(relative: string): string | null {
  const parts = relative.replace(/\.vue$/, "").split("/");
  const words: string[] = [];
  for (const part of parts) {
    const pascal = componentName(`${part}.vue`) ?? "";
    // `components/base/BaseButton.vue` is `BaseButton`, not `BaseBaseButton`.
    const prefix = words.join("");
    if (pascal === "Index" && words.length > 0) continue;
    if (prefix && pascal.startsWith(prefix)) words.splice(0, words.length, pascal);
    else words.push(pascal);
  }
  const name = words.join("");
  return name === "" ? null : name;
}

function nuxtComponents(root: string, files: string[]): Map<string, string> {
  const out = new Map<string, string>();
  const configs = files
    .map((f) => posix.dirname(f))
    .filter((d, i, all) => all.indexOf(d) === i)
    .concat([""])
    .filter((d) => NUXT_CONFIGS.some((c) => existsSync(join(root, d, c))));
  for (const dir of configs) {
    const prefix = dir === "" || dir === "." ? "" : `${dir}/`;
    const custom = nuxtSrcDir(join(root, dir));
    const srcDir =
      custom !== null
        ? posix.join(prefix, custom)
        : existsSync(join(root, prefix, "app", "components"))
          ? `${prefix}app`
          : prefix;
    const base = `${posix.join(srcDir, "components")}/`.replace(/^\.\//, "");
    for (const f of files) {
      if (!f.startsWith(base) || !f.endsWith(".vue")) continue;
      const name = nuxtComponentName(f.slice(base.length));
      if (name && !out.has(name)) out.set(name, f);
    }
  }
  return out;
}

export function linkAutoImports(root: string, facts: FileFacts[]): void {
  const vue = facts.filter((f) => f.templateTags && f.templateTags.length > 0);
  if (vue.length === 0) return;
  const files = facts.map((f) => f.path).sort();
  const known = declaredComponents(root);
  for (const [name, file] of nuxtComponents(root, files))
    if (!known.has(name)) known.set(name, file);
  if (known.size === 0) return;
  for (const f of vue) {
    for (const tag of f.templateTags ?? []) {
      // Nuxt's `<LazyCartSummary>` is `CartSummary`, loaded on demand.
      const target =
        known.get(tag.name) ??
        (/^Lazy[A-Z]/.test(tag.name) ? known.get(tag.name.slice(4)) : undefined);
      if (!target || target === f.path) continue;
      let specifier = posix.relative(posix.dirname(f.path), target);
      if (!specifier.startsWith(".")) specifier = `./${specifier}`;
      f.imports = [
        ...f.imports,
        { specifier, names: ["default"], line: tag.line, column: tag.column, typeOnly: false },
      ];
    }
  }
}
