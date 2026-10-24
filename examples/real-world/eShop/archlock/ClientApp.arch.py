__module__ = "ClientApp"
__paths__ = ["src/ClientApp/**"]
__depends_on__ = []

class EasingType(Enum):
    BounceIn = ...
    BounceOut = ...
    CubicIn = ...
    CubicInOut = ...
    CubicOut = ...
    Linear = ...
    SinIn = ...
    SinInOut = ...
    SinOut = ...
    SpringIn = ...
    SpringOut = ...

class FadeInAnimation__FadeDirection(Enum):
    Up = ...
    Down = ...

class FadeOutAnimation__FadeDirection(Enum):
    Up = ...
    Down = ...

class GeolocationError(Enum):
    PositionUnavailable = ...
    Unauthorized = ...

class Permission(Enum):
    Unknown = ...
    Location = ...
    LocationAlways = ...
    LocationWhenInUse = ...

class PermissionStatus(Enum):
    Denied = ...
    Disabled = ...
    Granted = ...
    Restricted = ...
    Unknown = ...

class IAppEnvironmentService(Protocol):
    BasketService: Readonly[IBasketService]
    CatalogService: Readonly[ICatalogService]
    IdentityService: Readonly[IIdentityService]
    OrderService: Readonly[IOrderService]
    def UpdateDependencies(self, useMockServices: bool) -> void: ...

class IBasketService(Protocol):
    LocalBasketItems: IEnumerable[BasketItem]
    def ClearBasketAsync(self) -> Task: ...
    def GetBasketAsync(self) -> Task[CustomerBasket]: ...
    def UpdateBasketAsync(self, customerBasket: CustomerBasket) -> Task[CustomerBasket]: ...

class ICatalogService(Protocol):
    def FilterAsync(
        self,
        catalogBrandId: int,
        catalogTypeId: int,
    ) -> Task[IEnumerable[CatalogItem]]: ...
    def GetCatalogAsync(self) -> Task[IEnumerable[CatalogItem]]: ...
    def GetCatalogBrandAsync(self) -> Task[IEnumerable[CatalogBrand]]: ...
    def GetCatalogItemAsync(self, catalogItemId: int) -> Task[CatalogItem]: ...
    def GetCatalogTypeAsync(self) -> Task[IEnumerable[CatalogType]]: ...

class IDialogService(Protocol):
    def ShowAlertAsync(self, message: string, title: string, buttonLabel: string) -> Task: ...

class IFixUriService(Protocol):
    def FixBasketItemPictureUri(self, basketItems: IEnumerable[BasketItem]) -> void: ...
    def FixCampaignItemPictureUri(self, campaignItems: IEnumerable[CampaignItem]) -> void: ...
    def FixCatalogItemPictureUri(self, catalogItems: IEnumerable[CatalogItem]) -> void: ...

class IIdentityService(Protocol):
    def GetAuthTokenAsync(self) -> Task[string]: ...
    def GetUserInfoAsync(self) -> Task[UserInfo]: ...
    def SignInAsync(self) -> Task[bool]: ...
    def SignOutAsync(self) -> Task[bool]: ...

class ILocationService(Protocol):
    def UpdateUserLocation(self, newLocReq: Models.Location.Location) -> Task: ...

class INavigationService(Protocol):
    def InitializeAsync(self) -> Task: ...
    def NavigateToAsync(
        self,
        route: string,
        routeParameters: IDictionary[string, object] = ...,
    ) -> Task: ...
    def PopAsync(self) -> Task: ...

class IOpenUrlService(Protocol):
    def OpenUrl(self, url: string) -> Task: ...

class IOrderService(Protocol):
    def CancelOrderAsync(self, orderId: int) -> Task[bool]: ...
    def CreateOrderAsync(self, newOrder: Models.Orders.Order) -> Task: ...
    def GetOrderAsync(self, orderId: int) -> Task[Models.Orders.Order]: ...
    def GetOrdersAsync(self) -> Task[IEnumerable[Models.Orders.Order]]: ...
    def MapOrderToBasket(self, order: Models.Orders.Order) -> OrderCheckout: ...

class IRequestProvider(Protocol):
    def DeleteAsync(self, uri: string, token: string = ...) -> Task: ...
    def GetAsync[TResult](self, uri: string, token: string = ...) -> Task[TResult]: ...
    @overload
    def PostAsync[TRequest, TResponse](
        self,
        uri: string,
        data: TRequest,
        token: string = ...,
        header: string = ...,
    ) -> Task[TResponse]: ...
    @overload
    def PostAsync[TRequest](
        self,
        uri: string,
        data: TRequest,
        token: string = ...,
        header: string = ...,
    ) -> Task[bool]: ...
    @overload
    def PostAsync[TResult](
        self,
        uri: string,
        data: string,
        clientId: string,
        clientSecret: string,
    ) -> Task[TResult]: ...
    def PutAsync[TResult](
        self,
        uri: string,
        data: TResult,
        token: string = ...,
        header: string = ...,
    ) -> Task[TResult]: ...

class ISettingsService(Protocol):
    AllowGpsLocation: bool
    CallbackUri: string
    ClientId: string
    ClientSecret: string
    DefaultEndpoint: string
    GatewayBasketEndpointBase: string
    GatewayCatalogEndpointBase: string
    GatewayOrdersEndpointBase: string
    IdentityEndpointBase: string
    Latitude: string
    Longitude: string
    RegistrationEndpoint: string
    UseFakeLocation: bool
    UseMocks: bool
    def GetUserTokenAsync(self) -> 'Task[UserToken?]': ...
    def SetUserTokenAsync(self, userToken: 'UserToken?') -> Task: ...

class ITheme(Protocol):
    def SetStatusBarColor(self, color: Color, darkStatusBarTint: bool) -> void: ...

class IValidationRule[T](Protocol):
    ValidationMessage: string
    def Check(self, value: T) -> bool: ...

