__module__ = "router"
__paths__ = ["src/router/**"]
__depends_on__ = ["hono", "utils"]

HandlerData: TypeAlias[T] = '[T, ParamIndexMap][]'
Matcher: TypeAlias[T] = '[RegExp, HandlerData[T][], StaticMap[T]]'
MatcherMap: TypeAlias[T] = Record[string, Matcher[T] | null]
ParamAssocArray: TypeAlias = '[string, number][]'
ReplacementMap: TypeAlias = 'number[]'
StaticMap: TypeAlias[T] = Record[string, Result[T]]

class Context(Protocol):
    varIndex: number

class LinearRouter[T](Router[T]):
    name: string
    def add(self, method: string, path: string, handler: T) -> '<inferred>': ...
    def match(self, method: string, path: string) -> Result[T]: ...

class Node:
    def buildRegExpStr(self) -> string: ...
    def insert(
        self,
        tokens: 'readonly string[]',
        index: number,
        paramMap: ParamAssocArray,
        context: Context,
        isStatic: boolean,
    ) -> void: ...

class PatternRouter[T](Router[T]):
    name: string
    def add(self, method: string, path: string, handler: T) -> '<inferred>': ...
    def match(self, method: string, path: string) -> Result[T]: ...

class PreparedRegExpRouter[T](Router[T]):
    match: 'typeof match[Router[T], T]'
    name: string
    def __init__(self, matchers: MatcherMap[T], relocateMap: RelocateMap): ...
    def add(self, method: string, path: string, handler: T) -> '<inferred>': ...

class RegExpRouter[T](Router[T]):
    match: 'typeof match[Router[T], T]'
    name: string
    def __init__(self): ...
    def add(self, method: string, path: string, handler: T) -> '<inferred>': ...

class SmartRouter[T](Router[T]):
    activeRouter: Readonly[Router[T]]
    name: string
    def __init__(self, init: '{ routers: Router[T][] }'): ...
    def add(self, method: string, path: string, handler: T) -> '<inferred>': ...
    def match(self, method: string, path: string) -> Result[T]: ...

class Trie:
    paths: Record[string, [number, ParamAssocArray]]
    def buildRegExp(self) -> '[RegExp, ReplacementMap, ReplacementMap]': ...
    def insert(self, path: string, isStatic: boolean) -> void: ...

class TrieRouter[T](Router[T]):
    name: string
    def add(self, method: string, path: string, handler: T) -> '<inferred>': ...
    def match(self, method: string, path: string) -> Result[T]: ...

def createNullObject() -> '<inferred>': ...
def match['R extends Router[T]', T](method: string, path: string) -> Result[T]: ...

buildInitParams: '(params: { paths: string[] }) => ConstructorParameters[typeof PreparedRegExpRouter]'
emptyParam: 'string[]'
LABEL_REG_EXP_STR: '<inferred>'
ONLY_WILDCARD_REG_EXP_STR: '<inferred>'
PATH_ERROR: '<inferred>'
serializeInitParams: '(params: ConstructorParameters[typeof PreparedRegExpRouter]) => string'
TAIL_WILDCARD_REG_EXP_STR: '<inferred>'
