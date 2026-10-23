<p align="center">
  <a href="https://archlock.mcbabel.de/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/mcbabel/archlock/main/site/brand/logo-dark.svg">
      <img src="https://raw.githubusercontent.com/mcbabel/archlock/main/site/brand/logo.svg" alt="archlock" width="320">
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/archlock"><img src="https://img.shields.io/npm/v/archlock" alt="npm version"></a>
  <a href="https://github.com/mcbabel/archlock/actions/workflows/ci.yml"><img src="https://github.com/mcbabel/archlock/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/mcbabel/archlock/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license: MIT"></a>
</p>

<p align="center"><strong>A lockfile for your architecture. You own the design, your agent writes the code.</strong><br>
<a href="https://archlock.mcbabel.de/">archlock.mcbabel.de</a></p>

![archlock demo: plan a module in the sketch, Claude Code implements and compiles it, check turns green, diff shows 3 lines of architecture](https://raw.githubusercontent.com/mcbabel/archlock/main/docs/demo.gif)

## Why

Coding agents write code faster than anyone can review it, and after a few weeks nobody
understands their own system anymore. A pull request with 3,000 changed lines is not reviewable,
but the few lines of architecture hidden in it are. archlock puts those lines in small files you
own and fails CI when the code drifts from them.

## Quickstart

```bash
npx archlock init      # one sketch per module in archlock/: files, dependencies, public API
npx archlock check     # in CI: fails when the code and the sketches disagree
npx archlock diff      # in review: what changed architecturally since main
```

No API key, no account, no server. `init` on [Hono](examples/real-world) turns
**25,971 lines of code into 1,790 lines of architecture (15×)** in 0.6 seconds on a desktop PC.

Languages: TypeScript and JavaScript, Vue, Svelte and Astro components, Python, Go and Rust, also mixed
([details](docs/COMMANDS.md#languages)).

## The two directions

Like a snapshot test: when the code and a sketch disagree, you decide which one is right.

| Command | Direction | Meaning |
|---|---|---|
| `archlock accept` | code → sketch | "This code change is intended. Update the sketch." |
| `archlock push` | sketch → code | "The sketch is the truth. Let my agent change the code." |

`archlock check` only tells you *that* and *where* they disagree. It needs neither git nor a model.

## A sketch

Valid Python syntax whatever your language; types stay in your language (`Promise[void]` is
`Promise<void>`). An excerpt of the sketch that plans a new module in the demo; `archlock push`
hands it to your agent:

```python
"""Notifications: tell customers what happened to their orders."""

__module__ = "notifications"
__paths__ = ["src/notifications/**"]
__entry__ = "src/notifications/index.ts"
__depends_on__ = ["customers", "events", "shared"]

class Notifier(Protocol):
    def send(self, message: Message) -> Promise[void]: ...

# must: send exactly one message per paid invoice
def registerNotifications(events: EventBus, customers: CustomerRepository, notifier: Notifier) -> '() => void': ...
```

Modules, allowed dependencies and public signatures are checked; comments like `# must:` are
kept but never fail CI. The full format: [docs/FORMAT.md](docs/FORMAT.md).

## In pull requests

`archlock diff` analyses the code of both commits, and the GitHub Action posts one comment that
is updated on every push. For the change in the demo above it reads:

> ### archlock: 3 architecture changes
>
> ```diff
> ! billing.markPaid  (deps, invoiceId, payment) → (deps, invoiceId, payment, paidAt: Date)
> + demo_shop         new dependency: notifications
> + notifications     new module (6 public symbols; depends on customers, events, shared)
> ```
>
> **85 lines of code changed → 3 lines of architecture**

```yaml
# .github/workflows/architecture.yml
on: pull_request
permissions:
  contents: read
  pull-requests: write
jobs:
  archlock:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v5
        with: { node-version: 22 }
      - uses: mcbabel/archlock@v0
        with: { mode: check }   # fails on drift, annotates the lines
      - uses: mcbabel/archlock@v0
        with: { mode: diff }    # one sticky PR comment
```

## With your coding agent

- `archlock push` gives your agent a precise work order and re-checks until the code matches; tested end to end with Claude Code, with Codex CLI and OpenCode supported but not yet battle-tested.
- `archlock init --agents` adds the rules to `AGENTS.md` and `CLAUDE.md`, and `archlock mcp` is an MCP server for reading the architecture and running the check.
- An agent skill ships in [`skills/archlock`](skills/archlock/SKILL.md). Everything else: [docs/AGENTS.md](docs/AGENTS.md).

## Real-world results

| Project | Modules | Lines of code → architecture | `check` |
|---|---|---|---|
| Hono (TypeScript) | 19 | 25,971 → 1,790 (15×) | 0 errors, 81 deep-import warnings |
| Zod (TypeScript), split into its layers by hand | 13 | 45,221 → 5,824 (7.8×) | 0 errors, 6 deep-import warnings |
| Flask (Python) | 3 | 7,563 → 542 (14×) | 0 errors, 14 warnings, cycle `flask → json → sansio` |
| shadcn-svelte (Svelte), docs app split by hand | 9 | 133,471 → 3,011 (44×) | 0 errors, 0 warnings |
| Gin (Go) | 7 | 6,785 → 630 (11×) | 0 errors, 0 warnings |
| ripgrep (Rust) | 10 | 43,627 → 886 (49×) | 0 errors, 0 warnings |

Sketches, findings and a reproducible script: [examples/real-world](examples/real-world).

## Documentation

- [Commands and configuration](docs/COMMANDS.md)
- [Sketch format](docs/FORMAT.md)
- [GitHub Action](docs/GITHUB_ACTION.md)
- [Coding agents](docs/AGENTS.md)
- [How it compares](docs/COMPARISON.md)
- [FAQ](docs/FAQ.md) and [known limitations](docs/LIMITATIONS.md)
- [Roadmap](docs/ROADMAP.md) and [design notes](docs/DESIGN.md)
- A full demo project: [examples/demo-shop](examples/demo-shop). archlock checks its own architecture too: [archlock/README.md](archlock/README.md).

Issues and pull requests are welcome; [CONTRIBUTING.md](CONTRIBUTING.md) explains the
architecture and how to add a language. Licensed under [MIT](LICENSE).
