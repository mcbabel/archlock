import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { archlock, cleanupFixtures, copyFixture, edit, write } from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

function git(dir: string, ...args: string[]): string {
  return execFileSync(
    "git",
    ["-c", "user.email=test@example.com", "-c", "user.name=test", ...args],
    {
      cwd: dir,
      encoding: "utf8",
    },
  );
}

async function repoWithBase(): Promise<string> {
  const dir = copyFixture("ts-single");
  git(dir, "init", "-q", "-b", "main");
  await archlock(dir, "init", "--yes");
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "base");
  git(dir, "checkout", "-qb", "feature");
  return dir;
}

function demoChanges(dir: string): void {
  edit(
    dir,
    "src/billing/payments.ts",
    "payment: { ref: string })",
    "payment: { ref: string }, at: Date)",
  );
  mkdirSync(join(dir, "src/notifications"));
  write(
    dir,
    "src/notifications/index.ts",
    'import { emit } from "../events";\nexport function notify(user: string): void {\n  emit(user);\n}\nexport function mute(user: string): void {}\n',
  );
  edit(
    dir,
    "src/billing/payments.ts",
    /^/,
    'import { notify } from "../notifications";\nnotify("x");\n',
  );
  write(
    dir,
    "archlock/notifications.arch.py",
    '__module__ = "notifications"\n__paths__ = ["src/notifications/**"]\n__depends_on__ = ["events"]\n',
  );
}

describe("archlock diff", () => {
  it("reports architecture changes against the merge base, even without accept", async () => {
    const dir = await repoWithBase();
    demoChanges(dir);
    const r = await archlock(dir, "diff");
    expect(r.stderr).toBe("");
    expect(r.code).toBe(0);
    const lines = r.stdout.trim().split("\n");
    expect(lines[0]).toMatch(
      /^archlock: 3 architecture changes \(compared with main @ [0-9a-f]{7}\)$/,
    );
    expect(lines.slice(1, 4)).toEqual([
      "! billing           new dependency: notifications (not in __depends_on__)",
      "~ billing.markPaid  (id, payment) → (id, payment, at: Date)",
      "+ notifications     new module (2 public symbols; depends on events)",
    ]);
    expect(lines[4]).toMatch(/^\d+ lines of code changed → 3 lines of architecture$/);
  });

  it("renders Markdown with a sticky marker and JSON with schemaVersion", async () => {
    const dir = await repoWithBase();
    demoChanges(dir);
    const md = await archlock(dir, "diff", "--format", "markdown");
    expect(
      md.stdout.startsWith(
        "<!-- archlock:diff -->\n### archlock: 3 architecture changes\n\n```diff\n",
      ),
    ).toBe(true);
    expect(md.stdout).toContain("! billing.markPaid  (id, payment) → (id, payment, at: Date)");
    const json = JSON.parse((await archlock(dir, "--json", "diff")).stdout);
    expect(json).toMatchObject({ schemaVersion: 1, command: "diff", architectureLinesChanged: 3 });
    expect(json.changes.map((c: { kind: string }) => c.kind)).toEqual([
      "dependency_added",
      "symbol_changed",
      "module_added",
    ]);
    expect(json.codeLinesChanged).toBeGreaterThan(0);
  });

  it("says when nothing changed and honours --base", async () => {
    const dir = await repoWithBase();
    const none = await archlock(dir, "diff");
    expect(none.stdout).toContain("archlock: no architecture changes");
    edit(dir, "src/events/index.ts", /$/, "\nexport function off(): void {}\n");
    git(dir, "commit", "-qam", "add off");
    const vsHead = await archlock(dir, "diff", "--base", "HEAD");
    expect(vsHead.stdout).toContain("no architecture changes");
    const vsMain = await archlock(dir, "diff", "--base", "main");
    expect(vsMain.stdout).toContain("+ events.off  def off() -> void");
  });

  it("fails clearly outside git or with an unknown ref", async () => {
    const plain = copyFixture("ts-single");
    await archlock(plain, "init", "--yes");
    const r = await archlock(plain, "diff");
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("archlock diff needs git");
    const dir = await repoWithBase();
    const bad = await archlock(dir, "diff", "--base", "nope");
    expect(bad.code).toBe(2);
    expect(bad.stderr).toContain('unknown git ref "nope"');
  });
});
