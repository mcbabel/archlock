from typing import Any, Callable, overload

Handler = Callable[[dict[str, Any]], None]
_handlers: dict[str, list[Handler]] = {}


def emit(name: str, payload: dict[str, Any] | None = None, /) -> None:
    for handler in _handlers.get(name, []):
        handler(payload or {})


@overload
def on(name: str) -> Callable[[Handler], Handler]: ...
@overload
def on(name: str, handler: Handler) -> Handler: ...
def on(name, handler=None):
    return handler
