import { describe, expect, it } from "vitest";
import { moduleFromCode } from "../../src/engine/fromcode.js";
import { extractCSharpFile } from "../../src/extract/csharp/file.js";
import { type CsProject, linkCSharp } from "../../src/extract/csharp/project.js";
import type { FileFacts } from "../../src/extract/facts.js";
import { buildProject } from "../../src/extract/project.js";
import { linkedResolver } from "../../src/extract/resolution.js";
import { renderSketch } from "../../src/sketch/render.js";
import { getCSharpParser } from "../../src/sketch/treesitter.js";

async function linked(
  files: Record<string, string>,
  projects: CsProject[] = [{ dir: "", refs: [] }],
): Promise<FileFacts[]> {
  const parser = await getCSharpParser();
  const facts = Object.entries(files).map(([path, code]) => extractCSharpFile(parser, path, code));
  linkCSharp(facts, projects);
  return facts;
}

/** The symbol part of the sketch of module `m` (`src/m/**`). */
async function sketchOf(files: Record<string, string>): Promise<string> {
  const project = buildProject(
    await linked(files),
    [{ name: "m", paths: ["src/m/**"], entry: null }],
    () => linkedResolver,
  );
  const text = renderSketch(moduleFromCode(project.modules.get("m") as never));
  return text.split("\n").slice(3).join("\n").trim();
}

const one = (code: string) => sketchOf({ "src/m/A.cs": `namespace M;\n\n${code}` });

describe("C# → sketch mapping", () => {
  it("classes: fields, properties, events, indexers, constructors, overloads, parameters", async () => {
    expect(
      await one(`public abstract class A : Base, IDisposable
{
    public const int Max = 1;
    public static readonly string Prefix = "a";
    public readonly int Fixed;
    public string Name { get; set; }
    public string? Note { get; private set; }
    public int Created { get; init; }
    public int Length => 0;
    public event EventHandler? Changed;
    public int this[int index] => index;
    protected int Hidden { get; set; }
    internal int Internal;
    private int secret;
    public A() { }
    public A(string name, params int[] sizes) { }
    public abstract void Run(ref int count, out string result, int retries = 3);
    public static A Of(string name) => null;
    public static A Of(string name, bool strict) => null;
    public static A operator +(A a, A b) => a;
    public void Dispose() { }
}
internal class NotPublic { }
class AlsoInternal { }`),
    ).toBe(`@abstract
class A(Base, IDisposable):
    Changed: 'event EventHandler?'
    Created: Readonly[int]
    Fixed: Readonly[int]
    Length: Readonly[int]
    Max: ClassVar[Readonly[int]]
    Name: string
    Note: Readonly['string?']
    Prefix: ClassVar[Readonly[string]]
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, name: string, *sizes: 'int[]'): ...
    @staticmethod
    def __add__(a: A, b: A) -> A: ...
    def __getitem__(self, index: int) -> int: ...
    def Dispose(self) -> void: ...
    @staticmethod
    @overload
    def Of(name: string) -> A: ...
    @staticmethod
    @overload
    def Of(name: string, strict: bool) -> A: ...
    @abstractmethod
    def Run(self, count: 'ref int', result: 'out string', retries: int = ...) -> void: ...`);
  });

  it("interfaces: members without a modifier are public; generic constraints", async () => {
    expect(
      await one(`public interface IRepo<TKey> : IDisposable where TKey : notnull
{
    Order? Find(TKey id);
    Task<IReadOnlyList<Order>> AllAsync(CancellationToken ct = default);
    int Count { get; }
    private void Helper() { }
}`),
    ).toBe(`class IRepo[TKey: notnull](IDisposable, Protocol):
    Count: Readonly[int]
    def AllAsync(self, ct: CancellationToken = ...) -> Task[IReadOnlyList[Order]]: ...
    def Find(self, id: TKey) -> 'Order?': ...`);
  });

  it("structs, records, record structs, static classes, enums and delegates", async () => {
    expect(
      await one(`public struct Point { public int X; public int Y { get; set; } }
public readonly record struct Money(decimal Amount);
public sealed record Invoice(string Id, Money Total) { public bool Paid { get; init; } }
public static class Ext { public static int Size(this Point p) => 0; }
public enum Status : byte { New, Paid = 2 }
public delegate T Factory<T>(string name) where T : class;`),
    ).toBe(`class Status(byte, Enum):
    New = ...
    Paid = 2

Factory: TypeAlias['T: class'] = 'delegate T(string name)'

@static
class Ext:
    @staticmethod
    def Size(p: 'this Point') -> int: ...

@record
@sealed
class Invoice:
    Id: Readonly[string]
    Total: Readonly[Money]
    Paid: Readonly[bool]

@readonly
@record
@struct
class Money:
    Amount: Readonly[decimal]

@struct
class Point:
    X: int
    Y: int`);
  });

  it("nested types are qualified with their outer type; only public ones in public ones", async () => {
    expect(
      await one(`public class Outer
{
    public class Inner { public int X; }
    private class Hidden { }
    internal class Internal { }
    public interface IApi { }
}
internal class Closed { public class Open { } }`),
    ).toBe(`class Outer__IApi(Protocol): ...

class Outer: ...

class Outer__Inner:
    X: int`);
  });

  it("partial types are merged into the part in the first file", async () => {
    expect(
      await sketchOf({
        "src/m/Order.cs":
          "namespace M;\npublic partial class Order : IComparable<Order> { public string Id { get; } public int CompareTo(Order o) => 0; }\n",
        "src/m/Order.Lines.cs":
          "namespace M;\npublic partial class Order : ICloneable { public void Add(string sku) { } public object Clone() => this; }\n",
      }),
    ).toBe(`class Order(ICloneable, IComparable[Order]):
    Id: Readonly[string]
    def Add(self, sku: string) -> void: ...
    def Clone(self) -> object: ...
    def CompareTo(self, o: Order) -> int: ...`);
  });

  it("names that are Python keywords get a trailing underscore", async () => {
    expect(
      await one("public class Q { public void From(int @in, string is) { } public int None; }"),
    ).toBe(
      `class Q:
    None_: int
    def From(self, in_: int, is_: string) -> void: ...`,
    );
  });
});

