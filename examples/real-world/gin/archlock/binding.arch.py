__module__ = "binding"
__paths__ = ["binding/*.go"]
__depends_on__ = ["codec.json", "internal.bytesconv"]

class Binding(Protocol):
    def Bind(self, _1: '*http.Request', _2: any) -> error: ...
    def Name(self) -> string: ...

class BindingBody(Binding, Protocol):
    def BindBody(self, _1: '[]byte', _2: any) -> error: ...

class BindingUri(Protocol):
    def BindUri(self, _1: 'map[string][]string', _2: any) -> error: ...
    def Name(self) -> string: ...

class BindUnmarshaler(Protocol):
    def UnmarshalParam(self, param: string) -> error: ...

class StructValidator(Protocol):
    def Engine(self) -> any: ...
    def ValidateStruct(self, _1: any) -> error: ...

class SliceValidationError('[]error'):
    def Error(self: SliceValidationError) -> string: ...

def Default(method: string, contentType: string) -> Binding: ...
def MapFormWithTag(ptr: any, form: 'map[string][]string', tag: string) -> error: ...

BSON: BindingBody
EnableDecoderDisallowUnknownFields: bool
EnableDecoderUseNumber: bool
ErrConvertMapStringSlice: error
ErrConvertToMapString: error
ErrMultiFileHeader: error
ErrMultiFileHeaderLenInvalid: error
Form: Binding
FormMultipart: Binding
FormPost: Binding
Header: Binding
JSON: BindingBody
MIMEBSON: 'untyped string'
MIMEHTML: 'untyped string'
MIMEJSON: 'untyped string'
MIMEMSGPACK: 'untyped string'
MIMEMSGPACK2: 'untyped string'
MIMEMultipartPOSTForm: 'untyped string'
MIMEPlain: 'untyped string'
MIMEPOSTForm: 'untyped string'
MIMEPROTOBUF: 'untyped string'
MIMETOML: 'untyped string'
MIMEXML: 'untyped string'
MIMEXML2: 'untyped string'
MIMEYAML: 'untyped string'
MIMEYAML2: 'untyped string'
MsgPack: BindingBody
Plain: BindingBody
ProtoBuf: BindingBody
Query: Binding
TOML: BindingBody
Uri: BindingUri
Validator: StructValidator
XML: BindingBody
YAML: BindingBody
