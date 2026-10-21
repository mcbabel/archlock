# Known limitations

archlock is young. This is the honest list of what it does not do (yet).

- **Syntactic extraction only.** Without annotations, types are `'<inferred>'` (4–7% of type positions in the [real-world examples](../examples/real-world)). A `--typed` mode using the TypeScript type checker is planned, not built.
- **`push` is tested end to end with Claude Code only.** Codex CLI and OpenCode use flags checked against their `--help`, but have not been run end to end. Every real run so far finished in one round; more rounds are covered by tests with a scripted agent.
- **Module detection is a starting point.** One large package (Zod) becomes one big module until you split it with `__paths__` (the Zod example shows this). Python projects without a single top-level package fall back to top-level folders.
- **TypeScript gaps:** CommonJS `module.exports` is not treated as an export; re-exports of third-party packages are not listed; computed member names and `protected` members are not part of the sketch; names that need mangling (`$`) can collide.
- **Python gaps:** dataclass field order (constructor order) is not checked; dynamic exports (`__getattr__`, `globals()`) are invisible; with conditional definitions the first one wins.
- **Comments of renamed symbols are not carried over.** `accept` reports them as lost; it never drops them silently.
- **Very large types** appear as long quoted strings unless the project opts into [`maxTypeLength`](FORMAT.md#very-long-types-opt-in). Type parameters and bases are never abbreviated, and an abbreviated type cannot be planned through `push` (the agent only sees its hash), so a planned change to it must be written out in full.
- **No edges across languages** in mixed repositories: a TypeScript app calling a Python API over HTTP is not an import.
- **Cold runs on large repositories** take a few seconds: 2.8 s for `check` on 93,000 lines without cache, 1.2 s with it. The cache file is about 14 MB at that size.
- **Install size:** the official MCP SDK brings HTTP-server dependencies archlock does not use (about 108 packages in total, pure JavaScript, about 4 s to install).
- **Windows:** CI is green, but custom `agent.command` templates with complex quoting may behave differently in `cmd.exe`.
