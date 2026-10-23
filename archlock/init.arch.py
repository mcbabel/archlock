"""Heuristic module and language detection for `archlock init`."""

__module__ = "init"
__paths__ = ["src/init/**"]
__depends_on__ = ["config", "extract", "fs"]

class Detection(Protocol):
    include: 'string[]'
    languages: 'Language[]'
    modules: 'ModuleSpec[]'
    strategy: '"go-packages" | "rust-crates" | "workspaces" | "python-package" | "src" | "top-level"'

def detectLanguages(root: string) -> 'Language[]': ...
def detectModules(root: string, languages: 'Language[]') -> Detection: ...
def moduleName(raw: string) -> string: ...
