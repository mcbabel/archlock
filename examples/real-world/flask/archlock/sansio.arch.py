__module__ = "sansio"
__paths__ = ["src/flask/sansio/**"]
__depends_on__ = ["flask", "json"]

DeferredSetupFunction: TypeAlias = t.Callable[[BlueprintSetupState], None]

class App(Scaffold):
    aborter: '<inferred>'
    aborter_class: ClassVar['<inferred>']
    app_ctx_globals_class: ClassVar['<inferred>']
    blueprints: dict[str, Blueprint]
    config: '<inferred>'
    config_class: ClassVar['<inferred>']
    debug: bool
    default_config: cabc.Mapping[str, t.Any]
    extensions: dict[str, t.Any]
    instance_path: str | None
    jinja_env: Readonly[Environment]
    jinja_environment: ClassVar['<inferred>']
    jinja_options: dict[str, t.Any]
    json: JSONProvider
    json_provider_class: type[JSONProvider]
    logger: Readonly[logging.Logger]
    name: Readonly[str]
    permanent_session_lifetime: ClassVar['<inferred>']
    response_class: type[Response]
    secret_key: ClassVar['<inferred>']
    shell_context_processors: list[ft.ShellContextProcessorCallable]
    should_ignore_error: None
    subdomain_matching: bool
    teardown_appcontext_funcs: list[ft.TeardownCallable]
    test_cli_runner_class: type[FlaskCliRunner] | None
    test_client_class: type[FlaskClient] | None
    testing: ClassVar['<inferred>']
    url_build_error_handlers: list[t.Callable[[Exception, str, dict[str, t.Any]], str]]
    url_map: '<inferred>'
    url_map_class: ClassVar['<inferred>']
    url_rule_class: ClassVar['<inferred>']
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
    def add_template_filter(self, f: ft.TemplateFilterCallable, name: str | None = ...) -> None: ...
    def add_template_global(self, f: ft.TemplateGlobalCallable, name: str | None = ...) -> None: ...
    def add_template_test(self, f: ft.TemplateTestCallable, name: str | None = ...) -> None: ...
    def add_url_rule(
        self,
        rule: str,
        endpoint: str | None = ...,
        view_func: ft.RouteCallable | None = ...,
        provide_automatic_options: bool | None = ...,
        **options: t.Any,
    ) -> None: ...
    def auto_find_instance_path(self) -> str: ...
    def create_global_jinja_loader(self) -> DispatchingJinjaLoader: ...
    def create_jinja_environment(self) -> Environment: ...
    def handle_url_build_error(
        self,
        error: BuildError,
        endpoint: str,
        values: dict[str, t.Any],
    ) -> str: ...
    def inject_url_defaults(self, endpoint: str, values: dict[str, t.Any]) -> None: ...
    def iter_blueprints(self) -> t.ValuesView[Blueprint]: ...
    def make_aborter(self) -> Aborter: ...
    def make_config(self, instance_relative: bool = ...) -> Config: ...
    def redirect(self, location: str, code: int = ...) -> BaseResponse: ...
    def register_blueprint(self, blueprint: Blueprint, **options: t.Any) -> None: ...
    def select_jinja_autoescape(self, filename: str | None) -> bool: ...
    def shell_context_processor(
        self,
        f: T_shell_context_processor,
    ) -> T_shell_context_processor: ...
    def teardown_appcontext(self, f: T_teardown) -> T_teardown: ...
    @overload
    def template_filter(self, name: T_template_filter) -> T_template_filter: ...
    @overload
    def template_filter(
        self,
        name: str | None = ...,
    ) -> t.Callable[[T_template_filter], T_template_filter]: ...
    @overload
    def template_global(self, name: T_template_global) -> T_template_global: ...
    @overload
    def template_global(
        self,
        name: str | None = ...,
    ) -> t.Callable[[T_template_global], T_template_global]: ...
    @overload
    def template_test(self, name: T_template_test) -> T_template_test: ...
    @overload
    def template_test(
        self,
        name: str | None = ...,
    ) -> t.Callable[[T_template_test], T_template_test]: ...
    def trap_http_exception(self, e: Exception) -> bool: ...

