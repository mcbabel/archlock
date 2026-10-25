"""Zod 3, still shipped for compatibility (zod/v3)."""

__module__ = "zod.v3"
__paths__ = ["packages/zod/src/v3/**"]
__entry__ = "packages/zod/src/v3/index.ts"
__depends_on__ = []

class ZodFirstPartyTypeKind(Enum):
    ZodString = 'ZodString'
    ZodNumber = 'ZodNumber'
    ZodNaN = 'ZodNaN'
    ZodBigInt = 'ZodBigInt'
    ZodBoolean = 'ZodBoolean'
    ZodDate = 'ZodDate'
    ZodSymbol = 'ZodSymbol'
    ZodUndefined = 'ZodUndefined'
    ZodNull = 'ZodNull'
    ZodAny = 'ZodAny'
    ZodUnknown = 'ZodUnknown'
    ZodNever = 'ZodNever'
    ZodVoid = 'ZodVoid'
    ZodArray = 'ZodArray'
    ZodObject = 'ZodObject'
    ZodUnion = 'ZodUnion'
    ZodDiscriminatedUnion = 'ZodDiscriminatedUnion'
    ZodIntersection = 'ZodIntersection'
    ZodTuple = 'ZodTuple'
    ZodRecord = 'ZodRecord'
    ZodMap = 'ZodMap'
    ZodSet = 'ZodSet'
    ZodFunction = 'ZodFunction'
    ZodLazy = 'ZodLazy'
    ZodLiteral = 'ZodLiteral'
    ZodEnum = 'ZodEnum'
    ZodEffects = 'ZodEffects'
    ZodNativeEnum = 'ZodNativeEnum'
    ZodOptional = 'ZodOptional'
    ZodNullable = 'ZodNullable'
    ZodDefault = 'ZodDefault'
    ZodCatch = 'ZodCatch'
    ZodPromise = 'ZodPromise'
    ZodBranded = 'ZodBranded'
    ZodPipeline = 'ZodPipeline'
    ZodReadonly = 'ZodReadonly'

AnyZodObject: TypeAlias = ZodObject[any, any, any]
AnyZodTuple: TypeAlias = 'ZodTuple[[ZodTypeAny, ...ZodTypeAny[]] | [], ZodTypeAny | null]'
ArrayCardinality: TypeAlias = '"many" | "atleastone"'
ArrayKeys: TypeAlias = 'keyof any[]'
arrayOutputType: TypeAlias['T extends ZodTypeAny', 'Cardinality extends ArrayCardinality = "many"'] = 'Cardinality extends "atleastone" ? [T["_output"], ...T["_output"][]] : T["_output"][]'
AssertArray: TypeAlias[T] = 'T extends any[] ? T : never'
AsyncParseReturnType: TypeAlias[T] = Promise[SyncParseReturnType[T]]
baseObjectInputType: TypeAlias['Shape extends ZodRawShape'] = 'objectUtil.addQuestionMarks[{ [k in keyof Shape]: Shape[k]["_input"] }]'
baseObjectOutputType: TypeAlias['Shape extends ZodRawShape'] = '{ [k in keyof Shape]: Shape[k]["_output"] }'
BRAND: TypeAlias['T extends string | number | symbol'] = '{ [BRAND]: { [k in T]: true } }'
CatchallInput: TypeAlias['T extends ZodType'] = 'ZodType extends T ? unknown : { [k: string]: T["_input"] }'
CatchallOutput: TypeAlias['T extends ZodType'] = 'ZodType extends T ? unknown : { [k: string]: T["_output"] }'
CustomErrorParams: TypeAlias = Partial[util.Omit[ZodCustomIssue, "code"]]
DenormalizedError: TypeAlias = '{ [k: string]: DenormalizedError | string[] }'
deoptional: TypeAlias['T extends ZodTypeAny'] = 'T extends ZodOptional[infer U] ? deoptional[U] : T extends ZodNullable[infer U] ? ZodNullable[deoptional[U]] : T'
DIRTY: TypeAlias[T] = '{ status: "dirty"; value: T }'
Effect: TypeAlias[T] = RefinementEffect[T] | TransformEffect[T] | PreprocessEffect[T]
EnumLike: TypeAlias = '{ [k: string]: string | number; [nu: number]: string }'
EnumValues: TypeAlias['T extends string = string'] = 'readonly [T, ...T[]]'
ErrorMapCtx: TypeAlias = '{ defaultError: string; data: any }'
FilterEnum: TypeAlias[Values, ToExclude] = '<Values extends [] ? [] : Values extends [infer Head, … (171 chars, #17958c79)>'
Indices: TypeAlias[T] = 'Exclude[keyof T, ArrayKeys]'
infer: TypeAlias['T extends ZodType[any, any, any]'] = T["_output"]
inferFlattenedErrors: TypeAlias['T extends ZodType[any, any, any]', 'U = string'] = typeToFlattenedError[TypeOf[T], U]
inferFormattedError: TypeAlias['T extends ZodType[any, any, any]', 'U = string'] = ZodFormattedError[TypeOf[T], U]
InnerTypeOfFunction: TypeAlias['Args extends ZodTuple[any, any]', 'Returns extends ZodTypeAny'] = 'Args["_output"] extends Array[any] ? (...args: Args["_output"]) => Returns["_input"] : never'
input: TypeAlias['T extends ZodType[any, any, any]'] = T["_input"]
InputTypeOfTuple: TypeAlias['T extends ZodTupleItems | []'] = 'AssertArray[{ [k in keyof T]: T[k] extends ZodType[any, any, any] ? T[k]["_input"] : never }]'
InputTypeOfTupleWithRest: TypeAlias['T extends ZodTupleItems | []', 'Rest extends ZodTypeAny | null = null'] = 'Rest extends ZodTypeAny ? [...InputTypeOfTuple[T], ...Rest["_input"][]] : InputTypeOfTuple[T]'
INVALID: TypeAlias = '{ status: "aborted" }'
IpVersion: TypeAlias = '"v4" | "v6"'
IssueData: TypeAlias = 'stripPath[ZodIssueOptionalMessage] & { path?: (string | number)[]; fatal?: boolean | undefined }'
KeySchema: TypeAlias = ZodType[string | number | symbol, any, any]
mergeTypes: TypeAlias[A, B] = '{ [k in keyof A | keyof B]: k extends keyof B ? B[k] : k extends keyof A ? A[k] : never }'
noUnrecognized: TypeAlias['Obj extends object', 'Shape extends object'] = '{ [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never }'
objectInputType: TypeAlias['Shape extends ZodRawShape', 'Catchall extends ZodTypeAny', 'UnknownKeys extends UnknownKeysParam = UnknownKeysParam'] = 'objectUtil.flatten[baseObjectInputType[Shape]] & CatchallInput[Catchall] & PassthroughType[UnknownKeys]'
objectOutputType: TypeAlias['Shape extends ZodRawShape', 'Catchall extends ZodTypeAny', 'UnknownKeys extends UnknownKeysParam = UnknownKeysParam'] = '<objectUtil.flatten[objectUtil.addQuestionMarks[baseObjectOut … (134 chars, #1513fb23)>'
ObjectPair: TypeAlias = '{ key: SyncParseReturnType[any]; value: SyncParseReturnType[any] }'
OK: TypeAlias[T] = '{ status: "valid"; value: T }'
OuterTypeOfFunction: TypeAlias['Args extends ZodTuple[any, any]', 'Returns extends ZodTypeAny'] = 'Args["_input"] extends Array[any] ? (...args: Args["_input"]) => Returns["_output"] : never'
output: TypeAlias['T extends ZodType[any, any, any]'] = T["_output"]
OutputTypeOfTuple: TypeAlias['T extends ZodTupleItems | []'] = 'AssertArray[{ [k in keyof T]: T[k] extends ZodType[any, any, any] ? T[k]["_output"] : never }]'
OutputTypeOfTupleWithRest: TypeAlias['T extends ZodTupleItems | []', 'Rest extends ZodTypeAny | null = null'] = 'Rest extends ZodTypeAny ? [...OutputTypeOfTuple[T], ...Rest["_output"][]] : OutputTypeOfTuple[T]'
ParseInput: TypeAlias = '{ data: any; path: (string | number)[]; parent: ParseContext }'
ParseParams: TypeAlias = '{ path: (string | number)[]; errorMap: ZodErrorMap; async: boolean }'
ParsePath: TypeAlias = 'ParsePathComponent[]'
ParsePathComponent: TypeAlias = string | number
ParseReturnType: TypeAlias[T] = SyncParseReturnType[T] | AsyncParseReturnType[T]
PassthroughType: TypeAlias['T extends UnknownKeysParam'] = 'T extends "passthrough" ? { [k: string]: unknown } : unknown'
PreprocessEffect: TypeAlias[T] = '{ type: "preprocess"; transform: (arg: T, ctx: RefinementCtx) => any }'
Primitive: TypeAlias = string | number | symbol | bigint | boolean | null | undefined
ProcessedCreateParams: TypeAlias = '{ errorMap?: ZodErrorMap | undefined; description?: string | undefined }'
RawCreateParams: TypeAlias = '<{ errorMap?: ZodErrorMap | undefined; invalid_type_error?: … (192 chars, #ef189063)>'
RecordType: TypeAlias['K extends string | number | symbol', V] = '<[string] extends [K] ? Record[K, V] : [number] extends [K] … (198 chars, #80bbd2e5)>'
Refinement: TypeAlias[T] = '(arg: T, ctx: RefinementCtx) => any'
RefinementEffect: TypeAlias[T] = '{ type: "refinement"; refinement: (arg: T, ctx: RefinementCtx) => any }'
SafeParseError: TypeAlias[Input] = '{ success: false; error: ZodError[Input]; data?: never }'
SafeParseReturnType: TypeAlias[Input, Output] = SafeParseSuccess[Output] | SafeParseError[Input]
SafeParseSuccess: TypeAlias[Output] = '{ success: true; data: Output; error?: never }'
Scalars: TypeAlias = 'Primitive | Primitive[]'
SomeZodObject: TypeAlias = ZodObject[ZodRawShape, UnknownKeysParam, ZodTypeAny]
StringValidation: TypeAlias = '<"email" | "url" | "emoji" | "uuid" | "nanoid" | "regex" | … (278 chars, #0a412127)>'
SuperRefinement: TypeAlias[T] = '(arg: T, ctx: RefinementCtx) => void | Promise[void]'
SyncParseReturnType: TypeAlias['T = any'] = OK[T] | DIRTY[T] | INVALID
TransformEffect: TypeAlias[T] = '{ type: "transform"; transform: (arg: T, ctx: RefinementCtx) => any }'
typecast: TypeAlias[A, T] = 'A extends T ? A : never'
TypeOf: TypeAlias['T extends ZodType[any, any, any]'] = T["_output"]
typeToFlattenedError: TypeAlias[T, 'U = string'] = '{ formErrors: U[]; fieldErrors: { [P in allKeys[T]]?: U[] } }'
UnknownKeysParam: TypeAlias = '"passthrough" | "strict" | "strip"'
Values: TypeAlias['T extends EnumValues'] = '{ [k in T[number]]: k }'
Writeable: TypeAlias[T] = '{ -readonly [P in keyof T]: T[P] }'
ZodBigIntCheck: TypeAlias = '<{ kind: "min"; value: bigint; inclusive: boolean; message?: … (233 chars, #5fe52d38)>'
ZodDateCheck: TypeAlias = '<{ kind: "min"; value: number; message?: string | undefined … (123 chars, #aec25a77)>'
ZodDiscriminatedUnionOption: TypeAlias['Discriminator extends string'] = 'ZodObject[{ [key in Discriminator]: ZodTypeAny } & ZodRawShape, UnknownKeysParam, ZodTypeAny]'
ZodErrorMap: TypeAlias = '(issue: ZodIssueOptionalMessage, _ctx: ErrorMapCtx) => { message: string }'
ZodFirstPartySchemaTypes: TypeAlias = '<ZodString | ZodNumber | ZodNaN | ZodBigInt | ZodBoolean | … (619 chars, #63a4662b)>'
ZodFormattedError: TypeAlias[T, 'U = string'] = '{ _errors: U[] } & recursiveZodFormattedError[NonNullable[T]]'
ZodIssue: TypeAlias = 'ZodIssueOptionalMessage & { fatal?: boolean | undefined; message: string }'
ZodIssueBase: TypeAlias = '{ path: (string | number)[]; message?: string | undefined }'
ZodIssueCode: TypeAlias = 'keyof typeof ZodIssueCode'
ZodIssueOptionalMessage: TypeAlias = '<ZodInvalidTypeIssue | ZodInvalidLiteralIssue | … (390 chars, #6b5d55cb)>'
ZodNonEmptyArray: TypeAlias['T extends ZodTypeAny'] = ZodArray[T, "atleastone"]
ZodNullableType: TypeAlias['T extends ZodTypeAny'] = ZodNullable[T]
ZodNumberCheck: TypeAlias = '<{ kind: "min"; value: number; inclusive: boolean; message?: … (332 chars, #8e392df8)>'
ZodOptionalType: TypeAlias['T extends ZodTypeAny'] = ZodOptional[T]
ZodParsedType: TypeAlias = 'keyof typeof ZodParsedType'
ZodRawShape: TypeAlias = '{ [k: string]: ZodTypeAny }'
ZodStringCheck: TypeAlias = '<{ kind: "min"; value: number; message?: string | undefined … (1666 chars, #4279663c)>'
ZodTupleItems: TypeAlias = '[ZodTypeAny, ...ZodTypeAny[]]'
ZodTypeAny: TypeAlias = ZodType[any, any, any]
ZodUnionOptions: TypeAlias = 'Readonly[[ZodTypeAny, ...ZodTypeAny[]]]'

