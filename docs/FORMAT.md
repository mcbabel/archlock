# The sketch format (`.arch.py`)

A **sketch** describes one module of your codebase: which files belong to it, which other
modules it may depend on, and its public API. There is one sketch per module, stored as
`archlock/<module>.arch.py` at the repository root.

Sketches are **valid Python syntax**, whatever language your project is written in. That gives
you syntax highlighting everywhere, one parser for every language, and a format that humans and
LLMs read fluently. archlock never runs a sketch; it only parses it.

```python
"""Billing: create invoices and record payments."""

__module__ = "billing"
__paths__ = ["src/billing/**"]
__entry__ = "src/billing/index.ts"
__depends_on__ = ["db", "events"]
__external__ = ["stripe"]

class InvoiceStatus(Enum):
    Draft = ...
    Sent = ...
    Paid = ...

CustomerId: TypeAlias = string

class PaymentGateway(Protocol):  # TS interface
    def charge(self, amount: Money) -> Promise[ChargeResult]: ...

class Invoice:
    id: InvoiceId
    lines: Array[Line]
    status: '"draft" | "sent" | "paid"'
    # invariant: total equals the sum of line amounts
    def total(self) -> Money: ...

def create_invoice(customer: CustomerId, lines: Array[Line]) -> Invoice: ...

async def mark_paid(id: InvoiceId, payment: PaymentRef) -> Invoice:
    # must: emits events.InvoicePaid exactly once
    ...
```

## Two levels of contract

| Level | What | Checked by |
|---|---|---|
| **Hard** | module set, `__depends_on__`, `__external__` (if present), public symbols with their kind and signature | `archlock check` (can fail CI) |
| **Soft** | docstrings, `# invariant: …`, `# must: …`, `# never: …` and all other comments | never blocks CI; preserved by `archlock accept`; reviewed by `archlock audit` (optional, via your agent) |

## Header

The header comes first: an optional module docstring, then these assignments.

| Field | Required | Value |
|---|---|---|
| `__module__` | yes | Module name: a Python-style name (letters, digits, `_`), optionally dotted (`billing.api`). Must match the file name (`billing` → `billing.arch.py`). |
| `__paths__` | yes | List of globs (POSIX, relative to the repo root) of the module's source files. |
| `__entry__` | no | The module's entry file. If set (or if `index.ts`/`index.tsx`/`__init__.py` exists in the module root), the public API is exactly what the entry exports. |
| `__depends_on__` | no (default `[]`) | Internal modules this module may import. Always written by archlock, sorted. |
| `__external__` | no | External packages this module may import. Only checked when present (`[]` means "none allowed"). |
| `__strictness__` | no (default `"signatures"`) | `"signatures"`: names, kinds and signatures are checked. `"names"`: only names and kinds. `"deps"`: only dependencies. Useful to adopt archlock gradually in large repos. |

Re-exports of symbols defined in another module may follow the header as
`from .other import a, b`. Re-exports of an external package through the module's
`__entry__` name the package (`from hono.node_server import serve` for
`export { serve } from "@hono/node-server"`); without an entry they are left out, since every
file's exports count then and pass-through files (icon registries) would flood the sketch. They
are documentation only and never checked.

## Symbols

Symbols are rendered in groups, each sorted alphabetically (case-insensitive): **enums, type
aliases, protocols (interfaces), classes, functions, constants.** Members of a class are
rendered fields first (alphabetical), then methods (`__init__` first, then alphabetical).

In classes marked `@dataclass` or `@record` the constructor fields come first, in constructor
order, and that order is checked: swapping two fields changes every positional call
(`field order: sketch (y, x) · code (x, y)`). Their other fields follow alphabetically.

Enum members keep their source order because it can be meaningful:

| Member | Meaning |
|---|---|
| `Draft = ...` | the value is open: any value matches |
| `Paid = 2`, `Sent = 'sent'`, `On = True` | the value (a Python literal) is part of the contract |
| `Circle: '{ radius: f64 }'`, `Rect: '(f64, f64)'` | the member carries data of this type (Rust) |

