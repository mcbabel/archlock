"""Zod 4 mini API: tree-shakable functions like z.string().check(z.minLength(1)) (zod/mini)."""

__module__ = "zod.mini"
__paths__ = ["packages/zod/src/v4/mini/**"]
__entry__ = "packages/zod/src/v4/mini/index.ts"
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
    decode,
    decodeAsync,
    encode,
    encodeAsync,
    endsWith,
    flattenError,
    formatError,
    getDiscriminatedOption,
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
    maximum,
    maxLength,
    maxSize,
    memoizer,
    mime,
    minimum,
    minLength,
    minSize,
    multipleOf,
    negative,
    NEVER,
    nonnegative,
    nonpositive,
    normalize,
    overwrite,
    parse,
    parseAsync,
    positive,
    prettifyError,
    properties,
    property,
    regex,
    regexes,
    registry,
    safeDecode,
    safeDecodeAsync,
    safeEncode,
    safeEncodeAsync,
    safeParse,
    safeParseAsync,
    size,
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

_ZodMiniJSONSchema: TypeAlias = '<ZodMiniUnion[[ZodMiniString, ZodMiniNumber, ZodMiniBoolean, … (163 chars, #18b2a47e)>'
_ZodMiniJSONSchemaInternals: TypeAlias = _ZodMiniJSONSchema["_zod"]
input: TypeAlias[T] = core.input[T]
output: TypeAlias[T] = core.output[T]
RequiredInterfaceShape: TypeAlias['Shape extends core.$ZodLooseShape', 'Keys extends PropertyKey = keyof Shape'] = '<util.Identity[{ [k in keyof Shape as k extends Keys ? k : … (162 chars, #63997b1c)>'
SafeExtendShape: TypeAlias['Base extends core.$ZodShape', 'Ext extends core.$ZodLooseShape'] = '<{ [K in keyof Ext]: K extends keyof Base ? … (176 chars, #ac948a3c)>'

class _ZodMiniString['T extends core.$ZodStringInternals[unknown] = core.$ZodStringInternals[unknown]'](_ZodMiniType[T], 'core.$ZodString[T["input"]]', Protocol):
    _zod: T

class ZodMiniAny('_ZodMiniType[core.$ZodAnyInternals]', Protocol): ...
class ZodMiniArray['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodArrayInternals[T]]', 'core.$ZodArray[T]', Protocol): ...
class ZodMiniBase64('_ZodMiniString[core.$ZodBase64Internals]', Protocol): ...
class ZodMiniBase64URL('_ZodMiniString[core.$ZodBase64URLInternals]', Protocol): ...
class ZodMiniBigInt['T = unknown']('_ZodMiniType[core.$ZodBigIntInternals[T]]', 'core.$ZodBigInt[T]', Protocol): ...
class ZodMiniBigIntFormat['Format extends $ZodBigIntFormats = $ZodBigIntFormats']('_ZodMiniType[core.$ZodBigIntFormatInternals[Format]]', Protocol): ...
class ZodMiniBoolean['T = unknown']('_ZodMiniType[core.$ZodBooleanInternals[T]]', Protocol): ...
class ZodMiniCatch['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodCatchInternals[T]]', Protocol): ...
class ZodMiniCIDRv4('_ZodMiniString[core.$ZodCIDRv4Internals]', Protocol): ...
class ZodMiniCIDRv6('_ZodMiniString[core.$ZodCIDRv6Internals]', Protocol): ...

class ZodMiniCodec['A extends SomeType = core.$ZodType', 'B extends SomeType = core.$ZodType'](ZodMiniPipe[A, B], 'core.$ZodCodec[A, B]', Protocol):
    _zod: 'core.$ZodCodecInternals[A, B]'
    self["def"]: 'core.$ZodCodecDef[A, B]'

class ZodMiniCreditCard('_ZodMiniString[core.$ZodCreditCardInternals]', Protocol): ...
class ZodMiniCUID('_ZodMiniString[core.$ZodCUIDInternals]', Protocol): ...
class ZodMiniCUID2('_ZodMiniString[core.$ZodCUID2Internals]', Protocol): ...
class ZodMiniCustom['O = unknown', 'I = unknown']('_ZodMiniType[core.$ZodCustomInternals[O, I]]', Protocol): ...

class ZodMiniCustomStringFormat['Format extends string = string'](ZodMiniStringFormat[Format], 'core.$ZodCustomStringFormat[Format]', Protocol):
    _zod: 'core.$ZodCustomStringFormatInternals[Format]'

class ZodMiniDate['T = unknown']('_ZodMiniType[core.$ZodDateInternals[T]]', Protocol): ...
class ZodMiniDefault['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodDefaultInternals[T]]', Protocol): ...

class ZodMiniDiscriminatedUnion['Options extends readonly SomeType[] = readonly core.$ZodType[]', 'Disc extends string = string'](ZodMiniUnion[Options], Protocol):
    _zod: 'core.$ZodDiscriminatedUnionInternals[Options, Disc]'

class ZodMiniE164('_ZodMiniString[core.$ZodE164Internals]', Protocol): ...
class ZodMiniEmail('_ZodMiniString[core.$ZodEmailInternals]', Protocol): ...
class ZodMiniEmoji('_ZodMiniString[core.$ZodEmojiInternals]', Protocol): ...

