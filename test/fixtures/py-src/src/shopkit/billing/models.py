from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import ClassVar, Protocol


class InvoiceStatus(Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"


@dataclass(frozen=True)
class Line:
    description: str
    amount: int


@dataclass
class Invoice:
    id: str
    customer: str
    lines: list[Line] = field(default_factory=list)
    status: InvoiceStatus = InvoiceStatus.DRAFT
    currency: ClassVar[str] = "EUR"

    @property
    def total(self) -> int:
        return sum(line.amount for line in self.lines)

    def _recalculate(self) -> None:
        pass


class PaymentGateway(Protocol):
    def charge(self, amount: int) -> str: ...
