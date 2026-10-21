"""Package entry points: the `archlock` binary (src/cli.ts) and the library API (src/index.ts)."""

__module__ = "archlock"
__paths__ = ["src/*"]
__entry__ = "src/index.ts"
__depends_on__ = ["cli", "core", "sketch"]

from .core import (
    ArchModel,
    ArchModule,
    ArchSymbol,
    canonicalType,
    ClassLikeSymbol,
    compareNames,
    COMPLEX,
    ConstSymbol,
    decodePythonString,
    emptyModuleSoft,
    emptySoft,
    EnumMember,
    EnumSymbol,
    FieldMember,
    FunctionSymbol,
    HEADER_KEYS,
    HeaderKey,
    HeaderSoft,
    INFERRED,
    isBareType,
    isPythonIdentifier,
    isPythonKeyword,
    Location,
    Member,
    MethodMember,
    ModuleSoft,
    Param,
    ParamKind,
    pythonString,
    ReExport,
    renderType,
    Signature,
    Soft,
    Strictness,
    STRICTNESS_VALUES,
    SYMBOL_KIND_ORDER,
    SymbolKind,
    toSketchName,
    TypeAliasSymbol,
    VERSION,
)
from .sketch import ParseResult, parseSketch, renderSketch, SketchError
