import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { globMatcher } from "../fs/paths.js";

export interface WorkspacePackage {
  /** Repo-relative POSIX directory. */
  dir: string;
  name: string;
}

/** Workspace globs from pnpm-workspace.yaml or package.json `workspaces`. */
export function workspacePatterns(root: string): string[] {
  const pnpm = join(root, "pnpm-workspace.yaml");
  if (existsSync(pnpm)) return parsePnpmWorkspace(readFileSync(pnpm, "utf8"));
  const pkgFile = join(root, "package.json");
  if (!existsSync(pkgFile)) return [];
  try {
    const pkg = JSON.parse(readFileSync(pkgFile, "utf8")) as {
      workspaces?: string[] | { packages?: string[] };
    };
    const ws = Array.isArray(pkg.workspaces) ? pkg.workspaces : (pkg.workspaces?.packages ?? []);
    return ws.filter((w): w is string => typeof w === "string");
  } catch {
    return [];
  }
}

/** Minimal reader for the `packages:` list of pnpm-workspace.yaml (no YAML dependency needed). */
export function parsePnpmWorkspace(text: string): string[] {
  const out: string[] = [];
  let inPackages = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "");
    if (/^\S/.test(line)) {
      inPackages = /^packages\s*:/.test(line);
      const inline = /^packages\s*:\s*\[(.*)\]/.exec(line);
      if (inline) {
        for (const item of (inline[1] as string).split(",")) {
          const v = item.trim().replace(/^['"]|['"]$/g, "");
          if (v) out.push(v);
        }
        inPackages = false;
      }
      continue;
    }
    const item = /^\s+-\s*(.+?)\s*$/.exec(line);
    if (inPackages && item) out.push((item[1] as string).replace(/^['"]|['"]$/g, ""));
  }
  return out;
}

/** Lists workspace packages (directories with a package.json matching the workspace globs). */
export function readWorkspacePackages(root: string): WorkspacePackage[] {
  const patterns = workspacePatterns(root).map((p) => p.replace(/^\.\//, "").replace(/\/+$/, ""));
  if (patterns.length === 0) return [];
  const match = globMatcher(patterns);
  const out: WorkspacePackage[] = [];
  const walk = (abs: string, dir: string, depth: number) => {
    if (depth > 4) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name === "node_modules" || e.name.startsWith(".")) continue;
      const rel = dir === "" ? e.name : `${dir}/${e.name}`;
      const pkgFile = join(abs, e.name, "package.json");
      if (match(rel) && existsSync(pkgFile)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgFile, "utf8")) as { name?: string };
          out.push({ dir: rel, name: typeof pkg.name === "string" ? pkg.name : e.name });
        } catch {
          out.push({ dir: rel, name: e.name });
        }
      }
      walk(join(abs, e.name), rel, depth + 1);
    }
  };
  walk(root, "", 0);
  return out.sort((a, b) => (a.dir < b.dir ? -1 : a.dir > b.dir ? 1 : 0));
}
