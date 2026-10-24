"""Zod 4 classic API: chainable methods like z.string().min(1) (what import "zod" gives you)."""

__module__ = "zod.classic"
__paths__ = ["packages/zod/src/v4/classic/**"]
__entry__ = "packages/zod/src/v4/classic/index.ts"
__depends_on__ = ["zod.core", "zod.locales"]

from .zod.core import (
    _brand,
    _input,
    _output,
    clone,
    compile,
    CompileOptions,
    config,
    core,
    endsWith,
    flattenError,
    formatError,
    getDiscriminatedOption,
    GlobalMeta,
    globalRegistry,
    gt,
    gte,
    includes,
    infer,
    INVALID,
    JSONType,
    length,
    lowercase,
    lt,
    lte,
    maxLength,
    maxSize,
    memoizer,
    mime,
    minLength,
    minSize,
    multipleOf,
    negative,
    NEVER,
    nonnegative,
    nonpositive,
    normalize,
    overwrite,
    positive,
    prettifyError,
    properties,
    property,
    RefinementCtx,
    regex,
    regexes,
    registry,
    size,
    slugify,
    startsWith,
    TimePrecision,
    toJSONSchema,
    toLowerCase,
    toUpperCase,
    toZod,
    treeifyError,
    trim,
    uppercase,
    util,
    validate,
    validateAsync,
    withParser,
    ZodCompileAsyncError,
    ZodCompileUnsupportedError,
)
from .zod.locales import locales

class ZodFirstPartyTypeKind(Enum): ...

BRAND: TypeAlias['T extends string | number | symbol = string | number | symbol'] = '{ [core.$brand]: { [k in T]: true } }'
Infer: TypeAlias[T] = core.output[T]
inferFlattenedErrors: TypeAlias['T extends core.$ZodType', 'U = string'] = 'core.$ZodFlattenedError[core.output[T], U]'
inferFormattedError: TypeAlias['T extends core.$ZodType[any, any]', 'U = string'] = 'core.$ZodFormattedError[core.output[T], U]'
input: TypeAlias[T] = core.input[T]
IssueData: TypeAlias = 'core.$ZodRawIssue'
output: TypeAlias[T] = core.output[T]
SafeExtendShape: TypeAlias['Base extends core.$ZodShape', 'Ext extends core.$ZodLooseShape'] = '<{ [K in keyof Ext]: K extends keyof Base ? … (176 chars, #ac948a3c)>'
Schema: TypeAlias['Output = unknown', 'Input = unknown', 'Internals extends core.$ZodTypeInternals[Output, Input] = core.$ZodTypeInternals[Output, Input]'] = ZodType[Output, Input, Internals]
TypeOf: TypeAlias[T] = core.output[T]
ZodErrorMap: TypeAlias['T extends core.$ZodIssueBase = core.$ZodIssue'] = 'core.$ZodErrorMap[T]'
ZodFirstPartySchemaTypes: TypeAlias = 'core.$ZodTypes'
ZodFlattenedError: TypeAlias[T, 'U = string'] = 'core.$ZodFlattenedError[T, U]'
ZodFormattedError: TypeAlias[T, 'U = string'] = 'core.$ZodFormattedError[T, U]'
ZodIssue: TypeAlias = 'core.$ZodIssue'
ZodRawShape: TypeAlias = 'core.$ZodShape'
ZodSafeParseError: TypeAlias[T] = '{ success: false; data?: never; error: ZodError[T] }'
ZodSafeParseResult: TypeAlias[T] = ZodSafeParseSuccess[T] | ZodSafeParseError[T]
ZodSafeParseSuccess: TypeAlias[T] = '{ success: true; data: T; error?: never }'
ZodSchema: TypeAlias['Output = unknown', 'Input = unknown', 'Internals extends core.$ZodTypeInternals[Output, Input] = core.$ZodTypeInternals[Output, Input]'] = ZodType[Output, Input, Internals]
ZodStandardSchemaWithJSON: TypeAlias[T] = StandardSchemaWithJSONProps[core.input[T], core.output[T]]
ZodTypeAny: TypeAlias['Output = unknown', 'Input = unknown', 'Internals extends core.$ZodTypeInternals[Output, Input] = core.$ZodTypeInternals[Output, Input]'] = ZodType[Output, Input, Internals]

