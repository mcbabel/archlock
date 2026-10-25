__module__ = "utils"
__paths__ = ["src/utils/**"]
__depends_on__ = ["helper", "hono"]

class AlgorithmTypes(Enum):
    HS256 = 'HS256'
    HS384 = 'HS384'
    HS512 = 'HS512'
    RS256 = 'RS256'
    RS384 = 'RS384'
    RS512 = 'RS512'
    PS256 = 'PS256'
    PS384 = 'PS384'
    PS512 = 'PS512'
    ES256 = 'ES256'
    ES384 = 'ES384'
    ES512 = 'ES512'
    EdDSA = 'EdDSA'

class CryptoKeyUsage(Enum):
    Encrypt = 'encrypt'
    Decrypt = 'decrypt'
    Sign = 'sign'
    Verify = 'verify'
    DeriveKey = 'deriveKey'
    DeriveBits = 'deriveBits'
    WrapKey = 'wrapKey'
    UnwrapKey = 'unwrapKey'

AcceptHeader: TypeAlias = '"Accept" | "Accept-Charset" | "Accept-Encoding" | "Accept-Language" | "Accept-Patch" | "Accept-Post" | "Accept-Ranges"'
AsymmetricAlgorithm: TypeAlias = '"RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512" | "ES256" | "ES384" | "ES512" | "EdDSA"'
Auth: TypeAlias = '(req: Request) => { username: string; password: string } | undefined'
BaseMime: TypeAlias = '(typeof _baseMimes)[keyof typeof _baseMimes]'
BodyData: TypeAlias['T extends Partial[ParseBodyOptions] = {}'] = SimplifyBodyData[Record[string, BodyDataValue[T]]]
ClientErrorStatusCode: TypeAlias = '<400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | … (171 chars, #355c605d)>'
ContentfulStatusCode: TypeAlias = Exclude[StatusCode, ContentlessStatusCode]
ContentlessStatusCode: TypeAlias = '101 | 204 | 205 | 304'
Cookie: TypeAlias = Record[string, string]
CookieConstraint: TypeAlias[Name] = '<Name extends `__Secure-${string}` ? CookieOptions & … (163 chars, #1dc889d8)>'
CookieOptions: TypeAlias = '<{ domain?: string; expires?: Date; httpOnly?: boolean; … (320 chars, #230aecc7)>'
CookiePrefixOptions: TypeAlias = '"host" | "secure"'
CustomHeader: TypeAlias = 'string & {}'
DeprecatedStatusCode: TypeAlias = '305 | 306'
Equal: TypeAlias[X, Y] = '([T]() => T extends X ? 1 : 2) extends [T]() => T extends Y ? 1 : 2 ? true : false'
Expect: TypeAlias['T extends true'] = T
HasRequiredKeys: TypeAlias['BaseType extends object'] = 'RequiredKeysOf[BaseType] extends never ? false : true'
HtmlEscaped: TypeAlias = '{ isEscaped: true; callbacks?: HtmlEscapedCallback[] }'
HtmlEscapedCallback: TypeAlias = '(opts: HtmlEscapedCallbackOpts) => Promise[string] | undefined'
HtmlEscapedString: TypeAlias = 'string & HtmlEscaped'
IfAnyThenEmptyObject: TypeAlias[T] = '0 extends 1 & T ? {} : T'
InfoStatusCode: TypeAlias = '100 | 101 | 102 | 103'
InterfaceToType: TypeAlias[T] = 'T extends Function ? T : { [K in keyof T]: InterfaceToType[T[K]] }'
InvalidIPAddressError: TypeAlias = 'TypeError & { code: typeof INVALID_IP_ADDRESS_ERROR_CODE }'
InvalidJSONValue: TypeAlias = 'undefined | symbol | ((...args: unknown[]) => unknown)'
IsAny: TypeAlias[T] = 'boolean extends (T extends never ? true : false) ? true : false'
JSONArray: TypeAlias = '(JSONPrimitive | JSONObject | JSONArray)[]'
JSONObject: TypeAlias = '{ [key: string]: JSONPrimitive | JSONArray | JSONObject | object | InvalidJSONValue }'
JSONParsed: TypeAlias[T, 'TError = bigint | ReadonlyArray[bigint]'] = '<T extends { toJSON(): infer J } ? (() => J) extends () => … (808 chars, #d3c6ea53)>'
JSONPrimitive: TypeAlias = string | boolean | number | null
JSONValue: TypeAlias = JSONObject | JSONArray | JSONPrimitive
JWTPayload: TypeAlias = '{ [key: string]: unknown; exp?: number; nbf?: number; iat?: number; iss?: string; aud?: string | string[] }'
NotEqual: TypeAlias[X, Y] = 'true extends Equal[X, Y] ? false : true'
ParseBodyOptions: TypeAlias = '{ all: boolean; dot: boolean }'
Pattern: TypeAlias = 'readonly [string, string, RegExp | true] | "*"'
RedirectStatusCode: TypeAlias = '300 | 301 | 302 | 303 | 304 | DeprecatedStatusCode | 307 | 308'
RemoveBlankRecord: TypeAlias[T] = 'T extends Record[infer K, unknown] ? (K extends string ? T : never) : never'
RequestHeader: TypeAlias = '<"A-IM" | "Accept" | "Accept-Additions" | "Accept-CH" | … (4635 chars, #9f247ce7)>'
RequiredKeysOf: TypeAlias['BaseType extends object'] = '<Exclude[{ [Key in keyof BaseType]: BaseType extends … (122 chars, #8038b2a0)>'
ResponseHeader: TypeAlias = '<"Accept-Query" | "Access-Control-Allow-Credentials" | … (1657 chars, #0efefdf5)>'
ServerErrorStatusCode: TypeAlias = '500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511'
SignatureAlgorithm: TypeAlias = 'keyof typeof AlgorithmTypes'
SignatureKey: TypeAlias = string | HonoJsonWebKey | CryptoKey
SignedCookie: TypeAlias = Record[string, string | false]
Simplify: TypeAlias[T] = '{ [KeyType in keyof T]: T[KeyType] } & {}'
SimplifyDeepArray: TypeAlias[T] = 'T extends any[] ? { [E in keyof T]: SimplifyDeepArray[T[E]] } : Simplify[T]'
StatusCode: TypeAlias = '<InfoStatusCode | SuccessStatusCode | RedirectStatusCode | … (126 chars, #fbceb5e8)>'
StringBuffer: TypeAlias = '(string | Promise[string])[]'
StringBufferWithCallbacks: TypeAlias = 'StringBuffer & { callbacks: HtmlEscapedCallback[] }'
StringLiteralUnion: TypeAlias[T] = 'T | (string & Record[never, never])'
SuccessStatusCode: TypeAlias = '200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226'
SymmetricAlgorithm: TypeAlias = '"HS256" | "HS384" | "HS512"'
UnionToIntersection: TypeAlias[U] = '(U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never'
UnOfficalStatusCode: TypeAlias = UnofficialStatusCode
UnofficialStatusCode: TypeAlias = '-1'
VerifyOptions: TypeAlias = '{ iss?: string | RegExp; nbf?: boolean; exp?: boolean; iat?: boolean; aud?: string | string[] | RegExp }'
VerifyOptionsWithAlg: TypeAlias = '{ alg: SignatureAlgorithm } & VerifyOptions'

