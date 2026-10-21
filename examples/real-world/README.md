# archlock on real-world projects

These folders contain the sketches archlock generates for three well-known open-source projects.
Flask is straight from `archlock init --yes`. Hono and Zod also have the small hand edits a user
would make after `init` (see below). Only archlock's output is stored here, never the projects'
code. `regenerate.sh` reproduces everything, including the hand edits, from the pinned commits.

| Project | Language | Commit | License | Modules | Public symbols | Code → architecture |
|---|---|---|---|---|---|---|
| [Hono](https://github.com/honojs/hono) | TypeScript | [`5ca49b0`](https://github.com/honojs/hono/tree/5ca49b0720755c585c9a9835f0a479ceea36fb52) | MIT | 19 | 550 | 25,971 → 1,743 lines (**15×**) |
| [Zod](https://github.com/colinhacks/zod) | TypeScript | [`afdac65`](https://github.com/colinhacks/zod/tree/afdac65e0f80c0ccf9e8909da97c411567908b57) | MIT | 13 | 1,905 | 45,221 → 5,789 lines (**7.8×**) |
| [Flask](https://github.com/pallets/flask) | Python | [`d086db8`](https://github.com/pallets/flask/tree/d086db856be187255b8ec61ef409357393020f32) | BSD-3-Clause | 3 | 49 | 7,563 → 542 lines (**14×**) |

Lines are non-blank lines of non-test source files and of the generated sketches.

## Edited by hand after `init` (the intended workflow)

`init` guesses the modules; you are expected to adjust them. Both edits below are what a user
would do in an editor, followed by `archlock accept`. `regenerate.sh` replays them (`customize`).

- **Zod: split into its layers.** `init` sees the `zod` workspace package as one module, so the
  sketch only described its outer API. Five header-only sketches (a docstring, `__module__`,
  `__paths__`, `__entry__`; see [Adding a module](../../docs/FORMAT.md#adding-a-module)) split
  `packages/zod` into [`zod.core`](zod/archlock/zod.core.arch.py),
  [`zod.classic`](zod/archlock/zod.classic.arch.py), [`zod.mini`](zod/archlock/zod.mini.arch.py),
  [`zod.locales`](zod/archlock/zod.locales.arch.py) and [`zod.v3`](zod/archlock/zod.v3.arch.py).
  `archlock accept` filled in their APIs and dependencies. The graph in
  [`zod/archlock/README.md`](zod/archlock/README.md) now shows how Zod is built: both APIs sit on
  `zod.core`. The sketches grow from 1,430 to 5,789 lines (32× → 7.8×), because the contracts
  between the layers are now part of the lockfile; that is the point of the split.
- **Hono and Zod: `"maxTypeLength": 120`** (opt-in, see
  [FORMAT.md](../../docs/FORMAT.md#very-long-types-opt-in)). Types longer than 120 characters are
  written as a placeholder with their start, length and hash, for example Hono's 4,635-character
  `RequestHeader` union: `'<"A-IM" | "Accept" | "Accept-Additions" | "Accept-CH" | … (4635 chars, #9f247ce7)>'`.
  `check` still detects any change to such a type.

## What archlock found

`archlock check` right after `init` reports **no errors** for all three projects (the sketches
describe the code exactly). It does report warnings that are real architecture observations:

- **Hono** (81 `deep_import` warnings, cycle `client → hono → router → utils → helper → jsx`):
  the router implementations in `src/router/` import `src/router.ts`, a file of the root module
  that is not exported from `src/index.ts`. Middleware and helpers import `src/types.ts` and
  `src/http-exception.ts` the same way. Nothing is wrong with Hono; archlock just makes visible
  which internal files act as shared contracts.
- **Zod** (6 `deep_import` warnings, cycle `zod.core → zod.locales`): `zod.classic` and
  `zod.mini` import `visit` from `v4/core/visit.ts`, and `zod.classic` also uses
  `v4/core/standard-schema.ts` and `v4/core/json-schema-processors.ts`. `zod/v4/core` does not
  export these (or exports only part of them), so they are internal contracts between the layers.
  The cycle exists because `zod.core` re-exports the locales (`export * as locales`) while every
  locale imports core's error types.
- **Flask** (14 warnings, cycle `flask → json → sansio`): `flask.sansio` uses private helpers of
  the top-level package (`flask.helpers`, `flask.typing`, `flask.logging`), and the top-level
  package depends on `sansio` again.

The share of `'<inferred>'` types (public API without annotations) is 4% for Hono, 7% for Zod
and 6% for Flask.

## Measurements

On a desktop PC: `init` 0.6 s (Hono), 0.7 s (Zod), 0.4 s (Flask); `check` with a warm cache is
faster still. (Earlier, in a slower container: 1.2 s, 1.5 s and 0.9 s.) Running `init` twice produces byte-identical files, and every
generated sketch satisfies `render(parse(sketch)) === sketch`.

## Licenses

The sketches are derived from the projects' public APIs. The projects are licensed as follows;
their copyright notices are reproduced here:

- Hono: MIT License, Copyright (c) 2021 - present, Yusuke Wada and Hono contributors.
- Zod: MIT License, Copyright (c) 2025 Colin McDonnell.
- Flask: BSD-3-Clause License, Copyright 2010 Pallets.

See each project's repository for the full license text.
