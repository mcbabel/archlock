__module__ = "Basket.API"
__paths__ = ["src/Basket.API/**"]
__depends_on__ = ["eShop.ServiceDefaults", "EventBus"]

class IBasketRepository(Protocol):
    def DeleteBasketAsync(self, id: string) -> Task[bool]: ...
    def GetBasketAsync(self, customerId: string) -> Task[CustomerBasket]: ...
    def UpdateBasketAsync(self, basket: CustomerBasket) -> Task[CustomerBasket]: ...

class BasketItem(IValidatableObject):
    Id: string
    OldUnitPrice: decimal
    PictureUrl: string
    ProductId: int
    ProductName: string
    Quantity: int
    UnitPrice: decimal
    def Validate(self, validationContext: ValidationContext) -> IEnumerable[ValidationResult]: ...

class BasketSerializationContext(JsonSerializerContext): ...

class BasketService(Basket.BasketBase):
    def DeleteBasket(
        self,
        request: DeleteBasketRequest,
        context: ServerCallContext,
    ) -> Task[DeleteBasketResponse]: ...
    def GetBasket(
        self,
        request: GetBasketRequest,
        context: ServerCallContext,
    ) -> Task[CustomerBasketResponse]: ...
    def UpdateBasket(
        self,
        request: UpdateBasketRequest,
        context: ServerCallContext,
    ) -> Task[CustomerBasketResponse]: ...

class CustomerBasket:
    BuyerId: string
    Items: List[BasketItem]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, customerId: string): ...

@static
class Extensions:
    @staticmethod
    def AddApplicationServices(builder: 'this IHostApplicationBuilder') -> void: ...

@record
class OrderStartedIntegrationEvent(IntegrationEvent):
    UserId: Readonly[string]

class OrderStartedIntegrationEventHandler(IIntegrationEventHandler[OrderStartedIntegrationEvent]):
    def Handle(self, event: OrderStartedIntegrationEvent) -> Task: ...

class RedisBasketRepository(IBasketRepository):
    def DeleteBasketAsync(self, id: string) -> Task[bool]: ...
    def GetBasketAsync(self, customerId: string) -> Task[CustomerBasket]: ...
    def UpdateBasketAsync(self, basket: CustomerBasket) -> Task[CustomerBasket]: ...
