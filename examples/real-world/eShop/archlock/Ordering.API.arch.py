__module__ = "Ordering.API"
__paths__ = ["src/Ordering.API/**"]
__depends_on__ = [
    "eShop.ServiceDefaults",
    "EventBus",
    "IntegrationEventLogEF",
    "Ordering.Domain",
    "Ordering.Infrastructure",
]

class IIdentityService(Protocol):
    def GetUserIdentity(self) -> string: ...
    def GetUserName(self) -> string: ...

class IOrderingIntegrationEventService(Protocol):
    def AddAndSaveEventAsync(self, evt: IntegrationEvent) -> Task: ...
    def PublishEventsThroughEventBusAsync(self, transactionId: Guid) -> Task: ...

class IOrderQueries(Protocol):
    def GetCardTypesAsync(self) -> Task[IEnumerable[CardType]]: ...
    def GetOrderAsync(self, id: int) -> Task[Order]: ...
    def GetOrdersFromUserAsync(self, userId: string) -> Task[IEnumerable[OrderSummary]]: ...

class BasketItem:
    Id: Readonly[string]
    OldUnitPrice: Readonly[decimal]
    PictureUrl: Readonly[string]
    ProductId: Readonly[int]
    ProductName: Readonly[string]
    Quantity: Readonly[int]
    UnitPrice: Readonly[decimal]

@static
class BasketItemExtensions:
    @staticmethod
    def ToOrderItemDTO(item: 'this BasketItem') -> OrderItemDTO: ...
    @staticmethod
    def ToOrderItemsDTO(
        basketItems: 'this IEnumerable[BasketItem]',
    ) -> IEnumerable[OrderItemDTO]: ...

@record
class CancelOrderCommand(IRequest[bool]):
    OrderNumber: Readonly[int]

class CancelOrderCommandHandler(IRequestHandler[CancelOrderCommand, bool]):
    def __init__(self, orderRepository: IOrderRepository): ...
    def Handle(
        self,
        command: CancelOrderCommand,
        cancellationToken: CancellationToken,
    ) -> Task[bool]: ...

class CancelOrderCommandValidator(AbstractValidator[CancelOrderCommand]):
    def __init__(self, logger: ILogger[CancelOrderCommandValidator]): ...

class CancelOrderIdentifiedCommandHandler(IdentifiedCommandHandler[CancelOrderCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[CancelOrderCommand, bool]],
    ): ...

@record
class CardType:
    Id: Readonly[int]
    Name: Readonly[string]

@record
class ConfirmedOrderStockItem:
    HasStock: Readonly[bool]
    ProductId: Readonly[int]
    def __init__(self, productId: int, hasStock: bool): ...

class CreateOrderCommand(IRequest[bool]):
    CardExpiration: Readonly[DateTime]
    CardHolderName: Readonly[string]
    CardNumber: Readonly[string]
    CardSecurityNumber: Readonly[string]
    CardTypeId: Readonly[int]
    City: Readonly[string]
    Country: Readonly[string]
    OrderItems: Readonly[IEnumerable[OrderItemDTO]]
    State: Readonly[string]
    Street: Readonly[string]
    UserId: Readonly[string]
    UserName: Readonly[string]
    ZipCode: Readonly[string]
    @overload
    def __init__(self): ...
    @overload
    def __init__(
        self,
        basketItems: List[BasketItem],
        userId: string,
        userName: string,
        city: string,
        street: string,
        state: string,
        country: string,
        zipcode: string,
        cardNumber: string,
        cardHolderName: string,
        cardExpiration: DateTime,
        cardSecurityNumber: string,
        cardTypeId: int,
    ): ...

