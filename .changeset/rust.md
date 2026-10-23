---
"archlock": minor
---

Rust.

- `.rs` files are extracted with the tree-sitter Rust grammar (WASM, shipped in the package). `init` makes one module per crate in a Cargo workspace, and splits a single crate into its top-level modules plus the crate root. Test, example, benchmark and fuzz crates are skipped.
- Paths resolve through the module tree (`mod` files, `mod.rs`, `#[path]`) and the Cargo manifests: `crate::`, `self::`, `super::`, own modules, workspace crates (also renamed and path dependencies) and external crates; the standard library is no dependency. Paths used in code without a `use` (`crate::util::helper()`) count too.
- The public API is what the crate root (or a module's entry) reaches: `pub` items, `pub use` re-exports (with `as` and globs), `pub extern crate`, nested `pub mod`s as `child__item`, and `#[macro_export]` macros. `pub(crate)` items, private modules and binaries are not public; Rust's visibility rules also apply to path resolution.
- Structs (pub fields; derived and implemented traits as bases), enums with variant data (`Circle = '{ radius: f64 }'`) and methods, traits (supertraits, associated types and constants), `impl` blocks from any file of the crate, type aliases, constants, statics, lifetimes and generics with `where` bounds. Items inside item-level macros (`cfg_rt! { … }`, `cfg_if!`) are read when they parse as Rust; `#[cfg(test)]` code is skipped.
- `push` explains Rust sketches to the agent and suggests `cargo check` as a `verifyCommands` entry.

Sketch format: enum members can carry data (`Name = '(u8, u8)'`) and enums can have methods. Python and TypeScript sketches are unchanged; an enum with a non-enum base now renders as `class Color(str, Enum)` (it used to lose `Enum`).
