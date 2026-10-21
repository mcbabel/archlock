"""Language-neutral architecture model, type canonicalization, rules and the comment-preserving merge."""

__module__ = "core"
__paths__ = ["src/core/**"]
__depends_on__ = []

ArchSymbol: TypeAlias = EnumSymbol | TypeAliasSymbol | ClassLikeSymbol | FunctionSymbol | ConstSymbol
HeaderKey: TypeAlias = '(typeof HEADER_KEYS)[number]'
Member: TypeAlias = FieldMember | MethodMember
ParamKind: TypeAlias = '"normal" | "rest" | "kwrest" | "star" | "slash"'
RuleName: TypeAlias = 'keyof typeof RULE_DEFAULTS'
Severity: TypeAlias = '"error" | "warn" | "info" | "off"'
Strictness: TypeAlias = '"signatures" | "names" | "deps"'
SymbolKind: TypeAlias = '"enum" | "type" | "interface" | "class" | "function" | "const"'

class ArchModel(Protocol):
    modules: 'ArchModule[]'

class ArchModule(Protocol):
    dependsOn: 'string[]'
    entry: string | null
    external: 'string[] | null'
    headerLines: Opt[Partial[Record[HeaderKey, number]]]
    name: string
    paths: 'string[]'
    reexports: 'ReExport[]'
    soft: ModuleSoft
    strictness: Strictness
    symbols: 'ArchSymbol[]'

class ClassLikeSymbol(SymbolBase, Protocol):
    bases: 'string[]'
    decorators: 'string[]'
    kind: '"class" | "interface"'
    members: 'Member[]'
    typeParams: 'string[]'

class ConstSymbol(SymbolBase, Protocol):
    kind: '"const"'
    type: string

class EnumMember(Protocol):
    name: string
    soft: Soft

class EnumSymbol(SymbolBase, Protocol):
    bases: 'string[]'
    kind: '"enum"'
    members: 'EnumMember[]'

class FieldMember(Protocol):
    kind: '"field"'
    loc: Opt[Location]
    name: string
    optional: boolean
    readonly: boolean
    soft: Soft
    static: boolean
    type: string

class FunctionSymbol(SymbolBase, Protocol):
    kind: '"function"'
    signatures: 'Signature[]'

class HeaderSoft(Protocol):
    leading: 'string[]'
    trailing: string | null

class Location(Protocol):
    column: number
    file: string
    line: number

class LostComment(Protocol):
    lines: 'string[]'
    module: string
    symbol: string

class MergeOptions(Protocol):
    deps: boolean
    symbols: boolean

class MergeResult(Protocol):
    lost: 'LostComment[]'
    module: ArchModule

class MethodMember(Protocol):
    abstract: boolean
    classmethod: boolean
    kind: '"method"'
    loc: Opt[Location]
    name: string
    optional: boolean
    signatures: 'Signature[]'
    soft: Soft
    static: boolean

class ModuleSoft(Protocol):
    docstring: string | null
    docstringTrailing: string | null
    fileLeading: 'string[]'
    fileTrailing: 'string[]'
    header: Partial[Record[HeaderKey, HeaderSoft]]

class Param(Protocol):
    kind: ParamKind
    name: string
    optional: boolean
    type: string | null

class ReExport(Protocol):
    self["from"]: string
    leading: 'string[]'
    names: 'string[]'

class Signature(Protocol):
    self["async"]: boolean
    params: 'Param[]'
    returns: string | null
    typeParams: 'string[]'

class Soft(Protocol):
    body: 'string[]'
    docstring: string | null
    leading: 'string[]'
    trailing: string | null

class TypeAliasSymbol(SymbolBase, Protocol):
    kind: '"type"'
    type: string
    typeParams: 'string[]'

def abbreviateSymbols(symbols: 'ArchSymbol[]', max: number | null) -> 'ArchSymbol[]': ...
def abbreviateType(type: string, max: number) -> string: ...

# invariant: idempotent: canonicalType(canonicalType(x)) === canonicalType(x)
def canonicalType(input: string) -> string: ...

def compareNames(a: string, b: string) -> number: ...
def decodePythonString(literal: string) -> string | null: ...
def emptyModuleSoft() -> ModuleSoft: ...
def emptySoft() -> Soft: ...
def isAbbreviatedType(type: string) -> boolean: ...
def isBareType(canonical: string) -> boolean: ...
def isPythonIdentifier(name: string) -> boolean: ...
def isPythonKeyword(name: string) -> boolean: ...

# must: keep every human comment, or report it as lost
def mergeModule(
    sketch: ArchModule,
    code: ArchModule,
    externals: 'string[]',
    options: MergeOptions,
) -> MergeResult: ...

def pythonString(text: string, prefer: '"\'" | \'"\'' = ...) -> string: ...
def renderType(canonical: string) -> string: ...
def toSketchName(name: string) -> string: ...

COMPLEX: '<inferred>'
FIXED_RULES: 'readonly RuleName[]'
HEADER_KEYS: '<inferred>'
INFERRED: '<inferred>'
MIN_TYPE_LENGTH: '<inferred>'
RULE_DEFAULTS: '<inferred>'
RULE_DESCRIPTIONS: Record[RuleName, string]
RULE_NAMES: '<inferred>'
SEVERITIES: 'readonly Severity[]'
STRICTNESS_VALUES: 'readonly Strictness[]'
SYMBOL_KIND_ORDER: 'readonly SymbolKind[]'
VERSION: string
