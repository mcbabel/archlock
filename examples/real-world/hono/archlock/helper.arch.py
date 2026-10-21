__module__ = "helper"
__paths__ = ["src/helper/**"]
__depends_on__ = ["client", "hono", "jsx", "request", "utils"]

from .utils import raw

AddedSSGDataRequest: TypeAlias = 'Request & { ssgParams?: SSGParams }'
AddressType: TypeAlias = '"IPv6" | "IPv4" | undefined'
AfterGenerateHook: TypeAlias = '(result: ToSSGResult, fsModule: FileSystemModule, options?: ToSSGOptions) => void | Promise[void]'
AfterResponseHook: TypeAlias = '(res: Response) => Response | false | Promise[Response | false]'
BeforeRequestHook: TypeAlias = '(req: Request) => Request | false | Promise[Request | false]'
ClassNameSlug: TypeAlias = '(hash: string, label: string, styleString: string) => string'
CssVariableType: TypeAlias = CssVariableBasicType | CssVariableAsyncType | CssVariableArrayType
GetConnInfo: TypeAlias = '(c: Context) => ConnInfo'
NetAddrInfo: TypeAlias = '<{ transport?: "tcp" | "udp"; port?: number; address?: … (144 chars, #b5053114)>'
OnInvalidSlug: TypeAlias = '(slug: string) => void'
Runtime: TypeAlias = '"node" | "deno" | "bun" | "workerd" | "fastly" | "edge-light" | "other"'
SSGParams: TypeAlias = 'SSGParam[]'
WebSocketHelperDefineHandler: TypeAlias[T, U] = '(c: Context, events: WSEvents[T], options?: U) => Promise[Response | void] | Response | void'
WSMessageReceive: TypeAlias = string | Blob | ArrayBufferLike
WSReadyState: TypeAlias = '0 | 1 | 2 | 3'

class Accept(Protocol):
    params: Record[string, string]
    q: number
    type: string

class acceptsConfig(Protocol):
    default: string
    header: AcceptHeader
    supports: 'string[]'

class acceptsOptions(acceptsConfig, Protocol):
    match: Opt['(accepts: Accept[], config: acceptsConfig) => string']

class ConnInfo(Protocol):
    remote: NetAddrInfo

