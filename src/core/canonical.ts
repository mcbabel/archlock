/**
 * Type canonicalization.
 *
 * Types are never translated between languages, only normalized so equal types compare equal:
 *
 * - whitespace and comments are normalized,
 * - generic argument lists `<...>` become `[...]`,
 * - single-quoted string literals become double-quoted (when that needs no escaping),
 * - leading `|` / `&` and trailing separators before a closing bracket are dropped.
 *
 * A sketch writes a canonical type bare when it is a simple Python-compatible expression
 * (`Promise[Invoice]`, `string | null`) and quoted otherwise (`'"draft" | "sent"'`).
 */

import { isAbbreviatedType } from "./abbreviate.js";
import { COMPLEX, INFERRED } from "./model.js";

type TokenKind = "word" | "number" | "string" | "punct";

interface Token {
  kind: TokenKind;
  text: string;
  /** A line break preceded this token in the source. */
  nl?: boolean;
}

const MULTI_PUNCT = ["...", "=>", "?.", "::", "**", "->"];

const SPACED_KEYWORDS = new Set([
  "new",
  "keyof",
  "typeof",
  "infer",
  "extends",
  "in",
  "is",
  "asserts",
  "readonly",
  "unique",
  "as",
  "satisfies",
  "abstract",
  "out",
  "const",
]);

function isWordStart(ch: string): boolean {
  return /[\p{L}_$]/u.test(ch);
}

function isWordPart(ch: string): boolean {
  return /[\p{L}\p{N}_$]/u.test(ch);
}

function isDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= "0" && ch <= "9";
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;
  let nl = false;
  const push = (t: Token) => {
    if (nl) t.nl = true;
    nl = false;
    tokens.push(t);
  };
  while (i < n) {
    const ch = input[i] as string;
    if (/\s/.test(ch)) {
      if (ch === "\n") nl = true;
      i++;
      continue;
    }
    // TypeScript comments.
    if (ch === "/" && input[i + 1] === "/") {
      while (i < n && input[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && input[j] !== ch) {
        if (input[j] === "\\") j++;
        j++;
      }
      push({ kind: "string", text: normalizeQuotes(input.slice(i, j + 1)) });
      i = j + 1;
      continue;
    }
    if (ch === "`") {
      let j = i + 1;
      let depth = 0;
      while (j < n) {
        const c = input[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (depth === 0 && c === "`") break;
        if (c === "$" && input[j + 1] === "{") {
          depth++;
          j += 2;
          continue;
        }
        if (c === "}" && depth > 0) depth--;
        j++;
      }
      push({ kind: "string", text: input.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    if (isDigit(ch) || (ch === "." && isDigit(input[i + 1]))) {
      let j = i;
      while (j < n && /[0-9a-zA-Z_.]/.test(input[j] as string)) {
        if (input[j] === "." && input[j + 1] === ".") break;
        j++;
      }
      push({ kind: "number", text: input.slice(i, j) });
      i = j;
      continue;
    }
    if (isWordStart(ch)) {
      let j = i + 1;
      while (j < n && isWordPart(input[j] as string)) j++;
      push({ kind: "word", text: input.slice(i, j) });
      i = j;
      continue;
    }
    const multi = MULTI_PUNCT.find((p) => input.startsWith(p, i));
    if (multi) {
      push({ kind: "punct", text: multi });
      i += multi.length;
      continue;
    }
    push({ kind: "punct", text: ch === "<" ? "[" : ch === ">" ? "]" : ch });
    i++;
  }
  return tokens;
}

/** `'a'` → `"a"` when the literal contains no quotes or escapes. */
function normalizeQuotes(literal: string): string {
  if (!literal.startsWith("'")) return literal;
  const body = literal.slice(1, -1);
  if (body.includes('"') || body.includes("\\")) return literal;
  return `"${body}"`;
}

const OPENERS = new Set(["(", "["]);
const CLOSERS = new Set([")", "]", "}"]);
const BINARY = new Set(["|", "&", "=>", "=", "->"]);

const NOT_MEMBER_START = new Set(["extends", "keyof", "infer", "is", "as", "in", "satisfies"]);

function endsMember(t: Token): boolean {
  return t.kind !== "punct" || t.text === ")" || t.text === "]" || t.text === "}";
}

function startsMember(t: Token): boolean {
  if (t.kind === "word") return !NOT_MEMBER_START.has(t.text);
  return t.kind === "string" || (t.kind === "punct" && ["[", "(", "-", "+"].includes(t.text));
}

function isWordLike(t: Token | undefined): boolean {
  return t !== undefined && (t.kind === "word" || t.kind === "number" || t.kind === "string");
}

/** Normalizes a type's text. Idempotent: canonicalType(canonicalType(x)) === canonicalType(x). */
export function canonicalType(input: string): string {
  const trimmed = input.trim();
  if (trimmed === INFERRED || trimmed === COMPLEX || isAbbreviatedType(trimmed)) return trimmed;
  const raw = tokenize(trimmed);

  // Drop leading union/intersection operators and trailing separators before closers; turn
  // line breaks between object members (`{ a: A <newline> b: B }`) into `;`.
  const tokens: Token[] = [];
  const brackets: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i] as Token;
    let prev = tokens[tokens.length - 1];
    if (
      t.nl &&
      brackets[brackets.length - 1] === "{" &&
      prev !== undefined &&
      endsMember(prev) &&
      startsMember(t)
    ) {
      prev = { kind: "punct", text: ";" };
      tokens.push(prev);
    }
    if (t.kind === "punct") {
      if (t.text === "{" || OPENERS.has(t.text)) brackets.push(t.text);
      else if (CLOSERS.has(t.text)) brackets.pop();
    }
    if (
      t.kind === "punct" &&
      (t.text === "|" || t.text === "&") &&
      (prev === undefined ||
        (prev.kind === "punct" &&
          (OPENERS.has(prev.text) ||
            ["{", ",", ":", "=", "=>", "|", "&", "?"].includes(prev.text))))
    ) {
      continue;
    }
    const next = raw[i + 1];
    if (
      t.kind === "punct" &&
      (t.text === "," || t.text === ";") &&
      (next === undefined || (next.kind === "punct" && CLOSERS.has(next.text)))
    ) {
      continue;
    }
    tokens.push(t);
  }

  // Track which `?` / `:` belong to conditional types (spaced) vs optional members (`a?: T`).
  const conditional = new Array<boolean>(tokens.length).fill(false);
  const pending: number[][] = [[]];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i] as Token;
    if (t.kind !== "punct") continue;
    if (OPENERS.has(t.text) || t.text === "{") pending.push([]);
    else if (CLOSERS.has(t.text)) {
      if (pending.length > 1) pending.pop();
    } else if (t.text === "?") {
      const next = tokens[i + 1];
      const isOptional = next?.kind === "punct" && (next.text === ":" || next.text === ")");
      if (!isOptional) {
        conditional[i] = true;
        pending[pending.length - 1]?.push(i);
      }
    } else if (t.text === ":") {
      const stack = pending[pending.length - 1];
      if (stack && stack.length > 0) {
        stack.pop();
        conditional[i] = true;
      }
    }
  }

  let out = "";
  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i] as Token;
    const prev = tokens[i - 1];
    const member = tokens[i - 2]?.kind === "punct" && /^\??\.$/.test(tokens[i - 2]?.text ?? "");
    if (
      prev &&
      needsSpace(prev, cur, conditional[i - 1] === true, conditional[i] === true, member)
    ) {
      out += " ";
    }
    out += cur.text;
  }
  return out;
}

/** `prevIsMember`: `prev` follows `.` or `?.`, so a keyword-like word is a property name. */
function needsSpace(
  prev: Token,
  cur: Token,
  prevCond: boolean,
  curCond: boolean,
  prevIsMember: boolean,
): boolean {
  const p = prev.kind === "punct" ? prev.text : null;
  const c = cur.kind === "punct" ? cur.text : null;

  if (prevCond || curCond) return true;
  if (p === "{") return c !== "}";
  if (c === "}") return true;
  if (p !== null && OPENERS.has(p)) return false;
  if (c !== null && (CLOSERS.has(c) || c === "," || c === ";" || c === ":" || c === "?")) {
    return false;
  }
  if (c === "." || p === "." || p === "?." || c === "?.") return false;
  if (p === "...") return false;
  if (p === "-" || p === "+") return false;
  if (p === "," || p === ";" || p === ":") return true;
  if (p === "?") return true;
  if (c !== null && BINARY.has(c)) return true;
  if (p !== null && BINARY.has(p)) return true;
  if (c === "(" || c === "[") {
    if (prev.kind === "word") return SPACED_KEYWORDS.has(prev.text) && !prevIsMember;
    if (prev.kind === "string" || prev.kind === "number") return false;
    return p !== ")" && p !== "]" && p !== "}";
  }
  if (isWordLike(prev) && isWordLike(cur)) return true;
  if (p === ")" || p === "]") return isWordLike(cur) || c === "...";
  if (c === "...") return true;
  if (c === "-" || c === "+") return true;
  return isWordLike(prev) || isWordLike(cur);
}

