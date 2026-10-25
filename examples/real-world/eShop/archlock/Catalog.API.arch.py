__module__ = "Catalog.API"
__paths__ = ["src/Catalog.API/**"]
__depends_on__ = ["eShop.ServiceDefaults", "EventBus", "IntegrationEventLogEF"]

class ICatalogAI(Protocol):
    IsEnabled: Readonly[bool]
    @overload
    def GetEmbeddingAsync(self, text: string) -> 'ValueTask[Vector?]': ...
    @overload
    def GetEmbeddingAsync(self, item: CatalogItem) -> 'ValueTask[Vector?]': ...
    def GetEmbeddingsAsync(
        self,
        item: IEnumerable[CatalogItem],
    ) -> 'ValueTask[IReadOnlyList[Vector]?]': ...

class ICatalogIntegrationEventService(Protocol):
    def PublishThroughEventBusAsync(self, evt: IntegrationEvent) -> Task: ...
    def SaveEventAndCatalogContextChangesAsync(self, evt: IntegrationEvent) -> Task: ...

@sealed
class CatalogAI(ICatalogAI):
    IsEnabled: Readonly[bool]
    def __init__(
        self,
        environment: IWebHostEnvironment,
        logger: ILogger[CatalogAI],
        embeddingGenerator: 'IEmbeddingGenerator[string, Embedding[float]]?' = ...,
    ): ...
    @overload
    def GetEmbeddingAsync(self, item: CatalogItem) -> 'ValueTask[Vector?]': ...
    @overload
    def GetEmbeddingAsync(self, text: string) -> 'ValueTask[Vector?]': ...
    def GetEmbeddingsAsync(
        self,
        items: IEnumerable[CatalogItem],
    ) -> 'ValueTask[IReadOnlyList[Vector]?]': ...

@static
class CatalogApi:
    @staticmethod
    def CreateItem(services: CatalogServices, product: CatalogItem) -> Task[Created]: ...
    @staticmethod
    def DeleteItemById(
        services: CatalogServices,
        id: int,
    ) -> Task[Results[NoContent, NotFound]]: ...
    @staticmethod
    def GetAllItems(
        paginationRequest: PaginationRequest,
        services: CatalogServices,
        name: 'string?',
        type: 'int[]?',
        brand: 'int[]?',
    ) -> Task[Ok[PaginatedItems[CatalogItem]]]: ...
    @staticmethod
    def GetAllItemsV1(
        paginationRequest: PaginationRequest,
        services: CatalogServices,
    ) -> Task[Ok[PaginatedItems[CatalogItem]]]: ...
    @staticmethod
    def GetCatalogFacets(
        services: CatalogServices,
        type: 'int[]?',
        brand: 'int[]?',
    ) -> Task[Ok[CatalogFacets]]: ...
    @staticmethod
    def GetItemById(
        httpContext: HttpContext,
        services: CatalogServices,
        id: int,
    ) -> Task[Results[Ok[CatalogItem], NotFound, BadRequest[ProblemDetails]]]: ...
    @staticmethod
    def GetItemPictureById(
        context: CatalogContext,
        pictureFileProvider: IFileProvider,
        id: int,
    ) -> Task[Results[FileStreamHttpResult, NotFound]]: ...
    @staticmethod
    def GetItemsByBrandAndTypeId(
        paginationRequest: PaginationRequest,
        services: CatalogServices,
        typeId: int,
        brandId: 'int?',
    ) -> Task[Ok[PaginatedItems[CatalogItem]]]: ...
    @staticmethod
    def GetItemsByBrandId(
        paginationRequest: PaginationRequest,
        services: CatalogServices,
        brandId: 'int?',
    ) -> Task[Ok[PaginatedItems[CatalogItem]]]: ...
    @staticmethod
    def GetItemsByIds(services: CatalogServices, ids: 'int[]') -> Task[Ok[List[CatalogItem]]]: ...
    @staticmethod
    def GetItemsByName(
        paginationRequest: PaginationRequest,
        services: CatalogServices,
        name: string,
    ) -> Task[Ok[PaginatedItems[CatalogItem]]]: ...
    @staticmethod
    def GetItemsBySemanticRelevance(
        paginationRequest: PaginationRequest,
        services: CatalogServices,
        text: string,
    ) -> Task[Results[Ok[PaginatedItems[CatalogItem]], RedirectToRouteHttpResult]]: ...
    @staticmethod
    def GetItemsBySemanticRelevanceV1(
        paginationRequest: PaginationRequest,
        services: CatalogServices,
        text: string,
    ) -> Task[Results[Ok[PaginatedItems[CatalogItem]], RedirectToRouteHttpResult]]: ...
    @staticmethod
    def MapCatalogApi(app: 'this IEndpointRouteBuilder') -> IEndpointRouteBuilder: ...
    @staticmethod
    def UpdateItem(
        httpContext: HttpContext,
        id: int,
        services: CatalogServices,
        productToUpdate: CatalogItem,
    ) -> Task[Results[Created, BadRequest[ProblemDetails], NotFound[ProblemDetails]]]: ...
    @staticmethod
    def UpdateItemV1(
        httpContext: HttpContext,
        services: CatalogServices,
        productToUpdate: CatalogItem,
    ) -> Task[Results[Created, BadRequest[ProblemDetails], NotFound[ProblemDetails]]]: ...

