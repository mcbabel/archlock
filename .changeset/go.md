---
"archlock": minor
---

Go.

- `.go` files are extracted with the tree-sitter Go grammar (WASM, shipped in the package). `init` makes one module per Go package directory (`internal/store/*.go` → `internal.store`), also in repositories that mix Go with TypeScript or Python.
- Imports resolve through the repository's `go.mod` files, including nested modules and local `replace` targets; the standard library and cgo are no dependencies, and external modules are named by their `require` lines.
- The public API is the exported identifiers of each package: functions, structs (exported fields, embedded types as bases), interfaces (methods, embedded interfaces, type sets), defined types, aliases, constants and variables, with generics. Methods are attached to their type from any file of the package. Types stay in Go notation (`'*Store'`, `'[]byte'`, `'(int, error)'`); untyped constants are `'untyped string'` and so on. The mapping is in `docs/FORMAT.md`.
- Build variants of a package (`_linux.go`, `_windows.go`, build tags) define a name once, and files with `//go:build ignore` are skipped. Test files and `testdata/` are excluded by default.
- `push` explains Go sketches to the agent and suggests `go build ./...` as a `verifyCommands` entry.

Also fixed: names `None`, `True` and `False` in code get a trailing underscore in sketches (`None_`), like Python keywords.
