__module__ = "service_worker"
__paths__ = ["adapters/service-worker/**"]
__entry__ = "adapters/service-worker/src/index.ts"
__depends_on__ = []

def fire['E extends Env', 'S extends Schema', 'BasePath extends string'](
    app: Hono[E, S, BasePath],
    options: HandleOptions = ...,
) -> void: ...

def handle['E extends Env', 'S extends Schema', 'BasePath extends string'](
    app: Hono[E, S, BasePath],
    opts: HandleOptions = ...,
) -> Handler: ...
