import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { moduleFromCode } from "../../src/engine/fromcode.js";
import type { FileFacts } from "../../src/extract/facts.js";
import { buildProject } from "../../src/extract/project.js";
import { linkedResolver } from "../../src/extract/resolution.js";
import { parseToml, type RustCrate, readCargoCrates } from "../../src/extract/rust/cargo.js";
import { linkRustCrates } from "../../src/extract/rust/crate.js";
import { extractRustFile } from "../../src/extract/rust/file.js";
import { renderSketch } from "../../src/sketch/render.js";
import { getRustParser } from "../../src/sketch/treesitter.js";
import { FIXTURES } from "../helpers/fixtures.js";

function crate(over: Partial<RustCrate> = {}): RustCrate {
  return {
    dir: "",
    packageName: "demo",
    libName: "demo",
    libRoot: "src/lib.rs",
    binRoots: [],
    deps: new Map(),
    ...over,
  };
}

async function linked(files: Record<string, string>, crates = [crate()]): Promise<FileFacts[]> {
  const parser = await getRustParser();
  const facts = Object.entries(files).map(([path, code]) => extractRustFile(parser, path, code));
  linkRustCrates("/nonexistent", facts, crates, () => "m");
  return facts;
}

/** The symbol part of the sketch of a crate whose root is `src/lib.rs`. */
async function sketchOf(files: Record<string, string>): Promise<string> {
  const facts = await linked(files);
  const project = buildProject(
    facts,
    [{ name: "m", paths: ["src/**"], entry: "src/lib.rs" }],
    () => linkedResolver,
  );
  const text = renderSketch(moduleFromCode(project.modules.get("m") as never));
  return text.split("\n").slice(4).join("\n").trim();
}

const lib = (code: string) => sketchOf({ "src/lib.rs": code });

