// A stand-in for a coding agent: applies scripted file edits, one round per invocation.
// Usage (as agent.command): node fake-agent.mjs <prompt_file>
// FAKE_AGENT_PLAN: JSON file with { "rounds": [[{ "file", "find", "replace" } | { "file", "write" }]] }
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const promptFile = process.argv[2];
if (!promptFile || !existsSync(promptFile)) {
  console.error(`fake-agent: prompt file not found: ${promptFile}`);
  process.exit(3);
}
// archlock gives agents no stdin (an empty one): record what this agent sees.
let stdinBytes = 0;
try {
  stdinBytes = readFileSync(0).length;
} catch {
  stdinBytes = -1;
}
appendFileSync(".fake-agent-stdin", `${stdinBytes}\n`);
const plan = JSON.parse(readFileSync(process.env.FAKE_AGENT_PLAN, "utf8"));
const stateFile = ".fake-agent-round";
const round = existsSync(stateFile) ? Number(readFileSync(stateFile, "utf8")) : 0;
writeFileSync(stateFile, String(round + 1));
appendFileSync(
  ".fake-agent-log",
  `--- round ${round + 1} ---\n${readFileSync(promptFile, "utf8")}\n`,
);
for (const edit of plan.rounds[round] ?? []) {
  if ("write" in edit) {
    mkdirSync(dirname(edit.file), { recursive: true });
    writeFileSync(edit.file, edit.write);
  } else {
    const before = readFileSync(edit.file, "utf8");
    if (!before.includes(edit.find)) {
      console.error(`fake-agent: "${edit.find}" not found in ${edit.file}`);
      process.exit(4);
    }
    writeFileSync(edit.file, before.replace(edit.find, edit.replace));
  }
}
