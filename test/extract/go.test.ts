import { describe, expect, it } from "vitest";
import { moduleFromCode } from "../../src/engine/fromcode.js";
import type { FileFacts } from "../../src/extract/facts.js";
import { attachGoMethods, extractGoFile } from "../../src/extract/go/file.js";
import { GoResolver, parseGoMod } from "../../src/extract/go/resolve.js";
import { buildProject } from "../../src/extract/project.js";
import type { Resolver } from "../../src/extract/resolution.js";
import { renderSketch } from "../../src/sketch/render.js";
import { getGoParser } from "../../src/sketch/treesitter.js";

const noResolver: Resolver = { resolve: () => ({ kind: "unresolved" }) };

async function facts(files: Record<string, string>): Promise<FileFacts[]> {
  const parser = await getGoParser();
  return Object.entries(files).map(([path, code]) => extractGoFile(parser, path, code));
}

/** The symbol part of the sketch of module `m` (`m/**`) built from these files. */
async function sketchOf(files: Record<string, string>): Promise<string> {
  const all = await facts(files);
  attachGoMethods(all);
  const project = buildProject(
    all,
    [{ name: "m", paths: ["m/**"], entry: null }],
    () => noResolver,
  );
  const text = renderSketch(moduleFromCode(project.modules.get("m") as never));
  return text.split("\n").slice(3).join("\n").trim();
}

const one = (code: string) => sketchOf({ "m/a.go": `package m\n\n${code}` });

describe("Go → sketch mapping", () => {
  it("functions: grouped, unnamed and variadic parameters, results, no result", async () => {
    expect(
      await one(`func Join(sep string, a, b int, rest ...string) (n int, err error) { return }
func Hash([]byte, int) uint64 { return 0 }
func Log(_ string) {}
func private() {}`),
    ).toBe(`def Hash(_1: '[]byte', _2: int) -> uint64: ...
def Join(sep: string, a: int, b: int, *rest: string) -> '(int, error)': ...
def Log(_1: string): ...`);
  });

  it("names that are Python keywords get a trailing underscore", async () => {
    expect(
      await one(`type Opt struct { None bool }
func Copy(from, in string, def int) {}`),
    ).toBe(`class Opt:
    None_: bool

def Copy(from_: string, in_: string, def_: int): ...`);
  });

  it("generics: type parameters, constraints, an any constraint is left out", async () => {
    expect(
      await one(`func Map[T, U any](s []T, f func(T) U) []U { return nil }
func Keys[K comparable, V any](m map[K]V) []K { return nil }`),
    ).toBe(`def Keys['K comparable', V](m: 'map[K]V') -> '[]K': ...
def Map[T, U](s: '[]T', f: 'func(T) U') -> '[]U': ...`);
  });

  it("types in Go notation: pointers, slices, arrays, maps, channels, functions", async () => {
    expect(
      await one(
        `func F(a *Config, b [4]byte, c map[string][]*User, d chan<- int, e <-chan error, f func(int, string) (bool, error), g struct{}, h interface{ Close() error }) {}`,
      ),
    ).toBe(
      `def F(
    a: '*Config',
    b: '[4]byte',
    c: 'map[string][]*User',
    d: 'chan<- int',
    e: '<-chan error',
    f: 'func(int, string) (bool, error)',
    g: 'struct{}',
    h: 'interface{ Close() error }',
): ...`,
    );
  });

  it("structs: exported fields, embedded types as bases, no tags; generic structs", async () => {
    expect(
      await one(`type User struct {
	ID, Name string \`json:"name"\`
	age      int
	*Base
	io.Reader
}
type Page[T any] struct { Items []T }`),
    ).toBe(`class Page[T]:
    Items: '[]T'

class User('*Base', io.Reader):
    ID: string
    Name: string`);
  });

  it("interfaces: methods, embedded interfaces, type sets; unexported methods are hidden", async () => {
    expect(
      await one(`type Store interface {
	io.Closer
	Get(ctx context.Context, id string) (*User, error)
	sealed()
}
type Number interface { ~int | ~float64 }`),
    ).toBe(`class Number('~int | ~float64', Protocol): ...

class Store(io.Closer, Protocol):
    def Get(self, ctx: context.Context, id: string) -> '(*User, error)': ...`);
  });

  it("defined types have their underlying type as base; aliases are type aliases", async () => {
    expect(
      await one(`type ID string
type Handler func(w http.ResponseWriter, r *http.Request)
type Name = string
type List[T any] = []T`),
    ).toBe(`List: TypeAlias[T] = '[]T'
Name: TypeAlias = string

class Handler('func(w http.ResponseWriter, r *http.Request)'): ...
class ID(string): ...`);
  });

  it("methods from every file of the package attach to their type, pointer or value receiver", async () => {
    expect(
      await sketchOf({
        "m/user.go": "package m\n\ntype User struct{ Name string }\ntype Role int\n",
        "m/methods.go": `package m
func (u *User) Rename(name string) { u.Name = name }
func (u User) String() string { return u.Name }
func (r Role) Valid() bool { return true }
func (p *Pair[K, V]) Swap() {}
func (u *User) secret() {}`,
        "m/pair.go": "package m\n\ntype Pair[K comparable, V any] struct{}\n",
      }),
    ).toBe(`class Pair['K comparable', V]:
    def Swap(self): ...

class Role(int):
    def Valid(self) -> bool: ...

class User:
    Name: string
    def Rename(self, name: string): ...
    def String(self) -> string: ...`);
  });

  it("constants and variables: iota groups repeat their type; evident value types", async () => {
    expect(
      await one(`type Color int
const (
	Red Color = iota
	Green
	blue
)
const (
	KB = 1 << (10 * (iota + 1))
	MB
)
const Version = "1.0"
const Max, Min int = 10, 1
const Debug = !false
const Timeout = time.Second
var ErrClosed = errors.New("closed")
var Default = &Config{}
var Zero = Point{}
var Verbose = false
var Ratio = 0.5
var Now = time.Now()
var (
	Count int
	Names []string
)`),
    ).toBe(`class Color(int): ...

Count: int
Debug: 'untyped bool'
Default: '*Config'
ErrClosed: error
Green: Color
KB: 'untyped int'
Max: int
MB: 'untyped int'
Min: int
Names: '[]string'
Now: '<inferred>'
Ratio: float64
Red: Color
Timeout: '<inferred>'
Verbose: bool
Version: 'untyped string'
Zero: Point`);
  });

  it("main packages and files excluded from every build export nothing", async () => {
    expect(await sketchOf({ "m/main.go": "package main\n\nfunc Run() {}\n" })).toBe("");
    const [ignored] = await facts({
      "m/gen.go": '//go:build ignore\n\npackage main\n\nimport "example.com/x"\n\nfunc main() {}\n',
    });
    expect(ignored?.imports).toEqual([]);
  });

  it("build variants of one package define a name once; other packages qualify it", async () => {
    const all = await facts({
      "m/a/path_linux.go": 'package a\n\nfunc Path() string { return "/" }\n',
      "m/a/path_windows.go": "package a\n\nfunc Path() string { return `C:\\\\` }\n",
      "m/b/path.go": 'package b\n\nfunc Path() string { return "" }\n',
    });
    const project = buildProject(
      all,
      [{ name: "m", paths: ["m/**"], entry: null }],
      () => noResolver,
    );
    expect(project.modules.get("m")?.symbols.map((s) => s.name)).toEqual(["a__Path", "b__Path"]);
  });

  it("imports keep their positions; every import is a whole-package import", async () => {
    const [f] = await facts({
      "m/a.go":
        'package m\n\nimport (\n\t"fmt"\n\tx "example.com/x"\n\t_ "embed"\n)\n\nimport "C"\n',
    });
    expect(f?.imports.map((i) => [i.specifier, i.names, i.line, i.column])).toEqual([
      ["fmt", ["*"], 4, 2],
      ["example.com/x", ["*"], 5, 2],
      ["embed", ["*"], 6, 2],
      ["C", ["*"], 9, 8],
    ]);
  });
});

