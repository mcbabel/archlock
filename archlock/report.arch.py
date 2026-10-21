"""Presentation: terminal, JSON, GitHub annotations, Mermaid graph, README and text diffs."""

__module__ = "report"
__paths__ = ["src/report/**"]
__depends_on__ = ["core", "engine"]

Colors: TypeAlias = 'ReturnType[typeof createColors]'
DiffOp: TypeAlias = '{ op: "=" | "-" | "+"; line: string }'

class Summary(Protocol):
    errors: number
    infos: number
    warnings: number

def badgeMarkdown(
    modules: number,
    codeLines: number,
    sketchLines: number,
    link: string,
) -> string: ...

def checkJson(violations: 'Violation[]', extra: Record[string, unknown]) -> string: ...
def compressionLine(codeLines: number, sketchLines: number) -> string: ...
def diffLines(a: 'string[]', b: 'string[]') -> 'DiffOp[]': ...
def docSummary(mod: ArchModule) -> string: ...
def formatNumber(n: number) -> string: ...
def formatRatio(codeLines: number, sketchLines: number) -> string: ...
def jsonPayload(command: string, data: Record[string, unknown]) -> string: ...
def mermaidGraph(modules: 'ArchModule[]') -> string: ...
def plural(n: number, word: string, pluralWord=...) -> string: ...
def ratioIsMeaningful(codeLines: number, sketchLines: number) -> boolean: ...
def ratioLine(codeLines: number, changes: number) -> string: ...
def renderDiffMarkdown(changes: 'ArchChange[]', codeLines: number, base: string) -> string: ...

def renderDiffTerminal(
    changes: 'ArchChange[]',
    codeLines: number,
    base: string,
    c: Colors,
) -> string: ...

def renderGithubAnnotations(violations: 'Violation[]') -> string: ...

def renderHumanReport(
    violations: 'Violation[]',
    c: Colors,
    opts: '{ quiet: boolean; modules: number; symbols: number }',
) -> string: ...

def renderReadme(modules: 'ArchModule[]', codeLines: number, sketchLines: number) -> string: ...
def summarize(violations: 'Violation[]') -> Summary: ...

def unifiedDiff(
    oldText: string,
    newText: string,
    file: string,
    c: Colors,
    context=...,
) -> string: ...

JSON_SCHEMA_VERSION: '<inferred>'
MIN_RATIO_CODE_LINES: '<inferred>'
PROJECT_URL: '<inferred>'
STICKY_MARKER: '<inferred>'