class ParseContext(Protocol):
    common: Readonly['{ readonly issues: ZodIssue[]; readonly contextualErrorMap?: ZodErrorMap | undefined; readonly async: boolean }']
    data: Readonly[any]
    parent: Readonly[ParseContext | null]
    parsedType: Readonly[ZodParsedType]
    path: Readonly[ParsePath]
    schemaErrorMap: Readonly[Opt[ZodErrorMap | undefined]]

class ParseResult(Protocol):
    data: any
    status: '"aborted" | "dirty" | "valid"'

class RefinementCtx(Protocol):
    addIssue: '(arg: IssueData) => void'
    path: '(string | number)[]'

class ZodAnyDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodAny

class ZodArrayDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    exactLength: '{ value: number; message?: string | undefined } | null'
    maxLength: '{ value: number; message?: string | undefined } | null'
    minLength: '{ value: number; message?: string | undefined } | null'
    type: T
    typeName: ZodFirstPartyTypeKind.ZodArray

class ZodBigIntDef(ZodTypeDef, Protocol):
    checks: 'ZodBigIntCheck[]'
    coerce: boolean
    typeName: ZodFirstPartyTypeKind.ZodBigInt

class ZodBooleanDef(ZodTypeDef, Protocol):
    coerce: boolean
    typeName: ZodFirstPartyTypeKind.ZodBoolean

class ZodBrandedDef['T extends ZodTypeAny'](ZodTypeDef, Protocol):
    type: T
    typeName: ZodFirstPartyTypeKind.ZodBranded

class ZodCatchDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    catchValue: '(ctx: { error: ZodError; input: unknown }) => T["_input"]'
    innerType: T
    typeName: ZodFirstPartyTypeKind.ZodCatch

class ZodCustomIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.custom'
    params: Opt['{ [k: string]: any }']

class ZodDateDef(ZodTypeDef, Protocol):
    checks: 'ZodDateCheck[]'
    coerce: boolean
    typeName: ZodFirstPartyTypeKind.ZodDate

class ZodDefaultDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    defaultValue: '() => util.noUndefined[T["_input"]]'
    innerType: T
    typeName: ZodFirstPartyTypeKind.ZodDefault