`archlock init` writes the values the code spells out as literals; a value it cannot read
(`A = 1 << 2`, `object()`) stays `...`. Methods of an enum follow its members.

### Receivers and signature decorators

A method's first parameter is `self` (`cls` for class methods, none for `@staticmethod`). When
the language has several kinds of receiver, `self: T` names one that is not the usual one:
`def clear(self: '&mut Self')` (Rust, where `&self` is the default) or `def Valid(self: Role)`
(a Go value receiver; a pointer receiver is the default). A receiver change is a signature
change.

Decorators directly above a `def` are part of that signature:

| Decorator | Meaning |
|---|---|
| `@throws(IOException, InterruptedException)` | Java `throws` clause |
| `@unsafe`, `@const`, `@extern("C")` | Rust `unsafe fn`, `const fn`, `extern "C" fn` |
| `@build("linux \|\| darwin")`, `@cfg(unix)` | one build variant of a name (Go build constraints, Rust `#[cfg]`) |

Build variants with equal signatures are one `def`; variants that differ become `@overload`s,
each with its `@build` or `@cfg` decorator, so every variant is checked.

### Mapping from TypeScript

| TypeScript | Sketch |
|---|---|
| `export function f(a: A, b?: B, ...rest: C[]): R` | `def f(a: A, b: B = ..., *rest: 'C[]') -> R: ...` |
| `export async function f(): Promise<R>` | `async def f() -> Promise[R]: ...` |
| overloads | several `def`s, each marked `@overload` |
| `export class C extends B implements I` | `class C(B, I):` |
| class field `x: T` / `readonly x: T` / `x?: T` / `static x: T` | `x: T` / `x: Readonly[T]` / `x: Opt[T]` / `x: ClassVar[T]` |
| method / static method / abstract method / optional method | `def m(self, …)` / `@staticmethod` / `@abstractmethod` / `@optional` |
| constructor | `def __init__(self, …): ...` (no return type) |
| `export interface I extends J` | `class I(J, Protocol):` |
| interface call / index signature | `def __call__(self, …)` / `def __getitem__(self, key: K) -> V` |
| `export type T = …` | `T: TypeAlias = …` |
| generic type alias `type R<T, E> = …` | `R: TypeAlias[T, E] = …` |
| `export enum E { A, B = 2, C = "c" }` | `class E(Enum):` with `A = ...`, `B = 2`, `C = 'c'` |
| `export const X: T = …` | `X: T` |
| `export default …` | the symbol is named `default` |
| CommonJS `module.exports = { a, b }`, `exports.c = …`, `module.exports = X` | `a`, `b`, `c` as if exported; `module.exports = X` is the default export |
| generics `<T extends U>` | `def f[T, 'K extends keyof T'](…)` (see type parameters) |

Private and protected members (`private`, `protected`, `#x`) are not part of the sketch: the
public API is what other modules can call. Names that are not valid Python identifiers are
mangled (`user$` → `user_`); a name that is already valid keeps itself, and a mangled one that
would collide with it gets another `_` (`user__`).

With `"typed": true` in `archlock.config.json` (or `archlock init --typed`), the TypeScript type
checker fills in what the code leaves out: return types, unannotated constants, fields and
getters, and parameters with a default value. It reads the project's `tsconfig.json` files and
installed type declarations; a type it cannot resolve stays `'<inferred>'`, and an inferred type
longer than 200 characters is written `'<complex>'` (its exact spelling is not a useful
contract). Without typed mode, extraction is purely syntactic. Typed mode does not apply to
`.vue`, `.svelte` and `.astro` files.

### Mapping from components (Vue, Svelte, Astro)

`.vue`, `.svelte` and `.astro` files are read through their scripts: Vue's `<script>` and
`<script setup>`, Svelte's instance and module scripts, and Astro's frontmatter plus its
bundled client `<script>`s. Their imports are dependencies like any TypeScript import. The
component itself is a public symbol named after its file (`user-card.vue` → `UserCard`,
`dialog/index.vue` → `Dialog`), a class whose fields are its props and its events:

