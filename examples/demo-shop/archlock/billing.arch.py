"""Billing: issue invoices, take payments and record them."""

__module__ = "billing"
__paths__ = ["src/billing/**"]
__entry__ = "src/billing/index.ts"
__depends_on__ = ["cart", "catalog", "customers", "db", "events", "shared"]

# invariant: an invoice is paid at most once
class InvoiceStatus(Enum):
    Draft = ...
    Issued = ...
    Paid = ...
    Refunded = ...

class BillingDeps(Protocol):
    clock: Clock
    db: Database
    events: EventBus
    gateway: PaymentGateway
    products: ProductRepository

class Invoice(Protocol):
    customerId: CustomerId
    id: InvoiceId
    issuedAt: Date
    lines: 'InvoiceLine[]'
    number: string
    paidAt: Opt[Date]
    paymentRef: Opt[string]
    status: InvoiceStatus
    tax: Money
    total: Money

class InvoiceLine(Protocol):
    amount: Money
    description: string
    productId: ProductId
    quantity: number

class PaymentGateway(Protocol):
    def charge(self, amount: Money, description: string) -> Promise[PaymentRef]: ...
    def refund(self, payment: PaymentRef) -> Promise[void]: ...

class PaymentRef(Protocol):
    provider: string
    reference: string

class FakeGateway(PaymentGateway):
    charges: Readonly['{ amount: Money; description: string }[]']
    async def charge(self, amount: Money, description: string) -> Promise[PaymentRef]: ...
    async def refund(self, _payment: PaymentRef) -> Promise[void]: ...

def getInvoice(deps: BillingDeps, id: InvoiceId) -> Invoice | undefined: ...

async def issueInvoice(
    deps: BillingDeps,
    summary: CheckoutSummary,
    customer: Customer,
) -> Promise[Invoice]: ...

async def markPaid(
    deps: BillingDeps,
    invoiceId: InvoiceId,
    payment: PaymentRef,
) -> Promise[Invoice]: ...

async def payInvoice(deps: BillingDeps, invoiceId: InvoiceId) -> Promise[Invoice]: ...
async def refund(deps: BillingDeps, invoiceId: InvoiceId) -> Promise[Invoice]: ...
def taxFor(net: Money, country: string) -> Money: ...
def vatRate(country: string) -> number: ...
