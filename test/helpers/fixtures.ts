import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "../../src/cli/program.js";

export const FIXTURES = fileURLToPath(new URL("../fixtures/", import.meta.url));

const created: string[] = [];

/** Copies a fixture into a fresh temp directory and returns its path. */
export function copyFixture(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), `archlock-${name}-`));
  cpSync(join(FIXTURES, name), dir, { recursive: true });
  created.push(dir);
  return dir;
}

export function cleanupFixtures(): void {
  for (const dir of created.splice(0)) rmSync(dir, { recursive: true, force: true });
}

export interface InProcessResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** Runs the CLI in-process (fast) with `--cwd dir`. */
export async function archlock(dir: string, ...args: string[]): Promise<InProcessResult> {
  let stdout = "";
  let stderr = "";
  const code = await run(["node", "archlock", "--cwd", dir, "--no-color", ...args], {
    stdout: (t) => {
      stdout += t;
    },
    stderr: (t) => {
      stderr += t;
    },
  });
  return { code, stdout, stderr };
}

export async function checkJson(dir: string): Promise<{
  code: number;
  summary: { errors: number; warnings: number; infos: number };
  violations: {
    rule: string;
    severity: string;
    module: string | null;
    symbol?: string;
    message: string;
  }[];
}> {
  const r = await archlock(dir, "--json", "check");
  if (r.stderr) throw new Error(r.stderr);
  return { code: r.code, ...JSON.parse(r.stdout) };
}

export function read(dir: string, file: string): string {
  return readFileSync(join(dir, file), "utf8");
}

export function write(dir: string, file: string, text: string): void {
  writeFileSync(join(dir, file), text);
}

export function edit(dir: string, file: string, from: string | RegExp, to: string): void {
  const before = read(dir, file);
  const after = before.replace(from, to);
  if (after === before) throw new Error(`edit did not change ${file}: ${String(from)}`);
  write(dir, file, after);
}

/** All files under `sub` (sorted, relative) with their contents. */
export function snapshotDir(dir: string, sub: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of readdirSync(join(dir, sub)).sort()) out[f] = read(dir, join(sub, f));
  return out;
}
