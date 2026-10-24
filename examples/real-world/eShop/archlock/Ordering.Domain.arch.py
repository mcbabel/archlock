__module__ = "Ordering.Domain"
__paths__ = ["src/Ordering.Domain/**"]
__depends_on__ = []

class OrderStatus(Enum):
    Submitted = ...
    AwaitingValidation = ...
    StockConfirmed = ...
    Paid = ...
    Shipped = ...
    Cancelled = ...

class IAggregateRoot(Protocol): ...

class IBuyerRepository(IRepository[Buyer], Protocol):
    def Add(self, buyer: Buyer) -> Buyer: ...
    def FindAsync(self, BuyerIdentityGuid: string) -> Task[Buyer]: ...
    def FindByIdAsync(self, id: int) -> Task[Buyer]: ...
    def Update(self, buyer: Buyer) -> Buyer: ...

class IOrderRepository(IRepository[Order], Protocol):
    def Add(self, order: Order) -> Order: ...
    def GetAsync(self, orderId: int) -> Task[Order]: ...
    def Update(self, order: Order) -> void: ...

class IRepository[T: IAggregateRoot](Protocol):
    UnitOfWork: Readonly[IUnitOfWork]

class IUnitOfWork(IDisposable, Protocol):
    def SaveChangesAsync(self, cancellationToken: CancellationToken = ...) -> Task[int]: ...
    def SaveEntitiesAsync(self, cancellationToken: CancellationToken = ...) -> Task[bool]: ...

class Address(ValueObject):
    City: Readonly[string]
    Country: Readonly[string]
    State: Readonly[string]
    Street: Readonly[string]
    ZipCode: Readonly[string]
    @overload
    def __init__(self): ...
    @overload
    def __init__(
        self,
        street: string,
        city: string,
        state: string,
        country: string,
        zipcode: string,
    ): ...

class Buyer(Entity, IAggregateRoot):
    IdentityGuid: Readonly[string]
    Name: Readonly[string]
    PaymentMethods: Readonly[IEnumerable[PaymentMethod]]
    def __init__(self, identity: string, name: string): ...
    def VerifyOrAddPaymentMethod(
        self,
        cardTypeId: int,
        alias: string,
        cardNumber: string,
        securityNumber: string,
        cardHolderName: string,
        expiration: DateTime,
        orderId: int,
    ) -> PaymentMethod: ...

class BuyerAndPaymentMethodVerifiedDomainEvent(INotification):
    Buyer: Readonly[Buyer]
    OrderId: Readonly[int]
    Payment: Readonly[PaymentMethod]
    def __init__(self, buyer: Buyer, payment: PaymentMethod, orderId: int): ...

@sealed
class CardType:
    Id: Readonly[int]
    Name: Readonly[string]

@abstract
class Entity:
    DomainEvents: Readonly[IReadOnlyCollection[INotification]]
    Id: Readonly[int]
    def AddDomainEvent(self, eventItem: INotification) -> void: ...
    def ClearDomainEvents(self) -> void: ...
    def Equals(self, obj: object) -> bool: ...
    def GetHashCode(self) -> int: ...
    def IsTransient(self) -> bool: ...
    def RemoveDomainEvent(self, eventItem: INotification) -> void: ...

class Order(Entity, IAggregateRoot):
    Address: Readonly[Address]
    Buyer: Readonly[Buyer]
    BuyerId: Readonly['int?']
    Description: Readonly[string]
    OrderDate: Readonly[DateTime]
    OrderItems: Readonly[IReadOnlyCollection[OrderItem]]
    OrderStatus: Readonly[OrderStatus]
    PaymentId: Readonly['int?']
    def __init__(
        self,
        userId: string,
        userName: string,
        address: Address,
        cardTypeId: int,
        cardNumber: string,
        cardSecurityNumber: string,
        cardHolderName: string,
        cardExpiration: DateTime,
        buyerId: 'int?' = ...,
        paymentMethodId: 'int?' = ...,
    ): ...
    def AddOrderItem(
        self,
        productId: int,
        productName: string,
        unitPrice: decimal,
        discount: decimal,
        pictureUrl: string,
        units: int = ...,
    ) -> void: ...
    def GetTotal(self) -> decimal: ...
    @staticmethod
    def NewDraft() -> Order: ...
    def SetAwaitingValidationStatus(self) -> void: ...
    def SetCancelledStatus(self) -> void: ...
    def SetCancelledStatusWhenStockIsRejected(
        self,
        orderStockRejectedItems: IEnumerable[int],
    ) -> void: ...
    def SetPaidStatus(self) -> void: ...
    def SetPaymentMethodVerified(self, buyerId: int, paymentId: int) -> void: ...
    def SetShippedStatus(self) -> void: ...
    def SetStockConfirmedStatus(self) -> void: ...

class OrderCancelledDomainEvent(INotification):
    Order: Readonly[Order]
    def __init__(self, order: Order): ...

class OrderingDomainException(Exception):
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, message: string): ...
    @overload
    def __init__(self, message: string, innerException: Exception): ...

class OrderItem(Entity):
    Discount: Readonly[decimal]
    PictureUrl: Readonly[string]
    ProductId: Readonly[int]
    ProductName: Readonly[string]
    UnitPrice: Readonly[decimal]
    Units: Readonly[int]
    def __init__(
        self,
        productId: int,
        productName: string,
        unitPrice: decimal,
        discount: decimal,
        pictureUrl: string,
        units: int = ...,
    ): ...
    def AddUnits(self, units: int) -> void: ...
    def SetNewDiscount(self, discount: decimal) -> void: ...

class OrderShippedDomainEvent(INotification):
    Order: Readonly[Order]
    def __init__(self, order: Order): ...

@record
class OrderStartedDomainEvent(INotification):
    CardExpiration: Readonly[DateTime]
    CardHolderName: Readonly[string]
    CardNumber: Readonly[string]
    CardSecurityNumber: Readonly[string]
    CardTypeId: Readonly[int]
    Order: Readonly[Order]
    UserId: Readonly[string]
    UserName: Readonly[string]

class OrderStatusChangedToAwaitingValidationDomainEvent(INotification):
    OrderId: Readonly[int]
    OrderItems: Readonly[IEnumerable[OrderItem]]
    def __init__(self, orderId: int, orderItems: IEnumerable[OrderItem]): ...

class OrderStatusChangedToPaidDomainEvent(INotification):
    OrderId: Readonly[int]
    OrderItems: Readonly[IEnumerable[OrderItem]]
    def __init__(self, orderId: int, orderItems: IEnumerable[OrderItem]): ...

class OrderStatusChangedToStockConfirmedDomainEvent(INotification):
    OrderId: Readonly[int]
    def __init__(self, orderId: int): ...

class PaymentMethod(Entity):
    CardType: Readonly[CardType]
    def __init__(
        self,
        cardTypeId: int,
        alias: string,
        cardNumber: string,
        securityNumber: string,
        cardHolderName: string,
        expiration: DateTime,
    ): ...
    def IsEqualTo(self, cardTypeId: int, cardNumber: string, expiration: DateTime) -> bool: ...

@abstract
class ValueObject:
    def Equals(self, obj: object) -> bool: ...
    def GetCopy(self) -> ValueObject: ...
    def GetHashCode(self) -> int: ...