describe("Rust → sketch mapping", () => {
  it("functions: references, lifetimes, generics with where, async, patterns, no result", async () => {
    expect(
      await lib(`pub fn split<'a>(text: &'a str, sep: char) -> Vec<&'a str> { todo!() }
pub async fn fetch(url: impl AsRef<str>) -> Result<Vec<u8>, Box<dyn std::error::Error + Send>> { todo!() }
pub fn apply<F, T: Clone>(f: F, (a, b): (T, T)) where F: Fn(T) -> T {}
pub fn from(r#in: u8) {}
fn private() {}
pub(crate) fn internal() {}`),
    ).toBe(`def apply['F: Fn(T) -> T', T: Clone](f: F, _2: '(T, T)'): ...
async def fetch(url: 'impl AsRef[str]') -> 'Result[Vec[u8], Box[dyn std::error::Error + Send]]': ...
def from_(in_: u8): ...
def split["'a"](text: "&'a str", sep: char) -> "Vec[&'a str]": ...`);
  });

  it("structs: public fields, tuple and unit structs, derives as bases", async () => {
    expect(
      await lib(`#[derive(Debug, Clone, serde::Serialize)]
pub struct User<T> { pub id: u64, pub(crate) email: String, secret: String, pub data: T }
pub struct Id(pub u64, u8);
pub struct Marker;`),
    ).toBe(`class Id:
    _0: u64

class Marker: ...

class User[T](Clone, Debug, 'serde::Serialize'):
    data: T
    id: u64`);
  });

  it("enums: variant data, discriminants, derives, methods and implemented traits", async () => {
    expect(
      await lib(`#[derive(Debug)]
pub enum Shape { Circle { radius: f64 }, Rect(f64, f64), Point, Big = 10 }
impl Shape {
    pub fn area(&self) -> f64 { 0.0 }
    pub fn unit() -> Self { Shape::Point }
    fn hidden(&self) {}
}
impl std::fmt::Display for Shape {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { Ok(()) }
}`),
    ).toBe(`class Shape(Debug, 'std::fmt::Display', Enum):
    Circle: '{ radius: f64 }'
    Rect: '(f64, f64)'
    Point = ...
    Big = 10
    def area(self) -> f64: ...
    @staticmethod
    def unit() -> Self: ...`);
  });

  it("traits: supertraits, associated types and constants, default and static methods", async () => {
    expect(
      await lib(`pub trait Store: Send + Sync + 'static {
    type Item: Clone;
    const MAX: usize;
    fn get(&self, id: u64) -> Option<Self::Item>;
    fn len(&self) -> usize { 0 }
    fn open(path: &str) -> Self where Self: Sized;
}`),
    ).toBe(`class Store(Send, Sync, "'static", Protocol):
    Item: 'type: Clone'
    MAX: ClassVar[usize]
    def get(self, id: u64) -> 'Option[Self::Item]': ...
    def len(self) -> usize: ...
    @staticmethod
    def open['where Self: Sized'](path: '&str') -> Self: ...`);
  });

  it("impl blocks in other files attach to their type; consts too", async () => {
    expect(
      await sketchOf({
        "src/lib.rs": "pub mod model;\nmod ops;\n",
        "src/model.rs": "pub struct Cart { pub items: Vec<u64> }\n",
        "src/ops.rs": `use crate::model::Cart;
impl Cart {
    pub const MAX: usize = 10;
    pub fn total(&self) -> u64 { 0 }
}
impl Default for Cart { fn default() -> Self { Cart { items: vec![] } } }
impl crate::model::Cart { pub fn clear(&mut self) {} }`,
      }),
    ).toBe(`class model__Cart(Default):
    items: Vec[u64]
    MAX: ClassVar[usize]
    def clear(self: '&mut Self'): ...
    def total(self) -> u64: ...`);
  });

  it("the public API is what the crate root reaches: pub mod, pub use, inline modules, macros", async () => {
    expect(
      await sketchOf({
        "src/lib.rs": `pub mod net;
mod private;
pub use private::Visible;
pub use private::Renamed as Alias;
pub use self::net::http::*;
pub mod prelude { pub fn hello() {} fn quiet() {} }
pub(crate) mod internal { pub fn hidden() {} }`,
        "src/net.rs": "pub mod http;\nmod tls;\npub fn connect() {}\n",
        "src/net/http.rs": "pub struct Request;\npub fn get() {}\n",
        "src/net/tls.rs": "pub fn handshake() {}\n",
        "src/private.rs": `pub struct Visible;
pub struct Renamed;
pub struct Hidden;
#[macro_export]
macro_rules! shout { () => {}; }`,
      }),
    ).toBe(`class Alias: ...
class net__http__Request: ...
class Request: ...
class Visible: ...

def get(): ...
def net__connect(): ...
def net__http__get(): ...
def prelude__hello(): ...

shout: 'macro_rules!'`);
  });

  it("pub extern crate re-exports another crate", async () => {
    const facts = await linked(
      {
        "facade/src/lib.rs": "pub extern crate grep_cli as cli;\nextern crate alloc;\n",
        "cli/src/lib.rs": "pub fn run() {}\n",
      },
      [
        crate({ dir: "cli", libName: "grep_cli", libRoot: "cli/src/lib.rs" }),
        crate({ dir: "facade", libName: "grep", libRoot: "facade/src/lib.rs" }),
      ],
    );
    const facade = facts.find((f) => f.path === "facade/src/lib.rs");
    expect([...(facade?.exports ?? [])]).toEqual([
      ["cli__run", { kind: "reexport", specifier: "file:cli/src/lib.rs", name: "run" }],
    ]);
    expect(facade?.imports.map((i) => i.specifier)).toEqual(["file:cli/src/lib.rs"]);
  });

  it("items inside item-level macros: cfg-style blocks and cfg_if branches", async () => {
    expect(
      await sketchOf({
        "src/lib.rs": `cfg_rt! {
    pub mod runtime;
    pub fn spawn() {}
}
cfg_if::cfg_if! {
    if #[cfg(unix)] {
        pub fn path() -> &'static str { "/" }
    } else {
        pub fn path() -> &'static str { "C:" }
    }
}
lazy_static! { pub static ref CONFIG: u8 = 1; }
thread_local! { static DEPTH: Cell<u8> = Cell::new(0) }
not_items! { 1 + 2 }`,
        "src/runtime.rs": "pub struct Runtime;\n",
      }),
    ).toBe(`class runtime__Runtime: ...

def path() -> "&'static str": ...
def spawn(): ...

CONFIG: u8`);
  });

  it("private modules are only entered from where they are visible", async () => {
    expect(
      await sketchOf({
        "src/lib.rs": "pub mod task;\npub use task::spawn;\n",
        "src/task.rs": "mod spawn;\npub(crate) mod pool;\npub use spawn::spawn;\n",
        "src/task/spawn.rs": "pub fn spawn() {}\n",
        "src/task/pool.rs": "pub struct Pool;\n",
      }),
    ).toBe(`def spawn(): ...
def task__spawn(): ...`);
  });

  it("test code is not part of the API or the dependencies", async () => {
    const [f] = await linked(
      {
        "src/lib.rs": `pub fn run() {}
#[cfg(test)]
mod tests { use super::*; use tempfile::tempdir; #[test] fn t() { crate::run(); } }
#[cfg(test)]
pub fn helper() {}`,
      },
      [crate({ deps: new Map([["tempfile", { package: "tempfile", path: null }]]) })],
    );
    expect([...(f?.exports.keys() ?? [])]).toEqual(["run"]);
    expect(f?.imports).toEqual([]);
  });

  it("paths resolve to files, workspace crates, dependencies and the standard library", async () => {
    const facts = await linked(
      {
        "core/src/lib.rs": "pub mod model;\npub fn run() {}\n",
        "core/src/model.rs": "pub struct User;\npub mod admin;\n",
        "core/src/model/admin.rs": `use super::User;
use crate::run;
use self::sub::Thing;
use std::collections::HashMap;
use json::Value;
use mystery::Thing2;
mod sub;
pub fn check() { serde_json::to_string(&1); crate::model::User; Vec::<u8>::new(); }`,
        "core/src/model/admin/sub.rs": "pub struct Thing;\n",
        "app/src/main.rs": "use core_lib::model::User;\nfn main() { core_lib::run(); }\n",
      },
      [
        crate({
          dir: "core",
          libName: "core_lib",
          libRoot: "core/src/lib.rs",
          deps: new Map([
            ["json", { package: "serde_json", path: null }],
            ["serde_json", { package: "serde_json", path: null }],
          ]),
        }),
        crate({
          dir: "app",
          packageName: "app",
          libName: "app",
          libRoot: null,
          binRoots: ["app/src/main.rs"],
        }),
      ],
    );
    const imports = (path: string) =>
      facts.find((f) => f.path === path)?.imports.map((i) => `${i.specifier} ${i.names.join(",")}`);
    expect(imports("core/src/model/admin.rs")).toEqual([
      "file:core/src/model.rs User",
      "file:core/src/lib.rs run",
      "file:core/src/model/admin/sub.rs Thing",
      "external:serde_json *",
      "external:mystery *",
      "external:serde_json *",
      "file:core/src/model.rs User",
    ]);
    expect(imports("app/src/main.rs")).toEqual([
      "file:core/src/model.rs User",
      "file:core/src/lib.rs run",
    ]);
    // A binary has no public API.
    expect(facts.find((f) => f.path === "app/src/main.rs")?.exports.size).toBe(0);
  });

  it("receivers other than &self, unsafe/const/extern functions and cfg variants", async () => {
    expect(
      await lib(`pub struct Buf;
impl Buf {
    pub fn len(&self) -> usize { 0 }
    pub fn push(&mut self, b: u8) {}
    pub fn into_vec(self) -> Vec<u8> { vec![] }
    pub fn boxed(self: Box<Self>) {}
    pub const fn new() -> Self { Buf }
    pub unsafe fn raw(&self) -> *const u8 { todo!() }
}
pub extern "C" fn hook(x: i32) -> i32 { x }
#[cfg(unix)]
pub fn home() -> String { String::new() }
#[cfg(windows)]
pub fn home(user: &str) -> String { String::new() }`),
    ).toBe(`class Buf:
    def boxed(self: Box[Self]): ...
    def into_vec(self: Self) -> Vec[u8]: ...
    def len(self) -> usize: ...
    @staticmethod
    @const
    def new() -> Self: ...
    def push(self: '&mut Self', b: u8): ...
    @unsafe
    def raw(self) -> '*const u8': ...

@cfg(unix)
@overload
def home() -> String: ...
@cfg(windows)
@overload
def home(user: '&str') -> String: ...

@extern("C")
def hook(x: i32) -> i32: ...`);
  });
});

