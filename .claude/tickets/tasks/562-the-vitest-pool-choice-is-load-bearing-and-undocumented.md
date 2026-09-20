---
id: 562
type: task
title: '`pool: "vmThreads"` is load-bearing and undocumented, and the next memory fix will reach for it'
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "left open deliberately when #556 merged, rather than buried in a merged ticket's note. #556 cost a whole shift - four multi-hour whole-suite attempts, all killed - and the obvious-looking lever throughout was the pool. It is the wrong lever, and the reason is measured and on disk, but nothing in the tree says so",
    }
---

## Scope

`vitest.config.ts:26` declares `pool: "vmThreads"`. It traces to scaffold commit
`e652cb81` with no ADR and no comment, while `vitest.ssr.config.ts:27` uses
`pool: "forks"` and `vitest.hydrate.config.ts:43` uses `vmThreads` — three
choices, no recorded reason for any of them.

That matters because the choice is load-bearing, not incidental. Measured this
shift, same tree, same command but `--pool=threads`:

```
.agents/chain-walk-2026-09-20/pool-threads.out.txt
  Test Files  25 failed | 323 passed (348)
       Tests  120 failed | 6565 passed | 1 expected fail | 6 skipped (6692)
```

120 tests turn red on the swap. The mechanism is realm identity: `vmThreads`
runs each file in a VM context, so cross-realm `instanceof` resolves differently
than under `threads`, and a suite this deep in DOM-type checks feels it
everywhere.

And `vmThreads` is the most memory-hungry pool by design — worker threads share
the main process RSS, which is the whole of #556. So the standing situation is:
the pool we run is the one that makes memory hardest, the swap that would relieve
it costs 120 tests, and **nothing in the repo records either fact**. The next
person to meet an OOM will reach for the pool, spend the afternoon #556 already
spent, and arrive back here.

Two candidate answers, and picking between them is the work:

1. Record it and stop. A comment at `vitest.config.ts:26` plus a short ADR:
   `vmThreads` is deliberate, swapping it costs 120 tests, here is the receipt,
   tune `vmMemoryLimit` instead. Cheapest, and it discharges the debt honestly.
2. Ask whether the 120 should depend on the realm at all. A test that fails
   under `threads` because `instanceof` crossed a realm may be asserting on
   identity where it means to assert on shape. If most of the 120 are that
   shape, they are worth fixing on their own merits and the pool stops being
   load-bearing. If they are not, answer 1 is the answer.

Start by classifying the 120 — the run that produced them is already on disk, so
this begins as reading, not running.

## Done when

The pool choice is recorded where someone hitting an OOM will read it, with the
120-test measurement attached, and the three configs' differing choices each
have a stated reason.

## Proof

The receipt is already in `.agents/chain-walk-2026-09-20/pool-threads.out.txt`;
what is owed is that it is cited from the tree rather than from a merged
ticket's history note.

One datum to carry in with it, so whoever writes the note does not repeat #556's
framing: under `vmThreads` with #556's `vmMemoryLimit` in place, the suite is
not fragile any more. `.agents/chain-walk-2026-09-20/leg-test-run.out.txt`,
18:10, is **351 test files passed, 6697 passed / 1 expected fail / 6 skipped in
60.82s** — the whole `test:run` leg, a wider scope than the built-in `vp test`'s
345 files. The two detached `--maxWorkers=1` attempts that never finished ended
`EXIT=143`, terminated at a cap rather than on a worker crash. So the sentence
the note should leave behind is that the worker deaths were a condition, since
fixed, and not a standing property of the pool.

## Relationship

Child of #544. Left open by #556 when it merged; #556 has the memory
root-cause and the `vmMemoryLimit` fix that made the suite finish.
