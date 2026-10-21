import { describe, expect, it } from "vitest";
import { ADAPTERS } from "../../src/agents/adapters.js";

describe("agent adapters", () => {
  it("claude may run the check command and the configured verify commands, nothing else", () => {
    // `Bash(cmd)` + `Bash(cmd *)`: a word boundary. Verified with Claude Code 2.1.299:
    // `Bash(node ok.mjs*)` also allowed `node ok.mjs.bak`; this form refuses it.
    const inv = ADAPTERS.claude.invocation(".archlock-cache/push/round-1.md", [
      "npx archlock check",
      "npm test",
    ]);
    expect(inv.args.slice(0, 6)).toEqual([
      "-p",
      "--permission-mode",
      "acceptEdits",
      "--allowedTools",
      "Bash(npx archlock check)",
      "Bash(npx archlock check *)",
    ]);
    expect(inv.args.slice(6, 8)).toEqual(["Bash(npm test)", "Bash(npm test *)"]);
    expect(inv.args.at(-2)).toBe("--");
    expect(inv.args.at(-1)).toContain(".archlock-cache/push/round-1.md");
  });
});