class IValidity(Protocol):
    IsValid: Readonly[bool]

class IViewModelBase(IQueryAttributable, Protocol):
    InitializeAsyncCommand: Readonly[IAsyncRelayCommand]
    IsBusy: Readonly[bool]
    IsInitialized: Readonly[bool]
    NavigationService: Readonly[INavigationService]
    def InitializeAsync(self) -> Task: ...

class AddBasketButton(Grid):
    def __init__(self): ...

class Address:
    City: string
    Country: string
    CountryCode: string
    Id: Guid
    Latitude: double
    Longitude: double
    State: string
    StateCode: string
    Street: string
    ZipCode: string

@abstract
class AnimationBase(BindableObject):
    Delay: int
    DelayProperty: ClassVar[Readonly[BindableProperty]]
    Duration: string
    DurationProperty: ClassVar[Readonly[BindableProperty]]
    Easing: EasingType
    EasingProperty: ClassVar[Readonly[BindableProperty]]
    RepeatForever: bool
    RepeatForeverProperty: ClassVar[Readonly[BindableProperty]]
    Target: VisualElement
    TargetProperty: ClassVar[Readonly[BindableProperty]]
    def Begin(self) -> Task: ...
    def Reset(self) -> Task: ...

@static
class AppActions:
    ViewProfileAction: ClassVar[Readonly[AppAction]]

class AppEnvironmentService(IAppEnvironmentService):
    BasketService: Readonly[IBasketService]
    CatalogService: Readonly[ICatalogService]
    IdentityService: Readonly[IIdentityService]
    OrderService: Readonly[IOrderService]
    def __init__(
        self,
        mockBasketService: IBasketService,
        basketService: IBasketService,
        mockCatalogService: ICatalogService,
        catalogService: ICatalogService,
        mockOrderService: IOrderService,
        orderService: IOrderService,
        mockIdentityService: IIdentityService,
        identityService: IIdentityService,
    ): ...
    def UpdateDependencies(self, useMockServices: bool) -> void: ...

class AppShell(Shell):
    def __init__(self, navigationService: INavigationService): ...

class AuthorizeRequest:
    def __init__(self, authorizeEndpoint: string): ...
    def Create(self, values: IDictionary[string, string]) -> string: ...

class BadgeView(Grid):
    BadgeColor: Color
    BadgeColorProperty: ClassVar[BindableProperty]
    Content: View
    ContentProperty: ClassVar[BindableProperty]
    FontSize: double
    FontSizeProperty: ClassVar[BindableProperty]
    Text: string
    TextColor: Color
    TextColorProperty: ClassVar[BindableProperty]
    TextProperty: ClassVar[BindableProperty]
    def __init__(self): ...

@static
class Basket:
    Descriptor: ClassVar[Readonly['global::Google.Protobuf.Reflection.ServiceDescriptor']]

class Basket__BasketClient('grpc::ClientBase[BasketClient]'):
    @overload
    def __init__(self, channel: 'grpc::ChannelBase'): ...
    @overload
    def __init__(self, callInvoker: 'grpc::CallInvoker'): ...
    @overload
    def DeleteBasket(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.DeleteBasketRequest',
        headers: 'grpc::Metadata' = ...,
        deadline: 'global::System.DateTime?' = ...,
        cancellationToken: 'global::System.Threading.CancellationToken' = ...,
    ) -> 'global::eShop.ClientApp.BasketGrpcClient.DeleteBasketResponse': ...
    @overload
    def DeleteBasket(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.DeleteBasketRequest',
        options: 'grpc::CallOptions',
    ) -> 'global::eShop.ClientApp.BasketGrpcClient.DeleteBasketResponse': ...
    @overload
    def DeleteBasketAsync(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.DeleteBasketRequest',
        headers: 'grpc::Metadata' = ...,
        deadline: 'global::System.DateTime?' = ...,
        cancellationToken: 'global::System.Threading.CancellationToken' = ...,
    ) -> 'grpc::AsyncUnaryCall[global::eShop.ClientApp.BasketGrpcClient.DeleteBasketResponse]': ...
    @overload
    def DeleteBasketAsync(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.DeleteBasketRequest',
        options: 'grpc::CallOptions',
    ) -> 'grpc::AsyncUnaryCall[global::eShop.ClientApp.BasketGrpcClient.DeleteBasketResponse]': ...
    @overload
    def GetBasket(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.GetBasketRequest',
        headers: 'grpc::Metadata' = ...,
        deadline: 'global::System.DateTime?' = ...,
        cancellationToken: 'global::System.Threading.CancellationToken' = ...,
    ) -> 'global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse': ...
    @overload
    def GetBasket(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.GetBasketRequest',
        options: 'grpc::CallOptions',
    ) -> 'global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse': ...
    @overload
    def GetBasketAsync(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.GetBasketRequest',
        headers: 'grpc::Metadata' = ...,
        deadline: 'global::System.DateTime?' = ...,
        cancellationToken: 'global::System.Threading.CancellationToken' = ...,
    ) -> 'grpc::AsyncUnaryCall[global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse]': ...
    @overload
    def GetBasketAsync(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.GetBasketRequest',
        options: 'grpc::CallOptions',
    ) -> 'grpc::AsyncUnaryCall[global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse]': ...
    @overload
    def UpdateBasket(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.UpdateBasketRequest',
        headers: 'grpc::Metadata' = ...,
        deadline: 'global::System.DateTime?' = ...,
        cancellationToken: 'global::System.Threading.CancellationToken' = ...,
    ) -> 'global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse': ...
    @overload
    def UpdateBasket(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.UpdateBasketRequest',
        options: 'grpc::CallOptions',
    ) -> 'global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse': ...
    @overload
    def UpdateBasketAsync(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.UpdateBasketRequest',
        headers: 'grpc::Metadata' = ...,
        deadline: 'global::System.DateTime?' = ...,
        cancellationToken: 'global::System.Threading.CancellationToken' = ...,
    ) -> 'grpc::AsyncUnaryCall[global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse]': ...
    @overload
    def UpdateBasketAsync(
        self,
        request: 'global::eShop.ClientApp.BasketGrpcClient.UpdateBasketRequest',
        options: 'grpc::CallOptions',
    ) -> 'grpc::AsyncUnaryCall[global::eShop.ClientApp.BasketGrpcClient.CustomerBasketResponse]': ...

