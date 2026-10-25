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
    Id: Readonly[int]
    Brand: Readonly[string]

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

@record
class CatalogItem:
    Id: Readonly[int]
    Name: Readonly[string]
    Description: Readonly[string]
    Price: Readonly[decimal]
    PictureUrl: Readonly[string]
    CatalogBrandId: Readonly[int]
    CatalogBrand: Readonly[CatalogBrand]
    CatalogTypeId: Readonly[int]
    CatalogType: Readonly[CatalogItemType]

@record
class CatalogItemType:
    Id: Readonly[int]
    Type: Readonly[string]

@record
class CatalogResult:
    PageIndex: Readonly[int]
    PageSize: Readonly[int]
    Count: Readonly[int]
    Data: Readonly[List[CatalogItem]]

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
