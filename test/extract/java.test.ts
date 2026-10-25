import { describe, expect, it } from "vitest";
import { moduleFromCode } from "../../src/engine/fromcode.js";
import type { FileFacts } from "../../src/extract/facts.js";
import { extractJavaFile } from "../../src/extract/java/file.js";
import { JavaResolver, javaSourceRoots } from "../../src/extract/java/resolve.js";
import { buildProject } from "../../src/extract/project.js";
import type { Resolver } from "../../src/extract/resolution.js";
import { renderSketch } from "../../src/sketch/render.js";
import { getJavaParser } from "../../src/sketch/treesitter.js";

const noResolver: Resolver = { resolve: () => ({ kind: "unresolved" }) };

async function facts(files: Record<string, string>): Promise<FileFacts[]> {
  const parser = await getJavaParser();
  return Object.entries(files).map(([path, code]) => extractJavaFile(parser, path, code));
}

/** The symbol part of the sketch of module `m` (`src/m/**`). */
async function sketchOf(files: Record<string, string>): Promise<string> {
  const project = buildProject(
    await facts(files),
    [{ name: "m", paths: ["src/m/**"], entry: null }],
    () => noResolver,
  );
  const text = renderSketch(moduleFromCode(project.modules.get("m") as never));
  return text.split("\n").slice(3).join("\n").trim();
}

const one = (code: string) => sketchOf({ "src/m/A.java": `package m;\n\n${code}` });

describe("Java → sketch mapping", () => {
  it("classes: public members, constructors, overloads, static and final, varargs, arrays", async () => {
    expect(
      await one(`public class A extends Base implements Runnable {
    public static final int MAX = 1;
    public String name;
    protected int hidden;
    int packagePrivate;
    private long secret;
    public A() {}
    public A(String name, int... sizes) {}
    public void run() {}
    public int[] sizes(String[][] grid) { return null; }
    public static A of(String name) { return null; }
    public static A of(String name, boolean strict) { return null; }
    void internal() {}
}
class NotPublic {}`),
    ).toBe(`class A(Base, Runnable):
    MAX: ClassVar[Readonly[int]]
    name: String
    @overload
    def __init__(self): ...
    @overload
    def __init__(self, name: String, *sizes: int): ...
    @staticmethod
    @overload
    def of(name: String) -> A: ...
    @staticmethod
    @overload
    def of(name: String, strict: boolean) -> A: ...
    def run(self) -> void: ...
    def sizes(self, grid: 'String[][]') -> 'int[]': ...`);
  });

  it("generics, wildcards and class modifiers", async () => {
    expect(
      await one(`public abstract class Box<T extends Comparable<? super T>> {
    public abstract <R> Box<R> map(java.util.function.Function<? super T, ? extends R> fn);
    public java.util.List<?> raw() { return null; }
}`),
    ).toBe(`@abstract
class Box['T extends Comparable[? super T]']:
    @abstractmethod
    def map[R](self, fn: 'java.util.function.Function[? super T, ? extends R]') -> Box[R]: ...
    def raw(self) -> 'java.util.List[?]': ...`);
  });

  it("interfaces: every non-private member, constants, default and static methods", async () => {
    expect(
      await one(`public interface Repo<K> extends AutoCloseable, Iterable<K> {
    int LIMIT = 5;
    K find(K id);
    default int size() { return 0; }
    static Repo<String> empty() { return null; }
    private void helper() {}
}`),
    ).toBe(`class Repo[K](AutoCloseable, Iterable[K], Protocol):
    LIMIT: ClassVar[Readonly[int]]
    @staticmethod
    def empty() -> Repo[String]: ...
    def find(self, id: K) -> K: ...
    def size(self) -> int: ...`);
  });

  it("enums with interfaces and methods, records, annotations, sealed types", async () => {
    expect(
      await sketchOf({
        "src/m/Color.java": `package m;
public enum Color implements Labeled {
    RED("r"), GREEN("g") { };
    private final String code;
    Color(String code) { this.code = code; }
    public String code() { return code; }
}`,
        "src/m/Point.java": `package m;
public record Point(int x, int y) implements Shape {
    public Point { }
    public double length() { return 0; }
}`,
        "src/m/Tag.java": `package m;
public @interface Tag { String value() default ""; }`,
        "src/m/Shape.java": `package m;
public sealed interface Shape permits Point {}`,
      }),
    ).toBe(`class Color(Labeled, Enum):
    RED = ...
    GREEN = ...
    def code(self) -> String: ...

@sealed
class Shape(Protocol): ...

@annotation
class Tag(Protocol):
    def value(self) -> String: ...

@record
class Point(Shape):
    x: Readonly[int]
    y: Readonly[int]
    def length(self) -> double: ...`);
  });

  it("nested types are qualified with their outer type; interfaces make them public", async () => {
    expect(
      await one(`public class Outer {
    public static class Inner { public int x; }
    public enum Mode { ON, OFF }
    private static class Hidden {}
    static class PackagePrivate {}
    public interface Api { class Impl {} }
}`),
    ).toBe(`class Outer__Mode(Enum):
    ON = ...
    OFF = ...

class Outer__Api(Protocol): ...

class Outer: ...
class Outer__Api__Impl: ...

class Outer__Inner:
    x: int`);
  });

  it("names that are Python keywords get a trailing underscore", async () => {
    expect(await one("public class Q { public void from(int in, String is) {} }")).toBe(
      `class Q:
    def from_(self, in_: int, is_: String) -> void: ...`,
    );
  });

  it("imports and qualified names in code; the package", async () => {
    const [f] = await facts({
      "src/m/A.java": `package com.acme.m;
import java.util.List;
import static java.util.Objects.requireNonNull;
import com.acme.billing.*;
public class A {
    public com.acme.order.Order order;
    void run() { com.acme.billing.Billing.create(); order.id.length(); this.x.y(); }
}`,
    });
    expect(f?.javaPackage).toBe("com.acme.m");
    expect(f?.imports.map((i) => [i.specifier, i.line])).toEqual([
      ["java.util.List", 2],
      ["java.util.Objects.requireNonNull", 3],
      ["com.acme.billing.*", 4],
      ["com.acme.order.Order", 6],
      ["com.acme.billing.Billing", 7],
    ]);
  });

  it("checked exceptions become @throws; record components keep their order", async () => {
    expect(
      await one(`public class Io {
    public String read(String path) throws IOException, InterruptedException { return ""; }
}
public record Range(int to, int from) { }`),
    ).toBe(`class Io:
    @throws(IOException, InterruptedException)
    def read(self, path: String) -> String: ...

@record
class Range:
    to: Readonly[int]
    from_: Readonly[int]`);
  });
});