class CreateHandlersInterface['E extends Env', 'P extends string'](Protocol):
    @overload
    def __call__[
        'I extends Input = {}',
        'R extends HandlerResponse[any] = any',
        'E2 extends Env = E',
    ](
        self,
        handler1: H[E2, P, I, R],
    ) -> '[H[E2, P, I, R]]': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
    ) -> '[H[E2, P, I, R], H[E3, P, I2, R2]]': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
    ) -> '[H[E2, P, I, R], H[E3, P, I2, R2], H[E4, P, I3, R3]]': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'I4 extends Input = I & I2 & I3',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'R4 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
        'E5 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
        handler4: H[E5, P, I4, R4],
    ) -> '[H[E2, P, I, R], H[E3, P, I2, R2], H[E4, P, I3, R3], H[E5, P, I4, R4]]': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'I4 extends Input = I & I2 & I3',
        'I5 extends Input = I & I2 & I3 & I4',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'R4 extends HandlerResponse[any] = any',
        'R5 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
        'E5 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4]]',
        'E6 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
        handler4: H[E5, P, I4, R4],
        handler5: H[E6, P, I5, R5],
    ) -> '[H[E2, P, I, R], H[E3, P, I2, R2], H[E4, P, I3, R3], H[E5, P, I4, R4], H[E6, P, I5, R5]]': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'I4 extends Input = I & I2 & I3',
        'I5 extends Input = I & I2 & I3 & I4',
        'I6 extends Input = I & I2 & I3 & I4 & I5',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'R4 extends HandlerResponse[any] = any',
        'R5 extends HandlerResponse[any] = any',
        'R6 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
        'E5 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4]]',
        'E6 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5]]',
        'E7 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
        handler4: H[E5, P, I4, R4],
        handler5: H[E6, P, I5, R5],
        handler6: H[E7, P, I6, R6],
    ) -> '[H[E2, P, I, R], H[E3, P, I2, R2], H[E4, P, I3, R3], H[E5, P, I4, R4], H[E6, P, I5, R5], H[E7, P, I6, R6]]': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'I4 extends Input = I & I2 & I3',
        'I5 extends Input = I & I2 & I3 & I4',
        'I6 extends Input = I & I2 & I3 & I4 & I5',
        'I7 extends Input = I & I2 & I3 & I4 & I5 & I6',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'R4 extends HandlerResponse[any] = any',
        'R5 extends HandlerResponse[any] = any',
        'R6 extends HandlerResponse[any] = any',
        'R7 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
        'E5 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4]]',
        'E6 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5]]',
        'E7 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6]]',
        'E8 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
        handler4: H[E5, P, I4, R4],
        handler5: H[E6, P, I5, R5],
        handler6: H[E7, P, I6, R6],
        handler7: H[E8, P, I7, R7],
    ) -> '<[H[E2, P, I, R], H[E3, P, I2, R2], H[E4, P, I3, R3], H[E5, … (124 chars, #97baf02c)>': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'I4 extends Input = I & I2 & I3',
        'I5 extends Input = I & I2 & I3 & I4',
        'I6 extends Input = I & I2 & I3 & I4 & I5',
        'I7 extends Input = I & I2 & I3 & I4 & I5 & I6',
        'I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'R4 extends HandlerResponse[any] = any',
        'R5 extends HandlerResponse[any] = any',
        'R6 extends HandlerResponse[any] = any',
        'R7 extends HandlerResponse[any] = any',
        'R8 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
        'E5 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4]]',
        'E6 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5]]',
        'E7 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6]]',
        'E8 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7]]',
        'E9 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7, E8]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
        handler4: H[E5, P, I4, R4],
        handler5: H[E6, P, I5, R5],
        handler6: H[E7, P, I6, R6],
        handler7: H[E8, P, I7, R7],
        handler8: H[E9, P, I8, R8],
    ) -> '<[H[E2, P, I, R], H[E3, P, I2, R2], H[E4, P, I3, R3], H[E5, … (142 chars, #962a7c39)>': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'I4 extends Input = I & I2 & I3',
        'I5 extends Input = I & I2 & I3 & I4',
        'I6 extends Input = I & I2 & I3 & I4 & I5',
        'I7 extends Input = I & I2 & I3 & I4 & I5 & I6',
        'I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7',
        'I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'R4 extends HandlerResponse[any] = any',
        'R5 extends HandlerResponse[any] = any',
        'R6 extends HandlerResponse[any] = any',
        'R7 extends HandlerResponse[any] = any',
        'R8 extends HandlerResponse[any] = any',
        'R9 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
        'E5 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4]]',
        'E6 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5]]',
        'E7 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6]]',
        'E8 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7]]',
        'E9 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7, E8]]',
        'E10 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7, E8, E9]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
        handler4: H[E5, P, I4, R4],
        handler5: H[E6, P, I5, R5],
        handler6: H[E7, P, I6, R6],
        handler7: H[E8, P, I7, R7],
        handler8: H[E9, P, I8, R8],
        handler9: H[E10, P, I9, R9],
    ) -> '<[H[E2, P, I, R], H[E3, P, I2, R], H[E4, P, I3, R], H[E5, P, … (153 chars, #f126738c)>': ...
    @overload
    def __call__[
        'I extends Input = {}',
        'I2 extends Input = I',
        'I3 extends Input = I & I2',
        'I4 extends Input = I & I2 & I3',
        'I5 extends Input = I & I2 & I3 & I4',
        'I6 extends Input = I & I2 & I3 & I4 & I5',
        'I7 extends Input = I & I2 & I3 & I4 & I5 & I6',
        'I8 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7',
        'I9 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8',
        'I10 extends Input = I & I2 & I3 & I4 & I5 & I6 & I7 & I8 & I9',
        'R extends HandlerResponse[any] = any',
        'R2 extends HandlerResponse[any] = any',
        'R3 extends HandlerResponse[any] = any',
        'R4 extends HandlerResponse[any] = any',
        'R5 extends HandlerResponse[any] = any',
        'R6 extends HandlerResponse[any] = any',
        'R7 extends HandlerResponse[any] = any',
        'R8 extends HandlerResponse[any] = any',
        'R9 extends HandlerResponse[any] = any',
        'R10 extends HandlerResponse[any] = any',
        'E2 extends Env = E',
        'E3 extends Env = IntersectNonAnyTypes[[E, E2]]',
        'E4 extends Env = IntersectNonAnyTypes[[E, E2, E3]]',
        'E5 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4]]',
        'E6 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5]]',
        'E7 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6]]',
        'E8 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7]]',
        'E9 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7, E8]]',
        'E10 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7, E8, E9]]',
        'E11 extends Env = IntersectNonAnyTypes[[E, E2, E3, E4, E5, E6, E7, E8, E9, E10]]',
    ](
        self,
        handler1: H[E2, P, I, R],
        handler2: H[E3, P, I2, R2],
        handler3: H[E4, P, I3, R3],
        handler4: H[E5, P, I4, R4],
        handler5: H[E6, P, I5, R5],
        handler6: H[E7, P, I6, R6],
        handler7: H[E8, P, I7, R7],
        handler8: H[E9, P, I8, R8],
        handler9: H[E10, P, I9, R9],
        handler10: H[E11, P, I10, R10],
    ) -> '<[H[E2, P, I, R], H[E3, P, I2, R2], H[E4, P, I3, R3], H[E5, … (182 chars, #f6138ee4)>': ...

