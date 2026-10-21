__module__ = "preset"
__paths__ = ["src/preset/**"]
__depends_on__ = ["hono", "router"]

class Hono['E extends Env = BlankEnv', 'S extends Schema = BlankSchema', 'BasePath extends string = "/"'](HonoBase[E, S, BasePath]):
    def __init__(self, options: HonoOptions[E] = ...): ...
