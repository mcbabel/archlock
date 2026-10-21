#!/usr/bin/env bash
# Renders site/og.png (the image shown when the site is shared) from scripts/og/og.html.
# Needs Chromium and the Fira Sans and DejaVu Sans Mono fonts.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
chromium --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$PROFILE" \
  --window-size=1200,630 --screenshot="$ROOT/site/og.png" "file://$ROOT/scripts/og/og.html" >/dev/null 2>&1
echo "wrote site/og.png"
