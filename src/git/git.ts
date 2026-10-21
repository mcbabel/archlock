/** Thin, synchronous git helpers. archlock only reads from git and never commits. */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

export class GitError extends Error {}

export function git(cwd: string, args: string[]): string {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 256 * 1024 * 1024,
    }).trimEnd();
  } catch (e) {
    const err = e as { stderr?: string; code?: string; message: string };
    if (err.code === "ENOENT") throw new GitError("git is not installed or not on PATH");
    const stderr = (err.stderr ?? "").toString().trim();
    throw new GitError(`git ${args.join(" ")} failed${stderr ? `: ${stderr.split("\n")[0]}` : ""}`);
  }
}

function tryGit(cwd: string, args: string[]): string | null {
  try {
    return git(cwd, args);
  } catch {
    return null;
  }
}

export function gitToplevel(cwd: string): string {
  const top = tryGit(cwd, ["rev-parse", "--show-toplevel"]);
  if (top === null) throw new GitError(`${cwd} is not inside a git repository`);
  return top;
}

export interface BaseRef {
  /** What the user (or the default) asked for, e.g. `origin/main`. */
  ref: string;
  /** The commit actually compared against (the merge base when one exists). */
  sha: string;
  mergeBase: boolean;
}

/**
 * The commit to compare with: `--base`, else the merge base of HEAD with the PR base branch
 * (`GITHUB_BASE_REF`), `origin/main`, `origin/master`, `main` or `master`.
 */
export function resolveBase(cwd: string, explicit?: string): BaseRef {
  const candidates = explicit
    ? [explicit]
    : [
        ...(process.env.GITHUB_BASE_REF ? [`origin/${process.env.GITHUB_BASE_REF}`] : []),
        "origin/main",
        "origin/master",
        "main",
        "master",
      ];
  for (const ref of candidates) {
    const sha = tryGit(cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    if (!sha) continue;
    const mb = tryGit(cwd, ["merge-base", "HEAD", sha]);
    return { ref, sha: mb ?? sha, mergeBase: mb !== null };
  }
  if (explicit) throw new GitError(`unknown git ref "${explicit}"`);
  throw new GitError(
    "could not find a base to compare with (tried origin/main, origin/master, main, master). Pass one with --base <ref>.",
  );
}

/**
 * Checks out `sha` in a temporary worktree and runs `fn` with the directory that corresponds
 * to `cwd` inside it. The worktree is always removed afterwards.
 */
export async function withWorktree<T>(
  cwd: string,
  sha: string,
  fn: (dir: string) => Promise<T> | T,
): Promise<T> {
  const top = gitToplevel(cwd);
  const tmp = mkdtempSync(join(tmpdir(), "archlock-base-"));
  const dir = join(tmp, "tree");
  git(top, ["worktree", "add", "--detach", "--quiet", dir, sha]);
  try {
    return await fn(join(dir, relative(top, cwd)));
  } finally {
    tryGit(top, ["worktree", "remove", "--force", dir]);
    rmSync(tmp, { recursive: true, force: true });
    tryGit(top, ["worktree", "prune"]);
  }
}

/**
 * Lines added + removed between `sha` and the working tree, per file (paths relative to `cwd`,
 * POSIX). Untracked files count with all their lines.
 */
export function changedLines(cwd: string, sha: string): Map<string, number> {
  const out = new Map<string, number>();
  const numstat = git(cwd, ["diff", "--numstat", "--relative", "--no-renames", sha, "--", "."]);
  for (const line of numstat.split("\n")) {
    const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(line);
    if (!m) continue;
    const n = (m[1] === "-" ? 0 : Number(m[1])) + (m[2] === "-" ? 0 : Number(m[2]));
    out.set(m[3] as string, n);
  }
  const untracked = git(cwd, ["ls-files", "--others", "--exclude-standard", "--", "."]);
  for (const file of untracked.split("\n")) {
    if (file) out.set(file, -1); // caller counts the lines of untracked files
  }
  return out;
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/**
 * Uncommitted changes outside `exceptDirs` (POSIX, relative to `cwd`), or null when `cwd` is not
 * in a git repository.
 */
export function uncommittedChanges(cwd: string, exceptDirs: string[]): string[] | null {
  const out = tryGit(cwd, ["status", "--porcelain", "--untracked-files=normal", "--", "."]);
  if (out === null) return null;
  const prefixes = exceptDirs.map((d) => `${d.replace(/\/+$/, "")}/`);
  const top = gitToplevel(cwd);
  const rel = relative(top, cwd).split("\\").join("/");
  return out
    .split("\n")
    .filter(Boolean)
    .map((l) => l.slice(3).replace(/^"|"$/g, ""))
    .map((p) => (rel && p.startsWith(`${rel}/`) ? p.slice(rel.length + 1) : p))
    .filter((p) => !prefixes.some((prefix) => p.startsWith(prefix)));
}