| Component | Sketch |
|---|---|
| a Vue / Svelte / Astro component | `class UserCard(VueComponent):` / `(SvelteComponent)` / `(AstroComponent)` |
| a prop `title: string` / optional prop `size?: number` | `title: string` / `size: Opt[number]` |
| props from an imported type (`defineProps<BaseProps>()`, `$props()` typed with it) | a base: `class Card(VueComponent, BaseProps):` |
| Vue runtime props `{ name: { type: String, required: true }, meta: Object }` | `name: string`, `meta: Opt[Record[string, unknown]]` |
| Vue props or emits from an object (`defineProps(buttonProps)`) | a base: `'typeof buttonProps'` |
| an event `change` with payload `(value: string)` | `onChange: Opt['(value: string) => void']` |
| Vue `update:modelValue`, `calendar-change` | `self["onUpdate:modelValue"]`, `onCalendarChange` (Vue's listener names) |
| Vue `defineModel<boolean>()` | `modelValue: Opt[boolean]` plus its `onUpdate:modelValue` event |
| Svelte 4 `export let value: number` / `createEventDispatcher<{ commit: number }>()` | `value: number` / `onCommit: Opt['(event: CustomEvent[number]) => void']` |
| `<script setup generic="T">`, Svelte `generics="T"` | `class List[T](VueComponent):` |
| other exports (Vue's plain `<script>`, Svelte's module script, Astro frontmatter) | as in TypeScript |

Components a Vue template uses without importing them are dependencies too: auto-imported ones
are found through the `components.d.ts` files that Nuxt and `unplugin-vue-components` generate
and, for Nuxt projects without one, through Nuxt's naming rule (`components/base/Button.vue` is
`<BaseButton>`, `<LazyBaseButton>` loads it lazily). Framework components such as `<NuxtLink>`
and `<RouterLink>` have no file in the repository and are no dependency. Path aliases come from
`tsconfig.json`, Vite's `resolve.alias` (read as text), SvelteKit's `$lib` and Nuxt's `~`, `@`,
`~~` and `@@` (honouring a custom `srcDir`).

Local `interface`s and type aliases are expanded into fields, also across `&` and `extends`;
types defined elsewhere become bases. Untyped props (`let { text } = $props()`) are
`'<inferred>'`. Route files are not components: files whose name starts with `+` (SvelteKit)
and files under a `pages/` directory (Astro, Nuxt) keep only their other exports.

### Mapping from Go

A module is a Go package: `init` makes one per directory with Go files (`internal/store/*.go` →
`internal.store`). Its public symbols are the exported (capitalized) identifiers; a `main`
package has none. Types stay Go types, written the way gofmt writes them.

| Go | Sketch |
|---|---|
| `func New(path string, opts ...Option) (*Store, error)` | `def New(path: string, *opts: Option) -> '(*Store, error)': ...` |
| named results `(n int, err error)` / no result | `-> '(int, error)'` / no `->` |
| unnamed or blank parameters `func(int, string)`, `_ string` | `_1: int, _2: string` (by position) |
| `func Map[T, U any](…)`, `[K comparable]` | `def Map[T, U](…)`, `['K comparable']` (an `any` constraint is left out) |
| `type User struct { ID string; *Base; io.Reader }` | `class User('*Base', io.Reader):` with `ID: string` (embedded types are bases) |
| method `func (u *User) Name() string` in any file of the package | `def Name(self) -> string: ...` inside `class User` |
| value receiver `func (r Role) Valid() bool` | `def Valid(self: Role) -> bool: ...` |
| `type Store interface { io.Closer; Get(id ID) (*User, error) }` | `class Store(io.Closer, Protocol):` with `def Get(self, id: ID) -> '(*User, error)'` |
| type set `interface { ~int \| ~float64 }` | `class Number('~int \| ~float64', Protocol): ...` |
| an interface with unexported methods (only the package can implement it) | `@sealed` above the class |
| defined type `type ID string`, `type Handler func(…)` | `class ID(string):`, `class Handler('func(…)'):` (with their methods) |
| alias `type Name = string` | `Name: TypeAlias = string` |
| `const ( Red Color = iota; Green )` | `Red: Color`, `Green: Color` (Go has no enums; the iota idiom stays constants) |
| untyped constant `const Version = "1.0"` | `Version: 'untyped string'` (`untyped int`, `untyped float`, `untyped bool`, …) |
| `var Count int`, `var ErrClosed = errors.New(…)`, `var Default = &Config{}` | `Count: int`, `ErrClosed: error`, `Default: '*Config'`; other values are `'<inferred>'` |

