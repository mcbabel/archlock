import sys

from shopkit.billing import create_invoice


def main(argv: list[str] | None = None) -> int:
    create_invoice("c1", [])
    return 0


if __name__ == "__main__":
    sys.exit(main())
