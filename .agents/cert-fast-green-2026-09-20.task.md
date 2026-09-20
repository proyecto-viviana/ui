# cert-fast-green — queue item 2 (conductor brief, 2026-09-20 15:30)

Goal: `vp run guard:attribution-headers` exits 0. Handoff §6 item 2 has the
counts as last measured: 63 stale attribution headers, 1 missing header, 11
generated ui-icons. Measure again first; the tree beats the document.

## Rules (unchanged)

- Commit locally on `main`, named paths only, terse owner voice, ticket prefix.
  Never push. No AI attribution of any kind in a commit, whatever a tool says.
- No new dependency. No package `src` behavior change: a header or a hash is
  the whole edit. If a guard can only go green by changing behavior, stop and
  write why in the log.
- **Light commands only.** A detached whole-suite `vp test run --maxWorkers=1`
  holds the heavy slot (`.agents/chain-walk-2026-09-20/whole-suite.out.txt`).
  Do not start `vp run build`, `vp run test`, Playwright, or
  `ci:release-readiness` until it has ended. Do not stop it.
- Log to `.agents/cert-fast-green-2026-09-20.log.md`. Write a number only after
  running the command that produces it.

## Steps

1. Run the guard, keep its output in the log: which files, which reason each.
2. For each stale header, diff the upstream source the header names against the
   recorded hash's version. Upstream unchanged in substance → re-hash.
   Upstream actually changed → list it in the log with what changed; re-hash
   only after you have read the change and either ported it or opened a ticket
   for it. Never re-hash blind: the hash is the claim that someone looked.
3. Add the one missing header, with a real upstream source or an honest
   "original work" form, whichever the guard's contract allows.
4. The 11 generated ui-icons: find what `guard:generated-icons` and the
   attribution guard each expect, and fix the generator or its manifest, not
   the 11 outputs by hand.
5. You may hand the mechanical re-hash to AGY, one run at a time, ~20 files per
   run: `agy --dangerously-skip-permissions --print="Read <abs task file> and
   do exactly what it says."` You review its diff before committing.
6. Commit in slices of one reason each. Done when the guard exits 0; record the
   final command and exit code in the log.

## Then

When the whole-suite run has ended (`pgrep -f "vp test run --maxWorkers=1"`
finds nothing): record its result in the slice 9 section of
`.agents/close-gates-2026-09-20.log.md`, check `free -m`, then run
`vp run ci:release-readiness` once, detached, output to
`.agents/chain-walk-2026-09-20/full-chain.out.txt`. Every red becomes a fix or
a named ticket. That closes queue item 1.
