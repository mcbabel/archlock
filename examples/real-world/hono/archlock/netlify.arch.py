__module__ = "netlify"
__paths__ = ["adapters/netlify/**"]
__entry__ = "adapters/netlify/src/index.ts"
__depends_on__ = []

def handle(
    app: Hono[any, any],
) -> '((req: Request, context: any) => Response | Promise[Response])': ...

getConnInfo: GetConnInfo
