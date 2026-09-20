---
id: 556
type: task
title: "The unit suite's result depends on how it is run, not only on the tree"
created: 2026-09-20
parent: 544
status: verified
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found while closing #553 slice 9, not caused by it. Under one `vp test run` over all 345 discovered files the run dies with `Error: Worker exited unexpectedly` at --maxWorkers=2 (twice, once right after the scripts guards, which each spawn a child node), and packages/solid-spectrum/test/ListView.test.tsx reports 9 of 11 cases red. The same file is 11/11 green on its own, and green in the per-package walk in .agents/chain-walk-2026-09-20/pkg/. A suite whose answer changes with the worker count answers about the machine, not about the tree",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: 'items 1 and 2 answered, measured A/B. It is memory, at the pool level. earlyoom SIGTERMs the vitest MAIN process (16:35:44 VmRSS 10229 MiB; 16:37:23 VmRSS 10350 MiB) because vmThreads worker threads share the main process RSS and Vitest 4''s default ceiling is `1 / maxWorkers` of total memory PER worker (~1 GB x 15 here), i.e. the whole box. `test.vmMemoryLimit: "400MB"` in vitest.config.ts recycles a worker sooner: one `vitest run` over the discovered set is 350 files / 6689 passed / 1 expected fail / 6 skipped in 73s, peak RSS 7634 MB, no kill (.agents/chain-walk-2026-09-20/memlimit-vm400.{out,rss}.txt). The control, the same command with the ceiling removed, hit 10033 MB in about a minute and was killed (memlimit-control.{out,rss}.txt). ListView is 11/11 in that green whole-suite run, so item 1''s redness travelled with the memory exhaustion, not with file order. Note for item 3: this is a ceiling on memory, not on worker count - parallelism is untouched and nothing is skipped. `test.poolOptions` no longer exists in Vitest 4 (it warns and is ignored), which is why the option is top-level',
    }
  - {
      state: merged,
      at: 2026-09-20,
      note: 'landed in e9a737e7, pushed. Checked by the conductor independently of the writer''s A/B, on the same tree: `vp run test:run` EXIT=0, 350 files passed (350), 6689 passed | 1 expected fail | 6 skipped, 75 seconds, no kill (.agents/chain-walk-2026-09-20/verify-testrun.out.txt, runner run-verify-testrun.sh). The "Done when" is met twice over. Two honest limits, both recorded rather than papered over. (1) Item 1 asked for a bisect naming a leak; no bisect was run and no leak was named, because there was none - ListView''s redness travelled with the memory exhaustion, so it is answered by correlation. (2) Item 3 says the fix must never be in the ceiling. The landed fix IS a ceiling, on memory; it is not one on worker count, parallelism is untouched and no file is skipped, which is why it is not the fail-open item 3 forbids - but a reader should weigh that themselves rather than take the distinction on trust. Left `merged` rather than `verified`: verification belongs to whoever first runs `ci:release-readiness` end to end. Deeper question deliberately left open, not silently dropped: `pool: "vmThreads"` traces to scaffold commit e652cb81 with no ADR while vitest.ssr.config.ts uses `pool: "forks"`, and vmThreads is the most memory-hungry pool by design',
    }
  - {
      state: verified,
      at: 2026-09-20,
      note: 'verified at 3f40e8e7, on the condition this ticket named for itself: `test:run` inside a full `ci:release-readiness` walk, in the `&&` order the script uses rather than alone. EXIT=0 in 62 seconds, 351 files passed (351), 6697 passed | 1 expected fail | 6 skipped (6704), 11.5 GB still available at the start and no kill (.agents/chain-walk-2026-09-20/leg-test-run.out.txt). The suite now runs after `build` and `typecheck:apps` in the same shift rather than on a cold box, which is the resource condition item 2 was about, and the count has grown by one file and eight tests since the merge check without changing the verdict. The deeper question stays open and is not part of this closure: `pool: "vmThreads"` traces to scaffold commit e652cb81 with no ADR, and it is tracked as #562',
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