class _ZodBigInt['T extends core.$ZodBigIntInternals = core.$ZodBigIntInternals'](_ZodType[T], Protocol):
    format: string | null
    maxValue: bigint | null
    minValue: bigint | null
    def gt(
        self,
        value: bigint,
        params: 'string | core.$ZodCheckGreaterThanParams' = ...,
    ) -> this: ...
    def gte(
        self,
        value: bigint,
        params: 'string | core.$ZodCheckGreaterThanParams' = ...,
    ) -> this: ...
    def lt(self, value: bigint, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def lte(self, value: bigint, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def max(self, value: bigint, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def min(
        self,
        value: bigint,
        params: 'string | core.$ZodCheckGreaterThanParams' = ...,
    ) -> this: ...
    def multipleOf(
        self,
        value: bigint,
        params: 'string | core.$ZodCheckMultipleOfParams' = ...,
    ) -> this: ...
    def negative(self, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def nonnegative(self, params: 'string | core.$ZodCheckGreaterThanParams' = ...) -> this: ...
    def nonpositive(self, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def positive(self, params: 'string | core.$ZodCheckGreaterThanParams' = ...) -> this: ...

class _ZodBoolean['T extends core.$ZodBooleanInternals = core.$ZodBooleanInternals'](_ZodType[T], Protocol): ...

class _ZodDate['T extends core.$ZodDateInternals = core.$ZodDateInternals'](_ZodType[T], Protocol):
    maxDate: Date | null
    minDate: Date | null
    def max(
        self,
        value: number | Date,
        params: 'string | core.$ZodCheckLessThanParams' = ...,
    ) -> this: ...
    def min(
        self,
        value: number | Date,
        params: 'string | core.$ZodCheckGreaterThanParams' = ...,
    ) -> this: ...

class _ZodNumber['Internals extends core.$ZodNumberInternals = core.$ZodNumberInternals'](_ZodType[Internals], Protocol):
    format: string | null
    isFinite: boolean
    isInt: boolean
    maxValue: number | null
    minValue: number | null
    def finite(self, params: unknown = ...) -> this: ...
    def gt(
        self,
        value: number,
        params: 'string | core.$ZodCheckGreaterThanParams' = ...,
    ) -> this: ...
    def gte(
        self,
        value: number,
        params: 'string | core.$ZodCheckGreaterThanParams' = ...,
    ) -> this: ...
    def int(self, params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> this: ...
    def lt(self, value: number, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def lte(self, value: number, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def max(self, value: number, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def min(
        self,
        value: number,
        params: 'string | core.$ZodCheckGreaterThanParams' = ...,
    ) -> this: ...
    def multipleOf(
        self,
        value: number,
        params: 'string | core.$ZodCheckMultipleOfParams' = ...,
    ) -> this: ...
    def negative(self, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def nonnegative(self, params: 'string | core.$ZodCheckGreaterThanParams' = ...) -> this: ...
    def nonpositive(self, params: 'string | core.$ZodCheckLessThanParams' = ...) -> this: ...
    def positive(self, params: 'string | core.$ZodCheckGreaterThanParams' = ...) -> this: ...
    def safe(self, params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> this: ...
    def step(
        self,
        value: number,
        params: 'string | core.$ZodCheckMultipleOfParams' = ...,
    ) -> this: ...

class _ZodString['T extends core.$ZodStringInternals[unknown] = core.$ZodStringInternals[unknown]'](_ZodType[T], Protocol):
    format: string | null
    maxLength: number | null
    minLength: number | null
    def endsWith(
        self,
        value: string,
        params: 'string | core.$ZodCheckEndsWithParams' = ...,
    ) -> this: ...
    def includes(
        self,
        value: string,
        params: 'string | core.$ZodCheckIncludesParams' = ...,
    ) -> this: ...
    def length(
        self,
        len: number,
        params: 'string | core.$ZodCheckLengthEqualsParams' = ...,
    ) -> this: ...
    def lowercase(self, params: 'string | core.$ZodCheckLowerCaseParams' = ...) -> this: ...
    def max(
        self,
        maxLength: number,
        params: 'string | core.$ZodCheckMaxLengthParams' = ...,
    ) -> this: ...
    def min(
        self,
        minLength: number,
        params: 'string | core.$ZodCheckMinLengthParams' = ...,
    ) -> this: ...
    def nonempty(self, params: 'string | core.$ZodCheckMinLengthParams' = ...) -> this: ...
    def normalize(self, form: '"NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})' = ...) -> this: ...
    def regex(self, regex: RegExp, params: 'string | core.$ZodCheckRegexParams' = ...) -> this: ...
    def slugify(self) -> this: ...
    def startsWith(
        self,
        value: string,
        params: 'string | core.$ZodCheckStartsWithParams' = ...,
    ) -> this: ...
    def toLowerCase(self) -> this: ...
    def toUpperCase(self) -> this: ...
    def trim(self) -> this: ...
    def uppercase(self, params: 'string | core.$ZodCheckUpperCaseParams' = ...) -> this: ...

class _ZodType['out Internals extends core.$ZodTypeInternals = core.$ZodTypeInternals'](ZodType[any, any, Internals], Protocol): ...
class ZodAny('_ZodType[core.$ZodAnyInternals]', Protocol): ...

class ZodArray['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodArrayInternals[T]]', 'core.$ZodArray[T]', Protocol):
    element: T
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def length(
        self,
        len: number,
        params: 'string | core.$ZodCheckLengthEqualsParams' = ...,
    ) -> this: ...
    def max(
        self,
        maxLength: number,
        params: 'string | core.$ZodCheckMaxLengthParams' = ...,
    ) -> this: ...
    def min(
        self,
        minLength: number,
        params: 'string | core.$ZodCheckMinLengthParams' = ...,
    ) -> this: ...
    def nonempty(self, params: 'string | core.$ZodCheckMinLengthParams' = ...) -> this: ...
    def unwrap(self) -> T: ...

class ZodBase64(ZodStringFormat["base64"], Protocol):
    _zod: 'core.$ZodBase64Internals'

class ZodBase64URL(ZodStringFormat["base64url"], Protocol):
    _zod: 'core.$ZodBase64URLInternals'

class ZodBigInt('_ZodBigInt[core.$ZodBigIntInternals[bigint]]', Protocol): ...

class ZodBigIntFormat['Format extends $ZodBigIntFormats = $ZodBigIntFormats'](ZodBigInt, Protocol):
    _zod: 'core.$ZodBigIntFormatInternals[Format]'

class ZodBoolean('_ZodBoolean[core.$ZodBooleanInternals[boolean]]', Protocol): ...

class ZodCatch['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodCatchInternals[T]]', 'core.$ZodCatch[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def removeCatch(self) -> T: ...
    def unwrap(self) -> T: ...

class ZodCIDRv4(ZodStringFormat["cidrv4"], Protocol):
    _zod: 'core.$ZodCIDRv4Internals'

class ZodCIDRv6(ZodStringFormat["cidrv6"], Protocol):
    _zod: 'core.$ZodCIDRv6Internals'

class ZodCodec['A extends core.SomeType = core.$ZodType', 'B extends core.SomeType = core.$ZodType'](ZodPipe[A, B], 'core.$ZodCodec[A, B]', Protocol):
    _zod: 'core.$ZodCodecInternals[A, B]'
    self["def"]: 'core.$ZodCodecDef[A, B]'
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodCoercedBigInt['T = unknown']('schemas._ZodBigInt[core.$ZodBigIntInternals[T]]', Protocol): ...
class ZodCoercedBoolean['T = unknown']('schemas._ZodBoolean[core.$ZodBooleanInternals[T]]', Protocol): ...
class ZodCoercedDate['T = unknown']('schemas._ZodDate[core.$ZodDateInternals[T]]', Protocol): ...
class ZodCoercedNumber['T = unknown']('schemas._ZodNumber[core.$ZodNumberInternals[T]]', Protocol): ...
class ZodCoercedString['T = unknown']('schemas._ZodString[core.$ZodStringInternals[T]]', Protocol): ...

class ZodCreditCard(ZodStringFormat["credit_card"], Protocol):
    _zod: 'core.$ZodCreditCardInternals'

class ZodCUID(ZodStringFormat["cuid"], Protocol):
    _zod: 'core.$ZodCUIDInternals'

class ZodCUID2(ZodStringFormat["cuid2"], Protocol):
    _zod: 'core.$ZodCUID2Internals'

class ZodCustom['O = unknown', 'I = unknown']('_ZodType[core.$ZodCustomInternals[O, I]]', 'core.$ZodCustom[O, I]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodCustomStringFormat['Format extends string = string'](ZodStringFormat[Format], 'core.$ZodCustomStringFormat[Format]', Protocol):
    _zod: 'core.$ZodCustomStringFormatInternals[Format]'
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodDate('_ZodDate[core.$ZodDateInternals[Date]]', Protocol): ...

class ZodDefault['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodDefaultInternals[T]]', 'core.$ZodDefault[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def removeDefault(self) -> T: ...
    def unwrap(self) -> T: ...

class ZodDiscriminatedUnion['Options extends readonly core.SomeType[] = readonly core.$ZodType[]', 'Disc extends string = string'](ZodUnion[Options], 'core.$ZodDiscriminatedUnion[Options, Disc]', Protocol):
    _zod: 'core.$ZodDiscriminatedUnionInternals[Options, Disc]'
    self["def"]: 'core.$ZodDiscriminatedUnionDef[Options, Disc]'
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodE164(ZodStringFormat["e164"], Protocol):
    _zod: 'core.$ZodE164Internals'

class ZodEmail(ZodStringFormat["email"], Protocol):
    _zod: 'core.$ZodEmailInternals'

class ZodEmoji(ZodStringFormat["emoji"], Protocol):
    _zod: 'core.$ZodEmojiInternals'

class ZodEnum['out T extends util.EnumLike = util.EnumLike']('_ZodType[core.$ZodEnumInternals[T]]', 'core.$ZodEnum[T]', Protocol):
    enum: T
    options: 'Array[T[keyof T]]'
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def exclude['const U extends readonly (keyof T)[]'](
        self,
        values: U,
        params: 'string | core.$ZodEnumParams' = ...,
    ) -> ZodEnum[util.Flatten[Omit[T, U[number]]]]: ...
    def extract['const U extends readonly (keyof T)[]'](
        self,
        values: U,
        params: 'string | core.$ZodEnumParams' = ...,
    ) -> ZodEnum[util.Flatten[Pick[T, U[number]]]]: ...

class ZodError['T = unknown']('$ZodError[T]', Protocol):
    isEmpty: boolean
    def addIssue(self, issue: 'core.$ZodIssue') -> void: ...
    def addIssues(self, issues: 'core.$ZodIssue[]') -> void: ...
    @overload
    def flatten(self) -> 'core.$ZodFlattenedError[T]': ...
    @overload
    def flatten[U](
        self,
        mapper: '(issue: core.$ZodIssue) => U',
    ) -> 'core.$ZodFlattenedError[T, U]': ...
    @overload
    def format(self) -> 'core.$ZodFormattedError[T]': ...
    @overload
    def format[U](
        self,
        mapper: '(issue: core.$ZodIssue) => U',
    ) -> 'core.$ZodFormattedError[T, U]': ...

class ZodExactOptional['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodExactOptionalInternals[T]]', 'core.$ZodExactOptional[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodFile('_ZodType[core.$ZodFileInternals]', 'core.$ZodFile', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def max(self, size: number, params: 'string | core.$ZodCheckMaxSizeParams' = ...) -> this: ...
    def mime(
        self,
        types: util.MimeTypes | Array[util.MimeTypes],
        params: 'string | core.$ZodCheckMimeTypeParams' = ...,
    ) -> this: ...
    def min(self, size: number, params: 'string | core.$ZodCheckMinSizeParams' = ...) -> this: ...

class ZodFloat32(ZodNumberFormat["float32"], Protocol): ...
class ZodFloat64(ZodNumberFormat["float64"], Protocol): ...

class ZodFunction['Args extends core.$ZodFunctionIn = core.$ZodFunctionIn', 'Returns extends core.$ZodFunctionOut = core.$ZodFunctionOut']('_ZodType[core.$ZodFunctionInternals[Args, Returns]]', 'core.$ZodFunction[Args, Returns]', Protocol):
    _def: 'core.$ZodFunctionDef[Args, Returns]'
    _input: 'core.$InferInnerFunctionType[Args, Returns]'
    _output: 'core.$InferOuterFunctionType[Args, Returns]'
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    @overload
    def input[
        'const Items extends util.TupleItems',
        'const Rest extends core.$ZodFunctionOut = core.$ZodFunctionOut',
    ](
        self,
        args: Items,
        rest: Rest = ...,
    ) -> 'ZodFunction[core.$ZodTuple[Items, Rest], Returns]': ...
    @overload
    def input['NewArgs extends core.$ZodFunctionIn'](
        self,
        args: NewArgs,
    ) -> ZodFunction[NewArgs, Returns]: ...
    @overload
    def input(self, *args: 'any[]') -> ZodFunction[any, Returns]: ...
    def output['NewReturns extends core.$ZodType'](
        self,
        output: NewReturns,
    ) -> ZodFunction[Args, NewReturns]: ...

class ZodGUID(ZodStringFormat["guid"], Protocol):
    _zod: 'core.$ZodGUIDInternals'

class ZodIBAN(ZodStringFormat["iban"], Protocol):
    _zod: 'core.$ZodIBANInternals'

class ZodInstanceOf['T = unknown'](ZodCustom[T, T], Protocol):
    def properties[
        'Shape extends { [k in keyof T as T[k] extends Function ? never : k]?: core.$ZodType[unknown, T[k]] }',
    ](
        self,
        shape: Shape,
        params: 'string | core.$ZodCheckPropertiesParams' = ...,
    ) -> 'ZodInstanceOf[T & core.$InferObjectInput[Shape, {}]]': ...

class ZodInt(ZodNumberFormat["safeint"], Protocol): ...
class ZodInt32(ZodNumberFormat["int32"], Protocol): ...
class ZodInt64(ZodBigIntFormat["int64"], Protocol): ...

class ZodIntersection['A extends core.SomeType = core.$ZodType', 'B extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodIntersectionInternals[A, B]]', 'core.$ZodIntersection[A, B]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodIPv4(ZodStringFormat["ipv4"], Protocol):
    _zod: 'core.$ZodIPv4Internals'

class ZodIPv6(ZodStringFormat["ipv6"], Protocol):
    _zod: 'core.$ZodIPv6Internals'

class ZodISODate(ZodStringFormat, Protocol):
    _zod: 'core.$ZodISODateInternals'

class ZodISODateTime(ZodStringFormat, Protocol):
    _zod: 'core.$ZodISODateTimeInternals'

class ZodISODuration(ZodStringFormat, Protocol):
    _zod: 'core.$ZodISODurationInternals'

class ZodISOTime(ZodStringFormat, Protocol):
    _zod: 'core.$ZodISOTimeInternals'

class ZodJSONSchema(_ZodJSONSchema, Protocol):
    _zod: ZodJSONSchemaInternals

class ZodJSONSchemaInternals(_ZodJSONSchemaInternals, Protocol):
    input: util.JSONType
    output: util.JSONType

class ZodJWT(ZodStringFormat["jwt"], Protocol):
    _zod: 'core.$ZodJWTInternals'

class ZodKSUID(ZodStringFormat["ksuid"], Protocol):
    _zod: 'core.$ZodKSUIDInternals'

class ZodLazy['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodLazyInternals[T]]', 'core.$ZodLazy[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodLiteral['T extends util.Literal = util.Literal']('_ZodType[core.$ZodLiteralInternals[T]]', 'core.$ZodLiteral[T]', Protocol):
    value: T
    values: Set[T]
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodMAC(ZodStringFormat["mac"], Protocol):
    _zod: 'core.$ZodMACInternals'

class ZodMap['Key extends core.SomeType = core.$ZodType', 'Value extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodMapInternals[Key, Value]]', 'core.$ZodMap[Key, Value]', Protocol):
    keyType: Key
    valueType: Value
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def max(
        self,
        maxSize: number,
        params: 'string | core.$ZodCheckMaxSizeParams' = ...,
    ) -> this: ...
    def min(
        self,
        minSize: number,
        params: 'string | core.$ZodCheckMinSizeParams' = ...,
    ) -> this: ...
    def nonempty(self, params: 'string | core.$ZodCheckMinSizeParams' = ...) -> this: ...
    def size(
        self,
        size: number,
        params: 'string | core.$ZodCheckSizeEqualsParams' = ...,
    ) -> this: ...

class ZodNaN('_ZodType[core.$ZodNaNInternals]', 'core.$ZodNaN', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodNanoID(ZodStringFormat["nanoid"], Protocol):
    _zod: 'core.$ZodNanoIDInternals'

class ZodNever('_ZodType[core.$ZodNeverInternals]', Protocol): ...

class ZodNonOptional['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodNonOptionalInternals[T]]', 'core.$ZodNonOptional[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodNull('_ZodType[core.$ZodNullInternals]', Protocol): ...

class ZodNullable['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodNullableInternals[T]]', 'core.$ZodNullable[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodNumber('_ZodNumber[core.$ZodNumberInternals[number]]', Protocol): ...

class ZodNumberFormat['Format extends $ZodNumberFormats = $ZodNumberFormats'](ZodNumber, Protocol):
    _zod: 'core.$ZodNumberFormatInternals[Format]'

class ZodObject['out Shape extends core.$ZodShape = core.$ZodLooseShape', 'out Config extends core.$ZodObjectConfig = core.$strip']('_ZodType[core.$ZodObjectInternals[Shape, Config]]', 'core.$ZodObject[Shape, Config]', Protocol):
    shape: Shape
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def catchall['T extends core.SomeType'](
        self,
        schema: T,
    ) -> 'ZodObject[Shape, core.$catchall[T]]': ...
    @overload
    def exactPartial(
        self,
    ) -> 'ZodObject[{ -readonly [k in keyof Shape]: ZodExactOptional[Shape[k]] }, Config]': ...
    @overload
    def exactPartial['M extends util.Mask[keyof Shape]'](
        self,
        mask: 'M & Record[Exclude[keyof M, keyof Shape], never]',
    ) -> 'ZodObject[{ -readonly [k in keyof Shape]: k extends keyof M ? ZodExactOptional[Shape[k]] : Shape[k] }, Config]': ...
    def extend['U extends core.$ZodLooseShape'](
        self,
        shape: U,
    ) -> ZodObject[util.Extend[Shape, util.Writeable[U]], Config]: ...
    def keyof(self) -> 'ZodEnum[util.ToEnum[keyof Shape & string]]': ...
    def loose(self) -> 'ZodObject[Shape, core.$loose]': ...
    def merge['U extends ZodObject'](
        self,
        other: U,
    ) -> 'ZodObject[util.Extend[Shape, U["shape"]], U["_zod"]["config"]]': ...
    def omit['M extends util.Mask[keyof Shape]'](
        self,
        mask: 'M & Record[Exclude[keyof M, keyof Shape], never]',
    ) -> 'ZodObject[util.Flatten[Omit[Shape, Extract[keyof Shape, keyof M]]], Config]': ...
    @overload
    def partial(
        self,
    ) -> 'ZodObject[{ -readonly [k in keyof Shape]: ZodOptional[Shape[k]] }, Config]': ...
    @overload
    def partial['M extends util.Mask[keyof Shape]'](
        self,
        mask: 'M & Record[Exclude[keyof M, keyof Shape], never]',
    ) -> 'ZodObject[{ -readonly [k in keyof Shape]: k extends keyof M ? ZodOptional[Shape[k]] : Shape[k] }, Config]': ...
    def passthrough(self) -> 'ZodObject[Shape, core.$loose]': ...
    def pick['M extends util.Mask[keyof Shape]'](
        self,
        mask: 'M & Record[Exclude[keyof M, keyof Shape], never]',
    ) -> 'ZodObject[util.Flatten[Pick[Shape, Extract[keyof Shape, keyof M]]], Config]': ...
    @overload
    def required(
        self,
    ) -> 'ZodObject[{ -readonly [k in keyof Shape]: ZodNonOptional[Shape[k]] }, Config]': ...
    @overload
    def required['M extends util.Mask[keyof Shape]'](
        self,
        mask: 'M & Record[Exclude[keyof M, keyof Shape], never]',
    ) -> 'ZodObject[{ -readonly [k in keyof Shape]: k extends keyof M ? ZodNonOptional[Shape[k]] : Shape[k] }, Config]': ...
    def safeExtend['U extends core.$ZodLooseShape'](
        self,
        shape: 'SafeExtendShape[Shape, U] & Partial[Record[keyof Shape, core.SomeType]]',
    ) -> ZodObject[util.Extend[Shape, util.Writeable[U]], Config]: ...
    def strict(self) -> 'ZodObject[Shape, core.$strict]': ...
    def strip(self) -> 'ZodObject[Shape, core.$strip]': ...

class ZodOptional['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodOptionalInternals[T]]', 'core.$ZodOptional[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodPipe['A extends core.SomeType = core.$ZodType', 'B extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodPipeInternals[A, B]]', 'core.$ZodPipe[A, B]', Protocol):
    self["in"]: A
    out: B
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodPrefault['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodPrefaultInternals[T]]', 'core.$ZodPrefault[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodPreprocess['B extends core.SomeType = core.$ZodType', 'I = unknown']('ZodPipe[core.$ZodTransform[unknown, I], B]', 'core.$ZodPreprocess[B, I]', Protocol):
    _zod: 'core.$ZodPreprocessInternals[B, I]'
    self["def"]: 'core.$ZodPreprocessDef[B, I]'
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodPromise['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodPromiseInternals[T]]', 'core.$ZodPromise[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodReadonly['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodReadonlyInternals[T]]', 'core.$ZodReadonly[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodRecord['Key extends core.$ZodRecordKey = core.$ZodRecordKey', 'Value extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodRecordInternals[Key, Value]]', 'core.$ZodRecord[Key, Value]', Protocol):
    keyType: Key
    valueType: Value
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodSet['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodSetInternals[T]]', 'core.$ZodSet[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def max(
        self,
        maxSize: number,
        params: 'string | core.$ZodCheckMaxSizeParams' = ...,
    ) -> this: ...
    def min(
        self,
        minSize: number,
        params: 'string | core.$ZodCheckMinSizeParams' = ...,
    ) -> this: ...
    def nonempty(self, params: 'string | core.$ZodCheckMinSizeParams' = ...) -> this: ...
    def size(
        self,
        size: number,
        params: 'string | core.$ZodCheckSizeEqualsParams' = ...,
    ) -> this: ...

class ZodString('_ZodString[core.$ZodStringInternals[string]]', Protocol):
    def base64(self, params: 'string | core.$ZodCheckBase64Params' = ...) -> this: ...
    def base64url(self, params: 'string | core.$ZodCheckBase64URLParams' = ...) -> this: ...
    def cidrv4(self, params: 'string | core.$ZodCheckCIDRv4Params' = ...) -> this: ...
    def cidrv6(self, params: 'string | core.$ZodCheckCIDRv6Params' = ...) -> this: ...
    def cuid(self, params: 'string | core.$ZodCheckCUIDParams' = ...) -> this: ...
    def cuid2(self, params: 'string | core.$ZodCheckCUID2Params' = ...) -> this: ...
    def date(self, params: 'string | core.$ZodCheckISODateParams' = ...) -> this: ...
    def datetime(self, params: 'string | core.$ZodCheckISODateTimeParams' = ...) -> this: ...
    def duration(self, params: 'string | core.$ZodCheckISODurationParams' = ...) -> this: ...
    def e164(self, params: 'string | core.$ZodCheckE164Params' = ...) -> this: ...
    def email(self, params: 'string | core.$ZodCheckEmailParams' = ...) -> this: ...
    def emoji(self, params: 'string | core.$ZodCheckEmojiParams' = ...) -> this: ...
    @overload
    def guid(self, params: 'string | core.$ZodCheckGUIDParams' = ...) -> this: ...
    @overload
    def guid(self, params: 'string | core.$ZodCheckGUIDParams' = ...) -> this: ...
    def ipv4(self, params: 'string | core.$ZodCheckIPv4Params' = ...) -> this: ...
    def ipv6(self, params: 'string | core.$ZodCheckIPv6Params' = ...) -> this: ...
    def jwt(self, params: 'string | core.$ZodCheckJWTParams' = ...) -> this: ...
    def ksuid(self, params: 'string | core.$ZodCheckKSUIDParams' = ...) -> this: ...
    def nanoid(self, params: 'string | core.$ZodCheckNanoIDParams' = ...) -> this: ...
    def time(self, params: 'string | core.$ZodCheckISOTimeParams' = ...) -> this: ...
    def ulid(self, params: 'string | core.$ZodCheckULIDParams' = ...) -> this: ...
    def url(self, params: 'string | core.$ZodCheckURLParams' = ...) -> this: ...
    def uuid(self, params: 'string | core.$ZodCheckUUIDParams' = ...) -> this: ...
    def uuidv4(self, params: 'string | core.$ZodCheckUUIDParams' = ...) -> this: ...
    def uuidv6(self, params: 'string | core.$ZodCheckUUIDParams' = ...) -> this: ...
    def uuidv7(self, params: 'string | core.$ZodCheckUUIDParams' = ...) -> this: ...
    def xid(self, params: 'string | core.$ZodCheckXIDParams' = ...) -> this: ...

class ZodStringFormat['Format extends string = string']('_ZodString[core.$ZodStringFormatInternals[Format]]', Protocol): ...

class ZodSuccess['T extends core.SomeType = core.$ZodType']('_ZodType[core.$ZodSuccessInternals[T]]', 'core.$ZodSuccess[T]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def unwrap(self) -> T: ...

class ZodSymbol('_ZodType[core.$ZodSymbolInternals]', Protocol): ...

class ZodTemplateLiteral['Template extends string = string']('_ZodType[core.$ZodTemplateLiteralInternals[Template]]', 'core.$ZodTemplateLiteral[Template]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodTransform['O = unknown', 'I = unknown']('_ZodType[core.$ZodTransformInternals[O, I]]', 'core.$ZodTransform[O, I]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodTuple['T extends util.TupleItems = readonly core.$ZodType[]', 'Rest extends core.SomeType | null = core.$ZodType | null']('_ZodType[core.$ZodTupleInternals[T, Rest]]', 'core.$ZodTuple[T, Rest]', Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def partial(self) -> 'ZodTuple[{ -readonly [k in keyof T]: ZodOptional[T[k]] }, Rest]': ...
    def rest['Rest extends core.SomeType = core.$ZodType'](
        self,
        rest: Rest,
    ) -> ZodTuple[T, Rest]: ...

class ZodType['out Output = unknown', 'out Input = unknown', 'out Internals extends core.$ZodTypeInternals[Output, Input] = core.$ZodTypeInternals[Output, Input]']('core.$ZodType[Output, Input, Internals]', Protocol):
    _def: Internals["def"]
    _input: Internals["input"]
    _output: Internals["output"]
    self["def"]: Internals["def"]
    description: Opt[string]
    spa: '(data: unknown, params?: core.ParseContext[core.$ZodIssue]) => Promise[parse.ZodSafeParseResult[core.output[this]]]'
    type: 'Internals["def"]["type"]'
    self["~standard"]: ZodStandardSchemaWithJSON[this]
    def and_['T extends core.SomeType'](self, incoming: T) -> ZodIntersection[this, T]: ...
    def apply[T, 'TArgs extends unknown[] = []'](
        self,
        fn: '(schema: this, ...args: TArgs) => T',
        *args: TArgs,
    ) -> T: ...
    def array(self) -> ZodArray[this]: ...
    def brand['T extends PropertyKey = PropertyKey', 'Dir extends "in" | "out" | "inout" = "out"'](
        self,
        value: T = ...,
    ) -> 'PropertyKey extends T ? this : core.$ZodBranded[this, T, Dir]': ...
    @overload
    def catch(self, def_: core.output[this]) -> ZodCatch[this]: ...
    @overload
    def catch(self, def_: '(ctx: core.$ZodCatchCtx) => core.output[this]') -> ZodCatch[this]: ...
    def check(
        self,
        *checks: '(core.CheckFn[core.output[this]] | core.$ZodCheck[core.output[this]])[]',
    ) -> this: ...
    def clone(self, def_: Internals["def"] = ..., params: '{ parent: boolean }' = ...) -> this: ...
    def decode(
        self,
        data: core.input[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> core.output[this]: ...
    def decodeAsync(
        self,
        data: core.input[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[core.output[this]]: ...
    @overload
    def default(self, def_: util.NoUndefined[core.output[this]]) -> ZodDefault[this]: ...
    @overload
    def default(self, def_: '() => util.NoUndefined[core.output[this]]') -> ZodDefault[this]: ...
    def describe(self, description: string) -> this: ...
    def encode(
        self,
        data: core.output[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> core.input[this]: ...
    def encodeAsync(
        self,
        data: core.output[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[core.input[this]]: ...
    def exactOptional(self) -> ZodExactOptional[this]: ...
    def isNullable(self) -> boolean: ...
    def isOptional(self) -> boolean: ...
    @overload
    def meta(self) -> 'core.$replace[core.GlobalMeta, this] | undefined': ...
    @overload
    def meta(self, data: 'core.$replace[core.GlobalMeta, this]') -> this: ...
    def nonoptional(
        self,
        params: 'string | core.$ZodNonOptionalParams' = ...,
    ) -> ZodNonOptional[this]: ...
    def nullable(self) -> ZodNullable[this]: ...
    def nullish(self) -> ZodOptional[ZodNullable[this]]: ...
    def optional(self) -> ZodOptional[this]: ...
    def or_['T extends core.SomeType'](self, option: T) -> ZodUnion[[this, T]]: ...
    def overwrite(self, fn: '(x: core.output[this]) => core.output[this]') -> this: ...
    def parse(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> core.output[this]: ...
    def parseAsync(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[core.output[this]]: ...
    def pipe['T extends core.$ZodType[any, core.output[this]]'](
        self,
        target: 'T | core.$ZodType[any, core.output[this]]',
    ) -> ZodPipe[this, T]: ...
    @overload
    def prefault(self, def_: '() => core.input[this]') -> ZodPrefault[this]: ...
    @overload
    def prefault(self, def_: core.input[this]) -> ZodPrefault[this]: ...
    def readonly(self) -> ZodReadonly[this]: ...
    def refine['Ch extends (arg: core.output[this]) => unknown | Promise[unknown]'](
        self,
        check: Ch,
        params: 'string | core.$ZodCustomParams' = ...,
    ) -> 'Ch extends (arg: any) => arg is infer R ? this & ZodType[R, core.input[this]] : this': ...
    def register['R extends core.$ZodRegistry'](
        self,
        registry: R,
        *meta: '<this extends R["_schema"] ? undefined extends R["_meta"] ? … (155 chars, #9743d838)>',
    ) -> this: ...
    def safeDecode(
        self,
        data: core.input[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> parse.ZodSafeParseResult[core.output[this]]: ...
    def safeDecodeAsync(
        self,
        data: core.input[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[parse.ZodSafeParseResult[core.output[this]]]: ...
    def safeEncode(
        self,
        data: core.output[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> parse.ZodSafeParseResult[core.input[this]]: ...
    def safeEncodeAsync(
        self,
        data: core.output[this],
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[parse.ZodSafeParseResult[core.input[this]]]: ...
    def safeParse(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> parse.ZodSafeParseResult[core.output[this]]: ...
    def safeParseAsync(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[parse.ZodSafeParseResult[core.output[this]]]: ...
    def superRefine(
        self,
        refinement: '(arg: core.output[this], ctx: core.$RefinementCtx[core.output[this]]) => void | Promise[void]',
        params: 'core.$ZodSuperRefineParams' = ...,
    ) -> this: ...
    def toJSONSchema(
        self,
        params: core.ToJSONSchemaParams = ...,
    ) -> core.ZodStandardJSONSchemaPayload[this]: ...
    def transform[NewOut](
        self,
        transform: '(arg: core.output[this], ctx: core.$RefinementCtx[core.output[this]]) => NewOut | Promise[NewOut]',
    ) -> ZodPipe[this, ZodTransform[Awaited[NewOut], core.output[this]]]: ...
    def validate(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> 'data is core.input[this]': ...
    def validateAsync(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[boolean]: ...
    def with_(
        self,
        *checks: '(core.CheckFn[core.output[this]] | core.$ZodCheck[core.output[this]])[]',
    ) -> this: ...

class ZodUInt32(ZodNumberFormat["uint32"], Protocol): ...
class ZodUInt64(ZodBigIntFormat["uint64"], Protocol): ...

class ZodULID(ZodStringFormat["ulid"], Protocol):
    _zod: 'core.$ZodULIDInternals'

class ZodUndefined('_ZodType[core.$ZodUndefinedInternals]', Protocol): ...

class ZodUnion['T extends readonly core.SomeType[] = readonly core.$ZodType[]']('_ZodType[core.$ZodUnionInternals[T]]', 'core.$ZodUnion[T]', Protocol):
    options: T
    self["~standard"]: ZodStandardSchemaWithJSON[this]

class ZodUnknown('_ZodType[core.$ZodUnknownInternals]', Protocol): ...

class ZodURL(ZodStringFormat["url"], Protocol):
    _zod: 'core.$ZodURLInternals'

class ZodUUID(ZodStringFormat["uuid"], Protocol):
    _zod: 'core.$ZodUUIDInternals'

class ZodVoid('_ZodType[core.$ZodVoidInternals]', Protocol): ...

class ZodXID(ZodStringFormat["xid"], Protocol):
    _zod: 'core.$ZodXIDInternals'

class ZodXor['T extends readonly core.SomeType[] = readonly core.$ZodType[]']('_ZodType[core.$ZodXorInternals[T]]', 'core.$ZodXor[T]', Protocol):
    options: T
    self["~standard"]: ZodStandardSchemaWithJSON[this]

def _default['T extends core.SomeType'](
    innerType: T,
    defaultValue: 'util.NoUndefined[core.output[T]] | (() => util.NoUndefined[core.output[T]])',
) -> ZodDefault[T]: ...

@overload
def _function() -> ZodFunction: ...
@overload
def _function['const In extends ReadonlyArray[core.$ZodType]'](
    params: '{ input: In }',
) -> 'ZodFunction[ZodTuple[In, null], core.$ZodFunctionOut]': ...
@overload
def _function[
    'const In extends ReadonlyArray[core.$ZodType]',
    'const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut',
](
    params: '{ input: In; output: Out }',
) -> ZodFunction[ZodTuple[In, null], Out]: ...
@overload
def _function['const In extends core.$ZodFunctionIn = core.$ZodFunctionIn'](
    params: '{ input: In }',
) -> 'ZodFunction[In, core.$ZodFunctionOut]': ...
@overload
def _function['const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut'](
    params: '{ output: Out }',
) -> 'ZodFunction[core.$ZodFunctionIn, Out]': ...
@overload
def _function[
    'In extends core.$ZodFunctionIn = core.$ZodFunctionIn',
    'Out extends core.$ZodType = core.$ZodType',
](
    params: '{ input: In; output: Out }' = ...,
) -> ZodFunction[In, Out]: ...

def any() -> ZodAny: ...

def array['T extends core.SomeType'](
    element: T,
    params: 'string | core.$ZodArrayParams' = ...,
) -> ZodArray[T]: ...

def base64(params: 'string | core.$ZodBase64Params' = ...) -> ZodBase64: ...
def base64url(params: 'string | core.$ZodBase64URLParams' = ...) -> ZodBase64URL: ...
def bigint(params: 'string | core.$ZodBigIntParams' = ...) -> ZodBigInt: ...
def boolean(params: 'string | core.$ZodBooleanParams' = ...) -> ZodBoolean: ...

def catch['T extends core.SomeType'](
    innerType: T,
    catchValue: 'core.output[T] | ((ctx: core.$ZodCatchCtx) => core.output[T])',
) -> ZodCatch[T]: ...

def check['O = unknown'](fn: core.CheckFn[O]) -> 'core.$ZodCheck[O]': ...
def cidrv4(params: 'string | core.$ZodCIDRv4Params' = ...) -> ZodCIDRv4: ...
def cidrv6(params: 'string | core.$ZodCIDRv6Params' = ...) -> ZodCIDRv6: ...

def codec['const A extends core.SomeType', 'B extends core.SomeType = core.$ZodType'](
    in_: A,
    out: B,
    params: '<{ decode: (value: core.output[A], payload: … (233 chars, #bbc9e37f)>',
) -> ZodCodec[A, B]: ...

def creditCard(params: 'string | core.$ZodCreditCardParams' = ...) -> ZodCreditCard: ...
def cuid(params: 'string | core.$ZodCUIDParams' = ...) -> ZodCUID: ...
def cuid2(params: 'string | core.$ZodCUID2Params' = ...) -> ZodCUID2: ...

def currencyCode(
    _params: 'string | core.$ZodStringFormatParams' = ...,
) -> ZodCustomStringFormat["currency_code"]: ...

def custom[O](
    fn: '(data: unknown) => unknown' = ...,
    _params: 'string | core.$ZodCustomParams | undefined' = ...,
) -> ZodCustom[O, O]: ...

def date(params: 'string | core.$ZodDateParams' = ...) -> ZodDate: ...
def deepPartial['T extends core.SomeType'](schema: T) -> DeepPartial[T]: ...

def discriminatedUnion[
    'Types extends readonly [core.$ZodTypeDiscriminable, ...core.$ZodTypeDiscriminable[]]',
    'Disc extends string',
](
    discriminator: Disc,
    options: Types,
    params: 'string | core.$ZodDiscriminatedUnionParams' = ...,
) -> ZodDiscriminatedUnion[Types, Disc]: ...

def e164(params: 'string | core.$ZodE164Params' = ...) -> ZodE164: ...
def email(params: 'string | core.$ZodEmailParams' = ...) -> ZodEmail: ...
def emoji(params: 'string | core.$ZodEmojiParams' = ...) -> ZodEmoji: ...

@overload
def enum['const T extends readonly string[]'](
    values: T,
    params: 'string | core.$ZodEnumParams' = ...,
) -> ZodEnum[util.ToEnum[T[number]]]: ...
@overload
def enum['const T extends util.EnumLike'](
    entries: T,
    params: 'string | core.$ZodEnumParams' = ...,
) -> ZodEnum[T]: ...

def exactOptional['T extends core.SomeType'](innerType: T) -> ZodExactOptional[T]: ...
def file(params: 'string | core.$ZodFileParams' = ...) -> ZodFile: ...
def float32(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodFloat32: ...
def float64(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodFloat64: ...

def fromJSONSchema(
    schema: JSONSchema.JSONSchema | boolean,
    params: FromJSONSchemaParams = ...,
) -> ZodType: ...

@overload
def function() -> ZodFunction: ...
@overload
def function['const In extends ReadonlyArray[core.$ZodType]'](
    params: '{ input: In }',
) -> 'ZodFunction[ZodTuple[In, null], core.$ZodFunctionOut]': ...
@overload
def function[
    'const In extends ReadonlyArray[core.$ZodType]',
    'const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut',
](
    params: '{ input: In; output: Out }',
) -> ZodFunction[ZodTuple[In, null], Out]: ...
@overload
def function['const In extends core.$ZodFunctionIn = core.$ZodFunctionIn'](
    params: '{ input: In }',
) -> 'ZodFunction[In, core.$ZodFunctionOut]': ...
@overload
def function['const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut'](
    params: '{ output: Out }',
) -> 'ZodFunction[core.$ZodFunctionIn, Out]': ...
@overload
def function[
    'In extends core.$ZodFunctionIn = core.$ZodFunctionIn',
    'Out extends core.$ZodType = core.$ZodType',
](
    params: '{ input: In; output: Out }' = ...,
) -> ZodFunction[In, Out]: ...

def getErrorMap() -> 'core.$ZodErrorMap[core.$ZodIssue] | undefined': ...
def guid(params: 'string | core.$ZodGUIDParams' = ...) -> ZodGUID: ...

def hash['Alg extends util.HashAlgorithm', 'Enc extends util.HashEncoding = "hex"'](
    alg: Alg,
    params: '{ enc?: Enc } & core.$ZodStringFormatParams' = ...,
) -> 'ZodCustomStringFormat[`${Alg}_${Enc}`]': ...

def hex(_params: 'string | core.$ZodStringFormatParams' = ...) -> ZodCustomStringFormat["hex"]: ...

def hostname(
    _params: 'string | core.$ZodStringFormatParams' = ...,
) -> ZodCustomStringFormat["hostname"]: ...

def httpUrl(
    params: 'string | Omit[core.$ZodURLParams, "protocol" | "hostname"]' = ...,
) -> ZodURL: ...

def iban(params: 'string | core.$ZodIBANParams' = ...) -> ZodIBAN: ...

def input['T extends core.$ZodType'](
    schema: T,
) -> schemas.ZodType[core.input[T], core.input[T]]: ...

def instanceof['T extends typeof util.Class'](
    cls: T,
    params: ZodInstanceOfParams = ...,
) -> ZodInstanceOf[InstanceType[T]]: ...

def int(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodInt: ...
def int32(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodInt32: ...
def int64(params: 'string | core.$ZodBigIntFormatParams' = ...) -> ZodInt64: ...

def intersection['T extends core.SomeType', 'U extends core.SomeType'](
    left: T,
    right: U,
) -> ZodIntersection[T, U]: ...

def invertCodec['A extends core.SomeType', 'B extends core.SomeType'](
    codec: ZodCodec[A, B],
) -> ZodCodec[B, A]: ...

def ipv4(params: 'string | core.$ZodIPv4Params' = ...) -> ZodIPv4: ...
def ipv6(params: 'string | core.$ZodIPv6Params' = ...) -> ZodIPv6: ...
def json(params: 'string | core.$ZodCustomParams' = ...) -> ZodJSONSchema: ...
def jwt(params: 'string | core.$ZodJWTParams' = ...) -> ZodJWT: ...
def keyof['T extends ZodObject'](schema: T) -> 'ZodEnum[util.KeysEnum[T["_zod"]["output"]]]': ...
def ksuid(params: 'string | core.$ZodKSUIDParams' = ...) -> ZodKSUID: ...
def lazy['T extends core.SomeType'](getter: '() => T') -> ZodLazy[T]: ...

@overload
def literal['const T extends ReadonlyArray[util.Literal]'](
    value: T,
    params: 'string | core.$ZodLiteralParams' = ...,
) -> ZodLiteral[T[number]]: ...
@overload
def literal['const T extends util.Literal'](
    value: T,
    params: 'string | core.$ZodLiteralParams' = ...,
) -> ZodLiteral[T]: ...

def looseObject['T extends core.$ZodLooseShape'](
    shape: T,
    params: 'string | core.$ZodObjectParams' = ...,
) -> 'ZodObject[util.Writeable[T], core.$loose]': ...

def looseRecord['Key extends core.$ZodRecordKey', 'Value extends core.SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodRecordParams' = ...,
) -> ZodRecord[Key, Value]: ...

def mac(params: 'string | core.$ZodMACParams' = ...) -> ZodMAC: ...

def map['Key extends core.SomeType', 'Value extends core.SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodMapParams' = ...,
) -> ZodMap[Key, Value]: ...

def nan(params: 'string | core.$ZodNaNParams' = ...) -> ZodNaN: ...
def nanoid(params: 'string | core.$ZodNanoIDParams' = ...) -> ZodNanoID: ...

def nativeEnum['T extends util.EnumLike'](
    entries: T,
    params: 'string | core.$ZodEnumParams' = ...,
) -> ZodEnum[T]: ...

def never(params: 'string | core.$ZodNeverParams' = ...) -> ZodNever: ...

def nonoptional['T extends core.SomeType'](
    innerType: T,
    params: 'string | core.$ZodNonOptionalParams' = ...,
) -> ZodNonOptional[T]: ...

def null(params: 'string | core.$ZodNullParams' = ...) -> ZodNull: ...
def nullable['T extends core.SomeType'](innerType: T) -> ZodNullable[T]: ...
def nullish['T extends core.SomeType'](innerType: T) -> ZodOptional[ZodNullable[T]]: ...
def number(params: 'string | core.$ZodNumberParams' = ...) -> ZodNumber: ...

def object['T extends core.$ZodLooseShape = Partial[Record[never, core.SomeType]]'](
    shape: T = ...,
    params: 'string | core.$ZodObjectParams' = ...,
) -> 'ZodObject[util.Writeable[T], core.$strip]': ...

def optional['T extends core.SomeType'](innerType: T) -> ZodOptional[T]: ...

def output['T extends core.$ZodType'](
    schema: T,
) -> schemas.ZodType[core.output[T], core.output[T]]: ...

def partialRecord['Key extends core.$ZodRecordKey', 'Value extends core.SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodRecordParams' = ...,
) -> 'ZodRecord[Key & core.$partial, Value]': ...

def pipe[
    'const A extends core.SomeType',
    'B extends core.$ZodType[unknown, core.output[A]] = core.$ZodType[unknown, core.output[A]]',
](
    in_: A,
    out: 'B | core.$ZodType[unknown, core.output[A]]',
) -> ZodPipe[A, B]: ...

def prefault['T extends core.SomeType'](
    innerType: T,
    defaultValue: 'core.input[T] | (() => core.input[T])',
) -> ZodPrefault[T]: ...

def preprocess[A, 'U extends core.SomeType', 'B = unknown'](
    fn: '(arg: B, ctx: core.$RefinementCtx) => A',
    schema: U,
) -> ZodPreprocess[U, B]: ...

def promise['T extends core.SomeType'](innerType: T) -> ZodPromise[T]: ...
def readonly['T extends core.SomeType'](innerType: T) -> ZodReadonly[T]: ...

def record['Key extends core.$ZodRecordKey', 'Value extends core.SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodRecordParams' = ...,
) -> ZodRecord[Key, Value]: ...

def refine[T](
    fn: '(arg: NoInfer[T]) => util.MaybeAsync[unknown]',
    _params: 'string | core.$ZodCustomParams' = ...,
) -> 'core.$ZodCheck[T]': ...

def set['Value extends core.SomeType'](
    valueType: Value,
    params: 'string | core.$ZodSetParams' = ...,
) -> ZodSet[Value]: ...

def setErrorMap(map: 'core.$ZodErrorMap') -> void: ...

def strictObject['T extends core.$ZodLooseShape'](
    shape: T,
    params: 'string | core.$ZodObjectParams' = ...,
) -> 'ZodObject[util.Writeable[T], core.$strict]': ...

@overload
def string(params: 'string | core.$ZodStringParams' = ...) -> ZodString: ...
@overload
def string['T extends string'](
    params: 'string | core.$ZodStringParams' = ...,
) -> 'core.$ZodType[T, T]': ...

def stringFormat['Format extends string'](
    format: Format,
    fnOrRegex: '((arg: string) => util.MaybeAsync[unknown]) | RegExp',
    _params: 'string | core.$ZodStringFormatParams' = ...,
) -> ZodCustomStringFormat[Format]: ...

def success['T extends core.SomeType'](innerType: T) -> ZodSuccess[T]: ...

def superRefine[T](
    fn: '(arg: T, payload: core.$RefinementCtx[T]) => void | Promise[void]',
    params: 'core.$ZodSuperRefineParams' = ...,
) -> 'core.$ZodCheck[T]': ...

def symbol(params: 'string | core.$ZodSymbolParams' = ...) -> ZodSymbol: ...

def templateLiteral['const Parts extends core.$ZodTemplateLiteralPart[]'](
    parts: Parts,
    params: 'string | core.$ZodTemplateLiteralParams' = ...,
) -> 'ZodTemplateLiteral[core.$PartsToTemplateLiteral[Parts]]': ...

def transform['I = unknown', 'O = I'](
    fn: '(input: I, ctx: core.$RefinementCtx) => O',
) -> ZodTransform[Awaited[O], I]: ...

@overload
def tuple['T extends readonly [core.SomeType, ...core.SomeType[]]'](
    items: T,
    params: 'string | core.$ZodTupleParams' = ...,
) -> ZodTuple[T, null]: ...
@overload
def tuple['T extends readonly [core.SomeType, ...core.SomeType[]]', 'Rest extends core.SomeType'](
    items: T,
    rest: Rest,
    params: 'string | core.$ZodTupleParams' = ...,
) -> ZodTuple[T, Rest]: ...
@overload
def tuple(items: '[]', params: 'string | core.$ZodTupleParams' = ...) -> ZodTuple[[], null]: ...

def uint32(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodUInt32: ...
def uint64(params: 'string | core.$ZodBigIntFormatParams' = ...) -> ZodUInt64: ...
def ulid(params: 'string | core.$ZodULIDParams' = ...) -> ZodULID: ...
def undefined(params: 'string | core.$ZodUndefinedParams' = ...) -> ZodUndefined: ...

def union['const T extends readonly core.SomeType[]'](
    options: T,
    params: 'string | core.$ZodUnionParams' = ...,
) -> ZodUnion[T]: ...

def unknown() -> ZodUnknown: ...
def url(params: 'string | core.$ZodURLParams' = ...) -> ZodURL: ...
def uuid(params: 'string | core.$ZodUUIDParams' = ...) -> ZodUUID: ...
def uuidv4(params: 'string | core.$ZodUUIDv4Params' = ...) -> ZodUUID: ...
def uuidv6(params: 'string | core.$ZodUUIDv6Params' = ...) -> ZodUUID: ...
def uuidv7(params: 'string | core.$ZodUUIDv7Params' = ...) -> ZodUUID: ...
def void(params: 'string | core.$ZodVoidParams' = ...) -> ZodVoid: ...
def xid(params: 'string | core.$ZodXIDParams' = ...) -> ZodXID: ...

def xor['const T extends readonly core.SomeType[]'](
    options: T,
    params: 'string | core.$ZodXorParams' = ...,
) -> ZodXor[T]: ...

_ZodString: 'core.$constructor[_ZodString]'
coerce: namespace
decode: '<[T extends core.$ZodType](schema: T, value: core.input[T], … (187 chars, #ddb318ac)>'
decodeAsync: '<[T extends core.$ZodType](schema: T, value: core.input[T], … (196 chars, #2bb98e17)>'
default: namespace
describe: '<inferred>'
encode: '<[T extends core.$ZodType](schema: T, value: core.output[T], … (187 chars, #dd0e9636)>'
encodeAsync: '<[T extends core.$ZodType](schema: T, value: core.output[T], … (196 chars, #a1d1dd97)>'
iso: namespace
meta: '<inferred>'
parse: '<[T extends core.$ZodType](schema: T, value: unknown, _ctx?: … (181 chars, #6ae898a1)>'
parseAsync: '<[T extends core.$ZodType](schema: T, value: unknown, _ctx?: … (190 chars, #2d7ddc90)>'
safeDecode: '<[T extends core.$ZodType](schema: T, value: core.input[T], … (138 chars, #f5f138d1)>'
safeDecodeAsync: '<[T extends core.$ZodType](schema: T, value: core.input[T], … (147 chars, #cb2cd9c1)>'
safeEncode: '<[T extends core.$ZodType](schema: T, value: core.output[T], … (138 chars, #686e04a9)>'
safeEncodeAsync: '<[T extends core.$ZodType](schema: T, value: core.output[T], … (147 chars, #ca10f02f)>'
safeParse: '<[T extends core.$ZodType](schema: T, value: unknown, _ctx?: … (132 chars, #7ae44fa0)>'
safeParseAsync: '<[T extends core.$ZodType](schema: T, value: unknown, _ctx?: … (141 chars, #9ed690b6)>'
stringbool: '(_params?: string | core.$ZodStringBoolParams) => ZodCodec[ZodString, ZodBoolean]'
z: namespace
ZodAny: 'core.$constructor[ZodAny]'
ZodArray: 'core.$constructor[ZodArray]'
ZodBase64: 'core.$constructor[ZodBase64]'
ZodBase64URL: 'core.$constructor[ZodBase64URL]'
ZodBigInt: 'core.$constructor[ZodBigInt]'
ZodBigIntFormat: 'core.$constructor[ZodBigIntFormat]'
ZodBoolean: 'core.$constructor[ZodBoolean]'
ZodCatch: 'core.$constructor[ZodCatch]'
ZodCIDRv4: 'core.$constructor[ZodCIDRv4]'
ZodCIDRv6: 'core.$constructor[ZodCIDRv6]'
ZodCodec: 'core.$constructor[ZodCodec]'
ZodCreditCard: 'core.$constructor[ZodCreditCard]'
ZodCUID: 'core.$constructor[ZodCUID]'
ZodCUID2: 'core.$constructor[ZodCUID2]'
ZodCustom: 'core.$constructor[ZodCustom]'
ZodCustomStringFormat: 'core.$constructor[ZodCustomStringFormat]'
ZodDate: 'core.$constructor[ZodDate]'
ZodDefault: 'core.$constructor[ZodDefault]'
ZodDiscriminatedUnion: 'core.$constructor[ZodDiscriminatedUnion]'
ZodE164: 'core.$constructor[ZodE164]'
ZodEmail: 'core.$constructor[ZodEmail]'
ZodEmoji: 'core.$constructor[ZodEmoji]'
ZodEnum: 'core.$constructor[ZodEnum]'
ZodError: 'core.$constructor[ZodError]'
ZodExactOptional: 'core.$constructor[ZodExactOptional]'
ZodFile: 'core.$constructor[ZodFile]'
ZodFunction: 'core.$constructor[ZodFunction]'
ZodGUID: 'core.$constructor[ZodGUID]'
ZodIBAN: 'core.$constructor[ZodIBAN]'
ZodInstanceOf: 'core.$constructor[ZodInstanceOf]'
ZodIntersection: 'core.$constructor[ZodIntersection]'
ZodIPv4: 'core.$constructor[ZodIPv4]'
ZodIPv6: 'core.$constructor[ZodIPv6]'
ZodISODate: 'core.$constructor[ZodISODate]'
ZodISODateTime: 'core.$constructor[ZodISODateTime]'
ZodISODuration: 'core.$constructor[ZodISODuration]'
ZodISOTime: 'core.$constructor[ZodISOTime]'
ZodIssueCode: '<inferred>'
ZodJWT: 'core.$constructor[ZodJWT]'
ZodKSUID: 'core.$constructor[ZodKSUID]'
ZodLazy: 'core.$constructor[ZodLazy]'
ZodLiteral: 'core.$constructor[ZodLiteral]'
ZodMAC: 'core.$constructor[ZodMAC]'
ZodMap: 'core.$constructor[ZodMap]'
ZodNaN: 'core.$constructor[ZodNaN]'
ZodNanoID: 'core.$constructor[ZodNanoID]'
ZodNever: 'core.$constructor[ZodNever]'
ZodNonOptional: 'core.$constructor[ZodNonOptional]'
ZodNull: 'core.$constructor[ZodNull]'
ZodNullable: 'core.$constructor[ZodNullable]'
ZodNumber: 'core.$constructor[ZodNumber]'
ZodNumberFormat: 'core.$constructor[ZodNumberFormat]'
ZodObject: 'core.$constructor[ZodObject]'
ZodOptional: 'core.$constructor[ZodOptional]'
ZodPipe: 'core.$constructor[ZodPipe]'
ZodPrefault: 'core.$constructor[ZodPrefault]'
ZodPreprocess: 'core.$constructor[ZodPreprocess]'
ZodPromise: 'core.$constructor[ZodPromise]'
ZodReadonly: 'core.$constructor[ZodReadonly]'
ZodRealError: 'core.$constructor[ZodError]'
ZodRecord: 'core.$constructor[ZodRecord]'
ZodSet: 'core.$constructor[ZodSet]'
ZodString: 'core.$constructor[ZodString]'
ZodStringFormat: 'core.$constructor[ZodStringFormat]'
ZodSuccess: 'core.$constructor[ZodSuccess]'
ZodSymbol: 'core.$constructor[ZodSymbol]'
ZodTemplateLiteral: 'core.$constructor[ZodTemplateLiteral]'
ZodTransform: 'core.$constructor[ZodTransform]'
ZodTuple: 'core.$constructor[ZodTuple]'
ZodType: 'core.$constructor[ZodType]'
ZodULID: 'core.$constructor[ZodULID]'
ZodUndefined: 'core.$constructor[ZodUndefined]'
ZodUnion: 'core.$constructor[ZodUnion]'
ZodUnknown: 'core.$constructor[ZodUnknown]'
ZodURL: 'core.$constructor[ZodURL]'
ZodUUID: 'core.$constructor[ZodUUID]'
ZodVoid: 'core.$constructor[ZodVoid]'
ZodXID: 'core.$constructor[ZodXID]'
ZodXor: 'core.$constructor[ZodXor]'