class CreateOrderCommandHandler(IRequestHandler[CreateOrderCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        orderingIntegrationEventService: IOrderingIntegrationEventService,
        orderRepository: IOrderRepository,
        identityService: IIdentityService,
        logger: ILogger[CreateOrderCommandHandler],
    ): ...
    def Handle(
        self,
        message: CreateOrderCommand,
        cancellationToken: CancellationToken,
    ) -> Task[bool]: ...

class CreateOrderCommandValidator(AbstractValidator[CreateOrderCommand]):
    def __init__(self, logger: ILogger[CreateOrderCommandValidator]): ...

@record
class CreateOrderDraftCommand(IRequest[OrderDraftDTO]):
    BuyerId: Readonly[string]
    Items: Readonly[IEnumerable[BasketItem]]

class CreateOrderDraftCommandHandler(IRequestHandler[CreateOrderDraftCommand, OrderDraftDTO]):
    def Handle(
        self,
        message: CreateOrderDraftCommand,
        cancellationToken: CancellationToken,
    ) -> Task[OrderDraftDTO]: ...

class CreateOrderIdentifiedCommandHandler(IdentifiedCommandHandler[CreateOrderCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[CreateOrderCommand, bool]],
    ): ...

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

class CustomerBasket:
    BuyerId: string
    Items: List[BasketItem]
    def __init__(self, buyerId: string, items: List[BasketItem]): ...

@record
class GracePeriodConfirmedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    def __init__(self, orderId: int): ...

class GracePeriodConfirmedIntegrationEventHandler(IIntegrationEventHandler[GracePeriodConfirmedIntegrationEvent]):
    def Handle(self, event: GracePeriodConfirmedIntegrationEvent) -> Task: ...

class IdentifiedCommand[T: IRequest[R], R](IRequest[R]):
    Command: Readonly[T]
    Id: Readonly[Guid]
    def __init__(self, command: T, id: Guid): ...

@abstract
class IdentifiedCommandHandler[T: IRequest[R], R](IRequestHandler[IdentifiedCommand[T, R], R]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[T, R]],
    ): ...
    def Handle(
        self,
        message: IdentifiedCommand[T, R],
        cancellationToken: CancellationToken,
    ) -> Task[R]: ...

class IdentifiedCommandValidator(AbstractValidator[IdentifiedCommand[CreateOrderCommand, bool]]):
    def __init__(self, logger: ILogger[IdentifiedCommandValidator]): ...

class IdentityService(IIdentityService):
    def GetUserIdentity(self) -> string: ...
    def GetUserName(self) -> string: ...

@static
class LinqSelectExtensions:
    @staticmethod
    @overload
    def OnCaughtException[TSource, TResult](
        enumerable: 'this IEnumerable[SelectTryResult[TSource, TResult]]',
        exceptionHandler: Func[Exception, TResult],
    ) -> IEnumerable[TResult]: ...
    @staticmethod
    @overload
    def OnCaughtException[TSource, TResult](
        enumerable: 'this IEnumerable[SelectTryResult[TSource, TResult]]',
        exceptionHandler: Func[TSource, Exception, TResult],
    ) -> IEnumerable[TResult]: ...
    @staticmethod
    def SelectTry[TSource, TResult](
        enumerable: 'this IEnumerable[TSource]',
        selector: Func[TSource, TResult],
    ) -> IEnumerable[SelectTryResult[TSource, TResult]]: ...

class LinqSelectExtensions__SelectTryResult[TSource, TResult]:
    CaughtException: Readonly[Exception]
    Result: Readonly[TResult]
    Source: Readonly[TSource]

class LoggingBehavior[TRequest: IRequest[TResponse], TResponse](IPipelineBehavior[TRequest, TResponse]):
    def __init__(self, logger: ILogger[LoggingBehavior[TRequest, TResponse]]): ...
    def Handle(
        self,
        request: TRequest,
        next: RequestHandlerDelegate[TResponse],
        cancellationToken: CancellationToken,
    ) -> Task[TResponse]: ...

