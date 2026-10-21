"""Product catalog: products, search and volume pricing."""

__module__ = "catalog"
__paths__ = ["src/catalog/**"]
__entry__ = "src/catalog/index.ts"
__depends_on__ = ["db", "events", "shared"]

class ProductStatus(Enum):
    Draft = ...
    Active = ...
    Discontinued = ...

class NewProduct(Protocol):
    description: Opt[string]
    name: string
    price: Money
    sku: string
    tags: Opt['string[]']
    weightGrams: number

class Product(Protocol):
    description: string
    id: ProductId
    name: string
    price: Money
    sku: string
    status: ProductStatus
    tags: 'string[]'
    weightGrams: number

class SearchQuery(Protocol):
    includeUnavailable: Opt[boolean]
    maxPrice: Opt[number]
    tags: Opt['string[]']
    text: Opt[string]

class ProductRepository:
    def __init__(self, db: Database, events: EventBus): ...
    async def create(self, input: NewProduct) -> Promise[Product]: ...
    def discontinue(self, id: ProductId) -> Product: ...
    def findBySku(self, sku: string) -> Product | undefined: ...
    def get(self, id: ProductId) -> Product | undefined: ...
    def list(self) -> 'Product[]': ...

def isPurchasable(product: Product) -> boolean: ...
def linePrice(product: Product, quantity: number) -> Money: ...
def searchProducts(repo: ProductRepository, query: SearchQuery) -> 'Product[]': ...
def unitPrice(product: Product, quantity: number) -> Money: ...

VOLUME_DISCOUNTS: 'ReadonlyArray[{ minQuantity: number; factor: number }]'
