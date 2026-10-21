// Demo setup: point archlock's custom agent at the recorded run (see replay-agent.mjs).
import { readFileSync, writeFileSync } from "node:fs";

const config = JSON.parse(readFileSync("archlock.config.json", "utf8"));
config.agent.command = "node .demo/replay-agent.mjs {prompt_file}";
writeFileSync("archlock.config.json", `${JSON.stringify(config, null, 2)}\n`);
