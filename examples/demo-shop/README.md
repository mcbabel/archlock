# demo-shop

A small but realistic online shop (TypeScript, 45 files, no runtime dependencies) used to show archlock's
workflow. Modules: `shared`, `db`, `events`, `catalog`, `customers`, `cart`, `billing`,
`shipping`, `api` and the entry point `demo_shop`. Their sketches are in [`archlock/`](./archlock).

## The demo

The design changes in the sketch, the agent writes the code, the reviewer sees three lines.

```bash
# in a copy of this folder that is a git repository
npx archlock init --yes              # sketches for 10 modules
node .demo/edit-sketch.mjs           # the human edits the sketches (see below)
npx archlock check                   # 7 errors: the code does not match the plan yet
npx archlock push                    # the agent implements the plan; check runs after every round
npx archlock check                   # ✔ the code matches the sketches
npx archlock diff                    # 3 lines of architecture for ~100 lines of code
```

The sketch edit (`.demo/edit-sketch.mjs`) does what you would do in your editor:

- **Plans a new module** `archlock/notifications.arch.py`: a `Channel` enum, `Message` and
  `Notifier` protocols, an `OutboxNotifier`, `invoicePaidMessage()` and
  `registerNotifications()` with the rule `# must: send exactly one message per paid invoice`.
- **Changes a signature**: `billing.markPaid` gets a `paidAt: Date` parameter, with the rule
  `# must: use paidAt from the payment provider, not the server clock`.
- **Allows the new dependency**: the entry point `demo_shop` may depend on `notifications`.

`archlock diff` then prints:

```
archlock: 3 architecture changes (compared with main @ …)
~ billing.markPaid  (deps, invoiceId, payment) → (deps, invoiceId, payment, paidAt: Date)
+ demo_shop         new dependency: notifications
+ notifications     new module (6 public symbols; depends on customers, events, shared)
85 lines of code changed → 3 lines of architecture
```

The number of changed code lines varies a little between agent runs (85 in the GIF, 83, 84 and 89 in
earlier real runs, 99 in the recorded run CI uses); the 3 lines of architecture were the same
every time.

### The GIF is a real agent run; CI uses a recorded one

The demo GIF (`docs/demo.gif`, rendered from `demo.tape`) runs `archlock push --agent claude` with
the real Claude Code. `archlock.config.json` sets `"verifyCommands": ["npx tsc --noEmit -p ."]`
and TypeScript is a devDependency, so the agent compiles the code it writes (its summary in the
GIF says so). While the agent works (one to two minutes without output), the recording skips
frames; `.demo/fast-forward.mjs` prints `⏩ 81s` where that happens, so the GIF says how long it
took. `.demo/setup.sh` leaves the recorded run (below) out of the copy the agent works in. Real
runs of this work order finished in one round every time.

The CI test (`test/e2e/demo.test.ts`) must not depend on an LLM, so it replays recorded code
changes instead: `.demo/replay-agent.mjs` applies the files in `.demo/agent-run/`, and
`node .demo/use-replay-agent.mjs` points `agent.command` at it. Use the replay only for tests;
with a real agent installed, `archlock push` runs Claude Code, Codex or OpenCode.

## Run the shop

```bash
npm install                   # TypeScript and @types/node (dev dependencies)
npx tsc -p . --noEmit false   # compile to dist/
node dist/main.js             # then open http://localhost:3000/products?q=mug
```
