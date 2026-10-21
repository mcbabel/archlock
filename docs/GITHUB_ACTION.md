# archlock in GitHub Actions

archlock ships a composite action (`action.yml` in this repository). It runs `npx archlock`, so
there is nothing to install and nothing to host: everything runs in your workflow, and the only
credential it uses is the workflow's own `GITHUB_TOKEN`.

## Modes

| Mode | What it does |
|---|---|
| `check` | Runs `archlock check --format github`. Fails the job on errors and annotates the offending lines in the pull request. |
| `diff` | Runs `archlock diff` against the pull request's base branch, writes the result to the job summary and posts **one** sticky comment on the pull request (updated on every push). |

## Example workflow

```yaml
# .github/workflows/architecture.yml
name: architecture

on:
  pull_request:

permissions:
  contents: read
  pull-requests: write # only needed for the diff comment

jobs:
  archlock:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0 # diff needs the base commit
      - uses: actions/setup-node@v5
        with:
          node-version: 22

      - name: Architecture check
        uses: mcbabel/archlock@v0
        with:
          mode: check

      - name: Architecture diff
        uses: mcbabel/archlock@v0
        with:
          mode: diff
```

If your project needs its dependencies to resolve imports (for example workspace packages that
are only found through `node_modules`), install them before the archlock steps. Most projects do
not need this: archlock resolves workspace packages by name.

## Inputs

| Input | Default | Description |
|---|---|---|
| `mode` | `check` | `check` or `diff`. |
| `working-directory` | `.` | Directory with `archlock.config.json`. |
| `version` | `latest` | archlock version from npm. Pin it (e.g. `0.1.0`) for reproducible CI. |
| `command` | | Command that runs archlock, overriding `version` (e.g. `node dist/cli.js`). |
| `base` | PR base branch | `diff` mode: ref to compare with. |
| `comment` | `true` | `diff` mode: post/update the sticky PR comment. |
| `github-token` | `github.token` | Token used for the comment. |

Output: `changes` (diff mode), the number of architecture changes.

## The PR comment

The comment looks like this (for the [demo-shop](../examples/demo-shop) change in the README's
GIF, made by Claude Code) and is replaced on every push, so a pull request never collects more than one archlock comment:

```diff
! billing.markPaid  (deps, invoiceId, payment) → (deps, invoiceId, payment, paidAt: Date)
+ demo_shop         new dependency: notifications
+ notifications     new module (6 public symbols; depends on customers, events, shared)
```

**85 lines of code changed → 3 lines of architecture**

Pull requests from forks get a read-only token; the comment step then prints a warning and the
diff is still available in the job summary. The step never fails the build.

## Without the action

```yaml
- run: npx --yes archlock check --format github
- run: npx --yes archlock diff --format markdown >> "$GITHUB_STEP_SUMMARY"
```
