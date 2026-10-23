import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { MIN_TYPE_LENGTH } from "../core/abbreviate.js";
import {
  FIXED_RULES,
  RULE_DEFAULTS,
  RULE_NAMES,
  type RuleName,
  SEVERITIES,
  type Severity,
} from "../core/rules.js";

export const CONFIG_FILE = "archlock.config.json";
export const SCHEMA_URL = "https://unpkg.com/archlock/schema.json";

export type Language = "typescript" | "python" | "go";
export const LANGUAGES: readonly Language[] = ["typescript", "python", "go"];
export type AgentName = "claude" | "codex" | "opencode" | "custom";
export const AGENT_NAMES: readonly AgentName[] = ["claude", "codex", "opencode", "custom"];

export interface ArchlockConfig {
  version: 1;
  sketchDir: string;
  languages: Language[];
  include: string[];
  exclude: string[];
  rules: Record<RuleName, Severity>;
  /** Types longer than this are abbreviated in sketches (opt-in; null = never). */
  maxTypeLength: number | null;
  agent: {
    default: AgentName;
    command: string | null;
    maxRounds: number;
    /** Commands the agent may run to verify its work (build, typecheck, tests). */
    verifyCommands: string[];
  };
}

/** Test files are excluded from `archlock check` by default. */
export const DEFAULT_EXCLUDE = [
  "**/*.test.*",
  "**/*.spec.*",
  "**/__tests__/**",
  "tests/**",
  "**/test_*.py",
  "**/*_test.py",
  "**/conftest.py",
  "**/*_test.go",
  "**/testdata/**",
];

/**
 * Characters that would change the meaning of a Claude Code permission rule (`*`, `(`, `)`, `,`)
 * or turn one allowed command into several (`;`, `&`, `|`, redirections, substitutions).
 */
const RULE_UNSAFE = /[*(),;&|<>`$\n\r]/;

/** Whether `command` can be allowed as one plain command (check command, verify commands). */
export function isPlainCommand(command: string): boolean {
  return command.trim() !== "" && !RULE_UNSAFE.test(command);
}

export function defaultConfig(): ArchlockConfig {
  return {
    version: 1,
    sketchDir: "archlock",
    languages: ["typescript"],
    include: ["src/**"],
    exclude: [...DEFAULT_EXCLUDE],
    rules: { ...RULE_DEFAULTS },
    maxTypeLength: null,
    agent: { default: "claude", command: null, maxRounds: 3, verifyCommands: [] },
  };
}

export class ConfigError extends Error {
  constructor(
    message: string,
    readonly file: string,
  ) {
    super(message);
  }
}

export interface LoadedConfig {
  config: ArchlockConfig;
  /** Absolute path of the config file. */
  file: string;
  /** Absolute repository root (the directory containing the config file). */
  root: string;
}

/** Finds `archlock.config.json` in `cwd` or its parents. */
export function findConfig(cwd: string): string | null {
  let dir = resolve(cwd);
  for (;;) {
    const candidate = join(dir, CONFIG_FILE);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function loadConfig(cwd: string, explicit?: string): LoadedConfig | null {
  const file = explicit
    ? isAbsolute(explicit)
      ? explicit
      : resolve(cwd, explicit)
    : findConfig(cwd);
  if (!file) return null;
  if (!existsSync(file)) throw new ConfigError(`config file not found: ${file}`, file);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new ConfigError(`invalid JSON: ${(e as Error).message}`, file);
  }
  return { config: validateConfig(raw, file), file, root: dirname(file) };
}

function fail(file: string, path: string, message: string): never {
  throw new ConfigError(`${path}: ${message}`, file);
}

function stringArray(value: unknown, file: string, path: string): string[] {
  if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
    fail(file, path, "must be an array of strings");
  }
  return value as string[];
}

/** Validates a parsed config and fills in defaults. Errors name the offending key. */
export function validateConfig(raw: unknown, file: string): ArchlockConfig {
  const config = defaultConfig();
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    fail(file, "(root)", "must be a JSON object");
  }
  const obj = raw as Record<string, unknown>;
  const known = new Set([
    "$schema",
    "version",
    "sketchDir",
    "languages",
    "include",
    "exclude",
    "rules",
    "maxTypeLength",
    "agent",
  ]);
  for (const key of Object.keys(obj)) {
    if (!known.has(key))
      fail(
        file,
        key,
        `unknown setting (known: ${[...known].filter((k) => k !== "$schema").join(", ")})`,
      );
  }
  if (obj.version !== undefined && obj.version !== 1) {
    fail(file, "version", "must be 1 (this archlock understands config version 1)");
  }
  if (obj.sketchDir !== undefined) {
    if (typeof obj.sketchDir !== "string" || obj.sketchDir.trim() === "") {
      fail(file, "sketchDir", "must be a non-empty string");
    }
    config.sketchDir = obj.sketchDir;
  }
  if (obj.languages !== undefined) {
    const langs = stringArray(obj.languages, file, "languages");
    for (const l of langs) {
      if (!(LANGUAGES as readonly string[]).includes(l)) {
        fail(file, "languages", `unknown language "${l}" (supported: ${LANGUAGES.join(", ")})`);
      }
    }
    config.languages = langs as Language[];
  }
  if (obj.include !== undefined) config.include = stringArray(obj.include, file, "include");
  if (obj.exclude !== undefined) config.exclude = stringArray(obj.exclude, file, "exclude");
  if (obj.rules !== undefined) {
    if (typeof obj.rules !== "object" || obj.rules === null || Array.isArray(obj.rules)) {
      fail(file, "rules", "must be an object mapping rule names to severities");
    }
    for (const [name, sev] of Object.entries(obj.rules as Record<string, unknown>)) {
      if (!(RULE_NAMES as string[]).includes(name)) {
        fail(file, `rules.${name}`, `unknown rule (known: ${RULE_NAMES.join(", ")})`);
      }
      if (typeof sev !== "string" || !(SEVERITIES as readonly string[]).includes(sev)) {
        fail(file, `rules.${name}`, `must be one of ${SEVERITIES.map((s) => `"${s}"`).join(", ")}`);
      }
      if ((FIXED_RULES as string[]).includes(name) && sev !== "error") {
        fail(file, `rules.${name}`, "is always an error and cannot be configured");
      }
      config.rules[name as RuleName] = sev as Severity;
    }
  }
  if (obj.maxTypeLength !== undefined && obj.maxTypeLength !== null) {
    const n = obj.maxTypeLength;
    if (typeof n !== "number" || !Number.isInteger(n) || n < MIN_TYPE_LENGTH) {
      fail(
        file,
        "maxTypeLength",
        `must be an integer of at least ${MIN_TYPE_LENGTH} (or null to never abbreviate types)`,
      );
    }
    config.maxTypeLength = n;
  }
  if (obj.agent !== undefined) {
    if (typeof obj.agent !== "object" || obj.agent === null || Array.isArray(obj.agent)) {
      fail(file, "agent", "must be an object");
    }
    const agent = obj.agent as Record<string, unknown>;
    for (const key of Object.keys(agent)) {
      if (!["default", "command", "maxRounds", "verifyCommands"].includes(key))
        fail(file, `agent.${key}`, "unknown setting");
    }
    if (agent.default !== undefined) {
      if (
        typeof agent.default !== "string" ||
        !(AGENT_NAMES as readonly string[]).includes(agent.default)
      ) {
        fail(
          file,
          "agent.default",
          `must be one of ${AGENT_NAMES.map((a) => `"${a}"`).join(", ")}`,
        );
      }
      config.agent.default = agent.default as AgentName;
    }
    if (agent.command !== undefined) {
      if (agent.command !== null && typeof agent.command !== "string") {
        fail(
          file,
          "agent.command",
          "must be a string (a command template with {prompt_file}) or null",
        );
      }
      config.agent.command = agent.command as string | null;
    }
    if (agent.maxRounds !== undefined) {
      if (
        typeof agent.maxRounds !== "number" ||
        !Number.isInteger(agent.maxRounds) ||
        agent.maxRounds < 1
      ) {
        fail(file, "agent.maxRounds", "must be a positive integer");
      }
      config.agent.maxRounds = agent.maxRounds;
    }
    if (agent.verifyCommands !== undefined) {
      const list = agent.verifyCommands;
      if (!Array.isArray(list) || !list.every((c) => typeof c === "string" && isPlainCommand(c))) {
        fail(
          file,
          "agent.verifyCommands",
          'must be an array of plain commands without * ( ) , ; & | < > ` $, e.g. ["npm test", "npx tsc --noEmit"]',
        );
      }
      config.agent.verifyCommands = (list as string[]).map((c) => c.trim());
    }
  }
  return config;
}