describe("Go import resolution", () => {
  it("parses module, require and local replace directives", () => {
    expect(
      parseGoMod(`module example.com/shop // the service

go 1.22

require (
	github.com/google/uuid v1.6.0 // indirect
	golang.org/x/sync v0.7.0
)
require example.com/shared v0.0.0
replace example.com/shared => ./shared
replace github.com/old/lib => github.com/new/lib v1.0.0
`),
    ).toEqual({
      module: "example.com/shop",
      requires: ["github.com/google/uuid", "golang.org/x/sync", "example.com/shared"],
      replaces: [{ from: "example.com/shared", to: "./shared" }],
    });
  });

  it("module packages, the standard library, cgo and external modules", () => {
    const r = new GoResolver(
      "/nonexistent",
      {
        modules: [
          { path: "example.com/shop/tools", dir: "tools" },
          { path: "example.com/shop", dir: "" },
        ],
        requires: ["golang.org/x/sync"],
      },
      [
        "main.go",
        "internal/store/b.go",
        "internal/store/a.go",
        "internal/store/a_test.go",
        "tools/gen.go",
      ],
    );
    expect(r.resolve("example.com/shop/internal/store")).toEqual({
      kind: "file",
      path: "internal/store/a.go",
    });
    expect(r.resolve("example.com/shop")).toEqual({ kind: "file", path: "main.go" });
    expect(r.resolve("example.com/shop/tools")).toEqual({ kind: "file", path: "tools/gen.go" });
    expect(r.resolve("example.com/shop/missing")).toEqual({ kind: "unresolved" });
    expect(r.resolve("net/http")).toEqual({ kind: "builtin" });
    expect(r.resolve("C")).toEqual({ kind: "builtin" });
    expect(r.resolve("golang.org/x/sync/errgroup")).toEqual({
      kind: "external",
      package: "golang.org/x/sync",
    });
    expect(r.resolve("github.com/google/uuid/v2/x")).toEqual({
      kind: "external",
      package: "github.com/google/uuid",
    });
  });
});
