__module__ = "bun"
__paths__ = ["adapters/bun/**"]
__entry__ = "adapters/bun/src/index.ts"
__depends_on__ = []

class BunWebSocketData(Protocol):
    events: WSEvents
    protocol: string
    url: URL

class BunWebSocketHandler[T](Protocol):
    def close(
        self,
        ws: BunServerWebSocket[T],
        code: number = ...,
        reason: string = ...,
    ) -> void: ...
    def message(
        self,
        ws: BunServerWebSocket[T],
        message: 'string | { buffer: ArrayBufferLike }',
    ) -> void: ...
    def open(self, ws: BunServerWebSocket[T]) -> void: ...

def createBunWebSocket[T]() -> CreateWebSocket[T]: ...
def getBunServer[T](c: Context) -> T | undefined: ...

def serveStatic['E extends Env = Env'](
    options: ServeStaticOptions[E] = ...,
) -> MiddlewareHandler: ...

bunFileSystemModule: FileSystemModule
getConnInfo: GetConnInfo
toSSG: ToSSGAdaptorInterface
upgradeWebSocket: UpgradeWebSocket[any]
websocket: BunWebSocketHandler[BunWebSocketData]
