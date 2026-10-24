"""Zod 4 core: the schema engine both APIs build on (zod/v4/core)."""

__module__ = "zod.core"
__paths__ = ["packages/zod/src/v4/core/**"]
__entry__ = "packages/zod/src/v4/core/index.ts"
__depends_on__ = ["zod.locales"]

from .zod.locales import locales

_brand: TypeAlias['T extends string | number | symbol = string | number | symbol'] = '{ [$brand]: { [k in T]: true } }'
_catchall: TypeAlias['T extends SomeType'] = '{ out: { [k: string]: core.output[T] }; in: { [k: string]: core.input[T] } }'
_Decode: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (150 chars, #da706be2)>'
_DecodeAsync: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (159 chars, #b038742f)>'
_DiscriminatedOption: TypeAlias['Options extends readonly SomeType[]', 'Disc extends string', V] = '<{ [I in keyof Options]: Options[I] extends { _zod: { … (168 chars, #30b8e356)>'
_DiscriminatorValue: TypeAlias['Options extends readonly SomeType[]', 'Disc extends string'] = '<{ [I in keyof Options]: Options[I] extends { _zod: { … (137 chars, #2f903c53)>'
_Encode: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (150 chars, #bf989758)>'
_EncodeAsync: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (159 chars, #8644c94d)>'
_InferEnumInput: TypeAlias['T extends util.EnumLike'] = 'T[keyof T] & {}'
_InferEnumOutput: TypeAlias['T extends util.EnumLike'] = 'T[keyof T] & {}'
_InferInnerFunctionType: TypeAlias['Args extends $ZodFunctionIn', 'Returns extends $ZodFunctionOut'] = '(...args: $ZodFunctionIn extends Args ? never[] : core.output[Args]) => core.input[Returns]'
_InferInnerFunctionTypeAsync: TypeAlias['Args extends $ZodFunctionIn', 'Returns extends $ZodFunctionOut'] = '(...args: $ZodFunctionIn extends Args ? never[] : core.output[Args]) => util.MaybeAsync[core.input[Returns]]'
_InferObjectInput: TypeAlias['T extends $ZodLooseShape', 'Extra extends Record[string, unknown]'] = '<string extends keyof T ? util.IsAny[T[keyof T]] extends … (410 chars, #9b2b5df3)>'
_InferObjectOutput: TypeAlias['T extends $ZodLooseShape', 'Extra extends Record[string, unknown]'] = '<string extends keyof T ? util.IsAny[T[keyof T]] extends … (415 chars, #41f970e8)>'
_InferOuterFunctionType: TypeAlias['Args extends $ZodFunctionIn', 'Returns extends $ZodFunctionOut'] = '(...args: $ZodFunctionIn extends Args ? never[] : core.input[Args]) => core.output[Returns]'
_InferOuterFunctionTypeAsync: TypeAlias['Args extends $ZodFunctionIn', 'Returns extends $ZodFunctionOut'] = '(...args: $ZodFunctionIn extends Args ? never[] : core.input[Args]) => Promise[core.output[Returns]]'
_InferTupleInputType: TypeAlias['T extends util.TupleItems', 'Rest extends SomeType | null'] = '[...TupleInputTypeWithOptionals[T], ...(Rest extends SomeType ? core.input[Rest][] : [])]'
_InferTupleOutputType: TypeAlias['T extends util.TupleItems', 'Rest extends SomeType | null'] = '[...TupleOutputTypeWithOptionals[T], ...(Rest extends SomeType ? core.output[Rest][] : [])]'
_InferUnionInput: TypeAlias['T extends SomeType'] = 'T extends any ? core.input[T] : never'
_InferUnionOutput: TypeAlias['T extends SomeType'] = 'T extends any ? core.output[T] : never'
_InferZodRecordInput: TypeAlias['Key extends $ZodRecordKey = $ZodRecordKey', 'Value extends SomeType = $ZodType'] = '<Key extends $partial ? Partial[Record[core.input[Key] & … (252 chars, #14e3be5c)>'
_InferZodRecordOutput: TypeAlias['Key extends $ZodRecordKey = $ZodRecordKey', 'Value extends SomeType = $ZodType'] = '<Key extends $partial ? Partial[Record[core.output[Key], … (123 chars, #7b6d1218)>'
_input: TypeAlias = 'typeof $input'
_loose: TypeAlias = '{ out: Record[string, unknown]; in: Record[string, unknown] }'
_output: TypeAlias = 'typeof $output'
_Parse: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: unknown, … (144 chars, #eec6888a)>'
_ParseAsync: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: unknown, … (153 chars, #67e4f9b0)>'
_partial: TypeAlias = '{ "~~partial": true }'
_PartsToTemplateLiteral: TypeAlias['Parts extends $ZodTemplateLiteralPart[]'] = '<[] extends Parts ? `` : Parts extends [...infer Rest, infer … (217 chars, #39e498d2)>'
_replace: TypeAlias[Meta, 'S extends $ZodType'] = '<Meta extends $output ? core.output[S] : Meta extends $input … (310 chars, #b92c70b0)>'
_SafeDecode: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (148 chars, #c2c7134e)>'
_SafeDecodeAsync: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (157 chars, #4c41d759)>'
_SafeEncode: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (148 chars, #eab083e1)>'
_SafeEncodeAsync: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: … (157 chars, #8a1548fc)>'
_SafeParse: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: unknown, … (142 chars, #e4ee7c95)>'
_SafeParseAsync: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: unknown, … (151 chars, #1e1e44e4)>'
_strict: TypeAlias = '{ out: {}; in: {} }'
_strip: TypeAlias = '{ out: {}; in: {} }'
_Validate: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: unknown, … (128 chars, #c8177a81)>'
_ValidateAsync: TypeAlias = '<[T extends schemas.$ZodType](schema: T, value: unknown, … (122 chars, #02f1f2a4)>'
_ZodAnyParams: TypeAlias = 'TypeParams[schemas.$ZodAny]'
_ZodArrayParams: TypeAlias = 'TypeParams[schemas.$ZodArray, "element"]'
_ZodBase64Params: TypeAlias = 'StringFormatParams[schemas.$ZodBase64, "pattern" | "when"]'
_ZodBase64URLParams: TypeAlias = 'StringFormatParams[schemas.$ZodBase64URL, "pattern" | "when"]'
_ZodBigIntFormatParams: TypeAlias = 'CheckTypeParams[schemas.$ZodBigIntFormat, "format" | "coerce"]'
_ZodBigIntFormats: TypeAlias = '"int64" | "uint64"'
_ZodBigIntParams: TypeAlias = 'TypeParams[schemas.$ZodBigInt[bigint]]'
_ZodBooleanParams: TypeAlias = 'TypeParams[schemas.$ZodBoolean[boolean], "coerce"]'
_ZodBranded: TypeAlias['T extends schemas.SomeType', 'Brand extends string | number | symbol', 'Dir extends "in" | "out" | "inout" = "out"'] = '<T & (Dir extends "inout" ? { _zod: { input: input[T] & … (225 chars, #dace3861)>'
_ZodCatchParams: TypeAlias = 'TypeParams[schemas.$ZodCatch, "innerType" | "catchValue"]'
_ZodCheckBase64Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodBase64, "pattern" | "when"]'
_ZodCheckBase64URLParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodBase64URL, "pattern" | "when"]'
_ZodCheckBigIntFormatParams: TypeAlias = 'CheckParams[checks.$ZodCheckBigIntFormat, "format" | "when"]'
_ZodCheckCIDRv4Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodCIDRv4, "pattern" | "when"]'
_ZodCheckCIDRv6Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodCIDRv6, "pattern" | "when"]'
_ZodCheckCreditCardParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodCreditCard, "pattern" | "when"]'
_ZodCheckCUID2Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodCUID2, "when"]'
_ZodCheckCUIDParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodCUID, "when"]'
_ZodCheckE164Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodE164, "when"]'
_ZodCheckEmailParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodEmail, "when"]'
_ZodCheckEmojiParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodEmoji, "when"]'
_ZodCheckEndsWithParams: TypeAlias = 'CheckParams[checks.$ZodCheckEndsWith, "suffix" | "format" | "pattern" | "when"]'
_ZodCheckGreaterThanParams: TypeAlias = 'CheckParams[checks.$ZodCheckGreaterThan, "inclusive" | "value" | "when"]'
_ZodCheckGUIDParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodGUID, "pattern" | "when"]'
_ZodCheckIBANParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodIBAN, "pattern" | "when"]'
_ZodCheckIncludesParams: TypeAlias = 'CheckParams[checks.$ZodCheckIncludes, "includes" | "format" | "when" | "pattern"]'
_ZodCheckIPv4Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodIPv4, "pattern" | "when" | "version"]'
_ZodCheckIPv6Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodIPv6, "pattern" | "when" | "version"]'
_ZodCheckISODateParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodISODate, "pattern" | "when"]'
_ZodCheckISODateTimeParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodISODateTime, "pattern" | "when"]'
_ZodCheckISODurationParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodISODuration, "when"]'
_ZodCheckISOTimeParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodISOTime, "pattern" | "when"]'
_ZodCheckJWTParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodJWT, "pattern" | "when"]'
_ZodCheckKSUIDParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodKSUID, "when"]'
_ZodCheckLengthEqualsParams: TypeAlias = 'CheckParams[checks.$ZodCheckLengthEquals, "length" | "when"]'
_ZodCheckLessThanParams: TypeAlias = 'CheckParams[checks.$ZodCheckLessThan, "inclusive" | "value" | "when"]'
_ZodCheckLowerCaseParams: TypeAlias = 'CheckParams[checks.$ZodCheckLowerCase, "format" | "when"]'
_ZodCheckMACParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodMAC, "pattern" | "when"]'
_ZodCheckMaxLengthParams: TypeAlias = 'CheckParams[checks.$ZodCheckMaxLength, "maximum" | "when"]'
_ZodCheckMaxSizeParams: TypeAlias = 'CheckParams[checks.$ZodCheckMaxSize, "maximum" | "when"]'
_ZodCheckMimeTypeParams: TypeAlias = 'CheckParams[checks.$ZodCheckMimeType, "mime" | "when"]'
_ZodCheckMinLengthParams: TypeAlias = 'CheckParams[checks.$ZodCheckMinLength, "minimum" | "when"]'
_ZodCheckMinSizeParams: TypeAlias = 'CheckParams[checks.$ZodCheckMinSize, "minimum" | "when"]'
_ZodCheckMultipleOfParams: TypeAlias = 'CheckParams[checks.$ZodCheckMultipleOf, "value" | "when"]'
_ZodCheckNanoIDParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodNanoID, "when" | "pattern"]'
_ZodCheckNumberFormatParams: TypeAlias = 'CheckParams[checks.$ZodCheckNumberFormat, "format" | "when"]'
_ZodCheckPropertiesInput: TypeAlias['Shape extends schemas.$ZodShape = schemas.$ZodShape'] = '{ -readonly [k in keyof Shape]: util.Widen[core.input[Shape[k]]] }'
_ZodCheckPropertiesParams: TypeAlias = 'CheckParams[checks.$ZodCheckProperties, "shape" | "when"]'
_ZodCheckPropertyParams: TypeAlias = 'CheckParams[checks.$ZodCheckProperty, "property" | "schema" | "when"]'
_ZodCheckRegexParams: TypeAlias = 'CheckParams[checks.$ZodCheckRegex, "format" | "pattern" | "when"]'
_ZodChecks: TypeAlias = '<$ZodCheckLessThan | $ZodCheckGreaterThan | … (321 chars, #b7ce000b)>'
_ZodCheckSizeEqualsParams: TypeAlias = 'CheckParams[checks.$ZodCheckSizeEquals, "size" | "when"]'
_ZodCheckStartsWithParams: TypeAlias = 'CheckParams[checks.$ZodCheckStartsWith, "prefix" | "format" | "when" | "pattern"]'
_ZodCheckStringFormatParams: TypeAlias = 'CheckParams[checks.$ZodCheckStringFormat, "format"]'
_ZodCheckULIDParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodULID, "when"]'
_ZodCheckUpperCaseParams: TypeAlias = 'CheckParams[checks.$ZodCheckUpperCase, "format" | "when"]'
_ZodCheckURLParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodURL, "when"]'
_ZodCheckUUIDParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodCheckUUIDv4Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodCheckUUIDv6Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodCheckUUIDv7Params: TypeAlias = 'CheckStringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodCheckXIDParams: TypeAlias = 'CheckStringFormatParams[schemas.$ZodXID, "when"]'
_ZodCIDRv4Params: TypeAlias = 'StringFormatParams[schemas.$ZodCIDRv4, "pattern" | "when"]'
_ZodCIDRv6Params: TypeAlias = 'StringFormatParams[schemas.$ZodCIDRv6, "pattern" | "when"]'
_ZodCreditCardParams: TypeAlias = 'StringFormatParams[schemas.$ZodCreditCard, "pattern" | "when"]'
_ZodCUID2Params: TypeAlias = 'StringFormatParams[schemas.$ZodCUID2, "when"]'
_ZodCUIDParams: TypeAlias = 'StringFormatParams[schemas.$ZodCUID, "when"]'
_ZodCustomParams: TypeAlias = 'CheckTypeParams[schemas.$ZodCustom, "fn"]'
_ZodDateParams: TypeAlias = 'TypeParams[schemas.$ZodDate, "coerce"]'
_ZodDefaultParams: TypeAlias = 'TypeParams[schemas.$ZodDefault, "innerType" | "defaultValue"]'
_ZodDiscriminatedUnionParams: TypeAlias = 'TypeParams[schemas.$ZodDiscriminatedUnion, "options" | "discriminator"]'
_ZodE164Params: TypeAlias = 'StringFormatParams[schemas.$ZodE164, "when"]'
_ZodEmailParams: TypeAlias = 'StringFormatParams[schemas.$ZodEmail, "when"]'
_ZodEmojiParams: TypeAlias = 'StringFormatParams[schemas.$ZodEmoji, "when"]'
_ZodEnumParams: TypeAlias = 'TypeParams[schemas.$ZodEnum, "entries"]'
_ZodErrorClass: TypeAlias = '{ new (issues: errors.$ZodIssue[]): errors.$ZodError }'
_ZodErrorTree: TypeAlias[T, 'U = string'] = '<T extends util.Primitive ? { errors: U[] } : T extends … (334 chars, #97c24d6c)>'
_ZodFileParams: TypeAlias = 'TypeParams[schemas.$ZodFile]'
_ZodFlattenedError: TypeAlias[T, 'U = string'] = _FlattenedError[T, U]
_ZodFormattedError: TypeAlias[T, 'U = string'] = '{ _errors: U[] } & util.Flatten[_ZodFormattedError[T, U]]'
_ZodFunctionArgs: TypeAlias = '$ZodType[unknown[], unknown[]]'
_ZodFunctionIn: TypeAlias = '$ZodFunctionArgs'
_ZodFunctionOut: TypeAlias = '$ZodType'
_ZodGUIDParams: TypeAlias = 'StringFormatParams[schemas.$ZodGUID, "pattern" | "when"]'
_ZodIBANParams: TypeAlias = 'StringFormatParams[schemas.$ZodIBAN, "pattern" | "when"]'
_ZodInternalIssue: TypeAlias['T extends $ZodIssueBase = $ZodIssue'] = 'T extends any ? RawIssue[T] : never'
_ZodIntersectionParams: TypeAlias = 'TypeParams[schemas.$ZodIntersection, "left" | "right"]'
_ZodInvalidTypeExpected: TypeAlias = '<"string" | "number" | "int" | "boolean" | "bigint" | … (232 chars, #ee7bd46e)>'
_ZodIPv4Params: TypeAlias = 'StringFormatParams[schemas.$ZodIPv4, "pattern" | "when" | "version"]'
_ZodIPv6Params: TypeAlias = 'StringFormatParams[schemas.$ZodIPv6, "pattern" | "when" | "version"]'
_ZodISODateParams: TypeAlias = 'StringFormatParams[schemas.$ZodISODate, "pattern" | "when"]'
_ZodISODateTimeParams: TypeAlias = 'StringFormatParams[schemas.$ZodISODateTime, "pattern" | "when"]'
_ZodISODurationParams: TypeAlias = 'StringFormatParams[schemas.$ZodISODuration, "when"]'
_ZodISOTimeParams: TypeAlias = 'StringFormatParams[schemas.$ZodISOTime, "pattern" | "when"]'
_ZodIssue: TypeAlias = '<$ZodIssueInvalidType | $ZodIssueTooBig | $ZodIssueTooSmall … (256 chars, #4714ae55)>'
_ZodIssueCode: TypeAlias = '$ZodIssue["code"]'
_ZodIssueInvalidUnion: TypeAlias = '$ZodIssueInvalidUnionNoMatch | $ZodIssueInvalidUnionMultipleMatch'
_ZodJWTParams: TypeAlias = 'StringFormatParams[schemas.$ZodJWT, "pattern" | "when"]'
_ZodKSUIDParams: TypeAlias = 'StringFormatParams[schemas.$ZodKSUID, "when"]'
_ZodLazyParams: TypeAlias = 'TypeParams[schemas.$ZodLazy, "getter"]'
_ZodLiteralParams: TypeAlias = 'TypeParams[schemas.$ZodLiteral, "values"]'
_ZodLooseShape: TypeAlias = Record[string, any]
_ZodMACParams: TypeAlias = 'StringFormatParams[schemas.$ZodMAC, "pattern" | "when"]'
_ZodMapParams: TypeAlias = 'TypeParams[schemas.$ZodMap, "keyType" | "valueType"]'
_ZodNanoIDParams: TypeAlias = 'StringFormatParams[schemas.$ZodNanoID, "when" | "pattern"]'
_ZodNaNParams: TypeAlias = 'TypeParams[schemas.$ZodNaN]'
_ZodNarrow: TypeAlias['T extends schemas.SomeType', Out] = 'T & { _zod: { output: Out } }'
_ZodNeverParams: TypeAlias = 'TypeParams[schemas.$ZodNever]'
_ZodNonOptionalParams: TypeAlias = 'TypeParams[schemas.$ZodNonOptional, "innerType"]'
_ZodNullableParams: TypeAlias = 'TypeParams[schemas.$ZodNullable, "innerType"]'
_ZodNullParams: TypeAlias = 'TypeParams[schemas.$ZodNull]'
_ZodNumberFormatParams: TypeAlias = 'CheckTypeParams[schemas.$ZodNumberFormat, "format" | "coerce"]'
_ZodNumberFormats: TypeAlias = '"int32" | "uint32" | "float32" | "float64" | "safeint"'
_ZodNumberParams: TypeAlias = 'TypeParams[schemas.$ZodNumber[number], "coerce"] & { checks?: readonly checks.$ZodCheck[number][] }'
_ZodObjectConfig: TypeAlias = '{ out: Record[string, unknown]; in: Record[string, unknown] }'
_ZodObjectParams: TypeAlias = 'TypeParams[schemas.$ZodObject, "shape" | "catchall"]'
_ZodOptionalParams: TypeAlias = 'TypeParams[schemas.$ZodOptional, "innerType"]'
_ZodPipeParams: TypeAlias = 'TypeParams[schemas.$ZodPipe, "in" | "out"]'
_ZodPromiseParams: TypeAlias = 'TypeParams[schemas.$ZodPromise, "innerType"]'
_ZodRawIssue: TypeAlias['T extends $ZodIssueBase = $ZodIssue'] = '$ZodInternalIssue[T]'
_ZodReadonlyParams: TypeAlias = 'TypeParams[schemas.$ZodReadonly, "innerType"]'
_ZodRecordKey: TypeAlias = '$ZodType[string | number | symbol, unknown]'
_ZodRecordParams: TypeAlias = 'TypeParams[schemas.$ZodRecord, "keyType" | "valueType" | "partial"]'
_ZodSetParams: TypeAlias = 'TypeParams[schemas.$ZodSet, "valueType"]'
_ZodShape: TypeAlias = 'Readonly[{ [k: string]: $ZodType }]'
_ZodStandardSchema: TypeAlias[T] = StandardSchemaV1.Props[core.input[T], core.output[T]]
_ZodStringFormatChecks: TypeAlias = '<$ZodCheckRegex | $ZodCheckLowerCase | $ZodCheckUpperCase | … (150 chars, #24d44418)>'
_ZodStringFormatIssues: TypeAlias = '<$ZodIssueStringCommonFormats | $ZodIssueStringInvalidRegex … (166 chars, #6277ef2e)>'
_ZodStringFormatParams: TypeAlias = 'CheckTypeParams[schemas.$ZodStringFormat, "format" | "coerce" | "when" | "pattern"]'
_ZodStringFormats: TypeAlias = '<"email" | "url" | "emoji" | "uuid" | "guid" | "nanoid" | … (348 chars, #166468b0)>'
_ZodStringFormatTypes: TypeAlias = '<$ZodGUID | $ZodUUID | $ZodEmail | $ZodURL | $ZodEmoji | … (475 chars, #ef08110e)>'
_ZodStringParams: TypeAlias = 'TypeParams[schemas.$ZodString[string], "coerce"] & { checks?: readonly checks.$ZodCheck[string][] }'
_ZodSuccessParams: TypeAlias = 'TypeParams[schemas.$ZodSuccess, "innerType"]'
_ZodSuperRefineIssue: TypeAlias['T extends errors.$ZodIssueBase = errors.$ZodIssue'] = 'T extends any ? RawIssue[T] : never'
_ZodSymbolParams: TypeAlias = 'TypeParams[schemas.$ZodSymbol]'
_ZodTemplateLiteralParams: TypeAlias = 'TypeParams[schemas.$ZodTemplateLiteral, "parts"]'
_ZodTemplateLiteralPart: TypeAlias = LiteralPart | SchemaPart
_ZodTransformParams: TypeAlias = 'TypeParams[schemas.$ZodTransform, "transform"]'
_ZodTupleParams: TypeAlias = 'TypeParams[schemas.$ZodTuple, "items" | "rest"]'
_ZodTypes: TypeAlias = '<$ZodString | $ZodNumber | $ZodBigInt | $ZodBoolean | … (515 chars, #c5c55b96)>'
_ZodULIDParams: TypeAlias = 'StringFormatParams[schemas.$ZodULID, "when"]'
_ZodUndefinedParams: TypeAlias = 'TypeParams[schemas.$ZodUndefined]'
_ZodUnionParams: TypeAlias = 'TypeParams[schemas.$ZodUnion, "options"]'
_ZodUnknownParams: TypeAlias = 'TypeParams[schemas.$ZodUnknown]'
_ZodURLParams: TypeAlias = 'StringFormatParams[schemas.$ZodURL, "when"]'
_ZodUUIDParams: TypeAlias = 'StringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodUUIDv4Params: TypeAlias = 'StringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodUUIDv6Params: TypeAlias = 'StringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodUUIDv7Params: TypeAlias = 'StringFormatParams[schemas.$ZodUUID, "pattern" | "when"]'
_ZodVoidParams: TypeAlias = 'TypeParams[schemas.$ZodVoid]'
_ZodXIDParams: TypeAlias = 'StringFormatParams[schemas.$ZodXID, "when"]'
_ZodXorParams: TypeAlias = 'TypeParams[schemas.$ZodXor, "options"]'
CheckFn: TypeAlias[T] = '(input: ParsePayload[T]) => util.MaybeAsync[void]'
CheckParams: TypeAlias['T extends checks.$ZodCheck = checks.$ZodCheck', 'AlsoOmit extends Exclude[keyof T["_zod"]["def"], "check" | "error"] = never'] = 'Params[T, NonNullable[T["_zod"]["issc"]], "check" | "error" | AlsoOmit]'
CheckStringFormatParams: TypeAlias['T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat', 'AlsoOmit extends Exclude[keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"] = never'] = 'Params[T, NonNullable[T["_zod"]["issc"]], "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit]'
CheckTypeParams: TypeAlias['T extends schemas.$ZodType & checks.$ZodCheck = schemas.$ZodType & checks.$ZodCheck', 'AlsoOmit extends Exclude[keyof T["_zod"]["def"], "type" | "checks" | "error" | "check"] = never'] = 'Params[T, NonNullable[T["_zod"]["isst"] | T["_zod"]["issc"]], "type" | "checks" | "error" | "check" | AlsoOmit]'
ConcatenateTupleOfStrings: TypeAlias['T extends string[]'] = '<T extends [infer First extends string, ...infer Rest … (207 chars, #f888e5e6)>'
ConvertPartsToStringTuple: TypeAlias['Parts extends $ZodTemplateLiteralPart[]'] = '<{ [K in keyof Parts]: Parts[K] extends LiteralPart ? … (229 chars, #4a95c01b)>'
infer: TypeAlias[T] = 'T extends { _zod: { output: any } } ? T["_zod"]["output"] : unknown'
input: TypeAlias[T] = 'T extends { _zod: { input: any } } ? T["_zod"]["input"] : unknown'
INVALID: TypeAlias = 'typeof INVALID'
output: TypeAlias[T] = 'T extends { _zod: { output: any } } ? T["_zod"]["output"] : unknown'
Params: TypeAlias['T extends schemas.$ZodType | checks.$ZodCheck', 'IssueTypes extends errors.$ZodIssueBase', 'OmitKeys extends keyof T["_zod"]["def"] = never'] = '<util.Flatten[Partial[util.EmptyToNever[Omit[T["_zod"]["def"] … (209 chars, #9830df1f)>'
Processor: TypeAlias['T extends schemas.$ZodType = schemas.$ZodType'] = '(schema: T, ctx: ToJSONSchemaContext, json: JSONSchema.BaseSchema, params: ProcessParams) => void'
SomeType: TypeAlias = '{ _zod: _$ZodTypeInternals }'
StringFormatParams: TypeAlias['T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat', 'AlsoOmit extends Exclude[keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"] = never'] = '<Params[T, NonNullable[T["_zod"]["isst"] | … (133 chars, #bd582506)>'
ToJSONSchemaParams: TypeAlias = Omit[JSONSchemaGeneratorParams, "processors" | "external"]
ToTemplateLiteral: TypeAlias['Parts extends $ZodTemplateLiteralPart[]'] = ConcatenateTupleOfStrings[ConvertPartsToStringTuple[Parts]]
TypeParams: TypeAlias['T extends schemas.$ZodType = schemas.$ZodType & { _isst: never }', 'AlsoOmit extends Exclude[keyof T["_zod"]["def"], "type" | "checks" | "error"] = never'] = 'Params[T, NonNullable[T["_zod"]["isst"]], "type" | "checks" | "error" | AlsoOmit]'
UnrepresentableHandler: TypeAlias['T extends schemas.$ZodType = schemas.$ZodType'] = '<(ctx: { zodSchema: T; path: (string | number)[]; message: … (122 chars, #fdaa1780)>'
ZodStandardSchemaWithJSON: TypeAlias[T] = StandardSchemaWithJSONProps[core.input[T], core.output[T]]