class CssClassName(Protocol): ...

class FileSystemModule(Protocol):
    def mkdir(self, path: string, options: '{ recursive: boolean }') -> Promise[void | string]: ...
    def writeFile(self, path: string, data: string | Uint8Array) -> Promise[void]: ...

class SendOptions(Protocol):
    compress: Opt[boolean]

class SSEMessage(Protocol):
    data: string | Promise[string]
    event: Opt[string]
    id: Opt[string]
    retry: Opt[number]

class SSGPlugin(Protocol):
    afterGenerateHook: Opt['AfterGenerateHook | AfterGenerateHook[]']
    afterResponseHook: Opt['AfterResponseHook | AfterResponseHook[]']
    beforeRequestHook: Opt['BeforeRequestHook | BeforeRequestHook[]']

class ToSSGAdaptorInterface['E extends Env = Env', 'S extends Schema = {}', 'BasePath extends string = "/"'](Protocol):
    def __call__(
        self,
        app: Hono[E, S, BasePath],
        options: ToSSGOptions = ...,
    ) -> Promise[ToSSGResult]: ...

class ToSSGInterface(Protocol):
    def __call__(
        self,
        app: Hono[any, any, any],
        fsModule: FileSystemModule,
        options: ToSSGOptions = ...,
    ) -> Promise[ToSSGResult]: ...

class ToSSGOptions(Protocol):
    afterGenerateHook: Opt['AfterGenerateHook | AfterGenerateHook[]']
    afterResponseHook: Opt['AfterResponseHook | AfterResponseHook[]']
    beforeRequestHook: Opt['BeforeRequestHook | BeforeRequestHook[]']
    concurrency: Opt[number]
    dir: Opt[string]
    extensionMap: Opt[Record[string, string]]
    plugins: Opt['SSGPlugin[]']

class ToSSGResult(Protocol):
    error: Opt[Error]
    files: 'string[]'
    success: boolean

class UpgradeWebSocket['T = unknown', 'U = any', '_WSEvents = WSEvents[T]'](Protocol):
    @overload
    def __call__(
        self,
        createEvents: '(c: Context) => _WSEvents | Promise[_WSEvents]',
        options: U = ...,
    ) -> 'MiddlewareHandler[any, string, { outputFormat: "ws" }]': ...
    @overload
    def __call__(
        self,
        c: Context,
        events: _WSEvents,
        options: U = ...,
    ) -> 'Promise[Response & TypedResponse[{}, StatusCode, "ws"]]': ...

class WebSocketHelperDefineContext(Protocol): ...

class WSContextInit['T = unknown'](Protocol):
    protocol: Opt[string | null]
    raw: Opt[T]
    readyState: WSReadyState
    url: Opt[string | URL | null]
    def close(self, code: number = ..., reason: string = ...) -> void: ...
    def send(
        self,
        data: string | ArrayBuffer | Uint8Array[ArrayBuffer],
        options: SendOptions,
    ) -> void: ...

class WSEvents['T = unknown'](Protocol):
    onClose: Opt['(evt: CloseEvent, ws: WSContext[T]) => void']
    onError: Opt['(evt: Event, ws: WSContext[T]) => void']
    onMessage: Opt['(evt: MessageEvent[WSMessageReceive], ws: WSContext[T]) => void']
    onOpen: Opt['(evt: Event, ws: WSContext[T]) => void']

class Factory['E extends Env = Env', 'P extends string = string']:
    createHandlers: CreateHandlersInterface[E, P]
    def __init__(
        self,
        init: '{ initApp?: InitApp[E]; defaultAppOptions?: HonoOptions[E] }' = ...,
    ): ...
    def createApp(self, options: HonoOptions[E] = ...) -> Hono[E]: ...
    def createMiddleware['I extends Input = {}', 'R extends HandlerResponse[any] | void = void'](
        self,
        middleware: 'MiddlewareHandler[E, P, I, R extends void ? Response : R]',
    ) -> 'MiddlewareHandler[E, P, I, R extends void ? Response : R]': ...

