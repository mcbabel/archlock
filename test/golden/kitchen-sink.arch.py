# This sketch exercises every construct of the format.
"""Kitchen sink.

Multi-line module docstring.
"""  # docstring trailing

# The module name.
__module__ = "kitchen.sink"
__paths__ = ["src/kitchen/**", "src/sink/**"]
__depends_on__ = []
__external__ = []
__strictness__ = "names"

# re-exported from elsewhere
from .db import Connection, query
from .events import (
    Event,
    EventBus,
    EventHandler,
    EventName,
    EventPayload,
    EventSubscription,
    publish,
    subscribe,
)

class Color(Enum):
    # the first color
    Red = ...
    Green = ...  # trailing on a member

class Priority(IntEnum):
    Low = ...
    High = ...

Handler: TypeAlias = '(event: Event) => void'
Pair: TypeAlias[A, B] = '[A, B]'
Result: TypeAlias[T, 'E extends Error = Error'] = Ok[T] | Err[E]

class Repository[T: Entity](Iterable[T], Protocol):
    """A generic repository."""
    self["content-type"]: string
    count: Readonly[number]
    label: Opt[string]
    def get(self, id: string) -> T | undefined: ...
    @optional
    def onChange(self, listener: '(item: T) => void') -> void: ...

class Store(Protocol): ...

class Cache[K, V](Base[K, V], Disposable):  # a cache
    """Caches values.

    Entries expire after `ttl` milliseconds.
    """
    instances: ClassVar[number]
    options: Readonly[Opt['{ ttl: number; max?: number }']]
    wrapped: 'Readonly[Foo]'
    def __init__(self, options: CacheOptions = ...): ...
    @staticmethod
    def create[K, V](options: CacheOptions) -> Cache[K, V]: ...
    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self: ...
    @overload
    def get(self, key: K) -> V | undefined: ...
    @overload
    def get(self, key: K, fallback: V) -> V: ...
    def set(self, key: K, value: V) -> '<inferred>':
        # invariant: never stores undefined
        ...
    # invariant: size never exceeds options.max

@dataclass(frozen=True)
class Point:
    x: float
    y: float

def build_a_very_long_function_name_for_wrapping(
    first_argument: string,
    second_argument: number,
    *rest_arguments: string,
) -> Promise[Record[string, Array[number]]]: ...

async def fetch_all(urls: Array[string], *, timeout: number = ..., **options: Any) -> None: ...
def legacy(a, b=..., /, c=...) -> '<inferred>': ...

@overload
def parse(input: string) -> Ast: ...
@overload
def parse(input: Buffer, encoding: string) -> Ast: ...

def run() -> void:
    """Runs everything."""
    # must: be idempotent
    ...

DEFAULT_TIMEOUT: number
VERSION: '<inferred>'  # set at build time

# end of file
