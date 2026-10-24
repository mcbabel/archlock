namespace Shop.Shared;

/// <summary>Compiled into several projects.</summary>
public static class Clock
{
    public static System.DateTime Now() => System.DateTime.UtcNow;
}
