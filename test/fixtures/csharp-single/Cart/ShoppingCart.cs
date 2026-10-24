using Store.Catalog;

namespace Store.Cart;

public class ShoppingCart
{
    public List<Product> Items { get; } = new();

    public decimal Total() => Items.Sum(p => p.Price);
}
