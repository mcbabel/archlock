# Design notes

Why archlock works the way it does. The user-facing details are in [FORMAT.md](FORMAT.md),
[COMMANDS.md](COMMANDS.md) and [AGENTS.md](AGENTS.md).

## Principles

- **Deterministic and offline core.** `init`, `check`, `accept`, `diff`, `stats` and `graph` use no model and no network; the same input gives byte-identical output (LF, POSIX paths, stable sorting) on every OS. A CI check that varies is worthless. Only `push` and `init --with-summaries` start an agent, and it is always the one the user already has.
- **No native builds.** The TypeScript compiler API extracts TS/JS and the scripts of Vue, Svelte and Astro components; tree-sitter compiled to WASM parses Python and the sketches themselves. `npx archlock` needs no compiler toolchain.
- **No telemetry, no service.** The GitHub Action only uses the workflow's `GITHUB_TOKEN`.
- **archlock checks itself.** The sketches in [`archlock/`](../archlock) describe archlock's own 13 modules, and CI runs `archlock check` on them. Doing so early forced an acyclic internal layering: `core` (model, canonical types, rules, merge) ← `fs`, `config` ← `sketch`, `extract` ← `engine` ← `report`, `init` ← `cli`.

## Runtime and tooling

- **TypeScript 6** as a runtime dependency: TypeScript 7 (the native port) has no stable JS API yet, and the extractor needs `createSourceFile` and `resolveModuleName`.
- **Node 20 or newer.** Dev tools are pinned to Node-20-compatible majors (`commander@14`, `vitest@4`, `tsup@8`).
- **Small dependency set:** `commander` (CLI), `picomatch` (globs), `ignore` (`.gitignore` semantics), `@clack/prompts` (interactive `init`), `web-tree-sitter` with the WASM files of the Python and Go grammars copied in at build time (`tree-sitter-python` and `tree-sitter-go` are dev dependencies; users install no grammar package and compile nothing), and the official MCP SDK with `zod`.
- **Exit codes:** 0 success, 1 violations, 2 usage, configuration or internal errors, so CI can tell architecture drift from "archlock could not run". Every `--json` payload carries `schemaVersion` and `command`.

## The sketch format

- **Python syntax as notation** for every language: highlighting everywhere, and both people and LLMs read it well. Types are never translated, only canonicalized by a token-level pretty printer (`<…>` → `[…]`, quote style, spacing), so the same type compares equal whether it comes from code or from a hand-edited sketch. A type is written bare only when it is unambiguously valid Python; otherwise it is quoted.
- **Stable layout** in the style of `.pyi` stubs: fixed group order, alphabetical members (enum members and overloads keep source order), long signatures and type-parameter lists wrapped one per line. Moving code around never churns a sketch.
- **Comments are soft content.** They attach to elements by fixed rules ([FORMAT.md](FORMAT.md)), survive `accept`, and never fail CI. Comments of symbols that disappeared are reported, never dropped silently.
- **Very long types** can be abbreviated to `'<start … (N chars, #8 hex of SHA-256)>'` (`maxTypeLength`, opt-in). The same pure function runs on the code model and on parsed sketches, so `check` keeps comparing plain strings and still detects every change. It is off by default because it hides detail from reviewers and agents.

## Extraction and `check`