class __ZodType['T extends $ZodTypeInternals = $ZodTypeInternals']('$ZodType[T["output"], T["input"], T]', Protocol): ...

class __ZodTypeInternals(Protocol):
    bag: Record[string, unknown]
    constr: 'new (def: any) => $ZodType'
    self["def"]: '$ZodTypeDef'
    deferred: 'util.AnyFunc[] | undefined'
    isst: 'errors.$ZodIssueBase'
    optin: Opt['"optional" | "defaulted" | undefined']
    optout: Opt['"optional" | undefined']
    parent: Opt['$ZodType | undefined']
    pattern: RegExp | undefined
    processJSONSchema: Opt['((ctx: ToJSONSchemaContext, json: JSONSchema.BaseSchema, params: ProcessParams) => void) | undefined']
    propValues: Opt[util.PropValues | undefined]
    toJSONSchema: Opt['() => unknown']
    traits: Set[string]
    values: Opt[util.PrimitiveSet | undefined]
    version: 'typeof version'
    def parse(
        self,
        payload: ParsePayload[any],
        ctx: ParseContextInternal,
    ) -> util.MaybeAsync[ParsePayload]: ...
    def run(
        self,
        payload: ParsePayload[any],
        ctx: ParseContextInternal,
    ) -> util.MaybeAsync[ParsePayload]: ...

class _constructor['T extends ZodTrait', 'D = T["_zod"]["def"]'](Protocol):
    def __new__(self, def_: D) -> T: ...
    def init(self, inst: T, def_: D) -> 'asserts inst is T': ...

class _constructorParams(Protocol):
    Parent: Opt['typeof Class']

class _RefinementCtx['T = unknown'](schemas.ParsePayload[T], Protocol):
    def addIssue(self, arg: 'string | $ZodSuperRefineIssue') -> void: ...

class _ZodAny('$ZodType', Protocol):
    _zod: '$ZodAnyInternals'

class _ZodAnyDef('$ZodTypeDef', Protocol):
    type: '"any"'

class _ZodAnyInternals('$ZodTypeInternals[any, any]', Protocol):
    self["def"]: '$ZodAnyDef'
    isst: never

class _ZodArray['T extends SomeType = $ZodType']('$ZodType[any, any, $ZodArrayInternals[T]]', Protocol): ...

class _ZodArrayDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    element: T
    type: '"array"'

class _ZodArrayInternals['T extends SomeType = $ZodType']('_$ZodTypeInternals', Protocol):
    self["def"]: '$ZodArrayDef[T]'
    input: 'core.input[T][]'
    isst: 'errors.$ZodIssueInvalidType'
    output: 'core.output[T][]'

class _ZodBase64('$ZodType', Protocol):
    _zod: '$ZodBase64Internals'

class _ZodBase64Def('$ZodStringFormatDef["base64"]', Protocol): ...
class _ZodBase64Internals('$ZodStringFormatInternals["base64"]', Protocol): ...

class _ZodBase64URL('$ZodType', Protocol):
    _zod: '$ZodBase64URLInternals'

class _ZodBase64URLDef('$ZodStringFormatDef["base64url"]', Protocol): ...
class _ZodBase64URLInternals('$ZodStringFormatInternals["base64url"]', Protocol): ...

class _ZodBigInt['T = unknown']('$ZodType', Protocol):
    _zod: '$ZodBigIntInternals[T]'

class _ZodBigIntDef('$ZodTypeDef', Protocol):
    coerce: Opt[boolean]
    type: '"bigint"'

class _ZodBigIntFormat['Format extends $ZodBigIntFormats = $ZodBigIntFormats']('$ZodType', Protocol):
    _zod: '$ZodBigIntFormatInternals[Format]'

class _ZodBigIntFormatDef['Format extends $ZodBigIntFormats = $ZodBigIntFormats']('$ZodBigIntDef', 'checks.$ZodCheckBigIntFormatDef[Format]', Protocol):
    check: '"bigint_format"'

class _ZodBigIntFormatInternals['Format extends $ZodBigIntFormats = $ZodBigIntFormats']('$ZodBigIntInternals[bigint]', 'checks.$ZodCheckBigIntFormatInternals[Format]', Protocol):
    self["def"]: '$ZodBigIntFormatDef[Format]'

class _ZodBigIntInternals['T = unknown']('$ZodTypeInternals[bigint, T]', Protocol):
    bag: 'util.LoosePartial[{ minimum: bigint; maximum: bigint; format: string }]'
    self["def"]: '$ZodBigIntDef'
    isst: 'errors.$ZodIssueInvalidType'
    pattern: RegExp

class _ZodBoolean['T = unknown']('$ZodType', Protocol):
    _zod: '$ZodBooleanInternals[T]'

class _ZodBooleanDef('$ZodTypeDef', Protocol):
    checks: Opt['checks.$ZodCheck[boolean][]']
    coerce: Opt[boolean]
    type: '"boolean"'

