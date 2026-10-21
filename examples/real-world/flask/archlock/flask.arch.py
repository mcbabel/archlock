__module__ = "flask"
__paths__ = ["src/flask/*"]
__entry__ = "src/flask/__init__.py"
__depends_on__ = ["json", "sansio"]

from .json import json, jsonify

class Blueprint(SansioBlueprint):
    cli: '<inferred>'
    def __init__(
        self,
        name: str,
        import_name: str,
        static_folder: str | os.PathLike[str] | None = ...,
        static_url_path: str | None = ...,
        template_folder: str | os.PathLike[str] | None = ...,
        url_prefix: str | None = ...,
        subdomain: str | None = ...,
        url_defaults: dict[str, t.Any] | None = ...,
        root_path: str | None = ...,
        cli_group: str | None = ...,
    ): ...
    def get_send_file_max_age(self, filename: str | None) -> int | None: ...
    def open_resource(
        self,
        resource: str,
        mode: str = ...,
        encoding: str | None = ...,
    ) -> t.IO[t.AnyStr]: ...
    def send_static_file(self, filename: str) -> Response: ...

class Config(dict):
    root_path: str | os.PathLike[str]
    def __init__(
        self,
        root_path: str | os.PathLike[str],
        defaults: dict[str, t.Any] | None = ...,
    ): ...
    def from_envvar(self, variable_name: str, silent: bool = ...) -> bool: ...
    def from_file(
        self,
        filename: str | os.PathLike[str],
        load: t.Callable[[t.IO[t.Any]], t.Mapping[str, t.Any]],
        silent: bool = ...,
        text: bool = ...,
    ) -> bool: ...
    def from_mapping(
        self,
        mapping: t.Mapping[str, t.Any] | None = ...,
        **kwargs: t.Any,
    ) -> bool: ...
    def from_object(self, obj: object | str) -> None: ...
    def from_prefixed_env(
        self,
        prefix: str = ...,
        *,
        loads: t.Callable[[str], t.Any] = ...,
    ) -> bool: ...
    def from_pyfile(self, filename: str | os.PathLike[str], silent: bool = ...) -> bool: ...
    def get_namespace(
        self,
        namespace: str,
        lowercase: bool = ...,
        trim_namespace: bool = ...,
    ) -> dict[str, t.Any]: ...

class Flask(App):
    cli: '<inferred>'
    default_config: cabc.Mapping[str, t.Any]
    request_class: type[Request]
    response_class: type[Response]
    session_interface: SessionInterface
    def __init__(
        self,
        import_name: str,
        static_url_path: str | None = ...,
        static_folder: str | os.PathLike[str] | None = ...,
        static_host: str | None = ...,
        host_matching: bool = ...,
        subdomain_matching: bool = ...,
        template_folder: str | os.PathLike[str] | None = ...,
        instance_path: str | None = ...,
        instance_relative_config: bool = ...,
        root_path: str | None = ...,
    ): ...
    def __call__(
        self,
        environ: WSGIEnvironment,
        start_response: StartResponse,
    ) -> cabc.Iterable[bytes]: ...
    def app_context(self) -> AppContext: ...
    def async_to_sync(
        self,
        func: t.Callable[..., t.Coroutine[t.Any, t.Any, t.Any]],
    ) -> t.Callable[..., t.Any]: ...
    def create_jinja_environment(self) -> Environment: ...
    def create_url_adapter(self, request: Request | None) -> MapAdapter | None: ...
    def dispatch_request(self, ctx: AppContext) -> ft.ResponseReturnValue: ...
    def do_teardown_appcontext(self, ctx: AppContext, exc: BaseException | None = ...) -> None: ...
    def do_teardown_request(self, ctx: AppContext, exc: BaseException | None = ...) -> None: ...
    def ensure_sync(self, func: t.Callable[..., t.Any]) -> t.Callable[..., t.Any]: ...
    def finalize_request(
        self,
        ctx: AppContext,
        rv: ft.ResponseReturnValue | HTTPException,
        from_error_handler: bool = ...,
    ) -> Response: ...
    def full_dispatch_request(self, ctx: AppContext) -> Response: ...
    def get_send_file_max_age(self, filename: str | None) -> int | None: ...
    def handle_exception(self, ctx: AppContext, e: Exception) -> Response: ...
    def handle_http_exception(
        self,
        ctx: AppContext,
        e: HTTPException,
    ) -> HTTPException | ft.ResponseReturnValue: ...
    def handle_user_exception(
        self,
        ctx: AppContext,
        e: Exception,
    ) -> HTTPException | ft.ResponseReturnValue: ...
    def log_exception(
        self,
        ctx: AppContext,
        exc_info: tuple[type, BaseException, TracebackType] | tuple[None, None, None],
    ) -> None: ...
    def make_default_options_response(self, ctx: AppContext) -> Response: ...
    def make_response(self, rv: ft.ResponseReturnValue) -> Response: ...
    def make_shell_context(self) -> dict[str, t.Any]: ...
    def open_instance_resource(
        self,
        resource: str,
        mode: str = ...,
        encoding: str | None = ...,
    ) -> t.IO[t.AnyStr]: ...
    def open_resource(
        self,
        resource: str,
        mode: str = ...,
        encoding: str | None = ...,
    ) -> t.IO[t.AnyStr]: ...
    def preprocess_request(self, ctx: AppContext) -> ft.ResponseReturnValue | None: ...
    def process_response(self, ctx: AppContext, response: Response) -> Response: ...
    def raise_routing_exception(self, request: Request) -> t.NoReturn: ...
    def request_context(self, environ: WSGIEnvironment) -> AppContext: ...
    def run(
        self,
        host: str | None = ...,
        port: int | None = ...,
        debug: bool | None = ...,
        load_dotenv: bool = ...,
        **options: t.Any,
    ) -> None: ...
    def send_static_file(self, filename: str) -> Response: ...
    def test_cli_runner(self, **kwargs: t.Any) -> FlaskCliRunner: ...
    def test_client(self, use_cookies: bool = ..., **kwargs: t.Any) -> FlaskClient: ...
    def test_request_context(self, *args: t.Any, **kwargs: t.Any) -> AppContext: ...
    def update_template_context(self, ctx: AppContext, context: dict[str, t.Any]) -> None: ...
    def url_for(
        self,
        /,
        endpoint: str,
        *,
        _anchor: str | None = ...,
        _method: str | None = ...,
        _scheme: str | None = ...,
        _external: bool | None = ...,
        **values: t.Any,
    ) -> str: ...
    def wsgi_app(
        self,
        environ: WSGIEnvironment,
        start_response: StartResponse,
    ) -> cabc.Iterable[bytes]: ...