class ZodMiniEnum['T extends util.EnumLike = util.EnumLike']('_ZodMiniType[core.$ZodEnumInternals[T]]', Protocol):
    options: 'Array[T[keyof T]]'

class ZodMiniExactOptional['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodExactOptionalInternals[T]]', 'core.$ZodExactOptional[T]', Protocol): ...
class ZodMiniFile('_ZodMiniType[core.$ZodFileInternals]', Protocol): ...
class ZodMiniFloat32(ZodMiniNumberFormat["float32"], Protocol): ...
class ZodMiniFloat64(ZodMiniNumberFormat["float64"], Protocol): ...

class ZodMiniFunction['Args extends core.$ZodFunctionIn = core.$ZodFunctionIn', 'Returns extends core.$ZodFunctionOut = core.$ZodFunctionOut']('_ZodMiniType[core.$ZodFunctionInternals[Args, Returns]]', 'core.$ZodFunction[Args, Returns]', Protocol):
    _def: 'core.$ZodFunctionDef[Args, Returns]'
    _input: 'core.$InferInnerFunctionType[Args, Returns]'
    _output: 'core.$InferOuterFunctionType[Args, Returns]'
    @overload
    def input[
        'const Items extends util.TupleItems',
        'const Rest extends core.$ZodFunctionOut = core.$ZodFunctionOut',
    ](
        self,
        args: Items,
        rest: Rest = ...,
    ) -> ZodMiniFunction[ZodMiniTuple[Items, Rest], Returns]: ...
    @overload
    def input['NewArgs extends core.$ZodFunctionIn'](
        self,
        args: NewArgs,
    ) -> ZodMiniFunction[NewArgs, Returns]: ...
    @overload
    def input(self, *args: 'any[]') -> ZodMiniFunction[any, Returns]: ...
    def output['NewReturns extends core.$ZodFunctionOut'](
        self,
        output: NewReturns,
    ) -> ZodMiniFunction[Args, NewReturns]: ...

class ZodMiniGUID('_ZodMiniString[core.$ZodGUIDInternals]', Protocol): ...
class ZodMiniIBAN('_ZodMiniString[core.$ZodIBANInternals]', Protocol): ...
class ZodMiniInt(ZodMiniNumberFormat["safeint"], Protocol): ...
class ZodMiniInt32(ZodMiniNumberFormat["int32"], Protocol): ...
class ZodMiniInt64(ZodMiniBigIntFormat["int64"], Protocol): ...
class ZodMiniIntersection['A extends SomeType = core.$ZodType', 'B extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodIntersectionInternals[A, B]]', Protocol): ...
class ZodMiniIPv4('_ZodMiniString[core.$ZodIPv4Internals]', Protocol): ...
class ZodMiniIPv6('_ZodMiniString[core.$ZodIPv6Internals]', Protocol): ...

class ZodMiniISODate(schemas.ZodMiniStringFormat["date"], Protocol):
    _zod: 'core.$ZodISODateInternals'

class ZodMiniISODateTime(schemas.ZodMiniStringFormat["datetime"], Protocol):
    _zod: 'core.$ZodISODateTimeInternals'

class ZodMiniISODuration(schemas.ZodMiniStringFormat["duration"], Protocol):
    _zod: 'core.$ZodISODurationInternals'

class ZodMiniISOTime(schemas.ZodMiniStringFormat["time"], Protocol):
    _zod: 'core.$ZodISOTimeInternals'

class ZodMiniJSONSchema(_ZodMiniJSONSchema, Protocol):
    _zod: ZodMiniJSONSchemaInternals

class ZodMiniJSONSchemaInternals(_ZodMiniJSONSchemaInternals, Protocol):
    input: util.JSONType
    output: util.JSONType

class ZodMiniJWT('_ZodMiniString[core.$ZodJWTInternals]', Protocol): ...
class ZodMiniKSUID('_ZodMiniString[core.$ZodKSUIDInternals]', Protocol): ...
class ZodMiniLazy['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodLazyInternals[T]]', Protocol): ...
class ZodMiniLiteral['T extends util.Literal = util.Literal']('_ZodMiniType[core.$ZodLiteralInternals[T]]', Protocol): ...
class ZodMiniMAC('_ZodMiniString[core.$ZodMACInternals]', Protocol): ...
class ZodMiniMap['Key extends SomeType = core.$ZodType', 'Value extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodMapInternals[Key, Value]]', Protocol): ...
class ZodMiniNaN('_ZodMiniType[core.$ZodNaNInternals]', Protocol): ...
class ZodMiniNanoID('_ZodMiniString[core.$ZodNanoIDInternals]', Protocol): ...
class ZodMiniNever('_ZodMiniType[core.$ZodNeverInternals]', Protocol): ...
class ZodMiniNonOptional['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodNonOptionalInternals[T]]', Protocol): ...
class ZodMiniNull('_ZodMiniType[core.$ZodNullInternals]', Protocol): ...
class ZodMiniNullable['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodNullableInternals[T]]', Protocol): ...
class ZodMiniNumber['Input = unknown']('_ZodMiniNumber[core.$ZodNumberInternals[Input]]', 'core.$ZodNumber[Input]', Protocol): ...
class ZodMiniNumberFormat['Format extends core.$ZodNumberFormats = core.$ZodNumberFormats']('_ZodMiniNumber[core.$ZodNumberFormatInternals[Format]]', 'core.$ZodNumberFormat[Format]', Protocol): ...

