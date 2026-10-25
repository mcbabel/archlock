/**
 * Script blocks of single-file components: `<script>` blocks of Vue and Svelte files, and the
 * frontmatter plus client `<script>` blocks of Astro files.
 */

export type Framework = "vue" | "svelte" | "astro";

export function frameworkOf(path: string): Framework | null {
  if (path.endsWith(".vue")) return "vue";
  if (path.endsWith(".svelte")) return "svelte";
  if (path.endsWith(".astro")) return "astro";
  return null;
}

export interface ScriptBlock {
  /** Offsets of the block's content (without the surrounding tags) in the file. */
  start: number;
  end: number;
  attrs: Map<string, string>;
  kind: "script" | "frontmatter";
  /** Offset of the opening tag, for locations of `src=` imports. */
  tagStart: number;
}

const SCRIPT = /<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi;
const ATTR = /([^\s=/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function parseAttrs(source: string): Map<string, string> {
  const attrs = new Map<string, string>();
  for (const m of source.matchAll(ATTR)) {
    attrs.set((m[1] as string).toLowerCase(), m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

/** Blanks HTML comments so that commented-out tags are not found. */
function withoutComments(text: string): string {
  return text.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n\r]/g, " "));
}

/** Ranges `[start, end)` covered by an element and its nested elements of the same name. */
function elementRanges(text: string, name: string): [number, number][] {
  const ranges: [number, number][] = [];
  const tag = new RegExp(`<(/?)${name}\\b[^>]*>`, "gi");
  let depth = 0;
  let start = 0;
  for (const m of text.matchAll(tag)) {
    const closing = m[1] === "/";
    if (!closing && !m[0].endsWith("/>")) {
      if (depth === 0) start = m.index;
      depth++;
    } else if (closing && depth > 0) {
      depth--;
      if (depth === 0) ranges.push([start, m.index + m[0].length]);
    }
  }
  return ranges;
}

function astroFrontmatter(text: string): ScriptBlock | null {
  const open = /^(?:﻿)?\s*---[ \t]*\r?\n/.exec(text);
  if (!open) return null;
  const start = open[0].length;
  const close = /^---[ \t]*$/m.exec(text.slice(start));
  if (!close) return null;
  return {
    start,
    end: start + close.index,
    attrs: new Map(),
    kind: "frontmatter",
    tagStart: open.index,
  };
}

/** Client scripts that the bundler processes (not `is:inline`, not JSON or other data). */
function isBundledScript(attrs: Map<string, string>): boolean {
  if (attrs.has("is:inline")) return false;
  const type = attrs.get("type");
  return type === undefined || /^(module|text\/javascript|application\/javascript)$/i.test(type);
}

export function findBlocks(text: string, framework: Framework): ScriptBlock[] {
  const scan = withoutComments(text);
  const blocks: ScriptBlock[] = [];
  let from = 0;
  if (framework === "astro") {
    const fm = astroFrontmatter(scan);
    if (fm) {
      blocks.push(fm);
      from = fm.end;
    }
  }
  // Scripts inside these elements are not part of the component's own code.
  const skipped =
    framework === "vue"
      ? elementRanges(scan, "template")
      : framework === "svelte"
        ? elementRanges(scan, "svelte:head")
        : [];
  for (const m of scan.slice(from).matchAll(SCRIPT)) {
    const tagStart = from + m.index;
    if (skipped.some(([s, e]) => tagStart >= s && tagStart < e)) continue;
    const attrs = parseAttrs(m[1] ?? "");
    if (framework === "astro" && !isBundledScript(attrs)) continue;
    const start = tagStart + m[0].indexOf(">") + 1;
    blocks.push({ start, end: start + (m[2] ?? "").length, attrs, kind: "script", tagStart });
  }
  return blocks;
}

/** The file with everything outside `blocks` blanked; line and column positions are kept. */
export function maskOutside(text: string, blocks: ScriptBlock[]): string {
  const sorted = [...blocks].sort((a, b) => a.start - b.start);
  let out = "";
  let pos = 0;
  for (const b of sorted) {
    out += blank(text.slice(pos, b.start)) + text.slice(b.start, b.end);
    pos = b.end;
  }
  return out + blank(text.slice(pos));
}

function blank(s: string): string {
  return s.replace(/[^\n\r]/g, " ");
}

/**
 * Component tags of a Vue template, PascalCase (`<user-card>` → `UserCard`), with the
 * position of their first use. Plain HTML elements have neither capitals nor a hyphen.
 */
export function templateTags(
  text: string,
  blocks: ScriptBlock[],
): { name: string; line: number; column: number }[] {
  const scan = withoutComments(text);
  const out: { name: string; line: number; column: number }[] = [];
  const seen = new Set<string>();
  for (const m of scan.matchAll(/<([A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)+)(?=[\s/>])/g)) {
    const at = m.index;
    if (blocks.some((b) => at >= b.start && at < b.end)) continue;
    const raw = m[1] as string;
    const name = raw.includes("-")
      ? raw
          .split("-")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join("")
      : raw;
    if (seen.has(name)) continue;
    seen.add(name);
    const before = text.slice(0, at);
    const line = before.split("\n").length;
    out.push({ name, line, column: at - before.lastIndexOf("\n") });
  }
  return out;
}
