# archlock push: make the code match the architecture sketches

This repository describes its architecture in `archlock/*.arch.py` ("sketches"): one file per module with the module's files (`__paths__`), the modules it may import (`__depends_on__`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.

## Changes to make

### 1. lexer: change `Lexer`

Target (archlock/lexer.arch.py:12):

```python
class Lexer["'a"](Iterator):
    @staticmethod
    def new(text: "&'a str") -> Self: ...
    def position(self) -> usize: ...
```

Current code (src/lexer.rs:12):

```python
class Lexer["'a"](Iterator):
    @staticmethod
    def new(text: "&'a str") -> Self: ...
```

Differences:

```diff
- def position(self) -> usize  (in sketch, not in code)
```

Update every caller.

### 2. lexer: change `Token`

Target (archlock/lexer.arch.py:6):

```python
class Token(Clone, Debug, PartialEq, Enum):
    Word: '(String)'
    Space = ...
    Newline = ...
    Tab: '(u8)'
```

Current code (src/lexer.rs:5):

```python
class Token(Clone, Debug, PartialEq, Enum):
    Word: '(String)'
    Space = ...
    Newline = ...
```

Differences:

```diff
- Tab: '(u8)' (in sketch, not in code)
```

Update every caller.

## How to read a sketch

- Sketches use Python syntax as notation, whatever the project's language. Types are written in the module's own language.
- `def f(a: T, b: U = ...) -> R` is a function; `b` is optional. `*rest: T` is a rest parameter. Methods take `self`; `@staticmethod` has none.
- `class X(Protocol)` is an interface; `class E(Enum)` an enum; `X: TypeAlias = T` a type alias; `NAME: T` an exported constant. Enum members: `A = ...` leaves the value open, `A = 2` or `A = 'a'` fixes it, `A: '(u8)'` carries data.
- Field flags: `Readonly[T]`, `Opt[T]` (optional property), `ClassVar[T]` (static). `'<inferred>'` means the code has no type annotation there; `'<complex>'` an inferred type too long to write down.
- In `@dataclass` and `@record` classes the fields come in constructor order; keep that order.
- `self: T` names a receiver that is not the usual one; decorators such as `@throws(E)`, `@unsafe`, `@const`, `@extern("C")`, `@build("linux")` and `@cfg(unix)` belong to the signature below them.
- Everything listed in a sketch must be public (exported from the module's `__entry__` when one is set); nothing else may be.
- Names a sketch uses but does not define (e.g. `Customer`) are public symbols of the modules in its `__depends_on__`; import them from that module's entry.
- Rust: the sketch lists what the module's `__entry__` (`lib.rs`, `mod.rs` or the module file) makes public: `pub` items, `pub use` re-exports, and the items of `pub mod` children as `child__item` (`net__TcpListener` is `net::TcpListener`). `pub(crate)` items are not public. Types are Rust types; `Vec[u8]` means `Vec<u8>`.
- Rust: `class Config:` is a struct (fields are `pub` fields; bases are derived and implemented traits), `class Shape(…, Enum)` an enum whose members carry their data (`Circle: '{ radius: f64 }'`) or a discriminant (`Big = 10`), `class Store(Protocol)` a trait. `def get(self, …)` is a method of an `impl` block (any file of the crate) taking `&self`; `self: '&mut Self'`, `self: Self` and `self: Box[Self]` are the other receivers, `@staticmethod` has none. `@unsafe`, `@const`, `@extern("C")` are `unsafe fn`, `const fn` and `extern "C" fn`; `@cfg(unix)` overloads are `#[cfg]` variants. Put a new trait in the bases by writing `impl Trait for Type`.

## Sketches of the affected modules

### archlock/lexer.arch.py

```python
__module__ = "lexer"
__paths__ = ["src/lexer.rs"]
__entry__ = "src/lexer.rs"
__depends_on__ = ["util"]

class Token(Clone, Debug, PartialEq, Enum):
    Word: '(String)'
    Space = ...
    Newline = ...
    Tab: '(u8)'

class Lexer["'a"](Iterator):
    def position(self) -> usize: ...
    @staticmethod
    def new(text: "&'a str") -> Self: ...
```

## Rules

- Do not edit anything under `archlock/`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.
- Do not change the public API of any module beyond the changes listed above.
- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).
- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.
- When you are done, run `archlock check` and iterate until it reports no errors. Do not run `archlock accept`: that would change the sketches instead of the code.
- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.
