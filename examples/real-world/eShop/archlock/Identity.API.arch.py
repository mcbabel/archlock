__module__ = "Identity.API"
__paths__ = ["src/Identity.API/**"]
__depends_on__ = ["eShop.ServiceDefaults", "Shared"]

class ILoginService[T](Protocol):
    def FindByUsername(self, user: string) -> Task[T]: ...
    def SignIn(self, user: T) -> Task: ...
    def SignInAsync(
        self,
        user: T,
        properties: AuthenticationProperties,
        authenticationMethod: string = ...,
    ) -> Task: ...
    def ValidateCredentials(self, user: T, password: string) -> Task[bool]: ...

class IRedirectService(Protocol):
    def ExtractRedirectUriFromReturnUrl(self, url: string) -> string: ...

class AccountController(Controller):
    def __init__(
        self,
        userManager: UserManager[ApplicationUser],
        signInManager: SignInManager[ApplicationUser],
        interaction: IIdentityServerInteractionService,
        clientStore: IClientStore,
        schemeProvider: IAuthenticationSchemeProvider,
        handlerProvider: IAuthenticationHandlerProvider,
        events: IEventService,
    ): ...
    def AccessDenied(self) -> IActionResult: ...
    @overload
    def Login(self, returnUrl: string) -> Task[IActionResult]: ...
    @overload
    def Login(self, model: LoginInputModel, button: string) -> Task[IActionResult]: ...
    @overload
    def Logout(self, logoutId: string) -> Task[IActionResult]: ...
    @overload
    def Logout(self, model: LogoutInputModel) -> Task[IActionResult]: ...

class AccountOptions:
    AllowLocalLogin: ClassVar[bool]
    AllowRememberLogin: ClassVar[bool]
    AutomaticRedirectAfterSignOut: ClassVar[bool]
    InvalidCredentialsErrorMessage: ClassVar[string]
    RememberMeLoginDuration: ClassVar[TimeSpan]
    ShowLogoutPrompt: ClassVar[bool]

@record
class AddPhoneNumberViewModel:
    PhoneNumber: Readonly[string]

class ApplicationDbContext(IdentityDbContext[ApplicationUser]):
    def __init__(self, options: DbContextOptions[ApplicationDbContext]): ...

class ApplicationUser(IdentityUser):
    CardHolderName: string
    CardNumber: string
    CardType: int
    City: string
    Country: string
    Expiration: string
    LastName: string
    Name: string
    SecurityNumber: string
    State: string
    Street: string
    ZipCode: string

@record
class ChangePasswordViewModel:
    ConfirmPassword: Readonly[string]
    NewPassword: Readonly[string]
    OldPassword: Readonly[string]

class Config:
    @staticmethod
    def GetApis() -> IEnumerable[ApiResource]: ...
    @staticmethod
    def GetApiScopes() -> IEnumerable[ApiScope]: ...
    @staticmethod
    def GetClients(configuration: IConfiguration) -> IEnumerable[Client]: ...
    @staticmethod
    def GetResources() -> IEnumerable[IdentityResource]: ...

@record
class ConfigureTwoFactorViewModel:
    Providers: Readonly[ICollection[SelectListItem]]
    SelectedProvider: Readonly[string]

class ConsentController(Controller):
    def __init__(
        self,
        interaction: IIdentityServerInteractionService,
        events: IEventService,
        logger: ILogger[ConsentController],
    ): ...
    def CreateScopeViewModel(
        self,
        parsedScopeValue: ParsedScopeValue,
        apiScope: ApiScope,
        check: bool,
    ) -> ScopeViewModel: ...
    @overload
    def Index(self, returnUrl: string) -> Task[IActionResult]: ...
    @overload
    def Index(self, model: ConsentInputModel) -> Task[IActionResult]: ...

class DeviceAuthorizationInputModel(ConsentInputModel):
    UserCode: string

class DeviceAuthorizationViewModel(ConsentViewModel):
    ConfirmUserCode: bool
    UserCode: string

class DeviceController(Controller):
    def __init__(
        self,
        interaction: IDeviceFlowInteractionService,
        eventService: IEventService,
        options: IOptions[IdentityServerOptions],
        logger: ILogger[DeviceController],
    ): ...
    def Callback(self, model: DeviceAuthorizationInputModel) -> Task[IActionResult]: ...
    def CreateScopeViewModel(
        self,
        parsedScopeValue: ParsedScopeValue,
        apiScope: ApiScope,
        check: bool,
    ) -> ScopeViewModel: ...
    def Index(self) -> Task[IActionResult]: ...
    def UserCodeCapture(self, userCode: string) -> Task[IActionResult]: ...