@record
class Order:
    City: Readonly[string]
    Country: Readonly[string]
    Date: Readonly[DateTime]
    Description: Readonly[string]
    OrderItems: List[Orderitem]
    OrderNumber: Readonly[int]
    State: Readonly[string]
    Status: Readonly[string]
    Street: Readonly[string]
    Total: decimal
    Zipcode: Readonly[string]

class OrderCancelledDomainEventHandler(INotificationHandler[OrderCancelledDomainEvent]):
    def __init__(
        self,
        orderRepository: IOrderRepository,
        logger: ILogger[OrderCancelledDomainEventHandler],
        buyerRepository: IBuyerRepository,
        orderingIntegrationEventService: IOrderingIntegrationEventService,
    ): ...
    def Handle(
        self,
        domainEvent: OrderCancelledDomainEvent,
        cancellationToken: CancellationToken,
    ) -> Task: ...

@record
class OrderDraftDTO:
    OrderItems: Readonly[IEnumerable[OrderItemDTO]]
    Total: Readonly[decimal]
    @staticmethod
    def FromOrder(order: Order) -> OrderDraftDTO: ...

class OrderingContextSeed(IDbSeeder[OrderingContext]):
    def SeedAsync(self, context: OrderingContext) -> Task: ...

class OrderingIntegrationEventService(IOrderingIntegrationEventService):
    def AddAndSaveEventAsync(self, evt: IntegrationEvent) -> Task: ...
    def PublishEventsThroughEventBusAsync(self, transactionId: Guid) -> Task: ...

@record
class Orderitem:
    PictureUrl: Readonly[string]
    ProductName: Readonly[string]
    UnitPrice: Readonly[double]
    Units: Readonly[int]

@record
class OrderItemDTO:
    Discount: Readonly[decimal]
    PictureUrl: Readonly[string]
    ProductId: Readonly[int]
    ProductName: Readonly[string]
    UnitPrice: Readonly[decimal]
    Units: Readonly[int]

@record
class OrderPaymentFailedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    def __init__(self, orderId: int): ...

class OrderPaymentFailedIntegrationEventHandler(IIntegrationEventHandler[OrderPaymentFailedIntegrationEvent]):
    def Handle(self, event: OrderPaymentFailedIntegrationEvent) -> Task: ...

@record
class OrderPaymentSucceededIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    def __init__(self, orderId: int): ...

class OrderPaymentSucceededIntegrationEventHandler(IIntegrationEventHandler[OrderPaymentSucceededIntegrationEvent]):
    def Handle(self, event: OrderPaymentSucceededIntegrationEvent) -> Task: ...

class OrderQueries(IOrderQueries):
    def GetCardTypesAsync(self) -> Task[IEnumerable[CardType]]: ...
    def GetOrderAsync(self, id: int) -> Task[Order]: ...
    def GetOrdersFromUserAsync(self, userId: string) -> Task[IEnumerable[OrderSummary]]: ...

@static
class OrdersApi:
    @staticmethod
    def CancelOrderAsync(
        requestId: Guid,
        command: CancelOrderCommand,
        services: OrderServices,
    ) -> Task[Results[Ok, BadRequest[string], ProblemHttpResult]]: ...
    @staticmethod
    def CreateOrderAsync(
        requestId: Guid,
        request: CreateOrderRequest,
        services: OrderServices,
    ) -> Task[Results[Ok, BadRequest[string]]]: ...
    @staticmethod
    def CreateOrderDraftAsync(
        command: CreateOrderDraftCommand,
        services: OrderServices,
    ) -> Task[OrderDraftDTO]: ...
    @staticmethod
    def GetCardTypesAsync(orderQueries: IOrderQueries) -> Task[Ok[IEnumerable[CardType]]]: ...
    @staticmethod
    def GetOrderAsync(
        orderId: int,
        services: OrderServices,
    ) -> Task[Results[Ok[Order], NotFound]]: ...
    @staticmethod
    def GetOrdersByUserAsync(services: OrderServices) -> Task[Ok[IEnumerable[OrderSummary]]]: ...
    @staticmethod
    def MapOrdersApiV1(app: 'this IEndpointRouteBuilder') -> RouteGroupBuilder: ...
    @staticmethod
    def ShipOrderAsync(
        requestId: Guid,
        command: ShipOrderCommand,
        services: OrderServices,
    ) -> Task[Results[Ok, BadRequest[string], ProblemHttpResult]]: ...