class Accept(Protocol):
    params: Record[string, string]
    q: number
    type: string

class HonoJsonWebKey(JsonWebKey, Protocol):
    kid: Opt[string]

class Pool(Protocol):
    def run[T](self, fn: '() => T') -> Promise[T]: ...

class TokenHeader(Protocol):
    alg: SignatureAlgorithm
    kid: Opt[string]
    typ: Opt['"JWT"']

class JwtAlgorithmMismatch(Error):
    def __init__(self, expected: string, actual: string): ...

class JwtAlgorithmNotAllowed(Error):
    def __init__(self, alg: string, allowedAlgorithms: 'readonly string[]'): ...

class JwtAlgorithmNotImplemented(Error):
    def __init__(self, alg: string): ...

class JwtAlgorithmRequired(Error):
    def __init__(self): ...

class JwtHeaderInvalid(Error):
    def __init__(self, header: object): ...

class JwtHeaderRequiresKid(Error):
    def __init__(self, header: object): ...

class JwtPayloadRequiresAud(Error):
    def __init__(self, payload: object): ...

class JwtSymmetricAlgorithmNotAllowed(Error):
    def __init__(self, alg: string): ...

class JwtTokenAudience(Error):
    def __init__(self, expected: 'string | string[] | RegExp', aud: 'string | string[]'): ...

