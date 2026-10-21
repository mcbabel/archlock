import json

from acme.core import Order, price_for
from acme.core.pricing import internal_rate


class App:
    routes: dict = {}

    def handle(self, payload: bytes) -> bytes:
        order = Order(json.loads(payload)["id"])
        return str(price_for(order) * internal_rate()).encode()


def create_app() -> App:
    return App()
