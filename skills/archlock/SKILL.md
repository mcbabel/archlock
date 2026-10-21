---
name: archlock
description: Work inside a repository whose architecture is locked with archlock (archlock/*.arch.py sketches, archlock.config.json). Use it before changing code in such a repository, when `archlock check` fails, when a task needs a new dependency or public API, or when asked to implement a sketch.
---

# Working with archlock

This repository has an **architecture lockfile**: one sketch per module in `archlock/*.arch.py`.
A sketch lists the module's files (`__paths__`), the modules it may import (`__depends_on__`),
optionally the external packages it may use (`__external__`), its public API, and invariants as
comments. CI runs `archlock check`, which fails when the code and the sketches disagree.

The sketches belong to the humans. Your job is to write code that fits them.

## 1. Before you change code: read the sketch

- Find the module of the file you are about to change: `npx archlock` has an MCP tool
  `get_module_for_file`, or look for the sketch whose `__paths__` match the file.
- Read `archlock/<module>.arch.py` completely. Pay attention to:
  - `__depends_on__`: the only internal modules you may import from this module.
  - the public API: every symbol listed must exist with exactly this signature; nothing else may
    be exported (from `__entry__`, when set).
  - `# invariant:`, `# must:` and `# never:` comments: rules the code must keep.
- Sketches use Python syntax as notation for every language. Types stay in the module's own
  language (`Promise[T]` is TypeScript's `Promise<T>`). `name: T = ...` is an optional
  parameter, `Readonly[T]` / `Opt[T]` / `ClassVar[T]` are field flags, `class X(Protocol)` is an
  interface, `'<inferred>'` means "not annotated in the code". Full reference: `docs/FORMAT.md`
  in the archlock repository.

## 2. While you work: stay within the contract

- Import other modules only through their public API (their entry file), never through deep
  paths into their internals.
- Do not add imports of modules missing from `__depends_on__`, or of packages missing from
  `__external__` (when the sketch has `__external__`).
- Keep public signatures exactly as declared. Helpers you need stay private (not exported, or
  prefixed with `_` in Python).
- If the sketch declares a symbol that does not exist yet (a planned symbol), implement it
  exactly as declared.

## 3. Before you finish: run the check

Run `npx archlock check` (or the MCP tool `check`) and fix everything it reports as an error.
Iterate until it passes. Use `npx archlock check --json` if you want to parse the result.

## 4. When the task needs an architecture change: propose, do not accept

Sometimes the task really needs a new dependency, a new public function or a changed signature.
That is a design decision for a human:

- **Do not run `archlock accept`.** It rewrites the sketches from the code, which hides the
  change from review.
- **Do not edit `archlock/*.arch.py`** unless the human explicitly asked you to change the
  design.
- Instead, finish what you can within the contract and end with a short proposal, ideally as
  the exact sketch edit, for example:

  > This needs `billing` to depend on `notifications`. Proposed sketch change in
  > `archlock/billing.arch.py`: `__depends_on__ = ["db", "events", "notifications"]`.

The human then edits the sketch (or runs `archlock accept` after reviewing your code).

## Commands

| Command | Direction | Use |
|---|---|---|
| `archlock check` | compare | Lists every difference between code and sketches. Exit 1 on errors. |
| `archlock accept [module]` | code → sketch | Human-only: adopt an intended code change into the sketches. |
| `archlock push` | sketch → code | Builds a work order from the differences and runs a coding agent on it. If you were started by `archlock push`, follow the work order file you were given. |
| `archlock diff` | compare | Architecture changes since the base branch (for PR reviews). |
| `archlock mcp` | | MCP server with `get_architecture`, `check`, `explain_violation`, `get_module_for_file`. |

## Typical violations and fixes

| Violation | Fix in the code |
|---|---|
| `undeclared_dependency` | Remove the import; use an allowed module, or propose the dependency. |
| `deep_import` | Import through the other module's entry instead of a deep path. |
| `public_symbol_added` | Stop exporting the helper, or propose adding it to the sketch. |
| `planned_not_implemented` | Implement the symbol exactly as the sketch declares it. |
| `signature_changed` | Restore the declared signature, or propose the new one. |
| `undeclared_external` | Do not use that package here, or propose adding it to `__external__`. |
