"""Shopping carts: line items, discounts, totals and checkout."""

__module__ = "cart"
__paths__ = ["src/cart/**"]
__entry__ = "src/cart/index.ts"
__depends_on__ = ["catalog", "events", "shared"]

class Cart(Protocol):
    customerId: CustomerId
    discountCode: Opt[string]
    id: CartId
    items: 'LineItem[]'

class CartTotals(Protocol):
    discount: Money
    subtotal: Money
    total: Money

class CheckoutDeps(Protocol):
    clock: Clock
    events: EventBus
    products: ProductRepository

class CheckoutSummary(Protocol):
    cart: Cart
    totals: CartTotals

class DiscountCode(Protocol):
    code: string
    expiresAt: Opt[Date]
    percentOff: number

class LineItem(Protocol):
    productId: ProductId
    quantity: number

def addItem(cart: Cart, productId: ProductId, quantity=...) -> Cart: ...
def applyDiscount(total: Money, discount: DiscountCode | undefined) -> Money: ...
def cartTotals(cart: Cart, products: ProductRepository, now: Date) -> CartTotals: ...
async def checkout(cart: Cart, deps: CheckoutDeps) -> Promise[Result[CheckoutSummary]]: ...
def createCart(customerId: CustomerId) -> Cart: ...
def findDiscount(code: string, now: Date) -> DiscountCode | undefined: ...
def removeItem(cart: Cart, productId: ProductId) -> Cart: ...
