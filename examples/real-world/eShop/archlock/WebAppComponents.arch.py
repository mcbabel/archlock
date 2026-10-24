__module__ = "WebAppComponents"
__paths__ = ["src/WebAppComponents/**"]
__depends_on__ = []

class ICatalogService(Protocol):
    def GetBrands(self) -> Task[IEnumerable[CatalogBrand]]: ...
    def GetCatalogItem(self, id: int) -> 'Task[CatalogItem?]': ...
    @overload
    def GetCatalogItems(
        self,
        pageIndex: int,
        pageSize: int,
        brands: 'int[]?',
        types: 'int[]?',
    ) -> Task[CatalogResult]: ...
    @overload
    def GetCatalogItems(self, ids: IEnumerable[int]) -> Task[List[CatalogItem]]: ...
    def GetCatalogItemsWithSemanticRelevance(
        self,
        page: int,
        take: int,
        text: string,
    ) -> Task[CatalogResult]: ...
    def GetTypes(self) -> Task[IEnumerable[CatalogItemType]]: ...

class IProductImageUrlProvider(Protocol):
    @overload
    def GetProductImageUrl(self, item: CatalogItem) -> string: ...
    @overload
    def GetProductImageUrl(self, productId: int) -> string: ...

@record
class CatalogBrand:
    Brand: Readonly[string]
    Id: Readonly[int]

@record
class CatalogFacetCount:
    Count: Readonly[int]
    Id: Readonly[int]

@record
class CatalogFacets:
    BrandCounts: Readonly[IReadOnlyList[CatalogFacetCount]]
    BrandTotal: Readonly[int]
    TypeCounts: Readonly[IReadOnlyList[CatalogFacetCount]]
    TypeTotal: Readonly[int]

@record
class CatalogItem:
    CatalogBrand: Readonly[CatalogBrand]
    CatalogBrandId: Readonly[int]
    CatalogType: Readonly[CatalogItemType]
    CatalogTypeId: Readonly[int]
    Description: Readonly[string]
    Id: Readonly[int]
    Name: Readonly[string]
    PictureUrl: Readonly[string]
    Price: Readonly[decimal]

@record
class CatalogItemType:
    Id: Readonly[int]
    Type: Readonly[string]

@record
class CatalogResult:
    Count: Readonly[int]
    Data: Readonly[List[CatalogItem]]
    PageIndex: Readonly[int]
    PageSize: Readonly[int]

class CatalogService(ICatalogService):
    def GetBrands(self) -> Task[IEnumerable[CatalogBrand]]: ...
    def GetCatalogFacets(self, brands: 'int[]?', types: 'int[]?') -> Task[CatalogFacets]: ...
    def GetCatalogItem(self, id: int) -> 'Task[CatalogItem?]': ...
    @overload
    def GetCatalogItems(
        self,
        pageIndex: int,
        pageSize: int,
        brands: 'int[]?',
        types: 'int[]?',
    ) -> Task[CatalogResult]: ...
    @overload
    def GetCatalogItems(self, ids: IEnumerable[int]) -> Task[List[CatalogItem]]: ...
    def GetCatalogItemsWithSemanticRelevance(
        self,
        page: int,
        take: int,
        text: string,
    ) -> Task[CatalogResult]: ...
    def GetTypes(self) -> Task[IEnumerable[CatalogItemType]]: ...

@static
class ItemHelper:
    @staticmethod
    def Url(item: CatalogItem) -> string: ...

@static
class PriceFormatter:
    @staticmethod
    def ToPriceDisplay(value: 'this decimal') -> string: ...
