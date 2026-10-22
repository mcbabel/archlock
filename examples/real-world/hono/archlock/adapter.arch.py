__module__ = "adapter"
__paths__ = ["src/adapter/**"]
__depends_on__ = ["helper", "hono", "middleware", "utils"]

APIGatewayProxyResult: TypeAlias = '<{ statusCode: number; statusDescription?: string; body: … (150 chars, #8f09d0c6)>'
EventContext: TypeAlias['Env = {}', 'P extends string = any', 'Data = Record[string, unknown]'] = '<{ request: Request; functionPath: string; waitUntil: … (292 chars, #625c421a)>'
HandleOptions: TypeAlias = '{ fetch?: typeof fetch }'
Handler: TypeAlias['TEvent = any', 'TResult = any'] = '(event: TEvent, context: LambdaContext, callback: Callback[TResult]) => void | Promise[TResult]'
KVAssetOptions: TypeAlias = '{ manifest?: object | string; namespace?: unknown }'
LambdaEvent: TypeAlias = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBProxyEvent | LatticeProxyEventV2
ServeStaticOptions: TypeAlias['E extends Env = Env'] = 'BaseServeStaticOptions[E] & { namespace?: unknown; manifest?: object | string }'

class ALBProxyEvent(Protocol):
    body: string | null
    headers: Opt[Record[string, string | undefined]]
    httpMethod: string
    isBase64Encoded: boolean
    multiValueHeaders: Opt['Record[string, string[] | undefined]']
    multiValueQueryStringParameters: Opt['{ [parameterKey: string]: string[] }']
    path: string
    queryStringParameters: Opt[Record[string, string | undefined]]
    requestContext: ALBRequestContext

class ALBRequestContext(Protocol):
    elb: '{ targetGroupArn: string }'

class APIGatewayProxyEvent(Protocol):
    body: string | null
    headers: Record[string, string | undefined]
    httpMethod: string
    isBase64Encoded: boolean
    multiValueHeaders: Opt['{ [headerKey: string]: string[] }']
    multiValueQueryStringParameters: Opt['{ [parameterKey: string]: string[] }']
    path: string
    pathParameters: Opt[Record[string, string]]
    queryStringParameters: Opt[Record[string, string | undefined]]
    requestContext: ApiGatewayRequestContext
    resource: string
    stageVariables: Opt[Record[string, string]]
    version: string

class APIGatewayProxyEventV2(Protocol):
    body: string | null
    cookies: Opt['string[]']
    headers: Record[string, string | undefined]
    isBase64Encoded: boolean
    multiValueHeaders: Opt[undefined]
    pathParameters: Opt['{ [name: string]: string | undefined }']
    queryStringParameters: Opt['{ [name: string]: string | undefined }']
    rawPath: string
    rawQueryString: string
    requestContext: ApiGatewayRequestContextV2
    routeKey: string
    stageVariables: Opt['{ [name: string]: string | undefined }']
    version: string

class ApiGatewayRequestContext(Protocol):
    accountId: string
    apiId: string
    authorizer: '{ claims?: unknown; scopes?: unknown }'
    domainName: string
    domainPrefix: string
    extendedRequestId: string
    httpMethod: string
    identity: Identity
    path: string
    protocol: string
    requestId: string
    requestTime: string
    requestTimeEpoch: number
    resourceId: Opt[string]
    resourcePath: string
    stage: string

class ApiGatewayRequestContextV2(Protocol):
    accountId: string
    apiId: string
    authentication: null
    authorizer: Authorizer
    domainName: string
    domainPrefix: string
    http: '{ method: string; path: string; protocol: string; sourceIp: string; userAgent: string }'
    requestId: string
    routeKey: string
    stage: string
    time: string
    timeEpoch: number

class BunServerWebSocket[T](Protocol):
    data: T
    readyState: '0 | 1 | 2 | 3'
    def close(self, code: number = ..., reason: string = ...) -> void: ...
    def send(self, data: string | ArrayBuffer | Uint8Array, compress: boolean = ...) -> void: ...

class BunWebSocketData(Protocol):
    events: WSEvents
    protocol: string
    url: URL

