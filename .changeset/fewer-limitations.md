---
"archlock": minor
---

Fewer blind spots in the sketches, typed mode for TypeScript, and a lighter install.

- **Receivers and signature modifiers are compared.** A receiver that is not the language's usual one is written `self: T`: Rust `&mut self`, `self` and `self: Box<Self>` (`self: '&mut Self'`, `self: Self`, `self: Box[Self]`), Go value receivers (`def Valid(self: Role)`). Java `throws` clauses and Rust `unsafe`, `const` and `extern "C"` functions are decorators on the `def` (`@throws(IOException)`, `@unsafe`, `@const`, `@extern("C")`).
- **Build variants are all checked.** Go files with different build constraints and Rust `#[cfg]` items that define one name with different signatures become `@overload`s marked `@build("windows")` or `@cfg(unix)`, instead of only the first file counting. Go interfaces with unexported methods are marked `@sealed`.
- **Enum values.** Literal values are part of the sketch (`Paid = 2`, `Sent = 'sent'`) for TypeScript, Python, Rust and C#; `Name = ...` leaves a value open and matches any value, so existing sketches stay valid. Rust variant data is now written as an annotation, `Circle: '{ radius: f64 }'`.
- **Constructor order of dataclasses and records is checked.** Python dataclasses, Java records and C# positional records list their constructor fields in constructor order. Existing Python sketches show these fields in a new order once: run `archlock accept`.
- **C#:** operators and conversion operators are part of the sketch (`@staticmethod def __add__(a: Money, b: Money) -> Money`, `__implicit__`, `__explicit__`), enum values too, and extension method calls (`services.AddEventBus()`) are dependencies on the file that declares them.
- **TypeScript:** CommonJS exports (`module.exports = { … }`, `exports.x = …`) are exports; re-exports of external packages are listed (`from hono.node_server import serve`); a name that needs mangling (`user$`) no longer collides with one that is already valid (`user_`).
- **Vue and Nuxt templates:** components used in a template without an import (auto-imported by Nuxt or `unplugin-vue-components`, found through `components.d.ts` or Nuxt's naming rule, also as `<LazyX>`) are dependencies. Vite `resolve.alias` entries and a custom Nuxt `srcDir` resolve.
- **Typed mode (opt-in):** `archlock init --typed`, or `"typed": true` in `archlock.config.json`, lets the TypeScript type checker fill in the types TypeScript and JavaScript code leaves out. Types it cannot resolve stay `'<inferred>'`; inferred types longer than 200 characters are `'<complex>'`.
- **`accept` keeps the comments of renamed symbols** and class members when the rename is unambiguous (same shape, new name), and lists them; `--json` has `movedComments`.
- **`archlock mcp` implements the protocol itself.** The MCP SDK and `zod` are no longer runtime dependencies: an install brings 12 packages instead of about 100. The tools and their output are unchanged.