Struct tags and unexported fields and methods are not part of the sketch: tags are serialization
details, unexported members are not callable from other packages. Files with `//go:build ignore`
are not part of their package. Build variants (`path_linux.go`, `path_windows.go`, a `//go:build`
line) with equal signatures are one symbol; when they differ, each becomes an `@overload` with
its `@build("…")` constraint.

### Mapping from Rust

A module is a crate in a Cargo workspace; a single crate is split into its top-level modules
(`src/parser.rs` with `src/parser/**`) plus one module for the crate root. A module's API is what
its `__entry__` (`lib.rs`, `mod.rs` or the module file) makes public: `pub` items, `pub use`
re-exports and, for `pub mod` children inside the same module, their items as `child__item`
(`net::TcpListener` → `net__TcpListener`). `pub(crate)` and `pub(super)` items, private modules
and binaries have no public API. Types stay Rust types, with `<…>` written `[…]` as for
TypeScript.

| Rust | Sketch |
|---|---|
| `pub fn split<'a>(s: &'a str, sep: char) -> Vec<&'a str>` | `def split["'a"](s: "&'a str", sep: char) -> "Vec[&'a str]": ...` |
| generics with bounds and `where` clauses | `def apply['F: Fn(T) -> T', T: Clone](…)` (bounds merged into the parameter) |
| `pub async fn`, no return type | `async def`, no `->` |
| patterns as parameters `(a, b): (u8, u8)` | `_1: '(u8, u8)'` (by position) |
| `#[derive(Debug, Clone)] pub struct User { pub id: u64, name: String }` | `class User(Clone, Debug):` with `id: u64` (`pub` fields only) |
| tuple and unit structs `pub struct Id(pub u64);`, `pub struct Marker;` | `class Id:` with `_0: u64`, `class Marker: ...` |
| `impl User { pub fn name(&self) -> &str; pub fn new() -> Self }` in any file of the crate | `def name(self) -> '&str'` and `@staticmethod def new() -> Self` inside `class User` |
| `&mut self`, `self`, `self: Box<Self>` | `self: '&mut Self'`, `self: Self`, `self: Box[Self]` |
| `pub const fn`, `pub unsafe fn`, `pub extern "C" fn` | `@const`, `@unsafe`, `@extern("C")` above the `def` |
| `#[cfg(unix)] pub fn home()` and `#[cfg(windows)] pub fn home(user: &str)` | two `@overload`s marked `@cfg(unix)` and `@cfg(windows)` |
| `impl Display for User` | `Display` becomes a base of `User` (bases are sorted) |
| `pub enum Shape { Circle { r: f64 }, Rect(f64, f64), Point, Big = 10 }` | `class Shape(Enum):` with `Circle: '{ r: f64 }'`, `Rect: '(f64, f64)'`, `Point = ...`, `Big = 10` |
| `pub trait Store: Send { type Item: Clone; const MAX: usize; fn get(&self) -> Self::Item; }` | `class Store(Send, Protocol):` with `Item: 'type: Clone'`, `MAX: ClassVar[usize]`, `def get(self) -> 'Self::Item'` |
| `pub type Result<T> = std::result::Result<T, Error>;` | `Result: TypeAlias[T] = 'std::result::Result[T, Error]'` |
| `pub const VERSION: &str`, `pub static COUNT: AtomicUsize` | `VERSION: '&str'`, `COUNT: AtomicUsize` |
| `pub mod prelude { pub fn hello() }` (inline) | `def prelude__hello(): ...` |
| `#[macro_export] macro_rules! price` | `price: 'macro_rules!'` (at the crate root) |
| `pub use self::model::User as Account;`, `pub extern crate grep_cli as cli;` | `Account` (the struct), `from .grep_cli import cli` |