class OrderServices:
    IdentityService: Readonly[IIdentityService]
    Logger: Readonly[ILogger[OrderServices]]
    Mediator: IMediator
    Queries: Readonly[IOrderQueries]

class OrderShippedDomainEventHandler(INotificationHandler[OrderShippedDomainEvent]):
    def __init__(
        self,
        orderRepository: IOrderRepository,
        logger: ILogger[OrderShippedDomainEventHandler],
        buyerRepository: IBuyerRepository,
        orderingIntegrationEventService: IOrderingIntegrationEventService,
    ): ...
    def Handle(
        self,
        domainEvent: OrderShippedDomainEvent,
        cancellationToken: CancellationToken,
    ) -> Task: ...

@record
class OrderStartedIntegrationEvent(IntegrationEvent):
    UserId: Readonly[string]
    def __init__(self, userId: string): ...

class OrderStatusChangedToAwaitingValidationDomainEventHandler(INotificationHandler[OrderStatusChangedToAwaitingValidationDomainEvent]):
    def __init__(
        self,
        orderRepository: IOrderRepository,
        logger: ILogger[OrderStatusChangedToAwaitingValidationDomainEventHandler],
        buyerRepository: IBuyerRepository,
        orderingIntegrationEventService: IOrderingIntegrationEventService,
    ): ...
    def Handle(
        self,
        domainEvent: OrderStatusChangedToAwaitingValidationDomainEvent,
        cancellationToken: CancellationToken,
    ) -> Task: ...

@record
class OrderStatusChangedToAwaitingValidationIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[OrderStatus]
    OrderStockItems: Readonly[IEnumerable[OrderStockItem]]
    def __init__(
        self,
        orderId: int,
        orderStatus: OrderStatus,
        buyerName: string,
        buyerIdentityGuid: string,
        orderStockItems: IEnumerable[OrderStockItem],
    ): ...

