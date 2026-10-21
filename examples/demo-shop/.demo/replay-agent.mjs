// A RECORDED agent run, used to make the demo reproducible and independent of LLM latency.
// It applies the exact code changes a coding agent produced for the work order
// (`archlock push` passes the work order file as the first argument).
import { cpSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workOrder = process.argv[2];
if (!workOrder || !existsSync(workOrder)) {
  console.error(`replay-agent: work order not found: ${workOrder}`);
  process.exit(2);
}
const order = readFileSync(workOrder, "utf8");
const items = order.match(/^### \d+\. .+$/gm) ?? [];
console.log(`replay-agent: received a work order with ${items.length} changes:`);
for (const item of items) console.log(`  ${item.replace(/^### /, "")}`);
const recorded = join(dirname(fileURLToPath(import.meta.url)), "agent-run");
cpSync(recorded, ".", { recursive: true });
console.log("replay-agent: applied the recorded changes (src/notifications/, billing, api, main.ts).");
