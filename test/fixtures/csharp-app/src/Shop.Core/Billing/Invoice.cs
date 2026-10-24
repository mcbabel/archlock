namespace Shop.Core.Billing;

/// <summary>A bill for an order.</summary>
public record Invoice(string OrderId, Money Total)
{
    public bool IsPaid { get; init; }
}