class SSEStreamingApi(StreamingApi):
    def __init__(self, writable: WritableStream, readable: ReadableStream): ...
    async def writeSSE(self, message: SSEMessage) -> '<inferred>': ...

class WSContext['T = unknown']:
    binaryType: BinaryType
    protocol: string | null
    raw: Opt[T]
    readyState: Readonly[WSReadyState]
    url: URL | null
    def __init__(self, init: WSContextInit[T]): ...
    def close(self, code: number = ..., reason: string = ...) -> '<inferred>': ...
    def send(
        self,
        source: string | ArrayBuffer | Uint8Array[ArrayBuffer],
        options: SendOptions = ...,
    ) -> void: ...

def accepts(c: Context, options: acceptsOptions) -> string: ...
def basePath(c: Context, index: number = ...) -> string: ...
def baseRoutePath(c: Context, index: number = ...) -> string: ...

def buildStyleString(
    strings: TemplateStringsArray,
    values: 'CssVariableType[]',
) -> '[string, string, CssClassName[], string[]]': ...

def checkUserAgentEquals(platform: string) -> boolean: ...

def combineAfterGenerateHooks(
    hooks: 'AfterGenerateHook | AfterGenerateHook[]',
    fsModule: FileSystemModule,
    options: ToSSGOptions = ...,
) -> AfterGenerateHook: ...

def combineAfterResponseHooks(
    hooks: 'AfterResponseHook | AfterResponseHook[]',
) -> AfterResponseHook: ...

def combineBeforeRequestHooks(
    hooks: 'BeforeRequestHook | BeforeRequestHook[]',
) -> BeforeRequestHook: ...

def createCssContext(
    __0: '{ id: Readonly[string]; classNameSlug?: ClassNameSlug; onInvalidSlug?: OnInvalidSlug }',
) -> DefaultContextType: ...

def createFactory['E extends Env = Env', 'P extends string = string'](
    init: '{ initApp?: InitApp[E]; defaultAppOptions?: HonoOptions[E] }' = ...,
) -> Factory[E, P]: ...

def createMiddleware[
    'E extends Env = any',
    'P extends string = string',
    'I extends Input = {}',
    'R extends HandlerResponse[any] | void = void',
](
    middleware: 'MiddlewareHandler[E, P, I, R extends void ? Response : R]',
) -> 'MiddlewareHandler[E, P, I, R extends void ? Response : R]': ...

def createWSMessageEvent(source: WSMessageReceive) -> MessageEvent[WSMessageReceive]: ...

def cssCommon(
    strings: TemplateStringsArray,
    values: 'CssVariableType[]',
    classNameSlug: ClassNameSlug = ...,
    onInvalidSlug: OnInvalidSlug = ...,
) -> CssClassName: ...

def cxCommon(
    args: '(string | boolean | null | undefined | CssClassName)[]',
) -> '(string | boolean | null | undefined | CssClassName)[]': ...

def defaultMatch(accepts: 'Accept[]', config: acceptsConfig) -> string: ...
def defaultPlugin() -> SSGPlugin: ...

def defineWebSocketHelper['T = unknown', 'U = any'](
    handler: WebSocketHelperDefineHandler[T, U],
) -> UpgradeWebSocket[T, U]: ...

def deleteCookie(c: Context, name: string, opt: CookieOptions = ...) -> string | undefined: ...
def dirname(path: string) -> string: ...
def disableSSG() -> MiddlewareHandler: ...
def ensureWithinOutDir(outDir: string, filePath: string) -> void: ...

def env['T extends Record[string, unknown]', 'C extends Context = Context[{ Bindings: T }]'](
    c: 'T extends Record[string, unknown] ? Context : C',
    runtime: Runtime = ...,
) -> 'T & C["env"]': ...

def fetchRoutesContent[
    'E extends Env = Env',
    'S extends Schema = {}',
    'BasePath extends string = "/"',
](
    app: Hono[E, S, BasePath],
    beforeRequestHook: BeforeRequestHook = ...,
    afterResponseHook: AfterResponseHook = ...,
    concurrency: number = ...,
) -> '<Generator[Promise[Generator[Promise[{ routePath: string; … (134 chars, #847b2aaf)>': ...

