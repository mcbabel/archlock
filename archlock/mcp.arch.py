"""MCP server (stdio) exposing the architecture and the check to coding agents. Read-only."""

__module__ = "mcp"
__paths__ = ["src/mcp/**"]
__depends_on__ = ["config", "core", "engine", "extract", "report"]

def createMcpServer(cwd: string, configPath: string = ...) -> McpServer: ...
async def startMcpServer(cwd: string, configPath: string = ...) -> Promise[void]: ...
