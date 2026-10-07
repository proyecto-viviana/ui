# ADR 0002: Vitest Pool

## Decision

Keep the three pools where they are. The unit project's pool is load-bearing.
The memory lever is `vmMemoryLimit` in `vitest.config.ts`, not a different pool.

- `vitest.config.ts` uses `pool: "vmThreads"`.
- `vitest.hydrate.config.ts` uses `pool: "vmThreads"` because it is the same
  jsdom environment and the same `vitest.setup.ts`.
- `vitest.ssr.config.ts` uses `pool: "forks"` because it is a node SSR compile
  with no jsdom `Window` and no setup polyfill.

Do not pass `--pool=threads` to chase an OOM. #556 measured that `vmThreads`
workers share the main process RSS, and it fixed that with
`vmMemoryLimit: "400MB"`.

## Measurement

On 2026-09-20, the same tree, `vitest run --pool=threads`
(`.agents/chain-walk-2026-09-20/pool-threads.out.txt`, runner
`run-pool-threads.sh`):

```text
Test Files  25 failed | 323 passed (348)
     Tests  120 failed | 6565 passed | 1 expected fail | 6 skipped (6692)
```

`EXIT=1`. Classification of those 120, read from that receipt:

- 113 are `TypeError: Failed to construct 'MouseEvent': member view is not of type Window.`
  jsdom's WebIDL check rejects `view` when it is not a `Window` of the
  constructor's realm. 112 throw from `FakePointerEvent` in `vitest.setup.ts`,
  which extends `MouseEvent`. One throws from `createVirtualClick` in
  `packages/solidaria/test-utils/interactions.ts`, which passes `view: window`.
- 2 are `TestingLibraryElementError: Found multiple elements with the role "button"`
  in `packages/solidaria/test/test-utils.test.tsx` (press and hover). The
  document still held buttons from earlier tests. That is isolation, not an
  assertion about shape.
- 1 `createFocusVisible` Safari tab-toggle case expected the text `example`
  and received `example-focusVisible`.
- 1 `createAutoFocus` case expected `vi.getTimerCount()` to be 0 and received 1.
- 1 `runAfterTransition` case threw
  `TypeError: Cannot assign to read only property 'requestAnimationFrame'`
  from `vi.useRealTimers()`.
- 2 `Table` link-selection cases (`selectionBehavior="toggle"` and `"replace"`,
  both `selectionMode="single"`) are `FAIL` headers with an empty error body
  in the receipt, so they are not classified further.

These are not tests asserting object identity where they meant shape. 113
depend on the event constructor and `window` sharing a realm, which
`vmThreads` gives this suite and `threads` did not. The other seven are
isolation, timers, or an unread error. Rewriting assertions would not make
the pool interchangeable. `forks` was not measured for the jsdom suite. An
unmeasured pool swap is not the memory fix.

## What the green run says

Under `vmThreads` with #556's `vmMemoryLimit`, the suite is not fragile.
`.agents/chain-walk-2026-09-20/leg-test-run.out.txt`, started 18:10:29, is
351 test files passed, 6697 passed / 1 expected fail / 6 skipped (6704) in
60.82s. That is the whole `test:run` leg, wider than the built-in `vp test`'s
345 files.

The worker deaths were a condition, since fixed, and not a standing property
of the pool. Two detached attempts that never finished ended `EXIT=143`,
terminated at a cap rather than on a worker crash.
`.agents/chain-walk-2026-09-20/whole-suite.stalled-maxworkers1.txt` ran
14:50:30–16:32:07 and its last line is `Terminated`.
`.agents/chain-walk-2026-09-20/whole-suite.out.txt` as it sits was started
16:36:43 as default-concurrency `vmThreads` and was also signalled `EXIT=143`
at 16:37:24. Neither printed a worker crash.

## Why the three configs differ

`vmThreads` entered the unit config in scaffold commit `e652cb81` with no
comment. It stays because the threads swap above is red, and because #556's
ceiling is a `vmThreads` option (`vmMemoryLimit`). Vitest 4's default ceiling
is `1 / maxWorkers` of total memory per worker, which in aggregate is the
whole box. `400MB` recycles a worker sooner without lowering parallelism.

Hydrate (commit `791261c1`) copies that pool. It sets `environment: "jsdom"`
and `setupFiles: ["./vitest.setup.ts"]`, so it loads the same
`FakePointerEvent`. There is no separate threads receipt for the hydrate
project. It stays on `vmThreads` so the setup class and the jsdom `Window`
stay one realm. It does not set `vmMemoryLimit`. #556 measured the ceiling on
the unit project, which is the large one.

SSR (commit `791261c1`) uses `environment: "node"` and does not load
`vitest.setup.ts`. Nothing there constructs a jsdom `MouseEvent` with
`view: window`. `forks` is process isolation for the server compile
(`generate: "ssr"`, the `@solidjs/web` server build). It does not need the
vm realm, and it does not share the unit project's worker RSS.

## Context recovery

Someone hitting an OOM should read the comment on `pool` in
`vitest.config.ts`, then this ADR, then the `vmMemoryLimit` comment. Tune
the ceiling. Do not set `--pool=threads`.