class ZodMiniObject['out Shape extends core.$ZodShape = core.$ZodShape', 'out Config extends core.$ZodObjectConfig = core.$strip']('ZodMiniType[any, any, core.$ZodObjectInternals[Shape, Config]]', 'core.$ZodObject[Shape, Config]', Protocol):
    shape: Shape

class ZodMiniOptional['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodOptionalInternals[T]]', 'core.$ZodOptional[T]', Protocol): ...
class ZodMiniPipe['A extends SomeType = core.$ZodType', 'B extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodPipeInternals[A, B]]', Protocol): ...
class ZodMiniPrefault['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodPrefaultInternals[T]]', Protocol): ...
class ZodMiniPromise['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodPromiseInternals[T]]', Protocol): ...
class ZodMiniReadonly['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodReadonlyInternals[T]]', Protocol): ...
class ZodMiniRecord['Key extends core.$ZodRecordKey = core.$ZodRecordKey', 'Value extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodRecordInternals[Key, Value]]', Protocol): ...
class ZodMiniSet['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodSetInternals[T]]', Protocol): ...
class ZodMiniString['Input = unknown']('_ZodMiniString[core.$ZodStringInternals[Input]]', 'core.$ZodString[Input]', Protocol): ...
class ZodMiniStringFormat['Format extends string = string']('_ZodMiniString[core.$ZodStringFormatInternals[Format]]', 'core.$ZodStringFormat[Format]', Protocol): ...
class ZodMiniSuccess['T extends SomeType = core.$ZodType']('_ZodMiniType[core.$ZodSuccessInternals[T]]', Protocol): ...
class ZodMiniSymbol('_ZodMiniType[core.$ZodSymbolInternals]', Protocol): ...
class ZodMiniTemplateLiteral['Template extends string = string']('_ZodMiniType[core.$ZodTemplateLiteralInternals[Template]]', Protocol): ...
class ZodMiniTransform['O = unknown', 'I = unknown']('_ZodMiniType[core.$ZodTransformInternals[O, I]]', Protocol): ...
class ZodMiniTuple['T extends util.TupleItems = readonly core.$ZodType[]', 'Rest extends SomeType | null = core.$ZodType | null']('_ZodMiniType[core.$ZodTupleInternals[T, Rest]]', Protocol): ...

