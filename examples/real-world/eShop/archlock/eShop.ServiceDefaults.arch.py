__module__ = "eShop.ServiceDefaults"
__paths__ = ["src/eShop.ServiceDefaults/**"]
__depends_on__ = []

@static
class AuthenticationExtensions:
    @staticmethod
    def AddDefaultAuthentication(builder: 'this IHostApplicationBuilder') -> IServiceCollection: ...

@static
class ClaimsPrincipalExtensions:
    @staticmethod
    def GetUserId(principal: 'this ClaimsPrincipal') -> 'string?': ...
    @staticmethod
    def GetUserName(principal: 'this ClaimsPrincipal') -> 'string?': ...

@static
class ConfigurationExtensions:
    @staticmethod
    def GetRequiredValue(configuration: 'this IConfiguration', name: string) -> string: ...

@static
class Extensions:
    @staticmethod
    def AddBasicServiceDefaults(
        builder: 'this IHostApplicationBuilder',
    ) -> IHostApplicationBuilder: ...
    @staticmethod
    def AddDefaultHealthChecks(
        builder: 'this IHostApplicationBuilder',
    ) -> IHostApplicationBuilder: ...
    @staticmethod
    def AddDefaultOpenApi(
        builder: 'this IHostApplicationBuilder',
        apiVersioning: 'IApiVersioningBuilder?' = ...,
    ) -> IHostApplicationBuilder: ...
    @staticmethod
    def AddServiceDefaults(builder: 'this IHostApplicationBuilder') -> IHostApplicationBuilder: ...
    @staticmethod
    def ConfigureOpenTelemetry(
        builder: 'this IHostApplicationBuilder',
    ) -> IHostApplicationBuilder: ...
    @staticmethod
    def MapDefaultEndpoints(app: 'this WebApplication') -> WebApplication: ...
    @staticmethod
    def UseDefaultOpenApi(app: 'this WebApplication') -> IApplicationBuilder: ...

@static
class HttpClientExtensions:
    @staticmethod
    def AddAuthToken(builder: 'this IHttpClientBuilder') -> IHttpClientBuilder: ...
