"""Long types: wrapped type parameters and abbreviated types (maxTypeLength)."""

__module__ = "long_types"
__paths__ = ["src/long/**"]
__depends_on__ = []

RequestHeader: TypeAlias = '<"A-IM" | "Accept" | "Accept-Additions" | "Accept-CH" | … (4635 chars, #9f247ce7)>'

class Router(Protocol):
    def route[
        'I extends Input = {}',
        'I2 extends Input = I',
        'R extends HandlerResponse[any] = any',
        'E2 extends Env = E',
    ](
        self,
        path: string,
        handler: H[E2, I, R],
    ) -> Router: ...

def make[
    'A extends string = string',
    'B extends string = string',
    'C extends string = string',
    'D extends string = string',
]() -> '<{ [K in A]: { [K2 in B]: C } } … (310 chars, #0a1b2c3d)>': ...
