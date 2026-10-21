from typing import TYPE_CHECKING

import stripe

from shopkit.db.session import Session

from ..events import emit

if TYPE_CHECKING:
    from .models import Invoice


def create_invoice(customer: str, lines: list, *, session: Session | None = None) -> "Invoice":
    from .models import Invoice

    return Invoice(id="1", customer=customer, lines=lines)


async def mark_paid(invoice_id: str, payment_ref: str) -> "Invoice":
    emit("invoice.paid", {"id": invoice_id})
    stripe.api_key = "x"
    raise NotImplementedError


def _helper() -> None:
    pass
