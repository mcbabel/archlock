import { relative, sep } from "node:path";
import picomatch from "picomatch";

/** Repo-relative POSIX path (archlock never writes OS-specific paths). */
export function toPosix(path: string): string {
  return sep === "\\" ? path.replace(/\\/g, "/") : path;
}

export function relPosix(root: string, abs: string): string {
  return toPosix(relative(root, abs));
}

export type Matcher = (path: string) => boolean;

/** Compiles globs; patterns starting with `!` exclude. An empty list matches nothing. */
export function globMatcher(patterns: string[]): Matcher {
  const positive = patterns.filter((p) => !p.startsWith("!"));
  const negative = patterns.filter((p) => p.startsWith("!")).map((p) => p.slice(1));
  if (positive.length === 0) return () => false;
  const pos = picomatch(positive, { dot: true });
  const neg = negative.length > 0 ? picomatch(negative, { dot: true }) : () => false;
  return (path) => pos(path) && !neg(path);
}

/** The static directory prefix of a glob: `src/billing/**` → `src/billing`. */
export function globBase(pattern: string): string {
  const base = picomatch.scan(pattern).base;
  return base === "." ? "" : base;
}
