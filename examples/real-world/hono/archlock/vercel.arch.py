__module__ = "vercel"
__paths__ = ["adapters/vercel/**"]
__entry__ = "adapters/vercel/src/index.ts"
__depends_on__ = []

def handle(app: Hono[any, any, any]) -> '<inferred>': ...

getConnInfo: GetConnInfo
