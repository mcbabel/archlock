using static System.Math;
using Json = System.Text.Json.JsonSerializer;

namespace Shop.Core.Billing;

/// <summary>Creates invoices.</summary>
public interface IBillingService
{
    Invoice Bill(Order order);

    Task<Invoice?> FindAsync<TKey>(TKey id, CancellationToken ct = default) where TKey : notnull;

    int Retries { get; }
}

public static class BillingExtensions
{
    public static decimal Rounded(this Invoice invoice) => Round(invoice.Total.Amount, 2);
}
