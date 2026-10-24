# archlock

## 0.2.0

### Minor Changes

- b6fb07c: C#.

  - `.cs` files are extracted with the tree-sitter C# grammar (WASM, shipped in the package and only loaded for C# code). `init` makes one module per project (`.csproj`), named after it, and splits a single project into its folders; test, benchmark and sample projects are skipped, and shared source folders outside every project are modules of their own.
  - Dependencies come from the type names code uses, resolved like the compiler does: the file's namespaces and their parents, `using` directives, project-wide `global using`s and aliases, within the project and the projects it references. `using`s of namespaces in the repository count too, except `System.*` and `Microsoft.*`.
  - The public API is the `public` types and their `public` members (in interfaces every member without an access modifier): classes, structs, interfaces, enums, records and record structs, delegates, nested types as `Outer__Inner`, properties (read-only without a public setter), fields, constants, events, indexers, constructors, overloads, generics with constraints, nullables, `params`, `ref`/`out`/`this` parameters and defaults. Partial types are merged. `record`, `struct`, `static`, `abstract`, `sealed` and `readonly` are decorators on the class. The mapping is in `docs/FORMAT.md`.
  - `push` explains C# sketches to the agent and suggests `dotnet build` as a `verifyCommands` entry.
  - `**/obj/**` is excluded by default.

  Type spelling: a `?` that ends a type is a suffix, so TypeScript optional tuple elements read `[T?]` instead of `[T ? ]`. Existing sketches still pass `check`; with `maxTypeLength`, an abbreviated type that contains one gets a new hash, so run `archlock accept` once.

- 744ae1a: Go.

  - `.go` files are extracted with the tree-sitter Go grammar (WASM, shipped in the package). `init` makes one module per Go package directory (`internal/store/*.go` → `internal.store`), also in repositories that mix Go with TypeScript or Python.
  - Imports resolve through the repository's `go.mod` files, including nested modules and local `replace` targets; the standard library and cgo are no dependencies, and external modules are named by their `require` lines.
  - The public API is the exported identifiers of each package: functions, structs (exported fields, embedded types as bases), interfaces (methods, embedded interfaces, type sets), defined types, aliases, constants and variables, with generics. Methods are attached to their type from any file of the package. Types stay in Go notation (`'*Store'`, `'[]byte'`, `'(int, error)'`); untyped constants are `'untyped string'` and so on. The mapping is in `docs/FORMAT.md`.
  - Build variants of a package (`_linux.go`, `_windows.go`, build tags) define a name once, and files with `//go:build ignore` are skipped. Test files and `testdata/` are excluded by default.
  - `push` explains Go sketches to the agent and suggests `go build ./...` as a `verifyCommands` entry.

  Also fixed: names `None`, `True` and `False` in code get a trailing underscore in sketches (`None_`), like Python keywords.

- 4e9ade6: Java.

  - `.java` files are extracted with the tree-sitter Java grammar (WASM, shipped in the package). `init` makes one module per source root of a multi-module Maven or Gradle build, and splits a single source root into the subpackages of its root package; test roots are skipped. Source roots follow from the files' `package` declarations, so any layout works.
  - Imports and fully qualified names resolve to the file of their outermost class (also static and wildcard imports, and `a.b.Class` names in code); the JDK is no dependency.
  - The public API is the `public` types and their `public` members (in interfaces every member that is not `private`): classes with their superclass and interfaces as bases, interfaces, enums with methods, records (components as read-only fields), annotation types, nested types as `Outer__Inner`, constructors, overloads, static and final members, generics with bounds and wildcards, varargs and arrays. `abstract`, `final`, `sealed`, `record` and `annotation` are decorators on the class. The mapping is in `docs/FORMAT.md`.
  - `push` explains Java sketches to the agent and suggests `mvn -q compile` as a `verifyCommands` entry.

