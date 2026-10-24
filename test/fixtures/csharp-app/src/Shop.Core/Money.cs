namespace Shop.Core;

/// <summary>An amount of money.</summary>
public readonly record struct Money(decimal Amount, string Currency)
{
    public static Money Zero { get; } = new(0, "EUR");

    public static Money operator +(Money a, Money b) => new(a.Amount + b.Amount, a.Currency);
}

/// <summary>Called when a price changes.</summary>
public delegate void PriceChanged(Money before, Money after);
