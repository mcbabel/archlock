__module__ = "hono"
__paths__ = ["src/*"]
__entry__ = "src/index.ts"
__depends_on__ = ["client", "request", "router", "utils"]

from .client import ClientRequestOptions, InferRequestType, InferResponseType

Env: TypeAlias = '{ Bindings?: Bindings; Variables?: Variables }'
ErrorHandler: TypeAlias['E extends Env = any'] = '(err: Error | HTTPResponseError, c: Context[E]) => Response | Promise[Response]'
Handler: TypeAlias['E extends Env = any', 'P extends string = any', 'I extends Input = BlankInput', 'R extends HandlerResponse[any] = any'] = '(c: Context[E, P, I], next: Next) => R'
Input: TypeAlias = '{ in?: {}; out?: {}; outputFormat?: ResponseFormat }'
MiddlewareHandler: TypeAlias['E extends Env = any', 'P extends string = string', 'I extends Input = {}', 'R extends HandlerResponse[any] = Response'] = '(c: Context[E, P, I], next: Next) => Promise[R | void]'
Next: TypeAlias = '() => Promise[void]'
NotFoundHandler: TypeAlias['E extends Env = any'] = '<(c: Context[E]) => NotFoundResponse extends Response ? … (130 chars, #7982d6d2)>'
Schema: TypeAlias = '{ [Path: string]: { [Method: `$${Lowercase<string>}`]: Endpoint } }'
ToSchema: TypeAlias['M extends string', 'P extends string', 'I extends Input | Input["in"]', RorO] = '<IsAny[RorO] extends true ? { [K in P]: { [K2 in M as … (366 chars, #3c579e8e)>'
TypedResponse: TypeAlias['T = unknown', 'U extends StatusCode = StatusCode', 'F extends ResponseFormat = T extends string ? "text" : T extends JSONValue ? "json" : ResponseFormat'] = '{ _data: T; _status: U; _format: F }'
ValidationTargets: TypeAlias['T extends FormValue = ParsedFormValue', 'P extends string = string'] = '<{ json: any; form: Record[string, T | T[]]; query: … (245 chars, #240acaa7)>'

class ContextRenderer(Protocol): ...
class ContextVariableMap(Protocol): ...

class ExecutionContext(Protocol):
    exports: Opt[any]
    props: any
    def passThroughOnException(self) -> void: ...
    def waitUntil(self, promise: Promise[unknown]) -> void: ...

class NotFoundResponse(Protocol): ...

class Context['E extends Env = any', 'P extends string = any', 'I extends Input = {}']:
    body: BodyRespond
    env: E["Bindings"]
    error: Error | undefined
    event: Readonly[FetchEventLike]
    executionCtx: Readonly[ExecutionContext]
    finalized: boolean
    get: 'Get[IsAny[E] extends true ? { Variables: ContextVariableMap & Record[PropertyKey, any] } : E]'
    header: SetHeaders
    html: HTMLRespond
    json: JSONRespond
    newResponse: NewResponse
    render: Renderer
    req: Readonly[HonoRequest[P, I["out"]]]
    res: Response
    set: 'Set[IsAny[E] extends true ? { Variables: ContextVariableMap & Record[PropertyKey, any] } : E]'
    text: TextRespond
    var: Readonly['Readonly[ContextVariableMap & (IsAny[E["Variables"]] extends true ? Record[string, any] : E["Variables"])]']
    def __init__(self, req: Request, options: ContextOptions[E] = ...): ...
    def getLayout(self) -> 'Layout[PropsForRenderer & { Layout: Layout }] | undefined': ...
    def notFound(self) -> ReturnType[NotFoundHandler]: ...
    def redirect['T extends RedirectStatusCode = 302'](
        self,
        location: string | URL,
        status: T = ...,
    ) -> 'Response & TypedResponse[undefined, T, "redirect"]': ...
    def setLayout(
        self,
        layout: 'Layout[PropsForRenderer & { Layout: Layout }]',
    ) -> 'Layout[PropsForRenderer & { Layout: Layout }]': ...
    def setRenderer(self, renderer: Renderer) -> void: ...
    def status(self, status: StatusCode) -> void: ...

class Hono['E extends Env = BlankEnv', 'S extends Schema = BlankSchema', 'BasePath extends string = "/"'](HonoBase[E, S, BasePath]):
    def __init__(self, options: HonoOptions[E] = ...): ...

class HonoRequest['P extends string = "/"', 'I extends Input["out"] = {}']:
    bodyCache: BodyCache
    matchedRoutes: Readonly['RouterRoute[]']
    method: Readonly[string]
    path: string
    raw: Request
    routeIndex: number
    routePath: Readonly[string]
    url: Readonly[string]
    def __init__(
        self,
        request: Request,
        path: string = ...,
        matchResult: Result[[unknown, RouterRoute]] = ...,
    ): ...
    def addValidatedData(self, target: 'keyof ValidationTargets', data: '{}') -> '<inferred>': ...
    def arrayBuffer(self) -> Promise[ArrayBuffer]: ...
    def blob(self) -> Promise[Blob]: ...
    def bytes(self) -> Promise[Uint8Array]: ...
    def formData(self) -> Promise[FormData]: ...
    @overload
    def header(self, name: RequestHeader) -> string | undefined: ...
    @overload
    def header(self, name: string) -> string | undefined: ...
    @overload
    def header(self) -> 'Record[RequestHeader | (string & CustomHeader), string]': ...
    def json['T = any'](self) -> Promise[T]: ...
    @overload
    def param['P2 extends ParamKeys[P] = ParamKeys[P]'](
        self,
        key: 'string extends P ? never : P2 extends `${infer _}?` ? never : P2',
    ) -> string: ...
    @overload
    def param['P2 extends RemoveQuestion[ParamKeys[P]] = RemoveQuestion[ParamKeys[P]]'](
        self,
        key: P2,
    ) -> string | undefined: ...
    @overload
    def param(self, key: string) -> string | undefined: ...
    @overload
    def param['P2 extends string = P'](
        self,
    ) -> Simplify[UnionToIntersection[ParamKeyToRecord[ParamKeys[P2]]]]: ...
    @overload
    async def parseBody['Options extends Partial[ParseBodyOptions]', 'T extends BodyData[Options]'](
        self,
        options: Options = ...,
    ) -> Promise[T]: ...
    @overload
    async def parseBody['T extends BodyData'](
        self,
        options: Partial[ParseBodyOptions] = ...,
    ) -> Promise[T]: ...
    @overload
    def queries(self, key: string) -> 'string[] | undefined': ...
    @overload
    def queries(self) -> 'Record[string, string[]]': ...
    @overload
    def query(self, key: string) -> string | undefined: ...
    @overload
    def query(self) -> Record[string, string]: ...
    def text(self) -> Promise[string]: ...
    def valid['T extends keyof I & keyof ValidationTargets'](
        self,
        target: T,
    ) -> InputToDataByTarget[I, T]: ...
