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
`from .other import a, b`. They are documentation only and never checked.

## Symbols

Symbols are rendered in groups, each sorted alphabetically (case-insensitive): **enums, type
aliases, protocols (interfaces), classes, functions, constants.** Members of a class are
rendered fields first (alphabetical), then methods (`__init__` first, then alphabetical).
Enum members keep their source order because it can be meaningful.

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
| `export enum E { A, B }` | `class E(Enum):` with `A = ...`, `B = ...` |
| `export const X: T = …` | `X: T` |
| `export default …` | the symbol is named `default` |
| generics `<T extends U>` | `def f[T, 'K extends keyof T'](…)` (see type parameters) |

Private members (`private`, `#x`) are not part of the sketch.

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
| `type Store interface { io.Closer; Get(id ID) (*User, error) }` | `class Store(io.Closer, Protocol):` with `def Get(self, id: ID) -> '(*User, error)'` |
| type set `interface { ~int \| ~float64 }` | `class Number('~int \| ~float64', Protocol): ...` |
| defined type `type ID string`, `type Handler func(…)` | `class ID(string):`, `class Handler('func(…)'):` (with their methods) |
| alias `type Name = string` | `Name: TypeAlias = string` |
| `const ( Red Color = iota; Green )` | `Red: Color`, `Green: Color` (Go has no enums; the iota idiom stays constants) |
| untyped constant `const Version = "1.0"` | `Version: 'untyped string'` (`untyped int`, `untyped float`, `untyped bool`, …) |
| `var Count int`, `var ErrClosed = errors.New(…)`, `var Default = &Config{}` | `Count: int`, `ErrClosed: error`, `Default: '*Config'`; other values are `'<inferred>'` |

Struct tags, unexported fields and methods, and the receiver kind (pointer or value) are not part
of the sketch. Files with `//go:build ignore` are not part of their package. Build variants of a
package (`path_linux.go`, `path_windows.go`) define a name once: the first file in path order
counts.

### Mapping from Python

Python maps almost 1:1: functions, classes, `Protocol`s, `Enum`s and dataclass fields keep their
own syntax. A symbol is public if it is listed in `__all__`, or, without `__all__`, if its name
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
