__module__ = "client"
__paths__ = ["src/client/**"]
__entry__ = "src/client/index.ts"
__depends_on__ = ["hono", "utils"]

ApplyGlobalResponse: TypeAlias[App, 'Def extends GlobalResponseDefinition'] = '<App extends HonoBase[infer E, infer _ extends Schema, infer … (162 chars, #d177ec7a)>'
ClientRequest: TypeAlias['Prefix extends string', 'Path extends string', 'S extends Schema'] = '<{ [M in keyof ExpandAllMethod[S]]: ExpandAllMethod[S][M] … (1087 chars, #be1df661)>'
ClientRequestOptions: TypeAlias['T = unknown'] = '<{ fetch?: typeof fetch | HonoRequest; webSocket?: (...args: … (350 chars, #73b34cf7)>'
Fetch: TypeAlias[T] = '(args?: InferRequestType[T], opt?: ClientRequestOptions) => Promise[ClientResponseOfEndpoint[InferEndpointType[T]]]'
InferRequestType: TypeAlias[T] = 'T extends (args: infer R, options: any | undefined) => Promise[ClientResponse[unknown]] ? NonNullable[R] : never'
InferResponseType: TypeAlias[T, 'U extends StatusCode = StatusCode'] = InferResponseTypeFromEndpoint[InferEndpointType[T], U]
PickResponseByStatusCode: TypeAlias[App, 'U extends StatusCode'] = '<App extends HonoBase[infer E, infer _ extends Schema, infer … (161 chars, #df715d2e)>'

class ClientResponse[T, 'U extends number = StatusCode', 'F extends ResponseFormat = ResponseFormat'](Protocol):
    body: Readonly[ReadableStream | null]
    bodyUsed: Readonly[boolean]
    headers: Headers
    ok: 'U extends SuccessStatusCode ? true : U extends Exclude[StatusCode, SuccessStatusCode] ? false : boolean'
    redirected: boolean
    status: U
    statusText: string
    type: '"basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect"'
    url: string
    def arrayBuffer(self) -> Promise[ArrayBuffer]: ...
    def blob(self) -> Promise[Blob]: ...
    def bytes(self) -> Promise[Uint8Array[ArrayBuffer]]: ...
    def clone(self) -> Response: ...
    def formData(self) -> Promise[FormData]: ...
    def json(
        self,
    ) -> 'F extends "text" ? Promise[never] : F extends "json" ? Promise[T] : Promise[unknown]': ...
    def redirect(self, url: string, status: number) -> Response: ...
    def text(
        self,
    ) -> 'F extends "text" ? (T extends string ? Promise[T] : Promise[never]) : Promise[string]': ...

class DetailedError(Error):
    code: Opt[any]
    detail: Opt[any]
    log: Opt[any]
    statusCode: Opt[any]
    def __init__(
        self,
        message: string,
        options: '{ detail?: any; code?: any; statusCode?: number; log?: any }' = ...,
    ): ...

def hc['T extends Hono[any, any, any]', 'Prefix extends string = string'](
    baseUrl: Prefix,
    options: ClientRequestOptions = ...,
) -> '<inferred>': ...

async def parseResponse['T extends ClientResponse[any]'](
    fetchRes: T | Promise[T],
) -> '<Promise[FilterClientResponseByStatusCode[T, … (387 chars, #0d4a4825)>': ...
