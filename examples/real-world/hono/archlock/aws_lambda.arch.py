__module__ = "aws_lambda"
__paths__ = ["adapters/aws-lambda/**"]
__entry__ = "adapters/aws-lambda/src/index.ts"
__depends_on__ = []

APIGatewayProxyResult: TypeAlias = '<{ statusCode: number; statusDescription?: string; body: … (150 chars, #8f09d0c6)>'
LambdaEvent: TypeAlias = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBProxyEvent | LatticeProxyEventV2

class ALBRequestContext(Protocol):
    elb: '{ targetGroupArn: string }'

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

def defaultIsContentTypeBinary(contentType: string) -> boolean: ...

def handle['E extends Env = Env', 'S extends Schema = {}', 'BasePath extends string = "/"'](
    app: Hono[E, S, BasePath],
    __1: HandleOptions = ...,
) -> '<([L extends LambdaEvent](event: L, lambdaContext?: … (200 chars, #9ab4947a)>': ...

def streamHandle['E extends Env = Env', 'S extends Schema = {}', 'BasePath extends string = "/"'](
    app: Hono[E, S, BasePath],
) -> Handler: ...

getConnInfo: GetConnInfo
