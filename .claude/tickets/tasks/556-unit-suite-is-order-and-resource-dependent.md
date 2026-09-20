---
id: 556
type: task
title: "The unit suite's result depends on how it is run, not only on the tree"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found while closing #553 slice 9, not caused by it. Under one `vp test run` over all 345 discovered files the run dies with `Error: Worker exited unexpectedly` at --maxWorkers=2 (twice, once right after the scripts guards, which each spawn a child node), and packages/solid-spectrum/test/ListView.test.tsx reports 9 of 11 cases red. The same file is 11/11 green on its own, and green in the per-package walk in .agents/chain-walk-2026-09-20/pkg/. A suite whose answer changes with the worker count answers about the machine, not about the tree",
    }
---

## Scope

Find why the whole-suite run disagrees with the per-file and per-package runs,
and make one answer true.

1. Reproduce `packages/solid-spectrum/test/ListView.test.tsx` red with the
   smallest set of files that precedes it — bisect the discovery order, do not
   guess. Name the leak: module-level state, a global the previous file left
   set (interaction modality, a queue, a portal root), or a timer.
2. Reproduce `Error: Worker exited unexpectedly`. Both sightings were at
   `--maxWorkers=2`; the scripts guard tests spawn a child `node` per case, so
   measure before blaming memory.
3. Whatever the cause, the fix is in the tests or their setup, never in the
   ceiling: raising the worker count or splitting the chain to hide it is the
   same fail-open the #553 slices are closing.

## Done when

One `vp test run` over the discovered set reports the same result as the
per-package walk, with the run recorded in `.agents/`.

## Proof

The failing-then-passing command lines, and the bisect that named the leak.

## Relationship

Child of #544. Found by #553 slice 9; `.agents/close-gates-2026-09-20.log.md`
holds the evidence and `.agents/chain-walk-2026-09-20/` the runs.
