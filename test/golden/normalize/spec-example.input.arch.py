"""Billing: create invoices and record payments."""

__module__ = "billing"
__paths__ = ["src/billing/**"]
__entry__ = "src/billing/index.ts"          # optional
__depends_on__ = ["db", "events"]           # allowed internal modules
__external__ = ["stripe"]                   # optional; only checked if present

class Invoice:
    id: InvoiceId
    lines: Array[Line]
    status: '"draft" | "sent" | "paid"'
    # invariant: total equals the sum of line amounts
    # invariant: status only moves forward
    def total(self) -> Money: ...

class PaymentGateway(Protocol):              # TS interface
    def charge(self, amount: Money) -> Promise[ChargeResult]: ...

class InvoiceStatus(Enum):
    Draft = ...
    Sent = ...
    Paid = ...

CustomerId: TypeAlias = "string"

def create_invoice(customer: CustomerId, lines: Array[Line]) -> Invoice: ...

async def mark_paid(id: InvoiceId, payment: PaymentRef) -> Invoice:
    # must: emits events.InvoicePaid exactly once
    ...
