# archlock push: make the code match the architecture sketches

This repository describes its architecture in `archlock/*.arch.py` ("sketches"): one file per module with the module's files (`__paths__`), the modules it may import (`__depends_on__`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.

## Changes to make

### 1. internal.store: change `DefaultPath`

Target (archlock/internal.store.arch.py:12):

```python
def DefaultPath(name: string) -> string: ...
```

Current code (internal/store/path_linux.go:6):

```python
def DefaultPath() -> string: ...
```

Differences:

```diff
sketch: def DefaultPath(name: string) -> string
code:   def DefaultPath() -> string
```

Update every caller.

### 2. internal.store: change `Store`

Target (archlock/internal.store.arch.py:5):

```python
class Store:
    Path: string
    def Close(self) -> error: ...
    def Each(self, ctx: context.Context, fn: 'func(*model.User) error') -> error: ...
    def Events(self) -> '<-chan model.ID': ...
    def Get(self, ctx: context.Context, id: model.ID) -> '(*model.User, error)': ...
```

Current code (internal/store/store.go:20):

```python
class Store:
    Path: string
    def Each(self, ctx: context.Context, fn: 'func(*model.User) error') -> error: ...
    def Events(self) -> '<-chan model.ID': ...
    def Get(self, ctx: context.Context, id: model.ID) -> '(*model.User, error)': ...
```

Differences:

```diff
- def Close(self) -> error  (in sketch, not in code)
```

Update every caller.

## How to read a sketch

- Sketches use Python syntax as notation, whatever the project's language. Types are written in the module's own language.
- `def f(a: T, b: U = ...) -> R` is a function; `b` is optional. `*rest: T` is a rest parameter. Methods take `self`; `@staticmethod` has none.
- `class X(Protocol)` is an interface; `class E(Enum)` an enum; `X: TypeAlias = T` a type alias; `NAME: T` an exported constant.
- Field flags: `Readonly[T]`, `Opt[T]` (optional property), `ClassVar[T]` (static). `'<inferred>'` means the code has no type annotation there.
- Everything listed in a sketch must be public (exported from the module's `__entry__` when one is set); nothing else may be.
- Names a sketch uses but does not define (e.g. `Customer`) are public symbols of the modules in its `__depends_on__`; import them from that module's entry.
- Go: a module is a package (its `__paths__` directory). Everything in its sketch is an exported (capitalized) identifier; types are Go types (`'*Store'`, `'[]byte'`, `'(int, error)'` for several results, `'untyped string'` for an untyped constant).
- Go: `class Store:` is a struct (fields are exported fields, bases are embedded types), `class Reader(Protocol)` an interface, `class ID(string)` a defined type with that underlying type. `def Get(self, …)` is a method; declare it with a receiver, `func (s *Store) Get(…)`, in any file of the package. `*opts: Option` is `opts ...Option`; `_1`, `_2` are unnamed parameters.
- Go: a name defined in several files of one package (build variants such as `path_linux.go` and `path_windows.go`) is compared in the first of them only; change every variant.

## Sketches of the affected modules

### archlock/internal.store.arch.py

```python
__module__ = "internal.store"
__paths__ = ["internal/store/*.go"]
__depends_on__ = ["internal.model"]

class Store:
    Path: string
    def Each(self, ctx: context.Context, fn: 'func(*model.User) error') -> error: ...
    def Close(self) -> error: ...
    def Events(self) -> '<-chan model.ID': ...
    def Get(self, ctx: context.Context, id: model.ID) -> '(*model.User, error)': ...

def DefaultPath(name: string) -> string: ...
def Map[T, U](items: '[]T', fn: 'func(T) U') -> '[]U': ...
def New(path: string, *opts: 'func(*Store)') -> '(*Store, error)': ...

ErrNotFound: error
MaxOpen: int
```

## Rules

- Do not edit anything under `archlock/`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.
- Do not change the public API of any module beyond the changes listed above.
- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).
- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.
- When you are done, run `archlock check` and iterate until it reports no errors. Do not run `archlock accept`: that would change the sketches instead of the code.
- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.
