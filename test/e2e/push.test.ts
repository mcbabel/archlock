import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  archlock,
  checkJson,
  cleanupFixtures,
  copyFixture,
  edit,
  read,
  write,
} from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

const FAKE_AGENT = fileURLToPath(new URL("../helpers/fake-agent.mjs", import.meta.url));

/** ts-single with a planned function and a changed signature in the billing sketch. */
async function plannedChange(): Promise<string> {
  const dir = copyFixture("ts-single");
  await archlock(dir, "init", "--yes");
  edit(
    dir,
    "archlock/billing.arch.py",
    "async def markPaid(id: string, payment: '{ ref: string }') -> Promise[Invoice]: ...",
    "async def markPaid(id: string, payment: '{ ref: string }', at: Date) -> Promise[Invoice]: ...\ndef refund(id: string) -> void: ...",
  );
  return dir;
}

function useFakeAgent(dir: string, rounds: unknown[][]): void {
  const plan = join(dir, ".fake-agent-plan.json");
  writeFileSync(plan, JSON.stringify({ rounds }));
  const config = JSON.parse(read(dir, "archlock.config.json"));
  config.agent.command = `node ${JSON.stringify(FAKE_AGENT)} {prompt_file}`;
  write(dir, "archlock.config.json", JSON.stringify(config, null, 2));
  process.env.FAKE_AGENT_PLAN = plan;
}

const ROUND_SIGNATURE = [
  {
    file: "src/billing/payments.ts",
    find: "payment: { ref: string })",
    replace: "payment: { ref: string }, at: Date)",
  },
];
const ROUND_REFUND = [
  {
    file: "src/billing/payments.ts",
    find: "export function internalHelper",
    replace: "export function refund(id: string): void {}\n\nexport function internalHelper",
  },
  {
    file: "src/billing/index.ts",
    find: "export { markPaid }",
    replace: "export { markPaid, refund }",
  },
];

function git(dir: string, ...args: string[]): void {
  execFileSync("git", ["-c", "user.email=t@example.com", "-c", "user.name=t", ...args], {
    cwd: dir,
  });
}