Items inside item-level macros such as `cfg_rt! { … }` and the branches of `cfg_if!` are read as
items when they parse as Rust. `#[cfg(test)]` and `#[test]` code is skipped. The methods of an
`impl Trait for Type` block are not repeated on the type: the trait is a base, and its methods
are in the trait's own sketch.

### Mapping from Java

`init` makes one module per source root of a multi-module Maven or Gradle build, and splits a
single source root into the direct subpackages of its common root package (`com.acme.shop.order`
→ `order`) plus one module for the root package's classes. Test roots (`src/test/java`) are not
modules. A module's API is the `public` types of its packages; the members of a type are its
`public` fields, methods and constructors, and in interfaces and annotation types every member
that is not `private`. Types stay Java types, with `<…>` written `[…]` as for TypeScript.

| Java | Sketch |
|---|---|
| `public class Order extends Base implements Comparable<Order>` | `class Order(Base, Comparable[Order]):` |
| `public abstract`, `public final`, `public sealed` class | `@abstract`, `@final`, `@sealed` above the class |
| `public static final int MAX = 50;` / `public final String id;` / `public String name;` | `MAX: ClassVar[Readonly[int]]` / `id: Readonly[String]` / `name: String` |
| constructors, overloads | `def __init__(self, …)`, several `def`s marked `@overload` |
| `public String read(String path) throws IOException` | `@throws(IOException) def read(self, path: String) -> String` |
| `public static <T> List<T> of(T... items)` | `@staticmethod def of[T](*items: T) -> List[T]` |
| `public abstract Status get(String id)` | `@abstractmethod def get(self, id: String) -> Status` |
| `void`, arrays, wildcards | `-> void`, `'int[]'`, `'Collection[? extends T]'` |
| `public interface Repo<K> extends AutoCloseable { int LIMIT = 5; K find(K id); default … static … }` | `class Repo[K](AutoCloseable, Protocol):` with `LIMIT: ClassVar[Readonly[int]]` and the methods |
| `public enum Status implements Serializable { NEW, PAID; public String label() }` | `class Status(Serializable, Enum):` with `NEW = ...`, `PAID = ...`, `def label(self) -> String` |
| `public record Point(int x, int y) implements Shape` | `@record class Point(Shape):` with `x: Readonly[int]`, `y: Readonly[int]` (in component order) |
| `public @interface Audited { String value() default ""; }` | `@annotation class Audited(Protocol):` with `def value(self) -> String` |
| public nested type `Order.Line` | `class Order__Line` |

Package-private, `protected` and `private` members are not part of the sketch, nor are
annotations, enum constant arguments and bodies, and default values. When two packages
of a module have a type of the same name, both are qualified with their package
(`order__Status`, `api__Status`).

### Mapping from C#

`init` makes one module per project (`.csproj`), named after it (`Ordering.API`), and splits a
single project into its subdirectories. Test, benchmark and sample projects are not modules;
folders of `.cs` files outside every project (shared sources) are. A module's API is the
`public` types of its files and their `public` members (in interfaces every member without an
access modifier). Partial types are one type. Types stay C# types, with `<…>` written `[…]` as
for TypeScript.

