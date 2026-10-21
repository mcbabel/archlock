/** The section `archlock init --agents` adds to AGENTS.md and CLAUDE.md. */

export const AGENTS_MARKER_START = "<!-- archlock:agents -->";
export const AGENTS_MARKER_END = "<!-- /archlock:agents -->";

export function agentsSection(sketchDir: string, checkCommand = "npx archlock check"): string {
  return [
    AGENTS_MARKER_START,
    "## Architecture (archlock)",
    "",
    `This repository locks its architecture in \`${sketchDir}/*.arch.py\` (one sketch per module: files, allowed dependencies, public API, invariants).`,
    "",
    `1. **Read the sketch first.** Before changing a module, read \`${sketchDir}/<module>.arch.py\`: its public API, \`__depends_on__\` and the \`# invariant:\` / \`# must:\` / \`# never:\` comments.`,
    "2. **Stay within the contract.** Only import modules listed in `__depends_on__`; keep public signatures as declared; do not add public symbols that are not in the sketch.",
    `3. **Check before you finish.** Run \`${checkCommand}\` and fix what it reports.`,
    `4. **Propose, do not accept.** If the task needs an architecture change (new dependency, new public API, changed signature), do not run \`archlock accept\` and do not edit \`${sketchDir}/\` on your own. Describe the change you propose, ideally as a sketch edit, and let a human decide.`,
    AGENTS_MARKER_END,
    "",
  ].join("\n");
}

/**
 * Appends the section to `existing` unless it is already there. Never rewrites existing content.
 * Returns null when nothing needs to change.
 */
export function withAgentsSection(existing: string | null, section: string): string | null {
  if (existing?.includes(AGENTS_MARKER_START)) return null;
  if (existing === null || existing.trim() === "") return section;
  return `${existing.replace(/\s*$/, "")}\n\n${section}`;
}
