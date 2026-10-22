__module__ = "benchmarks"
__paths__ = ["packages/bench/**"]
__depends_on__ = ["zod", "zod.core"]

from .zod import zodNext

class DiffRow(Protocol):
    bytes: number
    bytesEach: number
    count: number
    countEach: number
    what: string

class Graph(Protocol):
    count: number
    edgesOf: '(i: number) => Array[{ to: number; type: string; name: string }]'
    name: '(i: number) => string'
    selfSize: '(i: number) => number'
    type: '(i: number) => string'

class Measurement(Protocol):
    bytesEach: number
    count: number
    label: string
    totalBytes: number

class NodeRow(Protocol):
    name: string
    selfSize: number
    type: string

def benchWithData[D](params: 'BenchWithDataParams[D] & ThisType[{ data: D }]') -> Metabench[D]: ...
def collect() -> void: ...
def diffAllocation(factory: '() => unknown', baseline=..., delta=...) -> 'DiffRow[]': ...
def findNodes(g: Graph, pred: '(i: number) => boolean') -> 'number[]': ...
def fmtBytes(n: number) -> string: ...
def formatNumber(val: number) -> string: ...
def heapUsed() -> number: ...
def lazyWithGetterOverride[T](getter: '() => T') -> '{ value: T }': ...
def lazyWithInternalProp[T](getter: '() => T') -> '<inferred>': ...
def lazyWithScopeProp[T](getter: '() => T') -> '{ value: T; __value?: T }': ...
def loadGraph(file: string) -> Graph: ...
def makeData(count: number, factory: 'object | (() => any)') -> 'any[]': ...
def makeSchema[T](factory: '(z: typeof zod4) => T') -> '<inferred>': ...
def measure(label: string, count: number, factory: '(i: number) => unknown') -> Measurement: ...

def measureStable(
    label: string,
    count: number,
    factory: '(i: number) => unknown',
    runs=...,
) -> Measurement: ...

def metabench[D](name: string, benchmarks: Benchmarks[D] = ...) -> Metabench: ...
def randomPick(options: 'any[]') -> any: ...
def randomString(length: number) -> string: ...
def shortestPaths(g: Graph, roots: 'number[]', maxDepth=...) -> 'Map[number, string[]]': ...
def snapshotNow(tag: string) -> string: ...
def table(rows: Array[Record[string, string | number]]) -> void: ...

benchUtil__zod4: 'typeof import("zod4")'
clone: '<inferred>'
DATA: 'any[]'
equals: '<inferred>'
is_: '<inferred>'
objA: '<inferred>'
objB: '<inferred>'
objC: '<inferred>'
objD: '<inferred>'
objE: '<inferred>'
object_setup__zod4: '<inferred>'
SINK: any
sink: any
zod3: '<inferred>'
