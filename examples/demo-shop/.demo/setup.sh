#!/usr/bin/env bash
# Prepares the demo: a fresh git copy of demo-shop without sketches, and an `archlock` function
# that runs this checkout's build. Used by demo.tape; source it from the repository root:
#   source examples/demo-shop/.demo/setup.sh
# `archlock push` output is piped through .demo/fast-forward.mjs, which marks skipped silences.
ARCHLOCK_REPO="$(pwd)"
# Fixed path so the recording does not show where the checkout lives.
DEMO_DIR=/tmp/demo-shop
rm -rf "$DEMO_DIR"
mkdir -p "$DEMO_DIR"
cp -r "$ARCHLOCK_REPO/examples/demo-shop/." "$DEMO_DIR/"
rm -rf "$DEMO_DIR/archlock" "$DEMO_DIR/archlock.config.json" "$DEMO_DIR/.archlock-cache"
# The recorded run is for the CI test only; hide it from the live agent.
rm -rf "$DEMO_DIR/.demo/agent-run" "$DEMO_DIR/.demo/replay-agent.mjs" "$DEMO_DIR/.demo/use-replay-agent.mjs"
# Installs TypeScript for agent.verifyCommands in the demo's config.
[ -d "$DEMO_DIR/node_modules" ] || (cd "$DEMO_DIR" && npm ci --no-audit --no-fund --silent)
rm -rf "$DEMO_DIR/node_modules/.cache"
# Local binary, as after `npm install -D archlock`, so the agent runs `npx archlock check`.
mkdir -p "$DEMO_DIR/node_modules/.bin"
ln -sf "$ARCHLOCK_REPO/dist/cli.js" "$DEMO_DIR/node_modules/.bin/archlock"
archlock() {
  if [ "$1" = push ]; then
    FORCE_COLOR=1 node "$ARCHLOCK_REPO/dist/cli.js" "$@" 2>&1 | node "$ARCHLOCK_REPO/examples/demo-shop/.demo/fast-forward.mjs"
  else
    node "$ARCHLOCK_REPO/dist/cli.js" "$@"
  fi
}
cd "$DEMO_DIR" || return
git init -q -b main
git -c user.email=demo@example.com -c user.name=demo add -A
git -c user.email=demo@example.com -c user.name=demo commit -qm "demo-shop"
export GIT_AUTHOR_NAME=demo GIT_AUTHOR_EMAIL=demo@example.com GIT_COMMITTER_NAME=demo GIT_COMMITTER_EMAIL=demo@example.com
export PS1='\[\e[1;32m\]demo-shop\[\e[0m\] $ '