class BasketItemTemplate:
    def __init__(self): ...

class BasketMockService(IBasketService):
    LocalBasketItems: IEnumerable[BasketItem]
    def __init__(self): ...
    def ClearBasketAsync(self) -> Task: ...
    def GetBasketAsync(self) -> Task[CustomerBasket]: ...
    def UpdateBasketAsync(self, customerBasket: CustomerBasket) -> Task[CustomerBasket]: ...

@static
class BasketReflection:
    Descriptor: ClassVar[Readonly['pbr::FileDescriptor']]

class BasketService(IBasketService, IDisposable):
    LocalBasketItems: IEnumerable[BasketItem]
    def __init__(
        self,
        identityService: IIdentityService,
        settingsService: ISettingsService,
        fixUriService: IFixUriService,
    ): ...
    def ClearBasketAsync(self) -> Task: ...
    def Dispose(self) -> void: ...
    def GetBasketAsync(self) -> Task[CustomerBasket]: ...
    def UpdateBasketAsync(self, customerBasket: CustomerBasket) -> Task[CustomerBasket]: ...

class BasketView:
    def __init__(self, viewModel: BasketViewModel): ...

class BasketViewModel(ViewModelBase):
    BadgeCount: Readonly[int]
    BasketItems: Readonly[IReadOnlyList[BasketItem]]
    Total: Readonly[decimal]
    def __init__(
        self,
        appEnvironmentService: IAppEnvironmentService,
        navigationService: INavigationService,
        settingsService: ISettingsService,
    ): ...
    def ClearBasketItems(self) -> Task: ...
    def InitializeAsync(self) -> Task: ...

class BeginAnimation(TriggerAction[VisualElement]):
    Animation: AnimationBase

class Campaign:
    Description: string
    From: DateTime
    Id: int
    Name: string
    PictureUri: string
    To: DateTime

class CampaignItem:
    Description: string
    DetailsUri: string
    From: DateTime
    Id: int
    Name: string
    PictureUri: string
    To: DateTime

class CampaignRoot:
    Count: int
    Data: List[CampaignItem]
    PageIndex: int
    PageSize: int

class CampaignTemplate(ContentView):
    def __init__(self): ...

class CancelOrderCommand:
    OrderNumber: Readonly[int]
    def __init__(self, orderNumber: int): ...

class CardType:
    Id: int
    Name: string

class CatalogBrand:
    Brand: string
    Id: int
    def ToString(self) -> string: ...

class CatalogBrandSelectionViewModel(SelectionViewModel[CatalogBrand]): ...

class CatalogItem:
    CatalogBrand: CatalogBrand
    CatalogBrandId: int
    CatalogType: CatalogType
    CatalogTypeId: int
    Description: string
    Id: int
    Name: string
    PictureUri: string
    Price: decimal

class CatalogItemView:
    def __init__(self, viewModel: CatalogItemViewModel): ...

class CatalogItemViewModel(ViewModelBase):
    def __init__(
        self,
        appEnvironmentService: IAppEnvironmentService,
        navigationService: INavigationService,
    ): ...
    def ApplyQueryAttributes(self, query: IDictionary[string, object]) -> void: ...

class CatalogMockService(ICatalogService):
    def FilterAsync(
        self,
        catalogBrandId: int,
        catalogTypeId: int,
    ) -> Task[IEnumerable[CatalogItem]]: ...
    def GetCatalogAsync(self) -> Task[IEnumerable[CatalogItem]]: ...
    def GetCatalogBrandAsync(self) -> Task[IEnumerable[CatalogBrand]]: ...
    def GetCatalogItemAsync(self, catalogItemId: int) -> Task[CatalogItem]: ...
    def GetCatalogTypeAsync(self) -> Task[IEnumerable[CatalogType]]: ...

class CatalogRoot:
    Count: int
    Data: List[CatalogItem]
    PageIndex: int
    PageSize: int

class CatalogService(ICatalogService):
    def __init__(
        self,
        settingsService: ISettingsService,
        requestProvider: IRequestProvider,
        fixUriService: IFixUriService,
    ): ...
    def FilterAsync(
        self,
        catalogBrandId: int,
        catalogTypeId: int,
    ) -> Task[IEnumerable[CatalogItem]]: ...
    def GetCatalogAsync(self) -> Task[IEnumerable[CatalogItem]]: ...
    def GetCatalogBrandAsync(self) -> Task[IEnumerable[CatalogBrand]]: ...
    def GetCatalogItemAsync(self, catalogItemId: int) -> Task[CatalogItem]: ...
    def GetCatalogTypeAsync(self) -> Task[IEnumerable[CatalogType]]: ...

class CatalogType:
    Id: int
    Type: string
    def ToString(self) -> string: ...

class CatalogTypeSelectionViewModel(SelectionViewModel[CatalogType]): ...

class CatalogView:
    def __init__(self, viewModel: CatalogViewModel): ...

class CatalogViewModel(ViewModelBase):
    Brands: Readonly[IReadOnlyList[CatalogBrandSelectionViewModel]]
    CanFilter: Readonly[bool]
    Products: Readonly[IReadOnlyList[CatalogItem]]
    Types: Readonly[IReadOnlyList[CatalogTypeSelectionViewModel]]
    def __init__(
        self,
        appEnvironmentService: IAppEnvironmentService,
        navigationService: INavigationService,
    ): ...
    def InitializeAsync(self) -> Task: ...
    def SelectCatalogBrand(self, selectedItem: 'CatalogBrand?') -> void: ...
    def SelectCatalogType(self, selectedItem: 'CatalogType?') -> void: ...

