/**
 * File-hash cache (JSON values keyed by bucket, path and content hash).
 *
 * Location: `node_modules/.cache/archlock/` when the repository has a `node_modules` folder,
 * otherwise `.archlock-cache/`. The whole cache is invalidated when archlock itself changes,
 * so a cache can never change a result.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { VERSION } from "../core/version.js";

const CACHE_FORMAT = 2;

type Entry = { hash: string; value: unknown };

interface CacheData {
  build: string;
  buckets: Record<string, Record<string, Entry>>;
}

/** Identifies this exact archlock build (version + the bundle file that holds this code). */
function buildId(): string {
  let stamp = "";
  try {
    const st = statSync(fileURLToPath(import.meta.url));
    stamp = `${st.size}:${Math.floor(st.mtimeMs)}`;
  } catch {
    // Not on disk (unusual bundlers): the version alone has to do.
  }
  return `${CACHE_FORMAT}:${VERSION}:${stamp}`;
}

export function hashText(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}

export function cacheDir(root: string): string {
  return existsSync(join(root, "node_modules"))
    ? join(root, "node_modules", ".cache", "archlock")
    : join(root, ".archlock-cache");
}

export class ArchlockCache {
  private data: CacheData;
  private dirty = false;
  private readonly file: string;
  private readonly seen = new Map<string, Set<string>>();

  constructor(
    private readonly root: string,
    private readonly enabled = true,
  ) {
    this.file = join(cacheDir(root), "cache.json");
    const build = buildId();
    this.data = { build, buckets: {} };
    if (!enabled || !existsSync(this.file)) return;
    try {
      const loaded = JSON.parse(readFileSync(this.file, "utf8")) as CacheData;
      if (loaded.build === build && typeof loaded.buckets === "object") this.data = loaded;
    } catch {
      // A corrupt cache is simply rebuilt.
    }
  }

  private markSeen(bucket: string, path: string): void {
    const set = this.seen.get(bucket) ?? new Set();
    set.add(path);
    this.seen.set(bucket, set);
  }

  get<T>(bucket: string, path: string, hash: string): T | null {
    this.markSeen(bucket, path);
    const hit = this.enabled ? this.data.buckets[bucket]?.[path] : undefined;
    return hit && hit.hash === hash ? (hit.value as T) : null;
  }

  set(bucket: string, path: string, hash: string, value: unknown): void {
    this.markSeen(bucket, path);
    if (!this.enabled) return;
    this.data.buckets[bucket] ??= {};
    (this.data.buckets[bucket] as Record<string, Entry>)[path] = { hash, value };
    this.dirty = true;
  }

  /** Writes the cache atomically, dropping entries of files not seen in this run. */
  save(): void {
    if (!this.enabled) return;
    for (const [bucket, entries] of Object.entries(this.data.buckets)) {
      const seen = this.seen.get(bucket);
      if (!seen) continue;
      for (const path of Object.keys(entries)) {
        if (!seen.has(path)) {
          delete entries[path];
          this.dirty = true;
        }
      }
    }
    if (!this.dirty) return;
    try {
      mkdirSync(cacheDir(this.root), { recursive: true });
      const tmp = `${this.file}.${process.pid}.tmp`;
      writeFileSync(tmp, JSON.stringify(this.data));
      renameSync(tmp, this.file);
      this.dirty = false;
    } catch {
      // The cache is an optimization; failing to write it must never fail a command.
    }
  }
}