| C# | Sketch |
|---|---|
| `public sealed class Order : Entity, IComparable<Order>` | `@sealed class Order(Entity, IComparable[Order]):` |
| `public string Name { get; set; }` / `{ get; }`, `{ get; init; }`, `{ get; private set; }`, `=> …` | `Name: string` / `Readonly[string]` |
| `public const int Max = 1;`, `public static readonly string Prefix` | `Max: ClassVar[Readonly[int]]`, `Prefix: ClassVar[Readonly[string]]` |
| `public event EventHandler? Changed;` | `Changed: 'event EventHandler?'` |
| indexer `public Line this[int index]` | `def __getitem__(self, index: int) -> Line` |
| constructors, overloads | `def __init__(self, …)`, several `def`s marked `@overload` |
| `public static T Parse<T>(string s, out int pos, int retries = 3) where T : new()` | `@staticmethod def Parse['T: new ()'](s: string, pos: 'out int', retries: int = ...) -> T` |
| `params Line[] lines`, `this Order o` (extension method) | `*lines: 'Line[]'`, `o: 'this Order'` |
| `public interface IRepo<TKey> : IDisposable` | `class IRepo[TKey](IDisposable, Protocol):` |
| `public enum Status : byte { New, Paid = 2 }` | `class Status(byte, Enum):` with `New = ...`, `Paid = 2` |
| `public static Money operator +(Money a, Money b)`, `implicit operator`, `explicit operator` | `@staticmethod def __add__(a: Money, b: Money) -> Money`, `__implicit__`, `__explicit__` |
| `public record Invoice(string Id)`, `public readonly record struct Money(decimal Amount)` | `@record class Invoice:` with `Id: Readonly[string]` (parameters in order); `@readonly @record @struct class Money:` |
| `public struct Point`, `public static class Ext`, `abstract` | `@struct`, `@static`, `@abstract` above the class |
| `public delegate void Handler(object sender);` | `Handler: TypeAlias = 'delegate void(object sender)'` |
| public nested type `Order.Line` | `class Order__Line` |

`internal`, `protected`, `private` and `file` members are not part of the sketch, nor are
attributes, static constructors and finalizers. When two folders of a module have a type of the
same name, both are qualified with their folder. Dependencies come from type names, `using`s
and extension method calls: `services.AddEventBus()` depends on the file that declares the
extension method `AddEventBus` when its namespace is in scope and its project is referenced.

### Mapping from Python

Python maps almost 1:1: functions, classes, `Protocol`s, `Enum`s (with their literal values)
and dataclass fields (in constructor order) keep their own syntax. A symbol is public if it is listed in `__all__`, or, without `__all__`, if its name
does not start with an underscore.

## Types

**Types are never translated.** TypeScript types stay TypeScript types, Python types stay Python
types. archlock compares the **canonical form** of a type on both sides:

- whitespace and comments are normalized (`{a:number}` → `{ a: number }`),
- generic argument lists `<…>` become `[…]` (`Promise<Invoice>` → `Promise[Invoice]`),
- single-quoted string literals become double-quoted (`'draft'` → `"draft"`),
- a leading `|`/`&` and trailing separators before a closing bracket are dropped.

A canonical type is written **bare** when it is a simple, Python-compatible expression: dotted
names, subscripts and `|` unions (string literals, integers, `...` and lists only inside
subscripts). Everything else is written as a **quoted string**, preferably in single quotes:

```python
lines: Array[Line]                      # bare
status: '"draft" | "sent" | "paid"'     # quoted: top-level string literals
options: '{ ttl: number }'              # quoted: object type
tags: 'string[]'                        # quoted: not valid Python
```

When you edit a sketch, either spelling works: `'Promise<Invoice>'` and `Promise[Invoice]` are
the same type. archlock writes the canonical spelling back.

Missing annotations are written as `'<inferred>'` (see `archlock stats`: annotate your public
API for stronger checks). In `--typed` mode, very long inferred types become `'<complex>'`.

#### Very long types (opt-in)

Some types are too long to read in a sketch: a union of every HTTP header name, or a mapped type
of several hundred characters. With `"maxTypeLength": 120` in `archlock.config.json`, `init` and
`accept` write any type longer than 120 characters as a placeholder:

```python
RequestHeader: TypeAlias = '<"A-IM" | "Accept" | "Accept-Additions" | "Accept-CH" | … (4635 chars, #9f247ce7)>'
```

It shows the type's first characters, its length and the first 8 hex digits of its SHA-256.
`check` abbreviates the code's types the same way before comparing, so the placeholder matches
exactly when the full type is unchanged; any change to the type shows up as `signature_changed`.
A sketch may still spell such a type out in full (that is how you plan a new one); it is compared
the same way. Abbreviation applies to alias and constant types, parameter, return and field
types, but never to names, type parameters or bases. It is off by default (`null`).