class ZodDiscriminatedUnionDef['Discriminator extends string', 'Options extends readonly ZodDiscriminatedUnionOption[string][] = ZodDiscriminatedUnionOption[string][]'](ZodTypeDef, Protocol):
    discriminator: Discriminator
    options: Options
    optionsMap: Map[Primitive, ZodDiscriminatedUnionOption[any]]
    typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion

class ZodEffectsDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    effect: Effect[any]
    schema: T
    typeName: ZodFirstPartyTypeKind.ZodEffects

class ZodEnumDef['T extends EnumValues = EnumValues'](ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodEnum
    values: T

class ZodFunctionDef['Args extends ZodTuple[any, any] = ZodTuple[any, any]', 'Returns extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    args: Args
    returns: Returns
    typeName: ZodFirstPartyTypeKind.ZodFunction

class ZodIntersectionDef['T extends ZodTypeAny = ZodTypeAny', 'U extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    left: T
    right: U
    typeName: ZodFirstPartyTypeKind.ZodIntersection

class ZodInvalidArgumentsIssue(ZodIssueBase, Protocol):
    argumentsError: ZodError
    code: 'typeof ZodIssueCode.invalid_arguments'

class ZodInvalidDateIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_date'

class ZodInvalidEnumValueIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_enum_value'
    options: '(string | number)[]'
    received: string | number

class ZodInvalidIntersectionTypesIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_intersection_types'

class ZodInvalidLiteralIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_literal'
    expected: unknown
    received: unknown

class ZodInvalidReturnTypeIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_return_type'
    returnTypeError: ZodError

class ZodInvalidStringIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_string'
    validation: StringValidation

class ZodInvalidTypeIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_type'
    expected: ZodParsedType
    received: ZodParsedType

class ZodInvalidUnionDiscriminatorIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_union_discriminator'
    options: 'Primitive[]'

class ZodInvalidUnionIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.invalid_union'
    unionErrors: 'ZodError[]'

class ZodLazyDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    getter: '() => T'
    typeName: ZodFirstPartyTypeKind.ZodLazy

class ZodLiteralDef['T = any'](ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodLiteral
    value: T

class ZodMapDef['Key extends ZodTypeAny = ZodTypeAny', 'Value extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    keyType: Key
    typeName: ZodFirstPartyTypeKind.ZodMap
    valueType: Value

class ZodNaNDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodNaN

class ZodNativeEnumDef['T extends EnumLike = EnumLike'](ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum
    values: T

class ZodNeverDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodNever

class ZodNotFiniteIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.not_finite'

class ZodNotMultipleOfIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.not_multiple_of'
    multipleOf: number | bigint

class ZodNullableDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    innerType: T
    typeName: ZodFirstPartyTypeKind.ZodNullable

class ZodNullDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodNull

class ZodNumberDef(ZodTypeDef, Protocol):
    checks: 'ZodNumberCheck[]'
    coerce: boolean
    typeName: ZodFirstPartyTypeKind.ZodNumber

class ZodObjectDef['T extends ZodRawShape = ZodRawShape', 'UnknownKeys extends UnknownKeysParam = UnknownKeysParam', 'Catchall extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    catchall: Catchall
    shape: '() => T'
    typeName: ZodFirstPartyTypeKind.ZodObject
    unknownKeys: UnknownKeys

class ZodOptionalDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    innerType: T
    typeName: ZodFirstPartyTypeKind.ZodOptional

class ZodPipelineDef['A extends ZodTypeAny', 'B extends ZodTypeAny'](ZodTypeDef, Protocol):
    self["in"]: A
    out: B
    typeName: ZodFirstPartyTypeKind.ZodPipeline

class ZodPromiseDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    type: T
    typeName: ZodFirstPartyTypeKind.ZodPromise

class ZodReadonlyDef['T extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    innerType: T
    typeName: ZodFirstPartyTypeKind.ZodReadonly

class ZodRecordDef['Key extends KeySchema = ZodString', 'Value extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    keyType: Key
    typeName: ZodFirstPartyTypeKind.ZodRecord
    valueType: Value

class ZodSetDef['Value extends ZodTypeAny = ZodTypeAny'](ZodTypeDef, Protocol):
    maxSize: '{ value: number; message?: string | undefined } | null'
    minSize: '{ value: number; message?: string | undefined } | null'
    typeName: ZodFirstPartyTypeKind.ZodSet
    valueType: Value

class ZodStringDef(ZodTypeDef, Protocol):
    checks: 'ZodStringCheck[]'
    coerce: boolean
    typeName: ZodFirstPartyTypeKind.ZodString

class ZodSymbolDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodSymbol

class ZodTooBigIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.too_big'
    exact: Opt[boolean]
    inclusive: boolean
    maximum: number | bigint
    type: '"array" | "string" | "number" | "set" | "date" | "bigint"'

class ZodTooSmallIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.too_small'
    exact: Opt[boolean]
    inclusive: boolean
    minimum: number | bigint
    type: '"array" | "string" | "number" | "set" | "date" | "bigint"'

class ZodTupleDef['T extends ZodTupleItems | [] = ZodTupleItems', 'Rest extends ZodTypeAny | null = null'](ZodTypeDef, Protocol):
    items: T
    rest: Rest
    typeName: ZodFirstPartyTypeKind.ZodTuple

class ZodTypeDef(Protocol):
    description: Opt[string | undefined]
    errorMap: Opt[ZodErrorMap | undefined]

class ZodUndefinedDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodUndefined

class ZodUnionDef['T extends ZodUnionOptions = Readonly[[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]]'](ZodTypeDef, Protocol):
    options: T
    typeName: ZodFirstPartyTypeKind.ZodUnion

class ZodUnknownDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodUnknown

class ZodUnrecognizedKeysIssue(ZodIssueBase, Protocol):
    code: 'typeof ZodIssueCode.unrecognized_keys'
    keys: 'string[]'

class ZodVoidDef(ZodTypeDef, Protocol):
    typeName: ZodFirstPartyTypeKind.ZodVoid

class ParseStatus:
    value: '"aborted" | "dirty" | "valid"'
    def abort(self) -> void: ...
    def dirty(self) -> void: ...
    @staticmethod
    def mergeArray(
        status: ParseStatus,
        results: 'SyncParseReturnType[any][]',
    ) -> SyncParseReturnType: ...
    @staticmethod
    async def mergeObjectAsync(
        status: ParseStatus,
        pairs: '{ key: ParseReturnType[any]; value: ParseReturnType[any] }[]',
    ) -> Promise[SyncParseReturnType[any]]: ...
    @staticmethod
    def mergeObjectSync(
        status: ParseStatus,
        pairs: '{ key: SyncParseReturnType[any]; value: SyncParseReturnType[any]; alwaysSet?: boolean }[]',
    ) -> SyncParseReturnType: ...

class Schema['Output = any', 'Def extends ZodTypeDef = ZodTypeDef', 'Input = Output']:
    _def: Readonly[Def]
    _input: Readonly[Input]
    _output: Readonly[Output]
    _type: Readonly[Output]
    description: Readonly[string | undefined]
    spa: '<inferred>'
    self["~standard"]: StandardSchemaV1.Props[Input, Output]
    def __init__(self, def_: Def): ...
    def _getOrReturnCtx(
        self,
        input: ParseInput,
        ctx: ParseContext | undefined = ...,
    ) -> ParseContext: ...
    def _getType(self, input: ParseInput) -> string: ...
    @abstractmethod
    def _parse(self, input: ParseInput) -> ParseReturnType[Output]: ...
    def _parseAsync(self, input: ParseInput) -> AsyncParseReturnType[Output]: ...
    def _parseSync(self, input: ParseInput) -> SyncParseReturnType[Output]: ...
    def _processInputParams(
        self,
        input: ParseInput,
    ) -> '{ status: ParseStatus; ctx: ParseContext }': ...
    def _refinement(
        self,
        refinement: 'RefinementEffect[Output]["refinement"]',
    ) -> ZodEffects[this, Output, Input]: ...
    def _validate(
        self,
        data: unknown,
    ) -> StandardSchemaV1.Result[Output] | Promise[StandardSchemaV1.Result[Output]]: ...
    def and_['T extends ZodTypeAny'](self, incoming: T) -> ZodIntersection[this, T]: ...
    def array(self) -> ZodArray[this]: ...
    def brand['B extends string | number | symbol'](
        self,
        brand: B = ...,
    ) -> ZodBranded[this, B]: ...
    @overload
    def catch(self, def_: Output) -> ZodCatch[this]: ...
    @overload
    def catch(
        self,
        def_: '(ctx: { error: ZodError; input: Input }) => Output',
    ) -> ZodCatch[this]: ...
    @overload
    def default(self, def_: util.noUndefined[Input]) -> ZodDefault[this]: ...
    @overload
    def default(self, def_: '() => util.noUndefined[Input]') -> ZodDefault[this]: ...
    def describe(self, description: string) -> this: ...
    def isNullable(self) -> boolean: ...
    def isOptional(self) -> boolean: ...
    def nullable(self) -> ZodNullable[this]: ...
    def nullish(self) -> ZodOptional[ZodNullable[this]]: ...
    def optional(self) -> ZodOptional[this]: ...
    def or_['T extends ZodTypeAny'](self, option: T) -> ZodUnion[[this, T]]: ...
    def parse(self, data: unknown, params: util.InexactPartial[ParseParams] = ...) -> Output: ...
    async def parseAsync(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> Promise[Output]: ...
    def pipe['T extends ZodTypeAny'](self, target: T) -> ZodPipeline[this, T]: ...
    def promise(self) -> ZodPromise[this]: ...
    def readonly(self) -> ZodReadonly[this]: ...
    @overload
    def refine['RefinedOutput extends Output'](
        self,
        check: '(arg: Output) => arg is RefinedOutput',
        message: 'string | CustomErrorParams | ((arg: Output) => CustomErrorParams)' = ...,
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def refine(
        self,
        check: '(arg: Output) => unknown | Promise[unknown]',
        message: 'string | CustomErrorParams | ((arg: Output) => CustomErrorParams)' = ...,
    ) -> ZodEffects[this, Output, Input]: ...
    @overload
    def refinement['RefinedOutput extends Output'](
        self,
        check: '(arg: Output) => arg is RefinedOutput',
        refinementData: 'IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)',
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def refinement(
        self,
        check: '(arg: Output) => boolean',
        refinementData: 'IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)',
    ) -> ZodEffects[this, Output, Input]: ...
    def safeParse(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> SafeParseReturnType[Input, Output]: ...
    async def safeParseAsync(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> Promise[SafeParseReturnType[Input, Output]]: ...
    @overload
    def superRefine['RefinedOutput extends Output'](
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => arg is RefinedOutput',
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def superRefine(
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => void',
    ) -> ZodEffects[this, Output, Input]: ...
    @overload
    def superRefine(
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => Promise[void]',
    ) -> ZodEffects[this, Output, Input]: ...
    def transform[NewOut](
        self,
        transform: '(arg: Output, ctx: RefinementCtx) => NewOut | Promise[NewOut]',
    ) -> ZodEffects[this, NewOut]: ...

class ZodAny(ZodType[any, ZodAnyDef, any]):
    _any: '<inferred>'
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodAny: ...

class ZodArray['T extends ZodTypeAny', 'Cardinality extends ArrayCardinality = "many"']('ZodType[arrayOutputType[T, Cardinality], ZodArrayDef[T], Cardinality extends "atleastone" ? [T["_input"], ...T["_input"][]] : T["_input"][]]'):
    element: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['El extends ZodTypeAny'](
        schema: El,
        params: RawCreateParams = ...,
    ) -> ZodArray[El]: ...
    def length(self, len: number, message: errorUtil.ErrMessage = ...) -> this: ...
    def max(self, maxLength: number, message: errorUtil.ErrMessage = ...) -> this: ...
    def min(self, minLength: number, message: errorUtil.ErrMessage = ...) -> this: ...
    def nonempty(self, message: errorUtil.ErrMessage = ...) -> ZodArray[T, "atleastone"]: ...

class ZodBigInt(ZodType[bigint, ZodBigIntDef, bigint]):
    max: '<inferred>'
    maxValue: Readonly['<inferred>']
    min: '<inferred>'
    minValue: Readonly['<inferred>']
    def _addCheck(self, check: ZodBigIntCheck) -> '<inferred>': ...
    def _getInvalidInput(self, input: ParseInput) -> '<inferred>': ...
    def _parse(self, input: ParseInput) -> ParseReturnType[bigint]: ...
    @staticmethod
    def create(params: 'RawCreateParams & { coerce?: boolean }' = ...) -> ZodBigInt: ...
    def gt(self, value: bigint, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def gte(self, value: bigint, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def lt(self, value: bigint, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def lte(self, value: bigint, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def multipleOf(self, value: bigint, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def negative(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def nonnegative(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def nonpositive(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def positive(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...

class ZodBoolean(ZodType[boolean, ZodBooleanDef, boolean]):
    def _parse(self, input: ParseInput) -> ParseReturnType[boolean]: ...
    @staticmethod
    def create(params: 'RawCreateParams & { coerce?: boolean }' = ...) -> ZodBoolean: ...

class ZodBranded['T extends ZodTypeAny', 'B extends string | number | symbol']('ZodType[T["_output"] & BRAND[B], ZodBrandedDef[T], T["_input"]]'):
    def _parse(self, input: ParseInput) -> ParseReturnType[any]: ...
    def unwrap(self) -> '<inferred>': ...

class ZodCatch['T extends ZodTypeAny'](ZodType[T["_output"], ZodCatchDef[T], unknown]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Inner extends ZodTypeAny'](
        type: Inner,
        params: 'RawCreateParams & { catch: Inner["_output"] | (() => Inner["_output"]) }',
    ) -> ZodCatch[Inner]: ...
    def removeCatch(self) -> '<inferred>': ...

class ZodDate(ZodType[Date, ZodDateDef, Date]):
    maxDate: Readonly['<inferred>']
    minDate: Readonly['<inferred>']
    def _addCheck(self, check: ZodDateCheck) -> '<inferred>': ...
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: 'RawCreateParams & { coerce?: boolean }' = ...) -> ZodDate: ...
    def max(self, maxDate: Date, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def min(self, minDate: Date, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...

class ZodDefault['T extends ZodTypeAny'](ZodType[util.noUndefined[T["_output"]], ZodDefaultDef[T], T["_input"] | undefined]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Inner extends ZodTypeAny'](
        type: Inner,
        params: 'RawCreateParams & { default: Inner["_input"] | (() => util.noUndefined[Inner["_input"]]) }',
    ) -> ZodDefault[Inner]: ...
    def removeDefault(self) -> '<inferred>': ...

class ZodDiscriminatedUnion['Discriminator extends string', 'Options extends readonly ZodDiscriminatedUnionOption[Discriminator][]'](ZodType[output[Options[number]], ZodDiscriminatedUnionDef[Discriminator, Options], input[Options[number]]]):
    discriminator: Readonly['<inferred>']
    options: Readonly['<inferred>']
    optionsMap: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create[
        'Discriminator extends string',
        'Types extends readonly [ZodDiscriminatedUnionOption[Discriminator], ...ZodDiscriminatedUnionOption[Discriminator][]]',
    ](
        discriminator: Discriminator,
        options: Types,
        params: RawCreateParams = ...,
    ) -> ZodDiscriminatedUnion[Discriminator, Types]: ...

class ZodEffects['T extends ZodTypeAny', 'Output = output[T]', 'Input = input[T]'](ZodType[Output, ZodEffectsDef[T], Input]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['I extends ZodTypeAny'](
        schema: I,
        effect: Effect[I["_output"]],
        params: RawCreateParams = ...,
    ) -> ZodEffects[I, I["_output"]]: ...
    @staticmethod
    def createWithPreprocess['I extends ZodTypeAny'](
        preprocess: '(arg: unknown, ctx: RefinementCtx) => unknown',
        schema: I,
        params: RawCreateParams = ...,
    ) -> ZodEffects[I, I["_output"], unknown]: ...
    def innerType(self) -> '<inferred>': ...
    def sourceType(self) -> T: ...

class ZodEnum['T extends [string, ...string[]]'](ZodType[T[number], ZodEnumDef[T], T[number]]):
    _cache: Set[T[number]] | undefined
    create: ClassVar['<inferred>']
    Enum: Readonly[Values[T]]
    enum: Readonly[Values[T]]
    options: Readonly['<inferred>']
    Values: Readonly[Values[T]]
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    def exclude['ToExclude extends readonly [T[number], ...T[number][]]'](
        self,
        values: ToExclude,
        newDef: RawCreateParams = ...,
    ) -> 'ZodEnum[typecast[Writeable[FilterEnum[T, ToExclude[number]]], [string, ...string[]]]]': ...
    def extract['ToExtract extends readonly [T[number], ...T[number][]]'](
        self,
        values: ToExtract,
        newDef: RawCreateParams = ...,
    ) -> ZodEnum[Writeable[ToExtract]]: ...

class ZodError['T = any'](Error):
    errors: Readonly['<inferred>']
    formErrors: Readonly['<inferred>']
    isEmpty: Readonly[boolean]
    issues: 'ZodIssue[]'
    message: Readonly['<inferred>']
    def __init__(self, issues: 'ZodIssue[]'): ...
    def addIssue(self, sub: ZodIssue) -> '<inferred>': ...
    def addIssues(self, subs: 'ZodIssue[]' = ...) -> '<inferred>': ...
    @staticmethod
    def assert_(value: unknown) -> 'asserts value is ZodError': ...
    @staticmethod
    def create(issues: 'ZodIssue[]') -> '<inferred>': ...
    @overload
    def flatten(self) -> typeToFlattenedError[T]: ...
    @overload
    def flatten[U](self, mapper: '(issue: ZodIssue) => U' = ...) -> typeToFlattenedError[T, U]: ...
    @overload
    def format(self) -> ZodFormattedError[T]: ...
    @overload
    def format[U](self, mapper: '(issue: ZodIssue) => U') -> ZodFormattedError[T, U]: ...
    def toString(self) -> '<inferred>': ...

class ZodFunction['Args extends ZodTuple[any, any]', 'Returns extends ZodTypeAny'](ZodType[OuterTypeOfFunction[Args, Returns], ZodFunctionDef[Args, Returns], InnerTypeOfFunction[Args, Returns]]):
    validate: '<inferred>'
    def _parse(self, input: ParseInput) -> ParseReturnType[any]: ...
    def args['Items extends Parameters[(typeof ZodTuple)["create"]][0]'](
        self,
        *items: Items,
    ) -> ZodFunction[ZodTuple[Items, ZodUnknown], Returns]: ...
    @staticmethod
    @overload
    def create() -> ZodFunction[ZodTuple[[], ZodUnknown], ZodUnknown]: ...
    @staticmethod
    @overload
    def create['T extends AnyZodTuple = ZodTuple[[], ZodUnknown]'](
        args: T,
    ) -> ZodFunction[T, ZodUnknown]: ...
    @staticmethod
    @overload
    def create['T extends AnyZodTuple', 'U extends ZodTypeAny'](
        args: T,
        returns: U,
    ) -> ZodFunction[T, U]: ...
    @staticmethod
    @overload
    def create[
        'T extends AnyZodTuple = ZodTuple[[], ZodUnknown]',
        'U extends ZodTypeAny = ZodUnknown',
    ](
        args: T,
        returns: U,
        params: RawCreateParams = ...,
    ) -> ZodFunction[T, U]: ...
    def implement['F extends InnerTypeOfFunction[Args, Returns]'](
        self,
        func: F,
    ) -> '<ReturnType[F] extends Returns["_output"] ? (...args: … (122 chars, #cdc721a0)>': ...
    def parameters(self) -> '<inferred>': ...
    def returns['NewReturnType extends ZodType[any, any, any]'](
        self,
        returnType: NewReturnType,
    ) -> ZodFunction[Args, NewReturnType]: ...
    def returnType(self) -> '<inferred>': ...
    def strictImplement(
        self,
        func: InnerTypeOfFunction[Args, Returns],
    ) -> InnerTypeOfFunction[Args, Returns]: ...

class ZodIntersection['T extends ZodTypeAny', 'U extends ZodTypeAny']('ZodType[T["_output"] & U["_output"], ZodIntersectionDef[T, U], T["_input"] & U["_input"]]'):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['TSchema extends ZodTypeAny', 'USchema extends ZodTypeAny'](
        left: TSchema,
        right: USchema,
        params: RawCreateParams = ...,
    ) -> ZodIntersection[TSchema, USchema]: ...

class ZodLazy['T extends ZodTypeAny'](ZodType[output[T], ZodLazyDef[T], input[T]]):
    schema: Readonly[T]
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Inner extends ZodTypeAny'](
        getter: '() => Inner',
        params: RawCreateParams = ...,
    ) -> ZodLazy[Inner]: ...

class ZodLiteral[T](ZodType[T, ZodLiteralDef[T], T]):
    value: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Value extends Primitive'](
        value: Value,
        params: RawCreateParams = ...,
    ) -> ZodLiteral[Value]: ...

class ZodMap['Key extends ZodTypeAny = ZodTypeAny', 'Value extends ZodTypeAny = ZodTypeAny'](ZodType[Map[Key["_output"], Value["_output"]], ZodMapDef[Key, Value], Map[Key["_input"], Value["_input"]]]):
    keySchema: Readonly['<inferred>']
    valueSchema: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create[
        'KeySchema extends ZodTypeAny = ZodTypeAny',
        'ValueSchema extends ZodTypeAny = ZodTypeAny',
    ](
        keyType: KeySchema,
        valueType: ValueSchema,
        params: RawCreateParams = ...,
    ) -> ZodMap[KeySchema, ValueSchema]: ...

class ZodNaN(ZodType[number, ZodNaNDef, number]):
    def _parse(self, input: ParseInput) -> ParseReturnType[any]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodNaN: ...

class ZodNativeEnum['T extends EnumLike']('ZodType[T[keyof T], ZodNativeEnumDef[T], T[keyof T]]'):
    _cache: 'Set[T[keyof T]] | undefined'
    enum: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> 'ParseReturnType[T[keyof T]]': ...
    @staticmethod
    def create['Elements extends EnumLike'](
        values: Elements,
        params: RawCreateParams = ...,
    ) -> ZodNativeEnum[Elements]: ...

class ZodNever(ZodType[never, ZodNeverDef, never]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodNever: ...

class ZodNull(ZodType[null, ZodNullDef, null]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodNull: ...

class ZodNullable['T extends ZodTypeAny'](ZodType[T["_output"] | null, ZodNullableDef[T], T["_input"] | null]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Inner extends ZodTypeAny'](
        type: Inner,
        params: RawCreateParams = ...,
    ) -> ZodNullable[Inner]: ...
    def unwrap(self) -> '<inferred>': ...

class ZodNumber(ZodType[number, ZodNumberDef, number]):
    isFinite: Readonly['<inferred>']
    isInt: Readonly['<inferred>']
    max: '<inferred>'
    maxValue: Readonly['<inferred>']
    min: '<inferred>'
    minValue: Readonly['<inferred>']
    step: '<inferred>'
    def _addCheck(self, check: ZodNumberCheck) -> '<inferred>': ...
    def _parse(self, input: ParseInput) -> ParseReturnType[number]: ...
    @staticmethod
    def create(params: 'RawCreateParams & { coerce?: boolean }' = ...) -> ZodNumber: ...
    def finite(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def gt(self, value: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def gte(self, value: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def int(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def lt(self, value: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def lte(self, value: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def multipleOf(self, value: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def negative(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def nonnegative(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def nonpositive(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def positive(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def safe(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...

class ZodObject['T extends ZodRawShape', 'UnknownKeys extends UnknownKeysParam = UnknownKeysParam', 'Catchall extends ZodTypeAny = ZodTypeAny', 'Output = objectOutputType[T, Catchall, UnknownKeys]', 'Input = objectInputType[T, Catchall, UnknownKeys]'](ZodType[Output, ZodObjectDef[T, UnknownKeys, Catchall], Input]):
    _cached: '{ shape: T; keys: string[] } | null'
    augment: '<inferred>'
    nonstrict: '<inferred>'
    shape: Readonly['<inferred>']
    def _getCached(self) -> '{ shape: T; keys: string[] }': ...
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    def catchall['Index extends ZodTypeAny'](
        self,
        index: Index,
    ) -> ZodObject[T, UnknownKeys, Index]: ...
    @staticmethod
    def create['Shape extends ZodRawShape'](
        shape: Shape,
        params: RawCreateParams = ...,
    ) -> '<ZodObject[Shape, "strip", ZodTypeAny, … (128 chars, #bdf1abd3)>': ...
    def deepPartial(self) -> partialUtil.DeepPartial[this]: ...
    def extend['Augmentation extends ZodRawShape'](
        self,
        augmentation: Augmentation,
    ) -> ZodObject[objectUtil.extendShape[T, Augmentation], UnknownKeys, Catchall]: ...
    def keyof(self) -> 'ZodEnum[enumUtil.UnionToTupleString[keyof T]]': ...
    @staticmethod
    def lazycreate['Shape extends ZodRawShape'](
        shape: '() => Shape',
        params: RawCreateParams = ...,
    ) -> ZodObject[Shape, "strip"]: ...
    def merge['Incoming extends AnyZodObject', 'Augmentation extends Incoming["shape"]'](
        self,
        merging: Incoming,
    ) -> 'ZodObject[objectUtil.extendShape[T, Augmentation], Incoming["_def"]["unknownKeys"], Incoming["_def"]["catchall"]]': ...
    def omit['Mask extends util.Exactly[{ [k in keyof T]?: true }, Mask]'](
        self,
        mask: Mask,
    ) -> 'ZodObject[Omit[T, keyof Mask], UnknownKeys, Catchall]': ...
    @overload
    def partial(
        self,
    ) -> 'ZodObject[{ [k in keyof T]: ZodOptional[T[k]] }, UnknownKeys, Catchall]': ...
    @overload
    def partial['Mask extends util.Exactly[{ [k in keyof T]?: true }, Mask]'](
        self,
        mask: Mask,
    ) -> '<ZodObject[objectUtil.noNever[{ [k in keyof T]: k extends … (121 chars, #f52956b1)>': ...
    def passthrough(self) -> ZodObject[T, "passthrough", Catchall]: ...
    def pick['Mask extends util.Exactly[{ [k in keyof T]?: true }, Mask]'](
        self,
        mask: Mask,
    ) -> 'ZodObject[Pick[T, Extract[keyof T, keyof Mask]], UnknownKeys, Catchall]': ...
    @overload
    def required(
        self,
    ) -> 'ZodObject[{ [k in keyof T]: deoptional[T[k]] }, UnknownKeys, Catchall]': ...
    @overload
    def required['Mask extends util.Exactly[{ [k in keyof T]?: true }, Mask]'](
        self,
        mask: Mask,
    ) -> 'ZodObject[objectUtil.noNever[{ [k in keyof T]: k extends keyof Mask ? deoptional[T[k]] : T[k] }], UnknownKeys, Catchall]': ...
    def setKey['Key extends string', 'Schema extends ZodTypeAny'](
        self,
        key: Key,
        schema: Schema,
    ) -> 'ZodObject[T & { [k in Key]: Schema }, UnknownKeys, Catchall]': ...
    def strict(self, message: errorUtil.ErrMessage = ...) -> ZodObject[T, "strict", Catchall]: ...
    @staticmethod
    def strictCreate['Shape extends ZodRawShape'](
        shape: Shape,
        params: RawCreateParams = ...,
    ) -> ZodObject[Shape, "strict"]: ...
    def strip(self) -> ZodObject[T, "strip", Catchall]: ...

class ZodOptional['T extends ZodTypeAny'](ZodType[T["_output"] | undefined, ZodOptionalDef[T], T["_input"] | undefined]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Inner extends ZodTypeAny'](
        type: Inner,
        params: RawCreateParams = ...,
    ) -> ZodOptional[Inner]: ...
    def unwrap(self) -> '<inferred>': ...

class ZodPipeline['A extends ZodTypeAny', 'B extends ZodTypeAny'](ZodType[B["_output"], ZodPipelineDef[A, B], A["_input"]]):
    def _parse(self, input: ParseInput) -> ParseReturnType[any]: ...
    @staticmethod
    def create['ASchema extends ZodTypeAny', 'BSchema extends ZodTypeAny'](
        a: ASchema,
        b: BSchema,
    ) -> ZodPipeline[ASchema, BSchema]: ...

class ZodPromise['T extends ZodTypeAny'](ZodType[Promise[T["_output"]], ZodPromiseDef[T], Promise[T["_input"]]]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Inner extends ZodTypeAny'](
        schema: Inner,
        params: RawCreateParams = ...,
    ) -> ZodPromise[Inner]: ...
    def unwrap(self) -> '<inferred>': ...

class ZodReadonly['T extends ZodTypeAny'](ZodType[MakeReadonly[T["_output"]], ZodReadonlyDef[T], MakeReadonly[T["_input"]]]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Inner extends ZodTypeAny'](
        type: Inner,
        params: RawCreateParams = ...,
    ) -> ZodReadonly[Inner]: ...
    def unwrap(self) -> '<inferred>': ...

class ZodRecord['Key extends KeySchema = ZodString', 'Value extends ZodTypeAny = ZodTypeAny'](ZodType[RecordType[Key["_output"], Value["_output"]], ZodRecordDef[Key, Value], RecordType[Key["_input"], Value["_input"]]]):
    element: Readonly['<inferred>']
    keySchema: Readonly['<inferred>']
    valueSchema: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    @overload
    def create['Value extends ZodTypeAny'](
        valueType: Value,
        params: RawCreateParams = ...,
    ) -> ZodRecord[ZodString, Value]: ...
    @staticmethod
    @overload
    def create['Keys extends KeySchema', 'Value extends ZodTypeAny'](
        keySchema: Keys,
        valueType: Value,
        params: RawCreateParams = ...,
    ) -> ZodRecord[Keys, Value]: ...

class ZodSchema['Output = any', 'Def extends ZodTypeDef = ZodTypeDef', 'Input = Output']:
    _def: Readonly[Def]
    _input: Readonly[Input]
    _output: Readonly[Output]
    _type: Readonly[Output]
    description: Readonly[string | undefined]
    spa: '<inferred>'
    self["~standard"]: StandardSchemaV1.Props[Input, Output]
    def __init__(self, def_: Def): ...
    def _getOrReturnCtx(
        self,
        input: ParseInput,
        ctx: ParseContext | undefined = ...,
    ) -> ParseContext: ...
    def _getType(self, input: ParseInput) -> string: ...
    @abstractmethod
    def _parse(self, input: ParseInput) -> ParseReturnType[Output]: ...
    def _parseAsync(self, input: ParseInput) -> AsyncParseReturnType[Output]: ...
    def _parseSync(self, input: ParseInput) -> SyncParseReturnType[Output]: ...
    def _processInputParams(
        self,
        input: ParseInput,
    ) -> '{ status: ParseStatus; ctx: ParseContext }': ...
    def _refinement(
        self,
        refinement: 'RefinementEffect[Output]["refinement"]',
    ) -> ZodEffects[this, Output, Input]: ...
    def _validate(
        self,
        data: unknown,
    ) -> StandardSchemaV1.Result[Output] | Promise[StandardSchemaV1.Result[Output]]: ...
    def and_['T extends ZodTypeAny'](self, incoming: T) -> ZodIntersection[this, T]: ...
    def array(self) -> ZodArray[this]: ...
    def brand['B extends string | number | symbol'](
        self,
        brand: B = ...,
    ) -> ZodBranded[this, B]: ...
    @overload
    def catch(self, def_: Output) -> ZodCatch[this]: ...
    @overload
    def catch(
        self,
        def_: '(ctx: { error: ZodError; input: Input }) => Output',
    ) -> ZodCatch[this]: ...
    @overload
    def default(self, def_: util.noUndefined[Input]) -> ZodDefault[this]: ...
    @overload
    def default(self, def_: '() => util.noUndefined[Input]') -> ZodDefault[this]: ...
    def describe(self, description: string) -> this: ...
    def isNullable(self) -> boolean: ...
    def isOptional(self) -> boolean: ...
    def nullable(self) -> ZodNullable[this]: ...
    def nullish(self) -> ZodOptional[ZodNullable[this]]: ...
    def optional(self) -> ZodOptional[this]: ...
    def or_['T extends ZodTypeAny'](self, option: T) -> ZodUnion[[this, T]]: ...
    def parse(self, data: unknown, params: util.InexactPartial[ParseParams] = ...) -> Output: ...
    async def parseAsync(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> Promise[Output]: ...
    def pipe['T extends ZodTypeAny'](self, target: T) -> ZodPipeline[this, T]: ...
    def promise(self) -> ZodPromise[this]: ...
    def readonly(self) -> ZodReadonly[this]: ...
    @overload
    def refine['RefinedOutput extends Output'](
        self,
        check: '(arg: Output) => arg is RefinedOutput',
        message: 'string | CustomErrorParams | ((arg: Output) => CustomErrorParams)' = ...,
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def refine(
        self,
        check: '(arg: Output) => unknown | Promise[unknown]',
        message: 'string | CustomErrorParams | ((arg: Output) => CustomErrorParams)' = ...,
    ) -> ZodEffects[this, Output, Input]: ...
    @overload
    def refinement['RefinedOutput extends Output'](
        self,
        check: '(arg: Output) => arg is RefinedOutput',
        refinementData: 'IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)',
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def refinement(
        self,
        check: '(arg: Output) => boolean',
        refinementData: 'IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)',
    ) -> ZodEffects[this, Output, Input]: ...
    def safeParse(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> SafeParseReturnType[Input, Output]: ...
    async def safeParseAsync(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> Promise[SafeParseReturnType[Input, Output]]: ...
    @overload
    def superRefine['RefinedOutput extends Output'](
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => arg is RefinedOutput',
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def superRefine(
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => void',
    ) -> ZodEffects[this, Output, Input]: ...
    @overload
    def superRefine(
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => Promise[void]',
    ) -> ZodEffects[this, Output, Input]: ...
    def transform[NewOut](
        self,
        transform: '(arg: Output, ctx: RefinementCtx) => NewOut | Promise[NewOut]',
    ) -> ZodEffects[this, NewOut]: ...

class ZodSet['Value extends ZodTypeAny = ZodTypeAny'](ZodType[Set[Value["_output"]], ZodSetDef[Value], Set[Value["_input"]]]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['ValueSchema extends ZodTypeAny = ZodTypeAny'](
        valueType: ValueSchema,
        params: RawCreateParams = ...,
    ) -> ZodSet[ValueSchema]: ...
    def max(self, maxSize: number, message: errorUtil.ErrMessage = ...) -> this: ...
    def min(self, minSize: number, message: errorUtil.ErrMessage = ...) -> this: ...
    def nonempty(self, message: errorUtil.ErrMessage = ...) -> ZodSet[Value]: ...
    def size(self, size: number, message: errorUtil.ErrMessage = ...) -> this: ...

class ZodString(ZodType[string, ZodStringDef, string]):
    isBase64: Readonly['<inferred>']
    isBase64url: Readonly['<inferred>']
    isCIDR: Readonly['<inferred>']
    isCUID: Readonly['<inferred>']
    isCUID2: Readonly['<inferred>']
    isDate: Readonly['<inferred>']
    isDatetime: Readonly['<inferred>']
    isDuration: Readonly['<inferred>']
    isEmail: Readonly['<inferred>']
    isEmoji: Readonly['<inferred>']
    isIP: Readonly['<inferred>']
    isNANOID: Readonly['<inferred>']
    isTime: Readonly['<inferred>']
    isULID: Readonly['<inferred>']
    isURL: Readonly['<inferred>']
    isUUID: Readonly['<inferred>']
    maxLength: Readonly['<inferred>']
    minLength: Readonly['<inferred>']
    def _addCheck(self, check: ZodStringCheck) -> '<inferred>': ...
    def _parse(self, input: ParseInput) -> ParseReturnType[string]: ...
    def base64(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def base64url(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def cidr(
        self,
        options: 'string | { version?: IpVersion; message?: string | undefined }' = ...,
    ) -> '<inferred>': ...
    @staticmethod
    def create(params: 'RawCreateParams & { coerce?: true }' = ...) -> ZodString: ...
    def cuid(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def cuid2(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def date(self, message: string = ...) -> '<inferred>': ...
    def datetime(
        self,
        options: 'string | { message?: string | undefined; precision?: number | null; offset?: boolean; local?: boolean }' = ...,
    ) -> '<inferred>': ...
    def duration(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def email(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def emoji(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def endsWith(self, value: string, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def includes(
        self,
        value: string,
        options: '{ message?: string; position?: number }' = ...,
    ) -> '<inferred>': ...
    def ip(
        self,
        options: 'string | { version?: IpVersion; message?: string | undefined }' = ...,
    ) -> '<inferred>': ...
    def jwt(
        self,
        options: '{ alg?: string; message?: string | undefined }' = ...,
    ) -> '<inferred>': ...
    def length(self, len: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def max(self, maxLength: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def min(self, minLength: number, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def nanoid(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def nonempty(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def regex(self, regex: RegExp, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def startsWith(self, value: string, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def time(
        self,
        options: 'string | { message?: string | undefined; precision?: number | null }' = ...,
    ) -> '<inferred>': ...
    def toLowerCase(self) -> '<inferred>': ...
    def toUpperCase(self) -> '<inferred>': ...
    def trim(self) -> '<inferred>': ...
    def ulid(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def url(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...
    def uuid(self, message: errorUtil.ErrMessage = ...) -> '<inferred>': ...

class ZodSymbol(ZodType[symbol, ZodSymbolDef, symbol]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodSymbol: ...

class ZodTransformer['T extends ZodTypeAny', 'Output = output[T]', 'Input = input[T]'](ZodType[Output, ZodEffectsDef[T], Input]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['I extends ZodTypeAny'](
        schema: I,
        effect: Effect[I["_output"]],
        params: RawCreateParams = ...,
    ) -> ZodEffects[I, I["_output"]]: ...
    @staticmethod
    def createWithPreprocess['I extends ZodTypeAny'](
        preprocess: '(arg: unknown, ctx: RefinementCtx) => unknown',
        schema: I,
        params: RawCreateParams = ...,
    ) -> ZodEffects[I, I["_output"], unknown]: ...
    def innerType(self) -> '<inferred>': ...
    def sourceType(self) -> T: ...

class ZodTuple['T extends ZodTupleItems | [] = ZodTupleItems', 'Rest extends ZodTypeAny | null = null'](ZodType[OutputTypeOfTupleWithRest[T, Rest], ZodTupleDef[T, Rest], InputTypeOfTupleWithRest[T, Rest]]):
    items: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Items extends [ZodTypeAny, ...ZodTypeAny[]] | []'](
        schemas: Items,
        params: RawCreateParams = ...,
    ) -> ZodTuple[Items, null]: ...
    def rest['RestSchema extends ZodTypeAny'](
        self,
        rest: RestSchema,
    ) -> ZodTuple[T, RestSchema]: ...

class ZodType['Output = any', 'Def extends ZodTypeDef = ZodTypeDef', 'Input = Output']:
    _def: Readonly[Def]
    _input: Readonly[Input]
    _output: Readonly[Output]
    _type: Readonly[Output]
    description: Readonly[string | undefined]
    spa: '<inferred>'
    self["~standard"]: StandardSchemaV1.Props[Input, Output]
    def __init__(self, def_: Def): ...
    def _getOrReturnCtx(
        self,
        input: ParseInput,
        ctx: ParseContext | undefined = ...,
    ) -> ParseContext: ...
    def _getType(self, input: ParseInput) -> string: ...
    @abstractmethod
    def _parse(self, input: ParseInput) -> ParseReturnType[Output]: ...
    def _parseAsync(self, input: ParseInput) -> AsyncParseReturnType[Output]: ...
    def _parseSync(self, input: ParseInput) -> SyncParseReturnType[Output]: ...
    def _processInputParams(
        self,
        input: ParseInput,
    ) -> '{ status: ParseStatus; ctx: ParseContext }': ...
    def _refinement(
        self,
        refinement: 'RefinementEffect[Output]["refinement"]',
    ) -> ZodEffects[this, Output, Input]: ...
    def _validate(
        self,
        data: unknown,
    ) -> StandardSchemaV1.Result[Output] | Promise[StandardSchemaV1.Result[Output]]: ...
    def and_['T extends ZodTypeAny'](self, incoming: T) -> ZodIntersection[this, T]: ...
    def array(self) -> ZodArray[this]: ...
    def brand['B extends string | number | symbol'](
        self,
        brand: B = ...,
    ) -> ZodBranded[this, B]: ...
    @overload
    def catch(self, def_: Output) -> ZodCatch[this]: ...
    @overload
    def catch(
        self,
        def_: '(ctx: { error: ZodError; input: Input }) => Output',
    ) -> ZodCatch[this]: ...
    @overload
    def default(self, def_: util.noUndefined[Input]) -> ZodDefault[this]: ...
    @overload
    def default(self, def_: '() => util.noUndefined[Input]') -> ZodDefault[this]: ...
    def describe(self, description: string) -> this: ...
    def isNullable(self) -> boolean: ...
    def isOptional(self) -> boolean: ...
    def nullable(self) -> ZodNullable[this]: ...
    def nullish(self) -> ZodOptional[ZodNullable[this]]: ...
    def optional(self) -> ZodOptional[this]: ...
    def or_['T extends ZodTypeAny'](self, option: T) -> ZodUnion[[this, T]]: ...
    def parse(self, data: unknown, params: util.InexactPartial[ParseParams] = ...) -> Output: ...
    async def parseAsync(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> Promise[Output]: ...
    def pipe['T extends ZodTypeAny'](self, target: T) -> ZodPipeline[this, T]: ...
    def promise(self) -> ZodPromise[this]: ...
    def readonly(self) -> ZodReadonly[this]: ...
    @overload
    def refine['RefinedOutput extends Output'](
        self,
        check: '(arg: Output) => arg is RefinedOutput',
        message: 'string | CustomErrorParams | ((arg: Output) => CustomErrorParams)' = ...,
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def refine(
        self,
        check: '(arg: Output) => unknown | Promise[unknown]',
        message: 'string | CustomErrorParams | ((arg: Output) => CustomErrorParams)' = ...,
    ) -> ZodEffects[this, Output, Input]: ...
    @overload
    def refinement['RefinedOutput extends Output'](
        self,
        check: '(arg: Output) => arg is RefinedOutput',
        refinementData: 'IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)',
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def refinement(
        self,
        check: '(arg: Output) => boolean',
        refinementData: 'IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)',
    ) -> ZodEffects[this, Output, Input]: ...
    def safeParse(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> SafeParseReturnType[Input, Output]: ...
    async def safeParseAsync(
        self,
        data: unknown,
        params: util.InexactPartial[ParseParams] = ...,
    ) -> Promise[SafeParseReturnType[Input, Output]]: ...
    @overload
    def superRefine['RefinedOutput extends Output'](
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => arg is RefinedOutput',
    ) -> ZodEffects[this, RefinedOutput, Input]: ...
    @overload
    def superRefine(
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => void',
    ) -> ZodEffects[this, Output, Input]: ...
    @overload
    def superRefine(
        self,
        refinement: '(arg: Output, ctx: RefinementCtx) => Promise[void]',
    ) -> ZodEffects[this, Output, Input]: ...
    def transform[NewOut](
        self,
        transform: '(arg: Output, ctx: RefinementCtx) => NewOut | Promise[NewOut]',
    ) -> ZodEffects[this, NewOut]: ...

class ZodUndefined(ZodType[undefined, ZodUndefinedDef, undefined]):
    params: Opt[RawCreateParams]
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodUndefined: ...

class ZodUnion['T extends ZodUnionOptions']('ZodType[T[number]["_output"], ZodUnionDef[T], T[number]["_input"]]'):
    options: Readonly['<inferred>']
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create['Options extends Readonly[[ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]]'](
        types: Options,
        params: RawCreateParams = ...,
    ) -> ZodUnion[Options]: ...

class ZodUnknown(ZodType[unknown, ZodUnknownDef, unknown]):
    _unknown: '<inferred>'
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodUnknown: ...

class ZodVoid(ZodType[void, ZodVoidDef, void]):
    def _parse(self, input: ParseInput) -> ParseReturnType[this["_output"]]: ...
    @staticmethod
    def create(params: RawCreateParams = ...) -> ZodVoid: ...

def addIssueToContext(ctx: ParseContext, issueData: IssueData) -> void: ...

def custom[T](
    check: '(data: any) => any' = ...,
    _params: 'string | CustomParams | ((input: any) => CustomParams)' = ...,
    fatal: boolean = ...,
) -> ZodType[T, ZodTypeDef, T]: ...

def datetimeRegex(
    args: '{ precision?: number | null; offset?: boolean; local?: boolean }',
) -> '<inferred>': ...

def DIRTY[T](value: T) -> DIRTY[T]: ...
def getErrorMap() -> '<inferred>': ...
def getParsedType(data: any) -> ZodParsedType: ...
def instanceof['T extends typeof Class'](cls: T, params: CustomParams = ...) -> '<inferred>': ...
def isAborted(x: ParseReturnType[any]) -> 'x is INVALID': ...
def isAsync[T](x: ParseReturnType[T]) -> 'x is AsyncParseReturnType[T]': ...
def isDirty[T](x: ParseReturnType[T]) -> 'x is OK[T] | DIRTY[T]': ...
def isValid[T](x: ParseReturnType[T]) -> 'x is OK[T]': ...

def makeIssue(
    params: '{ data: any; path: (string | number)[]; errorMaps: ZodErrorMap[]; issueData: IssueData }',
) -> ZodIssue: ...

def oboolean() -> '<inferred>': ...
def OK[T](value: T) -> OK[T]: ...
def onumber() -> '<inferred>': ...
def ostring() -> '<inferred>': ...
def quotelessJson(obj: any) -> '<inferred>': ...
def setErrorMap(map: ZodErrorMap) -> '<inferred>': ...

any: '<inferred>'
array: '<inferred>'
bigint: '<inferred>'
boolean: '<inferred>'
BRAND: 'unique symbol'
coerce: '<inferred>'
date: '<inferred>'
default: namespace
defaultErrorMap: ZodErrorMap
discriminatedUnion: '<inferred>'
effect: '<inferred>'
EMPTY_PATH: ParsePath
enum: '<inferred>'
function: '<inferred>'
intersection: '<inferred>'
INVALID: INVALID
late: '<inferred>'
lazy: '<inferred>'
literal: '<inferred>'
map: '<inferred>'
nan: '<inferred>'
nativeEnum: '<inferred>'
NEVER: '<inferred>'
never: '<inferred>'
null: '<inferred>'
nullable: '<inferred>'
number: '<inferred>'
object: '<inferred>'
objectUtil: namespace
optional: '<inferred>'
pipeline: '<inferred>'
preprocess: '<inferred>'
promise: '<inferred>'
record: '<inferred>'
set: '<inferred>'
strictObject: '<inferred>'
string: '<inferred>'
symbol: '<inferred>'
transformer: '<inferred>'
tuple: '<inferred>'
undefined: '<inferred>'
union: '<inferred>'
unknown: '<inferred>'
util: namespace
void: '<inferred>'
z: namespace
ZodIssueCode: '<inferred>'
ZodParsedType: '<{ string: "string"; nan: "nan"; number: "number"; integer: … (344 chars, #91f80e57)>'
