#!/usr/bin/env bash
# Regenerates the sketches in this folder from pinned commits of three open-source projects.
# Only archlock's output is stored here, never the projects' code.
# After `archlock init`, `customize` applies the edits a user would make by hand (see README.md):
# Zod's single big module is split into its layers, and Hono and Zod opt into maxTypeLength.
# Usage: pnpm build && examples/real-world/regenerate.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHLOCK="node $HERE/../../dist/cli.js"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# name  url  commit
REPOS=(
  "hono  https://github.com/honojs/hono   5ca49b0720755c585c9a9835f0a479ceea36fb52"
  "zod   https://github.com/colinhacks/zod afdac65e0f80c0ccf9e8909da97c411567908b57"
  "flask https://github.com/pallets/flask d086db856be187255b8ec61ef409357393020f32"
)

# Sets a top-level key in archlock.config.json.
set_config() {
  node -e '
    const [file, key, value] = process.argv.slice(1);
    const c = JSON.parse(require("fs").readFileSync(file, "utf8"));
    c[key] = JSON.parse(value);
    require("fs").writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
  ' archlock.config.json "$1" "$2"
}

# A header-only sketch: the hand edit that plans a module (`archlock accept` fills in the rest).
plan_module() { # name path-glob entry docstring
  printf '"""%s"""\n\n__module__ = "%s"\n__paths__ = ["%s"]\n__entry__ = "%s"\n__depends_on__ = []\n' \
    "$4" "$1" "$2" "$3" >"archlock/$1.arch.py"
}

customize() { # project name, run inside the clone after `archlock init`
  case "$1" in
    hono)
      set_config maxTypeLength 120
      ;;
    zod)
      set_config maxTypeLength 120
      local v4=packages/zod/src/v4
      plan_module zod.core "$v4/core/**" "$v4/core/index.ts" \
        "Zod 4 core: the schema engine both APIs build on (zod/v4/core)."
      plan_module zod.classic "$v4/classic/**" "$v4/classic/index.ts" \
        'Zod 4 classic API: chainable methods like z.string().min(1) (what import "zod" gives you).'
      plan_module zod.mini "$v4/mini/**" "$v4/mini/index.ts" \
        "Zod 4 mini API: tree-shakable functions like z.string().check(z.minLength(1)) (zod/mini)."
      plan_module zod.locales "$v4/locales/**" "$v4/locales/index.ts" \
        "Error messages in many languages (zod/locales)."
      plan_module zod.v3 "packages/zod/src/v3/**" "packages/zod/src/v3/index.ts" \
        "Zod 3, still shipped for compatibility (zod/v3)."
      ;;
    *) return 0 ;;
  esac
  $ARCHLOCK accept --yes >/dev/null
}

for entry in "${REPOS[@]}"; do
  read -r name url commit <<<"$entry"
  echo "== $name @ $commit"
  git init -q "$WORK/$name"
  git -C "$WORK/$name" fetch -q --depth 1 "$url" "$commit"
  git -C "$WORK/$name" checkout -q FETCH_HEAD
  (cd "$WORK/$name" && $ARCHLOCK init --yes >/dev/null && customize "$name" &&
    $ARCHLOCK --json stats >"$WORK/$name.stats.json")
  rm -rf "${HERE:?}/$name"
  mkdir -p "$HERE/$name"
  cp -r "$WORK/$name/archlock" "$HERE/$name/archlock"
  cp "$WORK/$name/archlock.config.json" "$HERE/$name/archlock.config.json"
  node -e '
    const s = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    console.log(`   ${s.codeLines} lines of code -> ${s.sketchLines} lines of architecture (${s.ratio.toFixed(1)}x), ${s.modules} modules, ${s.symbols} public symbols`);
  ' "$WORK/$name.stats.json"
done

# The key numbers, for scripts/check-numbers.mjs (README, site and this folder must agree).
node -e '
  const fs = require("fs");
  const [work, out, ...names] = process.argv.slice(1);
  const numbers = {};
  for (const name of names) {
    const s = JSON.parse(fs.readFileSync(`${work}/${name}.stats.json`, "utf8"));
    numbers[name] = { codeLines: s.codeLines, sketchLines: s.sketchLines, modules: s.modules, symbols: s.symbols };
  }
  fs.writeFileSync(out, JSON.stringify(numbers, null, 2) + "\n");
' "$WORK" "$HERE/numbers.json" hono zod flask
