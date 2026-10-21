import type { Violation } from "../engine/compare.js";

function escapeData(s: string): string {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

function escapeProperty(s: string): string {
  return escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
}

/** GitHub Actions workflow commands, one annotation per violation. */
export function renderGithubAnnotations(violations: Violation[]): string {
  const lines: string[] = [];
  for (const v of violations) {
    const command = v.severity === "error" ? "error" : v.severity === "warn" ? "warning" : "notice";
    const where = v.code ?? v.sketch;
    const props = [
      where ? `file=${escapeProperty(where.file)}` : null,
      where ? `line=${where.line}` : null,
      where && where.column > 1 ? `col=${where.column}` : null,
      `title=${escapeProperty(`archlock ${v.rule}${v.module ? ` (${v.module})` : ""}`)}`,
    ].filter(Boolean);
    const body = [v.message, ...(v.details ?? []), v.hint ? `→ ${v.hint}` : ""]
      .filter(Boolean)
      .join("\n");
    lines.push(`::${command} ${props.join(",")}::${escapeData(body)}`);
  }
  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}
