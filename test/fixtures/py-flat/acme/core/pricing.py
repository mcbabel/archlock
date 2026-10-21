import decimal

from .models import Order


def price_for(order: Order, *, currency="EUR", **options) -> decimal.Decimal:
    return decimal.Decimal(0)


def internal_rate() -> float:
    return 1.0