def filterStaticGenerateRoutes['E extends Env'](
    hono: Hono[E],
) -> 'FilterStaticGenerateRouteData[]': ...

def generateCookie(name: string, value: string, opt: CookieOptions = ...) -> string: ...

async def generateSignedCookie(
    name: string,
    value: string,
    secret: string | BufferSource,
    opt: CookieOptions = ...,
) -> Promise[string]: ...

def getRouterName['E extends Env'](app: Hono[E]) -> string: ...
def getRuntimeKey() -> Runtime: ...

def html(
    strings: TemplateStringsArray,
    *values: 'unknown[]',
) -> HtmlEscapedString | Promise[HtmlEscapedString]: ...

def inspectRoutes['E extends Env'](hono: Hono[E]) -> 'RouteData[]': ...
def isDynamicRoute(path: string) -> boolean: ...
def isOldBunVersion() -> boolean: ...
def isSSGContext(c: Context) -> boolean: ...
def joinPaths(*paths: 'string[]') -> string: ...

def keyframesCommon(
    strings: TemplateStringsArray,
    values: 'CssVariableType[]',
    classNameSlug: ClassNameSlug = ...,
    onInvalidSlug: OnInvalidSlug = ...,
) -> CssClassName: ...

def matchedRoutes(c: Context) -> 'RouterRoute[]': ...
def minify(css: string) -> string: ...
def onlySSG() -> MiddlewareHandler: ...
def rawCssString(value: string) -> CssEscapedString: ...
def redirectPlugin() -> SSGPlugin: ...
def routePath(c: Context, index: number = ...) -> string: ...

async def saveContentToFile(
    data: 'Promise[{ routePath: string; content: string | ArrayBuffer; mimeType: string } | undefined]',
    fsModule: FileSystemModule,
    outDir: string,
    extensionMap: Record[string, string] = ...,
) -> Promise[string | undefined]: ...

def setCookie(c: Context, name: string, value: string, opt: CookieOptions = ...) -> void: ...

async def setSignedCookie(
    c: Context,
    name: string,
    value: string,
    secret: string | BufferSource,
    opt: CookieOptions = ...,
) -> Promise[void]: ...

def showRoutes['E extends Env'](hono: Hono[E], opts: ShowRoutesOptions = ...) -> void: ...

def stream(
    c: Context,
    cb: '(stream: StreamingApi) => Promise[void]',
    onError: '(e: Error, stream: StreamingApi) => Promise[void]' = ...,
) -> Response: ...

def streamSSE(
    c: Context,
    cb: '(stream: SSEStreamingApi) => Promise[void]',
    onError: '(e: Error, stream: SSEStreamingApi) => Promise[void]' = ...,
) -> Response: ...

def streamText(
    c: Context,
    cb: '(stream: StreamingApi) => Promise[void]',
    onError: '(e: Error, stream: StreamingApi) => Promise[void]' = ...,
) -> Response: ...

def testClient['T extends Hono[any, Schema, string]'](
    app: T,
    Env: 'ExtractEnv[T]["Bindings"] | {}' = ...,
    executionCtx: ExecutionContext = ...,
    options: Omit[ClientRequestOptions, "fetch"] = ...,
) -> UnionToIntersection[Client[T, "http://localhost"]]: ...

CLASS_NAME: 'unique symbol'
css: '<inferred>'
cx: '<inferred>'
DEFAULT_OUTPUT_DIR: '<inferred>'
DEFAULT_STYLE_ID: '<inferred>'
defaultExtensionMap: Record[string, string]
EXTERNAL_CLASS_NAMES: 'unique symbol'
getCookie: GetCookie
getSignedCookie: GetSignedCookie
IS_CSS_ESCAPED: '<inferred>'
isPseudoGlobalSelectorRe: '<inferred>'
keyframes: '<inferred>'
knownUserAgents: Partial[Record[Runtime, string]]
proxy: ProxyFetch
PSEUDO_GLOBAL_SELECTOR: '<inferred>'
SELECTOR: 'unique symbol'
SELECTORS: 'unique symbol'
SSG_CONTEXT: '<inferred>'
SSG_DISABLED_RESPONSE: '<inferred>'
ssgParams: SSGParamsMiddleware
Style: '<inferred>'
STYLE_STRING: 'unique symbol'
toSSG: ToSSGInterface
viewTransition: '<inferred>'
viewTransitionCommon: ViewTransitionType
X_HONO_DISABLE_SSG_HEADER_KEY: '<inferred>'