class CheckoutView:
    def __init__(self, viewModel: CheckoutViewModel): ...

class CheckoutViewModel(ViewModelBase):
    def __init__(
        self,
        basketViewModel: BasketViewModel,
        appEnvironmentService: IAppEnvironmentService,
        dialogService: IDialogService,
        settingsService: ISettingsService,
        navigationService: INavigationService,
    ): ...
    def InitializeAsync(self) -> Task: ...

class ClientApp__App(Application):
    def __init__(
        self,
        settingsService: ISettingsService,
        appEnvironmentService: IAppEnvironmentService,
        navigationService: INavigationService,
        locationService: ILocationService,
        theme: ITheme,
    ): ...
    @staticmethod
    def HandleAppActions(appAction: AppAction) -> void: ...

@static
class Common:
    MockCampaignId01: ClassVar[int]
    MockCampaignId02: ClassVar[int]
    MockCatalogItemId01: ClassVar[int]
    MockCatalogItemId02: ClassVar[int]
    MockCatalogItemId03: ClassVar[int]
    MockCatalogItemId04: ClassVar[int]
    MockCatalogItemId05: ClassVar[int]

@abstract
class ContentPageBase(ContentPage):
    def __init__(self): ...

class CustomerBasket:
    BuyerId: string
    ItemCount: Readonly[int]
    Items: Readonly[IReadOnlyList[BasketItem]]
    def AddItemToBasket(self, basketItem: BasketItem) -> void: ...
    def ClearBasket(self) -> void: ...
    def RemoveItemFromBasket(self, basketItem: BasketItem) -> void: ...

@sealed
class CustomerBasketResponse('pb::IMessage[CustomerBasketResponse]', '# if! GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE', 'pb::IBufferMessage'):
    Descriptor: ClassVar[Readonly['pbr::MessageDescriptor']]
    Items: Readonly['pbc::RepeatedField[global::eShop.ClientApp.BasketGrpcClient.BasketItem]']
    ItemsFieldNumber: ClassVar[Readonly[int]]
    Parser: ClassVar[Readonly['pb::MessageParser[CustomerBasketResponse]']]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, other: CustomerBasketResponse): ...
    def CalculateSize(self) -> int: ...
    def Clone(self) -> CustomerBasketResponse: ...
    @overload
    def Equals(self, other: object) -> bool: ...
    @overload
    def Equals(self, other: CustomerBasketResponse) -> bool: ...
    def GetHashCode(self) -> int: ...
    @overload
    def MergeFrom(self, other: CustomerBasketResponse) -> void: ...
    @overload
    def MergeFrom(self, input: 'pb::CodedInputStream') -> void: ...
    def ToString(self) -> string: ...
    def WriteTo(self, output: 'pb::CodedOutputStream') -> void: ...

class CustomNavigationView(NavigationPage):
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, root: Page): ...

class CustomTabbedPage(TabbedPage):
    BadgeColorProperty: ClassVar[BindableProperty]
    BadgeTextProperty: ClassVar[BindableProperty]
    @staticmethod
    def GetBadgeColor(view: BindableObject) -> Color: ...
    @staticmethod
    def GetBadgeText(view: BindableObject) -> string: ...
    @staticmethod
    def SetBadgeColor(view: BindableObject, value: Color) -> void: ...
    @staticmethod
    def SetBadgeText(view: BindableObject, value: string) -> void: ...

@sealed
class DeleteBasketRequest('pb::IMessage[DeleteBasketRequest]', '# if! GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE', 'pb::IBufferMessage'):
    Descriptor: ClassVar[Readonly['pbr::MessageDescriptor']]
    Parser: ClassVar[Readonly['pb::MessageParser[DeleteBasketRequest]']]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, other: DeleteBasketRequest): ...
    def CalculateSize(self) -> int: ...
    def Clone(self) -> DeleteBasketRequest: ...
    @overload
    def Equals(self, other: object) -> bool: ...
    @overload
    def Equals(self, other: DeleteBasketRequest) -> bool: ...
    def GetHashCode(self) -> int: ...
    @overload
    def MergeFrom(self, other: DeleteBasketRequest) -> void: ...
    @overload
    def MergeFrom(self, input: 'pb::CodedInputStream') -> void: ...
    def ToString(self) -> string: ...
    def WriteTo(self, output: 'pb::CodedOutputStream') -> void: ...

@sealed
class DeleteBasketResponse('pb::IMessage[DeleteBasketResponse]', '# if! GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE', 'pb::IBufferMessage'):
    Descriptor: ClassVar[Readonly['pbr::MessageDescriptor']]
    Parser: ClassVar[Readonly['pb::MessageParser[DeleteBasketResponse]']]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, other: DeleteBasketResponse): ...
    def CalculateSize(self) -> int: ...
    def Clone(self) -> DeleteBasketResponse: ...
    @overload
    def Equals(self, other: object) -> bool: ...
    @overload
    def Equals(self, other: DeleteBasketResponse) -> bool: ...
    def GetHashCode(self) -> int: ...
    @overload
    def MergeFrom(self, other: DeleteBasketResponse) -> void: ...
    @overload
    def MergeFrom(self, input: 'pb::CodedInputStream') -> void: ...
    def ToString(self) -> string: ...
    def WriteTo(self, output: 'pb::CodedOutputStream') -> void: ...

class DialogService(IDialogService):
    def ShowAlertAsync(self, message: string, title: string, buttonLabel: string) -> Task: ...

