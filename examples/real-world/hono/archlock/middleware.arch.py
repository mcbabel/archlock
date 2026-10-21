__module__ = "middleware"
__paths__ = ["src/middleware/**"]
__depends_on__ = ["helper", "hono", "jsx", "router", "utils"]

from .utils import AlgorithmTypes, COMPRESSIBLE_CONTENT_TYPE_REGEX

ApplicationHandler: TypeAlias = '(request: Request, ...args: any) => Response | Promise[Response]'
CacheType: TypeAlias = '"cookie"'
ContentSecurityPolicyOptionHandler: TypeAlias = '(ctx: Context, directive: string) => string'
DetectorFunction: TypeAlias = '(c: Context, options: DetectorOptions) => string | undefined'
Detectors: TypeAlias = 'Record[keyof typeof detectors, DetectorFunction]'
DetectorType: TypeAlias = '"path" | "querystring" | "cookie" | "header"'
HTTPExceptionFunction: TypeAlias = '(context: Context) => HTTPException'
IPRestrictionRule: TypeAlias = 'string | ((addr: { addr: string; type: AddressType }) => boolean)'
JwtVariables: TypeAlias['T = any'] = '{ jwtPayload: T }'
MountOptionHandler: TypeAlias = '(c: Context) => unknown'
MountOptions: TypeAlias = 'MountOptionHandler | { optionHandler?: MountOptionHandler; replaceRequest?: MountReplaceRequest | false }'
MountReplaceRequest: TypeAlias = '(originalRequest: Request) => Request'
PermissionsPolicyDirective: TypeAlias = StandardizedFeatures | ProposedFeatures | ExperimentalFeatures
RequestIdOptions: TypeAlias = '{ limitLength?: number; headerName?: string; generator?: (c: Context) => string }'
RequestIdVariables: TypeAlias = '{ requestId: string }'
SecureHeadersVariables: TypeAlias = '{ secureHeadersNonce?: string }'
ServeStaticOptions: TypeAlias['E extends Env = Env'] = '<{ root?: string; path?: string; precompressed?: boolean; … (299 chars, #48c93f64)>'
TimingVariables: TypeAlias = '{ metric?: { headers: string[]; timers: Map[string, Timer] } }'

class DetectorOptions(Protocol):
    caches: 'CacheType[] | false'
    convertDetectedLanguage: Opt['(lang: string) => string']
    cookieOptions: Opt['<{ domain?: string; path?: string; sameSite?: "Strict" | … (127 chars, #d56fad2a)>']
    debug: Opt[boolean]
    fallbackLanguage: string
    ignoreCase: boolean
    lookupCookie: string
    lookupFromHeaderKey: string
    lookupFromPathIndex: number
    lookupQueryString: string
    order: 'DetectorType[]'
    supportedLanguages: 'string[]'

class IPRestrictionRules(Protocol):
    allowList: Opt['IPRestrictionRule[]']
    denyList: Opt['IPRestrictionRule[]']

class LanguageVariables(Protocol):
    language: string

def appendTrailingSlash(options: AppendTrailingSlashOptions = ...) -> MiddlewareHandler: ...

def basicAuth(
    options: BasicAuthOptions,
    *users: '{ username: string; password: string }[]',
) -> MiddlewareHandler: ...

def bearerAuth['E extends Env = Env'](options: BearerAuthOptions[E]) -> MiddlewareHandler[E]: ...
def bodyLimit(options: BodyLimitOptions) -> MiddlewareHandler: ...

def cache(
    options: '<{ cacheName: string | ((c: Context) => Promise[string] | … (310 chars, #a2edfbbf)>',
) -> MiddlewareHandler: ...

def compress(options: CompressionOptions = ...) -> MiddlewareHandler: ...
def contextStorage() -> MiddlewareHandler: ...
def cors(options: CORSOptions = ...) -> MiddlewareHandler: ...
def csrf(options: CSRFOptions = ...) -> MiddlewareHandler: ...
def defaultJoin(*paths: 'string[]') -> string: ...
def detectFromCookie(c: Context, options: DetectorOptions) -> string | undefined: ...
def detectFromHeader(c: Context, options: DetectorOptions) -> string | undefined: ...
def detectFromPath(c: Context, options: DetectorOptions) -> string | undefined: ...
def detectFromQuery(c: Context, options: DetectorOptions) -> string | undefined: ...
def endTime(c: Context, name: string, precision: number = ...) -> '<inferred>': ...
def etag(options: ETagOptions = ...) -> MiddlewareHandler: ...
def every(*middleware: '(MiddlewareHandler | Condition)[]') -> MiddlewareHandler: ...

