namespace Shop.Core.Internal;

internal static class Helper
{
    public static string Normalize(string s) => s.Trim();
}

public class Visible
{
    public string Name { get; set; } = Helper.Normalize(" x ");
}
