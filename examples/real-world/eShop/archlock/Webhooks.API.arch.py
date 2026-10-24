__module__ = "Webhooks.API"
__paths__ = ["src/Webhooks.API/**"]
__depends_on__ = ["eShop.ServiceDefaults", "EventBus"]

class WebhookType(Enum):
    CatalogItemPriceChange = ...
    OrderShipped = ...
    OrderPaid = ...

class IGrantUrlTesterService(Protocol):
    def TestGrantUrl(self, urlHook: string, url: string, token: string) -> Task[bool]: ...

class IWebhooksRetriever(Protocol):
    def GetSubscriptionsOfType(
        self,
        type: WebhookType,
    ) -> Task[IEnumerable[WebhookSubscription]]: ...

class IWebhooksSender(Protocol):
    def SendAll(self, receivers: IEnumerable[WebhookSubscription], data: WebhookData) -> Task: ...

class Initial(Migration): ...

@record
class OrderStatusChangedToPaidIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    OrderStockItems: Readonly[IEnumerable[OrderStockItem]]

class OrderStatusChangedToPaidIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToPaidIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToPaidIntegrationEvent) -> Task: ...

@record
class OrderStatusChangedToShippedIntegrationEvent(IntegrationEvent):
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[string]

class OrderStatusChangedToShippedIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToShippedIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToShippedIntegrationEvent) -> Task: ...

@record
class OrderStockItem:
    ProductId: Readonly[int]
    Units: Readonly[int]

@record
class ProductPriceChangedIntegrationEvent(IntegrationEvent):
    NewPrice: Readonly[decimal]
    OldPrice: Readonly[decimal]
    ProductId: Readonly[int]

class ProductPriceChangedIntegrationEventHandler(IIntegrationEventHandler[ProductPriceChangedIntegrationEvent]):
    def Handle(self, event: ProductPriceChangedIntegrationEvent) -> Task: ...

@static
class RouteHandlerBuilderExtensions:
    @staticmethod
    def ValidateWebhookSubscriptionRequest(
        routeHandlerBuilder: 'this RouteHandlerBuilder',
    ) -> RouteHandlerBuilder: ...

class WebhookData:
    Payload: Readonly[string]
    Type: Readonly[string]
    When: Readonly[DateTime]
    def __init__(self, hookType: WebhookType, data: object): ...

@static
class WebHooksApi:
    @staticmethod
    def MapWebHooksApiV1(app: 'this IEndpointRouteBuilder') -> RouteGroupBuilder: ...

class WebhooksContext(DbContext):
    Subscriptions: DbSet[WebhookSubscription]

class WebhooksDomainException(Exception): ...

class WebhooksRetriever(IWebhooksRetriever):
    def GetSubscriptionsOfType(
        self,
        type: WebhookType,
    ) -> Task[IEnumerable[WebhookSubscription]]: ...

class WebhooksSender(IWebhooksSender):
    def SendAll(self, receivers: IEnumerable[WebhookSubscription], data: WebhookData) -> Task: ...

class WebhookSubscription:
    Date: DateTime
    DestUrl: string
    Id: int
    Token: string
    Type: WebhookType
    UserId: string

class WebhookSubscriptionRequest(IValidatableObject):
    Event: string
    GrantUrl: string
    Token: string
    Url: string
    def Validate(self, validationContext: ValidationContext) -> IEnumerable[ValidationResult]: ...