describe("archlock push", () => {
  it("--print-prompt prints the work order and changes nothing", async () => {
    const dir = await plannedChange();
    const before = read(dir, "src/billing/payments.ts");
    const r = await archlock(dir, "push", "--print-prompt", "--check-command", "archlock check");
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("### 1. billing: implement `refund` (new)");
    expect(r.stdout).toContain("### 2. billing: change `markPaid`");
    expect(r.stdout).toContain("run `archlock check` and iterate");
    expect(read(dir, "src/billing/payments.ts")).toBe(before);
  });

  it("runs the agent round by round until check is green", async () => {
    const dir = await plannedChange();
    useFakeAgent(dir, [ROUND_SIGNATURE, ROUND_REFUND]);
    const r = await archlock(dir, "--json", "push", "--agent", "custom");
    expect(r.stderr).toBe("");
    const out = JSON.parse(r.stdout);
    expect(out).toMatchObject({
      command: "push",
      agent: "custom",
      rounds: 2,
      remaining: [],
      sketchesModified: [],
    });
    expect(out.fixed.map((v: { rule: string; symbol: string }) => `${v.rule}:${v.symbol}`)).toEqual(
      ["planned_not_implemented:refund", "signature_changed:markPaid"],
    );
    expect(r.code).toBe(0);
    expect((await checkJson(dir)).summary.errors).toBe(0);
    const log = readFileSync(join(dir, ".fake-agent-log"), "utf8");
    const round2 = log.split("--- round 2 ---")[1] ?? "";
    expect(round2).toContain("This is round 2 of 3");
    expect(round2).toContain("implement `refund`");
    expect(round2).not.toContain("change `markPaid`");
  });

  it("stops after --max-rounds and reports what is left", async () => {
    const dir = await plannedChange();
    useFakeAgent(dir, [ROUND_SIGNATURE, ROUND_REFUND]);
    const r = await archlock(dir, "--json", "push", "--agent", "custom", "--max-rounds", "1");
    const out = JSON.parse(r.stdout);
    expect(out.rounds).toBe(1);
    expect(out.remaining.map((v: { symbol: string }) => v.symbol)).toEqual(["refund"]);
    expect(r.code).toBe(1);
  });

  it("warns when the agent edits a sketch", async () => {
    const dir = await plannedChange();
    useFakeAgent(dir, [
      [
        ...ROUND_SIGNATURE,
        ...ROUND_REFUND,
        {
          file: "archlock/db.arch.py",
          find: "__depends_on__ = []",
          replace: "__depends_on__ = []  # touched",
        },
      ],
    ]);
    const out = JSON.parse((await archlock(dir, "--json", "push", "--agent", "custom")).stdout);
    expect(out.sketchesModified).toEqual(["archlock/db.arch.py"]);
  });

  it("does nothing when the code already matches", async () => {
    const dir = copyFixture("ts-single");
    await archlock(dir, "init", "--yes");
    const r = await archlock(dir, "push");
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("Nothing to push");
  });

  it("needs consent before starting an agent without a terminal", async () => {
    const dir = await plannedChange();
    useFakeAgent(dir, [ROUND_SIGNATURE]);
    const r = await archlock(dir, "push");
    expect(r.code).toBe(1);
    expect(r.stderr).toContain("Pass --yes (or --agent custom) to start it");
    expect(read(dir, "src/billing/payments.ts")).not.toContain("at: Date");
  });

  it("refuses a check command that would widen the agent's permissions", async () => {
    const dir = await plannedChange();
    const r = await archlock(
      dir,
      "push",
      "--agent",
      "custom",
      "--check-command",
      "archlock check; rm -rf .",
    );
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("cannot be allowed for the agent");
  });

  it("rejects unknown agents and custom without a command", async () => {
    const dir = await plannedChange();
    expect((await archlock(dir, "push", "--agent", "gpt")).stderr).toContain(
      'unknown --agent "gpt"',
    );
    expect((await archlock(dir, "push", "--agent", "custom")).stderr).toContain(
      'needs "agent.command"',
    );
  });

  it("introduces a new module once, points at unused dependencies, lists verify commands", async () => {
    const dir = copyFixture("ts-single");
    await archlock(dir, "init", "--yes");
    write(
      dir,
      "archlock/notifications.arch.py",
      '__module__ = "notifications"\n__paths__ = ["src/notifications/**"]\n__entry__ = "src/notifications/index.ts"\n__depends_on__ = ["events"]\n\ndef notify(to: string) -> void: ...\ndef unsubscribe(to: string) -> void: ...\n',
    );
    edit(dir, "archlock/shop.arch.py", '["billing", "db"]', '["billing", "db", "notifications"]');
    const config = JSON.parse(read(dir, "archlock.config.json"));
    config.agent.verifyCommands = ["npm test"];
    write(dir, "archlock.config.json", JSON.stringify(config, null, 2));

    const r = await archlock(dir, "push", "--print-prompt", "--check-command", "archlock check");
    expect(r.stdout.match(/has no code yet/g)).toHaveLength(1);
    expect(r.stdout).toContain("The other new symbols of `notifications` below belong there too.");
    expect(r.stdout).toContain("## Dependencies declared but not used yet");
    expect(r.stdout).toContain(
      "- `shop` may import `notifications` (archlock/shop.arch.py:3) but does not yet.",
    );
    expect(r.stdout).toContain("- Also run `npm test` and fix what they report.");
    // The note is context, not a work item.
    expect(r.stdout).not.toMatch(/### \d+\. shop/);
  });

  it("reports progress and results in words, and ignores its own cache in the dirty-tree warning", async () => {
    // init before `git init`: nothing ignores .archlock-cache/, so it is committed and then
    // changes during the run, like in a repository whose .gitignore does not list it.
    const dir = await plannedChange();
    useFakeAgent(dir, [[...ROUND_SIGNATURE, ...ROUND_REFUND]]);
    git(dir, "init", "-q");
    git(dir, "add", "-A");
    git(dir, "commit", "-qm", "planned");
    // check cannot know which side changed, so its hint names both directions neutrally.
    expect((await archlock(dir, "check")).stdout).toContain(
      "run `archlock accept billing` to keep the code's version, or `archlock push` to make the code match the sketch",
    );
    const r = await archlock(dir, "push", "--agent", "custom");
    expect(r.code).toBe(0);
    expect(r.stderr).not.toContain("uncommitted changes");
    expect(r.stderr).toContain("archlock push: round 1/3: custom works on 2 changes");
    expect(r.stderr).toMatch(/Round 1 took \d+s\. Checking again/);
    expect(r.stdout).toContain("✔ done  billing.refund: implemented");
    expect(r.stdout).toContain("✔ done  billing.markPaid: signature now matches the sketch");
    expect(r.stdout).not.toContain("is in the sketch but not in the code");
    // Headless agents get an empty stdin, also when archlock's own output goes to a terminal.
    expect(read(dir, ".fake-agent-stdin")).toBe("0\n");
  });

  it("still warns about the user's own uncommitted changes", async () => {
    const dir = await plannedChange();
    useFakeAgent(dir, [[...ROUND_SIGNATURE, ...ROUND_REFUND]]);
    git(dir, "init", "-q");
    git(dir, "add", "-A");
    git(dir, "commit", "-qm", "planned");
    edit(dir, "src/main.ts", /$/, "\n// wip\n");
    const r = await archlock(dir, "push", "--agent", "custom");
    expect(r.stderr).toContain(
      "1 file has uncommitted changes outside archlock/ (e.g. src/main.ts)",
    );
  });
});
