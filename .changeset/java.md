---
"archlock": minor
---

Java.

- `.java` files are extracted with the tree-sitter Java grammar (WASM, shipped in the package). `init` makes one module per source root of a multi-module Maven or Gradle build, and splits a single source root into the subpackages of its root package; test roots are skipped. Source roots follow from the files' `package` declarations, so any layout works.
- Imports and fully qualified names resolve to the file of their outermost class (also static and wildcard imports, and `a.b.Class` names in code); the JDK is no dependency.
- The public API is the `public` types and their `public` members (in interfaces every member that is not `private`): classes with their superclass and interfaces as bases, interfaces, enums with methods, records (components as read-only fields), annotation types, nested types as `Outer__Inner`, constructors, overloads, static and final members, generics with bounds and wildcards, varargs and arrays. `abstract`, `final`, `sealed`, `record` and `annotation` are decorators on the class. The mapping is in `docs/FORMAT.md`.
- `push` explains Java sketches to the agent and suggests `mvn -q compile` as a `verifyCommands` entry.
