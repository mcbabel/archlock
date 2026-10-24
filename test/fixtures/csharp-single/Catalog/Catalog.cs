namespace Store.Catalog;

public class Catalog
{
    private readonly Dictionary<string, Product> products = new();

    public Product? Find(string sku) => products.GetValueOrDefault(sku);
}
