__module__ = "deno"
__paths__ = ["adapters/deno/**"]
__entry__ = "adapters/deno/src/index.ts"
__depends_on__ = []

def serveStatic['E extends Env = Env'](
    options: ServeStaticOptions[E] = ...,
) -> MiddlewareHandler: ...

denoFileSystemModule: FileSystemModule
getConnInfo: GetConnInfo
toSSG: ToSSGAdaptorInterface
upgradeWebSocket: UpgradeWebSocket[WebSocket, Deno.UpgradeWebSocketOptions]