class JwtTokenExpired(Error):
    def __init__(self, token: string): ...

class JwtTokenInvalid(Error):
    def __init__(self, token: string): ...

class JwtTokenIssuedAt(Error):
    def __init__(self, currentTimestamp: number, iat: number): ...

class JwtTokenIssuer(Error):
    def __init__(self, expected: string | RegExp, iss: string | null): ...

class JwtTokenNotBefore(Error):
    def __init__(self, token: string): ...

class JwtTokenSignatureMismatched(Error):
    def __init__(self, token: string): ...

class StreamingApi:
    aborted: boolean
    closed: boolean
    responseReadable: ReadableStream
    def __init__(self, writable: WritableStream, _readable: ReadableStream): ...
    def abort(self) -> '<inferred>': ...
    async def close(self) -> '<inferred>': ...
    def onAbort(self, listener: '() => void | Promise[void]') -> '<inferred>': ...
    async def pipe(self, body: ReadableStream) -> '<inferred>': ...
    def sleep(self, ms: number) -> Promise[unknown]: ...
    async def write(self, input: Uint8Array | string) -> Promise[StreamingApi]: ...
    async def writeln(self, input: string) -> Promise[StreamingApi]: ...

def bufferToFormData(arrayBuffer: ArrayBuffer, contentType: string) -> Promise[FormData]: ...
def bufferToString(buffer: ArrayBuffer) -> string: ...
def checkOptionalParameter(path: string) -> 'string[] | null': ...
def convertIPv4BinaryToString(ipV4: bigint) -> string: ...
def convertIPv4MappedIPv6ToIPv4(ipv6binary: bigint) -> bigint: ...
def convertIPv4ToBinary(ipv4: string) -> bigint: ...
def convertIPv6BinaryToString(ipV6: bigint) -> string: ...
def convertIPv6ToBinary(ipv6: string) -> bigint: ...
async def createHash(data: Data, algorithm: Algorithm) -> Promise[string | null]: ...
def createPool(__0: '{ concurrency?: number; interval?: number }' = ...) -> Pool: ...
def decode(token: string) -> '{ header: TokenHeader; payload: JWTPayload }': ...
def decodeBase64(str: string) -> Uint8Array[ArrayBuffer]: ...
def decodeBase64Url(str: string) -> Uint8Array[ArrayBuffer]: ...
def decodeHeader(token: string) -> TokenHeader: ...
def distinctRemoteAddr(remoteAddr: string) -> AddressType: ...
def encodeBase64(buf: ArrayBufferLike) -> string: ...
def encodeBase64Url(buf: ArrayBufferLike) -> string: ...
def equal(a: ArrayBuffer, b: ArrayBuffer) -> boolean: ...
def escapeToBuffer(str: string, buffer: StringBuffer) -> void: ...
def expandIPv6(ipV6: string) -> string: ...
def findTargetHandler(handler: Function) -> Function: ...
def getColorEnabled() -> boolean: ...
async def getColorEnabledAsync() -> Promise[boolean]: ...
def getExtension(mimeType: string) -> string | undefined: ...
def getFilePath(options: FilePathOptions) -> string | undefined: ...

def getFilePathWithoutDefaultDocument(
    options: Omit[FilePathOptions, "defaultDocument"],
) -> string | undefined: ...

