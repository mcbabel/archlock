import type { Command } from "commander";
import { openWorkspace } from "../../engine/workspace.js";
import { mermaidGraph } from "../../report/graph.js";
import { jsonPayload } from "../../report/json.js";
import type { Context } from "../context.js";

export async function runGraphCommand(ctx: Context): Promise<number> {
  const ws = await openWorkspace(ctx.cwd, { configPath: ctx.configPath, cache: ctx.cache });
  const modules = ws.sketches.sketches.map((s) => s.module);
  ws.cache.save();
  if (ctx.json) {
    ctx.out(
      jsonPayload("graph", {
        modules: modules.map((m) => ({ name: m.name, dependsOn: [...m.dependsOn].sort() })),
        mermaid: mermaidGraph(modules),
      }),
    );
  } else ctx.out(mermaidGraph(modules));
  return 0;
}

export function registerGraph(
  program: Command,
  context: () => Context,
  setExit: (code: number) => void,
): void {
  program
    .command("graph")
    .description("print the declared module graph as Mermaid (GitHub renders it natively)")
    .action(async () => {
      setExit(await runGraphCommand(context()));
    });
}
