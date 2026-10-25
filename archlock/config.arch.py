"""archlock.config.json: defaults, validation with key-specific messages, serialization."""

__module__ = "config"
__paths__ = ["src/config/**"]
__depends_on__ = ["core"]

AgentName: TypeAlias = '"claude" | "codex" | "opencode" | "custom"'
Language: TypeAlias = '"typescript" | "python" | "go" | "rust" | "java" | "csharp"'

class ArchlockConfig(Protocol):
    agent: '{ default: AgentName; command: string | null; maxRounds: number; verifyCommands: string[] }'
    exclude: 'string[]'
    include: 'string[]'
    languages: 'Language[]'
    maxTypeLength: number | null
    rules: Record[RuleName, Severity]
    sketchDir: string
    typed: boolean
    version: '1'

class LoadedConfig(Protocol):
    config: ArchlockConfig
    file: string
    root: string

class ConfigError(Error):
    file: Readonly[string]
    def __init__(self, message: string, file: string): ...

def defaultConfig() -> ArchlockConfig: ...
def findConfig(cwd: string) -> string | null: ...
def isPlainCommand(command: string) -> boolean: ...
def loadConfig(cwd: string, explicit: string = ...) -> LoadedConfig | null: ...
def serializeConfig(config: ArchlockConfig) -> string: ...
def validateConfig(raw: unknown, file: string) -> ArchlockConfig: ...

AGENT_NAMES: 'readonly AgentName[]'
CONFIG_FILE: '<inferred>'
DEFAULT_EXCLUDE: '<inferred>'
LANGUAGES: 'readonly Language[]'
SCHEMA_URL: '<inferred>'
