# Contributing to archlock

Thank you for helping. archlock is small on purpose: a deterministic core, two extractors, and
thin integrations. Contributions that keep it that way are the easiest to merge.

## Setup

```bash
pnpm install
pnpm verify        # lint + typecheck + tests + build + archlock checking itself
```

Node 20 or newer. `pnpm test` runs vitest (it builds `dist/` first because the end-to-end tests
run the real CLI). `pnpm format` fixes formatting.

## How the code is organised

archlock checks its own architecture: [`archlock/README.md`](./archlock/README.md) shows the
module graph and every module's sketch, and CI fails if the code drifts from them. Start there.
In short:

- `core`: the language-neutral `ArchModel`, type canonicalization, rules, the comment-preserving merge.
- `sketch`: the `.arch.py` format (parse with web-tree-sitter, deterministic render).
- `extract`: source files → `FileFacts` → modules, public APIs, dependency edges.
- `engine`: workspace loading, compare, diff, stats. `report`: terminal/JSON/Markdown output.
- `cli`, `agents`, `mcp`, `git`, `init`, `config`, `fs`: what their names say.

If your change alters a module's public API or dependencies on purpose, run
`node dist/cli.js accept <module>` and commit the sketch with the code.

## Rules of the house

- The core (`init`, `check`, `accept`, `diff`, `stats`, `graph`) stays **deterministic and
  offline**: same input, byte-identical output; no network, no LLM, no clock.
- No telemetry, no native dependencies (WASM is fine). New dependencies need a sentence in
  `docs/DESIGN.md`.
- Error messages say what happened, where, and what to do next.
- Conventional Commits (`feat:`, `fix:`, `docs:` …). Add a changeset (`pnpm changeset`) when users
  will notice the change.

## Adding a language

Most of archlock does not know which language it is looking at. A new language (Kotlin,
Swift, …) is mainly one extractor and one import resolver. This is the most valuable kind of
contribution.

1. **Parse without native code.** Use a WASM tree-sitter grammar (like `tree-sitter-go`, see
   `tsup.config.ts`, which copies the `.wasm` into `dist/wasm/`) or a pure-JS parser.
2. **Extract `FileFacts`** (`src/extract/facts.ts`), syntactically:
   - `imports`: specifier, imported names (`*` for whole-module imports), line, column;
   - `exports`: which names the file makes public (by your language's rules, e.g. capitalised
     identifiers in Go);
   - `declarations`: `ArchSymbol`s from `src/core/model.ts` (functions with `Signature`s,
     classes/structs with fields and methods, interfaces, type aliases, enums, constants).
     Types are **not translated**: pass the source text through `canonicalType()`.
   Look at `src/extract/go/file.ts` for a compact example with a tree-sitter grammar, or
   `src/extract/python/file.ts`. Formats that embed a language
   (Vue, Svelte, Astro) can reuse its extractor: `src/extract/components/` blanks everything
   outside the script blocks and hands the rest to the TypeScript extractor.
3. **Resolve imports** by implementing `Resolver` (`src/extract/resolution.ts`): a file in the
   repository, a workspace module, an external package, or a built-in.
4. **Wire it up**: file extensions in `src/fs/files.ts`, the language in `src/config/config.ts`
   (and `schema.json`), detection in `src/init/detect.ts`, dispatch in `src/extract/index.ts`.
5. **Prove it** with a fixture repository under `test/fixtures/<lang>-…` and add it to
   `test/e2e/roundtrip.test.ts` (init → check has no errors; `render(parse(x)) === x`;
   init twice is byte-identical), plus mapping tests like `test/extract/python.test.ts` and a
   few targeted mutations like `test/e2e/python.test.ts`.
6. **Document the mapping** (language construct → sketch) in `docs/FORMAT.md`.
7. **Tell agents how to read it:** reading notes and a typical `verifyCommands` entry for the
   language in `src/agents/prompt.ts` (`componentNotes`, `VERIFY_EXAMPLES`).

Open a "New language" issue first if you want feedback on the mapping before writing code.

## Reporting bugs

Please include the archlock version (`archlock --version`), the command, the output, and if
possible a minimal repository. For a wrong sketch, the source snippet and the generated sketch
lines are usually enough.