class Request(RequestBase):
    blueprint: Readonly[str | None]
    blueprints: Readonly[list[str]]
    endpoint: Readonly[str | None]
    json_module: t.Any
    max_content_length: int | None
    max_form_memory_size: int | None
    max_form_parts: int | None
    routing_exception: HTTPException | None
    url_rule: Rule | None
    view_args: dict[str, t.Any] | None
    def on_json_loading_failed(self, e: ValueError | None) -> t.Any: ...

class Response(ResponseBase):
    autocorrect_location_header: ClassVar['<inferred>']
    default_mimetype: str | None
    json_module: ClassVar['<inferred>']
    max_cookie_size: Readonly[int]

def abort(code: int | BaseResponse, *args: t.Any, **kwargs: t.Any) -> t.NoReturn: ...
def after_this_request(f: ft.AfterRequestCallable[t.Any]) -> ft.AfterRequestCallable[t.Any]: ...
def copy_current_request_context(f: F) -> F: ...
def flash(message: str, category: str = ...) -> None: ...

def get_flashed_messages(
    with_categories: bool = ...,
    category_filter: t.Iterable[str] = ...,
) -> list[str] | list[tuple[str, str]]: ...

def get_template_attribute(template_name: str, attribute: str) -> t.Any: ...
def has_app_context() -> bool: ...
def has_request_context() -> bool: ...
def make_response(*args: t.Any) -> Response: ...

def redirect(
    location: str,
    code: int = ...,
    Response: type[BaseResponse] | None = ...,
) -> BaseResponse: ...

def render_template(
    template_name_or_list: str | Template | list[str | Template],
    **context: t.Any,
) -> str: ...

def render_template_string(source: str, **context: t.Any) -> str: ...

def send_file(
    path_or_file: os.PathLike[t.AnyStr] | str | t.IO[bytes],
    mimetype: str | None = ...,
    as_attachment: bool = ...,
    download_name: str | None = ...,
    conditional: bool = ...,
    etag: bool | str = ...,
    last_modified: datetime | int | float | None = ...,
    max_age: 'None | (int | t.Callable[[str | None], int | None])' = ...,
) -> Response: ...

def send_from_directory(
    directory: os.PathLike[str] | str,
    path: os.PathLike[str] | str,
    **kwargs: t.Any,
) -> Response: ...

def stream_template(
    template_name_or_list: str | Template | list[str | Template],
    **context: t.Any,
) -> t.Iterator[str]: ...

def stream_template_string(source: str, **context: t.Any) -> t.Iterator[str]: ...

@overload
def stream_with_context(generator_or_function: t.Iterator[t.AnyStr]) -> t.Iterator[t.AnyStr]: ...
@overload
def stream_with_context(
    generator_or_function: t.Callable[..., t.Iterator[t.AnyStr]],
) -> t.Callable[[t.Iterator[t.AnyStr]], t.Iterator[t.AnyStr]]: ...

def url_for(
    endpoint: str,
    *,
    _anchor: str | None = ...,
    _method: str | None = ...,
    _scheme: str | None = ...,
    _external: bool | None = ...,
    **values: t.Any,
) -> str: ...

appcontext_popped: '<inferred>'
appcontext_pushed: '<inferred>'
appcontext_tearing_down: '<inferred>'
before_render_template: '<inferred>'
current_app: FlaskProxy
g: _AppCtxGlobalsProxy
got_request_exception: '<inferred>'
message_flashed: '<inferred>'
request: RequestProxy
request_finished: '<inferred>'
request_started: '<inferred>'
request_tearing_down: '<inferred>'
session: SessionMixinProxy
template_rendered: '<inferred>'
