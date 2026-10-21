/** Where an import specifier points to. */
export type Resolution =
  /** A file inside the repository (repo-relative POSIX path; it may not exist, e.g. `./x.css`). */
  | { kind: "file"; path: string }
  /** A workspace package that could not be resolved to a file (no node_modules installed). */
  | { kind: "module"; module: string }
  /** A third-party package. */
  | { kind: "external"; package: string }
  /** A runtime built-in (`node:fs`, Python's `os`): never a dependency. */
  | { kind: "builtin" }
  | { kind: "unresolved" };

export interface Resolver {
  resolve(specifier: string, fromFile: string): Resolution;
}
