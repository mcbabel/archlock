__module__ = "lambda_edge"
__paths__ = ["adapters/lambda-edge/**"]
__entry__ = "adapters/lambda-edge/src/index.ts"
__depends_on__ = []

class Callback(Protocol):
    def __call__(
        self,
        err: Error | null,
        result: CloudFrontRequest | CloudFrontResult = ...,
    ) -> void: ...

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

def handle(
    app: Hono[any],
) -> '<((event: CloudFrontEdgeEvent, context?: CloudFrontContext, … (129 chars, #c2ce1006)>': ...

getConnInfo: GetConnInfo
