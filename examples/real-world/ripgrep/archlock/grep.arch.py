__module__ = "grep"
__paths__ = ["crates/grep/src/**"]
__entry__ = "crates/grep/src/lib.rs"
__depends_on__ = [
    "grep_cli",
    "grep_matcher",
    "grep_pcre2",
    "grep_printer",
    "grep_regex",
    "grep_searcher",
]

from .grep_cli import cli
from .grep_matcher import matcher
from .grep_pcre2 import pcre2
from .grep_printer import printer
from .grep_regex import regex
from .grep_searcher import searcher