### Type parameters

Type parameters use Python 3.12 brackets on `def` and `class`, and `TypeAlias[...]` on type
aliases. A plain name (`T`) or a Python bound (`T: Base`) is written bare; anything else keeps its
source spelling, quoted: `'K extends keyof T'`, `'E extends Error = Error'`.

When the type parameters of a `def` do not fit on its line (100 characters), they are written one
per line, followed by the parameters one per line:

```python
def route[
    'I extends Input = {}',
    'R extends HandlerResponse[any] = any',
](
    self,
    path: string,
) -> Router: ...
```

### Field types that look like wrappers

`Readonly[…]`, `Opt[…]` and `ClassVar[…]` are flags. A field whose actual type starts with one of
these names (e.g. the TypeScript utility type `Readonly<Foo>`) is quoted so the two cannot be
confused: `wrapped: 'Readonly[Foo]'`.

## Names

Sketch names are Python identifiers. Code names that are Python keywords get a trailing
underscore (`from` → `from_`), other invalid characters become `_` (`user$` → `user_`). Fields
with names that are not identifiers use subscript syntax: `self["content-type"]: string`.

In a module without an entry, a name that several files define is qualified with each file's
path inside the module, so none of them is hidden: `ui/button/button.svelte` and
`demo/button.svelte` in `src/**` give `ui_button_button__Button` and `demo_button__Button`. For
Go the package directory counts (`store__New`), and files of the same package do not collide.

## Parameters

| Sketch | Meaning |
|---|---|
| `a: T` | required parameter |
| `a: T = ...` | optional parameter / has a default (the value itself is never recorded) |
| `*rest: T` | rest parameter / `*args` |
| `**kw: T` | `**kwargs` (Python) |
| `*`, `/` | keyword-only / positional-only markers (Python) |
| `a` | parameter without type annotation |

Long signatures (over 100 characters) are wrapped one parameter per line (and one type parameter
per line, see Type parameters).

## Planned symbols

A symbol in the sketch that does not exist in the code is allowed. `archlock check` reports it as
`planned_not_implemented`, and `archlock push` asks your coding agent to implement it. This is
how you plan with a sketch: write the signature, then let the agent fill it in.

## Comments and docstrings (soft contract)

archlock keeps every comment attached to the element it describes, so `archlock accept` can
rewrite the hard parts of a sketch without losing your notes:

- A comment **on the same line** as an element is that element's trailing comment. For classes and
  functions, the line with the header's `:` counts.
- A **full-line comment** belongs to the **next element** at the same indentation level. Put an
  invariant directly above the member it describes.
- Full-line comments at the **end of a class body** belong to the class; comments **inside a
  function body** belong to the function.
- Comments at the very end of the file stay at the end of the file.
- Docstrings are allowed on the module, classes and functions.

Conventional prefixes are `# invariant:`, `# must:`, `# never:` and `# suggested:` (proposed by
`archlock init --with-summaries` for a human to review). They are plain comments to `check`.

If you delete a symbol in the code and run `archlock accept`, the symbol leaves the sketch and
`accept` prints the comments that were attached to it, so nothing is lost silently.

## Determinism

The renderer is fully deterministic: the same model always produces byte-identical output, with
LF line endings, 4-space indentation, POSIX paths, a blank line between groups, and blank lines
around multi-line items. `render(parse(sketch)) === sketch` holds for every sketch archlock
writes.

## What is not allowed

Sketches contain only the header, re-exports, classes, `def`s, constants and type aliases.
Function bodies contain only `...` (plus an optional docstring and comments). Imports other than
re-exports, real code, nested classes and unknown decorators are reported as `sketch_invalid`
with file, line and column.

## Adding a module

Create `archlock/<name>.arch.py` with just the header and run `archlock accept <name>`:

```python
"""Notifications: email and push delivery."""

__module__ = "notifications"
__paths__ = ["src/notifications/**"]
```

`accept` fills in the dependencies and the public API from the code. To plan a module that does
not exist yet, write its symbols yourself instead and run `archlock push`.