class CatalogBrand:
    Brand: string
    Id: int
    def __init__(self, brand: string): ...

class CatalogContext(DbContext):
    CatalogBrands: DbSet[CatalogBrand]
    CatalogItems: DbSet[CatalogItem]
    CatalogTypes: DbSet[CatalogType]
    def __init__(
        self,
        options: DbContextOptions[CatalogContext],
        configuration: IConfiguration,
    ): ...

class CatalogContextSeed(IDbSeeder[CatalogContext]):
    def SeedAsync(self, context: CatalogContext) -> Task: ...

class CatalogDomainException(Exception):
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, message: string): ...
    @overload
    def __init__(self, message: string, innerException: Exception): ...

@record
class CatalogFacetCount:
    Id: Readonly[int]
    Count: Readonly[int]

@record
class CatalogFacets:
    BrandCounts: Readonly[IReadOnlyList[CatalogFacetCount]]
    TypeCounts: Readonly[IReadOnlyList[CatalogFacetCount]]
    BrandTotal: Readonly[int]
    TypeTotal: Readonly[int]

@sealed
class CatalogIntegrationEventService(ICatalogIntegrationEventService, IDisposable):
    def Dispose(self) -> void: ...
    def PublishThroughEventBusAsync(self, evt: IntegrationEvent) -> Task: ...
    def SaveEventAndCatalogContextChangesAsync(self, evt: IntegrationEvent) -> Task: ...

class CatalogItem:
    AvailableStock: int
    CatalogBrand: 'CatalogBrand?'
    CatalogBrandId: int
    CatalogType: 'CatalogType?'
    CatalogTypeId: int
    Description: 'string?'
    Embedding: 'Vector?'
    Id: int
    MaxStockThreshold: int
    Name: string
    OnReorder: bool
    PictureFileName: 'string?'
    Price: decimal
    RestockThreshold: int
    def __init__(self, name: string): ...
    def AddStock(self, quantity: int) -> int: ...
    def RemoveStock(self, quantityDesired: int) -> int: ...

class CatalogOptions:
    PicBaseUrl: 'string?'
    UseCustomizationData: bool

class CatalogServices:
    CatalogAI: Readonly[ICatalogAI]
    Context: Readonly[CatalogContext]
    EventService: Readonly[ICatalogIntegrationEventService]
    Logger: Readonly[ILogger[CatalogServices]]
    Options: Readonly[IOptions[CatalogOptions]]

class CatalogType:
    Id: int
    Type: string
    def __init__(self, type: string): ...

@record
class ConfirmedOrderStockItem:
    ProductId: Readonly[int]
    HasStock: Readonly[bool]

@static
class Extensions:
    @staticmethod
    def AddApplicationServices(builder: 'this IHostApplicationBuilder') -> void: ...

class Initial(Migration): ...

@record
class OrderStatusChangedToAwaitingValidationIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    OrderStockItems: Readonly[IEnumerable[OrderStockItem]]

class OrderStatusChangedToAwaitingValidationIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToAwaitingValidationIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToAwaitingValidationIntegrationEvent) -> Task: ...

@record
class OrderStatusChangedToPaidIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    OrderStockItems: Readonly[IEnumerable[OrderStockItem]]

class OrderStatusChangedToPaidIntegrationEventHandler(IIntegrationEventHandler[OrderStatusChangedToPaidIntegrationEvent]):
    def Handle(self, event: OrderStatusChangedToPaidIntegrationEvent) -> Task: ...

@record
class OrderStockConfirmedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]

@record
class OrderStockItem:
    ProductId: Readonly[int]
    Units: Readonly[int]

@record
class OrderStockRejectedIntegrationEvent(IntegrationEvent):
    OrderId: Readonly[int]
    OrderStockItems: Readonly[List[ConfirmedOrderStockItem]]

class Outbox(Migration): ...

class PaginatedItems['TEntity: class']:
    Count: Readonly[long]
    Data: Readonly[IEnumerable[TEntity]]
    PageIndex: Readonly[int]
    PageSize: Readonly[int]

@record
class PaginationRequest:
    PageSize: Readonly[int]
    PageIndex: Readonly[int]

@record
class ProductPriceChangedIntegrationEvent(IntegrationEvent):
    ProductId: Readonly[int]
    NewPrice: Readonly[decimal]
    OldPrice: Readonly[decimal]

class Program: ...
class RemoveHiLoAndIndexCatalogName(Migration): ...