class DiagnosticsController(Controller):
    def Index(self) -> Task[IActionResult]: ...

class DiagnosticsViewModel:
    AuthenticateResult: Readonly[AuthenticateResult]
    Clients: Readonly[IEnumerable[string]]
    def __init__(self, result: AuthenticateResult): ...

class EFLoginService(ILoginService[ApplicationUser]):
    def __init__(
        self,
        userManager: UserManager[ApplicationUser],
        signInManager: SignInManager[ApplicationUser],
    ): ...
    def FindByUsername(self, user: string) -> Task[ApplicationUser]: ...
    def SignIn(self, user: ApplicationUser) -> Task: ...
    def SignInAsync(
        self,
        user: ApplicationUser,
        properties: AuthenticationProperties,
        authenticationMethod: string = ...,
    ) -> Task: ...
    def ValidateCredentials(self, user: ApplicationUser, password: string) -> Task[bool]: ...

@static
class Extensions:
    @staticmethod
    def IsNativeClient(context: 'this AuthorizationRequest') -> bool: ...
    @staticmethod
    def LoadingPage(
        controller: 'this Controller',
        viewName: string,
        redirectUri: string,
    ) -> IActionResult: ...

class ExternalController(Controller):
    def __init__(
        self,
        userManager: UserManager[ApplicationUser],
        signInManager: SignInManager[ApplicationUser],
        interaction: IIdentityServerInteractionService,
        clientStore: IClientStore,
        events: IEventService,
        logger: ILogger[ExternalController],
    ): ...
    def Callback(self) -> Task[IActionResult]: ...
    def Challenge(self, scheme: string, returnUrl: string) -> IActionResult: ...

class ExternalProvider:
    AuthenticationScheme: string
    DisplayName: string

@record
class FactorViewModel:
    Purpose: Readonly[string]

@record
class ForgotPasswordViewModel:
    Email: Readonly[string]

class GrantsController(Controller):
    def __init__(
        self,
        interaction: IIdentityServerInteractionService,
        clients: IClientStore,
        resources: IResourceStore,
        events: IEventService,
    ): ...
    def Index(self) -> Task[IActionResult]: ...
    def Revoke(self, clientId: string) -> Task[IActionResult]: ...

class GrantsViewModel:
    Grants: IEnumerable[GrantViewModel]

class GrantViewModel:
    ApiGrantNames: IEnumerable[string]
    ClientId: string
    ClientLogoUrl: string
    ClientName: string
    ClientUrl: string
    Created: DateTime
    Description: string
    Expires: 'DateTime?'
    IdentityGrantNames: IEnumerable[string]

class HomeController(Controller):
    def __init__(
        self,
        interaction: IIdentityServerInteractionService,
        environment: IWebHostEnvironment,
        logger: ILogger[HomeController],
    ): ...
    def Error(self, errorId: string) -> Task[IActionResult]: ...
    def Index(self) -> IActionResult: ...

@record
class IndexViewModel:
    BrowserRemembered: Readonly[bool]
    HasPassword: Readonly[bool]
    Logins: Readonly[IList[UserLoginInfo]]
    PhoneNumber: Readonly[string]
    TwoFactor: Readonly[bool]

class InitialMigration(Migration): ...

class LoginInputModel:
    Password: string
    RememberLogin: bool
    ReturnUrl: string
    Username: string

class LogoutInputModel:
    LogoutId: string

@record
class Models__ErrorViewModel:
    Error: ErrorMessage

@record
class Models_AccountViewModels__LoggedOutViewModel:
    ClientName: Readonly[string]
    PostLogoutRedirectUri: Readonly[string]
    SignOutIframeUrl: Readonly[string]

@record
class Models_AccountViewModels__LoginViewModel:
    Email: string
    Password: string
    RememberMe: bool
    ReturnUrl: string

@record
class Models_AccountViewModels__LogoutViewModel:
    LogoutId: string

class Models_AccountViewModels__RedirectViewModel:
    RedirectUrl: string

class Models_ConsentViewModels__ConsentInputModel:
    Button: string
    Description: string
    RememberConsent: bool
    ReturnUrl: string
    ScopesConsented: IEnumerable[string]

class Models_ConsentViewModels__ConsentOptions:
    EnableOfflineAccess: ClassVar[bool]
    InvalidSelectionErrorMessage: ClassVar[Readonly[string]]
    MustChooseOneErrorMessage: ClassVar[Readonly[string]]
    OfflineAccessDescription: ClassVar[string]
    OfflineAccessDisplayName: ClassVar[string]

class Models_ConsentViewModels__ConsentViewModel(ConsentInputModel):
    AllowRememberConsent: bool
    ApiScopes: IEnumerable[ScopeViewModel]
    ClientLogoUrl: string
    ClientName: string
    ClientUrl: string
    IdentityScopes: IEnumerable[ScopeViewModel]

