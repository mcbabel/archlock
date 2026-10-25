import { describe, expect, it } from "vitest";
import { moduleFromCode } from "../../src/engine/fromcode.js";
import { buildProject } from "../../src/extract/project.js";
import { extractPythonFile } from "../../src/extract/python/file.js";
import type { Resolver } from "../../src/extract/resolution.js";
import { renderSketch } from "../../src/sketch/render.js";
import { getPythonParser } from "../../src/sketch/treesitter.js";

const noResolver: Resolver = { resolve: () => ({ kind: "unresolved" }) };

async function sketchOf(code: string, file = "pkg/m/models.py"): Promise<string> {
  const facts = extractPythonFile(await getPythonParser(), file, code);
  const project = buildProject(
    [facts],
    [{ name: "m", paths: ["pkg/m/**"], entry: null }],
    () => noResolver,
  );
  const text = renderSketch(moduleFromCode(project.modules.get("m") as never));
  return text.split("\n").slice(3).join("\n").trim();
}

describe("Python → sketch mapping", () => {
  it("functions: defaults, *args, keyword-only, positional-only, async, string annotations", async () => {
    expect(
      await sketchOf(
        'async def f(a: int, b="x", /, *args: str, c: "Foo" = None, **kw: object) -> "list[Foo]":\n    pass\n',
      ),
    ).toBe(
      "async def f(a: int, b=..., /, *args: str, c: Foo = ..., **kw: object) -> list[Foo]: ...",
    );
  });

  it("missing return annotation is <inferred>; private names are hidden", async () => {
    expect(await sketchOf("def g(x):\n    return x\n\ndef _h():\n    pass\n")).toBe(
      "def g(x) -> '<inferred>': ...",
    );
  });

  it("__all__ decides what is public", async () => {
    expect(await sketchOf('__all__ = ["b"]\n\ndef a() -> None: ...\ndef b() -> None: ...\n')).toBe(
      "def b() -> None: ...",
    );
  });

  it("overloads keep only the @overload variants", async () => {
    const out = await sketchOf(
      "from typing import overload\n@overload\ndef p(a: int) -> int: ...\n@overload\ndef p(a: str) -> str: ...\ndef p(a):\n    return a\n",
    );
    expect(out).toBe("@overload\ndef p(a: int) -> int: ...\n@overload\ndef p(a: str) -> str: ...");
  });

  it("classes: dataclass fields, ClassVar, Final, properties, instance attributes, methods", async () => {
    const out = await sketchOf(`
from dataclasses import dataclass
from typing import ClassVar, Final

@dataclass(frozen=True)
class Point:
    x: float
    y: float = 0.0
    origin: ClassVar["Point"]
    LIMIT: Final[int] = 10
    tag = "p"

    def __init__(self, name: str) -> None:
        self.name = name
        self._secret = 1

    @property
    def norm(self) -> float:
        return 0.0

    @property
    def label(self) -> str:
        return ""

    @label.setter
    def label(self, v: str) -> None: ...

    @staticmethod
    def zero() -> "Point": ...

    @classmethod
    def parse(cls, text: str) -> "Point": ...

    def _hidden(self) -> None: ...

    def __repr__(self) -> str: ...

    def __eq__(self, other: object) -> bool: ...
`);
    expect(out).toBe(
      [
        "@dataclass(frozen=True)",
        "class Point:",
        "    x: float",
        "    y: float",
        "    LIMIT: Readonly[int]",
        "    label: str",
        "    name: str",
        "    norm: Readonly[float]",
        "    origin: ClassVar[Point]",
        "    tag: ClassVar['<inferred>']",
        "    def __init__(self, name: str): ...",
        "    def __eq__(self, other: object) -> bool: ...",
        "    @classmethod",
        "    def parse(cls, text: str) -> Point: ...",
        "    @staticmethod",
        "    def zero() -> Point: ...",
      ].join("\n"),
    );
  });

  it("protocols, enums, generics", async () => {
    const out = await sketchOf(`
from enum import Enum, auto
from typing import Generic, Protocol, TypeVar

T = TypeVar("T")

class Color(Enum):
    RED = auto()
    GREEN = auto()

class Repo(Protocol[T]):
    def get(self, id: str) -> T: ...

class Box(Generic[T]):
    item: T
`);
    expect(out).toBe(
      [
        "class Color(Enum):",
        "    RED = ...",
        "    GREEN = ...",
        "",
        "class Repo(Protocol):",
        "    def get(self, id: str) -> T: ...",
        "",
        "class Box(Generic[T]):",
        "    item: T",
      ].join("\n"),
    );
  });

  it("type aliases and constants", async () => {
    const out = await sketchOf(`
from typing import NewType, Optional, TypeAlias, Union
Id = NewType("Id", int)
Maybe = Optional[str]
Either = int | str
Explicit: TypeAlias = "dict[str, int]"
type Pair[A] = tuple[A, A]
LIMIT: int = 3
default_name = "x"
`);
    expect(out).toBe(
      [
        "Either: TypeAlias = int | str",
        "Explicit: TypeAlias = dict[str, int]",
        "Id: TypeAlias = NewType[int]",
        "Maybe: TypeAlias = Optional[str]",
        "Pair: TypeAlias[A] = tuple[A, A]",
        "",
        "default_name: '<inferred>'",
        "LIMIT: int",
      ].join("\n"),
    );
  });

  it("records imports: relative, absolute, aliases, TYPE_CHECKING, stars", async () => {
    const facts = extractPythonFile(
      await getPythonParser(),
      "pkg/a.py",
      "import os\nimport x.y as z\nfrom . import sib\nfrom ..up import thing as t\nfrom typing import TYPE_CHECKING\nif TYPE_CHECKING:\n    from .types import T\nfrom .star import *\nfrom __future__ import annotations\n",
    );
    expect(
      facts.imports.map((i) => [i.specifier, i.names.join(","), i.typeOnly, i.submodule ?? ""]),
    ).toEqual([
      ["os", "*", false, ""],
      ["x.y", "*", false, ""],
      [".", "sib", false, "sib"],
      ["..up", "thing", false, "thing"],
      ["typing", "TYPE_CHECKING", false, "TYPE_CHECKING"],
      [".types", "T", true, "T"],
      [".star", "*", false, ""],
    ]);
    expect(facts.stars).toEqual([".star"]);
  });

  it("enum values are kept as literals", async () => {
    const out = await sketchOf(`
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = "g"
    BLUE = -2.5
    AUTO = object()
`);
    expect(out).toBe(
      [
        "class Color(Enum):",
        "    RED = 1",
        "    GREEN = 'g'",
        "    BLUE = -2.5",
        "    AUTO = ...",
      ].join("\n"),
    );
  });
});