const PYTHON_KEYWORDS = new Set([
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
]);

export function isPythonKeyword(name: string): boolean {
  return PYTHON_KEYWORDS.has(name);
}

/** A valid Python identifier that is not a hard keyword (`None`, `True`, `False` are allowed). */
export function isPythonIdentifier(name: string): boolean {
  return /^[\p{L}_][\p{L}\p{N}_]*$/u.test(name) && !PYTHON_KEYWORDS.has(name);
}

/**
 * Maps a code identifier to a sketch identifier: Python keywords get a trailing `_` (PEP 8),
 * invalid characters such as `$` become `_`.
 */
export function toSketchName(name: string): string {
  if (isPythonIdentifier(name)) return name;
  if (PYTHON_KEYWORDS.has(name)) return `${name}_`;
  let out = name.replace(/[^\p{L}\p{N}_]/gu, "_");
  if (out === "" || /^\p{N}/u.test(out)) out = `_${out}`;
  return PYTHON_KEYWORDS.has(out) ? `${out}_` : out;
}

/**
 * True when a canonical type can be written bare in a sketch: dotted names, subscripts,
 * `|` unions; string, number, `...` and list literals only inside subscripts.
 */
export function isBareType(canonical: string): boolean {
  if (canonical === "" || canonical === INFERRED || canonical === COMPLEX) return false;
  const tokens = tokenize(canonical);
  // Bare text must round-trip through the tokenizer unchanged (e.g. no single quotes).
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (text: string): boolean => {
    const t = tokens[pos];
    if (t && t.kind === "punct" && t.text === text) {
      pos++;
      return true;
    }
    return false;
  };

  const union = (inSubscript: boolean): boolean => {
    if (!primary(inSubscript)) return false;
    while (eat("|")) {
      if (!primary(inSubscript)) return false;
    }
    return true;
  };

  const args = (): boolean => {
    if (!union(true)) return false;
    while (eat(",")) {
      if (!union(true)) return false;
    }
    return true;
  };

  const primary = (inSubscript: boolean): boolean => {
    const t = peek();
    if (!t) return false;
    if (inSubscript) {
      if (t.kind === "string") {
        pos++;
        return t.text.startsWith('"') && !t.text.includes("\\");
      }
      if (t.kind === "number") {
        pos++;
        return /^[0-9]+$/.test(t.text);
      }
      if (t.kind === "punct" && t.text === "...") {
        pos++;
        return true;
      }
      if (t.kind === "punct" && t.text === "[") {
        pos++;
        if (eat("]")) return true;
        return args() && eat("]");
      }
    }
    if (t.kind !== "word" || !isPythonIdentifier(t.text)) return false;
    pos++;
    while (eat(".")) {
      const n = peek();
      if (n?.kind !== "word" || !isPythonIdentifier(n.text)) return false;
      pos++;
    }
    // At most one subscript: tree-sitter-python rejects `A[b][c]` in parameter and return
    // annotations, so chained subscripts are written quoted.
    if (eat("[")) {
      if (!args() || !eat("]")) return false;
    }
    return true;
  };

  return union(false) && pos === tokens.length;
}

/** Quotes text as a Python string literal, preferring single quotes. */
export function pythonString(text: string, prefer: "'" | '"' = "'"): string {
  const other = prefer === "'" ? '"' : "'";
  let quote = prefer;
  if (text.includes(prefer) && !text.includes(other)) quote = other;
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(new RegExp(quote, "g"), `\\${quote}`)
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  return `${quote}${escaped}${quote}`;
}

/** Renders a canonical type for a sketch: bare if possible, quoted otherwise. */
export function renderType(canonical: string): string {
  return isBareType(canonical) ? canonical : pythonString(canonical);
}

/** Decodes a simple Python string literal (no prefixes, no implicit concatenation). */
export function decodePythonString(literal: string): string | null {
  const m = /^("""|'''|"|')([\s\S]*)\1$/.exec(literal);
  if (!m) return null;
  const body = m[2] as string;
  let out = "";
  for (let i = 0; i < body.length; i++) {
    const ch = body[i] as string;
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const next = body[++i];
    switch (next) {
      case "n":
        out += "\n";
        break;
      case "t":
        out += "\t";
        break;
      case "r":
        out += "\r";
        break;
      case "\\":
      case "'":
      case '"':
        out += next;
        break;
      case "\n":
        break;
      case undefined:
        out += "\\";
        break;
      default:
        out += `\\${next}`;
    }
  }
  return out;
}
