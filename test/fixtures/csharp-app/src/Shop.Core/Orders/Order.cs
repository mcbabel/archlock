using System;

namespace Shop.Core.Orders;

/// <summary>An order of a customer.</summary>
public sealed partial class Order : IComparable<Order>
{
    public const int MaxLines = 50;
    public static readonly string Prefix = "o-";

    public string Id { get; }
    public string? Note { get; set; }
    public OrderStatus Status { get; private set; }
    public DateTime CreatedAt { get; init; }
    internal int Revision { get; set; }

    public event EventHandler<OrderStatus>? StatusChanged;

    public Order(string id) => Id = id;

    public Money Total(string currency = "EUR") => Money.Zero;

    public bool TryGetLine(int index, out Line? line) { line = null; return false; }

    public int CompareTo(Order? other) => string.CompareOrdinal(Id, other?.Id);

    public static Order operator +(Order a, Order b) => a;

    /// <summary>One line of an order.</summary>
    public sealed class Line
    {
        public string Sku { get; set; } = "";
        public int Quantity { get; set; }
    }
}