/** Serializes a config the way `init` writes it (stable key order, 2-space JSON, trailing LF). */
export function serializeConfig(config: ArchlockConfig): string {
  const out = {
    $schema: SCHEMA_URL,
    version: config.version,
    sketchDir: config.sketchDir,
    languages: config.languages,
    include: config.include,
    exclude: config.exclude,
    rules: Object.fromEntries(
      RULE_NAMES.filter((r) => !FIXED_RULES.includes(r)).map((r) => [r, config.rules[r]]),
    ),
    // Omitted when unset so existing configs stay byte-identical.
    ...(config.maxTypeLength !== null ? { maxTypeLength: config.maxTypeLength } : {}),
    // verifyCommands is omitted when unset, for the same reason.
    agent: {
      default: config.agent.default,
      command: config.agent.command,
      maxRounds: config.agent.maxRounds,
      ...(config.agent.verifyCommands.length > 0
        ? { verifyCommands: config.agent.verifyCommands }
        : {}),
    },
  };
  return `${formatJson(out, 0)}\n`;
}

/**
 * JSON with 2-space indentation where arrays of primitives stay on one line when they fit in
 * 80 columns: the layout Prettier and Biome produce, so formatters leave the file alone.
 */
function formatJson(value: unknown, indent: number, prefixLength = 0): string {
  const pad = " ".repeat(indent);
  const inner = " ".repeat(indent + 2);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const flat = `[${value.map((v) => JSON.stringify(v)).join(", ")}]`;
    const primitive = value.every((v) => v === null || typeof v !== "object");
    if (primitive && prefixLength + flat.length + 1 <= 80) return flat;
    return `[\n${value.map((v) => `${inner}${formatJson(v, indent + 2, inner.length)}`).join(",\n")}\n${pad}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const lines = entries.map(([k, v]) => {
      const key = `${inner}${JSON.stringify(k)}: `;
      return `${key}${formatJson(v, indent + 2, key.length)}`;
    });
    return `{\n${lines.join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}
