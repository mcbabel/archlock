"""Command-line layer: argument parsing, prompts and printing. Thin; all logic lives below."""

__module__ = "cli"
__paths__ = ["src/cli/**"]
__depends_on__ = [
    "agents",
    "config",
    "core",
    "engine",
    "extract",
    "fs",
    "git",
    "init",
    "mcp",
    "report",
    "sketch",
]

class AcceptOptions(Protocol):
    depsOnly: Opt[boolean]
    symbolsOnly: Opt[boolean]
    yes: Opt[boolean]

class CheckOptions(Protocol):
    format: Opt[string]

class ChosenAgent(Protocol):
    invocation: '(promptFile: string) => AgentInvocation'
    name: AgentName

class Context(Protocol):
    cache: boolean
    color: Colors
    configPath: Opt[string]
    cwd: string
    err: '(text: string) => void'
    interactive: boolean
    json: boolean
    out: '(text: string) => void'
    quiet: boolean

class DiffOptions(Protocol):
    base: Opt[string]
    format: Opt[string]

class GlobalOptions(Protocol):
    cache: boolean
    color: boolean
    config: Opt[string]
    cwd: Opt[string]
    json: boolean
    quiet: boolean

class InitOptions(Protocol):
    agents: Opt[boolean]
    force: Opt[boolean]
    typed: Opt[boolean]
    withSummaries: Opt[boolean]
    yes: Opt[boolean]

class PushOptions(Protocol):
    agent: Opt[string]
    checkCommand: Opt[string]
    maxRounds: Opt[string]
    printPrompt: Opt[boolean]
    yes: Opt[boolean]

class RunIO(Protocol):
    stderr: '(text: string) => void'
    stdout: '(text: string) => void'

class CliError(Error):
    code: Readonly['<inferred>']
    def __init__(self, message: string, code=...): ...

def chooseAgent(
    agent: ArchlockConfig["agent"],
    requested: string | undefined,
    checkCommand: string,
) -> ChosenAgent | null: ...

def createContext(opts: GlobalOptions, io: RunIO) -> Context: ...
def createProgram(io: RunIO = ..., setExit: '(code: number) => void' = ...) -> Command: ...
def defaultCheckCommand(root: string) -> string: ...

def registerAccept(
    program: Command,
    context: '() => Context',
    setExit: '(code: number) => void',
) -> void: ...

def registerCheck(
    program: Command,
    context: '() => Context',
    setExit: '(code: number) => void',
) -> void: ...

def registerDiff(
    program: Command,
    context: '() => Context',
    setExit: '(code: number) => void',
) -> void: ...

def registerGraph(
    program: Command,
    context: '() => Context',
    setExit: '(code: number) => void',
) -> void: ...

def registerInit(
    program: Command,
    context: '() => Context',
    setExit: '(code: number) => void',
) -> void: ...

def registerMcp(program: Command, context: '() => Context') -> void: ...

def registerPush(
    program: Command,
    context: '() => Context',
    setExit: '(code: number) => void',
) -> void: ...

def registerStats(
    program: Command,
    context: '() => Context',
    setExit: '(code: number) => void',
) -> void: ...

async def run(argv: 'string[]', io: RunIO = ...) -> Promise[number]: ...

async def runAcceptCommand(
    ctx: Context,
    modules: 'string[]',
    opts: AcceptOptions,
) -> Promise[number]: ...

async def runCheckCommand(ctx: Context, opts: CheckOptions) -> Promise[number]: ...
async def runDiffCommand(ctx: Context, opts: DiffOptions) -> Promise[number]: ...
async def runGraphCommand(ctx: Context) -> Promise[number]: ...
async def runInitCommand(ctx: Context, opts: InitOptions) -> Promise[number]: ...
async def runPushCommand(ctx: Context, opts: PushOptions) -> Promise[number]: ...
async def runStatsCommand(ctx: Context, opts: '{ badge?: boolean }') -> Promise[number]: ...

def writeSketchReadme(
    root: string,
    sketchDir: string,
    modules: 'ArchModule[]',
    sketchTexts: 'string[]',
    codeLines: number,
) -> '{ file: string; changed: boolean }': ...
