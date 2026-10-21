"""The deterministic core as functions: open a workspace, compare code with sketches, compute stats."""

__module__ = "engine"
__paths__ = ["src/engine/**"]
__depends_on__ = ["config", "core", "extract", "fs", "git", "sketch"]

ActiveSeverity: TypeAlias = Exclude[Severity, "off"]
ChangeKind: TypeAlias = '"module_added" | "module_removed" | "dependency_added" | "dependency_removed" | "external_added" | "external_removed" | "symbol_added" | "symbol_removed" | "symbol_changed"'

class ArchChange(Protocol):
    kind: ChangeKind
    marker: '"+" | "-" | "~" | "!"'
    module: string
    summary: string
    symbol: Opt[string]

class ArchState(Protocol):
    externals: 'Map[string, string[]]'
    modules: 'ArchModule[]'

class ArchStats(Protocol):
    codeLines: number
    cycles: 'string[][]'
    edges: number
    inferred: number
    modules: number
    ratio: number
    sketchLines: number
    symbols: number
    typePositions: number

class CheckResult(Protocol):
    project: CodeProject
    sketchErrors: 'SketchError[]'
    sketches: 'LoadedSketch[]'
    violations: 'Violation[]'

class CompareInput(Protocol):
    brokenModules: Opt['string[]']
    project: CodeProject
    rules: Record[RuleName, Severity]
    sketchErrors: 'SketchError[]'
    sketches: 'LoadedSketch[]'

class DiffResult(Protocol):
    base: BaseRef
    changes: 'ArchChange[]'
    codeLinesChanged: number

class OpenOptions(Protocol):
    cache: Opt[boolean]
    configPath: Opt[string]

class Violation(Protocol):
    code: Opt[Location]
    details: Opt['string[]']
    hint: Opt[string]
    message: string
    module: string | null
    rule: RuleName
    severity: ActiveSeverity
    sketch: Opt[Location]
    symbol: Opt[string]

class Workspace(Protocol):
    cache: ArchlockCache
    config: ArchlockConfig
    configFile: string
    root: string
    sketches: SketchSet

class NotInitializedError(Error): ...

async def architectureOf(
    root: string,
    config: ArchlockConfig,
    specs: 'ModuleSpec[]',
    cache: ArchlockCache = ...,
) -> 'Promise[{ state: ArchState; project: CodeProject }]': ...

def changeSummary(b: ArchSymbol, h: ArchSymbol) -> string | null: ...
async def checkWorkspace(ws: Workspace) -> Promise[CheckResult]: ...

# never: network access, LLM calls or clock reads; same input, same violations
def compare(input: CompareInput) -> 'Violation[]': ...

def compressionRatio(codeLines: number, sketchLines: number) -> number: ...

def computeStats(
    modules: 'ArchModule[]',
    sketchTexts: 'string[]',
    codeLines: number,
) -> ArchStats: ...

def diffArchitecture(
    base: ArchState,
    head: ArchState,
    declared: 'Map[string, string[]]',
) -> 'ArchChange[]': ...

def diffSymbol(sketch: ArchSymbol, code: ArchSymbol) -> 'string[]': ...
async def diffWorkspace(ws: Workspace, baseRef: string = ...) -> Promise[DiffResult]: ...
def findCycles(graph: 'Map[string, string[]]') -> 'string[][]': ...
def moduleFromCode(code: CodeModule) -> ArchModule: ...
async def openWorkspace(cwd: string, options: OpenOptions = ...) -> Promise[Workspace]: ...
def sketchLineCount(texts: 'string[]') -> number: ...
def sortViolations(list: 'Violation[]') -> 'Violation[]': ...
def specsFromSketches(sketches: 'LoadedSketch[]') -> 'ModuleSpec[]': ...
