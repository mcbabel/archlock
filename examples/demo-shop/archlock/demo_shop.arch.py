"""Application entry point: wires the modules together and starts the server."""

__module__ = "demo_shop"
__paths__ = ["src/*"]
__depends_on__ = ["api", "billing", "cart", "catalog", "customers", "db", "events", "shared"]

async def main(port=...) -> Promise[void]: ...