class _ZodBooleanInternals['T = unknown']('$ZodTypeInternals[boolean, T]', Protocol):
    self["def"]: '$ZodBooleanDef'
    isst: 'errors.$ZodIssueInvalidType'
    pattern: RegExp

class _ZodCatch['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodCatchInternals[T]'

class _ZodCatchCtx(ParsePayload, Protocol):
    error: '{ issues: errors.$ZodIssue[] }'
    input: unknown

class _ZodCatchDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    catchValue: '(ctx: $ZodCatchCtx) => unknown'
    innerType: T
    type: '"catch"'

class _ZodCatchInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[core.output[T], core.input[T]]', Protocol):
    self["def"]: '$ZodCatchDef[T]'
    isst: never
    optin: 'T["_zod"]["optin"]'
    optout: 'T["_zod"]["optout"]'
    values: 'T["_zod"]["values"]'

class _ZodCheck['in T = never'](Protocol):
    _zod: '$ZodCheckInternals[T]'

class _ZodCheckBigIntFormat['Format extends $ZodBigIntFormats = $ZodBigIntFormats']('$ZodCheck[bigint]', Protocol):
    _zod: '$ZodCheckBigIntFormatInternals[Format]'

class _ZodCheckBigIntFormatDef['Format extends $ZodBigIntFormats = $ZodBigIntFormats']('$ZodCheckDef', Protocol):
    check: '"bigint_format"'
    format: Format

class _ZodCheckBigIntFormatInternals['Format extends $ZodBigIntFormats = $ZodBigIntFormats']('$ZodCheckInternals[bigint]', Protocol):
    self["def"]: '$ZodCheckBigIntFormatDef[Format]'
    issc: 'errors.$ZodIssueTooBig["bigint"] | errors.$ZodIssueTooSmall["bigint"]'

class _ZodCheckDef(Protocol):
    abort: Opt[boolean | undefined]
    check: string
    error: Opt['errors.$ZodErrorMap[never] | undefined']
    when: Opt['((payload: schemas.ParsePayload) => boolean) | undefined']

class _ZodCheckEndsWith('$ZodCheckInternals[string]', Protocol):
    _zod: '$ZodCheckEndsWithInternals'

class _ZodCheckEndsWithDef('$ZodCheckStringFormatDef["ends_with"]', Protocol):
    suffix: string

class _ZodCheckEndsWithInternals('$ZodCheckInternals[string]', Protocol):
    self["def"]: '$ZodCheckEndsWithDef'
    issc: 'errors.$ZodIssueInvalidStringFormat'

class _ZodCheckGreaterThan['T extends util.Numeric = util.Numeric']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckGreaterThanInternals[T]'

class _ZodCheckGreaterThanDef('$ZodCheckDef', Protocol):
    check: '"greater_than"'
    inclusive: boolean
    value: util.Numeric

class _ZodCheckGreaterThanInternals['T extends util.Numeric = util.Numeric']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckGreaterThanDef'
    issc: 'errors.$ZodIssueTooSmall[T]'

class _ZodCheckIncludes('$ZodCheck[string]', Protocol):
    _zod: '$ZodCheckIncludesInternals'

class _ZodCheckIncludesDef('$ZodCheckStringFormatDef["includes"]', Protocol):
    includes: string
    position: Opt[number | undefined]

class _ZodCheckIncludesInternals('$ZodCheckInternals[string]', Protocol):
    self["def"]: '$ZodCheckIncludesDef'
    issc: 'errors.$ZodIssueInvalidStringFormat'

class _ZodCheckInternals[T](Protocol):
    self["def"]: '$ZodCheckDef'
    issc: Opt['errors.$ZodIssueBase']
    onattach: '((schema: schemas.$ZodType) => void)[]'
    def check(self, payload: schemas.ParsePayload[T]) -> util.MaybeAsync[void]: ...

class _ZodCheckLengthEquals['T extends util.HasLength = util.HasLength']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckLengthEqualsInternals[T]'

class _ZodCheckLengthEqualsDef('$ZodCheckDef', Protocol):
    check: '"length_equals"'
    length: number

class _ZodCheckLengthEqualsInternals['T extends util.HasLength = util.HasLength']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckLengthEqualsDef'
    issc: 'errors.$ZodIssueTooBig[T] | errors.$ZodIssueTooSmall[T]'

class _ZodCheckLessThan['T extends util.Numeric = util.Numeric']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckLessThanInternals[T]'

class _ZodCheckLessThanDef('$ZodCheckDef', Protocol):
    check: '"less_than"'
    inclusive: boolean
    value: util.Numeric

class _ZodCheckLessThanInternals['T extends util.Numeric = util.Numeric']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckLessThanDef'
    issc: 'errors.$ZodIssueTooBig[T]'

class _ZodCheckLowerCase('$ZodCheck[string]', Protocol):
    _zod: '$ZodCheckLowerCaseInternals'

class _ZodCheckLowerCaseDef('$ZodCheckStringFormatDef["lowercase"]', Protocol): ...

class _ZodCheckLowerCaseInternals('$ZodCheckInternals[string]', Protocol):
    self["def"]: '$ZodCheckLowerCaseDef'
    issc: 'errors.$ZodIssueInvalidStringFormat'

class _ZodCheckMaxLength['T extends util.HasLength = util.HasLength']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckMaxLengthInternals[T]'

class _ZodCheckMaxLengthDef('$ZodCheckDef', Protocol):
    check: '"max_length"'
    maximum: number

class _ZodCheckMaxLengthInternals['T extends util.HasLength = util.HasLength']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckMaxLengthDef'
    issc: 'errors.$ZodIssueTooBig[T]'

class _ZodCheckMaxSize['T extends util.HasSize = util.HasSize']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckMaxSizeInternals[T]'

class _ZodCheckMaxSizeDef('$ZodCheckDef', Protocol):
    check: '"max_size"'
    maximum: number

class _ZodCheckMaxSizeInternals['T extends util.HasSize = util.HasSize']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckMaxSizeDef'
    issc: 'errors.$ZodIssueTooBig[T]'

class _ZodCheckMimeType['T extends schemas.File = schemas.File']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckMimeTypeInternals[T]'

class _ZodCheckMimeTypeDef('$ZodCheckDef', Protocol):
    check: '"mime_type"'
    mime: 'util.MimeTypes[]'

class _ZodCheckMimeTypeInternals['T extends schemas.File = schemas.File']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckMimeTypeDef'
    issc: 'errors.$ZodIssueInvalidValue'

class _ZodCheckMinLength['T extends util.HasLength = util.HasLength']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckMinLengthInternals[T]'

class _ZodCheckMinLengthDef('$ZodCheckDef', Protocol):
    check: '"min_length"'
    minimum: number

class _ZodCheckMinLengthInternals['T extends util.HasLength = util.HasLength']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckMinLengthDef'
    issc: 'errors.$ZodIssueTooSmall[T]'

class _ZodCheckMinSize['T extends util.HasSize = util.HasSize']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckMinSizeInternals[T]'

class _ZodCheckMinSizeDef('$ZodCheckDef', Protocol):
    check: '"min_size"'
    minimum: number

class _ZodCheckMinSizeInternals['T extends util.HasSize = util.HasSize']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckMinSizeDef'
    issc: 'errors.$ZodIssueTooSmall[T]'

class _ZodCheckMultipleOf['T extends number | bigint = number | bigint']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckMultipleOfInternals[T]'

class _ZodCheckMultipleOfDef['T extends number | bigint = number | bigint']('$ZodCheckDef', Protocol):
    check: '"multiple_of"'
    value: T

class _ZodCheckMultipleOfInternals['T extends number | bigint = number | bigint']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckMultipleOfDef[T]'
    issc: 'errors.$ZodIssueNotMultipleOf'

class _ZodCheckNumberFormat['Format extends $ZodNumberFormats = $ZodNumberFormats']('$ZodCheck[number]', Protocol):
    _zod: '$ZodCheckNumberFormatInternals[Format]'

class _ZodCheckNumberFormatDef['Format extends $ZodNumberFormats = $ZodNumberFormats']('$ZodCheckDef', Protocol):
    check: '"number_format"'
    format: Format

class _ZodCheckNumberFormatInternals['Format extends $ZodNumberFormats = $ZodNumberFormats']('$ZodCheckInternals[number]', Protocol):
    self["def"]: '$ZodCheckNumberFormatDef[Format]'
    issc: 'errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig["number"] | errors.$ZodIssueTooSmall["number"]'

class _ZodCheckOverwrite['T = unknown']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckOverwriteInternals[T]'

class _ZodCheckOverwriteDef['T = unknown']('$ZodCheckDef', Protocol):
    check: '"overwrite"'
    def tx(self, value: T) -> T: ...

class _ZodCheckOverwriteInternals['T = unknown']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckOverwriteDef[T]'
    issc: never

class _ZodCheckProperties['Shape extends schemas.$ZodShape = schemas.$ZodShape']('$ZodCheck[$ZodCheckPropertiesInput[Shape]]', Protocol):
    _zod: '$ZodCheckPropertiesInternals[Shape]'

class _ZodCheckPropertiesDef['Shape extends schemas.$ZodShape = schemas.$ZodShape']('$ZodCheckDef', Protocol):
    check: '"properties"'
    shape: Shape

class _ZodCheckPropertiesInternals['Shape extends schemas.$ZodShape = schemas.$ZodShape']('$ZodCheckInternals[$ZodCheckPropertiesInput[Shape]]', Protocol):
    self["def"]: '$ZodCheckPropertiesDef[Shape]'
    issc: 'errors.$ZodIssue'

class _ZodCheckProperty['T extends object = object']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckPropertyInternals[T]'

class _ZodCheckPropertyDef('$ZodCheckDef', Protocol):
    check: '"property"'
    property: string
    schema: 'schemas.$ZodType'

class _ZodCheckPropertyInternals['T extends object = object']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckPropertyDef'
    issc: 'errors.$ZodIssue'

class _ZodCheckRegex('$ZodCheck[string]', Protocol):
    _zod: '$ZodCheckRegexInternals'

class _ZodCheckRegexDef('$ZodCheckStringFormatDef', Protocol):
    format: '"regex"'
    pattern: RegExp

class _ZodCheckRegexInternals('$ZodCheckInternals[string]', Protocol):
    self["def"]: '$ZodCheckRegexDef'
    issc: 'errors.$ZodIssueInvalidStringFormat'

class _ZodCheckSizeEquals['T extends util.HasSize = util.HasSize']('$ZodCheck[T]', Protocol):
    _zod: '$ZodCheckSizeEqualsInternals[T]'

class _ZodCheckSizeEqualsDef('$ZodCheckDef', Protocol):
    check: '"size_equals"'
    size: number

class _ZodCheckSizeEqualsInternals['T extends util.HasSize = util.HasSize']('$ZodCheckInternals[T]', Protocol):
    self["def"]: '$ZodCheckSizeEqualsDef'
    issc: 'errors.$ZodIssueTooBig[T] | errors.$ZodIssueTooSmall[T]'

class _ZodCheckStartsWith('$ZodCheck[string]', Protocol):
    _zod: '$ZodCheckStartsWithInternals'

class _ZodCheckStartsWithDef('$ZodCheckStringFormatDef["starts_with"]', Protocol):
    prefix: string

class _ZodCheckStartsWithInternals('$ZodCheckInternals[string]', Protocol):
    self["def"]: '$ZodCheckStartsWithDef'
    issc: 'errors.$ZodIssueInvalidStringFormat'

class _ZodCheckStringFormat('$ZodCheck[string]', Protocol):
    _zod: '$ZodCheckStringFormatInternals'

class _ZodCheckStringFormatDef['Format extends string = string']('$ZodCheckDef', Protocol):
    check: '"string_format"'
    format: Format
    pattern: Opt[RegExp | undefined]

class _ZodCheckStringFormatInternals('$ZodCheckInternals[string]', Protocol):
    self["def"]: '$ZodCheckStringFormatDef'
    issc: 'errors.$ZodIssueInvalidStringFormat'

class _ZodCheckUpperCase('$ZodCheck[string]', Protocol):
    _zod: '$ZodCheckUpperCaseInternals'

class _ZodCheckUpperCaseDef('$ZodCheckStringFormatDef["uppercase"]', Protocol): ...

class _ZodCheckUpperCaseInternals('$ZodCheckInternals[string]', Protocol):
    self["def"]: '$ZodCheckUpperCaseDef'
    issc: 'errors.$ZodIssueInvalidStringFormat'

class _ZodCIDRv4('$ZodType', Protocol):
    _zod: '$ZodCIDRv4Internals'

class _ZodCIDRv4Def('$ZodStringFormatDef["cidrv4"]', Protocol):
    version: Opt['"v4"']

class _ZodCIDRv4Internals('$ZodStringFormatInternals["cidrv4"]', Protocol):
    self["def"]: '$ZodCIDRv4Def'

class _ZodCIDRv6('$ZodType', Protocol):
    _zod: '$ZodCIDRv6Internals'

class _ZodCIDRv6Def('$ZodStringFormatDef["cidrv6"]', Protocol):
    version: Opt['"v6"']

class _ZodCIDRv6Internals('$ZodStringFormatInternals["cidrv6"]', Protocol):
    self["def"]: '$ZodCIDRv6Def'

class _ZodCodec['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodCodecInternals[A, B]'

class _ZodCodecDef['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('$ZodPipeDef[A, B]', Protocol):
    reverseTransform: '(value: core.input[B], payload: ParsePayload[core.input[B]]) => util.MaybeAsync[core.output[A]]'
    transform: '(value: core.output[A], payload: ParsePayload[core.output[A]]) => util.MaybeAsync[core.input[B]]'

class _ZodCodecInternals['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('$ZodTypeInternals[core.output[B], core.input[A]]', Protocol):
    self["def"]: '$ZodCodecDef[A, B]'
    isst: never
    optin: 'A["_zod"]["optin"]'
    optout: 'B["_zod"]["optout"]'
    propValues: 'A["_zod"]["propValues"]'
    values: 'A["_zod"]["values"]'

class _ZodConfig(Protocol):
    customError: Opt['errors.$ZodErrorMap | undefined']
    jitless: Opt[boolean | undefined]
    localeError: Opt['errors.$ZodErrorMap | undefined']
    memoizer: Opt['schemas.$ZodMemoizer | undefined']
    postProcessor: Opt['((inst: any) => void) | undefined']

class _ZodCreditCard('$ZodType', Protocol):
    _zod: '$ZodCreditCardInternals'

class _ZodCreditCardDef('$ZodStringFormatDef["credit_card"]', Protocol): ...

class _ZodCreditCardInternals('$ZodStringFormatInternals["credit_card"]', Protocol):
    self["def"]: '$ZodCreditCardDef'

class _ZodCUID('$ZodType', Protocol):
    _zod: '$ZodCUIDInternals'

class _ZodCUID2('$ZodType', Protocol):
    _zod: '$ZodCUID2Internals'

class _ZodCUID2Def('$ZodStringFormatDef["cuid2"]', Protocol): ...
class _ZodCUID2Internals('$ZodStringFormatInternals["cuid2"]', Protocol): ...
class _ZodCUIDDef('$ZodStringFormatDef["cuid"]', Protocol): ...
class _ZodCUIDInternals('$ZodStringFormatInternals["cuid"]', Protocol): ...

class _ZodCustom['O = unknown', 'I = unknown']('$ZodType', Protocol):
    _zod: '$ZodCustomInternals[O, I]'

class _ZodCustomDef['O = unknown']('$ZodTypeDef', 'checks.$ZodCheckDef', Protocol):
    check: '"custom"'
    error: Opt['errors.$ZodErrorMap | undefined']
    fn: '(arg: O) => unknown'
    params: Opt[Record[string, any] | undefined]
    path: Opt['PropertyKey[] | undefined']
    type: '"custom"'

class _ZodCustomInternals['O = unknown', 'I = unknown']('$ZodTypeInternals[O, I]', 'checks.$ZodCheckInternals[O]', Protocol):
    bag: 'util.LoosePartial[{ Class: typeof util.Class }]'
    self["def"]: '$ZodCustomDef'
    issc: 'errors.$ZodIssue'
    isst: never

class _ZodCustomStringFormat['Format extends string = string']('$ZodStringFormat[Format]', Protocol):
    _zod: '$ZodCustomStringFormatInternals[Format]'

class _ZodCustomStringFormatDef['Format extends string = string']('$ZodStringFormatDef[Format]', Protocol):
    fn: '(val: string) => unknown'

class _ZodCustomStringFormatInternals['Format extends string = string']('$ZodStringFormatInternals[Format]', Protocol):
    self["def"]: '$ZodCustomStringFormatDef[Format]'

class _ZodDate['T = unknown']('$ZodType', Protocol):
    _zod: '$ZodDateInternals[T]'

class _ZodDateDef('$ZodTypeDef', Protocol):
    coerce: Opt[boolean]
    type: '"date"'

class _ZodDateInternals['T = unknown']('$ZodTypeInternals[Date, T]', Protocol):
    bag: 'util.LoosePartial[{ minimum: Date; maximum: Date; format: string }]'
    self["def"]: '$ZodDateDef'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodDefault['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodDefaultInternals[T]'

class _ZodDefaultDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    defaultValue: util.NoUndefined[core.output[T]]
    innerType: T
    type: '"default"'

class _ZodDefaultInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[util.NoUndefined[core.output[T]], core.input[T] | undefined]', Protocol):
    self["def"]: '$ZodDefaultDef[T]'
    isst: never
    optin: '"defaulted"'
    optout: Opt['"optional" | undefined']
    values: 'T["_zod"]["values"]'

class _ZodDiscriminatedUnion['Options extends readonly SomeType[] = readonly $ZodType[]', 'Disc extends string = string']('$ZodType', Protocol):
    _zod: '$ZodDiscriminatedUnionInternals[Options, Disc]'

class _ZodDiscriminatedUnionDef['Options extends readonly SomeType[] = readonly $ZodType[]', 'Disc extends string = string']('$ZodUnionDef[Options]', Protocol):
    discriminator: Disc
    unionFallback: Opt[boolean]

class _ZodDiscriminatedUnionInternals['Options extends readonly SomeType[] = readonly $ZodType[]', 'Disc extends string = string']('$ZodUnionInternals[Options]', Protocol):
    bag: 'util.LoosePartial[{ optionsMap: Map[util.Primitive, $ZodType | null] }]'
    self["def"]: '$ZodDiscriminatedUnionDef[Options, Disc]'
    propValues: util.PropValues

class _ZodE164('$ZodType', Protocol):
    _zod: '$ZodE164Internals'

class _ZodE164Def('$ZodStringFormatDef["e164"]', Protocol): ...
class _ZodE164Internals('$ZodStringFormatInternals["e164"]', Protocol): ...

class _ZodEmail('$ZodType', Protocol):
    _zod: '$ZodEmailInternals'

class _ZodEmailDef('$ZodStringFormatDef["email"]', Protocol): ...
class _ZodEmailInternals('$ZodStringFormatInternals["email"]', Protocol): ...

class _ZodEmoji('$ZodType', Protocol):
    _zod: '$ZodEmojiInternals'

class _ZodEmojiDef('$ZodStringFormatDef["emoji"]', Protocol): ...
class _ZodEmojiInternals('$ZodStringFormatInternals["emoji"]', Protocol): ...

class _ZodEnum['T extends util.EnumLike = util.EnumLike']('$ZodType', Protocol):
    _zod: '$ZodEnumInternals[T]'

class _ZodEnumDef['T extends util.EnumLike = util.EnumLike']('$ZodTypeDef', Protocol):
    entries: T
    type: '"enum"'

class _ZodEnumInternals['out T extends util.EnumLike = util.EnumLike']('$ZodTypeInternals[$InferEnumOutput[T], $InferEnumInput[T]]', Protocol):
    self["def"]: '$ZodEnumDef[T]'
    isst: 'errors.$ZodIssueInvalidValue'
    pattern: RegExp
    values: util.PrimitiveSet

class _ZodError['T = unknown'](Error, Protocol):
    _zod: '{ output: T; def: $ZodIssue[] }'
    issues: '$ZodIssue[]'
    name: string
    stack: Opt[string]
    type: T

class _ZodErrorMap['T extends $ZodIssueBase = $ZodIssue'](Protocol):
    def __call__(
        self,
        issue: '$ZodRawIssue[T]',
    ) -> '{ message: string } | string | undefined | null': ...

class _ZodExactOptional['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodExactOptionalInternals[T]'

class _ZodExactOptionalDef['T extends SomeType = $ZodType']('$ZodOptionalDef[T]', Protocol): ...

class _ZodExactOptionalInternals['T extends SomeType = $ZodType']('$ZodOptionalInternals[T]', Protocol):
    self["def"]: '$ZodExactOptionalDef[T]'
    input: core.input[T]
    output: core.output[T]

class _ZodFile('$ZodType', Protocol):
    _zod: '$ZodFileInternals'

class _ZodFileDef('$ZodTypeDef', Protocol):
    type: '"file"'

class _ZodFileInternals('$ZodTypeInternals[File, File]', Protocol):
    bag: 'util.LoosePartial[{ minimum: number; maximum: number; mime: util.MimeTypes[] }]'
    self["def"]: '$ZodFileDef'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodFunction['Args extends $ZodFunctionIn = $ZodFunctionIn', 'Returns extends $ZodFunctionOut = $ZodFunctionOut']('$ZodType[any, any, $ZodFunctionInternals[Args, Returns]]', Protocol):
    _def: '$ZodFunctionDef[Args, Returns]'
    _input: '$InferInnerFunctionType[Args, Returns]'
    _output: '$InferOuterFunctionType[Args, Returns]'
    def implement['F extends $InferInnerFunctionType[Args, Returns]'](
        self,
        func: F,
    ) -> '<(...args: Parameters[this["_output"]]) => ReturnType[F] … (137 chars, #08bccc83)>': ...
    def implementAsync['F extends $InferInnerFunctionTypeAsync[Args, Returns]'](
        self,
        func: F,
    ) -> 'F extends $InferOuterFunctionTypeAsync[Args, Returns] ? F : $InferOuterFunctionTypeAsync[Args, Returns]': ...
    @overload
    def input[
        'const Items extends util.TupleItems',
        'const Rest extends $ZodFunctionOut = $ZodFunctionOut',
    ](
        self,
        args: Items,
        rest: Rest = ...,
    ) -> '$ZodFunction[$ZodTuple[Items, Rest], Returns]': ...
    @overload
    def input['NewArgs extends $ZodFunctionIn'](
        self,
        args: NewArgs,
    ) -> '$ZodFunction[NewArgs, Returns]': ...
    @overload
    def input(self, *args: 'any[]') -> '$ZodFunction[any, Returns]': ...
    def output['NewReturns extends $ZodType'](
        self,
        output: NewReturns,
    ) -> '$ZodFunction[Args, NewReturns]': ...

class _ZodFunctionDef['In extends $ZodFunctionIn = $ZodFunctionIn', 'Out extends $ZodFunctionOut = $ZodFunctionOut']('$ZodTypeDef', Protocol):
    input: In
    output: Out
    type: '"function"'

class _ZodFunctionInternals['Args extends $ZodFunctionIn', 'Returns extends $ZodFunctionOut']('$ZodTypeInternals[$InferOuterFunctionType[Args, Returns], $InferInnerFunctionType[Args, Returns]]', Protocol):
    self["def"]: '$ZodFunctionDef[Args, Returns]'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodFunctionParams['I extends $ZodFunctionIn', 'O extends $ZodType'](Protocol):
    input: Opt[I]
    output: Opt[O]

class _ZodGUID('$ZodType', Protocol):
    _zod: '$ZodGUIDInternals'

class _ZodGUIDDef('$ZodStringFormatDef["guid"]', Protocol): ...
class _ZodGUIDInternals('$ZodStringFormatInternals["guid"]', Protocol): ...

class _ZodIBAN('$ZodType', Protocol):
    _zod: '$ZodIBANInternals'

class _ZodIBANDef('$ZodStringFormatDef["iban"]', Protocol): ...

class _ZodIBANInternals('$ZodStringFormatInternals["iban"]', Protocol):
    self["def"]: '$ZodIBANDef'

class _ZodIntersection['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodIntersectionInternals[A, B]'

class _ZodIntersectionDef['Left extends SomeType = $ZodType', 'Right extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    left: Left
    right: Right
    type: '"intersection"'

class _ZodIntersectionInternals['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('_$ZodTypeInternals', Protocol):
    self["def"]: '$ZodIntersectionDef[A, B]'
    input: 'core.input[A] & core.input[B]'
    isst: never
    optin: 'A["_zod"]["optin"] | B["_zod"]["optin"]'
    optout: 'A["_zod"]["optout"] | B["_zod"]["optout"]'
    output: 'core.output[A] & core.output[B]'

class _ZodIPv4('$ZodType', Protocol):
    _zod: '$ZodIPv4Internals'

class _ZodIPv4Def('$ZodStringFormatDef["ipv4"]', Protocol):
    version: Opt['"v4"']

class _ZodIPv4Internals('$ZodStringFormatInternals["ipv4"]', Protocol):
    self["def"]: '$ZodIPv4Def'

class _ZodIPv6('$ZodType', Protocol):
    _zod: '$ZodIPv6Internals'

class _ZodIPv6Def('$ZodStringFormatDef["ipv6"]', Protocol):
    version: Opt['"v6"']

class _ZodIPv6Internals('$ZodStringFormatInternals["ipv6"]', Protocol):
    self["def"]: '$ZodIPv6Def'

class _ZodISODate('$ZodType', Protocol):
    _zod: '$ZodISODateInternals'

class _ZodISODateDef('$ZodStringFormatDef["date"]', Protocol): ...
class _ZodISODateInternals('$ZodStringFormatInternals["date"]', Protocol): ...

class _ZodISODateTime('$ZodType', Protocol):
    _zod: '$ZodISODateTimeInternals'

class _ZodISODateTimeDef('$ZodStringFormatDef["datetime"]', Protocol):
    local: boolean
    offset: boolean
    precision: number | null

class _ZodISODateTimeInternals('$ZodStringFormatInternals', Protocol):
    self["def"]: '$ZodISODateTimeDef'

class _ZodISODuration('$ZodType', Protocol):
    _zod: '$ZodISODurationInternals'

class _ZodISODurationDef('$ZodStringFormatDef["duration"]', Protocol): ...
class _ZodISODurationInternals('$ZodStringFormatInternals["duration"]', Protocol): ...

class _ZodISOTime('$ZodType', Protocol):
    _zod: '$ZodISOTimeInternals'

class _ZodISOTimeDef('$ZodStringFormatDef["time"]', Protocol):
    precision: Opt[number | null]

class _ZodISOTimeInternals('$ZodStringFormatInternals["time"]', Protocol):
    self["def"]: '$ZodISOTimeDef'

class _ZodIssueBase(Protocol):
    code: Readonly[Opt[string]]
    input: Readonly[Opt[unknown]]
    message: Readonly[string]
    path: Readonly['PropertyKey[]']

class _ZodIssueCustom('$ZodIssueBase', Protocol):
    code: Readonly['"custom"']
    input: Readonly[Opt[unknown]]
    params: Readonly[Opt[Record[string, any] | undefined]]

class _ZodIssueInvalidElement['Input = unknown']('$ZodIssueBase', Protocol):
    code: Readonly['"invalid_element"']
    input: Readonly[Opt[Input]]
    issues: Readonly['$ZodIssue[]']
    key: Readonly[unknown]
    origin: Readonly['"map" | "set"']

class _ZodIssueInvalidKey['Input = unknown']('$ZodIssueBase', Protocol):
    code: Readonly['"invalid_key"']
    input: Readonly[Opt[Input]]
    issues: Readonly['$ZodIssue[]']
    origin: Readonly['"map" | "record"']

class _ZodIssueInvalidStringFormat('$ZodIssueBase', Protocol):
    code: Readonly['"invalid_format"']
    format: Readonly['$ZodStringFormats | (string & {})']
    input: Readonly[Opt[string]]
    pattern: Readonly[Opt[string]]

class _ZodIssueInvalidType['Input = unknown']('$ZodIssueBase', Protocol):
    code: Readonly['"invalid_type"']
    expected: Readonly['$ZodInvalidTypeExpected']
    input: Readonly[Opt[Input]]

class _ZodIssueInvalidValue['Input = unknown']('$ZodIssueBase', Protocol):
    code: Readonly['"invalid_value"']
    input: Readonly[Opt[Input]]
    values: Readonly['util.Primitive[]']

class _ZodIssueNotMultipleOf['Input extends number | bigint = number | bigint']('$ZodIssueBase', Protocol):
    code: Readonly['"not_multiple_of"']
    divisor: Readonly[number]
    input: Readonly[Opt[Input]]

class _ZodIssueStringCommonFormats('$ZodIssueInvalidStringFormat', Protocol):
    format: 'Exclude[$ZodStringFormats, "regex" | "jwt" | "starts_with" | "ends_with" | "includes"]'

class _ZodIssueStringEndsWith('$ZodIssueInvalidStringFormat', Protocol):
    format: '"ends_with"'
    suffix: string

class _ZodIssueStringIncludes('$ZodIssueInvalidStringFormat', Protocol):
    format: '"includes"'
    includes: string

class _ZodIssueStringInvalidJWT('$ZodIssueInvalidStringFormat', Protocol):
    algorithm: Opt[string]
    format: '"jwt"'

class _ZodIssueStringInvalidRegex('$ZodIssueInvalidStringFormat', Protocol):
    format: '"regex"'
    pattern: string

class _ZodIssueStringStartsWith('$ZodIssueInvalidStringFormat', Protocol):
    format: '"starts_with"'
    prefix: string

class _ZodIssueTooBig['Input = unknown']('$ZodIssueBase', Protocol):
    code: Readonly['"too_big"']
    exact: Readonly[Opt[boolean]]
    inclusive: Readonly[Opt[boolean]]
    input: Readonly[Opt[Input]]
    maximum: Readonly[number | bigint]
    origin: Readonly['"number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {})']

class _ZodIssueTooSmall['Input = unknown']('$ZodIssueBase', Protocol):
    code: Readonly['"too_small"']
    exact: Readonly[Opt[boolean]]
    inclusive: Readonly[Opt[boolean]]
    input: Readonly[Opt[Input]]
    minimum: Readonly[number | bigint]
    origin: Readonly['"number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {})']

class _ZodIssueUnrecognizedKeys('$ZodIssueBase', Protocol):
    code: Readonly['"unrecognized_keys"']
    input: Readonly[Opt[Record[string, unknown]]]
    keys: Readonly['string[]']

class _ZodJWT('$ZodType', Protocol):
    _zod: '$ZodJWTInternals'

class _ZodJWTDef('$ZodStringFormatDef["jwt"]', Protocol):
    alg: Opt[util.JWTAlgorithm | undefined]

class _ZodJWTInternals('$ZodStringFormatInternals["jwt"]', Protocol):
    self["def"]: '$ZodJWTDef'

class _ZodKSUID('$ZodType', Protocol):
    _zod: '$ZodKSUIDInternals'

class _ZodKSUIDDef('$ZodStringFormatDef["ksuid"]', Protocol): ...
class _ZodKSUIDInternals('$ZodStringFormatInternals["ksuid"]', Protocol): ...

class _ZodLazy['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodLazyInternals[T]'

class _ZodLazyDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    getter: '() => T'
    type: '"lazy"'

class _ZodLazyInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[core.output[T], core.input[T]]', Protocol):
    self["def"]: '$ZodLazyDef[T]'
    innerType: T
    isst: never
    optin: 'T["_zod"]["optin"]'
    optout: 'T["_zod"]["optout"]'
    pattern: 'T["_zod"]["pattern"]'
    propValues: 'T["_zod"]["propValues"]'

class _ZodLiteral['T extends util.Literal = util.Literal']('$ZodType', Protocol):
    _zod: '$ZodLiteralInternals[T]'

class _ZodLiteralDef['T extends util.Literal']('$ZodTypeDef', Protocol):
    type: '"literal"'
    values: 'T[]'

class _ZodLiteralInternals['T extends util.Literal = util.Literal']('$ZodTypeInternals[T, T]', Protocol):
    self["def"]: '$ZodLiteralDef[T]'
    isst: 'errors.$ZodIssueInvalidValue'
    pattern: RegExp
    values: Set[T]

class _ZodMAC('$ZodType', Protocol):
    _zod: '$ZodMACInternals'

class _ZodMACDef('$ZodStringFormatDef["mac"]', Protocol):
    delimiter: Opt[string]

class _ZodMACInternals('$ZodStringFormatInternals["mac"]', Protocol):
    self["def"]: '$ZodMACDef'

class _ZodMap['Key extends SomeType = $ZodType', 'Value extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodMapInternals[Key, Value]'

class _ZodMapDef['Key extends SomeType = $ZodType', 'Value extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    keyType: Key
    type: '"map"'
    valueType: Value

class _ZodMapInternals['Key extends SomeType = $ZodType', 'Value extends SomeType = $ZodType']('$ZodTypeInternals[Map[core.output[Key], core.output[Value]], Map[core.input[Key], core.input[Value]]]', Protocol):
    self["def"]: '$ZodMapDef[Key, Value]'
    isst: 'errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey | errors.$ZodIssueInvalidElement[unknown]'
    optin: Opt['"optional" | undefined']
    optout: Opt['"optional" | undefined']

class _ZodMemoizer(Protocol):
    def alloc['T extends object'](
        self,
        inst: '$ZodType',
        payload: ParsePayload,
        empty: T,
        ctx: ParseContextInternal,
    ) -> T: ...
    def attach(self, inst: '$ZodType') -> void: ...
    def guard(self, inst: '$ZodType') -> void: ...

class _ZodNaN('$ZodType', Protocol):
    _zod: '$ZodNaNInternals'

class _ZodNaNDef('$ZodTypeDef', Protocol):
    type: '"nan"'

class _ZodNaNInternals('$ZodTypeInternals[number, number]', Protocol):
    self["def"]: '$ZodNaNDef'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodNanoID('$ZodType', Protocol):
    _zod: '$ZodNanoIDInternals'

class _ZodNanoIDDef('$ZodStringFormatDef["nanoid"]', Protocol):
    length: Opt[number | undefined]

class _ZodNanoIDInternals('$ZodStringFormatInternals["nanoid"]', Protocol):
    self["def"]: '$ZodNanoIDDef'

class _ZodNever('$ZodType', Protocol):
    _zod: '$ZodNeverInternals'

class _ZodNeverDef('$ZodTypeDef', Protocol):
    type: '"never"'

class _ZodNeverInternals('$ZodTypeInternals[never, never]', Protocol):
    self["def"]: '$ZodNeverDef'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodNonOptional['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodNonOptionalInternals[T]'

class _ZodNonOptionalDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    innerType: T
    type: '"nonoptional"'

class _ZodNonOptionalInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[util.NoUndefined[core.output[T]], util.NoUndefined[core.input[T]]]', Protocol):
    self["def"]: '$ZodNonOptionalDef[T]'
    isst: 'errors.$ZodIssueInvalidType'
    optin: '"optional" | undefined'
    optout: '"optional" | undefined'
    values: 'T["_zod"]["values"]'

class _ZodNull('$ZodType', Protocol):
    _zod: '$ZodNullInternals'

class _ZodNullable['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodNullableInternals[T]'

class _ZodNullableDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    innerType: T
    type: '"nullable"'

class _ZodNullableInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[core.output[T] | null, core.input[T] | null]', Protocol):
    self["def"]: '$ZodNullableDef[T]'
    isst: never
    optin: 'T["_zod"]["optin"]'
    optout: 'T["_zod"]["optout"]'
    pattern: 'T["_zod"]["pattern"]'
    values: 'T["_zod"]["values"]'

class _ZodNullDef('$ZodTypeDef', Protocol):
    type: '"null"'

class _ZodNullInternals('$ZodTypeInternals[null, null]', Protocol):
    self["def"]: '$ZodNullDef'
    isst: 'errors.$ZodIssueInvalidType'
    pattern: RegExp
    values: util.PrimitiveSet

class _ZodNumber['Input = unknown']('$ZodType', Protocol):
    _zod: '$ZodNumberInternals[Input]'

class _ZodNumberDef('$ZodTypeDef', Protocol):
    coerce: Opt[boolean]
    type: '"number"'

class _ZodNumberFormat['Format extends $ZodNumberFormats = $ZodNumberFormats']('$ZodType', Protocol):
    _zod: '$ZodNumberFormatInternals[Format]'

class _ZodNumberFormatDef['Format extends $ZodNumberFormats = $ZodNumberFormats']('$ZodNumberDef', 'checks.$ZodCheckNumberFormatDef[Format]', Protocol): ...

class _ZodNumberFormatInternals['Format extends $ZodNumberFormats = $ZodNumberFormats']('$ZodNumberInternals[number]', 'checks.$ZodCheckNumberFormatInternals[Format]', Protocol):
    self["def"]: '$ZodNumberFormatDef[Format]'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodNumberInternals['Input = unknown']('$ZodTypeInternals[number, Input]', Protocol):
    bag: '<util.LoosePartial[{ minimum: number; maximum: number; … (140 chars, #5138d5ed)>'
    self["def"]: '$ZodNumberDef'
    isst: 'errors.$ZodIssueInvalidType'
    pattern: RegExp

class _ZodObject['out Shape extends Readonly[$ZodShape] = Readonly[$ZodShape]', 'out Params extends $ZodObjectConfig = $ZodObjectConfig']('$ZodType[any, any, $ZodObjectInternals[Shape, Params]]', Protocol): ...

class _ZodObjectDef['Shape extends $ZodShape = $ZodShape']('$ZodTypeDef', Protocol):
    catchall: Opt['$ZodType | undefined']
    shape: Shape
    type: '"object"'

class _ZodObjectInternals['out Shape extends $ZodShape = $ZodShape', 'out Config extends $ZodObjectConfig = $ZodObjectConfig']('_$ZodTypeInternals', Protocol):
    config: Config
    self["def"]: '$ZodObjectDef[Shape]'
    input: '$InferObjectInput[Shape, Config["in"]]'
    isst: 'errors.$ZodIssueInvalidType | errors.$ZodIssueUnrecognizedKeys'
    optin: Opt['"optional" | undefined']
    optout: Opt['"optional" | undefined']
    output: '$InferObjectOutput[Shape, Config["out"]]'
    propValues: util.PropValues

class _ZodOptional['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodOptionalInternals[T]'

class _ZodOptionalDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    innerType: T
    type: '"optional"'

class _ZodOptionalInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[core.output[T] | undefined, core.input[T] | undefined]', Protocol):
    self["def"]: '$ZodOptionalDef[T]'
    isst: never
    optin: '"optional" | "defaulted"'
    optout: '"optional"'
    pattern: 'T["_zod"]["pattern"]'
    values: 'T["_zod"]["values"]'

class _ZodPipe['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodPipeInternals[A, B]'

class _ZodPipeDef['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    self["in"]: A
    out: B
    reverseTransform: Opt['(value: core.input[B], payload: ParsePayload[core.input[B]]) => util.MaybeAsync[core.output[A]]']
    transform: Opt['(value: core.output[A], payload: ParsePayload[core.output[A]]) => util.MaybeAsync[core.input[B]]']
    type: '"pipe"'

class _ZodPipeInternals['A extends SomeType = $ZodType', 'B extends SomeType = $ZodType']('$ZodTypeInternals[core.output[B], core.input[A]]', Protocol):
    self["def"]: '$ZodPipeDef[A, B]'
    isst: never
    optin: 'A["_zod"]["optin"]'
    optout: 'B["_zod"]["optout"]'
    propValues: 'A["_zod"]["propValues"]'
    values: 'A["_zod"]["values"]'

class _ZodPrefault['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodPrefaultInternals[T]'

class _ZodPrefaultDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    defaultValue: core.input[T]
    innerType: T
    type: '"prefault"'

class _ZodPrefaultInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[core.output[T], core.input[T] | undefined]', Protocol):
    self["def"]: '$ZodPrefaultDef[T]'
    isst: never
    optin: '"defaulted"'
    optout: Opt['"optional" | undefined']
    values: 'T["_zod"]["values"]'

class _ZodPreprocess['B extends SomeType = $ZodType', 'I = unknown']('$ZodPipe[$ZodTransform[unknown, I], B]', Protocol):
    _zod: '$ZodPreprocessInternals[B, I]'

class _ZodPreprocessDef['B extends SomeType = $ZodType', 'I = unknown']('$ZodPipeDef[$ZodTransform[unknown, I], B]', Protocol):
    self["in"]: '$ZodTransform[unknown, I]'
    out: B

class _ZodPreprocessInternals['B extends SomeType = $ZodType', 'I = unknown']('$ZodPipeInternals[$ZodTransform[unknown, I], B]', Protocol):
    self["def"]: '$ZodPreprocessDef[B, I]'
    optin: 'B["_zod"]["optin"]'
    optout: 'B["_zod"]["optout"]'

class _ZodPromise['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodPromiseInternals[T]'

class _ZodPromiseDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    innerType: T
    type: '"promise"'

class _ZodPromiseInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[Promise[core.output[T]], util.MaybeAsync[core.input[T]]]', Protocol):
    self["def"]: '$ZodPromiseDef[T]'
    isst: never

class _ZodReadonly['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodReadonlyInternals[T]'

class _ZodReadonlyDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    innerType: T
    type: '"readonly"'

class _ZodReadonlyInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[util.MakeReadonly[core.output[T]], util.MakeReadonly[core.input[T]]]', Protocol):
    self["def"]: '$ZodReadonlyDef[T]'
    isst: never
    optin: 'T["_zod"]["optin"]'
    optout: 'T["_zod"]["optout"]'
    propValues: 'T["_zod"]["propValues"]'
    values: 'T["_zod"]["values"]'

class _ZodRealError['T = any']('$ZodError[T]', Protocol): ...

class _ZodRecord['Key extends $ZodRecordKey = $ZodRecordKey', 'Value extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodRecordInternals[Key, Value]'

class _ZodRecordDef['Key extends $ZodRecordKey = $ZodRecordKey', 'Value extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    keyType: Key
    mode: Opt['"strict" | "loose"']
    partial: Opt[boolean]
    type: '"record"'
    valueType: Value

class _ZodRecordInternals['Key extends $ZodRecordKey = $ZodRecordKey', 'Value extends SomeType = $ZodType']('$ZodTypeInternals', Protocol):
    self["def"]: '$ZodRecordDef[Key, Value]'
    input: '$InferZodRecordInput[Key, Value]'
    isst: 'errors.$ZodIssueInvalidType | errors.$ZodIssueInvalidKey[Record[PropertyKey, unknown]]'
    optin: Opt['"optional" | undefined']
    optout: Opt['"optional" | undefined']
    output: '$InferZodRecordOutput[Key, Value]'

class _ZodSet['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodSetInternals[T]'

class _ZodSetDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    type: '"set"'
    valueType: T

class _ZodSetInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[Set[core.output[T]], Set[core.input[T]]]', Protocol):
    self["def"]: '$ZodSetDef[T]'
    isst: 'errors.$ZodIssueInvalidType'
    optin: Opt['"optional" | undefined']
    optout: Opt['"optional" | undefined']

class _ZodString['Input = unknown']('_$ZodType[$ZodStringInternals[Input]]', Protocol): ...

class _ZodStringBoolParams(TypeParams, Protocol):
    case: Opt['"sensitive" | "insensitive" | undefined']
    falsy: Opt['string[]']
    truthy: Opt['string[]']

class _ZodStringDef('$ZodTypeDef', Protocol):
    checks: Opt['checks.$ZodCheck[string][]']
    coerce: Opt[boolean]
    type: '"string"'

class _ZodStringFormat['Format extends string = string']('$ZodType', Protocol):
    _zod: '$ZodStringFormatInternals[Format]'

class _ZodStringFormatDef['Format extends string = string']('$ZodStringDef', 'checks.$ZodCheckStringFormatDef[Format]', Protocol): ...

class _ZodStringFormatInternals['Format extends string = string']('$ZodStringInternals[string]', 'checks.$ZodCheckStringFormatInternals', Protocol):
    self["def"]: '$ZodStringFormatDef[Format]'

class _ZodStringInternals[Input]('$ZodTypeInternals[string, Input]', Protocol):
    bag: '<util.LoosePartial[{ minimum: number; maximum: number; … (139 chars, #ac7df77d)>'
    self["def"]: '$ZodStringDef'
    isst: 'errors.$ZodIssueInvalidType'
    pattern: RegExp

class _ZodSuccess['T extends SomeType = $ZodType']('$ZodType', Protocol):
    _zod: '$ZodSuccessInternals[T]'

class _ZodSuccessDef['T extends SomeType = $ZodType']('$ZodTypeDef', Protocol):
    innerType: T
    type: '"success"'

class _ZodSuccessInternals['T extends SomeType = $ZodType']('$ZodTypeInternals[boolean, core.input[T]]', Protocol):
    self["def"]: '$ZodSuccessDef[T]'
    isst: never
    optin: 'T["_zod"]["optin"]'
    optout: '"optional" | undefined'

class _ZodSuperRefineParams(Protocol):
    when: Opt['((payload: schemas.ParsePayload) => boolean) | undefined']

class _ZodSymbol('$ZodType', Protocol):
    _zod: '$ZodSymbolInternals'

class _ZodSymbolDef('$ZodTypeDef', Protocol):
    type: '"symbol"'

class _ZodSymbolInternals('$ZodTypeInternals[symbol, symbol]', Protocol):
    self["def"]: '$ZodSymbolDef'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodTemplateLiteral['Template extends string = string']('$ZodType', Protocol):
    _zod: '$ZodTemplateLiteralInternals[Template]'

class _ZodTemplateLiteralDef('$ZodTypeDef', Protocol):
    format: Opt[string | undefined]
    parts: '$ZodTemplateLiteralPart[]'
    type: '"template_literal"'

class _ZodTemplateLiteralInternals['Template extends string = string']('$ZodTypeInternals[Template, Template]', Protocol):
    self["def"]: '$ZodTemplateLiteralDef'
    isst: 'errors.$ZodIssueInvalidType'
    pattern: RegExp

class _ZodTransform['O = unknown', 'I = unknown']('$ZodType', Protocol):
    _zod: '$ZodTransformInternals[O, I]'

class _ZodTransformDef('$ZodTypeDef', Protocol):
    transform: '(input: unknown, payload: ParsePayload[unknown]) => util.MaybeAsync[unknown]'
    type: '"transform"'

class _ZodTransformInternals['O = unknown', 'I = unknown']('$ZodTypeInternals[O, I]', Protocol):
    self["def"]: '$ZodTransformDef'
    isst: never

class _ZodTuple['T extends util.TupleItems = readonly $ZodType[]', 'Rest extends SomeType | null = $ZodType | null']('$ZodType', Protocol):
    _zod: '$ZodTupleInternals[T, Rest]'

class _ZodTupleDef['T extends util.TupleItems = readonly $ZodType[]', 'Rest extends SomeType | null = $ZodType | null']('$ZodTypeDef', Protocol):
    items: T
    rest: Rest
    type: '"tuple"'

class _ZodTupleInternals['T extends util.TupleItems = readonly $ZodType[]', 'Rest extends SomeType | null = $ZodType | null']('_$ZodTypeInternals', Protocol):
    self["def"]: '$ZodTupleDef[T, Rest]'
    input: '$InferTupleInputType[T, Rest]'
    isst: 'errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig[unknown[]] | errors.$ZodIssueTooSmall[unknown[]]'
    output: '$InferTupleOutputType[T, Rest]'

class _ZodType['O = unknown', 'I = unknown', 'Internals extends $ZodTypeInternals[O, I] = $ZodTypeInternals[O, I]'](Protocol):
    _zod: Internals
    self["~standard"]: '$ZodStandardSchema[this]'

class _ZodTypeDef(Protocol):
    checks: Opt['checks.$ZodCheck[never][]']
    error: Opt['errors.$ZodErrorMap[never] | undefined']
    type: '<"string" | "number" | "int" | "boolean" | "bigint" | … (446 chars, #c61bd4d7)>'

class _ZodTypeDiscriminable['_Disc extends string = string'](schemas.SomeType, Protocol):
    _zod: '$ZodTypeDiscriminableInternals'

class _ZodTypeDiscriminableInternals['_Disc extends string = string']('schemas._$ZodTypeInternals', Protocol):
    propValues: util.PropValues

class _ZodTypeInternals['out O = unknown', 'out I = unknown']('_$ZodTypeInternals', Protocol):
    input: I
    output: O

class _ZodULID('$ZodType', Protocol):
    _zod: '$ZodULIDInternals'

class _ZodULIDDef('$ZodStringFormatDef["ulid"]', Protocol): ...
class _ZodULIDInternals('$ZodStringFormatInternals["ulid"]', Protocol): ...

class _ZodUndefined('$ZodType', Protocol):
    _zod: '$ZodUndefinedInternals'

class _ZodUndefinedDef('$ZodTypeDef', Protocol):
    type: '"undefined"'

class _ZodUndefinedInternals('$ZodTypeInternals[undefined, undefined]', Protocol):
    self["def"]: '$ZodUndefinedDef'
    isst: 'errors.$ZodIssueInvalidType'
    pattern: RegExp
    values: util.PrimitiveSet

class _ZodUnion['T extends readonly SomeType[] = readonly $ZodType[]']('$ZodType[any, any, $ZodUnionInternals[T]]', Protocol):
    _zod: '$ZodUnionInternals[T]'

class _ZodUnionDef['Options extends readonly SomeType[] = readonly $ZodType[]']('$ZodTypeDef', Protocol):
    inclusive: Opt[boolean]
    options: Options
    type: '"union"'

class _ZodUnionInternals['T extends readonly SomeType[] = readonly $ZodType[]']('_$ZodTypeInternals', Protocol):
    self["def"]: '$ZodUnionDef[T]'
    input: '$InferUnionInput[T[number]]'
    isst: 'errors.$ZodIssueInvalidUnion'
    optin: 'IsOptionalIn[T[number]] extends false ? "optional" | "defaulted" | undefined : "optional" | "defaulted"'
    optout: 'IsOptionalOut[T[number]] extends false ? "optional" | undefined : "optional"'
    output: '$InferUnionOutput[T[number]]'
    pattern: 'T[number]["_zod"]["pattern"]'
    values: 'T[number]["_zod"]["values"]'

class _ZodUnknown('$ZodType', Protocol):
    _zod: '$ZodUnknownInternals'

class _ZodUnknownDef('$ZodTypeDef', Protocol):
    type: '"unknown"'

class _ZodUnknownInternals('$ZodTypeInternals[unknown, unknown]', Protocol):
    self["def"]: '$ZodUnknownDef'
    isst: never

class _ZodURL('$ZodType', Protocol):
    _zod: '$ZodURLInternals'

class _ZodURLDef('$ZodStringFormatDef["url"]', Protocol):
    hostname: Opt[RegExp | undefined]
    normalize: Opt[boolean | undefined]
    protocol: Opt[RegExp | undefined]

class _ZodURLInternals('$ZodStringFormatInternals["url"]', Protocol):
    self["def"]: '$ZodURLDef'

class _ZodUUID('$ZodType', Protocol):
    _zod: '$ZodUUIDInternals'

class _ZodUUIDDef('$ZodStringFormatDef["uuid"]', Protocol):
    version: Opt['"v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8"']

class _ZodUUIDInternals('$ZodStringFormatInternals["uuid"]', Protocol):
    self["def"]: '$ZodUUIDDef'

class _ZodVoid('$ZodType', Protocol):
    _zod: '$ZodVoidInternals'

class _ZodVoidDef('$ZodTypeDef', Protocol):
    type: '"void"'

class _ZodVoidInternals('$ZodTypeInternals[void, void]', Protocol):
    self["def"]: '$ZodVoidDef'
    isst: 'errors.$ZodIssueInvalidType'

class _ZodXID('$ZodType', Protocol):
    _zod: '$ZodXIDInternals'

class _ZodXIDDef('$ZodStringFormatDef["xid"]', Protocol): ...
class _ZodXIDInternals('$ZodStringFormatInternals["xid"]', Protocol): ...

class _ZodXor['T extends readonly SomeType[] = readonly $ZodType[]']('$ZodType[any, any, $ZodXorInternals[T]]', Protocol):
    _zod: '$ZodXorInternals[T]'

class _ZodXorInternals['T extends readonly SomeType[] = readonly $ZodType[]']('$ZodUnionInternals[T]', Protocol): ...

class CompileOptions(Protocol):
    strict: Opt[boolean | undefined]

class File(_File, Protocol):
    size: Readonly[number]
    type: Readonly[string]

class GlobalMeta(JSONSchemaMeta, Protocol): ...

class JSONSchemaGeneratorParams(Protocol):
    cycles: Opt['"ref" | "throw"']
    external: Opt['<{ registry: $ZodRegistry[{ id?: string | undefined }]; … (156 chars, #a38cb893)>']
    io: Opt['"input" | "output"']
    metadata: Opt['$ZodRegistry[Record[string, any]]']
    override: Opt['(ctx: { zodSchema: schemas.$ZodTypes; jsonSchema: JSONSchema.BaseSchema; path: (string | number)[] }) => void']
    processors: Record[string, Processor]
    reused: Opt['"ref" | "inline"']
    target: Opt['"draft-04" | "draft-07" | "draft-2020-12" | "openapi-3.0" | ({} & string) | undefined']
    unrepresentable: Opt['"throw" | "any" | UnrepresentableHandler[schemas.$ZodTypes]']

class JSONSchemaMeta(Protocol):
    deprecated: Opt[boolean | undefined]
    description: Opt[string | undefined]
    id: Opt[string | undefined]
    title: Opt[string | undefined]
    def __getitem__(self, k: string) -> unknown: ...

class ParseContext['T extends errors.$ZodIssueBase = never'](Protocol):
    error: Readonly[Opt['errors.$ZodErrorMap[T]']]
    jitless: Readonly[Opt[boolean]]
    reportInput: Readonly[Opt[boolean]]

class ParseContextInternal['T extends errors.$ZodIssueBase = never'](ParseContext[T], Protocol):
    abortEarly: Readonly[Opt[boolean]]
    self["async"]: Readonly[Opt[boolean | undefined]]
    direction: Readonly[Opt['"forward" | "backward"']]
    skipChecks: Readonly[Opt[boolean]]

class ParsePayload['T = unknown'](Protocol):
    aborted: Opt[boolean]
    issues: 'errors.$ZodRawIssue[]'
    memo: Opt[boolean | undefined]
    value: T

class ProcessParams(Protocol):
    path: '(string | number)[]'
    schemaPath: 'schemas.$ZodType[]'

class RegistryToJSONSchemaParams(ToJSONSchemaParams, Protocol):
    uri: Opt['(id: string) => string']

class Seen(Protocol):
    count: number
    cycle: Opt['(string | number)[] | undefined']
    self["def"]: Opt[JSONSchema.BaseSchema]
    defId: Opt[string | undefined]
    isParent: Opt[boolean | undefined]
    path: Opt['(string | number)[] | undefined']
    ref: Opt['schemas.$ZodType | null']
    schema: JSONSchema.BaseSchema

class ToJSONSchemaContext(Protocol):
    counter: number
    cycles: '"ref" | "throw"'
    deferred: '(() => void)[]'
    external: Opt['<{ registry: $ZodRegistry[{ id?: string | undefined }]; … (156 chars, #a38cb893)>']
    intersections: 'JSONSchema.BaseSchema[][]'
    io: '"input" | "output"'
    metadataRegistry: '$ZodRegistry[Record[string, any]]'
    override: '(ctx: { zodSchema: schemas.$ZodType; jsonSchema: JSONSchema.BaseSchema; path: (string | number)[] }) => void'
    processors: Record[string, Processor]
    reused: '"ref" | "inline"'
    seen: 'Map[schemas.$ZodType, Seen]'
    sharedDefsExtractedFor: Opt[ToJSONSchemaContext["external"]]
    sharedEmitDoneFor: Opt[ToJSONSchemaContext["external"]]
    target: '"draft-04" | "draft-07" | "draft-2020-12" | "openapi-3.0" | ({} & string)'
    unrepresentable: '"throw" | "any" | UnrepresentableHandler'

class ZodStandardJSONSchemaPayload[T](JSONSchema.BaseSchema, Protocol):
    self["~standard"]: ZodStandardSchemaWithJSON[T]

class _ZodAsyncError(Error):
    def __init__(self): ...

class _ZodCyclicError(Error):
    def __init__(self): ...

class _ZodEncodeError(Error):
    def __init__(self, name: string): ...

class _ZodRegistry['Meta extends MetadataType = MetadataType', 'Schema extends $ZodType = $ZodType']:
    _idmap: Map[string, Schema]
    _map: 'WeakMap[Schema, $replace[Meta, Schema]]'
    _meta: Meta
    _schema: Schema
    def add['S extends Schema'](
        self,
        schema: S,
        *_meta: 'undefined extends Meta ? [$replace[Meta, S]?] : [$replace[Meta, S]]',
    ) -> this: ...
    def clear(self) -> this: ...
    def get['S extends Schema'](self, schema: S) -> '$replace[Meta, S] | undefined': ...
    def has(self, schema: Schema) -> boolean: ...
    def remove(self, schema: Schema) -> this: ...

class Doc:
    args: 'string[]'
    closed: Record[string, unknown]
    content: 'string[]'
    indent: '<inferred>'
    def __init__(self, args: 'string[]' = ..., closed: Record[string, unknown] = ...): ...
    def compile(self) -> any: ...
    def indented(self, fn: '(doc: Doc) => void') -> '<inferred>': ...
    @overload
    def write(self, fn: ModeWriter) -> void: ...
    @overload
    def write(self, line: string) -> void: ...

class JSONSchemaGenerator:
    counter: number
    io: Readonly['<inferred>']
    metadataRegistry: Readonly['$ZodRegistry[Record[string, any]]']
    override: Readonly['<inferred>']
    seen: Readonly['Map[schemas.$ZodType, Seen]']
    target: Readonly['<inferred>']
    unrepresentable: Readonly[ToJSONSchemaContext["unrepresentable"]]
    def __init__(self, params: JSONSchemaGeneratorConstructorParams = ...): ...
    def emit(
        self,
        schema: 'schemas.$ZodType',
        _params: EmitParams = ...,
    ) -> JSONSchema.BaseSchema: ...
    def process(
        self,
        schema: 'schemas.$ZodType',
        _params: ProcessParams = ...,
    ) -> JSONSchema.BaseSchema: ...

class ZodCompileAsyncError(Error):
    def __init__(self, message=...): ...

class ZodCompileUnsupportedError(Error):
    islandable: Readonly[boolean]
    def __init__(self, feature: string, islandable=...): ...

def _any['T extends schemas.$ZodAny'](Class: util.SchemaClass[T]) -> T: ...

def _array['T extends schemas.$ZodType'](
    Class: 'util.SchemaClass[schemas.$ZodArray]',
    element: T,
    params: 'string | $ZodArrayParams' = ...,
) -> 'schemas.$ZodArray[T]': ...

def _base64['T extends schemas.$ZodBase64'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBase64Params | $ZodCheckBase64Params' = ...,
) -> T: ...

def _base64url['T extends schemas.$ZodBase64URL'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBase64URLParams | $ZodCheckBase64URLParams' = ...,
) -> T: ...

def _bigint['T extends schemas.$ZodBigInt'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBigIntParams' = ...,
) -> T: ...

def _boolean['T extends schemas.$ZodBoolean'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBooleanParams' = ...,
) -> T: ...

def _catch['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodCatch]',
    innerType: T,
    catchValue: 'core.output[T] | ((ctx: schemas.$ZodCatchCtx) => core.output[T])',
) -> 'schemas.$ZodCatch[T]': ...

def _check['O = unknown'](
    fn: schemas.CheckFn[O],
    params: 'string | $ZodCustomParams' = ...,
) -> 'checks.$ZodCheck[O]': ...

def _cidrv4['T extends schemas.$ZodCIDRv4'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCIDRv4Params | $ZodCheckCIDRv4Params' = ...,
) -> T: ...

def _cidrv6['T extends schemas.$ZodCIDRv6'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCIDRv6Params | $ZodCheckCIDRv6Params' = ...,
) -> T: ...

def _coercedBigint['T extends schemas.$ZodBigInt'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBigIntParams' = ...,
) -> T: ...

def _coercedBoolean['T extends schemas.$ZodBoolean'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBooleanParams' = ...,
) -> T: ...

def _coercedDate['T extends schemas.$ZodDate'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodDateParams' = ...,
) -> T: ...

def _coercedNumber['T extends schemas.$ZodNumber'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodNumberParams' = ...,
) -> T: ...

def _coercedString['T extends schemas.$ZodString'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodStringParams' = ...,
) -> T: ...

def _constructor['T extends ZodTrait', 'D = T["_zod"]["def"]'](
    name: string,
    initializer: '(inst: T, def: D) => void',
    proto: ProtoOf[T] = ...,
    params: '$constructorParams' = ...,
) -> '$constructor[T, D]': ...

def _creditCard['T extends schemas.$ZodCreditCard'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCreditCardParams | $ZodCheckCreditCardParams' = ...,
) -> T: ...

def _cuid['T extends schemas.$ZodCUID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCUIDParams | $ZodCheckCUIDParams' = ...,
) -> T: ...

def _cuid2['T extends schemas.$ZodCUID2'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCUID2Params | $ZodCheckCUID2Params' = ...,
) -> T: ...

def _custom['O = unknown', 'I = O'](
    Class: 'util.SchemaClass[schemas.$ZodCustom]',
    fn: '(data: O) => unknown',
    _params: 'string | $ZodCustomParams | undefined',
) -> 'schemas.$ZodCustom[O, I]': ...

def _date['T extends schemas.$ZodDate'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodDateParams' = ...,
) -> T: ...

def _default['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodDefault]',
    innerType: T,
    defaultValue: 'util.NoUndefined[core.output[T]] | (() => util.NoUndefined[core.output[T]])',
) -> 'schemas.$ZodDefault[T]': ...

def _discriminatedUnion[
    'Types extends [$ZodTypeDiscriminable, ...$ZodTypeDiscriminable[]]',
    'Disc extends string',
](
    Class: 'util.SchemaClass[schemas.$ZodDiscriminatedUnion]',
    discriminator: Disc,
    options: Types,
    params: 'string | $ZodDiscriminatedUnionParams' = ...,
) -> 'schemas.$ZodDiscriminatedUnion[Types, Disc]': ...

def _e164['T extends schemas.$ZodE164'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodE164Params | $ZodCheckE164Params' = ...,
) -> T: ...

def _email['T extends schemas.$ZodEmail'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodEmailParams | $ZodCheckEmailParams' = ...,
) -> T: ...

def _emoji['T extends schemas.$ZodEmoji'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodEmojiParams | $ZodCheckEmojiParams' = ...,
) -> T: ...

def _endsWith(
    suffix: string,
    params: 'string | $ZodCheckEndsWithParams' = ...,
) -> 'checks.$ZodCheckEndsWith': ...

@overload
def _enum['const T extends string[]'](
    Class: 'util.SchemaClass[schemas.$ZodEnum]',
    values: T,
    params: 'string | $ZodEnumParams' = ...,
) -> 'schemas.$ZodEnum[util.ToEnum[T[number]]]': ...
@overload
def _enum['T extends util.EnumLike'](
    Class: 'util.SchemaClass[schemas.$ZodEnum]',
    entries: T,
    params: 'string | $ZodEnumParams' = ...,
) -> 'schemas.$ZodEnum[T]': ...

def _file(
    Class: 'util.SchemaClass[schemas.$ZodFile]',
    params: 'string | $ZodFileParams' = ...,
) -> 'schemas.$ZodFile': ...

def _float32['T extends schemas.$ZodNumberFormat'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCheckNumberFormatParams' = ...,
) -> T: ...

def _float64['T extends schemas.$ZodNumberFormat'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCheckNumberFormatParams' = ...,
) -> T: ...

def _gt(
    value: util.Numeric,
    params: 'string | $ZodCheckGreaterThanParams' = ...,
) -> 'checks.$ZodCheckGreaterThan': ...

def _gte(
    value: util.Numeric,
    params: 'string | $ZodCheckGreaterThanParams' = ...,
) -> 'checks.$ZodCheckGreaterThan': ...

def _guid['T extends schemas.$ZodGUID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodGUIDParams | $ZodCheckGUIDParams' = ...,
) -> T: ...

def _iban['T extends schemas.$ZodIBAN'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodIBANParams | $ZodCheckIBANParams' = ...,
) -> T: ...

def _includes(
    includes: string,
    params: 'string | $ZodCheckIncludesParams' = ...,
) -> 'checks.$ZodCheckIncludes': ...

def _int['T extends schemas.$ZodNumberFormat'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCheckNumberFormatParams' = ...,
) -> T: ...

def _int32['T extends schemas.$ZodNumberFormat'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCheckNumberFormatParams' = ...,
) -> T: ...

def _int64['T extends schemas.$ZodBigIntFormat'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBigIntFormatParams' = ...,
) -> T: ...

def _intersection['T extends schemas.$ZodObject', 'U extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodIntersection]',
    left: T,
    right: U,
) -> 'schemas.$ZodIntersection[T, U]': ...

def _ipv4['T extends schemas.$ZodIPv4'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodIPv4Params | $ZodCheckIPv4Params' = ...,
) -> T: ...

def _ipv6['T extends schemas.$ZodIPv6'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodIPv6Params | $ZodCheckIPv6Params' = ...,
) -> T: ...

def _isoDate['T extends schemas.$ZodISODate'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodISODateParams | $ZodCheckISODateParams' = ...,
) -> T: ...

def _isoDateTime['T extends schemas.$ZodISODateTime'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodISODateTimeParams | $ZodCheckISODateTimeParams' = ...,
) -> T: ...

def _isoDuration['T extends schemas.$ZodISODuration'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodISODurationParams | $ZodCheckISODurationParams' = ...,
) -> T: ...

def _isoTime['T extends schemas.$ZodISOTime'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodISOTimeParams | $ZodCheckISOTimeParams' = ...,
) -> T: ...

def _jwt['T extends schemas.$ZodJWT'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodJWTParams | $ZodCheckJWTParams' = ...,
) -> T: ...

def _ksuid['T extends schemas.$ZodKSUID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodKSUIDParams | $ZodCheckKSUIDParams' = ...,
) -> T: ...

def _lazy['T extends schemas.$ZodType'](
    Class: 'util.SchemaClass[schemas.$ZodLazy]',
    getter: '() => T',
) -> 'schemas.$ZodLazy[T]': ...

def _length(
    length: number,
    params: 'string | $ZodCheckLengthEqualsParams' = ...,
) -> 'checks.$ZodCheckLengthEquals[util.HasLength]': ...

@overload
def _literal['const T extends Array[util.Literal]'](
    Class: 'util.SchemaClass[schemas.$ZodLiteral]',
    value: T,
    params: 'string | $ZodLiteralParams' = ...,
) -> 'schemas.$ZodLiteral[T[number]]': ...
@overload
def _literal['const T extends util.Literal'](
    Class: 'util.SchemaClass[schemas.$ZodLiteral]',
    value: T,
    params: 'string | $ZodLiteralParams' = ...,
) -> 'schemas.$ZodLiteral[T]': ...

def _lowercase(
    params: 'string | $ZodCheckLowerCaseParams' = ...,
) -> 'checks.$ZodCheckLowerCase': ...

def _lt(
    value: util.Numeric,
    params: 'string | $ZodCheckLessThanParams' = ...,
) -> 'checks.$ZodCheckLessThan[util.Numeric]': ...

def _lte(
    value: util.Numeric,
    params: 'string | $ZodCheckLessThanParams' = ...,
) -> 'checks.$ZodCheckLessThan[util.Numeric]': ...

def _mac['T extends schemas.$ZodMAC'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodMACParams | $ZodCheckMACParams' = ...,
) -> T: ...

def _map['Key extends schemas.$ZodObject', 'Value extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodMap]',
    keyType: Key,
    valueType: Value,
    params: 'string | $ZodMapParams' = ...,
) -> 'schemas.$ZodMap[Key, Value]': ...

def _max(
    value: util.Numeric,
    params: 'string | $ZodCheckLessThanParams' = ...,
) -> 'checks.$ZodCheckLessThan[util.Numeric]': ...

def _maxLength(
    maximum: number,
    params: 'string | $ZodCheckMaxLengthParams' = ...,
) -> 'checks.$ZodCheckMaxLength[util.HasLength]': ...

def _maxSize(
    maximum: number,
    params: 'string | $ZodCheckMaxSizeParams' = ...,
) -> 'checks.$ZodCheckMaxSize[util.HasSize]': ...

def _mime(
    types: 'util.MimeTypes[]',
    params: 'string | $ZodCheckMimeTypeParams' = ...,
) -> 'checks.$ZodCheckMimeType': ...

def _min(
    value: util.Numeric,
    params: 'string | $ZodCheckGreaterThanParams' = ...,
) -> 'checks.$ZodCheckGreaterThan': ...

def _minLength(
    minimum: number,
    params: 'string | $ZodCheckMinLengthParams' = ...,
) -> 'checks.$ZodCheckMinLength[util.HasLength]': ...

def _minSize(
    minimum: number,
    params: 'string | $ZodCheckMinSizeParams' = ...,
) -> 'checks.$ZodCheckMinSize[util.HasSize]': ...

def _multipleOf(
    value: number | bigint,
    params: 'string | $ZodCheckMultipleOfParams' = ...,
) -> 'checks.$ZodCheckMultipleOf': ...

def _nan['T extends schemas.$ZodNaN'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodNaNParams' = ...,
) -> T: ...

def _nanoid['T extends schemas.$ZodNanoID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodNanoIDParams | $ZodCheckNanoIDParams' = ...,
) -> T: ...

def _nativeEnum['T extends util.EnumLike'](
    Class: 'util.SchemaClass[schemas.$ZodEnum]',
    entries: T,
    params: 'string | $ZodEnumParams' = ...,
) -> 'schemas.$ZodEnum[T]': ...

def _negative(params: 'string | $ZodCheckLessThanParams' = ...) -> 'checks.$ZodCheckLessThan': ...

def _never['T extends schemas.$ZodNever'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodNeverParams' = ...,
) -> T: ...

def _nonnegative(
    params: 'string | $ZodCheckGreaterThanParams' = ...,
) -> 'checks.$ZodCheckGreaterThan': ...

def _nonoptional['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodNonOptional]',
    innerType: T,
    params: 'string | $ZodNonOptionalParams' = ...,
) -> 'schemas.$ZodNonOptional[T]': ...

def _nonpositive(
    params: 'string | $ZodCheckLessThanParams' = ...,
) -> 'checks.$ZodCheckLessThan': ...

def _normalize(
    form: '"NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})' = ...,
) -> 'checks.$ZodCheckOverwrite[string]': ...

def _null['T extends schemas.$ZodNull'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodNullParams' = ...,
) -> T: ...

def _nullable['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodNullable]',
    innerType: T,
) -> 'schemas.$ZodNullable[T]': ...

def _number['T extends schemas.$ZodNumber'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodNumberParams' = ...,
) -> T: ...

def _optional['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodOptional]',
    innerType: T,
) -> 'schemas.$ZodOptional[T]': ...

def _overwrite[T](tx: '(input: T) => T') -> 'checks.$ZodCheckOverwrite[T]': ...

def _pipe[
    'const A extends schemas.$ZodType',
    'B extends schemas.$ZodType[unknown, core.output[A]] = schemas.$ZodType[unknown, core.output[A]]',
](
    Class: 'util.SchemaClass[schemas.$ZodPipe]',
    in_: A,
    out: 'B | schemas.$ZodType[unknown, core.output[A]]',
) -> 'schemas.$ZodPipe[A, B]': ...

def _positive(
    params: 'string | $ZodCheckGreaterThanParams' = ...,
) -> 'checks.$ZodCheckGreaterThan': ...

def _promise['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodPromise]',
    innerType: T,
) -> 'schemas.$ZodPromise[T]': ...

def _properties['Shape extends schemas.$ZodShape'](
    shape: Shape,
    params: 'string | $ZodCheckPropertiesParams' = ...,
) -> 'checks.$ZodCheckProperties[Shape]': ...

def _property['K extends string', 'T extends schemas.$ZodType'](
    property: K,
    schema: T,
    params: 'string | $ZodCheckPropertyParams' = ...,
) -> 'checks.$ZodCheckProperty[{ [k in K]: util.Widen[core.input[T]] }]': ...

def _readonly['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodReadonly]',
    innerType: T,
) -> 'schemas.$ZodReadonly[T]': ...

def _record['Key extends schemas.$ZodRecordKey', 'Value extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodRecord]',
    keyType: Key,
    valueType: Value,
    params: 'string | $ZodRecordParams' = ...,
) -> 'schemas.$ZodRecord[Key, Value]': ...

def _refine['O = unknown', 'I = O'](
    Class: 'util.SchemaClass[schemas.$ZodCustom]',
    fn: '(data: O) => unknown',
    _params: 'string | $ZodCustomParams | undefined',
) -> 'schemas.$ZodCustom[O, I]': ...

def _regex(
    pattern: RegExp,
    params: 'string | $ZodCheckRegexParams' = ...,
) -> 'checks.$ZodCheckRegex': ...

def _set['Value extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodSet]',
    valueType: Value,
    params: 'string | $ZodSetParams' = ...,
) -> 'schemas.$ZodSet[Value]': ...

def _size(
    size: number,
    params: 'string | $ZodCheckSizeEqualsParams' = ...,
) -> 'checks.$ZodCheckSizeEquals[util.HasSize]': ...

def _slugify() -> 'checks.$ZodCheckOverwrite[string]': ...

def _startsWith(
    prefix: string,
    params: 'string | $ZodCheckStartsWithParams' = ...,
) -> 'checks.$ZodCheckStartsWith': ...

def _string['T extends schemas.$ZodString'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodStringParams' = ...,
) -> T: ...

def _stringbool(
    Classes: '{ Codec?: typeof schemas.$ZodCodec; Boolean?: typeof schemas.$ZodBoolean; String?: typeof schemas.$ZodString }',
    _params: 'string | $ZodStringBoolParams' = ...,
) -> 'schemas.$ZodCodec[schemas.$ZodString, schemas.$ZodBoolean]': ...

def _stringFormat['Format extends string'](
    Class: 'typeof schemas.$ZodCustomStringFormat',
    format: Format,
    fnOrRegex: '((arg: string) => util.MaybeAsync[unknown]) | RegExp',
    _params: 'string | $ZodStringFormatParams' = ...,
) -> 'schemas.$ZodCustomStringFormat[Format]': ...

def _success['T extends schemas.$ZodObject'](
    Class: 'util.SchemaClass[schemas.$ZodSuccess]',
    innerType: T,
) -> 'schemas.$ZodSuccess[T]': ...

def _superRefine[T](
    fn: '(arg: T, payload: $RefinementCtx[T]) => void | Promise[void]',
    params: '$ZodSuperRefineParams' = ...,
) -> 'checks.$ZodCheck[T]': ...

def _symbol['T extends schemas.$ZodSymbol'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodSymbolParams' = ...,
) -> T: ...

def _templateLiteral['const Parts extends schemas.$ZodTemplateLiteralPart[]'](
    Class: 'util.SchemaClass[schemas.$ZodTemplateLiteral]',
    parts: Parts,
    params: 'string | $ZodTemplateLiteralParams' = ...,
) -> 'schemas.$ZodTemplateLiteral[schemas.$PartsToTemplateLiteral[Parts]]': ...

def _toLowerCase() -> 'checks.$ZodCheckOverwrite[string]': ...
def _toUpperCase() -> 'checks.$ZodCheckOverwrite[string]': ...

def _transform['I = unknown', 'O = I'](
    Class: 'util.SchemaClass[schemas.$ZodTransform]',
    fn: '(input: I, ctx?: schemas.ParsePayload) => O',
) -> 'schemas.$ZodTransform[Awaited[O], I]': ...

def _trim() -> 'checks.$ZodCheckOverwrite[string]': ...

@overload
def _tuple['T extends readonly [schemas.$ZodType, ...schemas.$ZodType[]]'](
    Class: 'util.SchemaClass[schemas.$ZodTuple]',
    items: T,
    params: 'string | $ZodTupleParams' = ...,
) -> 'schemas.$ZodTuple[T, null]': ...
@overload
def _tuple[
    'T extends readonly [schemas.$ZodType, ...schemas.$ZodType[]]',
    'Rest extends schemas.$ZodType',
](
    Class: 'util.SchemaClass[schemas.$ZodTuple]',
    items: T,
    rest: Rest,
    params: 'string | $ZodTupleParams' = ...,
) -> 'schemas.$ZodTuple[T, Rest]': ...

def _uint32['T extends schemas.$ZodNumberFormat'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodCheckNumberFormatParams' = ...,
) -> T: ...

def _uint64['T extends schemas.$ZodBigIntFormat'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodBigIntFormatParams' = ...,
) -> T: ...

def _ulid['T extends schemas.$ZodULID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodULIDParams | $ZodCheckULIDParams' = ...,
) -> T: ...

def _undefined['T extends schemas.$ZodUndefined'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodUndefinedParams' = ...,
) -> T: ...

def _union['const T extends readonly schemas.$ZodObject[]'](
    Class: 'util.SchemaClass[schemas.$ZodUnion]',
    options: T,
    params: 'string | $ZodUnionParams' = ...,
) -> 'schemas.$ZodUnion[T]': ...

def _unknown['T extends schemas.$ZodUnknown'](Class: util.SchemaClass[T]) -> T: ...

def _uppercase(
    params: 'string | $ZodCheckUpperCaseParams' = ...,
) -> 'checks.$ZodCheckUpperCase': ...

def _url['T extends schemas.$ZodURL'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodURLParams | $ZodCheckURLParams' = ...,
) -> T: ...

def _uuid['T extends schemas.$ZodUUID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodUUIDParams | $ZodCheckUUIDParams' = ...,
) -> T: ...

def _uuidv4['T extends schemas.$ZodUUID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodUUIDv4Params | $ZodCheckUUIDv4Params' = ...,
) -> T: ...

def _uuidv6['T extends schemas.$ZodUUID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodUUIDv6Params | $ZodCheckUUIDv6Params' = ...,
) -> T: ...

def _uuidv7['T extends schemas.$ZodUUID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodUUIDv7Params | $ZodCheckUUIDv7Params' = ...,
) -> T: ...

def _void['T extends schemas.$ZodVoid'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodVoidParams' = ...,
) -> T: ...

def _xid['T extends schemas.$ZodXID'](
    Class: util.SchemaClass[T],
    params: 'string | $ZodXIDParams | $ZodCheckXIDParams' = ...,
) -> T: ...

def _xor['const T extends readonly schemas.$ZodObject[]'](
    Class: 'util.SchemaClass[schemas.$ZodXor]',
    options: T,
    params: 'string | $ZodXorParams' = ...,
) -> 'schemas.$ZodXor[T]': ...

def canParseURL(input: string) -> boolean: ...

def clone['T extends schemas.$ZodType'](
    inst: T,
    def_: 'T["_zod"]["def"]' = ...,
    params: '{ parent: boolean }' = ...,
) -> T: ...

def compile['T extends SomeType'](schema: T, options: CompileOptions = ...) -> T: ...

def compileFn['T extends SomeType'](
    schema: T,
    options: CompileFnOptions = ...,
) -> CompiledFn[core.output[T]]: ...

def config(newConfig: 'Partial[$ZodConfig]' = ...) -> '$ZodConfig': ...

def createStandardJSONSchemaMethod['T extends schemas.$ZodType'](
    schema: T,
    io: '"input" | "output"',
    processors: Record[string, Processor] = ...,
) -> '<inferred>': ...

def createToJSONSchemaMethod['T extends schemas.$ZodType'](
    schema: T,
    processors: Record[string, Processor] = ...,
) -> '<inferred>': ...

def describe[T](description: string) -> 'checks.$ZodCheck[T]': ...
def extractDefs['T extends schemas.$ZodType'](ctx: ToJSONSchemaContext, schema: T) -> void: ...

def finalize['T extends schemas.$ZodType'](
    ctx: ToJSONSchemaContext,
    schema: T,
) -> ZodStandardJSONSchemaPayload[T]: ...

@overload
def flattenError[T](error: '$ZodError[T]') -> _FlattenedError[T]: ...
@overload
def flattenError[T, U](
    error: '$ZodError[T]',
    mapper: '(issue: $ZodIssue) => U' = ...,
) -> _FlattenedError[T, U]: ...

@overload
def formatError[T](error: '$ZodError[T]') -> '$ZodFormattedError[T]': ...
@overload
def formatError[T, U](
    error: '$ZodError[T]',
    mapper: '(issue: $ZodIssue) => U' = ...,
) -> '$ZodFormattedError[T, U]': ...

def getDiscriminatedOption[
    'Options extends readonly SomeType[]',
    'Disc extends string',
    'const V extends $DiscriminatorValue[Options, Disc]',
](
    union: '$ZodDiscriminatedUnion[Options, Disc]',
    value: V,
) -> '$DiscriminatedOption[Options, Disc, V]': ...

def handleUnrepresentable(
    schema: 'schemas.$ZodType',
    ctx: ToJSONSchemaContext,
    json: JSONSchema.BaseSchema,
    params: ProcessParams,
    message: string,
) -> boolean: ...

def initializeContext(params: JSONSchemaGeneratorParams) -> ToJSONSchemaContext: ...
def isBackEdge(ctx: object, value: unknown) -> boolean: ...
def isRecursiveSchema(inst: '$ZodType') -> boolean: ...
def isValidBase64(data: string) -> boolean: ...
def isValidBase64URL(data: string) -> boolean: ...
def isValidCIDRv6(value: string) -> boolean: ...
def isValidCreditCard(input: string) -> boolean: ...
def isValidIBAN(input: string) -> boolean: ...
def isValidIPv6(value: string) -> boolean: ...
def isValidJWT(token: string, algorithm: util.JWTAlgorithm | null = ...) -> boolean: ...
def memoizer() -> '$ZodMemoizer': ...

def mergeValues(
    a: any,
    b: any,
) -> '{ valid: true; data: any } | { valid: false; mergeErrorPath: (string | number)[] }': ...

def meta[T](metadata: registries.GlobalMeta) -> 'checks.$ZodCheck[T]': ...

def parseURLObject(
    trimmed: string,
    def_: 'Pick[$ZodURLDef, "protocol" | "normalize"]',
) -> 'URL | typeof URL_BAD_FORMAT | typeof URL_UNPARSEABLE': ...

def prettifyError(error: StandardSchemaV1.FailureResult) -> string: ...

def process['T extends schemas.$ZodType'](
    schema: T,
    ctx: ToJSONSchemaContext,
    _params: ProcessParams = ...,
) -> JSONSchema.BaseSchema: ...

def processSchema['T extends schemas.$ZodType'](
    schema: T,
    ctx: ToJSONSchemaContext,
    _params: ProcessParams = ...,
) -> JSONSchema.BaseSchema: ...

def registry['T extends MetadataType = MetadataType', 'S extends $ZodType = $ZodType']() -> '$ZodRegistry[T, S]': ...
def standardProps(inst: '$ZodType') -> StandardSchemaV1.Props[any, any]: ...
def stripTabAndNewline(value: string) -> string: ...

def toDotPath(
    _path: 'readonly (string | number | symbol | StandardSchemaV1.PathSegment)[]',
) -> string: ...

@overload
def toJSONSchema['T extends schemas.$ZodType'](
    schema: T,
    params: ToJSONSchemaParams = ...,
) -> ZodStandardJSONSchemaPayload[T]: ...
@overload
def toJSONSchema(
    registry: '$ZodRegistry[{ id?: string | undefined }]',
    params: RegistryToJSONSchemaParams = ...,
) -> '{ schemas: Record[string, ZodStandardJSONSchemaPayload[schemas.$ZodType]] }': ...

def toZod[T]() -> '[S extends schemas.$ZodType](schema: ToZodEqual[S["_zod"]["output"], T] extends true ? S : ToZodTarget[S, T]) => S': ...

@overload
def treeifyError[T](error: '$ZodError[T]') -> '$ZodErrorTree[T]': ...
@overload
def treeifyError[T, U](
    error: '$ZodError[T]',
    mapper: '(issue: $ZodIssue) => U' = ...,
) -> '$ZodErrorTree[T, U]': ...

def urlHostnameOk(url: URL, hostname: RegExp) -> boolean: ...
def urlProtocolOk(url: URL, protocol: RegExp) -> boolean: ...

def validateURL(
    trimmed: string,
    def_: 'Pick[$ZodURLDef, "protocol" | "hostname" | "normalize"]',
) -> 'URL | true | typeof URL_BAD_FORMAT | typeof URL_UNPARSEABLE': ...

def withParser['T extends SomeType'](
    schema: T,
    parser: '(input: unknown) => core.output[T] | INVALID',
) -> T: ...

_brand: 'unique symbol'
_decode: '(_Err: $ZodErrorClass) => $Decode'
_decodeAsync: '(_Err: $ZodErrorClass) => $DecodeAsync'
_encode: '(_Err: $ZodErrorClass) => $Encode'
_encodeAsync: '(_Err: $ZodErrorClass) => $EncodeAsync'
_input: 'unique symbol'
_output: 'unique symbol'
_parse: '(_Err: $ZodErrorClass) => $Parse'
_parseAsync: '(_Err: $ZodErrorClass) => $ParseAsync'
_safeDecode: '(_Err: $ZodErrorClass) => $SafeDecode'
_safeDecodeAsync: '(_Err: $ZodErrorClass) => $SafeDecodeAsync'
_safeEncode: '(_Err: $ZodErrorClass) => $SafeEncode'
_safeEncodeAsync: '(_Err: $ZodErrorClass) => $SafeEncodeAsync'
_safeParse: '(_Err: $ZodErrorClass) => $SafeParse'
_safeParseAsync: '(_Err: $ZodErrorClass) => $SafeParseAsync'
_ZodAny: 'core.$constructor[$ZodAny]'
_ZodArray: 'core.$constructor[$ZodArray]'
_ZodBase64: 'core.$constructor[$ZodBase64]'
_ZodBase64URL: 'core.$constructor[$ZodBase64URL]'
_ZodBigInt: 'core.$constructor[$ZodBigInt]'
_ZodBigIntFormat: 'core.$constructor[$ZodBigIntFormat]'
_ZodBoolean: 'core.$constructor[$ZodBoolean]'
_ZodCatch: 'core.$constructor[$ZodCatch]'
_ZodCheck: 'core.$constructor[$ZodCheck[any]]'
_ZodCheckBigIntFormat: 'core.$constructor[$ZodCheckBigIntFormat]'
_ZodCheckEndsWith: 'core.$constructor[$ZodCheckEndsWith]'
_ZodCheckGreaterThan: 'core.$constructor[$ZodCheckGreaterThan]'
_ZodCheckIncludes: 'core.$constructor[$ZodCheckIncludes]'
_ZodCheckLengthEquals: 'core.$constructor[$ZodCheckLengthEquals]'
_ZodCheckLessThan: 'core.$constructor[$ZodCheckLessThan]'
_ZodCheckLowerCase: 'core.$constructor[$ZodCheckLowerCase]'
_ZodCheckMaxLength: 'core.$constructor[$ZodCheckMaxLength]'
_ZodCheckMaxSize: 'core.$constructor[$ZodCheckMaxSize]'
_ZodCheckMimeType: 'core.$constructor[$ZodCheckMimeType]'
_ZodCheckMinLength: 'core.$constructor[$ZodCheckMinLength]'
_ZodCheckMinSize: 'core.$constructor[$ZodCheckMinSize]'
_ZodCheckMultipleOf: 'core.$constructor[$ZodCheckMultipleOf[number | bigint]]'
_ZodCheckNumberFormat: 'core.$constructor[$ZodCheckNumberFormat]'
_ZodCheckOverwrite: 'core.$constructor[$ZodCheckOverwrite]'
_ZodCheckProperties: 'core.$constructor[$ZodCheckProperties]'
_ZodCheckProperty: 'core.$constructor[$ZodCheckProperty]'
_ZodCheckRegex: 'core.$constructor[$ZodCheckRegex]'
_ZodCheckSizeEquals: 'core.$constructor[$ZodCheckSizeEquals]'
_ZodCheckStartsWith: 'core.$constructor[$ZodCheckStartsWith]'
_ZodCheckStringFormat: 'core.$constructor[$ZodCheckStringFormat]'
_ZodCheckUpperCase: 'core.$constructor[$ZodCheckUpperCase]'
_ZodCIDRv4: 'core.$constructor[$ZodCIDRv4]'
_ZodCIDRv6: 'core.$constructor[$ZodCIDRv6]'
_ZodCodec: 'core.$constructor[$ZodCodec]'
_ZodCreditCard: 'core.$constructor[$ZodCreditCard]'
_ZodCUID: 'core.$constructor[$ZodCUID]'
_ZodCUID2: 'core.$constructor[$ZodCUID2]'
_ZodCustom: 'core.$constructor[$ZodCustom]'
_ZodCustomStringFormat: 'core.$constructor[$ZodCustomStringFormat]'
_ZodDate: 'core.$constructor[$ZodDate]'
_ZodDefault: 'core.$constructor[$ZodDefault]'
_ZodDiscriminatedUnion: 'core.$constructor[$ZodDiscriminatedUnion]'
_ZodE164: 'core.$constructor[$ZodE164]'
_ZodEmail: 'core.$constructor[$ZodEmail]'
_ZodEmoji: 'core.$constructor[$ZodEmoji]'
_ZodEnum: 'core.$constructor[$ZodEnum]'
_ZodError: '$constructor[$ZodError]'
_ZodExactOptional: 'core.$constructor[$ZodExactOptional]'
_ZodFile: 'core.$constructor[$ZodFile]'
_ZodFunction: 'core.$constructor[$ZodFunction]'
_ZodGUID: 'core.$constructor[$ZodGUID]'
_ZodIBAN: 'core.$constructor[$ZodIBAN]'
_ZodIntersection: 'core.$constructor[$ZodIntersection]'
_ZodIPv4: 'core.$constructor[$ZodIPv4]'
_ZodIPv6: 'core.$constructor[$ZodIPv6]'
_ZodISODate: 'core.$constructor[$ZodISODate]'
_ZodISODateTime: 'core.$constructor[$ZodISODateTime]'
_ZodISODuration: 'core.$constructor[$ZodISODuration]'
_ZodISOTime: 'core.$constructor[$ZodISOTime]'
_ZodJWT: 'core.$constructor[$ZodJWT]'
_ZodKSUID: 'core.$constructor[$ZodKSUID]'
_ZodLazy: 'core.$constructor[$ZodLazy]'
_ZodLiteral: 'core.$constructor[$ZodLiteral]'
_ZodMAC: 'core.$constructor[$ZodMAC]'
_ZodMap: 'core.$constructor[$ZodMap]'
_ZodNaN: 'core.$constructor[$ZodNaN]'
_ZodNanoID: 'core.$constructor[$ZodNanoID]'
_ZodNever: 'core.$constructor[$ZodNever]'
_ZodNonOptional: 'core.$constructor[$ZodNonOptional]'
_ZodNull: 'core.$constructor[$ZodNull]'
_ZodNullable: 'core.$constructor[$ZodNullable]'
_ZodNumber: 'core.$constructor[$ZodNumber]'
_ZodNumberFormat: 'core.$constructor[$ZodNumberFormat]'
_ZodObject: 'core.$constructor[$ZodObject]'
_ZodObjectJIT: 'core.$constructor[$ZodObject]'
_ZodOptional: 'core.$constructor[$ZodOptional]'
_ZodPipe: 'core.$constructor[$ZodPipe]'
_ZodPrefault: 'core.$constructor[$ZodPrefault]'
_ZodPreprocess: 'core.$constructor[$ZodPreprocess]'
_ZodPromise: 'core.$constructor[$ZodPromise]'
_ZodReadonly: 'core.$constructor[$ZodReadonly]'
_ZodRealError: '$constructor[$ZodRealError]'
_ZodRecord: 'core.$constructor[$ZodRecord]'
_ZodSet: 'core.$constructor[$ZodSet]'
_ZodString: 'core.$constructor[$ZodString]'
_ZodStringFormat: 'core.$constructor[$ZodStringFormat]'
_ZodSuccess: 'core.$constructor[$ZodSuccess]'
_ZodSymbol: 'core.$constructor[$ZodSymbol]'
_ZodTemplateLiteral: 'core.$constructor[$ZodTemplateLiteral]'
_ZodTransform: 'core.$constructor[$ZodTransform]'
_ZodTuple: 'core.$constructor[$ZodTuple]'
_ZodType: 'core.$constructor[$ZodType]'
_ZodULID: 'core.$constructor[$ZodULID]'
_ZodUndefined: 'core.$constructor[$ZodUndefined]'
_ZodUnion: 'core.$constructor[$ZodUnion]'
_ZodUnknown: 'core.$constructor[$ZodUnknown]'
_ZodURL: 'core.$constructor[$ZodURL]'
_ZodUUID: 'core.$constructor[$ZodUUID]'
_ZodVoid: 'core.$constructor[$ZodVoid]'
_ZodXID: 'core.$constructor[$ZodXID]'
_ZodXor: 'core.$constructor[$ZodXor]'
base64Charset: RegExp
base64urlCharset: RegExp
decode: '$Decode'
decodeAsync: '$DecodeAsync'
encode: '$Encode'
encodeAsync: '$EncodeAsync'
globalConfig: '$ZodConfig'
globalRegistry: '$ZodRegistry[GlobalMeta]'
INVALID: 'unique symbol'
JSONSchema: namespace
NEVER: never
parse: '$Parse'
parseAsync: '$ParseAsync'
regexes: namespace
safeDecode: '$SafeDecode'
safeDecodeAsync: '$SafeDecodeAsync'
safeEncode: '$SafeEncode'
safeEncodeAsync: '$SafeEncodeAsync'
safeParse: '$SafeParse'
safeParseAsync: '$SafeParseAsync'
TimePrecision: '<inferred>'
URL_BAD_FORMAT: '<inferred>'
URL_UNPARSEABLE: '<inferred>'
util: namespace
validate: '$Validate'
validateAsync: '$ValidateAsync'
version: '<inferred>'
