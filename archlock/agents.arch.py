"""Coding-agent integration for `archlock push`: the work-order prompt, agent adapters and the round loop."""

__module__ = "agents"
__paths__ = ["src/agents/**"]
__depends_on__ = ["config", "core", "engine", "fs", "report", "sketch"]

class AgentAdapter(Protocol):
    binary: string
    name: AgentName
    def invocation(self, promptFile: string, commands: 'string[]') -> AgentInvocation: ...

class AgentInvocation(Protocol):
    args: 'string[]'
    command: string
    display: string
    shell: boolean

class PromptOptions(Protocol):
    checkCommand: string
    maxRounds: number
    round: number
    sketchDir: string
    verifyCommands: Opt['string[]']

class PushEvents(Protocol):
    agentExit: Opt['(round: number, code: number | null, ms: number) => void']
    round: Opt['(round: number, todo: Violation[], promptFile: string, invocation: AgentInvocation) => void']

class PushRunOptions(Protocol):
    checkCommand: string
    events: Opt[PushEvents]
    invocation: '(promptFile: string) => AgentInvocation'
    maxRounds: number
    stdio: '"inherit" | "ignore"'
    verifyCommands: Opt['string[]']

class PushSummary(Protocol):
    fixed: 'Violation[]'
    initial: 'Violation[]'
    promptFiles: 'string[]'
    remaining: 'Violation[]'
    rounds: number

class SummaryOutcome(Protocol):
    added: number
    file: string
    restored: boolean

def agentsSection(sketchDir: string, checkCommand=...) -> string: ...
def buildPushPrompt(result: CheckResult, opts: PromptOptions) -> string: ...
def customInvocation(template: string, promptFile: string) -> AgentInvocation: ...
def detectAgent(preferred: AgentName) -> AgentAdapter | null: ...
def guardSuggestions(root: string, before: Map[string, string]) -> 'SummaryOutcome[]': ...
def onPath(binary: string, env: NodeJS.ProcessEnv = ...) -> boolean: ...
def openTodo(result: CheckResult) -> 'Violation[]': ...
def promptPath(ws: Workspace, round: number) -> string: ...
def pushViolations(violations: 'Violation[]') -> 'Violation[]': ...
def readAll(root: string, files: 'string[]') -> Map[string, string]: ...

def runAgent(
    inv: AgentInvocation,
    cwd: string,
    stdio: '"inherit" | "ignore"',
) -> Promise[number | null]: ...

async def runPushLoop(
    ws: Workspace,
    first: CheckResult,
    opts: PushRunOptions,
) -> Promise[PushSummary]: ...

def suggestedVerifyCommands(files: Iterable[string]) -> 'string[]': ...
def summariesPrompt(sketchDir: string, files: 'string[]') -> string: ...
def withAgentsSection(existing: string | null, section: string) -> string | null: ...

ADAPTERS: Record[Exclude[AgentName, "custom"], AgentAdapter]
AGENTS_MARKER_END: '<inferred>'
AGENTS_MARKER_START: '<inferred>'
PUSH_RULES: 'readonly RuleName[]'
SUGGESTION: '<inferred>'
