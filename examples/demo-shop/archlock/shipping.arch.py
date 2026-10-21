"""Shipping: address validation, rates and shipments."""

__module__ = "shipping"
__paths__ = ["src/shipping/**"]
__entry__ = "src/shipping/index.ts"
__depends_on__ = ["billing", "customers", "events", "shared"]

class Shipment(Protocol):
    address: Customer["address"]
    id: ShipmentId
    invoiceNumber: string
    trackingCode: string

async def createShipment(
    invoice: Invoice,
    customer: Customer,
    events: EventBus,
) -> Promise[Shipment]: ...

def shippingRate(country: string, weightGrams: number) -> Money: ...
def validateAddress(address: Address) -> 'string[]': ...