- **Ownership:** a file belongs to the module whose matching `__paths__` glob is most specific; ties go to the alphabetically first module.
- **Public API:** with an entry, exactly what the entry exports (following re-exports); without one, everything exported by the module's files. In Python, `__all__` wins; otherwise public names, plus names an `__init__.py` imports from its own submodules. An entry that exports nothing (an empty `__init__.py`) does not define the API.
- **Deep imports:** importing a file of another module directly is reported only when it reaches something private. A file the entry re-exports as a whole (`export * as util from "./util"`, or a file whose every export is public) is public.
- **Resolution** uses the nearest `tsconfig.json` (paths, `extends`, references) and workspace package names, so monorepos work without `node_modules`. Python imports resolve against package roots (repository root, `src/`, directories with `pyproject.toml`/`setup.py`); the standard library is never a dependency.
- **Name collisions without an entry:** when several files of an entry-less module define the same name, each one is qualified with its file path in the module (`ui_button_button__Button`). Keeping only the first would hide the others from `check`, and a new file with a taken name would not show up as a change. The prefix depends only on the file's own path, so it stays stable when further files with that name appear.
- **Components are read through the TypeScript extractor.** Everything outside the script blocks of a `.vue`, `.svelte` or `.astro` file is replaced by spaces (line breaks kept), and the result goes through the normal TypeScript extraction. Imports, line and column numbers and type canonicalization are therefore exactly those of TypeScript, without a template parser. Imports come from every script block; other exports only from blocks that can export (Vue's plain `<script>`, Svelte's module script, Astro's frontmatter). Commented-out scripts, scripts inside Vue's `<template>` or Svelte's `<svelte:head>`, and Astro's `is:inline` and data scripts are skipped.
- **A component is a class, its props and events are fields.** Props and the handler props of events (`onChange`, Vue's `onUpdate:modelValue`) are what a parent can pass, so they form one signature, like a React component's props. Events use Vue's own listener names (`calendar-change` → `onCalendarChange`), so a sketch field matches what a parent writes. Local interfaces and type aliases are expanded into fields so that a changed prop shows up as a changed field; a props type defined elsewhere is a base, because following imports would need a type checker. That file's own sketch catches changes to the type.
- **Route files are not components.** Nothing imports a SvelteKit `+page.svelte` or an Astro or Nuxt page, so a component symbol would only add noise; their other exports (`load`, `prerender`) stay.
- **Framework aliases** resolve when no tsconfig `paths` entry maps them: SvelteKit's `$lib` to `src/lib` next to `svelte.config.*`, Nuxt's `~` and `@` to `app/` (if it exists) or the directory of `nuxt.config.*`, and `~~` and `@@` to that directory. The generated `.svelte-kit/tsconfig.json` and `.nuxt/tsconfig.json` that define them are git-ignored, so a fresh clone resolves the same edges as a built one. The framework configs themselves are code, not data, so archlock does not read custom settings from them.
- **Go packages are modules.** A Go package is a directory and Go's unit of architecture, so `init` makes one module per package directory, with `dir/*.go` as its path (not `dir/**`): a new sub-package is reported as unassigned instead of silently joining its parent. Names follow the import path (`internal/store` → `internal.store`); the root package takes the last element of the module path (`github.com/gin-gonic/gin` → `gin`). In a mixed repository, the rest of the code is detected as before.
- **Go imports resolve through `go.mod`.** Every `go.mod` in the repository (also nested modules and local `replace` targets) maps its module path to a directory; an import resolves to a file of that package directory, so ownership works as for any file. A first path element without a dot is the standard library (`net/http`), `C` is cgo, and anything else is an external module named by the longest matching `require`. No network and no module cache are used.
- **Go methods are attached per package.** Go allows a method in any file of the package, so the extractor collects methods by receiver type and attaches them after all files are read, on copies of the cached facts.
- **Build variants define a name once.** Files of one package that define the same name are alternatives for different builds (`_linux.go`, `_windows.go`, `//go:build` tags); the first one in path order counts and the others are not compared. Qualifying them like in other languages would turn one function into several. Files with `//go:build ignore` are not part of the package at all (they are usually generators with their own imports).
- **Go types are canonicalized by the same function as TypeScript types.** The pretty printer gained rules for token sequences that only occur in Go (`]` directly before a word, prefix `*` and `~`, `<-` next to `chan`, `)` before `(`, `struct{`/`interface{`), so the gofmt spelling is the canonical form and the sketch parser needs no language switch. The real-world TypeScript sketches were byte-identical before and after this change.
- **Untyped Go constants say so.** `const Version = "1.0"` has no type but a kind; `untyped string` is Go's own term and more useful than `'<inferred>'`. For variables the default type applies (`var Ratio = 0.5` → `float64`), and the few values whose type is evident from the syntax alone (`&T{}`, `T{}`, `errors.New`, `fmt.Errorf`) get it. Everything else stays `'<inferred>'`.
- **One broken sketch does not cascade:** its module still counts as known, and the real parse error is reported first.
- **A file-hash cache** (in `node_modules/.cache/archlock/` or `.archlock-cache/`) keeps warm runs fast; it is invalidated whenever the archlock build changes.

## `accept` and `diff`

- **`accept`** takes hard content (symbols, signatures, dependencies) from the code and keeps everything a human wrote (paths, entry, strictness, docstrings, comments). It never writes without a confirmation or `--yes`.
- **`diff`** extracts both states from code: the base commit is checked out into a temporary worktree, and both sides are compared as "what `accept` would write". Architecture changes therefore show up even when nobody ran `accept`. The Action posts the result as one comment, found again by an HTML marker and updated on every push.

## `push` and agents

- **The work order** lists, per difference, the target from the sketch, the current code and the difference, plus the module's invariants, the affected sketches and fixed rules (never edit the sketches, stay within `__depends_on__`, run the check until green, never run `accept`). It is written to a file in the cache directory, so no command line gets too long and any agent that reads files can use it. Dependencies the plan declares but nothing uses yet are listed as context, because they say where new code should be connected.
- **Consent and safety:** `push` asks before it starts an agent, warns about uncommitted changes, never commits, re-checks after every round and warns if the agent edited a sketch. Agents get an empty stdin.
- **Claude Code runs with narrow permissions:** it may edit files and run exactly the check command and the configured `agent.verifyCommands`, as `Bash(<cmd>)` plus `Bash(<cmd> *)` (the space keeps a word boundary). Commands containing `* ( ) , ; & | < > ` $` are rejected because they could widen a rule or chain commands. Allowing a test or build command lets the agent run code it wrote; that is the purpose of the option, so it is opt-in and documented.
- **`init --agents`** adds a marked section to `AGENTS.md`/`CLAUDE.md` whose core rule is "propose, do not accept". **`init --with-summaries`** lets the agent add only `# suggested:` lines; any other change to a sketch is rolled back.

## Project infrastructure

- **Releases** use Changesets: merging the "chore: release" pull request publishes to npm with provenance and moves the `v0` tag that the Action is referenced by.
- **The demo GIF** (`demo.tape`, vhs) is a real run with Claude Code; only the agent's silent work is sped up, and the recording says by how much. The CI test of the demo replays recorded changes instead, so it does not depend on an LLM.
- **The landing page** (`site/`) is plain HTML and CSS with 1 KB of JavaScript, system fonts, no cookies and no third-party requests, deployed to GitHub Pages. Its two accent colors mean the two directions: blue for the sketch side and `push`, amber for the code side, `accept` and everything `check` reports. The logo's wordmark is converted to paths from Fira Sans Bold (SIL Open Font License) by `scripts/brand.py`.
- **Key numbers have one source:** `examples/real-world/numbers.json`, written by `regenerate.sh`; `scripts/check-numbers.mjs` fails when README, site, docs or the examples disagree with it.