class Models_ConsentViewModels__ProcessConsentResult:
    Client: Client
    HasValidationError: Readonly[bool]
    IsRedirect: Readonly[bool]
    RedirectUri: string
    ShowView: Readonly[bool]
    ValidationError: string
    ViewModel: ConsentViewModel

class Models_ConsentViewModels__ScopeViewModel:
    Checked: bool
    Description: string
    DisplayName: string
    Emphasize: bool
    Required: bool
    Value: string

class ProfileService(IProfileService):
    def __init__(self, userManager: UserManager[ApplicationUser]): ...
    def GetProfileDataAsync(self, context: ProfileDataRequestContext) -> Task: ...
    def IsActiveAsync(self, context: IsActiveContext) -> Task: ...

class Quickstart_Account__LoggedOutViewModel:
    AutomaticRedirectAfterSignOut: bool
    ClientName: string
    ExternalAuthenticationScheme: string
    LogoutId: string
    PostLogoutRedirectUri: string
    SignOutIframeUrl: string
    TriggerExternalSignout: Readonly[bool]

class Quickstart_Account__LoginViewModel(LoginInputModel):
    AllowRememberLogin: bool
    EnableLocalLogin: bool
    ExternalLoginScheme: Readonly[string]
    ExternalProviders: IEnumerable[ExternalProvider]
    IsExternalLoginOnly: Readonly[bool]
    VisibleExternalProviders: Readonly[IEnumerable[ExternalProvider]]

class Quickstart_Account__LogoutViewModel(LogoutInputModel):
    ShowLogoutPrompt: bool

class Quickstart_Account__RedirectViewModel:
    RedirectUrl: string

class Quickstart_Consent__ConsentInputModel:
    Button: string
    Description: string
    RememberConsent: bool
    ReturnUrl: string
    ScopesConsented: IEnumerable[string]

class Quickstart_Consent__ConsentOptions:
    EnableOfflineAccess: ClassVar[bool]
    InvalidSelectionErrorMessage: ClassVar[Readonly[string]]
    MustChooseOneErrorMessage: ClassVar[Readonly[string]]
    OfflineAccessDescription: ClassVar[string]
    OfflineAccessDisplayName: ClassVar[string]

class Quickstart_Consent__ConsentViewModel(ConsentInputModel):
    AllowRememberConsent: bool
    ApiScopes: IEnumerable[ScopeViewModel]
    ClientLogoUrl: string
    ClientName: string
    ClientUrl: string
    IdentityScopes: IEnumerable[ScopeViewModel]

class Quickstart_Consent__ProcessConsentResult:
    Client: Client
    HasValidationError: Readonly[bool]
    IsRedirect: Readonly[bool]
    RedirectUri: string
    ShowView: Readonly[bool]
    ValidationError: string
    ViewModel: ConsentViewModel

class Quickstart_Consent__ScopeViewModel:
    Checked: bool
    Description: string
    DisplayName: string
    Emphasize: bool
    Required: bool
    Value: string

class Quickstart_Home__ErrorViewModel:
    Error: ErrorMessage
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, error: string): ...

class RedirectService(IRedirectService):
    def ExtractRedirectUriFromReturnUrl(self, url: string) -> string: ...

@record
class RegisterViewModel:
    ConfirmPassword: Readonly[string]
    Email: Readonly[string]
    Password: Readonly[string]
    User: Readonly[ApplicationUser]

@record
class ResetPasswordViewModel:
    Code: Readonly[string]
    ConfirmPassword: Readonly[string]
    Email: Readonly[string]
    Password: Readonly[string]

class SecurityHeadersAttribute(ActionFilterAttribute):
    def OnResultExecuting(self, context: ResultExecutingContext) -> void: ...

@record
class SendCodeViewModel:
    Providers: Readonly[ICollection[SelectListItem]]
    RememberMe: Readonly[bool]
    ReturnUrl: Readonly[string]
    SelectedProvider: Readonly[string]

@record
class SetPasswordViewModel:
    ConfirmPassword: Readonly[string]
    NewPassword: Readonly[string]

class UsersSeed(IDbSeeder[ApplicationDbContext]):
    def SeedAsync(self, context: ApplicationDbContext) -> Task: ...

@record
class VerifyCodeViewModel:
    Code: Readonly[string]
    Provider: Readonly[string]
    RememberBrowser: Readonly[bool]
    RememberMe: Readonly[bool]
    ReturnUrl: Readonly[string]

@record
class VerifyPhoneNumberViewModel:
    Code: Readonly[string]
    PhoneNumber: Readonly[string]