@record
class OrderStatusChangedToCancelledIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[OrderStatus]
    def __init__(
        self,
        orderId: int,
        orderStatus: OrderStatus,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToPaidDomainEventHandler(INotificationHandler[OrderStatusChangedToPaidDomainEvent]):
    def __init__(
        self,
        orderRepository: IOrderRepository,
        logger: ILogger[OrderStatusChangedToPaidDomainEventHandler],
        buyerRepository: IBuyerRepository,
        orderingIntegrationEventService: IOrderingIntegrationEventService,
    ): ...
    def Handle(
        self,
        domainEvent: OrderStatusChangedToPaidDomainEvent,
        cancellationToken: CancellationToken,
    ) -> Task: ...

@record
class OrderStatusChangedToPaidIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[OrderStatus]
    OrderStockItems: Readonly[IEnumerable[OrderStockItem]]
    def __init__(
        self,
        orderId: int,
        orderStatus: OrderStatus,
        buyerName: string,
        buyerIdentityGuid: string,
        orderStockItems: IEnumerable[OrderStockItem],
    ): ...

@record
class OrderStatusChangedToShippedIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[OrderStatus]
    def __init__(
        self,
        orderId: int,
        orderStatus: OrderStatus,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

class OrderStatusChangedToStockConfirmedDomainEventHandler(INotificationHandler[OrderStatusChangedToStockConfirmedDomainEvent]):
    def __init__(
        self,
        orderRepository: IOrderRepository,
        buyerRepository: IBuyerRepository,
        logger: ILogger[OrderStatusChangedToStockConfirmedDomainEventHandler],
        orderingIntegrationEventService: IOrderingIntegrationEventService,
    ): ...
    def Handle(
        self,
        domainEvent: OrderStatusChangedToStockConfirmedDomainEvent,
        cancellationToken: CancellationToken,
    ) -> Task: ...

@record
class OrderStatusChangedToStockConfirmedIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[OrderStatus]
    def __init__(
        self,
        orderId: int,
        orderStatus: OrderStatus,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

@record
class OrderStatusChangedToSubmittedIntegrationEvent(IntegrationEvent):
    BuyerIdentityGuid: Readonly[string]
    BuyerName: Readonly[string]
    OrderId: Readonly[int]
    OrderStatus: Readonly[OrderStatus]
    def __init__(
        self,
        orderId: int,
        orderStatus: OrderStatus,
        buyerName: string,
        buyerIdentityGuid: string,
    ): ...

@record
class OrderStockConfirmedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    def __init__(self, orderId: int): ...

class OrderStockConfirmedIntegrationEventHandler(IIntegrationEventHandler[OrderStockConfirmedIntegrationEvent]):
    def Handle(self, event: OrderStockConfirmedIntegrationEvent) -> Task: ...

@record
class OrderStockItem:
    ProductId: Readonly[int]
    Units: Readonly[int]
    def __init__(self, productId: int, units: int): ...

@record
class OrderStockRejectedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    OrderStockItems: Readonly[List[ConfirmedOrderStockItem]]
    def __init__(self, orderId: int, orderStockItems: List[ConfirmedOrderStockItem]): ...

class OrderStockRejectedIntegrationEventHandler(IIntegrationEventHandler[OrderStockRejectedIntegrationEvent]):
    def Handle(self, event: OrderStockRejectedIntegrationEvent) -> Task: ...

@record
class OrderSummary:
    Date: Readonly[DateTime]
    OrderNumber: Readonly[int]
    Status: Readonly[string]
    Total: Readonly[double]

class SetAwaitingValidationIdentifiedOrderStatusCommandHandler(IdentifiedCommandHandler[SetAwaitingValidationOrderStatusCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[SetAwaitingValidationOrderStatusCommand, bool]],
    ): ...

@record
class SetAwaitingValidationOrderStatusCommand(IRequest[bool]):
    OrderNumber: Readonly[int]

class SetAwaitingValidationOrderStatusCommandHandler(IRequestHandler[SetAwaitingValidationOrderStatusCommand, bool]):
    def __init__(self, orderRepository: IOrderRepository): ...
    def Handle(
        self,
        command: SetAwaitingValidationOrderStatusCommand,
        cancellationToken: CancellationToken,
    ) -> Task[bool]: ...

class SetPaidIdentifiedOrderStatusCommandHandler(IdentifiedCommandHandler[SetPaidOrderStatusCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[SetPaidOrderStatusCommand, bool]],
    ): ...

@record
class SetPaidOrderStatusCommand(IRequest[bool]):
    OrderNumber: Readonly[int]

class SetPaidOrderStatusCommandHandler(IRequestHandler[SetPaidOrderStatusCommand, bool]):
    def __init__(self, orderRepository: IOrderRepository): ...
    def Handle(
        self,
        command: SetPaidOrderStatusCommand,
        cancellationToken: CancellationToken,
    ) -> Task[bool]: ...

@record
class SetStockConfirmedOrderStatusCommand(IRequest[bool]):
    OrderNumber: Readonly[int]

class SetStockConfirmedOrderStatusCommandHandler(IRequestHandler[SetStockConfirmedOrderStatusCommand, bool]):
    def __init__(self, orderRepository: IOrderRepository): ...
    def Handle(
        self,
        command: SetStockConfirmedOrderStatusCommand,
        cancellationToken: CancellationToken,
    ) -> Task[bool]: ...

class SetStockConfirmedOrderStatusIdentifiedCommandHandler(IdentifiedCommandHandler[SetStockConfirmedOrderStatusCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[SetStockConfirmedOrderStatusCommand, bool]],
    ): ...

@record
class SetStockRejectedOrderStatusCommand(IRequest[bool]):
    OrderNumber: Readonly[int]
    OrderStockItems: Readonly[List[int]]

class SetStockRejectedOrderStatusCommandHandler(IRequestHandler[SetStockRejectedOrderStatusCommand, bool]):
    def __init__(self, orderRepository: IOrderRepository): ...
    def Handle(
        self,
        command: SetStockRejectedOrderStatusCommand,
        cancellationToken: CancellationToken,
    ) -> Task[bool]: ...

class SetStockRejectedOrderStatusIdentifiedCommandHandler(IdentifiedCommandHandler[SetStockRejectedOrderStatusCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[SetStockRejectedOrderStatusCommand, bool]],
    ): ...

@record
class ShipOrderCommand(IRequest[bool]):
    OrderNumber: Readonly[int]

class ShipOrderCommandHandler(IRequestHandler[ShipOrderCommand, bool]):
    def __init__(self, orderRepository: IOrderRepository): ...
    def Handle(
        self,
        command: ShipOrderCommand,
        cancellationToken: CancellationToken,
    ) -> Task[bool]: ...

class ShipOrderCommandValidator(AbstractValidator[ShipOrderCommand]):
    def __init__(self, logger: ILogger[ShipOrderCommandValidator]): ...

class ShipOrderIdentifiedCommandHandler(IdentifiedCommandHandler[ShipOrderCommand, bool]):
    def __init__(
        self,
        mediator: IMediator,
        requestManager: IRequestManager,
        logger: ILogger[IdentifiedCommandHandler[ShipOrderCommand, bool]],
    ): ...

class TransactionBehavior[TRequest: IRequest[TResponse], TResponse](IPipelineBehavior[TRequest, TResponse]):
    def __init__(
        self,
        dbContext: OrderingContext,
        orderingIntegrationEventService: IOrderingIntegrationEventService,
        logger: ILogger[TransactionBehavior[TRequest, TResponse]],
    ): ...
    def Handle(
        self,
        request: TRequest,
        next: RequestHandlerDelegate[TResponse],
        cancellationToken: CancellationToken,
    ) -> Task[TResponse]: ...

class UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler(INotificationHandler[BuyerAndPaymentMethodVerifiedDomainEvent]):
    def __init__(
        self,
        orderRepository: IOrderRepository,
        logger: ILogger[UpdateOrderWhenBuyerAndPaymentMethodVerifiedDomainEventHandler],
    ): ...
    def Handle(
        self,
        domainEvent: BuyerAndPaymentMethodVerifiedDomainEvent,
        cancellationToken: CancellationToken,
    ) -> Task: ...

class ValidateOrAddBuyerAggregateWhenOrderStartedDomainEventHandler(INotificationHandler[OrderStartedDomainEvent]):
    def __init__(
        self,
        logger: ILogger[ValidateOrAddBuyerAggregateWhenOrderStartedDomainEventHandler],
        buyerRepository: IBuyerRepository,
        orderingIntegrationEventService: IOrderingIntegrationEventService,
    ): ...
    def Handle(
        self,
        domainEvent: OrderStartedDomainEvent,
        cancellationToken: CancellationToken,
    ) -> Task: ...

class ValidatorBehavior[TRequest: IRequest[TResponse], TResponse](IPipelineBehavior[TRequest, TResponse]):
    def __init__(
        self,
        validators: IEnumerable[IValidator[TRequest]],
        logger: ILogger[ValidatorBehavior[TRequest, TResponse]],
    ): ...
    def Handle(
        self,
        request: TRequest,
        next: RequestHandlerDelegate[TResponse],
        cancellationToken: CancellationToken,
    ) -> Task[TResponse]: ...
