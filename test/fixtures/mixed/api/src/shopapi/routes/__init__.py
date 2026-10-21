from shopapi.store import list_products


def get_products() -> list[dict]:
    return [p.__dict__ for p in list_products()]
