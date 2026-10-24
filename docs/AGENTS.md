# Using archlock with coding agents

archlock is built for teams where agents write most of the code and humans own the design.
There are four integration points; none of them needs an API key from archlock itself.

## 1. Instructions in AGENTS.md / CLAUDE.md

```bash
npx archlock init --agents
```

appends a short section to `AGENTS.md` and `CLAUDE.md` (creating them if needed, never changing
existing content): read the sketch first, stay within it, run `archlock check` before finishing,
and propose architecture changes instead of running `archlock accept`.

## 2. The agent skill

`skills/archlock/SKILL.md` in this repository is an Agent Skill with the
same rules in more detail (how to read a sketch, typical violations and fixes). Copy the
`skills/archlock` folder into your agent's skills directory (for Claude Code: `.claude/skills/`
in your repository, or `~/.claude/skills/` for all projects).

## 3. The MCP server

```bash
claude mcp add archlock -- npx archlock mcp
```

Other MCP clients: command `npx`, arguments `archlock mcp`, working directory = repository root.

| Tool | Input | Returns |
|---|---|---|
| `get_architecture` | `module?` | All sketches (plus the module graph), or one module's sketch. |
| `check` | `module?` | The `archlock check` report and the same data as JSON. |
| `explain_violation` | `rule`, `module?`, `symbol?` | What the violation means, how to fix it, and the current instance. |
| `get_module_for_file` | `path` | The file's module, its entry, allowed dependencies and external packages. |

The server never writes to the repository.

## 4. `archlock push`

Edit a sketch (plan a function, change a signature, add a module), then:

```bash
npx archlock push            # runs the agent it finds (asks first)
npx archlock push --agent claude
npx archlock push --print-prompt   # just the work order, for any agent
```

`push` writes a precise work order (`node_modules/.cache/archlock/push/round-N.md` or
`.archlock-cache/push/…`), starts the agent headless, runs `archlock check` afterwards and repeats
with what is left (up to `agent.maxRounds`, default 3). It never commits. Agents and their
invocations:

| Agent | Command archlock runs |
|---|---|
| Claude Code | `claude -p --permission-mode acceptEdits --allowedTools "Bash(<check>)" "Bash(<check> *)" ["Bash(<verify>)" "Bash(<verify> *)" …] -- "<instruction>"` |
| Codex CLI | `codex exec --sandbox workspace-write "<instruction>"` |
| OpenCode | `opencode run "<instruction>"` |
| anything else | `agent.command` in `archlock.config.json`, e.g. `"my-agent --task-file {prompt_file}"` |

Claude Code runs without a terminal, so it cannot ask before running a command: it may run the
archlock check and nothing else. To let it compile and test what it wrote, list those commands in
the config (the work order then asks the agent to run them too):

```json
"agent": { "default": "claude", "command": null, "maxRounds": 3, "verifyCommands": ["npm test", "npx tsc --noEmit"] }
```

Pick the type checker of your stack; `push` suggests one after a run without `verifyCommands`:

| Project | Typical `verifyCommands` |
|---|---|
| TypeScript | `npx tsc --noEmit` |
| Vue | `npx vue-tsc --noEmit` |
| Svelte / SvelteKit | `npx svelte-check` |
| Astro | `npx astro check` |
| Python | `python -m pytest` |
| Go | `go build ./...` (or `go vet ./...`) |
| Rust | `cargo check` |
| Java | `mvn -q compile` (Gradle: `./gradlew compileJava`) |

The work order also tells the agent how to read the sketches of the languages it touches, for
example that a Vue component's `on…` fields are events declared with `defineEmits`.

**Know what you allow.** Edits are accepted automatically, so a verify command that runs
project code (`npm test`, a build script) lets the agent run any code it writes into a test or a
script: the same trust you give it when you run its tests yourself. Without `verifyCommands`, the
agent can only edit files and run the archlock check, which never executes project code. Each
command must be one plain command (no `*`, `(`, `)`, `,`, `;`, `&`, `|`, `<`, `>`, `` ` ``, `$`);
it is allowed exactly and with extra arguments, and Claude Code refuses chained commands.

`claude -p` prints only its final summary, so a round can be silent for a few minutes; `push`
prints how long each round took. A typical run on `examples/demo-shop` (a new module with six
symbols plus a changed signature) takes one round of one to two minutes.

`archlock init --with-summaries` uses the same agent once to suggest module summaries and
invariants as `# suggested:` comments; any other change it makes to a sketch is rolled back.
