"""Customer accounts and addresses."""

__module__ = "customers"
__paths__ = ["src/customers/**"]
__entry__ = "src/customers/index.ts"
__depends_on__ = ["db", "shared"]

class Address(Protocol):
    city: string
    country: string
    name: string
    postalCode: string
    street: string

class Customer(Protocol):
    address: Address
    createdAt: Date
    email: string
    id: CustomerId
    marketingConsent: boolean
    name: string

class CustomerRepository:
    def __init__(self, db: Database, clock: Clock = ...): ...
    def findByEmail(self, email: string) -> Customer | undefined: ...
    def get(self, id: CustomerId) -> Customer | undefined: ...
    def register(
        self,
        email: string,
        name: string,
        address: Address,
        marketingConsent=...,
    ) -> Customer: ...
