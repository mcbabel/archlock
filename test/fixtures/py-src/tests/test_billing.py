from shopkit.billing import create_invoice


def test_create() -> None:
    assert create_invoice("c", [])
