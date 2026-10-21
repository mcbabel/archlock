"""Domain events and the in-process event bus."""

__module__ = "events"
__paths__ = ["src/events/**"]
__entry__ = "src/events/index.ts"
__depends_on__ = ["shared"]

DomainEvent: TypeAlias = '{ type: "product.created"; productId: ProductId } | { type: "cart.checked_out"; cartId: CartId; customerId: CustomerId; total: Money } | { type: "invoice.issued"; invoiceId: InvoiceId; customerId: CustomerId; total: Money } | { type: "invoice.paid"; invoiceId: InvoiceId; customerId: CustomerId; paidAt: Date } | { type: "shipment.created"; shipmentId: ShipmentId; invoiceId: InvoiceId }'
EventName: TypeAlias = DomainEvent["type"]
EventOf: TypeAlias['N extends EventName'] = 'Extract[DomainEvent, { type: N }]'
Handler: TypeAlias['N extends EventName'] = '(event: EventOf[N]) => void | Promise[void]'

class EventBus:
    async def publish(self, event: DomainEvent) -> Promise[void]: ...
    def published(self) -> 'readonly DomainEvent[]': ...
    def subscribe['N extends EventName'](self, name: N, handler: Handler[N]) -> '() => void': ...

def createEventBus() -> EventBus: ...
