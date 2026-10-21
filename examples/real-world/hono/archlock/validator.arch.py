__module__ = "validator"
__paths__ = ["src/validator/**"]
__entry__ = "src/validator/index.ts"
__depends_on__ = ["helper", "hono", "utils"]

InferInput: TypeAlias[Output, 'Target extends keyof ValidationTargets', 'T extends FormValue = ParsedFormValue'] = '<[Exclude[Output, undefined]] extends [never] ? {} : … (263 chars, #23df2fb7)>'
ValidationFunction: TypeAlias[InputType, OutputType, 'E extends Env = {}', 'P extends string = string'] = '(value: InputType, c: Context[E, P]) => OutputType | TypedResponse | Promise[OutputType] | Promise[TypedResponse]'

def validator[
    InputType,
    'P extends string',
    'M extends string',
    'U extends ValidationTargetByMethod[M]',
    'P2 extends string = P',
    'VF extends (value: unknown extends InputType ? ValidationTargets[U] : InputType, c: Context[any, P2]) => any = (value: unknown extends InputType ? ValidationTargets[U] : InputType, c: Context[any, P2]) => any',
    'V extends { in: { [K in U]: K extends "json" ? unknown extends InputType ? ExtractValidatorOutput[VF] : InputType : InferInput[ExtractValidatorOutput[VF], K, FormValue] }; out: { [K in U]: ExtractValidatorOutput[VF] } } = { in: { [K in U]: K extends "json" ? unknown extends InputType ? ExtractValidatorOutput[VF] : InputType : InferInput[ExtractValidatorOutput[VF], K, FormValue] }; out: { [K in U]: ExtractValidatorOutput[VF] } }',
    'E extends Env = any',
](
    target: U,
    validationFunc: VF,
) -> MiddlewareHandler[E, P, V, ExtractValidationResponse[VF]]: ...
