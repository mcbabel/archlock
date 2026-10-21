"""Source code → file facts → modules with public APIs, dependency edges and deep imports."""

__module__ = "extract"
__paths__ = ["src/extract/**"]
__entry__ = "src/extract/index.ts"
__depends_on__ = ["config", "core", "fs", "sketch"]

class CodeModule(Protocol):
    deps: 'Map[string, ImportSite[]]'
    entry: string | null
    externals: 'Map[string, ImportSite[]]'
    files: 'string[]'
    lines: number
    name: string
    publicKeys: Set[string]
    reexports: 'ReExport[]'
    spec: ModuleSpec
    symbols: 'ArchSymbol[]'

class CodeProject(Protocol):
    deepImports: 'DeepImport[]'
    files: Map[string, FileFacts]
    modules: Map[string, CodeModule]
    totalLines: number
    unassigned: 'string[]'

class DeepImport(Protocol):
    self["from"]: string
    name: string
    site: ImportSite
    target: string
    to: string

class ExtractResult(Protocol):
    files: 'string[]'
    project: CodeProject

class ImportSite(Protocol):
    column: number
    file: string
    line: number

class ModuleSpec(Protocol):
    entry: string | null
    name: string
    paths: 'string[]'

class WorkspacePackage(Protocol):
    dir: string
    name: string

class Ownership:
    def __init__(self, specs: 'ModuleSpec[]'): ...
    def owner(self, path: string) -> string | null: ...

def defaultEntryCandidates(spec: ModuleSpec) -> 'string[]': ...

async def extractProject(
    root: string,
    config: ArchlockConfig,
    specs: 'ModuleSpec[]',
    cache: ArchlockCache = ...,
) -> Promise[ExtractResult]: ...

def readWorkspacePackages(root: string) -> 'WorkspacePackage[]': ...
def sourceExtensions(config: ArchlockConfig) -> 'string[]': ...
