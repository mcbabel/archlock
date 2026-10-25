# archlock push: make the code match the architecture sketches

This repository describes its architecture in `archlock/*.arch.py` ("sketches"): one file per module with the module's files (`__paths__`), the modules it may import (`__depends_on__`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.

## Changes to make

### 1. order: change `order__Status`

Target (archlock/order.arch.py:9):

```python
class order__Status(java.io.Serializable, Enum):
    NEW = ...
    PAID = ...
    SHIPPED = ...
    CANCELLED = ...
    def label(self) -> String: ...
    @staticmethod
    def parse(text: String) -> Status: ...
```

Current code (src/main/java/com/acme/shop/order/Status.java:4):

```python
class order__Status(java.io.Serializable, Enum):
    NEW = ...
    PAID = ...
    SHIPPED = ...
    def label(self) -> String: ...
    @staticmethod
    def parse(text: String) -> Status: ...
```

Differences:

```diff
- CANCELLED (in sketch, not in code)
```

Update every caller.

### 2. order: change `OrderService`

Target (archlock/order.arch.py:45):

```python
class OrderService:
    def __init__(self, billing: BillingService): ...
    def cancel(self, order: Order, reason: String) -> boolean: ...
    @throws(BillingException)
    def place(self, order: Order) -> Invoice: ...
    def placeAll(self, *ids: String) -> void: ...
```

Current code (src/main/java/com/acme/shop/order/OrderService.java:9):

```python
class OrderService:
    def __init__(self, billing: BillingService): ...
    @throws(BillingException)
    def place(self, order: Order) -> Invoice: ...
    def placeAll(self, *ids: String) -> void: ...
```

Differences:

```diff
- def cancel(self, order: Order, reason: String) -> boolean  (in sketch, not in code)
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
- Java: a module is a package tree; its sketch lists the `public` types of its packages and their `public` members (in interfaces every member that is not `private`). Nested types are `Outer__Inner`; a name that two packages of the module share is qualified with the package (`api__Status`). Types are Java types; `List[String]` means `List<String>`.
- Java: `class Order(Base, Comparable[Order])` extends `Base` and implements `Comparable<Order>`; `class Repo(Protocol)` is an interface; `@record`, `@abstract`, `@final`, `@sealed` and `@annotation` are the type's kind and modifiers. `def __init__` is a constructor, `@overload` lists overloads, `@staticmethod` is `static`, `*args: String` is `String... args`, `@throws(IOException)` is a `throws` clause, and `MAX: ClassVar[Readonly[int]]` is `public static final int MAX`.

## Sketches of the affected modules

### archlock/order.arch.py

```python
__module__ = "order"
__paths__ = ["src/main/java/com/acme/shop/order/**"]
__depends_on__ = ["billing"]

class api__Status(Enum):
    OK = ...
    NOT_FOUND = ...

class order__Status(java.io.Serializable, Enum):
    NEW = ...
    PAID = ...
    SHIPPED = ...
    CANCELLED = ...
    def label(self) -> String: ...
    @staticmethod
    def parse(text: String) -> Status: ...

class Order(Comparable[Order]):
    id: Readonly[String]
    lines: List[Line]
    MAX_LINES: ClassVar[Readonly[int]]
    @overload
    def __init__(self, id: String): ...
    @overload
    def __init__(self, id: String, *lines: Line): ...
    def compareTo(self, other: Order) -> int: ...
    def max['T extends Comparable[? super T]'](self, items: 'Collection[? extends T]') -> T: ...
    def quantities(self) -> 'int[]': ...
    @overload
    def total(self) -> BigDecimal: ...
    @overload
    def total(self, currency: String) -> BigDecimal: ...

@record
class Order__Line:
    sku: Readonly[String]
    quantity: Readonly[int]
    def isBulk(self) -> boolean: ...

@abstract
class OrderController:
    @abstractmethod
    def get(self, id: String) -> Status: ...

class OrderService:
    def __init__(self, billing: BillingService): ...
    def cancel(self, order: Order, reason: String) -> boolean: ...
    @throws(BillingException)
    def place(self, order: Order) -> Invoice: ...
    def placeAll(self, *ids: String) -> void: ...
```

## Rules

- Do not edit anything under `archlock/`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.
- Do not change the public API of any module beyond the changes listed above.
- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).
- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.
- When you are done, run `archlock check` and iterate until it reports no errors. Do not run `archlock accept`: that would change the sketches instead of the code.
- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.
