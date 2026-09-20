# Writer task — resume close-gates, 2026-09-20

You hold the only writer seat in `/home/emoporemilio/projects/viviana-hub/ui`.
The previous close-gates worker died with its runtime at 12:33; the tree was
clean and nothing was lost.

Your brief is `.agents/close-gates-2026-09-20.task.md` — read it in full and
obey every rule in it. Your log is `.agents/close-gates-2026-09-20.log.md`;
keep appending to it.

State: slice L (`cae7c0c7`) and the patch half of slice P (`1df7af51`,
`build:web` exit 0, `GET /` 200) are committed, reviewed and pushed. Owner
decisions since the brief was written: the pnpm patch and the ratcheting peers
allowlist of slice 0 are both confirmed by the owner.

Start here:

1. Finish slice P: run the steps of `ci:release-readiness` after `build` one
   at a time (`typecheck:apps`, `test:run`, `test:ssr`, `test:hydrate`,
   `test:web`, `test:comparison-data`), record each exit code and first
   failure under `## Chain state`, repair only mechanical Solid 2 port errors
   in `apps/**`, at most an hour.
2. Then slice 0, then slices 1–10 in order.

Also commit this file with your first commit.

## Memory — read this before any heavy command

The worker before you was killed at 12:41 by `earlyoom` four minutes in, while
running a bare `vp run test:run`. This machine is sharing memory with another
project's Rust build, swap is full, and earlyoom is configured to kill
`claude` before it kills `node`. So:

- Before each heavy step run `free -m`; if `available` is under 3000 MB, wait
  two minutes and look again.
- Never run vitest at default parallelism. Pass `--maxWorkers=2` through
  (`vp run test:run -- --maxWorkers=2`, or the direct `vp exec vitest run …
  --maxWorkers=2` form from the repo root). Same for `test:ssr`,
  `test:hydrate`, `test:web`. One heavy command at a time, output to a file.
- Append to your log and commit it **before** each heavy step. If you are
  killed, the next worker starts from your log, not from nothing.
