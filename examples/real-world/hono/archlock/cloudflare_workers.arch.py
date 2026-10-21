__module__ = "cloudflare_workers"
__paths__ = ["adapters/cloudflare-workers/**"]
__entry__ = "adapters/cloudflare-workers/src/index.ts"
__depends_on__ = []

def serveStatic['E extends Env = Env'](
    options: Omit[ServeStaticOptions[E], "namespace"],
) -> MiddlewareHandler: ...

getConnInfo: GetConnInfo
upgradeWebSocket: UpgradeWebSocket[WebSocket, any, Omit[WSEvents[WebSocket], "onOpen"]]
