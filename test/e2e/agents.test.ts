import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { archlock, cleanupFixtures, copyFixture, read, write } from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

const FAKE_AGENT = fileURLToPath(new URL("../helpers/fake-agent.mjs", import.meta.url));

describe("archlock init --agents", () => {
  it("creates AGENTS.md and CLAUDE.md with the archlock section", async () => {
    const dir = copyFixture("ts-single");
    expect((await archlock(dir, "init", "--yes", "--agents")).code).toBe(0);
    for (const file of ["AGENTS.md", "CLAUDE.md"]) {
      const text = read(dir, file);
      expect(text).toContain("## Architecture (archlock)");
      expect(text).toContain("Run `npx archlock check`");
      expect(text).toContain("do not run `archlock accept`");
    }
  });

  it("appends to existing files without touching their content, once", async () => {
    const dir = copyFixture("ts-single");
    write(dir, "CLAUDE.md", "# My project\n\nUse tabs.\n");
    await archlock(dir, "init", "--yes", "--agents");
    const once = read(dir, "CLAUDE.md");
    expect(once.startsWith("# My project\n\nUse tabs.\n\n<!-- archlock:agents -->")).toBe(true);
    await archlock(dir, "init", "--yes", "--agents", "--force");
    expect(read(dir, "CLAUDE.md")).toBe(once);
  });
});

describe("archlock init --with-summaries", () => {
  async function withAgent(rounds: unknown[][]): Promise<string> {
    const dir = copyFixture("ts-single");
    await archlock(dir, "init", "--yes");
    const plan = join(dir, ".fake-agent-plan.json");
    writeFileSync(plan, JSON.stringify({ rounds }));
    process.env.FAKE_AGENT_PLAN = plan;
    const config = JSON.parse(read(dir, "archlock.config.json"));
    config.agent.command = `node ${JSON.stringify(FAKE_AGENT)} {prompt_file}`;
    write(dir, "archlock.config.json", JSON.stringify(config, null, 2));
    return dir;
  }

  it("keeps added # suggested: lines", async () => {
    const dir = await withAgent([
      [
        {
          file: "archlock/events.arch.py",
          find: "__module__",
          replace: "# suggested: Publishes domain events.\n__module__",
        },
        {
          file: "archlock/events.arch.py",
          find: "def emit(",
          replace: "# suggested: invariant: handlers run in registration order\ndef emit(",
        },
      ],
    ]);
    const r = await archlock(dir, "init", "--yes", "--force", "--with-summaries");
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("suggested 2 lines");
    expect(read(dir, "archlock/events.arch.py")).toContain(
      "# suggested: Publishes domain events.\n__module__",
    );
    expect(existsSync(join(dir, ".archlock-cache/init/summaries.md"))).toBe(true);
    expect((await archlock(dir, "check")).code).toBe(0);
  });

  it("rolls back a sketch the agent changed beyond suggestions", async () => {
    const dir = await withAgent([
      [
        {
          file: "archlock/db.arch.py",
          find: "__depends_on__ = []",
          replace: '__depends_on__ = ["events"]',
        },
      ],
    ]);
    const before = read(dir, "archlock/db.arch.py");
    const r = await archlock(dir, "init", "--yes", "--force", "--with-summaries");
    expect(r.stdout).toContain("archlock/db.arch.py was restored");
    expect(read(dir, "archlock/db.arch.py")).toBe(before);
  });
});
