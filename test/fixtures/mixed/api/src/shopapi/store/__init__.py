from dataclasses import dataclass


@dataclass
class Product:
    id: str
    price: float


def list_products() -> list[Product]:
    return []
