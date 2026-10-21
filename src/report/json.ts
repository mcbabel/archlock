import type { Violation } from "../engine/compare.js";
import { summarize } from "./human.js";

/** Version of every `--json` payload. Bump on breaking changes. */
export const JSON_SCHEMA_VERSION = 1;

export function jsonPayload(command: string, data: Record<string, unknown>): string {
  return `${JSON.stringify({ schemaVersion: JSON_SCHEMA_VERSION, command, ...data }, null, 2)}\n`;
}

export function checkJson(violations: Violation[], extra: Record<string, unknown>): string {
  const summary = summarize(violations);
  return jsonPayload("check", { ok: summary.errors === 0, summary, ...extra, violations });
}
