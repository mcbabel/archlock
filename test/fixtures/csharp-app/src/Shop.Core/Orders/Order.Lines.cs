namespace Shop.Core.Orders;

public sealed partial class Order : ICloneable
{
    private readonly List<Line> lines = new();

    public IReadOnlyList<Line> Lines => lines;

    public void Add(params Line[] newLines) => lines.AddRange(newLines);

    public Line this[int index] => lines[index];

    public object Clone() => MemberwiseClone();
}