class ZodMiniType['out Output = unknown', 'out Input = unknown', 'out Internals extends core.$ZodTypeInternals[Output, Input] = core.$ZodTypeInternals[Output, Input]']('core.$ZodType[Output, Input, Internals]', Protocol):
    self["def"]: Internals["def"]
    type: 'Internals["def"]["type"]'
    def apply[T, 'TArgs extends unknown[] = []'](
        self,
        fn: '(schema: this, ...args: TArgs) => T',
        *args: TArgs,
    ) -> T: ...
    def brand['T extends PropertyKey = PropertyKey', 'Dir extends "in" | "out" | "inout" = "out"'](
        self,
        value: T = ...,
    ) -> 'PropertyKey extends T ? this : core.$ZodBranded[this, T, Dir]': ...
    def check(
        self,
        *checks: '(core.CheckFn[core.output[this]] | core.$ZodCheck[core.output[this]])[]',
    ) -> this: ...
    def clone(self, def_: Internals["def"] = ..., params: '{ parent: boolean }' = ...) -> this: ...
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
    def register['R extends core.$ZodRegistry'](
        self,
        registry: R,
        *meta: '<this extends R["_schema"] ? undefined extends R["_meta"] ? … (157 chars, #945f10f3)>',
    ) -> this: ...
    def safeParse(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> util.SafeParseResult[core.output[this]]: ...
    def safeParseAsync(
        self,
        data: unknown,
        params: 'core.ParseContext[core.$ZodIssue]' = ...,
    ) -> Promise[util.SafeParseResult[core.output[this]]]: ...
    def with_(
        self,
        *checks: '(core.CheckFn[core.output[this]] | core.$ZodCheck[core.output[this]])[]',
    ) -> this: ...

class ZodMiniUInt32(ZodMiniNumberFormat["uint32"], Protocol): ...
class ZodMiniUInt64(ZodMiniBigIntFormat["uint64"], Protocol): ...
class ZodMiniULID('_ZodMiniString[core.$ZodULIDInternals]', Protocol): ...
class ZodMiniUndefined('_ZodMiniType[core.$ZodUndefinedInternals]', Protocol): ...
class ZodMiniUnion['T extends readonly SomeType[] = readonly core.$ZodType[]']('_ZodMiniType[core.$ZodUnionInternals[T]]', Protocol): ...
class ZodMiniUnknown('_ZodMiniType[core.$ZodUnknownInternals]', Protocol): ...
class ZodMiniURL('_ZodMiniString[core.$ZodURLInternals]', Protocol): ...
class ZodMiniUUID('_ZodMiniString[core.$ZodUUIDInternals]', Protocol): ...
class ZodMiniVoid('_ZodMiniType[core.$ZodVoidInternals]', Protocol): ...
class ZodMiniXID('_ZodMiniString[core.$ZodXIDInternals]', Protocol): ...
class ZodMiniXor['T extends readonly SomeType[] = readonly core.$ZodType[]']('_ZodMiniType[core.$ZodXorInternals[T]]', Protocol): ...

def _default['T extends SomeType'](
    innerType: T,
    defaultValue: 'util.NoUndefined[core.output[T]] | (() => util.NoUndefined[core.output[T]])',
) -> ZodMiniDefault[T]: ...

@overload
def _function() -> ZodMiniFunction: ...
@overload
def _function['const In extends Array[SomeType] = Array[SomeType]'](
    params: '{ input: In }',
) -> 'ZodMiniFunction[ZodMiniTuple[In, null], core.$ZodFunctionOut]': ...
@overload
def _function[
    'const In extends Array[SomeType] = Array[SomeType]',
    'const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut',
](
    params: '{ input: In; output: Out }',
) -> ZodMiniFunction[ZodMiniTuple[In, null], Out]: ...
@overload
def _function['const In extends core.$ZodFunctionIn = core.$ZodFunctionIn'](
    params: '{ input: In }',
) -> 'ZodMiniFunction[In, core.$ZodFunctionOut]': ...
@overload
def _function['const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut'](
    params: '{ output: Out }',
) -> 'ZodMiniFunction[core.$ZodFunctionIn, Out]': ...
@overload
def _function[
    'In extends core.$ZodFunctionIn = core.$ZodFunctionIn',
    'Out extends core.$ZodFunctionOut = core.$ZodFunctionOut',
](
    params: '{ input: In; output: Out }' = ...,
) -> ZodMiniFunction[In, Out]: ...

def any() -> ZodMiniAny: ...

def array['T extends SomeType'](
    element: T,
    params: 'string | core.$ZodArrayParams' = ...,
) -> ZodMiniArray[T]: ...

def base64(params: 'string | core.$ZodBase64Params' = ...) -> ZodMiniBase64: ...
def base64url(params: 'string | core.$ZodBase64URLParams' = ...) -> ZodMiniBase64URL: ...
def bigint(params: 'string | core.$ZodBigIntParams' = ...) -> ZodMiniBigInt[bigint]: ...
def boolean(params: 'string | core.$ZodBooleanParams' = ...) -> ZodMiniBoolean[boolean]: ...

def catch['T extends SomeType'](
    innerType: T,
    catchValue: 'core.output[T] | ((ctx: core.$ZodCatchCtx) => core.output[T])',
) -> ZodMiniCatch[T]: ...

def catchall['T extends ZodMiniObject', 'U extends SomeType'](
    inst: T,
    catchall: U,
) -> 'ZodMiniObject[T["shape"], core.$catchall[U]]': ...

def check['O = unknown'](
    fn: core.CheckFn[O],
    params: 'string | core.$ZodCustomParams' = ...,
) -> 'core.$ZodCheck[O]': ...

def cidrv4(params: 'string | core.$ZodCIDRv4Params' = ...) -> ZodMiniCIDRv4: ...
def cidrv6(params: 'string | core.$ZodCIDRv6Params' = ...) -> ZodMiniCIDRv6: ...

def codec['const A extends SomeType', 'B extends core.SomeType = core.$ZodType'](
    in_: A,
    out: B,
    params: '<{ decode: (value: core.output[A], payload: … (233 chars, #bbc9e37f)>',
) -> ZodMiniCodec[A, B]: ...

def creditCard(params: 'string | core.$ZodCreditCardParams' = ...) -> ZodMiniCreditCard: ...
def cuid(params: 'string | core.$ZodCUIDParams' = ...) -> ZodMiniCUID: ...
def cuid2(params: 'string | core.$ZodCUID2Params' = ...) -> ZodMiniCUID2: ...

def currencyCode(
    _params: 'string | core.$ZodStringFormatParams' = ...,
) -> ZodMiniCustomStringFormat["currency_code"]: ...

def custom['O = unknown', 'I = O'](
    fn: '(data: O) => unknown' = ...,
    _params: 'string | core.$ZodCustomParams | undefined' = ...,
) -> ZodMiniCustom[O, I]: ...

def date(params: 'string | core.$ZodDateParams' = ...) -> ZodMiniDate[Date]: ...
def deepPartial['T extends core.SomeType'](schema: T) -> DeepPartial[T]: ...

def discriminatedUnion[
    'Types extends readonly [core.$ZodTypeDiscriminable, ...core.$ZodTypeDiscriminable[]]',
    'Disc extends string',
](
    discriminator: Disc,
    options: Types,
    params: 'string | core.$ZodDiscriminatedUnionParams' = ...,
) -> ZodMiniDiscriminatedUnion[Types, Disc]: ...

def e164(params: 'string | core.$ZodE164Params' = ...) -> ZodMiniE164: ...
def email(params: 'string | core.$ZodEmailParams' = ...) -> ZodMiniEmail: ...
def emoji(params: 'string | core.$ZodEmojiParams' = ...) -> ZodMiniEmoji: ...

@overload
def enum['const T extends readonly string[]'](
    values: T,
    params: 'string | core.$ZodEnumParams' = ...,
) -> ZodMiniEnum[util.ToEnum[T[number]]]: ...
@overload
def enum['T extends util.EnumLike'](
    entries: T,
    params: 'string | core.$ZodEnumParams' = ...,
) -> ZodMiniEnum[T]: ...

def exactOptional['T extends SomeType'](innerType: T) -> ZodMiniExactOptional[T]: ...

@overload
def exactPartial['T extends ZodMiniObject'](
    schema: T,
) -> 'ZodMiniObject[{ -readonly [k in keyof T["shape"]]: ZodMiniExactOptional[T["shape"][k]] }, T["_zod"]["config"]]': ...
@overload
def exactPartial['T extends ZodMiniObject', 'M extends util.Mask[keyof T["shape"]]'](
    schema: T,
    mask: 'M & Record[Exclude[keyof M, keyof T["shape"]], never]',
) -> '<ZodMiniObject[{ -readonly [k in keyof T["shape"]]: k … (146 chars, #02878bed)>': ...

def extend['T extends ZodMiniObject', 'U extends core.$ZodLooseShape'](
    schema: T,
    shape: U,
) -> 'ZodMiniObject[util.Extend[T["shape"], util.Writeable[U]], T["_zod"]["config"]]': ...

def file(params: 'string | core.$ZodFileParams' = ...) -> ZodMiniFile: ...
def float32(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodMiniFloat32: ...
def float64(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodMiniFloat64: ...

@overload
def function() -> ZodMiniFunction: ...
@overload
def function['const In extends Array[SomeType] = Array[SomeType]'](
    params: '{ input: In }',
) -> 'ZodMiniFunction[ZodMiniTuple[In, null], core.$ZodFunctionOut]': ...
@overload
def function[
    'const In extends Array[SomeType] = Array[SomeType]',
    'const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut',
](
    params: '{ input: In; output: Out }',
) -> ZodMiniFunction[ZodMiniTuple[In, null], Out]: ...
@overload
def function['const In extends core.$ZodFunctionIn = core.$ZodFunctionIn'](
    params: '{ input: In }',
) -> 'ZodMiniFunction[In, core.$ZodFunctionOut]': ...
@overload
def function['const Out extends core.$ZodFunctionOut = core.$ZodFunctionOut'](
    params: '{ output: Out }',
) -> 'ZodMiniFunction[core.$ZodFunctionIn, Out]': ...
@overload
def function[
    'In extends core.$ZodFunctionIn = core.$ZodFunctionIn',
    'Out extends core.$ZodFunctionOut = core.$ZodFunctionOut',
](
    params: '{ input: In; output: Out }' = ...,
) -> ZodMiniFunction[In, Out]: ...

def guid(params: 'string | core.$ZodGUIDParams' = ...) -> ZodMiniGUID: ...

def hash['Alg extends util.HashAlgorithm', 'Enc extends util.HashEncoding = "hex"'](
    alg: Alg,
    params: '{ enc?: Enc } & core.$ZodStringFormatParams' = ...,
) -> 'ZodMiniCustomStringFormat[`${Alg}_${Enc}`]': ...

def hex(
    _params: 'string | core.$ZodStringFormatParams' = ...,
) -> ZodMiniCustomStringFormat["hex"]: ...

def hostname(
    _params: 'string | core.$ZodStringFormatParams' = ...,
) -> ZodMiniCustomStringFormat["hostname"]: ...

def httpUrl(
    params: 'string | Omit[core.$ZodURLParams, "protocol" | "hostname"]' = ...,
) -> ZodMiniURL: ...

def iban(params: 'string | core.$ZodIBANParams' = ...) -> ZodMiniIBAN: ...

def input['T extends core.$ZodType'](
    schema: T,
) -> schemas.ZodMiniType[core.input[T], core.input[T]]: ...

def instanceof['T extends typeof Class'](
    cls: T,
    params: 'core.$ZodCustomParams' = ...,
) -> ZodMiniCustom[InstanceType[T], InstanceType[T]]: ...

def int(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodMiniInt: ...
def int32(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodMiniInt32: ...
def int64(params: 'string | core.$ZodBigIntFormatParams' = ...) -> ZodMiniInt64: ...

def intersection['T extends SomeType', 'U extends SomeType'](
    left: T,
    right: U,
) -> ZodMiniIntersection[T, U]: ...

def invertCodec['A extends SomeType', 'B extends SomeType'](
    codec: ZodMiniCodec[A, B],
) -> ZodMiniCodec[B, A]: ...

def ipv4(params: 'string | core.$ZodIPv4Params' = ...) -> ZodMiniIPv4: ...
def ipv6(params: 'string | core.$ZodIPv6Params' = ...) -> ZodMiniIPv6: ...
def json() -> ZodMiniJSONSchema: ...
def jwt(params: 'string | core.$ZodJWTParams' = ...) -> ZodMiniJWT: ...
def keyof['T extends ZodMiniObject'](schema: T) -> ZodMiniEnum[util.KeysEnum[T["shape"]]]: ...
def ksuid(params: 'string | core.$ZodKSUIDParams' = ...) -> ZodMiniKSUID: ...
def lazy['T extends SomeType'](getter: '() => T') -> ZodMiniLazy[T]: ...

@overload
def literal['const T extends ReadonlyArray[util.Literal]'](
    value: T,
    params: 'string | core.$ZodLiteralParams' = ...,
) -> ZodMiniLiteral[T[number]]: ...
@overload
def literal['const T extends util.Literal'](
    value: T,
    params: 'string | core.$ZodLiteralParams' = ...,
) -> ZodMiniLiteral[T]: ...

def looseObject['T extends core.$ZodLooseShape'](
    shape: T,
    params: 'string | core.$ZodObjectParams' = ...,
) -> 'ZodMiniObject[util.Writeable[T], core.$loose]': ...

def looseRecord['Key extends core.$ZodRecordKey', 'Value extends SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodRecordParams' = ...,
) -> ZodMiniRecord[Key, Value]: ...

def mac(params: 'string | core.$ZodMACParams' = ...) -> ZodMiniMAC: ...

def map['Key extends SomeType', 'Value extends SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodMapParams' = ...,
) -> ZodMiniMap[Key, Value]: ...

def merge['T extends ZodMiniObject', 'U extends ZodMiniObject'](
    a: T,
    b: U,
) -> 'ZodMiniObject[util.Extend[T["shape"], U["shape"]], U["_zod"]["config"]]': ...

def nan(params: 'string | core.$ZodNaNParams' = ...) -> ZodMiniNaN: ...
def nanoid(params: 'string | core.$ZodNanoIDParams' = ...) -> ZodMiniNanoID: ...

def nativeEnum['T extends util.EnumLike'](
    entries: T,
    params: 'string | core.$ZodEnumParams' = ...,
) -> ZodMiniEnum[T]: ...

def never(params: 'string | core.$ZodNeverParams' = ...) -> ZodMiniNever: ...

def nonoptional['T extends SomeType'](
    innerType: T,
    params: 'string | core.$ZodNonOptionalParams' = ...,
) -> ZodMiniNonOptional[T]: ...

def null(params: 'string | core.$ZodNullParams' = ...) -> ZodMiniNull: ...
def nullable['T extends SomeType'](innerType: T) -> ZodMiniNullable[T]: ...
def nullish['T extends SomeType'](innerType: T) -> ZodMiniOptional[ZodMiniNullable[T]]: ...
def number(params: 'string | core.$ZodNumberParams' = ...) -> ZodMiniNumber[number]: ...

def object['T extends core.$ZodLooseShape = Record[never, SomeType]'](
    shape: T = ...,
    params: 'string | core.$ZodObjectParams' = ...,
) -> 'ZodMiniObject[util.Writeable[T], core.$strip]': ...

def omit['T extends ZodMiniObject', 'M extends util.Mask[keyof T["shape"]]'](
    schema: T,
    mask: 'M & Record[Exclude[keyof M, keyof T["shape"]], never]',
) -> 'ZodMiniObject[util.Flatten[Omit[T["shape"], keyof M]], T["_zod"]["config"]]': ...

def optional['T extends SomeType'](innerType: T) -> ZodMiniOptional[T]: ...

def output['T extends core.$ZodType'](
    schema: T,
) -> schemas.ZodMiniType[core.output[T], core.output[T]]: ...

@overload
def partial['T extends ZodMiniObject'](
    schema: T,
) -> 'ZodMiniObject[{ -readonly [k in keyof T["shape"]]: ZodMiniOptional[T["shape"][k]] }, T["_zod"]["config"]]': ...
@overload
def partial['T extends ZodMiniObject', 'M extends util.Mask[keyof T["shape"]]'](
    schema: T,
    mask: 'M & Record[Exclude[keyof M, keyof T["shape"]], never]',
) -> '<ZodMiniObject[{ -readonly [k in keyof T["shape"]]: k … (141 chars, #de2e0d6f)>': ...
@overload
def partial['T extends util.TupleItems', 'Rest extends SomeType | null'](
    schema: ZodMiniTuple[T, Rest],
) -> 'ZodMiniTuple[{ -readonly [k in keyof T]: ZodMiniOptional[T[k]] }, Rest]': ...

def partialRecord['Key extends core.$ZodRecordKey', 'Value extends SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodRecordParams' = ...,
) -> 'ZodMiniRecord[Key & core.$partial, Value]': ...

def pick['T extends ZodMiniObject', 'M extends util.Mask[keyof T["shape"]]'](
    schema: T,
    mask: 'M & Record[Exclude[keyof M, keyof T["shape"]], never]',
) -> 'ZodMiniObject[util.Flatten[Pick[T["shape"], keyof T["shape"] & keyof M]], T["_zod"]["config"]]': ...

def pipe[
    'const A extends SomeType',
    'B extends core.$ZodType[unknown, core.output[A]] = core.$ZodType[unknown, core.output[A]]',
](
    in_: A,
    out: 'B | core.$ZodType[unknown, core.output[A]]',
) -> ZodMiniPipe[A, B]: ...

def prefault['T extends SomeType'](
    innerType: T,
    defaultValue: 'core.input[T] | (() => core.input[T])',
) -> ZodMiniPrefault[T]: ...

def promise['T extends SomeType'](innerType: T) -> ZodMiniPromise[T]: ...
def readonly['T extends SomeType'](innerType: T) -> ZodMiniReadonly[T]: ...

def record['Key extends core.$ZodRecordKey', 'Value extends SomeType'](
    keyType: Key,
    valueType: Value,
    params: 'string | core.$ZodRecordParams' = ...,
) -> ZodMiniRecord[Key, Value]: ...

def refine[T](
    fn: '(arg: NoInfer[T]) => util.MaybeAsync[unknown]',
    _params: 'string | core.$ZodCustomParams' = ...,
) -> 'core.$ZodCheck[T]': ...

@overload
def required['T extends ZodMiniObject'](
    schema: T,
) -> 'ZodMiniObject[{ -readonly [k in keyof T["shape"]]: ZodMiniNonOptional[T["shape"][k]] }, T["_zod"]["config"]]': ...
@overload
def required['T extends ZodMiniObject', 'M extends util.Mask[keyof T["shape"]]'](
    schema: T,
    mask: 'M & Record[Exclude[keyof M, keyof T["shape"]], never]',
) -> '<ZodMiniObject[util.Extend[T["shape"], { [k in keyof M & … (133 chars, #0842c3fb)>': ...

def safeExtend['T extends ZodMiniObject', 'U extends core.$ZodLooseShape'](
    schema: T,
    shape: SafeExtendShape[T["shape"], U],
) -> 'ZodMiniObject[util.Extend[T["shape"], util.Writeable[U]], T["_zod"]["config"]]': ...

def set['Value extends SomeType'](
    valueType: Value,
    params: 'string | core.$ZodSetParams' = ...,
) -> ZodMiniSet[Value]: ...

def strictObject['T extends core.$ZodLooseShape'](
    shape: T,
    params: 'string | core.$ZodObjectParams' = ...,
) -> 'ZodMiniObject[util.Writeable[T], core.$strict]': ...

def string(params: 'string | core.$ZodStringParams' = ...) -> ZodMiniString[string]: ...

def stringFormat['Format extends string'](
    format: Format,
    fnOrRegex: '((arg: string) => util.MaybeAsync[unknown]) | RegExp',
    _params: 'string | core.$ZodStringFormatParams' = ...,
) -> ZodMiniCustomStringFormat[Format]: ...

def success['T extends SomeType'](innerType: T) -> ZodMiniSuccess[T]: ...

def superRefine[T](
    fn: '(arg: T, payload: core.$RefinementCtx[T]) => void | Promise[void]',
    params: 'core.$ZodSuperRefineParams' = ...,
) -> 'core.$ZodCheck[T]': ...

def symbol(params: 'string | core.$ZodSymbolParams' = ...) -> ZodMiniSymbol: ...

def templateLiteral['const Parts extends core.$ZodTemplateLiteralPart[]'](
    parts: Parts,
    params: 'string | core.$ZodTemplateLiteralParams' = ...,
) -> 'ZodMiniTemplateLiteral[core.$PartsToTemplateLiteral[Parts]]': ...

def transform['I = unknown', 'O = I'](
    fn: '(input: I, ctx: core.ParsePayload) => O',
) -> ZodMiniTransform[Awaited[O], I]: ...

@overload
def tuple['const T extends readonly [SomeType, ...SomeType[]]'](
    items: T,
    params: 'string | core.$ZodTupleParams' = ...,
) -> ZodMiniTuple[T, null]: ...
@overload
def tuple['const T extends readonly [SomeType, ...SomeType[]]', 'Rest extends SomeType'](
    items: T,
    rest: Rest,
    params: 'string | core.$ZodTupleParams' = ...,
) -> ZodMiniTuple[T, Rest]: ...
@overload
def tuple(items: '[]', params: 'string | core.$ZodTupleParams' = ...) -> ZodMiniTuple[[], null]: ...

def uint32(params: 'string | core.$ZodCheckNumberFormatParams' = ...) -> ZodMiniUInt32: ...
def uint64(params: 'string | core.$ZodBigIntFormatParams' = ...) -> ZodMiniUInt64: ...
def ulid(params: 'string | core.$ZodULIDParams' = ...) -> ZodMiniULID: ...
def undefined(params: 'string | core.$ZodUndefinedParams' = ...) -> ZodMiniUndefined: ...

def union['const T extends readonly SomeType[]'](
    options: T,
    params: 'string | core.$ZodUnionParams' = ...,
) -> ZodMiniUnion[T]: ...

def unknown() -> ZodMiniUnknown: ...
def url(params: 'string | core.$ZodURLParams' = ...) -> ZodMiniURL: ...
def uuid(params: 'string | core.$ZodUUIDParams' = ...) -> ZodMiniUUID: ...
def uuidv4(params: 'string | core.$ZodUUIDv4Params' = ...) -> ZodMiniUUID: ...
def uuidv6(params: 'string | core.$ZodUUIDv6Params' = ...) -> ZodMiniUUID: ...
def uuidv7(params: 'string | core.$ZodUUIDv7Params' = ...) -> ZodMiniUUID: ...
def void(params: 'string | core.$ZodVoidParams' = ...) -> ZodMiniVoid: ...
def xid(params: 'string | core.$ZodXIDParams' = ...) -> ZodMiniXID: ...

def xor['const T extends readonly SomeType[]'](
    options: T,
    params: 'string | core.$ZodXorParams' = ...,
) -> ZodMiniXor[T]: ...

coerce: namespace
describe: '<inferred>'
iso: namespace
meta: '<inferred>'
stringbool: '(_params?: string | core.$ZodStringBoolParams) => ZodMiniCodec[ZodMiniString, ZodMiniBoolean]'
z: namespace
ZodMiniAny: 'core.$constructor[ZodMiniAny]'
ZodMiniArray: 'core.$constructor[ZodMiniArray]'
ZodMiniBase64: 'core.$constructor[ZodMiniBase64]'
ZodMiniBase64URL: 'core.$constructor[ZodMiniBase64URL]'
ZodMiniBigInt: 'core.$constructor[ZodMiniBigInt]'
ZodMiniBigIntFormat: 'core.$constructor[ZodMiniBigIntFormat]'
ZodMiniBoolean: 'core.$constructor[ZodMiniBoolean]'
ZodMiniCatch: 'core.$constructor[ZodMiniCatch]'
ZodMiniCIDRv4: 'core.$constructor[ZodMiniCIDRv4]'
ZodMiniCIDRv6: 'core.$constructor[ZodMiniCIDRv6]'
ZodMiniCodec: 'core.$constructor[ZodMiniCodec]'
ZodMiniCreditCard: 'core.$constructor[ZodMiniCreditCard]'
ZodMiniCUID: 'core.$constructor[ZodMiniCUID]'
ZodMiniCUID2: 'core.$constructor[ZodMiniCUID2]'
ZodMiniCustom: 'core.$constructor[ZodMiniCustom]'
ZodMiniCustomStringFormat: 'core.$constructor[ZodMiniCustomStringFormat]'
ZodMiniDate: 'core.$constructor[ZodMiniDate]'
ZodMiniDefault: 'core.$constructor[ZodMiniDefault]'
ZodMiniDiscriminatedUnion: 'core.$constructor[ZodMiniDiscriminatedUnion]'
ZodMiniE164: 'core.$constructor[ZodMiniE164]'
ZodMiniEmail: 'core.$constructor[ZodMiniEmail]'
ZodMiniEmoji: 'core.$constructor[ZodMiniEmoji]'
ZodMiniEnum: 'core.$constructor[ZodMiniEnum]'
ZodMiniExactOptional: 'core.$constructor[ZodMiniExactOptional]'
ZodMiniFile: 'core.$constructor[ZodMiniFile]'
ZodMiniFunction: 'core.$constructor[ZodMiniFunction]'
ZodMiniGUID: 'core.$constructor[ZodMiniGUID]'
ZodMiniIBAN: 'core.$constructor[ZodMiniIBAN]'
ZodMiniIntersection: 'core.$constructor[ZodMiniIntersection]'
ZodMiniIPv4: 'core.$constructor[ZodMiniIPv4]'
ZodMiniIPv6: 'core.$constructor[ZodMiniIPv6]'
ZodMiniISODate: 'core.$constructor[ZodMiniISODate]'
ZodMiniISODateTime: 'core.$constructor[ZodMiniISODateTime]'
ZodMiniISODuration: 'core.$constructor[ZodMiniISODuration]'
ZodMiniISOTime: 'core.$constructor[ZodMiniISOTime]'
ZodMiniJWT: 'core.$constructor[ZodMiniJWT]'
ZodMiniKSUID: 'core.$constructor[ZodMiniKSUID]'
ZodMiniLazy: 'core.$constructor[ZodMiniLazy]'
ZodMiniLiteral: 'core.$constructor[ZodMiniLiteral]'
ZodMiniMAC: 'core.$constructor[ZodMiniMAC]'
ZodMiniMap: 'core.$constructor[ZodMiniMap]'
ZodMiniNaN: 'core.$constructor[ZodMiniNaN]'
ZodMiniNanoID: 'core.$constructor[ZodMiniNanoID]'
ZodMiniNever: 'core.$constructor[ZodMiniNever]'
ZodMiniNonOptional: 'core.$constructor[ZodMiniNonOptional]'
ZodMiniNull: 'core.$constructor[ZodMiniNull]'
ZodMiniNullable: 'core.$constructor[ZodMiniNullable]'
ZodMiniNumber: 'core.$constructor[ZodMiniNumber]'
ZodMiniNumberFormat: 'core.$constructor[ZodMiniNumberFormat]'
ZodMiniObject: 'core.$constructor[ZodMiniObject]'
ZodMiniOptional: 'core.$constructor[ZodMiniOptional]'
ZodMiniPipe: 'core.$constructor[ZodMiniPipe]'
ZodMiniPrefault: 'core.$constructor[ZodMiniPrefault]'
ZodMiniPromise: 'core.$constructor[ZodMiniPromise]'
ZodMiniReadonly: 'core.$constructor[ZodMiniReadonly]'
ZodMiniRecord: 'core.$constructor[ZodMiniRecord]'
ZodMiniSet: 'core.$constructor[ZodMiniSet]'
ZodMiniString: 'core.$constructor[ZodMiniString]'
ZodMiniStringFormat: 'core.$constructor[ZodMiniStringFormat]'
ZodMiniSuccess: 'core.$constructor[ZodMiniSuccess]'
ZodMiniSymbol: 'core.$constructor[ZodMiniSymbol]'
ZodMiniTemplateLiteral: 'core.$constructor[ZodMiniTemplateLiteral]'
ZodMiniTransform: 'core.$constructor[ZodMiniTransform]'
ZodMiniTuple: 'core.$constructor[ZodMiniTuple]'
ZodMiniType: 'core.$constructor[ZodMiniType]'
ZodMiniULID: 'core.$constructor[ZodMiniULID]'
ZodMiniUndefined: 'core.$constructor[ZodMiniUndefined]'
ZodMiniUnion: 'core.$constructor[ZodMiniUnion]'
ZodMiniUnknown: 'core.$constructor[ZodMiniUnknown]'
ZodMiniURL: 'core.$constructor[ZodMiniURL]'
ZodMiniUUID: 'core.$constructor[ZodMiniUUID]'
ZodMiniVoid: 'core.$constructor[ZodMiniVoid]'
ZodMiniXID: 'core.$constructor[ZodMiniXID]'
ZodMiniXor: 'core.$constructor[ZodMiniXor]'