def getMimeType(filename: string, mimes: Record[string, string] = ...) -> string | undefined: ...
def getPath(request: Request) -> string: ...
def getPathNoStrict(request: Request) -> string: ...
def getPattern(label: string, next: string = ...) -> Pattern | null: ...

def getQueryParams(
    url: string,
    key: string = ...,
) -> 'string[] | undefined | Record[string, string[]]': ...

def getQueryStrings(url: string) -> string: ...
def isIPv4MappedIPv6(ipv6binary: bigint) -> boolean: ...
def isMiddleware(handler: Function) -> '<inferred>': ...
def isTokenHeader(obj: unknown) -> 'obj is TokenHeader': ...
async def md5(data: Data) -> Promise[string | null]: ...
def parse(cookie: string, name: string = ...) -> Cookie: ...
def parseAccept(acceptHeader: string) -> 'Accept[]': ...

async def parseSigned(
    cookie: string,
    secret: string | BufferSource,
    name: string = ...,
) -> Promise[SignedCookie]: ...

def raw(value: unknown, callbacks: 'HtmlEscapedCallback[]' = ...) -> HtmlEscapedString: ...

async def resolveCallback(
    str: string | HtmlEscapedString | Promise[string],
    phase: '(typeof HtmlEscapedCallbackPhase)[keyof typeof HtmlEscapedCallbackPhase]',
    preserveCallbacks: boolean,
    context: object,
    buffer: '[string]' = ...,
) -> Promise[string]: ...

def resolveCallbackSync(str: string | HtmlEscapedString) -> string: ...

def serialize['Name extends string'](
    name: Name,
    value: string,
    opt: CookieConstraint[Name] = ...,
) -> string: ...

async def serializeSigned(
    name: string,
    value: string,
    secret: string | BufferSource,
    opt: CookieOptions = ...,
) -> Promise[string]: ...

async def sha1(data: Data) -> Promise[string | null]: ...
async def sha256(data: Data) -> Promise[string | null]: ...

async def sign(
    payload: JWTPayload,
    privateKey: SignatureKey,
    alg: SignatureAlgorithm = ...,
) -> Promise[string]: ...

async def signing(
    privateKey: SignatureKey,
    alg: SignatureAlgorithm,
    data: BufferSource,
) -> Promise[ArrayBuffer]: ...

def splitPath(path: string) -> 'string[]': ...
def splitRoutingPath(routePath: string) -> 'string[]': ...

async def stringBufferToString(
    buffer: StringBuffer,
    callbacks: 'HtmlEscapedCallback[] | undefined',
) -> Promise[HtmlEscapedString]: ...

def tryDecode(str: string, decoder: Decoder) -> string: ...
def tryDecodeURI(str: string) -> string: ...
def tryDecodeURIComponent(str: string) -> string: ...

async def verify(
    token: string,
    publicKey: SignatureKey,
    algOrOptions: SignatureAlgorithm | VerifyOptionsWithAlg,
) -> Promise[JWTPayload]: ...

async def verifying(
    publicKey: SignatureKey,
    alg: SignatureAlgorithm,
    signature: BufferSource,
    data: BufferSource,
) -> Promise[boolean]: ...

async def verifyWithJwks(
    token: string,
    options: '<{ keys?: HonoJsonWebKey[]; jwks_uri?: string; … (127 chars, #518e7f9f)>',
    init: RequestInit = ...,
) -> Promise[JWTPayload]: ...

auth: Auth
COMPOSED_HANDLER: '<inferred>'
COMPRESSIBLE_CONTENT_TYPE_REGEX: '<inferred>'
decodeURIComponent_: '<inferred>'
getQueryParam: '(url: string, key?: string) => string | undefined | Record[string, string]'
HtmlEscapedCallbackPhase: '<inferred>'
INVALID_IP_ADDRESS_ERROR_CODE: '<inferred>'
Jwt: '<inferred>'
mergePath: '(...paths: string[]) => string'
mimes: Record[string, BaseMime]
parseBody: ParseBody
timingSafeEqual: TimingSafeEqual
utf8Decoder: TextDecoder
utf8Encoder: TextEncoder