@static
class DictionaryExtensions:
    @staticmethod
    def ValueAs[T](
        dictionary: 'this IDictionary[string, object]',
        key: string,
        defaultValue: T = ...,
    ) -> T: ...
    @staticmethod
    def ValueAsBool(
        dictionary: 'this IDictionary[string, object]',
        key: string,
        defaultValue: bool = ...,
    ) -> bool: ...
    @staticmethod
    def ValueAsInt(
        dictionary: 'this IDictionary[string, object]',
        key: string,
        defaultValue: int = ...,
    ) -> int: ...

class DoesNotHaveCountConverter(BaseConverterOneWay[int, bool]):
    DefaultConvertReturnValue: bool
    def ConvertFrom(self, value: int, culture: CultureInfo) -> bool: ...

class DoubleConverter(BaseConverter[double, string]):
    DefaultConvertBackReturnValue: double
    DefaultConvertReturnValue: string
    def ConvertBackTo(self, value: string, culture: CultureInfo) -> double: ...
    def ConvertFrom(self, value: double, culture: CultureInfo) -> string: ...

@static
class EasingHelper:
    @staticmethod
    def GetEasing(type: EasingType) -> Easing: ...

class EntryLineColorEffect(RoutingEffect):
    def __init__(self): ...

class FadeInAnimation(AnimationBase):
    Direction: FadeDirection
    DirectionProperty: ClassVar[Readonly[BindableProperty]]

class FadeOutAnimation(AnimationBase):
    Direction: FadeDirection
    DirectionProperty: ClassVar[Readonly[BindableProperty]]

class FadeToAnimation(AnimationBase):
    Opacity: double
    OpacityProperty: ClassVar[Readonly[BindableProperty]]

class FiltersView(ContentPage):
    def __init__(self, viewModel: CatalogViewModel): ...

class FirstValidationErrorConverter(BaseConverterOneWay[IEnumerable[string], string]):
    DefaultConvertReturnValue: string
    def ConvertFrom(self, value: IEnumerable[string], culture: CultureInfo) -> string: ...

class FixUriService(IFixUriService):
    def __init__(self, settingsService: ISettingsService): ...
    def FixBasketItemPictureUri(self, basketItems: IEnumerable[BasketItem]) -> void: ...
    def FixCampaignItemPictureUri(self, campaignItems: IEnumerable[CampaignItem]) -> void: ...
    def FixCatalogItemPictureUri(self, catalogItems: IEnumerable[CatalogItem]) -> void: ...

class GeolocationException(Exception):
    Error: Readonly[GeolocationError]
    @overload
    def __init__(self, error: GeolocationError): ...
    @overload
    def __init__(self, error: GeolocationError, innerException: Exception): ...

@sealed
class GetBasketRequest('pb::IMessage[GetBasketRequest]', '# if! GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE', 'pb::IBufferMessage'):
    Descriptor: ClassVar[Readonly['pbr::MessageDescriptor']]
    Parser: ClassVar[Readonly['pb::MessageParser[GetBasketRequest]']]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, other: GetBasketRequest): ...
    def CalculateSize(self) -> int: ...
    def Clone(self) -> GetBasketRequest: ...
    @overload
    def Equals(self, other: object) -> bool: ...
    @overload
    def Equals(self, other: GetBasketRequest) -> bool: ...
    def GetHashCode(self) -> int: ...
    @overload
    def MergeFrom(self, other: GetBasketRequest) -> void: ...
    @overload
    def MergeFrom(self, input: 'pb::CodedInputStream') -> void: ...
    def ToString(self) -> string: ...
    def WriteTo(self, output: 'pb::CodedOutputStream') -> void: ...

class HasCountConverter(BaseConverterOneWay[int, bool]):
    DefaultConvertReturnValue: bool
    def ConvertFrom(self, value: int, culture: CultureInfo) -> bool: ...

class HttpRequestExceptionEx(HttpRequestException):
    HttpCode: Readonly[HttpStatusCode]
    @overload
    def __init__(self, code: HttpStatusCode): ...
    @overload
    def __init__(self, code: HttpStatusCode, message: string): ...
    @overload
    def __init__(self, code: HttpStatusCode, message: string, inner: Exception): ...

@static
class ICommandExtensions:
    @staticmethod
    def AttemptNotifyCanExecuteChanged[TCommand: ICommand](command: 'this TCommand') -> void: ...

class IdentityMockService(IIdentityService):
    def GetAuthTokenAsync(self) -> Task[string]: ...
    def GetUserInfoAsync(self) -> Task[UserInfo]: ...
    def SignInAsync(self) -> Task[bool]: ...
    def SignOutAsync(self) -> Task[bool]: ...

class IdentityService(IIdentityService):
    def __init__(
        self,
        browser: IBrowser,
        settingsService: ISettingsService,
        httpMessageHandler: HttpMessageHandler,
    ): ...
    def GetAuthTokenAsync(self) -> Task[string]: ...
    def GetUserInfoAsync(self) -> Task[UserInfo]: ...
    def SignInAsync(self) -> Task[bool]: ...
    def SignOutAsync(self) -> Task[bool]: ...

class IsNotNullOrEmptyRule[T](IValidationRule[T]):
    ValidationMessage: string
    def Check(self, value: T) -> bool: ...

class ItemsToHeightConverter(BaseConverterOneWay[int, int]):
    DefaultConvertReturnValue: int
    def ConvertFrom(self, value: int, culture: CultureInfo) -> int: ...

class Location:
    Latitude: double
    Longitude: double

class LocationService(ILocationService):
    def __init__(self, identityService: IIdentityService): ...
    def UpdateUserLocation(self, newLocReq: Models.Location.Location) -> Task: ...

class LoginView:
    def __init__(self, viewModel: LoginViewModel): ...

class LoginViewModel(ViewModelBase):
    def __init__(
        self,
        openUrlService: IOpenUrlService,
        appEnvironmentService: IAppEnvironmentService,
        navigationService: INavigationService,
        settingsService: ISettingsService,
    ): ...
    def ApplyQueryAttributes(self, query: IDictionary[string, object]) -> void: ...
    def InitializeAsync(self) -> Task: ...
    def InvalidateMock(self) -> void: ...

