# Security policy

## What archlock does and does not do

- The core commands (`init`, `check`, `accept`, `diff`, `stats`, `graph`, `mcp`) read your
  repository and write only `archlock.config.json`, `archlock/`, and archlock's cache. They make
  no network requests and send no telemetry.
- `archlock push` and `init --with-summaries` start the coding agent you configured (Claude Code,
  Codex, OpenCode, or `agent.command`). That agent edits files and may contact its own provider.
  archlock passes it a work-order file inside your repository and never commits.
- The GitHub Action uses only the workflow's `GITHUB_TOKEN` to post one pull request comment.

## Reporting a vulnerability

Please do **not** open a public issue. Use GitHub's private vulnerability reporting
("Security" tab of the repository → "Report a vulnerability"). You will get an answer within a
week. Supported versions: the latest release.