def except_(
    condition: 'string | Condition | (string | Condition)[]',
    *middleware: 'MiddlewareHandler[]',
) -> MiddlewareHandler: ...

async def generateDigest(
    stream: ReadableStream[Uint8Array[ArrayBuffer]] | null,
    generator: '(body: Uint8Array[ArrayBuffer]) => ArrayBuffer | Promise[ArrayBuffer]',
) -> Promise[string | null]: ...

def getContext['E extends Env = Env']() -> Context[E]: ...

def ipRestriction(
    getIP: GetIPAddr,
    __1: IPRestrictionRules,
    onError: '(remote: { addr: string; type: AddressType }, c: Context) => Response | Promise[Response]' = ...,
) -> MiddlewareHandler: ...

def jsxRenderer['E extends Env = Env'](
    component: ComponentWithChildren = ...,
    options: 'RendererOptions | ((c: Context[E]) => RendererOptions)' = ...,
) -> MiddlewareHandler: ...

def jwk(
    options: '<{ keys?: HonoJsonWebKey[] | ((ctx: Context) => … (381 chars, #cdb202e5)>',
    init: RequestInit = ...,
) -> MiddlewareHandler: ...

def jwt(
    options: '<{ secret: SignatureKey; cookie?: string | { key: string; … (220 chars, #1cacb62c)>',
) -> MiddlewareHandler: ...

def languageDetector(userOptions: Partial[DetectorOptions]) -> MiddlewareHandler: ...
def logger(fn: PrintFunc = ...) -> MiddlewareHandler: ...

def methodNotAllowed['E extends Env = Env'](
    options: MethodNotAllowedOptions[E],
) -> MiddlewareHandler[E]: ...

def methodOverride(options: MethodOverrideOptions) -> MiddlewareHandler: ...

def mount(
    applicationHandler: ApplicationHandler,
    options: MountOptions = ...,
) -> MiddlewareHandler: ...

def normalizeLanguage(
    lang: string | null | undefined,
    options: DetectorOptions,
) -> string | undefined: ...

def parseAcceptLanguage(header: string) -> 'Array[{ lang: string; q: number }]': ...
def poweredBy(options: PoweredByOptions = ...) -> MiddlewareHandler: ...
def prettyJSON(options: PrettyOptions = ...) -> MiddlewareHandler: ...
def requestId(__0: RequestIdOptions = ...) -> MiddlewareHandler: ...
def secureHeaders(customOptions: SecureHeadersOptions = ...) -> MiddlewareHandler: ...

def serveStatic['E extends Env = Env'](
    options: '<ServeStaticOptions[E] & { getContent: (path: string, c: … (261 chars, #035e4755)>',
) -> MiddlewareHandler: ...

def some(*middleware: '(MiddlewareHandler | Condition)[]') -> MiddlewareHandler: ...
def startTime(c: Context, name: string, description: string = ...) -> '<inferred>': ...

def timeout(
    duration: number,
    exception: HTTPExceptionFunction | HTTPException = ...,
) -> MiddlewareHandler: ...

def timing(config: TimingOptions = ...) -> MiddlewareHandler: ...
def trimTrailingSlash(options: TrimTrailingSlashOptions = ...) -> MiddlewareHandler: ...
def tryGetContext['E extends Env = Env']() -> Context[E] | undefined: ...
def useRequestContext['E extends Env = any', 'P extends string = any', 'I extends Input = {}']() -> Context[E, P, I]: ...
def validateOptions(options: DetectorOptions) -> void: ...

async def wrapTime[T](
    c: Context,
    name: string,
    callable: Promise[T],
    description: string = ...,
    precision: number = ...,
) -> Promise[T]: ...

decode: '<inferred>'
DEFAULT_OPTIONS: DetectorOptions
detectors: '<inferred>'
NONCE: ContentSecurityPolicyOptionHandler
RequestContext: 'JSXContext[Context[any, any, {}] | null]'
RETAINED_304_HEADERS: '<inferred>'
setMetric: SetMetric
sign: '<inferred>'
verify: '<inferred>'
verifyWithJwks: '<inferred>'