class LogoutParameter:
    Logout: bool

class MainActivity(MauiAppCompatActivity): ...

class MainApplication(MauiApplication):
    def __init__(self, handle: IntPtr, ownership: JniHandleOwnership): ...

class MainViewModel(ViewModelBase):
    def __init__(self, navigationService: INavigationService): ...

class MapView:
    def __init__(self, viewModel: MapViewModel): ...

class MapViewModel(ViewModelBase):
    def __init__(self, navigationService: INavigationService): ...
    def InitializeAsync(self) -> Task: ...

class MauiAuthenticationBrowser(IBrowser):
    def InvokeAsync(
        self,
        options: BrowserOptions,
        cancellationToken: CancellationToken = ...,
    ) -> Task[BrowserResult]: ...

class MauiNavigationService(INavigationService):
    def __init__(self, appEnvironmentService: IAppEnvironmentService): ...
    def InitializeAsync(self) -> Task: ...
    def NavigateToAsync(
        self,
        route: string,
        routeParameters: IDictionary[string, object] = ...,
    ) -> Task: ...
    def PopAsync(self) -> Task: ...

@static
class MauiProgram:
    @staticmethod
    def ConfigureHandlers(mauiAppBuilder: 'this MauiAppBuilder') -> MauiAppBuilder: ...
    @staticmethod
    def CreateMauiApp() -> MauiApp: ...
    @staticmethod
    def RegisterAppServices(mauiAppBuilder: 'this MauiAppBuilder') -> MauiAppBuilder: ...
    @staticmethod
    def RegisterViewModels(mauiAppBuilder: 'this MauiAppBuilder') -> MauiAppBuilder: ...
    @staticmethod
    def RegisterViews(mauiAppBuilder: 'this MauiAppBuilder') -> MauiAppBuilder: ...

class Models_Basket__BasketItem(BindableObject):
    HasNewPrice: Readonly[bool]
    Id: string
    OldUnitPrice: decimal
    PictureUrl: string
    ProductId: int
    ProductName: string
    Quantity: int
    Total: Readonly[decimal]
    UnitPrice: decimal
    def ToString(self) -> string: ...

class ObservableCollectionEx[T](ObservableCollection[T]):
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, collection: IEnumerable[T]): ...
    @overload
    def __init__(self, list: List[T]): ...
    @overload
    def ReloadData(self, items: IEnumerable[T]) -> void: ...
    @overload
    def ReloadData(self, innerListAction: Action[IList[T]]) -> void: ...
    def ReloadDataAsync(self, innerListAction: Func[IList[T], Task]) -> Task: ...

class OpenUrlService(IOpenUrlService):
    def OpenUrl(self, url: string) -> Task: ...

class Order:
    CardExpiration: DateTime
    CardHolderName: string
    CardNumber: string
    CardSecurityNumber: string
    CardTypeId: int
    OrderDate: DateTime
    OrderItems: List[OrderItem]
    OrderNumber: int
    OrderStatus: string
    SequenceNumber: int
    ShippingCity: string
    ShippingCountry: string
    ShippingState: string
    ShippingStreet: string
    ShippingZipCode: string
    Total: decimal
    UserId: string
    UserName: string
    def __init__(self): ...

class OrderCheckout:
    Buyer: string
    CardExpiration: DateTime
    CardHolderName: string
    CardNumber: string
    CardSecurityNumber: string
    CardTypeId: int
    City: string
    Country: string
    Items: IList[OrderItem]
    RequestId: Guid
    State: string
    Street: string
    ZipCode: string

class OrderDetailView:
    def __init__(self, viewModel: OrderDetailViewModel): ...

class OrderDetailViewModel(ViewModelBase, IQueryAttributable):
    def __init__(
        self,
        appEnvironmentService: IAppEnvironmentService,
        navigationService: INavigationService,
        settingsService: ISettingsService,
    ): ...
    def ApplyQueryAttributes(self, query: IDictionary[string, object]) -> void: ...
    def InitializeAsync(self) -> Task: ...

class OrderItem:
    Discount: decimal
    OrderId: 'Guid?'
    PictureUrl: string
    ProductId: long
    ProductName: string
    Quantity: int
    Total: Readonly[decimal]
    UnitPrice: decimal
    def ToString(self) -> string: ...

class OrderItemTemplate(ContentView):
    def __init__(self): ...

class OrderMockService(IOrderService):
    def CancelOrderAsync(self, orderId: int) -> Task[bool]: ...
    def CreateOrderAsync(self, newOrder: Models.Orders.Order) -> Task: ...
    def GetOrderAsync(self, orderId: int) -> Task[Models.Orders.Order]: ...
    def GetOrdersAsync(self) -> Task[IEnumerable[Models.Orders.Order]]: ...
    def MapOrderToBasket(self, order: Models.Orders.Order) -> OrderCheckout: ...

class OrderService(IOrderService):
    def __init__(
        self,
        identityService: IIdentityService,
        settingsService: ISettingsService,
        requestProvider: IRequestProvider,
    ): ...
    def CancelOrderAsync(self, orderId: int) -> Task[bool]: ...
    def CreateOrderAsync(self, newOrder: Models.Orders.Order) -> Task: ...
    def GetOrderAsync(self, orderId: int) -> Task[Models.Orders.Order]: ...
    def GetOrdersAsync(self) -> Task[IEnumerable[Models.Orders.Order]]: ...
    def MapOrderToBasket(self, order: Models.Orders.Order) -> OrderCheckout: ...

class OrderTemplate(ContentView):
    def __init__(self): ...

class PaymentInfo:
    CardHolderName: string
    CardNumber: string
    CardType: CardType
    Expiration: string
    ExpirationMonth: int
    ExpirationYear: int
    Id: Guid
    SecurityNumber: string

