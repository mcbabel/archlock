__module__ = "notation"
__paths__ = ["src/notation/**"]
__entry__ = "src/notation/lib.rs"
__depends_on__ = []

from serde import Deserialize, Serialize

class Level(Enum):
    Low = 'low'
    High = -1.5
    Open = True

class Shape(Enum):
    Circle: '{ radius: f64 }'
    Rect: '(f64, f64)'
    Point = ...
    Big = 10

class Buf:
    def into_vec(self: Self) -> Vec[u8]: ...
    @staticmethod
    @const
    def new() -> Self: ...
    def push(self: '&mut Self', b: u8): ...
    @unsafe
    def raw(self) -> '*const u8': ...
    @throws(IOException, InterruptedException)
    def read(self, path: String) -> String: ...

@dataclass(frozen=True)
class Point:
    y: float
    x: float
    label: str

@extern("C")
def hook(x: i32) -> i32: ...

@build("linux || darwin")
@overload
def Open(path: string) -> '(*File, error)': ...
@build("windows")
@overload
def Open(path: string, share: uint32) -> '(*File, error)': ...
