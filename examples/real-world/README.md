# archlock on real-world projects

These folders contain the sketches archlock generates for eight well-known open-source projects.
Flask, Gin, ripgrep, Spring PetClinic and eShop are straight from `archlock init --yes`. Hono, Zod and shadcn-svelte also have the small
hand edits a user would make after `init` (see below). Only archlock's output is stored here, never the projects'
code. `regenerate.sh` reproduces everything, including the hand edits, from the pinned commits.

| Project | Language | Commit | License | Modules | Public symbols | Code → architecture |
|---|---|---|---|---|---|---|
| [Hono](https://github.com/honojs/hono) | TypeScript | [`5ca49b0`](https://github.com/honojs/hono/tree/5ca49b0720755c585c9a9835f0a479ceea36fb52) | MIT | 19 | 571 | 25,971 → 1,790 lines (**15×**) |
| [Zod](https://github.com/colinhacks/zod) | TypeScript | [`afdac65`](https://github.com/colinhacks/zod/tree/afdac65e0f80c0ccf9e8909da97c411567908b57) | MIT | 13 | 1,932 | 45,221 → 5,824 lines (**7.8×**) |
| [Flask](https://github.com/pallets/flask) | Python | [`d086db8`](https://github.com/pallets/flask/tree/d086db856be187255b8ec61ef409357393020f32) | BSD-3-Clause | 3 | 49 | 7,563 → 542 lines (**14×**) |
| [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) | Svelte, TypeScript | [`b10f153`](https://github.com/huntabyte/shadcn-svelte/tree/b10f153250b18abfccf49a06e1c4c68945edffa5) | MIT | 9 | 1,939 | 133,471 → 3,011 lines (**44×**) |
| [Gin](https://github.com/gin-gonic/gin) | Go | [`0f09c3a`](https://github.com/gin-gonic/gin/tree/0f09c3a9b4626d9fe9979cf4d0521d6ae32ab646) | MIT | 7 | 194 | 6,785 → 630 lines (**11×**) |
| [ripgrep](https://github.com/BurntSushi/ripgrep) | Rust | [`6892bc2`](https://github.com/BurntSushi/ripgrep/tree/6892bc2b7efe5909cbbeec8f757ed2c4c76b1d30) | Unlicense or MIT | 10 | 115 | 43,627 → 886 lines (**49×**) |
| [Spring PetClinic](https://github.com/spring-projects/spring-petclinic) | Java | [`500158f`](https://github.com/spring-projects/spring-petclinic/tree/500158f732419217507c7656904b8e6aa1bcc0d6) | Apache-2.0 | 5 | 18 | 1,644 → 92 lines (**18×**) |
| [eShop](https://github.com/dotnet/eShop) | C# | [`913acea`](https://github.com/dotnet/eShop/tree/913acea66708a59595351174cee9b29f37179d29) | MIT | 20 | 477 | 19,546 → 3,428 lines (**5.7×**) |

Lines are non-blank lines of non-test source files and of the generated sketches.

## Edited by hand after `init` (the intended workflow)

`init` guesses the modules; you are expected to adjust them. The edits below are what a user
would do in an editor, followed by `archlock accept`. `regenerate.sh` replays them (`customize`).

- **Zod: split into its layers.** `init` sees the `zod` workspace package as one module, so the
  sketch only described its outer API. Five header-only sketches (a docstring, `__module__`,
  `__paths__`, `__entry__`; see [Adding a module](../../docs/FORMAT.md#adding-a-module)) split
  `packages/zod` into [`zod.core`](zod/archlock/zod.core.arch.py),
  [`zod.classic`](zod/archlock/zod.classic.arch.py), [`zod.mini`](zod/archlock/zod.mini.arch.py),
  [`zod.locales`](zod/archlock/zod.locales.arch.py) and [`zod.v3`](zod/archlock/zod.v3.arch.py).
  `archlock accept` filled in their APIs and dependencies. The graph in
  [`zod/archlock/README.md`](zod/archlock/README.md) now shows how Zod is built: both APIs sit on
  `zod.core`. The sketches grow from 1,492 to 5,824 lines (30× → 7.8×), because the contracts
  between the layers are now part of the lockfile; that is the point of the split.
- **shadcn-svelte: the docs app split into its parts.** The `docs` workspace package holds the
  whole site, including the component registry, as one module of about 1,900 components. Three
  header-only sketches without an entry give the registry's parts their own modules:
  [`docs.ui`](shadcn-svelte/archlock/docs.ui.arch.py) (the components users copy into their apps),
  [`docs.blocks`](shadcn-svelte/archlock/docs.blocks.arch.py) and
  [`docs.examples`](shadcn-svelte/archlock/docs.examples.arch.py) (which has an `index.ts` entry).
  Without the split, components with the same file name (`ui/button/button.svelte` and
  `examples/create/button/button.svelte`) are told apart by their paths
  (`src_lib_registry_ui_button_button__Button`); with it, most names are short again.
- **Hono, Zod and shadcn-svelte: `"maxTypeLength": 120`** (opt-in, see
  [FORMAT.md](../../docs/FORMAT.md#very-long-types-opt-in)). Types longer than 120 characters are
  written as a placeholder with their start, length and hash, for example Hono's 4,635-character
  `RequestHeader` union: `'<"A-IM" | "Accept" | "Accept-Additions" | "Accept-CH" | … (4635 chars, #9f247ce7)>'`.
  `check` still detects any change to such a type.

## What archlock found

`archlock check` right after `init` reports **no errors** for all eight projects (the sketches
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

- **shadcn-svelte** (no warnings, cycle `docs → docs.blocks → docs.ui`): almost every UI component
  imports `cn` from the docs app's `$lib/utils.ts` (342 imports), and 47 import its icon
  placeholder, while the docs pages import the components and blocks. Each component's props are its
  signature, for example [`Button`](shadcn-svelte/archlock/docs.ui.arch.py) with `size` and
  `variant` on top of the HTML attributes of `<button>` and `<a>`.

- **Gin** (no warnings, no cycles): one module per Go package. The root package `gin` depends on
  `binding`, `render`, `codec.json` and two internal packages, and `ginS` (the singleton API)
  only on `gin`. `binding/binding.go` and `binding/binding_nomsgpack.go` are build
  variants (the `nomsgpack` tag) that define the same exported names; the first file counts.
- **ripgrep** (no warnings, no cycles): one module per crate of the workspace, layered cleanly.
  `grep_matcher` is the base the searcher, printer and both regex engines build on; `grep` is a
  facade that only re-exports the other crates (`pub extern crate grep_cli as cli;` and so on);
  the `ripgrep` binary depends on `grep` and `ignore`, and has no public API.
- **Spring PetClinic** (no warnings, no cycles): one module per feature package below
  `org.springframework.samples.petclinic` (`owner`, `vet`, `system`, `model`) plus the root
  package. `owner` and `vet` build on the shared `model` entities. The web controllers are
  package-private, so the public API is the entities, repositories, formatters and validators.
- **eShop** (no warnings, no cycles): one module per project, plus `Shared` for the source files
  several projects compile in. The dependencies follow the project references: the services
  build on `eShop.ServiceDefaults` and the `EventBus` abstractions, `Ordering.API` on
  `Ordering.Domain` and `Ordering.Infrastructure`, and nothing depends on the API projects.
  Projects that are only used through extension methods in framework namespaces (the RabbitMQ
  event bus, registered with `AddRabbitMqEventBus`) do not appear as dependencies. The ratio is
  low because much of eShop's code is DTOs, records and API models, all of which are public API.

The share of `'<inferred>'` types (public API without annotations) is 4% for Hono, 7% for Zod,
6% for Flask, 1% for Gin, 0% for ripgrep, Spring PetClinic and eShop (Rust, Java and C# have
almost no unannotated public API) and 29% for shadcn-svelte, whose Svelte 5 state classes (`.svelte.ts`) rely on
inference (`readonly props = $derived.by(…)`).

## Measurements

On a desktop PC: `init` 0.6 s (Hono), 0.8 s (Zod), 0.4 s (Flask), 2.2 s (shadcn-svelte, 2,145
Svelte files), 0.4 s (Gin), 0.7 s (ripgrep), 0.4 s (Spring PetClinic), 1.1 s (eShop); `check` with a warm cache is faster still. (Earlier, in a slower container: 1.2 s, 1.5 s and 0.9 s.) Running `init` twice produces byte-identical files, and every
generated sketch satisfies `render(parse(sketch)) === sketch`.

## Licenses

The sketches are derived from the projects' public APIs. The projects are licensed as follows;
their copyright notices are reproduced here:

- Hono: MIT License, Copyright (c) 2021 - present, Yusuke Wada and Hono contributors.
- Zod: MIT License, Copyright (c) 2025 Colin McDonnell.
- Flask: BSD-3-Clause License, Copyright 2010 Pallets.
- eShop: MIT License, Copyright (c) .NET Foundation and Contributors.
- Spring PetClinic: Apache License 2.0, Copyright 2012-2025 the original author or authors.
- ripgrep: dual-licensed under the Unlicense and the MIT License, Copyright (c) 2015 Andrew Gallant.
- Gin: MIT License, Copyright (c) 2014-present Manuel Martínez-Almeida.
- shadcn-svelte: MIT License, Copyright (c) 2023 Hunter Johnston, Copyright (c) 2023 CokaKoala,
  Copyright (c) 2023 shadcn.

See each project's repository for the full license text.