class BunWebSocketHandler[T](Protocol):
    def close(
        self,
        ws: BunServerWebSocket[T],
        code: number = ...,
        reason: string = ...,
    ) -> void: ...
    def message(
        self,
        ws: BunServerWebSocket[T],
        message: 'string | { buffer: ArrayBufferLike }',
    ) -> void: ...
    def open(self, ws: BunServerWebSocket[T]) -> void: ...

class Callback(Protocol):
    def __call__(
        self,
        err: Error | null,
        result: CloudFrontRequest | CloudFrontResult = ...,
    ) -> void: ...

class ClientContext(Protocol):
    client: ClientContextClient
    Custom: Opt[any]
    env: ClientContextEnv

class ClientContextClient(Protocol):
    appPackageName: string
    appTitle: string
    appVersionCode: string
    appVersionName: string
    installationId: string

class ClientContextEnv(Protocol):
    locale: string
    make: string
    model: string
    platform: string
    platformVersion: string

class CloudFrontConfig(Protocol):
    distributionDomainName: string
    distributionId: string
    eventType: string
    requestId: string

class CloudFrontEdgeEvent(Protocol):
    Records: 'CloudFrontEvent[]'

class CloudFrontRequest(Protocol):
    body: Opt['{ inputTruncated: boolean; action: string; encoding: string; data: string }']
    clientIp: string
    headers: CloudFrontHeaders
    method: string
    origin: Opt[CloudFrontOrigin]
    querystring: string
    uri: string

class CloudFrontResponse(Protocol):
    headers: CloudFrontHeaders
    status: string
    statusDescription: Opt[string]

class CognitoIdentity(Protocol):
    cognitoIdentityId: string
    cognitoIdentityPoolId: string

class FetchEvent(ExtendableEvent, Protocol):
    clientId: Readonly[string]
    handled: Readonly[Promise[void]]
    preloadResponse: Readonly[Promise[any]]
    request: Readonly[Request]
    resultingClientId: Readonly[string]
    def respondWith(self, r: Response | PromiseLike[Response]) -> void: ...

class LambdaContext(Protocol):
    awsRequestId: string
    callbackWaitsForEmptyEventLoop: boolean
    clientContext: Opt[ClientContext | undefined]
    functionName: string
    functionVersion: string
    identity: Opt[CognitoIdentity | undefined]
    invokedFunctionArn: string
    logGroupName: string
    logStreamName: string
    memoryLimitInMB: string
    def getRemainingTimeInMillis(self) -> number: ...

class LatticeProxyEventV2(Protocol):
    body: string | null
    headers: 'Record[string, string[] | undefined]'
    isBase64Encoded: boolean
    method: string
    path: string
    queryStringParameters: 'Record[string, string[] | undefined]'
    requestContext: LatticeRequestContextV2
    version: string

class LatticeRequestContextV2(Protocol):
    identity: '<{ sourceVpcArn?: string; type?: string; principal?: string; … (220 chars, #3a0d0b6c)>'
    region: string
    serviceArn: string
    serviceNetworkArn: string
    targetGroupArn: string
    timeEpoch: string

class ALBProcessor(EventProcessor[ALBProxyEvent]): ...

class EventProcessor['E extends LambdaEvent']:
    def createRequest(self, event: E) -> Request: ...
    async def createResult(
        self,
        event: E,
        res: Response,
        options: Pick[HandleOptions, "isContentTypeBinary"],
    ) -> Promise[APIGatewayProxyResult]: ...
    def setCookies(
        self,
        _event: E,
        res: Response,
        result: APIGatewayProxyResult,
    ) -> '<inferred>': ...

class EventV1Processor(EventProcessor[APIGatewayProxyEvent]): ...
class EventV2Processor(EventProcessor[APIGatewayProxyEventV2]): ...
class LatticeV2Processor(EventProcessor[LatticeProxyEventV2]): ...

def aws_lambda_handler__handle[
    'E extends Env = Env',
    'S extends Schema = {}',
    'BasePath extends string = "/"',
](
    app: Hono[E, S, BasePath],
    __1: HandleOptions = ...,
) -> '<([L extends LambdaEvent](event: L, lambdaContext?: … (200 chars, #9ab4947a)>': ...

def bun_serve_static__serveStatic['E extends Env = Env'](
    options: ServeStaticOptions[E] = ...,
) -> MiddlewareHandler: ...

