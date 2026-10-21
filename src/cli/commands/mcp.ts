import type { Command } from "commander";
import { startMcpServer } from "../../mcp/server.js";
import type { Context } from "../context.js";

export function registerMcp(program: Command, context: () => Context): void {
  program
    .command("mcp")
    .description(
      "start an MCP server (stdio) with get_architecture, check, explain_violation, get_module_for_file",
    )
    .addHelpText(
      "after",
      "\nAdd it to Claude Code with:\n  claude mcp add archlock -- npx archlock mcp\nOther MCP clients: command `npx`, arguments `archlock mcp`, run in the repository root.",
    )
    .action(async () => {
      const ctx = context();
      await startMcpServer(ctx.cwd, ctx.configPath);
    });
}
