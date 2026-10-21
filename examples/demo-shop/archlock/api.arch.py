"""HTTP API: routes for the catalog, carts, checkout and payment webhooks."""

__module__ = "api"
__paths__ = ["src/api/**"]
__entry__ = "src/api/index.ts"
__depends_on__ = ["billing", "cart", "catalog", "customers", "shared"]

Route: TypeAlias = '(req: IncomingMessage, res: ServerResponse, params: URLSearchParams) => Promise[void]'

class CheckoutRouteDeps(Protocol):
    billing: BillingDeps
    carts: Map[string, Cart]
    customers: CustomerRepository

def cartRoutes(carts: Map[string, Cart]) -> Record[string, Route]: ...
def catalogRoutes(products: ProductRepository) -> Record[string, Route]: ...
def checkoutRoutes(deps: CheckoutRouteDeps) -> Record[string, Route]: ...
def createApiServer(routes: Record[string, Route]) -> Server: ...
