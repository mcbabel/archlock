---
"archlock": minor
---

C#.

- `.cs` files are extracted with the tree-sitter C# grammar (WASM, shipped in the package and only loaded for C# code). `init` makes one module per project (`.csproj`), named after it, and splits a single project into its folders; test, benchmark and sample projects are skipped, and shared source folders outside every project are modules of their own.
- Dependencies come from the type names code uses, resolved like the compiler does: the file's namespaces and their parents, `using` directives, project-wide `global using`s and aliases, within the project and the projects it references. `using`s of namespaces in the repository count too, except `System.*` and `Microsoft.*`.
- The public API is the `public` types and their `public` members (in interfaces every member without an access modifier): classes, structs, interfaces, enums, records and record structs, delegates, nested types as `Outer__Inner`, properties (read-only without a public setter), fields, constants, events, indexers, constructors, overloads, generics with constraints, nullables, `params`, `ref`/`out`/`this` parameters and defaults. Partial types are merged. `record`, `struct`, `static`, `abstract`, `sealed` and `readonly` are decorators on the class. The mapping is in `docs/FORMAT.md`.
- `push` explains C# sketches to the agent and suggests `dotnet build` as a `verifyCommands` entry.
- `**/obj/**` is excluded by default.

Type spelling: a `?` that ends a type is a suffix, so TypeScript optional tuple elements read `[T?]` instead of `[T ? ]`. Existing sketches still pass `check`; with `maxTypeLength`, an abbreviated type that contains one gets a new hash, so run `archlock accept` once.