describe("C# dependencies by name", () => {
  it("own and parent namespaces, using, global using, aliases, static using, qualified names", async () => {
    const facts = await linked(
      {
        "core/Money.cs": "namespace Shop;\npublic record Money(decimal Amount);\n",
        "core/Orders/Order.cs":
          "namespace Shop.Orders;\npublic class Order { public Money Total { get; } }\n",
        "core/Billing/Invoice.cs": "namespace Shop.Billing;\npublic class Invoice { }\n",
        "core/Util/Strings.cs":
          "namespace Shop.Util;\npublic static class Strings { public static string Trim(string s) => s; }\n",
        "core/GlobalUsings.cs": "global using Shop.Billing;\n",
        "core/Orders/Service.cs": `using Shop.Orders;
using static Shop.Util.Strings;
using Inv = Shop.Billing.Invoice;
using Newtonsoft.Json;
using System.Text;
namespace Shop.Orders.Services;
public class Service
{
    public Invoice Bill(Order o) => new Inv();
    public object Raw() => Shop.Util.Strings.Trim("x");
    public string Name { get; } = nameof(Service);
}`,
        "app/Program.cs": "var m = new Shop.Money(1);\n",
      },
      [
        { dir: "core", refs: [] },
        { dir: "app", refs: ["core"] },
      ],
    );
    const imports = (path: string) =>
      facts.find((f) => f.path === path)?.imports.map((i) => i.specifier);
    expect(imports("core/Orders/Service.cs")).toEqual([
      "file:core/Orders/Order.cs",
      "file:core/Util/Strings.cs",
      "external:Newtonsoft.Json",
      "file:core/Billing/Invoice.cs",
    ]);
    // `Money` is in a parent namespace: no `using` needed.
    expect(imports("core/Orders/Order.cs")).toEqual(["file:core/Money.cs"]);
    expect(imports("app/Program.cs")).toEqual(["file:core/Money.cs"]);
  });

  it("a project sees its own types first, then those of the projects it references", async () => {
    const facts = await linked(
      {
        "a/Extensions.cs":
          "namespace Microsoft.Extensions.Hosting;\npublic static class Extensions { }\n",
        "b/Extensions.cs":
          "namespace Microsoft.Extensions.Hosting;\npublic static class Extensions { }\n",
        "b/Uses.cs":
          "using Microsoft.Extensions.Hosting;\nnamespace B;\npublic class Uses { void F() => Extensions.ToString(); }\n",
        "c/Other.cs": "namespace C;\npublic class Other { }\n",
        "d/Uses.cs": "using C;\nnamespace D;\npublic class Uses { Other o; }\n",
      },
      [
        { dir: "a", refs: [] },
        { dir: "b", refs: ["a"] },
        { dir: "c", refs: [] },
        { dir: "d", refs: [] },
      ],
    );
    const imports = (path: string) =>
      facts.find((f) => f.path === path)?.imports.map((i) => i.specifier);
    // Its own `Extensions`, not the one of project a; framework namespaces are no dependency.
    expect(imports("b/Uses.cs")).toEqual(["file:b/Extensions.cs"]);
    // Project d does not reference c: c's types are not visible to it.
    expect(imports("d/Uses.cs")).toEqual([]);
  });

  it("an extension method call leads to its file when its namespace is in scope", async () => {
    const facts = await linked(
      {
        "core/Text.cs":
          "namespace Shop.Text;\npublic static class TextExtensions { public static string Slug(this string s) => s; }\n",
        "core/Other.cs":
          "namespace Shop.Other;\npublic static class OtherExtensions { public static int Slug(this int i) => i; }\n",
        "app/Page.cs":
          "using Shop.Text;\nnamespace App;\npublic class Page { string T(string s) => s.Slug(); }\n",
        "app/Plain.cs": "namespace App;\npublic class Plain { string T(string s) => s.Slug(); }\n",
      },
      [
        { dir: "core", refs: [] },
        { dir: "app", refs: ["core"] },
      ],
    );
    const imports = (path: string) =>
      facts.find((f) => f.path === path)?.imports.map((i) => i.specifier);
    // Only the namespace the file imports is searched, not every `Slug` in the solution.
    expect(imports("app/Page.cs")).toEqual(["file:core/Text.cs"]);
    expect(imports("app/Plain.cs")).toEqual([]);
  });
});
