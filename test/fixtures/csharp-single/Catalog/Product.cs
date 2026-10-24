namespace Store.Catalog;

/// <summary>A product for sale.</summary>
public class Product
{
    public string Sku { get; }
    public decimal Price { get; set; }

    public Product(string sku, decimal price) => (Sku, Price) = (sku, price);
}