class Blueprint(Scaffold):
    cli_group: str | None
    deferred_functions: list[DeferredSetupFunction]
    name: str
    subdomain: str | None
    url_prefix: str | None
    url_values_defaults: dict[str, t.Any] | None
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
    def add_app_template_filter(
        self,
        f: ft.TemplateFilterCallable,
        name: str | None = ...,
    ) -> None: ...
    def add_app_template_global(
        self,
        f: ft.TemplateGlobalCallable,
        name: str | None = ...,
    ) -> None: ...
    def add_app_template_test(self, f: ft.TemplateTestCallable, name: str | None = ...) -> None: ...
    def add_url_rule(
        self,
        rule: str,
        endpoint: str | None = ...,
        view_func: ft.RouteCallable | None = ...,
        provide_automatic_options: bool | None = ...,
        **options: t.Any,
    ) -> None: ...
    def after_app_request(self, f: T_after_request) -> T_after_request: ...
    def app_context_processor(
        self,
        f: T_template_context_processor,
    ) -> T_template_context_processor: ...
    def app_errorhandler(
        self,
        code: type[Exception] | int,
    ) -> t.Callable[[T_error_handler], T_error_handler]: ...
    @overload
    def app_template_filter(self, name: T_template_filter) -> T_template_filter: ...
    @overload
    def app_template_filter(
        self,
        name: str | None = ...,
    ) -> t.Callable[[T_template_filter], T_template_filter]: ...
    @overload
    def app_template_global(self, name: T_template_global) -> T_template_global: ...
    @overload
    def app_template_global(
        self,
        name: str | None = ...,
    ) -> t.Callable[[T_template_global], T_template_global]: ...
    @overload
    def app_template_test(self, name: T_template_test) -> T_template_test: ...
    @overload
    def app_template_test(
        self,
        name: str | None = ...,
    ) -> t.Callable[[T_template_test], T_template_test]: ...
    def app_url_defaults(self, f: T_url_defaults) -> T_url_defaults: ...
    def app_url_value_preprocessor(
        self,
        f: T_url_value_preprocessor,
    ) -> T_url_value_preprocessor: ...
    def before_app_request(self, f: T_before_request) -> T_before_request: ...
    def make_setup_state(
        self,
        app: App,
        options: dict[str, t.Any],
        first_registration: bool = ...,
    ) -> BlueprintSetupState: ...
    def record(self, func: DeferredSetupFunction) -> None: ...
    def record_once(self, func: DeferredSetupFunction) -> None: ...
    def register(self, app: App, options: dict[str, t.Any]) -> None: ...
    def register_blueprint(self, blueprint: Blueprint, **options: t.Any) -> None: ...
    def teardown_app_request(self, f: T_teardown) -> T_teardown: ...

class BlueprintSetupState:
    app: App
    blueprint: Blueprint
    first_registration: bool
    name: '<inferred>'
    name_prefix: '<inferred>'
    options: t.Any
    subdomain: '<inferred>'
    url_defaults: '<inferred>'
    url_prefix: '<inferred>'
    def __init__(
        self,
        blueprint: Blueprint,
        app: App,
        options: t.Any,
        first_registration: bool,
    ): ...
    def add_url_rule(
        self,
        rule: str,
        endpoint: str | None = ...,
        view_func: ft.RouteCallable | None = ...,
        **options: t.Any,
    ) -> None: ...

class Scaffold:
    after_request_funcs: dict[ft.AppOrBlueprintKey, list[ft.AfterRequestCallable[t.Any]]]
    before_request_funcs: dict[ft.AppOrBlueprintKey, list[ft.BeforeRequestCallable]]
    cli: Group
    error_handler_spec: dict[ft.AppOrBlueprintKey, dict[int | None, dict[type[Exception], ft.ErrorHandlerCallable]]]
    has_static_folder: Readonly[bool]
    import_name: str
    jinja_loader: Readonly[BaseLoader | None]
    name: str
    root_path: str | None
    static_folder: str | os.PathLike[str] | None
    static_url_path: str | None
    teardown_request_funcs: dict[ft.AppOrBlueprintKey, list[ft.TeardownCallable]]
    template_context_processors: dict[ft.AppOrBlueprintKey, list[ft.TemplateContextProcessorCallable]]
    template_folder: str | os.PathLike[str] | None
    url_default_functions: dict[ft.AppOrBlueprintKey, list[ft.URLDefaultCallable]]
    url_value_preprocessors: dict[ft.AppOrBlueprintKey, list[ft.URLValuePreprocessorCallable]]
    view_functions: dict[str, ft.RouteCallable]
    def __init__(
        self,
        import_name: str,
        static_folder: str | os.PathLike[str] | None = ...,
        static_url_path: str | None = ...,
        template_folder: str | os.PathLike[str] | None = ...,
        root_path: str | None = ...,
    ): ...
    def add_url_rule(
        self,
        rule: str,
        endpoint: str | None = ...,
        view_func: ft.RouteCallable | None = ...,
        provide_automatic_options: bool | None = ...,
        **options: t.Any,
    ) -> None: ...
    def after_request(self, f: T_after_request) -> T_after_request: ...
    def before_request(self, f: T_before_request) -> T_before_request: ...
    def context_processor(
        self,
        f: T_template_context_processor,
    ) -> T_template_context_processor: ...
    def delete(self, rule: str, **options: t.Any) -> t.Callable[[T_route], T_route]: ...
    def endpoint(self, endpoint: str) -> t.Callable[[F], F]: ...
    def errorhandler(
        self,
        code_or_exception: type[Exception] | int,
    ) -> t.Callable[[T_error_handler], T_error_handler]: ...
    def get(self, rule: str, **options: t.Any) -> t.Callable[[T_route], T_route]: ...
    def patch(self, rule: str, **options: t.Any) -> t.Callable[[T_route], T_route]: ...
    def post(self, rule: str, **options: t.Any) -> t.Callable[[T_route], T_route]: ...
    def put(self, rule: str, **options: t.Any) -> t.Callable[[T_route], T_route]: ...
    def query(self, rule: str, **options: t.Any) -> t.Callable[[T_route], T_route]: ...
    def register_error_handler(
        self,
        code_or_exception: type[Exception] | int,
        f: ft.ErrorHandlerCallable,
    ) -> None: ...
    def route(self, rule: str, **options: t.Any) -> t.Callable[[T_route], T_route]: ...
    def teardown_request(self, f: T_teardown) -> T_teardown: ...
    def url_defaults(self, f: T_url_defaults) -> T_url_defaults: ...
    def url_value_preprocessor(self, f: T_url_value_preprocessor) -> T_url_value_preprocessor: ...

def find_package(import_name: str) -> tuple[str | None, str]: ...
def setupmethod(f: F) -> F: ...
