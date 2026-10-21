import os
from typing import NewType, TypeVar

T = TypeVar("T")
UserId = NewType("UserId", int)
Row = dict[str, object]
ENGINE_URL: str = "sqlite://"


class Session:
    """A database session."""

    def __init__(self, url: str, timeout: float = 5.0) -> None:
        self.url = url
        self.timeout: float = timeout
        self._conn = None

    @classmethod
    def from_env(cls) -> "Session":
        return cls(os.environ["DATABASE_URL"])

    @staticmethod
    def escape(value: str) -> str:
        return value.replace("'", "''")

    @property
    def connected(self) -> bool:
        return self._conn is not None

    def query(self, sql: str, *params: object) -> list[Row]:
        return []

    def __enter__(self) -> "Session":
        return self

    def __exit__(self, *exc: object) -> None:
        pass

    def __repr__(self) -> str:
        return f"Session({self.url})"
