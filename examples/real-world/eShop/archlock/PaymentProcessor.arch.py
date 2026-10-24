__module__ = "PaymentProcessor"
__paths__ = ["src/PaymentProcessor/**"]
__depends_on__ = ["eShop.ServiceDefaults", "EventBus"]

@record
class OrderPaymentFailedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]

@record
class OrderPaymentSucceededIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]

@record
class OrderStatusChangedToStockConfirmedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]

class OrderStatusChangedToStockConfirmedIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToStockConfirmedIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToStockConfirmedIntegrationEvent) -> Task: ...

class PaymentOptions:
    PaymentSucceeded: bool
