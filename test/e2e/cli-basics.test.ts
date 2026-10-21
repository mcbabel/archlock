import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runCli } from "../helpers/cli.js";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  version: string;
};

describe("archlock CLI basics", () => {
  it("prints the version", () => {
    const result = runCli(["--version"]);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  it("prints help with the global options", () => {
    const result = runCli(["--help"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("A lockfile for your architecture");
    for (const option of ["--cwd", "--config", "--json", "--no-color", "--quiet"]) {
      expect(result.stdout).toContain(option);
    }
  });

  it("prints help when started without arguments", () => {
    const result = runCli([]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Usage: archlock");
  });

  it("fails with a helpful message on an unknown command", () => {
    const result = runCli(["frobnicate"]);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("archlock --help");
  });
});

describe("archlock CLI exit codes", () => {
  it("exits 2 with a helpful message when not initialized", async () => {
    const { mkdtempSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "archlock-empty-"));
    const result = runCli(["check"], { cwd: dir });
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("Run `archlock init` first");
  });
});

describe("archlock CLI and pipes", () => {
  // Writes 1,500 files and checks them: slow on Windows runners, hence its own timeout.
  it("does not crash when the reader closes the pipe early", async () => {
    const { spawnSync } = await import("node:child_process");
    const { mkdirSync, mkdtempSync, writeFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const { CLI_PATH } = await import("../helpers/cli.js");
    // Enough unassigned files that `--json check` writes far more than a pipe buffer.
    const dir = mkdtempSync(join(tmpdir(), "archlock-pipe-"));
    mkdirSync(join(dir, "src", "a"), { recursive: true });
    writeFileSync(join(dir, "src", "a", "index.ts"), "export const a = 1;\n");
    runCli(["init", "--yes"], { cwd: dir });
    // Files created after init belong to no module.
    mkdirSync(join(dir, "src", "loose"), { recursive: true });
    for (let i = 0; i < 1500; i++)
      writeFileSync(join(dir, "src", "loose", `f${i}.ts`), "export const x = 1;\n");
    const script = `node "${CLI_PATH}" --json check | node -e "process.stdin.once('data', () => process.exit(0))"`;
    const result = spawnSync(
      process.platform === "win32" ? "cmd" : "sh",
      process.platform === "win32" ? ["/c", script] : ["-c", script],
      {
        cwd: dir,
        encoding: "utf8",
      },
    );
    expect(result.stderr).not.toContain("EPIPE");
    expect(result.stderr).not.toContain("Unhandled");
  }, 120_000);
});
