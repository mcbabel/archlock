# archlock push: make the code match the architecture sketches

This repository describes its architecture in `archlock/*.arch.py` ("sketches"): one file per module with the module's files (`__paths__`), the modules it may import (`__depends_on__`) and its public API. **The sketches are the source of truth.** Change the code so that it matches them.

## Changes to make

### 1. components: change `UserCard`

Target (archlock/components.arch.py:24):

```python
class UserCard(VueComponent):
    compact: Opt[boolean]
    onArchive: Opt['(id: string) => void']
    onClose: Opt['() => void']
    onSelect: Opt['(id: string) => void']
    self["onUpdate:open"]: Opt['(value: boolean) => void']
    open: boolean
    rounded: Opt[boolean]
    tags: Readonly[Opt['string[]']]
    user: User
```

Current code (src/components/UserCard.vue:1):

```python
class UserCard(VueComponent):
    compact: Opt[boolean]
    onClose: Opt['() => void']
    onSelect: Opt['(id: string) => void']
    self["onUpdate:open"]: Opt['(value: boolean) => void']
    open: boolean
    tags: Readonly[Opt['string[]']]
    user: User
```

Differences:

```diff
- onArchive: Opt['(id: string) => void']  (in sketch, not in code)
- rounded: Opt[boolean]  (in sketch, not in code)
```

Update every caller.

## How to read a sketch

- Sketches use Python syntax as notation, whatever the project's language. Types are written in the module's own language: TypeScript types stay TypeScript (`Promise[T]` means `Promise<T>`; quoted types like `'{ a: number }'` are verbatim).
- `def f(a: T, b: U = ...) -> R` is a function; `b` is optional. `*rest: T` is a rest parameter. Methods take `self`; `@staticmethod` has none.
- `class X(Protocol)` is an interface; `class E(Enum)` an enum; `X: TypeAlias = T` a type alias; `NAME: T` an exported constant.
- Field flags: `Readonly[T]`, `Opt[T]` (optional property), `ClassVar[T]` (static). `'<inferred>'` means the code has no type annotation there.
- Everything listed in a sketch must be public (exported from the module's `__entry__` when one is set); nothing else may be.
- Names a sketch uses but does not define (e.g. `Customer`) are public symbols of the modules in its `__depends_on__`; import them from that module's entry.
- `class UserCard(VueComponent)` is the component in `UserCard.vue` (or `user-card.vue`, `user-card/index.vue`). Its fields are its props and `on…` fields its events (`self["onUpdate:x"]` is Vue's `update:x`); other bases are types its props come from.
- Vue: declare props with `defineProps<{ … }>()` and events with `defineEmits<{ change: [value: T] }>()` in `<script setup>`; a field `onChange: Opt['(value: T) => void']` is the event `change`. Other exports go in a plain `<script>` block.

## Sketches of the affected modules

### archlock/components.arch.py

```python
__module__ = "components"
__paths__ = ["src/components/**"]
__depends_on__ = ["stores"]

class ListOptions(Protocol):
    dense: boolean

class BaseButton(VueComponent):
    self["aria-label"]: Opt[string]
    label: string
    onClick: Opt['<inferred>']
    self["onUpdate:size"]: Opt['<inferred>']
    size: Opt[string | number]
    tags: Opt['string[]']

class Icon(VueComponent): ...

class ItemList['T extends { id: string }'](VueComponent):
    items: 'T[]'
    onClear: Opt['() => void']
    onPick: Opt['(item: T) => void']
    options: Opt[ListOptions]

class UserCard(VueComponent):
    compact: Opt[boolean]
    onArchive: Opt['(id: string) => void']
    onClose: Opt['() => void']
    rounded: Opt[boolean]
    onSelect: Opt['(id: string) => void']
    self["onUpdate:open"]: Opt['(value: boolean) => void']
    open: boolean
    tags: Readonly[Opt['string[]']]
    user: User
```

## Rules

- Do not edit anything under `archlock/`. The sketches are the specification. If a sketch looks wrong, say so in your final message instead of changing it.
- Do not change the public API of any module beyond the changes listed above.
- Imports between modules must stay within each module's `__depends_on__` (and `__external__`, where present).
- Keep existing behaviour and tests working. Make the smallest change that satisfies the sketches; update callers of changed functions.
- When you are done, run `archlock check` and iterate until it reports no errors. Do not run `archlock accept`: that would change the sketches instead of the code.
- Other shell commands may be refused. If you could not compile the code or run its tests, say so in your final message.
