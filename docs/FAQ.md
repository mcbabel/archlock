# FAQ

**Does it need an API key?** No. `init`, `check`, `accept`, `diff`, `stats`, `graph` and `mcp`
are deterministic and offline: same input, byte-identical output, no model, no network. Only
`push` (and the optional `init --with-summaries`) start *your* coding agent.

**Which agents?** `push` is tested end to end with Claude Code (on the demo: one round of one to
two minutes, and the agent compiles its own code through `agent.verifyCommands`). Codex CLI and
OpenCode are supported (flags checked against their `--help`) but not yet battle-tested. Any
other agent works through `agent.command`, or paste the output of `archlock push --print-prompt`.
Details: [AGENTS.md](AGENTS.md).

**Which languages?** TypeScript/JavaScript (including Vue, Svelte and Astro components), Python,
Go and Rust, also mixed. See
[COMMANDS.md](COMMANDS.md#languages).

**Does it send data anywhere?** No telemetry, no service. See [SECURITY.md](../SECURITY.md).

**How fast is it?** About 2.8 s for `check` on a 93k-line repository without cache, 1.2 s with
the file-hash cache. `init` on Hono takes 0.6 s on a desktop PC.

**My project has no type annotations.** archlock writes `'<inferred>'` for missing annotations
and `archlock stats` shows their share. Names, kinds, parameters and dependencies are still
checked.

**Big repository, too strict to start?** Set `__strictness__ = "names"` (names and kinds only)
or `"deps"` (dependencies only) per module, and tighten later. Severities are configurable.

**The detected modules are wrong.** They are a starting point. Edit `__paths__`, or add a
header-only sketch for a new module and run `archlock accept`
([FORMAT.md](FORMAT.md#adding-a-module)). The Zod example in
[examples/real-world](../examples/real-world) was split this way.

**Why Python syntax for TypeScript projects?** One format for every language, syntax
highlighting everywhere, and it is the notation LLMs read best. Types are never translated.

**Does it rewrite my code?** Only `push` changes code, through your agent, and never commits.

**What does it not do yet?** Extraction is syntactic (no type checker yet), there are no edges
across languages, and `push` has only needed one round with a real agent so far. The full,
honest list is in [LIMITATIONS.md](LIMITATIONS.md).
