"""Builds archlock's logo files from one definition (run: python3 scripts/brand.py).

The wordmark is converted to vector paths from Fira Sans Bold (SIL Open Font License), so the
logo looks the same everywhere and needs no font at runtime. Outputs are committed; this script
is only needed to change the logo. Requires fontTools and the Fira Sans font files.
"""

from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "brand"
FONT = "/usr/share/fonts/TTF/FiraSans-Bold.ttf"

# The design system's colors (also in site/style.css).
LIGHT = {"ink": "#162033", "plan": "#2F5BD3", "drift": "#B86A00"}
DARK = {"ink": "#E6ECF5", "plan": "#7EA2FF", "drift": "#F0A43A"}


def mark(c: dict, x: float = 0, y: float = 0, s: float = 1) -> str:
    """The mark on a 64x64 grid: a padlock drawn as a module graph (nodes = modules)."""
    return f"""<g transform="translate({x} {y}) scale({s})">
  <path d="M20 29V20a12 12 0 0 1 24 0v9" fill="none" stroke="{c['ink']}" stroke-width="5" stroke-linecap="round"/>
  <path d="M12 29H52V56H12Z" fill="none" stroke="{c['ink']}" stroke-width="3.5" stroke-linejoin="round"/>
  <g fill="{c['plan']}"><circle cx="12" cy="29" r="5.5"/><circle cx="52" cy="29" r="5.5"/><circle cx="12" cy="56" r="5.5"/><circle cx="52" cy="56" r="5.5"/></g>
  <circle cx="32" cy="40" r="5.5" fill="{c['drift']}"/>
  <path d="M32 44v5" stroke="{c['drift']}" stroke-width="4.5" stroke-linecap="round"/>
</g>"""


def wordmark_path(text: str, size: float, tracking: float = -0.01) -> tuple[str, float]:
    """SVG path data for `text` at font size `size` (baseline at y=0) and its width."""
    font = TTFont(FONT)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    scale = size / upm
    pen = SVGPathPen(glyphs)
    x = 0.0
    for ch in text:
        name = cmap[ord(ch)]
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0)))
        x += glyphs[name].width * scale + tracking * size
    return pen.getCommands(), x - tracking * size


def write(name: str, svg: str) -> None:
    (OUT / name).write_text(svg + "\n", encoding="utf-8")
    print("wrote", (OUT / name).relative_to(ROOT))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    words, width = wordmark_path("archlock", 46)
    for suffix, c in (("", LIGHT), ("-dark", DARK)):
        write(
            f"mark{suffix}.svg",
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="archlock">'
            f"<title>archlock</title>{mark(c)}</svg>",
        )
        total = 64 + 14 + width
        write(
            f"logo{suffix}.svg",
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total:.0f} 64" role="img" aria-label="archlock">'
            f'<title>archlock</title>{mark(c)}<path transform="translate(78 47)" fill="{c["ink"]}" d="{words}"/></svg>',
        )
    # Favicon: follows the browser's color scheme.
    write(
        "favicon.svg",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="archlock"><title>archlock</title><style>'
        f".i{{stroke:{LIGHT['ink']}}}@media (prefers-color-scheme:dark){{.i{{stroke:{DARK['ink']}}}}}</style>"
        + mark({"ink": LIGHT["ink"], "plan": LIGHT["plan"], "drift": LIGHT["drift"]})
        .replace(f'stroke="{LIGHT["ink"]}"', 'class="i"')
        + "</svg>",
    )



if __name__ == "__main__":
    main()
