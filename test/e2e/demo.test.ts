import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { archlock, checkJson } from "../helpers/fixtures.js";

const DEMO = fileURLToPath(new URL("../../examples/demo-shop/", import.meta.url));
const dirs: string[] = [];
afterAll(() => {
  // Windows can keep files of a just-finished git process locked for a moment (EBUSY).
  for (const d of dirs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
});

function git(dir: string, ...args: string[]): void {
  execFileSync("git", ["-c", "user.email=demo@example.com", "-c", "user.name=demo", ...args], {
    cwd: dir,
  });
}

function node(dir: string, script: string): void {
  execFileSync(process.execPath, [script], { cwd: dir });
}

describe("the demo chain (examples/demo-shop): init → edit sketch → push → check → diff", () => {
  // The whole demo chain (init, push, check, diff with a git worktree): slow on Windows runners.
  it("works end to end with the recorded agent run", async () => {
    const dir = join(mkdtempSync(join(tmpdir(), "archlock-demo-")), "demo-shop");
    dirs.push(dir);
    cpSync(DEMO, dir, {
      recursive: true,
      filter: (src) => !/[\\/](archlock|archlock\.config\.json|\.archlock-cache)$/.test(src),
    });
    git(dir, "init", "-q", "-b", "main");
    git(dir, "add", "-A");
    git(dir, "commit", "-qm", "demo-shop");

    expect((await archlock(dir, "init", "--yes")).code).toBe(0);
    node(dir, ".demo/use-replay-agent.mjs");
    git(dir, "add", "-A");
    git(dir, "commit", "-qm", "archlock init");
    git(dir, "checkout", "-qb", "feature");

    node(dir, ".demo/edit-sketch.mjs");
    const planned = await checkJson(dir);
    expect(planned.summary.errors).toBe(7);

    const push = JSON.parse((await archlock(dir, "--json", "push", "--agent", "custom")).stdout);
    expect(push).toMatchObject({ rounds: 1, remaining: [], sketchesModified: [] });
    expect(push.fixed).toHaveLength(7);

    const after = await checkJson(dir);
    expect(after.summary).toEqual({ errors: 0, warnings: 0, infos: 0 });

    const diff = await archlock(dir, "diff");
    const lines = diff.stdout.trim().split("\n");
    expect(lines.slice(1, 4)).toEqual([
      "~ billing.markPaid  (deps, invoiceId, payment) → (deps, invoiceId, payment, paidAt: Date)",
      "+ demo_shop         new dependency: notifications",
      "+ notifications     new module (6 public symbols; depends on customers, events, shared)",
    ]);
    expect(lines[4]).toMatch(/^\d+ lines of code changed → 3 lines of architecture$/);
  }, 120_000);

  it("the committed sketches match the committed demo code", async () => {
    expect((await checkJson(DEMO)).summary).toEqual({ errors: 0, warnings: 0, infos: 0 });
  });
});
