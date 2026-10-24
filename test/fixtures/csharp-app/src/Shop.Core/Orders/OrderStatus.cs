namespace Shop.Core.Orders;

/// <summary>Where an order is.</summary>
public enum OrderStatus : byte
{
    New,
    Paid = 2,
    Shipped,
}
