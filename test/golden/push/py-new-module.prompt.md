# archlock push: make the code match the architecture sketches

This repository describes its architecture in `archlock/*.arch.py` ("sketches"): one file per module with the module's files (`__paths__`), the modules it may import (`__depends_on__`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.

## Changes to make

### 1. notifications: implement `notify` (new)

Target (archlock/notifications.arch.py:9):

```python
# never: send more than one email per invoice event
def notify(customer: str, message: str) -> None: ...
```

Module `notifications` has no code yet. Create it under `src/shopkit/notifications/**` with the entry `src/shopkit/notifications/__init__.py`.

## How to read a sketch

- Sketches use Python syntax as notation, whatever the project's language. Types are written in the module's own language.
- `def f(a: T, b: U = ...) -> R` is a function; `b` is optional. `*rest: T` is a rest parameter. Methods take `self`; `@staticmethod` has none.
- `class X(Protocol)` is an interface; `class E(Enum)` an enum; `X: TypeAlias = T` a type alias; `NAME: T` an exported constant. Enum members: `A = ...` leaves the value open, `A = 2` or `A = 'a'` fixes it, `A: '(u8)'` carries data.
- Field flags: `Readonly[T]`, `Opt[T]` (optional property), `ClassVar[T]` (static). `'<inferred>'` means the code has no type annotation there; `'<complex>'` an inferred type too long to write down.
- In `@dataclass` and `@record` classes the fields come in constructor order; keep that order.
- `self: T` names a receiver that is not the usual one; decorators such as `@throws(E)`, `@unsafe`, `@const`, `@extern("C")`, `@build("linux")` and `@cfg(unix)` belong to the signature below them.
- Everything listed in a sketch must be public (exported from the module's `__entry__` when one is set); nothing else may be.
- Names a sketch uses but does not define (e.g. `Customer`) are public symbols of the modules in its `__depends_on__`; import them from that module's entry.

## Invariants to respect

The sketches state these rules; keep them true in the code you write:

- notifications: `# never: send more than one email per invoice event`

## Sketches of the affected modules

### archlock/notifications.arch.py

```python
"""Notifications: tell customers about their invoices."""

__module__ = "notifications"
__paths__ = ["src/shopkit/notifications/**"]
__entry__ = "src/shopkit/notifications/__init__.py"
__depends_on__ = ["events"]

# never: send more than one email per invoice event
def notify(customer: str, message: str) -> None: ...
```

## Rules

- Do not edit anything under `archlock/`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.
- Do not change the public API of any module beyond the changes listed above.
- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).
- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.
- When you are done, run `archlock check` and iterate until it reports no errors. Do not run `archlock accept`: that would change the sketches instead of the code.
- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.
