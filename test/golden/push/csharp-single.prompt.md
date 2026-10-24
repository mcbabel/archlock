# archlock push: make the code match the architecture sketches

This repository describes its architecture in `archlock/*.arch.py` ("sketches"): one file per module with the module's files (`__paths__`), the modules it may import (`__depends_on__`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.

## Changes to make

### 1. Catalog: change `Product`

Target (archlock/Catalog.arch.py:8):

```python
class Product:
    Discount: 'decimal?'
    Price: decimal
    Sku: Readonly[string]
    def __init__(self, sku: string, price: decimal): ...
    def WithPrice(self, price: decimal) -> Product: ...
```

Current code (Catalog/Product.cs:4):

```python
class Product:
    Price: decimal
    Sku: Readonly[string]
    def __init__(self, sku: string, price: decimal): ...
```

Differences:

```diff
- Discount: 'decimal?'  (in sketch, not in code)
- def WithPrice(self, price: decimal) -> Product  (in sketch, not in code)
```

Update every caller.

## How to read a sketch

- Sketches use Python syntax as notation, whatever the project's language. Types are written in the module's own language.
- `def f(a: T, b: U = ...) -> R` is a function; `b` is optional. `*rest: T` is a rest parameter. Methods take `self`; `@staticmethod` has none.
- `class X(Protocol)` is an interface; `class E(Enum)` an enum; `X: TypeAlias = T` a type alias; `NAME: T` an exported constant.
- Field flags: `Readonly[T]`, `Opt[T]` (optional property), `ClassVar[T]` (static). `'<inferred>'` means the code has no type annotation there.
- Everything listed in a sketch must be public (exported from the module's `__entry__` when one is set); nothing else may be.
- Names a sketch uses but does not define (e.g. `Customer`) are public symbols of the modules in its `__depends_on__`; import them from that module's entry.
- C#: a module is a project (or a folder of one); its sketch lists the `public` types and their `public` members (in interfaces every member without an access modifier). Nested types are `Outer__Inner`; partial classes are one type. Types are C# types; `List[string]` means `List<string>`, `'string?'` is nullable.
- C#: properties and fields are `Name: string` (`Readonly[…]` without a public setter, `ClassVar[…]` for `static` and `const`), events are `'event EventHandler'`, `def __getitem__` is an indexer, `def __init__` a constructor, `*items: 'T[]'` is `params T[] items`, and `'ref int'`, `'out int'`, `'this T'` keep their modifier. `@record`, `@struct`, `@static`, `@abstract`, `@sealed` and `@readonly` are the type's kind and modifiers.

## Sketches of the affected modules

### archlock/Catalog.arch.py

```python
__module__ = "Catalog"
__paths__ = ["Catalog/**"]
__depends_on__ = []

class Catalog:
    def Find(self, sku: string) -> 'Product?': ...

class Product:
    Discount: 'decimal?'
    Price: decimal
    def WithPrice(self, price: decimal) -> Product: ...
    Sku: Readonly[string]
    def __init__(self, sku: string, price: decimal): ...
```

## Rules

- Do not edit anything under `archlock/`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.
- Do not change the public API of any module beyond the changes listed above.
- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).
- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.
- When you are done, run `archlock check` and iterate until it reports no errors. Do not run `archlock accept`: that would change the sketches instead of the code.
- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.