class Platforms_iOS__AppDelegate(MauiUIApplicationDelegate): ...
class Platforms_iOS__Program: ...
class Platforms_MacCatalyst__AppDelegate(MauiUIApplicationDelegate): ...
class Platforms_MacCatalyst__Program: ...

class Platforms_Windows__App(MauiWinUIApplication):
    def __init__(self): ...

class Position:
    Accuracy: double
    Altitude: double
    AltitudeAccuracy: double
    Heading: double
    Latitude: double
    Longitude: double
    Speed: double
    Timestamp: DateTimeOffset
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, latitude: double, longitude: double): ...
    @overload
    def __init__(self, position: Position): ...

class ProductCountChangedMessage(ValueChangedMessage[int]): ...

class ProductTemplate(ContentView):
    def __init__(self): ...

class ProfileView:
    def __init__(self, viewModel: ProfileViewModel): ...

class ProfileViewModel(ViewModelBase):
    Orders: Readonly[IList[Order]]
    def __init__(
        self,
        appEnvironmentService: IAppEnvironmentService,
        settingsService: ISettingsService,
        navigationService: INavigationService,
    ): ...
    def InitializeAsync(self) -> Task: ...

class RequestProvider(IRequestProvider):
    def DeleteAsync(self, uri: string, token: string = ...) -> Task: ...
    def GetAsync[TResult](self, uri: string, token: string = ...) -> 'Task[TResult?]': ...
    @overload
    def PostAsync[TRequest, TResult](
        self,
        uri: string,
        data: TRequest,
        token: string = ...,
        header: string = ...,
    ) -> 'Task[TResult?]': ...
    @overload
    def PostAsync[TRequest](
        self,
        uri: string,
        data: TRequest,
        token: string = ...,
        header: string = ...,
    ) -> Task[bool]: ...
    @overload
    def PostAsync[TResult](
        self,
        uri: string,
        data: string,
        clientId: string,
        clientSecret: string,
    ) -> 'Task[TResult?]': ...
    def PutAsync[TResult](
        self,
        uri: string,
        data: TResult,
        token: string = ...,
        header: string = ...,
    ) -> 'Task[TResult?]': ...

class SelectionViewModel[T](ObservableObject): ...

class ServiceAuthenticationException(Exception):
    Content: Readonly[string]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, content: string): ...

@sealed
class Services_Basket_Protos__BasketItem('pb::IMessage[BasketItem]', '# if! GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE', 'pb::IBufferMessage'):
    Descriptor: ClassVar[Readonly['pbr::MessageDescriptor']]
    Parser: ClassVar[Readonly['pb::MessageParser[BasketItem]']]
    ProductId: int
    ProductIdFieldNumber: ClassVar[Readonly[int]]
    Quantity: int
    QuantityFieldNumber: ClassVar[Readonly[int]]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, other: BasketItem): ...
    def CalculateSize(self) -> int: ...
    def Clone(self) -> BasketItem: ...
    @overload
    def Equals(self, other: object) -> bool: ...
    @overload
    def Equals(self, other: BasketItem) -> bool: ...
    def GetHashCode(self) -> int: ...
    @overload
    def MergeFrom(self, other: BasketItem) -> void: ...
    @overload
    def MergeFrom(self, input: 'pb::CodedInputStream') -> void: ...
    def ToString(self) -> string: ...
    def WriteTo(self, output: 'pb::CodedOutputStream') -> void: ...

class SettingsService(ISettingsService):
    AllowGpsLocation: bool
    AuthorizeEndpoint: string
    CallbackUri: string
    ClientId: string
    ClientSecret: string
    DefaultEndpoint: string
    GatewayBasketEndpointBase: string
    GatewayCatalogEndpointBase: string
    GatewayMarketingEndpointBase: string
    GatewayOrdersEndpointBase: string
    IdentityEndpointBase: string
    Latitude: string
    Longitude: string
    RegistrationEndpoint: string
    UseFakeLocation: bool
    UseMocks: bool
    UserInfoEndpoint: string
    def GetUserTokenAsync(self) -> Task[UserToken]: ...
    def SetUserTokenAsync(self, userToken: UserToken) -> Task: ...

class SettingsView(ContentPage):
    def __init__(self, viewModel: SettingsViewModel): ...

class SettingsViewModel(ViewModelBase):
    AllowGpsLocation: bool
    DescriptionAllowGpsLocation: Readonly[string]
    DescriptionUseAzureServices: Readonly[string]
    DescriptionUseFakeLocation: Readonly[string]
    GatewayBasketEndpoint: string
    GatewayCatalogEndpoint: string
    GatewayOrdersEndpoint: string
    GpsWarningMessage: string
    IdentityEndpoint: string
    Latitude: double
    Longitude: double
    TitleAllowGpsLocation: Readonly[string]
    TitleUseAzureServices: Readonly[string]
    TitleUseFakeLocation: Readonly[string]
    ToggleAllowGpsLocationCommand: Readonly[ICommand]
    ToggleFakeLocationCommand: Readonly[ICommand]
    ToggleMockServicesCommand: Readonly[ICommand]
    ToggleSendLocationCommand: Readonly[ICommand]
    UseAzureServices: bool
    UseFakeLocation: bool
    def __init__(
        self,
        locationService: ILocationService,
        appEnvironmentService: IAppEnvironmentService,
        navigationService: INavigationService,
        settingsService: ISettingsService,
    ): ...

@record
class Store:
    Address: string
    Description: string
    Location: Location

class StoryBoard(AnimationBase):
    Animations: Readonly[List[AnimationBase]]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, animations: List[AnimationBase]): ...

class TabParameter:
    TabIndex: int

class Theme(ITheme):
    def SetStatusBarColor(self, color: Color, darkStatusBarTint: bool) -> void: ...

