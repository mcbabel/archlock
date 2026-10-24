__module__ = "Shared"
__paths__ = ["src/Shared/**"]
__depends_on__ = []

class IDbSeeder[TContext: DbContext](Protocol):
    def SeedAsync(self, context: TContext) -> Task: ...
