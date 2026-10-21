# archlock push: make the code match the architecture sketches

This repository describes its architecture in `archlock/*.arch.py` ("sketches"): one file per module with the module's files (`__paths__`), the modules it may import (`__depends_on__`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.

## Changes to make

### 1. billing: implement `refund` (new)

Target (archlock/billing.arch.py:28):

```python
def refund(id: string) -> void: ...
```

Export it from `src/billing/index.ts`.

### 2. billing: change `markPaid`

Target (archlock/billing.arch.py:24):

```python
async def markPaid(id: string, payment: '{ ref: string }', at: Date) -> Promise[Invoice]:
    # must: emit invoice.paid exactly once
    ...
```

Current code (src/billing/payments.ts:4):

```python
async def markPaid(id: string, payment: '{ ref: string }') -> Promise[Invoice]: ...
```

Differences:

```diff
sketch: async def markPaid(id: string, payment: '{ ref: string }', at: Date) -> Promise[Invoice]
code:   async def markPaid(id: string, payment: '{ ref: string }') -> Promise[Invoice]
```

Update every caller.

### 3. events: `debugDump` must not be public

It is public in the code (src/events/index.ts:10) but not part of the sketch. Stop exporting it from `src/events/index.ts` (keep it internal), or remove it if nothing uses it.

### 4. db: remove the dependency on `events`

`db` imports `events` (src/db/types.ts:1), but it may only depend on: nothing. Restructure the code so the import is not needed.

## How to read a sketch

- Sketches use Python syntax as notation, whatever the project's language. Types are written in the module's own language: TypeScript types stay TypeScript (`Promise[T]` means `Promise<T>`; quoted types like `'{ a: number }'` are verbatim).
- `def f(a: T, b: U = ...) -> R` is a function; `b` is optional. `*rest: T` is a rest parameter. Methods take `self`; `@staticmethod` has none.
- `class X(Protocol)` is an interface; `class E(Enum)` an enum; `X: TypeAlias = T` a type alias; `NAME: T` an exported constant.
- Field flags: `Readonly[T]`, `Opt[T]` (optional property), `ClassVar[T]` (static). `'<inferred>'` means the code has no type annotation there.
- Everything listed in a sketch must be public (exported from the module's `__entry__` when one is set); nothing else may be.
- Names a sketch uses but does not define (e.g. `Customer`) are public symbols of the modules in its `__depends_on__`; import them from that module's entry.

## Invariants to respect

The sketches state these rules; keep them true in the code you write:

- billing: `# invariant: status only moves forward`
- billing: `# must: emit invoice.paid exactly once`

## Sketches of the affected modules

### archlock/billing.arch.py

```python
"""Billing: invoices and payments."""

__module__ = "billing"
__paths__ = ["src/billing/**"]
__entry__ = "src/billing/index.ts"
__depends_on__ = ["db", "events"]

# invariant: status only moves forward
class InvoiceStatus(Enum):
    Draft = ...
    Sent = ...
    Paid = ...

CustomerId: TypeAlias = string

class Invoice(Protocol):
    customer: CustomerId
    id: string
    lines: 'Array[{ amount: number }]'
    status: '"draft" | "sent" | "paid"'
    def total(self) -> number: ...

def createInvoice(db: Database, customer: CustomerId, lines: Invoice["lines"]) -> Invoice: ...
async def markPaid(id: string, payment: '{ ref: string }', at: Date) -> Promise[Invoice]:
    # must: emit invoice.paid exactly once
    ...

def refund(id: string) -> void: ...
```

### archlock/db.arch.py

```python
__module__ = "db"
__paths__ = ["src/db/**"]
__entry__ = "src/db/index.ts"
__depends_on__ = []

class Row(Protocol):
    id: string

class Database:
    connected: Readonly[boolean]
    instances: ClassVar['<inferred>']
    url: Readonly[string]
    def __init__(self, url: string): ...
    def query['T extends Row'](self, sql: string, params: 'unknown[]' = ...) -> 'Promise[T[]]': ...
```

### archlock/events.arch.py

```python
__module__ = "events"
__paths__ = ["src/events/**"]
__entry__ = "src/events/index.ts"
__depends_on__ = []

def emit(name: string, payload: unknown = ...) -> void: ...

@overload
def on(name: '"invoice.paid"', handler: '(e: { id: string }) => void') -> void: ...
@overload
def on(name: string, handler: '(e: unknown) => void') -> void: ...

EVENT_NAMES: '<inferred>'
```

## Rules

- Do not edit anything under `archlock/`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.
- Do not change the public API of any module beyond the changes listed above.
- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).
- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.
- When you are done, run `archlock check` and iterate until it reports no errors. Do not run `archlock accept`: that would change the sketches instead of the code.
- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.