@static
class ThemeEffects:
    CircleProperty: ClassVar[Readonly[BindableProperty]]
    @staticmethod
    def GetCircle(view: BindableObject) -> bool: ...
    @staticmethod
    def SetCircle(view: BindableObject, circle: bool) -> void: ...

class ToggleButton(ContentView):
    Animate: bool
    AnimateProperty: ClassVar[Readonly[BindableProperty]]
    Checked: bool
    CheckedImage: ImageSource
    CheckedImageProperty: ClassVar[Readonly[BindableProperty]]
    CheckedProperty: ClassVar[Readonly[BindableProperty]]
    Command: ICommand
    CommandParameter: object
    CommandParameterProperty: ClassVar[Readonly[BindableProperty]]
    CommandProperty: ClassVar[Readonly[BindableProperty]]
    ToggleCommand: Readonly[ICommand]
    UnCheckedImage: ImageSource
    UnCheckedImageProperty: ClassVar[Readonly[BindableProperty]]
    def __init__(self): ...

@sealed
class UpdateBasketRequest('pb::IMessage[UpdateBasketRequest]', '# if! GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE', 'pb::IBufferMessage'):
    Descriptor: ClassVar[Readonly['pbr::MessageDescriptor']]
    Items: Readonly['pbc::RepeatedField[global::eShop.ClientApp.BasketGrpcClient.BasketItem]']
    ItemsFieldNumber: ClassVar[Readonly[int]]
    Parser: ClassVar[Readonly['pb::MessageParser[UpdateBasketRequest]']]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, other: UpdateBasketRequest): ...
    def CalculateSize(self) -> int: ...
    def Clone(self) -> UpdateBasketRequest: ...
    @overload
    def Equals(self, other: object) -> bool: ...
    @overload
    def Equals(self, other: UpdateBasketRequest) -> bool: ...
    def GetHashCode(self) -> int: ...
    @overload
    def MergeFrom(self, other: UpdateBasketRequest) -> void: ...
    @overload
    def MergeFrom(self, input: 'pb::CodedInputStream') -> void: ...
    def ToString(self) -> string: ...
    def WriteTo(self, output: 'pb::CodedOutputStream') -> void: ...

@static
class UriHelper:
    @staticmethod
    def CombineUri(*uriParts: 'string[]') -> string: ...

class UserInfo:
    Address: string
    CardHolder: string
    CardNumber: string
    CardSecurityNumber: string
    Country: string
    Default: ClassVar[Readonly[UserInfo]]
    Email: string
    EmailVerified: bool
    LastName: string
    Name: string
    PhoneNumber: string
    PhoneNumberVerified: bool
    PreferredUsername: string
    State: string
    Street: string
    UserId: string
    ZipCode: string

class UserToken:
    AccessToken: string
    ExpiresAt: DateTimeOffset
    IdToken: string
    RefreshToken: string

class ValidatableObject[T](ObservableObject, IValidity):
    Errors: Readonly[IEnumerable[string]]
    IsValid: Readonly[bool]
    Validations: Readonly[List[IValidationRule[T]]]
    Value: T
    def __init__(self): ...
    def Validate(self) -> bool: ...

@abstract
class ViewModelBase(ObservableObject, IViewModelBase):
    InitializeAsyncCommand: Readonly[IAsyncRelayCommand]
    IsBusy: Readonly[bool]
    NavigationService: Readonly[INavigationService]
    def __init__(self, navigationService: INavigationService): ...
    def ApplyQueryAttributes(self, query: IDictionary[string, object]) -> void: ...
    def InitializeAsync(self) -> Task: ...

@static
class VisualElementExtensions:
    @staticmethod
    def ColorTo[TElement: IAnimatable](
        element: 'this TElement',
        start: Expression[Func[TElement, Color]],
        end: Color,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def Lerp(color: 'this Color', to: Color, amount: float) -> Color: ...
    @staticmethod
    @overload
    def Lerp(start: 'this double', end: double, amount: double) -> double: ...
    @staticmethod
    @overload
    def Lerp(start: 'this float', end: float, amount: float) -> float: ...
    @staticmethod
    @overload
    def Lerp(start: 'this int', end: int, amount: double) -> int: ...
    @staticmethod
    @overload
    def Lerp(start: 'this byte', end: byte, amount: double) -> byte: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        start: Expression[Func[TElement, double]],
        end: double,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        start: Expression[Func[TElement, float]],
        end: float,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        start: Expression[Func[TElement, int]],
        end: int,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        start: Expression[Func[TElement, uint]],
        end: uint,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        animationName: string,
        callback: Action[double],
        start: Func[double],
        end: double,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        animationName: string,
        callback: Action[float],
        start: Func[float],
        end: float,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        animationName: string,
        callback: Action[double],
        start: double,
        end: double,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...
    @staticmethod
    @overload
    def TransitionTo[TElement: IAnimatable](
        element: 'this TElement',
        animationName: string,
        callback: Action[int],
        start: Func[int],
        end: int,
        rate: uint = ...,
        length: uint = ...,
        easing: Easing = ...,
    ) -> Task[bool]: ...

class WebAuthenticationCallbackActivity(Microsoft.Maui.Authentication.WebAuthenticatorCallbackActivity): ...

class WebNavigatedEventArgsConverter(BaseConverterOneWay[WebNavigatedEventArgs, string]):
    DefaultConvertReturnValue: string
    def ConvertFrom(self, value: WebNavigatedEventArgs, culture: CultureInfo) -> string: ...

class WebNavigatingEventArgsConverter(IValueConverter):
    def Convert(
        self,
        value: object,
        targetType: Type,
        parameter: object,
        culture: CultureInfo,
    ) -> object: ...
    def ConvertBack(
        self,
        value: object,
        targetType: Type,
        parameter: object,
        culture: CultureInfo,
    ) -> object: ...
