__module__ = "petclinic"
__paths__ = ["src/main/java/org/springframework/samples/petclinic/*.java"]
__depends_on__ = ["model", "vet"]

class PetClinicApplication:
    @staticmethod
    def main(args: 'String[]') -> void: ...

class PetClinicRuntimeHints(RuntimeHintsRegistrar):
    def registerHints(self, hints: RuntimeHints, classLoader: ClassLoader) -> void: ...
