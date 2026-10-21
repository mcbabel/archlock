from enum import IntEnum
from typing import Literal, Optional


class Priority(IntEnum):
    LOW = 1
    HIGH = 2


class Order:
    kind: Literal["web", "store"] = "web"

    def __init__(self, order_id: str, priority: Priority = Priority.LOW, note: Optional[str] = None):
        self.order_id = order_id
        self.priority = priority
        self.note = note


def _private() -> None:
    pass