describe("Java import resolution", () => {
  it("source roots come from package declarations", async () => {
    const all = await facts({
      "core/src/main/java/org/demo/A.java": "package org.demo;\npublic class A {}\n",
      "core/src/main/java/org/demo/b/B.java": "package org.demo.b;\npublic class B {}\n",
      "legacy/src/Main.java": "public class Main {}\n",
      "misplaced/X.java": "package wrong.place;\npublic class X {}\n",
    });
    expect(javaSourceRoots(all)).toEqual(["core/src/main/java", "legacy/src"]);
  });

  it("classes, nested classes, static members, wildcards, the JDK and external libraries", () => {
    const r = new JavaResolver(
      ["src/main/java"],
      [
        "src/main/java/com/acme/order/Order.java",
        "src/main/java/com/acme/order/Status.java",
        "src/main/java/com/acme/util/Strings.java",
      ],
    );
    expect(r.resolve("com.acme.order.Order")).toEqual({
      kind: "file",
      path: "src/main/java/com/acme/order/Order.java",
    });
    expect(r.resolve("com.acme.order.Order.Line")).toEqual({
      kind: "file",
      path: "src/main/java/com/acme/order/Order.java",
    });
    expect(r.resolve("com.acme.util.Strings.isBlank")).toEqual({
      kind: "file",
      path: "src/main/java/com/acme/util/Strings.java",
    });
    expect(r.resolve("com.acme.order.*")).toEqual({
      kind: "file",
      path: "src/main/java/com/acme/order/Order.java",
    });
    expect(r.resolve("java.util.List")).toEqual({ kind: "builtin" });
    expect(r.resolve("javax.annotation.Nullable")).toEqual({ kind: "builtin" });
    expect(r.resolve("org.slf4j.Logger")).toEqual({ kind: "external", package: "org.slf4j" });
  });
});