- 27e6e29: Rust.

  - `.rs` files are extracted with the tree-sitter Rust grammar (WASM, shipped in the package). `init` makes one module per crate in a Cargo workspace, and splits a single crate into its top-level modules plus the crate root. Test, example, benchmark and fuzz crates are skipped.
  - Paths resolve through the module tree (`mod` files, `mod.rs`, `#[path]`) and the Cargo manifests: `crate::`, `self::`, `super::`, own modules, workspace crates (also renamed and path dependencies) and external crates; the standard library is no dependency. Paths used in code without a `use` (`crate::util::helper()`) count too.
  - The public API is what the crate root (or a module's entry) reaches: `pub` items, `pub use` re-exports (with `as` and globs), `pub extern crate`, nested `pub mod`s as `child__item`, and `#[macro_export]` macros. `pub(crate)` items, private modules and binaries are not public; Rust's visibility rules also apply to path resolution.
  - Structs (pub fields; derived and implemented traits as bases), enums with variant data (`Circle = '{ radius: f64 }'`) and methods, traits (supertraits, associated types and constants), `impl` blocks from any file of the crate, type aliases, constants, statics, lifetimes and generics with `where` bounds. Items inside item-level macros (`cfg_rt! { … }`, `cfg_if!`) are read when they parse as Rust; `#[cfg(test)]` code is skipped.
  - `push` explains Rust sketches to the agent and suggests `cargo check` as a `verifyCommands` entry.

  Sketch format: enum members can carry data (`Name = '(u8, u8)'`) and enums can have methods. Python and TypeScript sketches are unchanged; an enum with a non-enum base now renders as `class Color(str, Enum)` (it used to lose `Enum`).

- 1de18de: Vue, Svelte and Astro components.

  - `.vue`, `.svelte` and `.astro` files are read through their script blocks (Vue `<script>` and `<script setup>`, Svelte instance and module scripts, Astro frontmatter and client scripts), so imports from and to components are dependency edges.
  - A component is a public symbol of its module, named after its file (`class UserCard(VueComponent):`). Its props and events are its signature: `defineProps`, `withDefaults`, `defineEmits`, `defineModel`, the Options API, Svelte 5 `$props()`, Svelte 4 `export let` and typed `createEventDispatcher`, and Astro's `Props`. Generic components keep their type parameters.
  - SvelteKit's `$lib` and Nuxt's `~`, `@`, `~~` and `@@` aliases resolve without the generated tsconfig files.
  - `push` tells the agent how to read component sketches and suggests a fitting `verifyCommands` entry (`npx vue-tsc --noEmit`, `npx svelte-check`, `npx astro check`).

  Also fixed:

  - In a module without an entry, a name defined in several files is now qualified with each file's path (`ui_button_button__Button`) instead of keeping only the first one. Projects with such modules see these symbols as changes on the first `check` after upgrading; run `archlock accept` once to adopt the new names.
  - Property names that are TypeScript keywords keep their spacing: `z.infer<typeof schema>` is `z.infer[typeof schema]`, not `z.infer [typeof schema]`. Existing sketches with the extra space still pass `check`; `archlock accept` rewrites them.

## 0.1.2

### Patch Changes

- 992d67b: `init`, `stats`, the generated `archlock/README.md` and the `stats --badge` badge no longer show a compression ratio for projects below 300 lines of code or when the sketches are longer than the code; a short note takes its place. The npm package's homepage is now the landing page.

## 0.1.1

### Patch Changes

- 1e73012: The GitHub Action is ready for the GitHub Marketplace: it is listed as "archlock architecture lockfile" with lock branding in blue (use it as before, `uses: mcbabel/archlock@v0`). Releases are published with npm Trusted Publishing and provenance.

## 0.1.0

### Minor Changes

- 586da73: First release: `init`, `check`, `accept`, `diff`, `push`, `stats`, `graph` and `mcp` for TypeScript/JavaScript and Python, the GitHub Action, and the agent skill.
