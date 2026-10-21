# archlock demo: init → edit the sketch → push → check → diff
#
# Render with charmbracelet/vhs from the repository root, after `pnpm build`, with Claude Code
# installed and signed in (`claude auth status`):
#   vhs demo.tape
#
# Everything in this recording runs for real, including the agent: `archlock push --agent claude`
# starts Claude Code, which writes the code. Its output differs a little from run to run.
# The only edit is time: while the agent works (typically 60-90 s, with no output), the frames
# are hidden. .demo/fast-forward.mjs prints "⏩ 83s" where the output resumes and the total at
# the end, so the GIF says exactly how much waiting it skipped.
# After `init`, a hidden step copies the demo's committed archlock.config.json, which differs from
# the generated one only by "verifyCommands": ["npx tsc --noEmit -p ."]: the agent may compile
# its own code (TypeScript is a devDependency of the demo, installed by setup.sh).
# (The recorded agent run in .demo/replay-agent.mjs is only used by the CI test
# test/e2e/demo.test.ts, which must not depend on an LLM.)

Output docs/demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 1280
Set Height 760
Set Padding 18
Set TypingSpeed 35ms
Set Theme "Catppuccin Mocha"

Hide
Type "source examples/demo-shop/.demo/setup.sh && clear"
Enter
Sleep 1s
Show

Type "# A 45-file TypeScript shop. Lock its architecture:"
Enter
Type "archlock init --yes"
Enter
Sleep 4s

Hide
Type "cp $ARCHLOCK_REPO/examples/demo-shop/archlock.config.json . && git add -A && git commit -qm 'archlock init' && git checkout -qb notifications && clear"
Enter
Sleep 1s
Show

Type "# The human plans a new module and changes billing.markPaid in the sketch:"
Enter
Type "node .demo/edit-sketch.mjs && git diff --stat"
Enter
Sleep 3s
Type "cat archlock/notifications.arch.py"
Enter
Sleep 5s
Type "clear && archlock check --quiet | tail -12"
Enter
Sleep 4s

Type "clear"
Enter
Type "# The sketch is the truth: let Claude Code write the code (a real run)."
Enter
Type "archlock push --agent claude"
Enter
Sleep 6s
# Skip the agent's silent work; the ⏩ marker on screen says how long it took.
Hide
Wait+Screen@10m /⏩/
Show
Sleep 2s
Wait@10m /demo-shop \$/
Sleep 9s

Type "clear && archlock check"
Enter
Sleep 2s
Type "archlock diff"
Enter
Sleep 7s