def cloudflare_pages_handler__handle[
    'E extends Env = Env',
    'S extends Schema = BlankSchema',
    'BasePath extends string = "/"',
](
    app: Hono[E, S, BasePath],
) -> PagesFunction[E["Bindings"]]: ...

def cloudflare_pages_handler__serveStatic() -> MiddlewareHandler: ...

def cloudflare_workers_serve_static__serveStatic['E extends Env = Env'](
    options: ServeStaticOptions[E] = ...,
) -> MiddlewareHandler: ...

def cloudflare_workers_serve_static_module__serveStatic['E extends Env = Env'](
    options: Omit[ServeStaticOptions[E], "namespace"],
) -> MiddlewareHandler: ...

def createBody(
    method: string,
    requestBody: CloudFrontRequest["body"],
) -> string | Uint8Array[ArrayBuffer] | undefined: ...

def createBunWebSocket[T]() -> CreateWebSocket[T]: ...
def createWSContext(ws: BunServerWebSocket[BunWebSocketData]) -> WSContext: ...
def defaultIsContentTypeBinary(contentType: string) -> boolean: ...

def deno_serve_static__serveStatic['E extends Env = Env'](
    options: ServeStaticOptions[E] = ...,
) -> MiddlewareHandler: ...

def fire['E extends Env', 'S extends Schema', 'BasePath extends string'](
    app: Hono[E, S, BasePath],
    options: HandleOptions = ...,
) -> void: ...

def getBunServer[T](c: Context) -> T | undefined: ...

async def getContentFromKVAsset(
    path: string,
    options: KVAssetOptions = ...,
) -> Promise[ReadableStream | null]: ...

def getProcessor(event: LambdaEvent) -> EventProcessor[LambdaEvent]: ...

def handleMiddleware['E extends Env = {}', 'P extends string = any', 'I extends Input = {}'](
    middleware: 'MiddlewareHandler[E & { Bindings: { eventContext: EventContext } }, P, I]',
) -> PagesFunction[E["Bindings"]]: ...

def isContentEncodingBinary(contentEncoding: string | null) -> '<inferred>': ...
def isContentTypeBinary(contentType: string) -> boolean: ...

def lambda_edge_handler__handle(
    app: Hono[any],
) -> '<((event: CloudFrontEdgeEvent, context?: CloudFrontContext, … (129 chars, #c2ce1006)>': ...

def netlify_handler__handle(
    app: Hono[any, any],
) -> '((req: Request, context: any) => Response | Promise[Response])': ...

def service_worker_handler__handle['E extends Env', 'S extends Schema', 'BasePath extends string'](
    app: Hono[E, S, BasePath],
    opts: HandleOptions = ...,
) -> Handler: ...

def streamHandle['E extends Env = Env', 'S extends Schema = {}', 'BasePath extends string = "/"'](
    app: Hono[E, S, BasePath],
) -> Handler: ...

def vercel_handler__handle(app: Hono[any, any, any]) -> '<inferred>': ...

aws_lambda_conninfo__getConnInfo: GetConnInfo
bun_conninfo__getConnInfo: GetConnInfo
bun_ssg__toSSG: ToSSGAdaptorInterface
bun_websocket__upgradeWebSocket: UpgradeWebSocket[any]
bunFileSystemModule: FileSystemModule
cloudflare_pages_conninfo__getConnInfo: GetConnInfo
cloudflare_workers_conninfo__getConnInfo: GetConnInfo
cloudflare_workers_websocket__upgradeWebSocket: UpgradeWebSocket[WebSocket, any, Omit[WSEvents[WebSocket], "onOpen"]]
deno_conninfo__getConnInfo: GetConnInfo
deno_ssg__toSSG: ToSSGAdaptorInterface
deno_websocket__upgradeWebSocket: UpgradeWebSocket[WebSocket, Deno.UpgradeWebSocketOptions]
denoFileSystemModule: FileSystemModule
lambda_edge_conninfo__getConnInfo: GetConnInfo
netlify_conninfo__getConnInfo: GetConnInfo
vercel_conninfo__getConnInfo: GetConnInfo
websocket: BunWebSocketHandler[BunWebSocketData]
