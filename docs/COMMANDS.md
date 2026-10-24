# Commands

| Command | What it does |
|---|---|
| `archlock init` | Detects modules (Go packages, Rust crates and modules, Java source roots and packages, workspaces, `src/` folders, Python packages), writes `archlock.config.json`, one sketch per module and `archlock/README.md` with a Mermaid graph. `--agents` adds a section to `AGENTS.md`/`CLAUDE.md`, `--with-summaries` asks your agent for docstring suggestions, `--force` starts over. |
| `archlock check` | Compares code and sketches. `--format human\|json\|github`. Exit 1 on errors. |
| `archlock accept [module…]` | Adopts code changes into the sketches, keeping comments. Shows a diff and asks first. `--deps-only`, `--symbols-only`, `--yes`. |
| `archlock push` | Lets your agent change the code to match the sketches, round by round. `--agent`, `--print-prompt`, `--max-rounds`, `--check-command`, `--yes`. Tested end to end with Claude Code; see [AGENTS.md](AGENTS.md). |
| `archlock diff` | Architecture changes since the merge base. `--base <ref>`, `--format terminal\|markdown\|json`. |
| `archlock stats` | Compression ratio, modules, symbols, edges, share of unannotated types, cycles. `--badge`. The ratio is shown from 300 lines of code and only when the sketches are shorter than the code; otherwise a short note takes its place. |
| `archlock graph` | The module graph as Mermaid. |
| `archlock mcp` | MCP server over stdio (`get_architecture`, `check`, `explain_violation`, `get_module_for_file`). |

Global options: `--cwd`, `--config`, `--json` (versioned with `schemaVersion`), `--no-color`,
`--quiet`, `--no-cache`. Exit codes: 0 success, 1 violations (or remaining issues after `push`),
2 usage or configuration errors.

## Configuration

`archlock.config.json` ([schema](../schema.json)) sets the sketch folder, languages, include and
exclude globs, the severity of every violation type, the opt-in `maxTypeLength`
([FORMAT.md](FORMAT.md#very-long-types-opt-in)) and the agent settings (`agent.default`,
`agent.command`, `agent.maxRounds`, `agent.verifyCommands`; see [AGENTS.md](AGENTS.md)).

## Languages

**TypeScript/JavaScript** (`.ts .tsx .mts .cts .js .jsx .mjs .cjs`, tsconfig `paths`,
pnpm/npm/yarn workspaces), **Vue, Svelte and Astro components** (`.vue .svelte .astro`: their
scripts are read as TypeScript, props and events are the component's signature; see
[FORMAT.md](FORMAT.md#mapping-from-components-vue-svelte-astro)) and **Python** (src and flat
layouts, `__all__`, dataclasses, Protocols, Enums) and **Go** (`.go`: one module per package,
`go.mod` module paths including nested modules and local `replace`s; see
[FORMAT.md](FORMAT.md#mapping-from-go)) and **Rust** (`.rs`: Cargo workspaces, crates and top-level
modules, `pub use` re-exports, `impl` blocks; see [FORMAT.md](FORMAT.md#mapping-from-rust)) and
**Java** (`.java`: Maven and Gradle source roots and packages, records, enums, sealed types; see
[FORMAT.md](FORMAT.md#mapping-from-java)), also mixed in one repository. Adding a language:
[CONTRIBUTING.md](../CONTRIBUTING.md#adding-a-language).
