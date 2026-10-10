# ADR 0002: Vitest Pool

## Decision

Keep the three pools where they are. The unit project's pool is load-bearing.
Capacity is controlled in `vitest.config.ts`, without changing the pool or
reducing the complete discovered test set. The unit project uses
`maxWorkers: Math.max(1, Math.min(2, availableParallelism() - 1))`;
`vmMemoryLimit: "100MB"` remains, with the installed
version limitations described below.

- `vitest.config.ts` uses `pool: "vmThreads"`.
- `vitest.hydrate.config.ts` uses `pool: "vmThreads"` because it is the same
  jsdom environment and the same `vitest.setup.ts`.
- `vitest.ssr.config.ts` uses `pool: "forks"` because it is a node SSR compile
  with no jsdom `Window` and no setup polyfill.

Do not pass `--pool=threads` to chase an OOM. #556 measured that `vmThreads`
workers share the main process RSS. Its historical passing measurement used
`vmMemoryLimit: "400MB"`; that result does not establish the same recycling
mechanism in the currently installed Vitest 4.1.11.

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
ceiling is a `vmThreads` option (`vmMemoryLimit`). In installed Vitest 4.1.11,
the default limit is `1 / maxWorkers` of total memory per worker. The limit
is checked only on `testfileFinished`; it affects worker reuse only when
`isolate` is false. The default is `isolate: true`, which this project keeps,
so each worker is already terminated after its file regardless of the limit.
Termination is started without awaiting completion before scheduling the next
task. The limit does not cap startup, in-file memory, or aggregate RSS.

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

Someone hitting an OOM should read the comments in `vitest.config.ts` and
check the installed scheduler before changing a ceiling. Do not set
`--pool=threads`.

## Capacity proposal for Vitest 4.1.11

The hub permits two independent heavy runtime slots. On this 16-CPU host,
Vitest's unset worker count resolves to 15. The first capacity proposal used
`maxWorkers: "50%"`, which resolved to eight workers here and one on a
two-CPU CI runner. The unit project now proposes
`maxWorkers: Math.max(1, Math.min(2, availableParallelism() - 1))`, using the
Node standard library. It resolves to two on this 16-CPU host and one on
one- or two-CPU runners. This retains the installed default's CPU-minus-one
budget, with a floor of one, while capping larger hosts at two. In particular,
it preserves the prior one-worker budget on two-CPU CI rather than doubling
its concurrency. No browser worker setting or other project's pool
configuration changes.

At 2026-10-10 07:28:01 UTC, earlyoom sent SIGTERM to the pinned UI Vitest
process (PID 3206635, VmRSS 3736 MiB) with 653 MiB host memory available and
zero swap free. The subsequent eight-worker run was also terminated: at
07:51:43 UTC, earlyoom sent SIGTERM to PID 3235342 with VmRSS 2757 MiB,
637 MiB host memory available (5.88%), and zero swap free. This RSS is the
victim's value at termination, not a measured run peak. Its full readiness
return was 143 without a supervisor timeout or final test summary. The
07:52:15 UTC host snapshot recorded memory full-pressure avg60 of 40.66.

Two concurrent unit workers reduce active file concurrency; they do not
bound aggregate RSS, startup or in-file allocations, and worker termination
can overlap scheduling. `vmMemoryLimit: "100MB"` retains the installed
post-file/isolation limitations described above. The complete discovered
suite still runs in one original command, with unchanged vmThreads, default
isolation, assertions, test/hook timeouts and full gate deadline. Only a
complete original release-readiness run can validate this experiment; lower
concurrency may still exhaust memory or miss that deadline. #556's historical
receipts and status remain unchanged, including its reservation about ceilings.

The installed primary implementation is `vitest/dist/chunks/defaults.9aQKnqFk.js`
(`isolate: true`), `coverage.DM_a_rWm.js` (`resolveInlineWorkerOption` and
`getWorkersCountByPercentage`), and `cli-api.CnMVyzaz.js`
(`resolveMaxWorkers`, `Pool.schedule`, and `testfileFinished`). These show the
percentage calculation, post-file check, isolated-worker termination, and
non-awaited termination described above.

## Independent test-project capacity proposal

The unit cap does not apply to the separately loaded SSR, hydration, Web or
comparison journey-driver configs. They currently omit `maxWorkers`, so
installed Vitest 4.1.11 resolves their non-watch worker budget to CPUs minus
one, with a floor of one. The SSR and hydration comparison configs spread
their respective root configs, including `test`, and inherit their budget.

The 2026-10-10 whole readiness attempt completed units (421 files passed,
8267 cases passed and one expected failure), then SSR ended with 47 files
passed and two failed, 139 cases passed and two failed. Both failures were
ContextualHelpTrigger warm-server dynamic-import cases at their existing
30-second deadlines. The SSR duration was 147.89 seconds; summed transform
and import durations were 1350.00 and 2127.28 seconds. No import exception
was reported. These timings do not prove contention caused the failures or
identify which awaited import remained pending.

The proposed independent configs use the same
`Math.max(1, Math.min(2, availableParallelism() - 1))` capacity expression.
This resolves to two workers on this 16-CPU host and one on one- or two-CPU
runners. It preserves pools, compiler options, file discovery, isolation,
assertions, test/hook timeouts and original command deadlines. No browser
worker setting changes. The proposal is unqualified: the complete original
readiness run remains required, and lower concurrency may still encounter a
semantic failure, resource exhaustion or the original gate deadline.
