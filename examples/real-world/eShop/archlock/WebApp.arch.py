__module__ = "WebApp"
__paths__ = ["src/WebApp/**"]
__depends_on__ = ["eShop.ServiceDefaults", "EventBus", "WebAppComponents"]

class IBasketState(Protocol):
    def AddAsync(self, item: CatalogItem) -> Task: ...
    def GetBasketItemsAsync(self) -> Task[IReadOnlyCollection[BasketItem]]: ...

class BasketCheckoutInfo:
    Buyer: 'string?'
    CardExpiration: 'DateTime?'
    CardHolderName: 'string?'
    CardNumber: 'string?'
    CardSecurityNumber: 'string?'
    CardTypeId: int
    City: 'string?'
    Country: 'string?'
    RequestId: Guid
    State: 'string?'
    Street: 'string?'
    ZipCode: 'string?'

class BasketItem:
    Id: string
    OldUnitPrice: decimal
    ProductId: int
    ProductName: string
    Quantity: int
    UnitPrice: decimal

@record
class BasketQuantity:
    ProductId: Readonly[int]
    Quantity: Readonly[int]

class BasketService:
    def DeleteBasketAsync(self) -> Task: ...
    def GetBasketAsync(self) -> Task[IReadOnlyCollection[BasketQuantity]]: ...
    def UpdateBasketAsync(self, basket: IReadOnlyCollection[BasketQuantity]) -> Task: ...

class BasketState(IBasketState):
    def AddAsync(self, item: CatalogItem) -> Task: ...
    def CheckoutAsync(self, checkoutInfo: BasketCheckoutInfo) -> Task: ...
    def DeleteBasketAsync(self) -> Task: ...
    def GetBasketItemsAsync(self) -> Task[IReadOnlyCollection[BasketItem]]: ...
    def NotifyOnChange(self, callback: EventCallback) -> IDisposable: ...
    def SetQuantityAsync(self, productId: int, quantity: int) -> Task: ...

class ChatState:
    Messages: Readonly[IList[ChatMessage]]
    def __init__(
        self,
        catalogService: ICatalogService,
        basketState: IBasketState,
        user: ClaimsPrincipal,
        productImages: IProductImageUrlProvider,
        loggerFactory: ILoggerFactory,
        chatClient: IChatClient,
    ): ...
    def AddUserMessageAsync(self, userText: string, onMessageAdded: Action) -> Task: ...

@record
class CreateOrderRequest:
    Buyer: Readonly[string]
    CardExpiration: Readonly[DateTime]
    CardHolderName: Readonly[string]
    CardNumber: Readonly[string]
    CardSecurityNumber: Readonly[string]
    CardTypeId: Readonly[int]
    City: Readonly[string]
    Country: Readonly[string]
    Items: Readonly[List[BasketItem]]
    State: Readonly[string]
    Street: Readonly[string]
    UserId: Readonly[string]
    UserName: Readonly[string]
    ZipCode: Readonly[string]

@static
class Extensions:
    @staticmethod
    def AddApplicationServices(builder: 'this IHostApplicationBuilder') -> void: ...
    @staticmethod
    def AddAuthenticationServices(builder: 'this IHostApplicationBuilder') -> void: ...
    @staticmethod
    def AddEventBusSubscriptions(eventBus: 'this IEventBusBuilder') -> void: ...
    @staticmethod
    def GetBuyerIdAsync(
        authenticationStateProvider: 'this AuthenticationStateProvider',
    ) -> 'Task[string?]': ...
    @staticmethod
    def GetUserNameAsync(
        authenticationStateProvider: 'this AuthenticationStateProvider',
    ) -> 'Task[string?]': ...

class LogOutService:
    def LogOutAsync(self, httpContext: HttpContext) -> Task: ...

@static
class MessageProcessor:
    @staticmethod
    def AllowImages(message: string) -> MarkupString: ...

class OrderingService:
    def CreateOrder(self, request: CreateOrderRequest, requestId: Guid) -> Task: ...
    def GetOrders(self) -> 'Task[OrderRecord[]]': ...

@record
class OrderRecord:
    Date: Readonly[DateTime]
    OrderNumber: Readonly[int]
    Status: Readonly[string]
    Total: Readonly[decimal]

@record
class OrderStatusChangedToAwaitingValidationIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[string]
    def __init__(
        self,
        orderId: int,
        orderStatus: string,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToAwaitingValidationIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToAwaitingValidationIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToAwaitingValidationIntegrationEvent) -> Task: ...

@record
class OrderStatusChangedToCancelledIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[string]
    def __init__(
        self,
        orderId: int,
        orderStatus: string,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToCancelledIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToCancelledIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToCancelledIntegrationEvent) -> Task: ...

@record
class OrderStatusChangedToPaidIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[string]
    def __init__(
        self,
        orderId: int,
        orderStatus: string,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToPaidIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToPaidIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToPaidIntegrationEvent) -> Task: ...

@record
class OrderStatusChangedToShippedIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[string]
    def __init__(
        self,
        orderId: int,
        orderStatus: string,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToShippedIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToShippedIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToShippedIntegrationEvent) -> Task: ...

@record
class OrderStatusChangedToStockConfirmedIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[string]
    def __init__(
        self,
        orderId: int,
        orderStatus: string,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToStockConfirmedIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToStockConfirmedIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToStockConfirmedIntegrationEvent) -> Task: ...

@record
class OrderStatusChangedToSubmittedIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[string]
    def __init__(
        self,
        orderId: int,
        orderStatus: string,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToSubmittedIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToSubmittedIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToSubmittedIntegrationEvent) -> Task: ...

class OrderStatusNotificationService:
    def NotifyOrderStatusChangedAsync(self, buyerId: string) -> Task: ...
    def SubscribeToOrderStatusNotifications(
        self,
        buyerId: string,
        callback: Func[Task],
    ) -> IDisposable: ...

class ProductImageUrlProvider(IProductImageUrlProvider):
    def GetProductImageUrl(self, productId: int) -> string: ...

def scrollToEnd(element) -> '<inferred>': ...
def submitOnEnter(element) -> '<inferred>': ...