describe("Cargo manifests", () => {
  it("parses the TOML that Cargo uses", () => {
    expect(
      parseToml(`# comment
[package]
name = "my-crate" # trailing
version = '0.1.0'

[lib]
name = "mine"

[[bin]]
name = "tool"
path = "src/tool.rs"

[dependencies]
serde = { version = "1", features = ["derive"] }
json = { package = "serde_json", version = "1" }

[target.'cfg(unix)'.dependencies]
libc = "0.2"

[workspace]
members = [
  "crates/*",
  "tools/gen",
]
`),
    ).toEqual({
      package: { name: "my-crate", version: "0.1.0" },
      lib: { name: "mine" },
      bin: [{ name: "tool", path: "src/tool.rs" }],
      dependencies: {
        serde: { version: "1", features: ["derive"] },
        json: { package: "serde_json", version: "1" },
      },
      target: { "cfg(unix)": { dependencies: { libc: "0.2" } } },
      workspace: { members: ["crates/*", "tools/gen"] },
    });
  });

  it("finds the crates of a workspace with their roots and dependencies", () => {
    const crates = readCargoCrates(join(FIXTURES, "rust-workspace"));
    expect(
      crates.map((c) => ({
        dir: c.dir,
        lib: c.libName,
        libRoot: c.libRoot,
        bins: c.binRoots,
        deps: [...c.deps].map(
          ([k, v]) => `${k}=${v.package}${v.path === null ? "" : ` (${v.path})`}`,
        ),
      })),
    ).toEqual([
      {
        dir: "crates/cli",
        lib: "shop_cli",
        libRoot: null,
        bins: ["crates/cli/src/main.rs"],
        deps: ["shop_core=shop-core (crates/core)", "clap=clap"],
      },
      {
        dir: "crates/core",
        lib: "shop_core",
        libRoot: "crates/core/src/lib.rs",
        bins: [],
        deps: ["serde=serde", "json=serde_json", "tempfile=tempfile"],
      },
    ]);
  });
});
