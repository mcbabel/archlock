__module__ = "WebhookClient"
__paths__ = ["src/WebhookClient/**"]
__depends_on__ = ["eShop.ServiceDefaults"]

class WebhookType(Enum):
    CatalogItemPriceChange = ...
    OrderShipped = ...
    OrderPaid = ...

@static
class AuthenticationEndpoints:
    @staticmethod
    def MapAuthenticationEndpoints(app: 'this IEndpointRouteBuilder') -> IEndpointRouteBuilder: ...

@static
class Extensions:
    @staticmethod
    def AddApplicationServices(builder: 'this IHostApplicationBuilder') -> void: ...
    @staticmethod
    def AddAuthenticationServices(builder: 'this IHostApplicationBuilder') -> void: ...

class HooksRepository:
    def AddNew(self, hook: WebHookReceived) -> Task: ...
    def GetAll(self) -> Task[IEnumerable[WebHookReceived]]: ...
    def Subscribe(self, callback: Func[Task]) -> IDisposable: ...

class WebhookClientOptions:
    SelfUrl: 'string?'
    Token: 'string?'
    ValidateToken: bool

class WebhookData:
    Payload: 'string?'
    Type: 'string?'
    When: DateTime

@static
class WebhookEndpoints:
    @staticmethod
    def MapWebhookEndpoints(app: 'this IEndpointRouteBuilder') -> IEndpointRouteBuilder: ...

class WebHookReceived:
    Data: 'string?'
    Token: 'string?'
    When: DateTime

class WebhookResponse:
    Date: DateTime
    DestUrl: 'string?'
    Token: 'string?'

class WebhooksClient:
    def AddWebHookAsync(self, payload: WebhookSubscriptionRequest) -> Task[HttpResponseMessage]: ...
    def LoadWebhooks(self) -> Task[IEnumerable[WebhookResponse]]: ...

class WebhookSubscriptionRequest:
    Event: 'string?'
    GrantUrl: 'string?'
    Token: 'string?'
    Url: 'string?'
