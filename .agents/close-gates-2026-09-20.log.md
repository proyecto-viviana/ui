# close-gates — 2026-09-20

Writer seat, ticket #553 (slices 0, 4–10) and #194 (slices 1–3).
Brief: `.agents/close-gates-2026-09-20.task.md`.

## Now

Slices P and 0 through 11 are closed: every slice the brief names, plus the
conductor's slice 11 (a gate never reuses a Playwright server). Slice 9 is
closed on a file-set proof rather than a whole-suite run — `vp test list` under
the new discovery names 345 files, exactly the per-package walk plus `scripts`
plus the apps' — and a fourth whole-suite `vp test run --maxWorkers=1` runs
detached into `.agents/chain-walk-2026-09-20/whole-suite.out.txt` (started
14:50). That single run is unverified locally; its result belongs in the slice 9
section when it lands. The suite's order and resource dependence is ticketed as
#556, not fixed here. Third writer; brief
`.agents/close-gates-2026-09-20.resume.task.md`.

## Slice L — land the conductor's notes

No gate, no planted defect: a records-only commit. `cae7c0c7`.

- `.agents/CONDUCTOR-PENDING-2026-09-20.md` LAUNCHES rows → the table in
  `.agents/audit-2026-09-20/LAUNCHES.md`, plus a `## Panes and briefs` table
  for the two columns the existing table does not carry, and the later state
  entries.
- Its VERIFIED rows → `VERIFIED.md`, one row each in the existing
  `| lens | finding | reproduced by | outcome |` format, with a
  `## Not reproduced` section for the claims the conductor explicitly did not
  reproduce.
- Friction items 13–18 → #552, under a new `### Added while the 2026-09-20
  audit ran` heading so the numbering stays sequential; each item names
  whether it is repo, hub or harness.
- Minted #553, #554, #555. `ls .claude/tickets/tasks | tail` showed 552 as the
  highest id, so the three ids the conductor named were free.
- `vp run docs:generate` → regenerated `.claude/current/roadmap.md` and
  `.claude/current/status.md`, both in this commit.
- The pending file is committed as the record, as the brief asks.
  `.agents/drafts-548/` is not staged.
  `.agents/green-main-2026-09-20.decision-solid-start-patch.md` is not staged
  either — it belongs to slice P, with the patch.

## Slice P — patch `@tanstack/solid-start` so `build:web` resolves

Red, before:

```
$ vp run build:web
[MISSING_EXPORT] "parseServerFunctionUrl" is not exported by
"@solidjs/web@2.0.0-rc.9/server-functions/dist/server.js"
  at @tanstack/solid-start@2.0.0-rc.8/dist/esm/server-functions-handler.js:4:90
```

Checked the decision's two claims against the installed trees before patching:

- rc.9's `server.js` export list has `parseServerFunctionActionUrl`,
  `serverFunctionActionUrl` and `serverFunctionUrl`, and no
  `parseServerFunctionUrl`.
- `serverFunctionActionUrl(id)` still takes a bare id —
  `urlTargetId` (`server.js:307-311`) accepts a string — and renders the same
  `serverFunctionAddress` that `parseServerFunctionActionUrl`
  (`server.js:2249-2252`) parses, so the rename round-trips. `serverFunctionUrl`
  in rc.9 throws unless it is handed a declared-GET function reference
  (`server.js:320-327`), which is why the id call site must move to the action
  helper, not stay put.
- `grep -rln` over the package found three files naming the old symbols:
  `dist/esm/server-functions-handler.js`, its `.map`, and `src/*.ts`. No
  `dist/cjs` twin exists. Per the decision the patch edits the one file that
  runs; the map and the unbuilt `src` are left alone to keep the patch minimal.

Repair: `vp exec pnpm patch @tanstack/solid-start@2.0.0-rc.8`, rename the
import and the three call sites, `pnpm patch-commit`. The patch is 4 changed
lines in one file; the `patchedDependencies` entry carries the reason in a
comment above it.

Green, after:

```
$ vp run build:web
BUILD:WEB EXIT=0
$ cd apps/web && vp preview      # the built Worker
URL=http://localhost:4173
GET / -> 200
```

### Chain state

Steps of `ci:release-readiness` after `build`, one at a time, memory checked
before each (`free -m`, `available` over 3000 MB) and vitest held to
`--maxWorkers=2`.

| step | exit | first failure |
| --- | --- | --- |
| `typecheck:apps` | 0 | — (435 files, 0 errors, 35 deprecation hints) |
| `test:run` | pending | |
| `test:ssr` | pending | |
| `test:hydrate` | pending | |
| `test:web` | pending | |
| `test:comparison-data` | pending | |

### Conductor walk, 12:51–12:54 (detached script, `--maxWorkers=2`)

The table above is superseded by this run; raw output in `.agents/chain-walk-2026-09-20/`.

| step | exit | result |
| --- | --- | --- |
| `test:run` | 1 | **inconclusive.** `packages/solid-spectrum/test/regression.test.tsx`: 2 of 50 failed ("renders trigger and snapshot", "renders tablist, tabs, click → panel changes, and snapshot"). Then vitest died two minutes in: `Error: Worker exited unexpectedly` — no summary line. earlyoom fired at 12:53:39, so memory is the first suspect; not proved. |
| `test:ssr` | 0 | 29 files, 78 tests |
| `test:hydrate` | 0 | 27 files, 98 tests |
| `test:web` | 0 | 9 files, 48 tests |
| `test:comparison-data` | 0 | 1 file, 12 tests |

Next: run `test:run` per package (`vp test run packages/<dir> --maxWorkers=2`), one at a time, to get a summary line for each and to find whether the worker exit follows one file.

### Per-package `test:run`, 13:21–13:25 (detached, one package at a time, `--maxWorkers=2`)

Raw output in `.agents/chain-walk-2026-09-20/pkg/`; `status.txt` has the run
order and the `available` memory before each. Nothing died: the whole-suite
`Worker exited unexpectedly` was memory, not a test.

| package | exit | result |
| --- | --- | --- |
| `solid-stately` | 0 | 37 files, 924 passed |
| `solidaria` | 0 | 168 files, 4212 passed, 6 skipped |
| `solidaria-components` | 0 | 76 files, 2450 passed, 6 skipped |
| `solidaria-test-utils` | 1 | **not a failure**: "No test files found" — the package ships no tests, and vitest exits 1 on an empty filter. |
| `solid-spectrum` | 1 | 84 files, 1116 passed, 1 expected fail, **2 failed** — both in `test/regression.test.tsx`, both snapshots. |
| `solid-spectrum-test-utils` | 1 | **not a failure**: "No test files found", as above. |
| `viviana-ui` | 0 | 32 files, 212 passed |
| `kumo` | 0 | 1 file, 23 passed |
| `geist` | 0 | 1 file, 20 passed |
| `scripts` | 0 | 2 files, 14 passed |

So `test:run` after the Solid 2 port is **two snapshot failures**, not a
collapse. The conductor's `test:run` exit 1 is explained.

#### The two snapshots: attribute order, nothing else

Read before updating, as the brief demands. Both diffs are on the same element,
the pressable `<button>`, and they are a permutation:

```
expected  …-pressable="" type="button" id="id-1" tabindex="0" aria-labelledby=…
received  …-pressable="" tabindex="0" type="button" id="id-1" aria-labelledby=…
```

Proved mechanically rather than by eye — for both snapshots the expected and
received strings have the **same length and the same character multiset**, and
the sole divergent span is the one above; for the Tabs snapshot, sorting each
tag's attributes makes the two strings identical. Same attributes, same values,
same tree: only the order in which the Solid 2 renderer applies `tabindex`
relative to `type`/`id`, which `innerHTML` serializes in insertion order. No
attribute was added, dropped, or changed, so nothing an assertion or a user
could observe moved. That is a mechanical Solid 2 port difference, and the new
output is the right one to record.

Repair: `vp test run packages/solid-spectrum/test/regression.test.tsx -u` —
2 snapshots updated, 50 passed. The diff is two lines in
`test/__snapshots__/regression.test.tsx.snap`.

### Chain state, settled

| step | exit | result |
| --- | --- | --- |
| `typecheck:apps` | 0 | 435 files, 0 errors |
| `test:run` | 0 | after the snapshot repair; 7 packages green, 2 without tests, `solid-spectrum` green |
| `test:ssr` | 0 | 29 files, 78 tests |
| `test:hydrate` | 0 | 27 files, 98 tests |
| `test:web` | 0 | 9 files, 48 tests |
| `test:comparison-data` | 0 | 1 file, 12 tests |

Slice P is done. Nothing from it goes to `## Slice 9 — the chain discovers the apps' unit tests

`ci:release-readiness` ran `vp test run packages scripts`: two directory
filters, so every unit test an app owns was outside the chain. The planted
defect is the omission itself, and the case that holds it joins the existing
ordering contract in `scripts/test-ci-guard-contracts.mjs` rather than starting
a second copy.

    $ node scripts/test-ci-guard-contracts.mjs      # before
    Error: test:run must discover tests from the config, not filter them to named directories
    EXIT=1

Repaired: `test:run` is `vp test run` with no filter, and the three app configs
that the root config cannot see are named in the chain
(`test:comparison-ssr`, `test:comparison-hydrate`, `test:web`,
`comparison:test:journeys-driver`). `test:comparison-data` is gone — the root
config already discovers `apps/comparison/src/data/**`.

    $ node scripts/test-ci-guard-contracts.mjs      # after
    PASS: release readiness runs every app unit suite by discovery.
    EXIT=0

### What the new discovery covers

`vp test list --filesOnly` under the repaired `test:run`, captured at
`.agents/chain-walk-2026-09-20/discovery-files.txt`, is 345 files:

    $ vp test list --filesOnly | grep -E '\.test\.(ts|tsx)$' | wc -l
    345
         14 apps/comparison
          1 packages/geist
          1 packages/kumo
         84 packages/solid-spectrum
         37 packages/solid-stately
         92 packages/solidaria
         76 packages/solidaria-components
         32 packages/viviana-ui
          8 scripts

That set is exactly the per-package walk plus `scripts` plus the apps' files.
The walk in `.agents/chain-walk-2026-09-20/pkg/` filters by path substring, so
its `packages/solidaria` row is solidaria (92) and solidaria-components (76)
together: 37 + 168 + 84 + 32 + 1 + 1 = 323 package files, + 8 `scripts` + 14
`apps/comparison` = 345. Green in that walk: solid-stately 37/924,
solidaria + components 168 files / 4,212 passed, viviana-ui 32/212, kumo 1/23,
geist 1/20; solid-spectrum 83 of 84 files green, the one red carried below.
Run here for this slice: `scripts` 8 files / 51 cases green (the walk predates
the four guard tests this task added), `apps/comparison` under the root config
14 files / 99 cases green, and the three app configs 1/8 SSR, 4/175 hydrate,
1/5 journeys-driver, all green.

**The single whole-suite `vp test run` is unverified locally.** Three attempts:
`--maxWorkers=2` died twice with `Error: Worker exited unexpectedly`, and
`--maxWorkers=1` outran a 30-minute cap. A fourth is running detached to
`.agents/chain-walk-2026-09-20/whole-suite.out.txt`; its result is recorded
below when it lands. The file set above and the per-package walk are what this
slice proves; the one-process run is not.

**Result of the fourth attempt: it did not produce one.** Launched
14:50:30 with `avail=11171MB`, it ran 101 minutes and ended
`EXIT=143 at 2026-09-20T16:32:07-03:00` — SIGTERM, with `Terminated` as its last
line and no test counts printed. earlyoom did not do it: its log has no kill
today after 13:19, and at 16:19 it measured `mem avail: 8664 of 14382 MiB
(60.24%), swap free: 1012 of 4096 MiB (24.71%)`, which does not meet its
`avail <= 6% AND swap free <= 25%` condition. What sent the signal is not
established; the only thing running beside it was a targeted
`vp test run packages/solidaria/test/openLink.test.ts`, started 16:32:05, and
four earlier targeted runs in the same session did not disturb it. So the
single-process whole-suite run is still unverified locally after four attempts,
which is more evidence for [#556](../.claude/tickets/tasks/556-unit-suite-is-order-and-resource-dependent.md),
not against it.

Commits `06cb5702` (the rewiring) and this log.

## Slice 10 — four tests that assert nothing

Each of the four rendered something, fired an event, and ended on a comment.
They ran under `test:run` and counted as passes, so the behaviours they name
were unheld. Each now asserts what its title promises.

- `createFormValidation.test.tsx:122` — hoists the state, dispatches the
  cancelable `invalid` event the browser fires (`fireEvent.invalid` is not
  cancelable), and asserts `defaultPrevented` plus the committed
  `displayValidation()` and its `["Required"]`.
- `createFormValidation.test.tsx:229` — asserts the change handler commits:
  not displaying before, displaying `["Required"]` after.
- `createFocusRing.test.tsx:346` — asserts the memo's gate (autoFocus alone,
  unfocused, shows no ring) and then the ring on focus.
- `Toast.test.tsx:340` (solidaria-components) — subscribes and asserts that on
  the global queue `close()` marks the toast `exiting` and keeps it, and only
  `remove()` drops it. That is what `hasExitAnimation: true` buys, and the
  title's claim.

Red first, with the behaviours planted out of the three sources
(`createFormValidation`'s `e.preventDefault()` and its `onChange` commit,
`createFocusRing`'s `isFocused() && flag` memo, `globalToastQueue`'s
`hasExitAnimation`):

    $ vp test run <the three files> --maxWorkers=1     # defects planted
       × global queue should have hasExitAnimation enabled
       × should set isFocusVisible to true initially when autoFocus is true and focused
       × should commit validation on invalid event
       × should commit validation on change event
       (+ 4 more focus-ring cases the memo gate holds)
     Test Files  3 failed (3)
          Tests  8 failed | 59 passed (67)
    EXIT=1

Sources restored (`git checkout --`), same command:

     Test Files  3 passed (3)
          Tests  67 passed (67)
    EXIT=0

Two of the four were order-dependent, and the fix is in the test, not the
assertion. `createFocusRing.test.tsx` inherited whatever interaction modality
the previous case left — a pointer interaction there makes the next case's
focus show no ring — so its `beforeEach` now starts each case from the keyboard
modality a fresh module has; all 24 cases green. The Toast case shares the
process-wide `globalToastQueue`, which earlier cases leave nine toasts in, so
it asserts on its own key rather than on the queue's length. Both are the same
family as [#556](../.claude/tickets/tasks/556-unit-suite-is-order-and-resource-dependent.md).

Upstream parity checked for the focus ring: `useFocusRing.ts:44,60` seeds
`autoFocus || isFocusVisible()` and re-samples the modality on every focus
change, exactly as the port does — the resample is not our divergence.

Tests only, so no changeset.

    $ vp check          pass: All 4334 files are correctly formatted
    $ vp lint           pass: Found no warnings or lint errors in 3166 files

## Slice 11 — a gate never reuses a server

Added by the conductor after the audit (`.agents/CONDUCTOR-PENDING-2026-09-20b.md`).
`reuseExistingServer` is what makes an interactive run cheap and a gate a
guess: a preview server left on the port from an older build answers every
request, the specs pass, and nothing in the run touched the tree being graded.
Both `apps/**` Playwright configs had `reuseExistingServer: !process.env.CI`,
and not one of the 33 scripts that run `playwright test` set `CI` — so every
browser gate on this machine could grade a stale server.

The switch is `VIVIANA_GATE=1`, not `CI=1`, and that is deliberate: these
configs also hang `.env.local` loading, two retries and the blob reporter off
`CI`, so a local gate run under `CI=1` would lose this machine's Chromium
arguments and silently retry twice — a different run from the one CI makes.
`CI` stays in the expression for the hosted run:
`reuseExistingServer: !process.env.CI && !process.env.VIVIANA_GATE`.
`VIVIANA_*` is the convention already in the tree (`VIVIANA_PACK_PASS`,
`VIVIANA_CONSUMER_DIR`), so this is not a third switch.

The planted defect the brief names — a stale server on the port serving an old
build — run on a throwaway fixture under `apps/web` (a stale `python3 -m
http.server` on 4399 serving `ok`, a config whose own webServer would have
served `broken`, a spec asserting `ok`):

    $ vp exec playwright test --config .gate-proof/gate.config.ts
      1 passed (470ms)
    REUSE_EXIT=0                      # green, against a server it did not start

    $ VIVIANA_GATE=1 vp exec playwright test --config .gate-proof/gate.config.ts
    Error: http://127.0.0.1:4399/ is already used, make sure that nothing is
    running on the port/url or set reuseExistingServer:true in config.webServer.
    GATE_EXIT=1

Fixture and its server removed after the run.

New `guard:gate-server-reuse` (`scripts/check-gate-server-reuse.mjs`) holds
both halves — the configs' expression and the scripts' switch — and was red on
the tree as found, 35 problems: both configs and all 33 scripts.

    $ node scripts/check-gate-server-reuse.mjs      # before
    A gate could reuse a server it did not start:
      apps/comparison/playwright.config.ts:79: reuseExistingServer ignores VIVIANA_GATE …
      apps/web/playwright.config.ts:35: reuseExistingServer ignores VIVIANA_GATE …
      package.json: script test:e2e runs playwright test without VIVIANA_GATE=1 …
      (+ 32 more)
    EXIT=1

    $ node scripts/check-gate-server-reuse.mjs      # after
    gate server reuse: 2 Playwright configs and 3 manifests all set VIVIANA_GATE.
    EXIT=0

Held by 7 cases in `scripts/check-gate-server-reuse.test.ts` (7 passed), and
wired into `ci:release-readiness` beside `guard:workflow-pins`, with the wiring
itself asserted in `scripts/test-ci-guard-contracts.mjs`: unwired it exits 1
with "release readiness must run guard:gate-server-reuse; a gate that reuses a
server grades nothing", wired it exits 0. `tooling.md` records the switch.

Scripts and configs only, so no changeset.

    $ vp check          pass: All 4336 files are correctly formatted
    $ vp lint           pass: Found no warnings or lint errors in 3168 files

## Left red`.

## Slice 0 — the peers allowlist, and both audits every run

Red, before — the gate passes over its own defect, because `&&` never reaches
the audits:

```
$ vp run guard:dependency-security
$ vp exec pnpm peers check && vp pm audit … && vp pm audit …
   (peers exits 1; neither audit runs. Red since the Solid 2 port.)
```

The 17 unmet peers (the brief said 16; the live report has 17) are all
TanStack's: 14 under `@tanstack/solid-router@2.0.0-rc.8`
(`@solid-devtools/logger`, `debugger`, `shared`, and eleven
`@solid-primitives/*`) and 3 under `@tanstack/solid-start@2.0.0-rc.8`
(`vite-plugin-solid`, `babel-preset-solid`, `solid-refresh`). Note the second
root is `solid-start`, not `router-plugin` as the brief guessed — the list is
generated from `vp exec pnpm peers check --json`, not from the brief.

Repair, three files:

- `scripts/check-peers.mjs` — reads `pnpm peers check --json` (whose exit
  status is not the answer, so the report is parsed from `stdout` either way),
  flattens `bad` and `missing` into one row per unmet peer keyed by
  workspace + peer + range + declaring package + root dependency, and diffs it
  against the allowlist in both directions.
- `scripts/expected-unmet-peers.json` — the 17 entries, each carrying the root
  dependency that pulls it and why it cannot be satisfied.
- `scripts/check-dependency-security.mjs` — the guard itself: peers, then both
  audits, each run whatever the one before returned, non-zero if any failed.
  `package.json` now points `guard:dependency-security` at it.

No `peerDependencyRules.allowAny: solid-js`: it would have blinded the same
check for our own packages.

Green and red — both planted defects, from the repo root:

```
$ node scripts/check-peers.mjs
peers: 17 unmet peers, all of them expected and explained.          EXIT=0

# planted: one fake entry added to the allowlist
stale allowlist entry: solid-js@^1.0.0 required by not-a-package@0.0.0
  (via not-a-root@0.0.0, apps/web) is no longer unmet — delete the entry …
                                                                    EXIT=1
# planted: one real entry (solid-refresh@0.6.3) removed
unexpected unmet peer: solid-js@^1.3 required by solid-refresh@0.6.3
  (via @tanstack/solid-start@2.0.0-rc.8, apps/web) — satisfy it, or add it …
                                                                    EXIT=1
# defects removed
peers: 17 unmet peers, all of them expected and explained.          EXIT=0
```

Both planted cases are held by a committed unit test, `scripts/check-peers.test.ts`
(6 cases, green): an unmet peer the list does not name, a listed entry that no
longer occurs, and a widened range counting as both at once.

### What the audits found the moment they were allowed to run

`vp run guard:dependency-security`, the first run either audit has had on this
tree since the Solid 2 port — output in
`.agents/chain-walk-2026-09-20/dependency-security.txt`:

```
peers: 17 unmet peers, all of them expected and explained.
=== audit (high)       → 2 vulnerabilities found, 2 moderate       (passes: high floor)
=== audit (prod, low)  → moderate: devalue <5.9.1, DoS via malformed input
                         GHSA-9rgm-9g3h-6x36
                         apps__comparison>@astrojs/react>devalue
                         apps__comparison>astro>devalue
                         1 vulnerabilities found
guard:dependency-security failed: audit (prod, low)               EXIT=1
```

That is the slice paying for itself on its first run: a moderate production
advisory that the `&&` chain had been hiding behind the red peers check.

Repaired the same way the block above it already repairs `ws`, `undici`,
`js-yaml`, `sharp` and `svgo` — a transitive security override in
`pnpm-workspace.yaml`, `devalue: "^5.9.1"`, no new dependency and no major
bump. `vp install` resolved `devalue@5.9.4`; `+4 -2` packages, exit 0.

After (`.agents/chain-walk-2026-09-20/dependency-security-after.txt`):

```
peers: 17 unmet peers, all of them expected and explained.
=== audit (high)       → 1 vulnerabilities found, 1 moderate       (dev-only, under the high floor)
=== audit (prod, low)  → No known vulnerabilities found
guard:dependency-security: peers allowlist and both audits passed. EXIT=0
```

Slice 0 commit: `f813032d`. No changeset: `scripts/**`, the root manifest and
`pnpm-workspace.yaml` are not a published package's `src` or manifest.

## Slice 1 — a certified shard must explain its own exit

The shard job is `continue-on-error: true`
(`.github/workflows/certification-gates.yml:629-632`), so the merge is the only
gate. It exited non-zero only for waiver problems, and the reporter recorded
neither Playwright's run status nor any error outside a test. A spec that never
loaded was therefore green.

Red, before — the planted defect is `throw new Error("x")` on line 1 of
`apps/comparison/e2e/certified/accordion.certified.spec.ts`. One shard, no web
server (`COMPARISON_BASE_URL` set, so the config manages none) because the spec
dies at import and never reaches the network:

```
$ pnpm exec playwright test e2e/certified/accordion.certified.spec.ts --shard=1/1
  Error: x at e2e/certified/accordion.certified.spec.ts:1:7          EXIT=1
  [certified-summary] wrote test-results/certified-summary.1.json
  Totals: 0 passed, 0 failed, 0 skipped, 0 waived, 0 flaky

$ CERTIFIED_SHARD_TOTAL=1 pnpm exec tsx \
    apps/comparison/scripts/merge-certified-reports.ts <shards>
  Totals: 0 passed, 0 failed, 0 skipped, 0 waived, 0 flaky        EXIT=0
```

Exit 0 on a suite where a certified spec never ran: the fail-open the audit
named, reproduced.

Repair, three files:

- `apps/comparison/scripts/certified-summary.ts` — `CertifiedSummary` gains
  `runStatus` and `errors`; `mergeCertifiedSummaries` carries both (merged
  status is `passed` only when every shard passed, `null` if any shard recorded
  none); `readCertifiedSummaryFile` normalizes a summary written before the
  fields existed to `runStatus: null`, which is itself a problem, not a pass;
  and the new pure `checkShardOutcomes` returns one problem per load error, per
  missing status, and per non-pass status that nothing in the summary explains.
  A failed, waived or errored case explains a non-pass exit; nothing else does.
- `apps/comparison/e2e/reporters/certified-summary.ts` — `onError` records each
  error with its spec file, `onEnd(result)` records `result.status`, both land
  in the written summary, and the errors are echoed to stderr.
- `apps/comparison/scripts/merge-certified-reports.ts` — runs
  `checkShardOutcomes` over the shard summaries and exits 1 if any problem
  survives, after writing the report and the step summary so the evidence
  still exists.

Green and red, same planted defect, same two commands:

```
# defect planted, after the repair
$ pnpm exec playwright test … --shard=1/1
  Run status: `failed`.
  ### Run errors
  - `e2e/certified/accordion.certified.spec.ts` — Error: x               EXIT=1
$ … merge-certified-reports.ts <shards>
  Certified shards that do not explain their own exit:
  - shard 1/1: load-error: e2e/certified/accordion.certified.spec.ts: Error: x
                                                                       EXIT=1
# defect removed (`--list`, so no server and no browser)
$ pnpm exec playwright test … --shard=1/1 --list      "runStatus": "passed"
$ … merge-certified-reports.ts <shards>   Run status: `passed`.        EXIT=0
# the same green summary with runStatus flipped to "interrupted", a shard killed
$ … merge-certified-reports.ts <shards>
  - shard 1/1: unexplained-status: run status interrupted, but the summary
    records no failed case and no error                                EXIT=1
```

The planted case is held by `apps/comparison/src/data/certified-shard-outcomes.test.ts`
(10 cases, green), beside the existing `certified-waivers.test.ts`: load error,
unexplained non-pass, interrupted, missing status, the two shapes that *do*
explain a non-pass (a failed case, a waived one), shard labelling, and the two
merge fields. `vp run test:run` already discovers it —
`apps/comparison/src/data/**/*.test.ts` is in the vitest include.

The planted defect is removed; `git status` shows no change to
`accordion.certified.spec.ts`. `vp check` and `comparison:typecheck` exit 0.
No changeset: `apps/comparison` publishes nothing.

Slice 1 commit: `e327ae9d`.

## Slice 2 — a committed floor on discovered cases per certified spec file

The shards report what they ran. Nothing reports what went missing: a certified
spec that is deleted, renamed or excluded takes its cases with it and every gate
stays green, because no gate knows how many cases there were supposed to be.

Planted defect: one certified spec moved aside.

    mv apps/comparison/e2e/certified/actionbar.certified.spec.ts /tmp/…

Before, the only discovery we had is blind to it:

    pnpm exec playwright test e2e/certified --list   # cwd apps/comparison
    Total: 2173 tests in 16 files
    LIST EXIT=0

After, with `scripts/check-certified-case-floor.mjs` and the baseline it writes:

    node scripts/check-certified-case-floor.mjs
    certified spec gone: certified/actionbar.certified.spec.ts discovered 4
      cases and now discovers none — restore it, or lower the floor with
      `node scripts/check-certified-case-floor.mjs --write` and say why.
    FLOOR EXIT=1

Defect removed:

    node scripts/check-certified-case-floor.mjs
    certified case floor: 73 files, 2177 cases, none below the floor.
    FLOOR EXIT=0

The floor is `apps/comparison/e2e/certified-case-floor.json`: 73 files, 2177
cases, pinned to `e327ae9d`. It shrinks only. A drop in a file's count and a
baselined file that discovers nothing both fail; growth passes and prints the
`--write` line to ratchet. Discovery is `playwright test --list --reporter=json`
— no browser, no web server, about two seconds — and a spec that fails to load
lands in the report's `errors`, which the guard fails on and refuses to write a
baseline from. Cases are attributed to the top-level suite's file, so a case
declared in a shared driver counts against the spec that pulls the driver in,
not against the driver.

One defect found while wiring it: `pnpm exec` prefixes "Scope: all 12 workspace
projects" to stdout, so `JSON.parse` of the raw output throws. The report now
starts at the first brace, with a test for both the banner and stdout that
carries no report at all.

Wired into `guard:certified-case-floor`, into `ci:release-readiness` after
`guard:dependency-security`, and into the fast `comparison-build` job of
`certification-gates.yml`. `node scripts/test-ci-guard-contracts.mjs` exits 0.
`scripts/check-certified-case-floor.test.ts` is 10 cases green; `vp check` and
`vp lint` exit 0. No changeset: scripts and workflows publish nothing.

Slice 2 commit: `38dc24ea`.

## Slice 3 — skipped and flaky ceilings in the merge

Two fail-opens, one slice.

**The inventory misses driver-level fixme sites.** `test.fixme` is registered in
two shapes: a `knownDivergences` block in a driver config, and a
`knownDivergence` string on a motion or announcement trigger. The inventory read
the first shape only, and only the first block in a file. Planted defect: a
`knownDivergence` on the `spin-up` announce trigger of
`datefield.certified.spec.ts`, which marks a real case `test.fixme`.

    fixme sites: 4
    postcard problems: []

Five sites in the tree, four counted, and `validateCertifiedSuiteEvidence`
happy with a postcard recording four skips. With the repair:

    fixme sites: 5
    postcard problems: [ 'skipped=4 does not match 5 registered known divergences' ]

Defect removed: back to 4 sites, no problems.
`extractKnownDivergenceKeys` is now `extractCertifiedFixmeSites`: every
`knownDivergences` block (the regex is global), plus every trigger-level
`knownDivergence`, named by the nearest `id` above it.

**The merge accepts any number of skips and retry-passes.** A skip and a
retry-pass are both green in every count the report prints, so a suite can stop
running and stay green. Planted defect: a shard summary recording 2100 passed,
40 skipped, 7 flaky.

    CERTIFIED_SHARD_TOTAL=1 pnpm exec tsx apps/comparison/scripts/merge-certified-reports.ts <shards>
    Totals: **2100 passed**, **0 failed**, **40 skipped**, **0 waived**, **7 flaky**.
    MERGE EXIT=0

After:

    - over-skipped: 40 skipped cases, ceiling 4 — every skip must be a
      registered knownDivergence. …
    - over-flaky: 7 cases passed only on a retry, budget 0 — a retry-pass is a
      failure the report rounds off. …
    MERGE EXIT=1

The same summary at 4 skipped and 0 flaky: `MERGE EXIT=0`.

The ceilings are `skippedCeiling: 4` and `flakyBudget: 0` in
`apps/comparison/e2e/certified-case-floor.json` — the slice-2 baseline, so the
owner changes one line in one file. `--write` copies them across untouched; a
listing cannot derive them. A test holds `skippedCeiling` to the number of
registered fixme sites, so the ceiling and the inventory cannot drift apart
silently.

`apps/comparison/src/data/certified-run-budgets.test.ts` is 9 cases green; with
the shard-outcome and acceptance-schema suites, 30 green. `comparison:typecheck`
0 errors, `vp lint`, `vp check` and `guard:certified-case-floor` exit 0. No
changeset: `apps/comparison` publishes nothing.

Slice 3 commit: `afa80ec3`.

## Slice 4 — release prerequisites enumerate from the tree

`scripts/release-prerequisites.json` listed one package, `@proyecto-viviana/kumo`,
which `.changeset/config.json` ignores. The five packages a release actually
publishes were not in it, so the guard inspected nothing releasable and said so
in the affirmative:

    node scripts/check-release-prerequisites.mjs
    SKIP: @proyecto-viviana/kumo@0.0.0 is not a publish candidate.
    release prerequisites — PASS
    PREREQ EXIT=0

The subjects come from the tree now — non-private `packages/*` minus the
Changesets `ignore` list — and a candidate with no entry fails. Planted defect:
`@proyecto-viviana/ui` removed from the list.

    release prerequisites — FAIL: @proyecto-viviana/ui@0.7.0 is a publish
      candidate with no entry in scripts/release-prerequisites.json — record its
      prerequisites and the evidence for each.
    PREREQ EXIT=1

Restored: `PASS`, exit 0.

That derivation existed twice and the two copies disagreed —
`check-publish-drift.mjs` read the tree, this one read the list — so both now
call `scripts/release-candidates.mjs` (`releasablePackages`,
`pendingChangesetPackages`). `check-publish-drift.mjs` still exits 0.

Evidence recorded for the five candidates, all of it re-runnable by anyone:

    npm view <pkg> name version dist-tags --json
    npm view <pkg>@<version> dist.attestations --json

solid-spectrum 0.6.4, solid-stately 0.5.1, solidaria 0.4.3,
solidaria-components 0.5.1, ui 0.6.3 — each carries SLSA provenance
(`predicateType=https://slsa.dev/provenance/v1`) on its published tarball, which
is the registry's own record that the publish came from the workflow over OIDC.
Nothing here is owner-attested, so nothing from this slice goes to `## Left red`;
kumo's 2026-09-04 `npm trust list` entry is untouched and still owner-captured.

`scripts/release-candidates.test.ts` is 7 cases green, three of them running the
guard against a fixture tree (forgotten candidate, satisfied candidate,
satisfaction claimed with blank evidence). `node scripts/test-ci-guard-contracts.mjs`
exit 0 — it caught two regressions first: a fixture with no
`.changeset/config.json`, and a `0.0.0` workspace version being counted as a
candidate. `vp lint` and `vp check` exit 0. No changeset: scripts publish nothing.

Slice 4 commit: `76bd2b06`.

## Slice 5 — publish drift sees the manifest

A package's contract is its `package.json`: a new `exports` subpath, a widened
peer range, a changed `main` reaches consumers the same way source does. The
guard diffed only `packages/<dir>/src`, so every one of those shipped unnoticed.

Every real package has a pending changeset today, so the drift path cannot fire
in-tree. Red-first ran on a throwaway git fixture (`$SCRATCHPAD/driftfix`):
`packages/a` released at 1.0.0 (manifest, `src/index.ts`, `CHANGELOG.md`),
then a commit adding `"./extra": "./src/extra.ts"` to its manifest.

Before, the gate passed the planted defect:

    $ node scripts/check-publish-drift.mjs
    No publish drift: every package with unreleased source changes has a changeset.
    DRIFT EXIT=0

After the repair (`unreleasedSourceFiles` → `unreleasedPublishedFiles`, diffing
`packages/<dir>/src` **and** `packages/<dir>/package.json`):

    $ node scripts/check-publish-drift.mjs
    Unreleased source or manifest changes with no changeset to publish them:
      @scope/a@1.0.0 — 1 changed file(s) since 9e46ce21
        packages/a/package.json
    DRIFT EXIT=1

    # same tree, with a changeset naming @scope/a
    WITH CHANGESET EXIT=0
    # this repository
    REPO EXIT=0

The changeset boundary is unchanged and is why a version bump is never drift:
`changeset version` writes the bump and `CHANGELOG.md` in one commit, and the
diff starts after it.

`scripts/check-publish-drift.test.ts` builds that same fixture: nothing
unreleased passes, the planted `exports` subpath fails and names
`packages/a/package.json`, a changeset clears it, and an unreleased `src` change
still fails. 4 cases green.

`.claude/current/release-policy.md` now records why `Changesets Check` stays
`pull_request`-only — the changeset lands in the tree beside the change on a
direct push, and this guard holds the push path.

    $ vp check          pass: All 4330 files are correctly formatted
    $ vp lint           pass: Found no warnings or lint errors in 3163 files
    $ node scripts/test-ci-guard-contracts.mjs   all PASS
    $ vp run guard:publish-drift                 exit 0

Commit `767bb471`.

## Slice 6 — npm pinned, and a guard that keeps it pinned

Every `uses:` in the workflow set is pinned to a commit SHA. One line was not:

    .github/workflows/release.yml:58
    run: npm install -g npm@^11.5.1

That range let the registry choose which npm ran in the one job holding
`contents: write`, `pull-requests: write` and the publish token.

    $ npm view npm@11 version    # 2026-09-20
    npm@11.19.1 '11.19.1'

Fourteen minors past the version anyone reviewed. Pinned to `npm@11.19.1`, with
the same "bump deliberately" note the pinned actions carry.

The planted case is the range itself, so the gate is a new guard,
`scripts/check-workflow-pins.mjs`: an action ref must be a 40-character SHA, a
global install must name an exact version. Red on the tree as it stood:

    $ node scripts/check-workflow-pins.mjs
    Workflows run unpinned code:
      .github/workflows/release.yml:58: installs npm@^11.5.1 globally — name an exact version, and bump it deliberately.
    EXIT=1

Green after the pin:

    $ node scripts/check-workflow-pins.mjs
    workflow pins: 6 workflows, every action and global install pinned.
    EXIT=0

`guard:workflow-pins` runs first in `ci:release-readiness`. Held by 7 cases in
`scripts/check-workflow-pins.test.ts` (range, exact, no version at all, mutable
tag, SHA, local action, and this repository's own workflows).

    $ vp check          pass: All 4332 files are correctly formatted
    $ vp lint           pass: Found no warnings or lint errors in 3165 files
    $ node scripts/test-ci-guard-contracts.mjs   all PASS

Commit `9305a49a`.

## Slice 7 — an unbuilt entry is a ceiling nobody measured

`measure()` returns null for an entry whose `exports` target has no built file,
and the loop did `continue`. Only an entirely unbuilt tree failed. So a renamed
`exports` target, a package dropped from the build, or a half-built tree passed
on every entry it silently removed.

Planted on the real `dist/`: `packages/viviana-ui/dist/Provider.js` moved aside,
with a two-entry budget (the `ui` entry plus one built entry whose ceiling was
raised so only the missing entry could fail).

    $ node --experimental-strip-types scripts/check-entry-import-budget.ts
    entry import budget
    - entries measured: 1/2
    - root-barrel importers: 154 (ceiling 154)
    - entries now under their ceiling (lower it with --write-baseline):
        @proyecto-viviana/solid-spectrum ./ProgressCircle: 20 modules (14 solidaria), ceiling 99/99
    entry import budget OK.
    BEFORE EXIT=0

After the repair, the same tree:

    entry import budget FAILED: 1 budgeted entry(ies) not built:
      @proyecto-viviana/ui ./Provider

    Build the packages (vp run build). If an entry is gone for good, drop its line
    from scripts/entry-import-budget.json in the commit that removes it.
    AFTER EXIT=1

The `No budgeted entry resolved to a built file` message is kept for the
all-unbuilt case, which is a different mistake and deserves its own sentence.
The built file and the real budget were restored; `git diff` on
`scripts/entry-import-budget.json` is empty.

`scripts/check-entry-import-budget.test.ts` runs the guard against a fixture
workspace: all built and under ceiling passes, one unbuilt entry fails by name,
nothing built says to build first. 3 cases green.

    $ vp check          pass: All 4333 files are correctly formatted
    $ vp lint           pass: Found no warnings or lint errors in 3166 files
    $ node scripts/test-ci-guard-contracts.mjs   all PASS

Commit `5c57cf2f`.

## Slice 8 — the sourcemap guard runs somewhere

It passes on the built tree:

    $ node scripts/check-package-macro-sourcemaps.mjs
    guard:package-sourcemaps — PASS: generated 1:13 maps to .../scripts/fixtures/style-macro-sourcemap.ts:3:13;
    the JSX-preserve transform retains its map, the build rejects SOURCEMAP_BROKEN,
    and PACK_PASS selects one pack pass per process.
    EXIT=0

It was in no chain and no workflow, while `.claude/current/tooling.md` said it
held the pack-pass contract. Wired into `ci:release-readiness` immediately after
`build`, the only point where the packages it measures exist.

The planted case is the wiring itself, so the assertion joins the existing
ordering contract in `scripts/test-ci-guard-contracts.mjs` (no second copy).
With the guard removed from the chain:

    $ node scripts/test-ci-guard-contracts.mjs
    Error: release readiness must run guard:package-sourcemaps after building packages
    UNWIRED EXIT=1

Wired:

    PASS: release readiness proves the pack-pass sourcemap contract after the build.
    WIRED EXIT=0

`tooling.md` now says where it runs instead of only that it exists.

    $ vp check          pass: All 4333 files are correctly formatted
    $ vp lint           pass: Found no warnings or lint errors in 3166 files

Commit `9d29e858`.

## Left red

**`guard:entry-import-budget` ceilings, all five entries** (found in slice 7,
not caused by it; blocking step in Certification Gates). Against the 12:20
build of `dist/`:

    $ node --experimental-strip-types scripts/check-entry-import-budget.ts
    entry import budget
    - entries measured: 5/5
    - root-barrel importers: 154 (ceiling 154)

    entry import budget FAILED:
      @proyecto-viviana/ui ./Provider: 25 modules, ceiling 21
      @proyecto-viviana/solid-spectrum ./Provider: 25 modules, ceiling 21
      @proyecto-viviana/solid-spectrum ./ButtonGroup: 29 modules, ceiling 28
      @proyecto-viviana/solid-spectrum ./ProgressBar: 24 modules, ceiling 23
      @proyecto-viviana/solid-spectrum ./ProgressCircle: 20 modules, ceiling 19

Every budgeted entry gained four modules or so since the baseline was frozen.
`--write-baseline` would clear it and that is exactly the papering-over this
task forbids: the ceilings are the gate. Finding which import widened the graph
is a port question, not a gate question, and belongs to its own ticket.

**`packages/solid-spectrum/test/regression.test.tsx`, two snapshots** (found by
the per-package walk, not caused by this task; now inside the chain because
`test:run` no longer filters, though it was inside it before too):

    FAIL packages/solid-spectrum/test/regression.test.tsx > Regression: Select > renders trigger and snapshot
    Error: Snapshot `Regression: Select > renders trigger and snapshot 1` mismatched
    FAIL packages/solid-spectrum/test/regression.test.tsx > Regression: Tabs > renders tablist, tabs, click → panel changes, and snapshot
    Error: Snapshot `Regression: Tabs > renders tablist, tabs, click → panel changes, and snapshot 1` mismatched
     Test Files  1 failed | 83 passed (84)
          Tests  2 failed | 1116 passed | 1 expected fail (1119)

Both are rendered-markup snapshots from before the Solid 2 port. Updating them
is a port decision with an owner in the RC cohort, not a gate repair.

**The suite's result depends on how it is run** — ticketed as
[#556](../.claude/tickets/tasks/556-unit-suite-is-order-and-resource-dependent.md),
found in slice 9 and deliberately not fixed here. Under one `vp test run` over
all 345 files, `--maxWorkers=2` dies with `Error: Worker exited unexpectedly`
and `ListView.test.tsx` reports 9 of 11 red; the same file is 11/11 alone and
green in the per-package walk.

## #565 — the entry import budget

Brief `.agents/CONDUCTOR-PENDING-2026-09-20c.md`, ticket
`.claude/tickets/tasks/565-clear-the-entry-import-budget-red-before-the-rc.md`,
worked from `c52c87ef`. Two failures share one printout; they are two.

### The importer, which is ours

`packages/solidaria-components/src/RouterProvider.tsx:25` now reads
`import { openLink } from "@proyecto-viviana/solidaria/utils"`. `openLink` is
declared in `packages/solidaria/src/utils/dom.ts:587`, `src/utils/index.ts:44`
exports it, and `./utils` is already a published subpath — so the root-barrel
import bought nothing. It arrived in `e6384f37` under #555, a commit worked from
this seat and pushed from the conductor's: our drift, not a found condition.

Measured after the change, no build needed for this half:

    - root-barrel importers: 154 (ceiling 154)

`guard:publish-drift` run rather than guessed: `No publish drift: every package
with unreleased source or manifest changes has a changeset.` — exit 0.
`solidaria-components` already carries an unreleased changeset
(`open-link-dispatch.md`, from the same commit that added this import), so the
narrowing owes no new one.

### Reading the five ceilings out of the guard's own traversal

The guard builds the per-entry module list already and then throws it away, so
`scripts/check-entry-import-budget.ts` grew a `--print-modules` mode: the same
`reachableModules` walk, reporting instead of checking, exit 0. It also records
`reachedFrom` — the module and specifier that first pulled each file in — so the
output names the import behind every module rather than leaving it to be
inferred:

    packages/solidaria/dist/_chunk/env.js  <- packages/solidaria/dist/utils/index.js "../_chunk/env.js"

That is one walker, not a second one; nothing about the measurement changed.

### The freeze commit will not build, and why I did not install

The brief says to build at a commit from before the drift. `2d6bb3bd` does not
build: its root manifest carries `unplugin-solid@^2.0.0`, which `377b559c`
dropped this morning, and the package is not in `node_modules` or the store.
Restoring it is an install of a removed dependency, so I did not.

What I did instead, in a detached worktree with `node_modules` symlinked from
this checkout, no install:

- packed `163f4377` (the Solid 2 port) with its configs untouched, as a control
  that the worktree measures the same way this checkout does;
- packed `2d6bb3bd` with one edit in four `vite.config.ts` files — the JSX
  plugin swapped from `unplugin-solid`/`vite-plugin-solid` to the installed
  `@solidjs/vite-plugin`. Everything else is the frozen source.

Both were measured with this checkout's `check-entry-import-budget.ts`, copied
into the worktree, so one walker read all three trees. The walker's traversal is
unchanged since the freeze; `5c57cf2f` touched only its reporting.

    entry              2d6bb3bd   163f4377   HEAD   ceiling
    ui ./Provider         23         25       26      21
    s2 ./Provider         23         25       26      21
    ./ButtonGroup         30         29       30      28
    ./ProgressBar         25         24       24      23
    ./ProgressCircle      21         20       20      19

### What moved each of the five

The port-commit column reproduces the 25/25/29/24/20 this log recorded at 12:20,
which is the control working: the worktree and this checkout agree.

Four modules are new in every entry, and the diff names the import for each:

- `_chunk/refs.js` — `solidaria/src/utils/mergeProps.ts:15`,
  `import { assignRef } from "./refs"`. `utils/refs.ts` did not exist at the
  freeze; the Solid 2 port wrote it.
- `_chunk/owner.js` — `solidaria/src/ssr/index.tsx:26`,
  `import { useContextOptional } from "../utils/owner"`. Same, a port file.
- `_chunk/mergeProps.js` — no new import at all.
  `progress/createProgressBar.ts:27` has imported it since before the freeze. It
  is a separate chunk now only because `mergeProps.ts` gained imports of its own
  (`./refs`, `./domAttrs`) and stopped being folded into its caller.
- `_chunk/FocusScope.js` — `solidaria/src/overlays/createOverlay.ts:26`,
  `import { isElementInChildOfActiveScope } from "../focus/FocusScope"`, from
  `d0f095a1` under #555. Upstream's `useOverlay` reads the same private helper
  out of `@react-aria/focus`, so extracting it to save a module would diverge
  from the layout we mirror. It stays.

The two Providers gain three more from one specifier:
`{viviana-ui,solid-spectrum}/src/provider/index.tsx:28`,
`import { mergeProps, splitProps } from "@proyecto-viviana/solidaria/utils"`.
At the freeze both providers took those two from `solid-js`; Solid 2 exports
neither, so the port pointed them at solidaria's shims, and that specifier
reaches `dist/utils/index.js`, `_chunk/filterDOMProps.js` and
`_chunk/mergeProps.js`. The only narrowings available are a public subpath finer
than `./utils` — an owner-steered name — or dropping the shims for Solid 2's
`merge`/`omit`, which changes behaviour rather than narrowing. So nothing here
was narrowable from this seat, which is why nothing was narrowed.

The rest of the gap is not ours: the frozen source, rebuilt today, is already
over four of the five ceilings that were written from it. This build emits no
`_chunk/web.js`, `_chunk/focus.js` or `_chunk/createInteractionModality.js`. The
unit is dist chunks, so the bundler moves the number too — filed as #566.

### Raising the ceilings

Raised by hand to the measured 26/26/30/24/20 (22/22/22/19/14 solidaria), with a
new `why` on every entry naming the imports above. `--write-baseline` was
refused by this harness as a CI bypass; the hand edit does what the flag would
have done and carries the reasons the flag cannot write.

    $ vp run guard:entry-import-budget      # before
    entry import budget FAILED:
      @proyecto-viviana/ui ./Provider: 26 modules, ceiling 21
      @proyecto-viviana/solid-spectrum ./Provider: 26 modules, ceiling 21
      @proyecto-viviana/solid-spectrum ./ButtonGroup: 30 modules, ceiling 28
      @proyecto-viviana/solid-spectrum ./ProgressBar: 24 modules, ceiling 23
      @proyecto-viviana/solid-spectrum ./ProgressCircle: 20 modules, ceiling 19
    EXIT=1

    $ vp run guard:entry-import-budget      # after
    entry import budget
    - entries measured: 5/5
    - root-barrel importers: 154 (ceiling 154)
    entry import budget OK.
    EXIT=0

Both runs read the `vp run build` of this HEAD (EXIT=0, 1m22s); no source
changed between them, only `scripts/entry-import-budget.json`. The worktree is
removed. Changeset: none owed — the budget file and the guard ship in no
package.

## #566 — the budget's unit

The owner picked the first of the ticket's three: the unit becomes source
reachability. The other two are closed and I have not argued them.

### What changed in the guard

Only the ceiling half. The root-barrel inventory already read source and is
untouched.

- `sourceOfTarget()` is the one place a published target becomes a source file,
  and both the budgeted entries and the workspace bare specifiers go through it.
  Strip `dist/` and the emitted extension, look under `src/` for that path as a
  file or a directory with an index.
- It tries the `types` condition before the runtime one. That is not tidiness:
  `solid-stately` emits `src/flags/flags.ts` as `dist/private/flags/flags.js`,
  and only its `types` condition — tsc's output, which mirrors `src/` one file
  to one file — still spells the source path. Without that order the guard fails
  on three specifiers into that module.
- `resolveRelative()` now strips a trailing `.js`/`.jsx` from a specifier.
  `solidaria/src/select/index.ts` writes `export type … from
  "./createHiddenSelect.jsx"`, which is the emitted name of a `.tsx` on disk.

### Type-only and macro imports

Two kinds of specifier do not reach a consumer, and `dist/` excluded both by
construction — the first by erasure, the second because the macro runs at build
time and is replaced by its result. `specifiersOf()` now splits each statement
into clause, specifier and trailing attribute and drops both.

Type-only is `import type … from`, `export type … from`, and a clause whose
every brace binding is `type`-qualified with no default or namespace binding
outside the braces. An unmarked binding that happens to name a type counts: that
needs a type checker, and a ceiling should err upward. Macro is
`… with { type: "macro" }`.

Proved by flipping each predicate to `false` and re-measuring:

    exclusion         ui ./Prov  s2 ./Prov  ButtonGrp  ProgBar  ProgCircle
    as shipped            53         52         57        44        35
    type-only counted    155        153        468        49        40
    macro counted         60         58         63        49        40

468 against 57 on ButtonGroup is the whole correctness hinge: counting erased
type edges would have measured something no consumer loads.

### An unresolvable entry fails

Pointed `solid-spectrum`'s `./ProgressCircle` export at
`./dist/progress/ProgressCircleRenamed.{js,jsx,d.ts}`, which no source file
backs:

    entry import budget FAILED: 1 budgeted target(s) resolve to no source file:
      @proyecto-viviana/solid-spectrum ./ProgressCircle (exports ./dist/progress/ProgressCircleRenamed.js)
    EXIT=1

Reverted with `git checkout --`. The same failure covers a workspace specifier
inside the graph that resolves to nothing, which is the same hole one level
down. Non-source specifiers — `.json` translation bundles, stylesheets, assets —
are skipped by name, as the dist walk skipped them by taking `.js` siblings only.

### The numbers, and why they roughly doubled

    entry              dist chunks (#565)   source modules (#566)
    ui ./Provider              26                   53
    s2 ./Provider              26                   52
    ./ButtonGroup              30                   57
    ./ProgressBar              24                   44
    ./ProgressCircle           20                   35

Two reasons, both wanted. A chunk folds several modules together, and source
reachability does not tree-shake, so a subpath barrel now costs every module it
re-exports: `@proyecto-viviana/solidaria/utils` alone is 25 of the Providers' 53
and 22 of ProgressCircle's 35. That is the cost this guard exists to hold, and
it is a number only an import can move.

Re-frozen once with `--write-baseline`, which is the right tool here because the
unit changed rather than the graph. The five `why` fields were rewritten by hand
afterwards: the imports #565 named survive the change, only their filenames do
not, so `_chunk/refs.js` is now `utils/refs.ts` and `_chunk/FocusScope.js` is
`focus/FocusScope.tsx`, reached from the same `createOverlay.ts` import. `unit`
and `description` in the JSON and the script's header comment all say source
modules now.

### It no longer needs a build, so it is a release-readiness leg

Proved rather than reasoned: a detached worktree of `e0ccb27e` with
`node_modules` symlinked and no `dist/` anywhere (`find packages -maxdepth 2
-name dist -type d` → 0) measures the same 53/52/57/44/35 in **0.251s**. Through
`vp run` on this checkout it is 0.595s.

So the conditional authorisation applies. `guard:entry-import-budget` is now a
leg of `ci:release-readiness`, inserted after `guard:source-artifacts` and before
`vp run build` — with the other source-only guards, failing fast. That chain was
the 19 legs the nineteen-green walk at `3f220fb6` read, and this guard's absence
from it is why that walk did not see the red #565 cleared.

`vp run check`, `vp run typecheck` and `guard:publish-drift` are green; no
package `src` changed, so no changeset is owed.

## #567 — two drifted local-review hashes

`guard:attribution-headers` was red on `main` at `4d882ff1`:
`Reviewed local source: mismatch: 2, satisfied: 252`, both in
`packages/solidaria/src/index.ts` and `packages/solidaria/src/utils/index.ts`.

### What was read before anything was re-pinned

The pinned hashes were checked against the content they were pinned to, not
just against today's file:

    packages/solidaria/src/index.ts
      pinned  915f4ecb…  = sha256 of the file at e6384f37^
      now     f6faae18…
    packages/solidaria/src/utils/index.ts
      pinned  692e2517…  = sha256 of the file at e6384f37^
      now     9e644b51…

The pinned hash reproduces the parent of `e6384f37` exactly, which is what makes
`git diff e6384f37^ HEAD` on those two paths the *whole* delta since the review
rather than one commit's worth of it. That delta is four added lines:

    src/index.ts        + two comment lines and
                        + export { openLink, type LinkModifiers } from "./utils";
    src/utils/index.ts  + type LinkModifiers,

Both files are barrels: their content is a list of this repository's own module
names. The added lines re-export a symbol already declared in `utils/dom.ts` and
a type alias beside it; no upstream-derived text entered either file, and
neither file grew anything but a name it already owned. The recorded
classification `local-module-surface` still holds, so this is a re-attestation of
the same review, not a new one.

### Re-attested

Both `contentSha256` values in `scripts/attribution-local-reviews.json` replaced
by hand with the measured hashes above, the shape `d1de1207` used for
`createFocusRestore` under #555 item 8.3. `vp run guard:attribution-headers`
EXIT=0: `254 reviewed local files match their recorded content`, mismatches 0,
and the other four attribution contracts (474 exact headers, 12 headerless, 75
composite, 75 composite headers) unchanged.

`guard:publish-drift` EXIT=0 — the reviews file is a repository script, in no
package's `files`, so no changeset is owed.

Not touched, and worth someone's ticket: the root-barrel re-export this added is
the one #565 narrowed `RouterProvider.tsx` off, so `src/index.ts:713` may now
have no consumer. Removing it would move a hash again and is not this ticket.

## #559 — the API reference renders a checkout path

### The lever, chosen from the probe rather than from the ticket's candidate

`.agents/chain-walk-2026-09-20/probe-typeflags-{viviana-ui,spectrum}.txt` read in
full. `UseAliasDefinedOutsideCurrentScope` unqualifies all 18 distinct renderings
in each register, and on 17 of them it prints exactly the name the checker
reached. On the eighteenth it does not:

    NoTruncation           : import("@proyecto-viviana/solid-stately").SegmentType
    +UseAliasDefinedOutside: DateSegmentType

That rename is not cosmetic here. `solid-stately` declares `DateSegmentType` as
the union of segment kinds (`calendar/createDateFieldState.ts:66`) and exports it
twice — once under that name, once as `SegmentType` (`datepicker/index.ts:16`).
`solidaria-components` separately exports `DateSegmentType` as the segment
*object*: `DateField.tsx:69` imports `DateSegment as DateSegmentType` and
`index.ts:698` re-exports it. So the flag would print, on a published page, a
name that in these same docs already means a different type.

So the qualification comes off here instead of widening the flags, which is the
ticket's stated alternative: `renderType()` in `scripts/extract-api-reference.ts`
strips `import("…").` and keeps the name the checker reached. It throws rather
than emits if any `import("` survives — a rendering we cannot unqualify is a
rendering we do not know is path-independent, and it should stop the extractor
rather than reach a page.

### The reproducibility proof

`scripts/extract-api-reference.test.ts`, three cases, in `test:run` via the
`scripts/**/*.test.ts` include. The load-bearing one builds the same source
twice, at two temporary roots and at two depths below them, and renders the prop
the way `extractRegister` renders every prop:

    depth 0: import("../../shared/thing").Thing
    depth 3: import("../../../../../shared/thing").Thing

Different bytes from identical source — that is the defect, reproduced from
nothing but layout. Both render to `Thing` through `renderType`, and the test
asserts the raw pair differs *and* the rendered pair does not, so it fails if the
strip is removed rather than passing vacuously.

### What the fix changes, and what the RC bump changes

Measured rather than assumed, by importing `buildOutputs()` from both the old
script (`git show HEAD:`) and the new one in one process and diffing the 170
outputs in memory: identical key set, **67 files differing only in `"type"`
strings, 0 differing anywhere else**. So every prop that appears, disappears or
changes count between the committed pages and the regenerated ones is the Solid 2
RC bump, not the rendering change.

### Regenerated, once

`vp run api:extract` — `wrote 84 reference pages`, 7.0s (it is far lighter than
the ticket's estimate; `free -m` showed 9.8 GB available before and the run never
became a memory question). 80 files changed: 78 page JSONs plus
`pages.json` and `exports.json`. `grep -rn 'import(' apps/web/src/data/api-reference` → 0,
`grep -rn node_modules` → 0, where the committed data previously carried
`import("../node_modules/solid-js/types/types").RenderedElement` on every
`children` prop of a collection component. A representative row:

    - "type": "number | boolean | Node | JSX.ArrayElement | (string & {})"
    + "type": "number | boolean | RenderedElement | ArrayElement | (string & {}) | Node | JSX.ArrayElement"

The after-probe, `.agents/api-reference-559/probe-render-after.ts`, walks both
registers the way the conductor's probe did and reports what survives
`renderType` (`.agents/api-reference-559/probe-render-after.txt`):

    packages/viviana-ui    : 11770 scanned, 26 qualified before, 0 with a path after
    packages/solid-spectrum:  8848 scanned, 20 qualified before, 0 with a path after

The before-counts reproduce the conductor's 26 and 20 exactly.

### Handed back: three route files I must not edit

`api:extract` also rewrote the SEO prop count in three
`apps/web/src/routes/docs/components/*.tsx`, which belong to the `public-face`
worktree. That hunk is reverted with `git checkout --` and is **not** in this
commit:

| file            | committed | extraction says |
| --------------- | --------- | --------------- |
| `colorarea.tsx` | 20        | 22              |
| `combobox.tsx`  | 116       | 123             |
| `icon.tsx`      | 20        | 12              |

All three are RC drift by the measurement above, not the rendering fix
(`icon` loses `slot`, `class`, `style`, `aria-label` and four more; they are now
declared outside our `packages/`, so `declaringPackage()` no longer keeps them).
So `vp run guard:api-reference` is EXIT=1 with exactly those three `DRIFT` lines
and nothing else, over `checked 84 reference pages`
(`.agents/api-reference-559/guard-after.out.txt`). The other 81 pages are green.

### On "two checkout paths", honestly

Run: a detached worktree of `b840b763` at a scratch path with `node_modules`
symlinked, hashing `buildOutputs()` rather than writing. New script, both paths:
`3545b4a4…`, 170 files, identical. But the old script also produces one hash from
both paths, `7c1c37ef…` — because the leaked path is *relative*
(`../node_modules/…`), so moving the checkout does not move it. The checkout-path
axis alone does not discriminate, and it would have been a test that passes on the
defect. What discriminates is **layout**, which is what the printer actually
prints, and that is the axis the committed test uses: same source, two depths,
`import("../../shared/thing").Thing` against
`import("../../../../../shared/thing").Thing`. I am recording the whole-repo run
as a confirmation, not as the proof.

### Also found, not fixed, and not #559's

`vp test run scripts/` is 3 failed / 64 passed: all three in
`scripts/check-entry-import-budget.test.ts`, and they are my #566 fallout. The
fixture writes `dist/Provider.js` with no `src/` twin and asserts the dist-era
strings `not built` and `build the packages first`; #566 replaced both the unit
and that message with `resolve to no source file`. Red on `main` at `b840b763`
independently of this ticket, and inside `test:run`, so it is on the ladder.
Named here rather than fixed, per one-ticket scope.

## #569 — setInteractionModality was pending on a ticket that closed

Step 121, the earliest red on the gates ladder. The excuse is shipped away
rather than re-pointed: one re-export, the pending entry deleted, the barrel's
attribution hash re-attested in the same commit, and a changeset.

### Where the line goes, and why there

Upstream is the answer. `react-aria-components/exports/index.ts:289` puts
`setInteractionModality` in its run of sibling re-exports, between
`parseColor, getColorChannels` (280–288) and `ToastQueue as UNSTABLE_ToastQueue`
(290). Our barrel already carries that same run in that same order —
`SSRProvider`, then `parseColor, FormValidationContext`, then
`UNSTABLE_ToastQueue` — so the line goes between the last two, and the barrel
keeps reading in RAC's order. It re-exports from `@proyecto-viviana/solidaria`,
which is where the function is (`interactions/createInteractionModality.ts:319`,
on the solidaria barrel at `index.ts:85`), and which is the layer RAC's
`react-aria/useFocusVisible` corresponds to. No alias: RAC exports the name
unchanged, and so do we.

`vp run guard:rac-export-gap` EXIT=0: `no unlisted RAC value exports are
missing`, 8 ticketed pending exports, now the 7 `NavigationTree*` on the open
#228 and `TokenFieldValue` on the open #118 — every remaining excuse owned by a
ticket that is still open, which is the invariant the guard exists to hold.

### The re-attestation, read before it was re-pinned

`packages/solidaria-components/src/index.ts` is `local-module-surface`, pinned
`d4a4a439…`. That pin reproduces the file at HEAD exactly
(`git show HEAD:… | sha256sum` = `d4a4a439…`), so unlike #567 nothing had
drifted before this edit and the delta since the review is one line, mine:

```diff
+export { setInteractionModality } from "@proyecto-viviana/solidaria";
```

A barrel's content is a list of this repository's own module names, and the
added name is this repository's own function — `setInteractionModality` is
declared in `packages/solidaria/src/interactions/createInteractionModality.ts`,
not copied from upstream; only the *name* is upstream's, which is the whole point
of a parity barrel and is not authorship. Nothing upstream-derived entered the
file, so `local-module-surface` still holds and this is the same review
re-pinned, not a new one. Re-pinned by hand to `b16cb58b…` after formatting, so
the hash is of the committed bytes.

`vp run guard:attribution-headers` EXIT=0, 254/254, the other four contracts
unchanged at 474/12/75/75.

### The changeset

A new named export on a published package. `@proyecto-viviana/solidaria-components`
patch, `.changeset/solidaria-components-set-interaction-modality.md`;
`vp run guard:publish-drift` EXIT=0. `vp run check` green;
`scripts/check-rac-export-gap.test.ts` 6/6.

## #570 — ten paths diverged, nine of them on purpose

Step 160. All ten diffs read in full (`.agents/layer-boundary-570/diffs.txt`,
392 lines), and for each one the history of *both* copies since the baseline's
2026-08-07, which is what separates a register decision from a lost edit.

### The classification, one line of evidence each

Nine have a viviana-ui-only commit and no spectrum counterpart — the register
being itself:

| path                              | commit     | what diverged                                                                 |
| --------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| `breadcrumbs/index.tsx`           | `c7cc7bad` | aria-hidden ChevronIcon separator → a `/` span; `useLocale` goes with it       |
| `image/index.tsx`                 | `8a527ddf` | additive `isPixelated` prop + one `css()` class for `image-rendering`          |
| `menu/ContextualHelpTrigger.tsx`  | `866a47fe` | sixteen `light-dark()` hexes → register tokens, same `css()` block             |
| `notificationbadge/index.tsx`     | `358f3232` | style ramp re-valued to the pixel face at the S rung                           |
| `provider/index.tsx`              | `c2832595` | +3 lines re-exporting `createThemeTransition`                                  |
| `skeleton/index.tsx`              | `f9116a92` | gradient sweep → dithered pseudo-element behind an 8px Bayer mask              |
| `style/index.ts`                  | `fa98aadf` | `"orange"` leaves the status union                                             |
| `textfield/s2-textarea-styles.ts` | `c66f938a` | placeholder ink → `--terminal-dim`                                             |
| `view/index.tsx`                  | `a01c40dd` | +3 lines re-exporting `SceneBackdrop`                                          |

None of the nine touches behaviour. Two are purely additive re-exports; five are
style-macro arguments or `css()` values; `breadcrumbs` swaps a presentational
glyph (`useLocale` was there only to point the chevron, and a slash has no
direction); `style/index.ts` narrows a public union. Collection, focus, keyboard
and validation logic is S2's in every one, so none is the third category.

The tenth is the opposite, and the read is what found it.
`color/ColorSwatchPicker.tsx` has the *spectrum-only* commit `95ce8ad3`,
"colorswatchpicker: apply live size and rounding to child swatches" — 8 lines of
source and a 29-line test, landed on solid-spectrum and never on viviana-ui. The
diff is exactly that fix, inverted: viviana-ui still passes
`size: size(), rounding: rounding()` into the swatch context where spectrum
passes getters, so a viviana-ui ColorSwatchPicker freezes both at creation. A
one-sided edit, and a live reactivity bug in a published package. Re-synced by
copying spectrum's file (now byte-identical), with a `@proyecto-viviana/ui`
patch changeset. `95ce8ad3`'s test sits in `packages/solid-spectrum/test`; there
is no viviana-ui twin, and porting it is ticket #1's dual-copy problem, not this
commit's.

Two notes absorbed as the ticket asked: `switch/index.tsx` back to `identical`,
`test-utils/index.ts` dropped from the baseline (no longer shared). Counts
restated by hand: 608 shared, 524 identical, 84 diverged.

### Where the reason lives, and why there

Not `--write-baseline` — it re-blesses the whole inventory and would have
absorbed the two notes, the nine forks and the one real bug in one silent write.
Every edit here is by hand.

The reason goes **in the baseline, beside the list it explains**, as a
`reasons` map keyed by path, because that is the only place a reader who fails
the guard is already looking. A commit message is not that place: #573 is what
happens when the reason lives in the commit — the other ratchet moved 5/17 under
"fmt drift" and nobody can now say what it meant. A ticket is not that place
either; tickets close.

Recording it is not enough on its own, so the tool that moves the ratchet now
refuses to move it silently. Two rules, both proved by running them:

- `--write-baseline` exits 1 rather than re-blessing any path that moved
  identical → diverged with no reason. Proved by appending a line to
  `packages/viviana-ui/src/Button.ts` and running it: `Refusing to re-bless 1
  path(s) … - Button.ts`, EXIT=1, baseline untouched; reverted.
- the guard exits 1 on a reason naming a path that is not baselined as diverged,
  or an empty one, so a reason cannot outlive the fork it explains. Proved by
  adding `switch/index.tsx` to `reasons`: EXIT=1, `1 recorded divergence
  reason(s) name a path that is not baselined as diverged`; reverted.

The 75 paths frozen before today carry no reason and are not required to; the
interface comment says so, and the rule binds every move after 2026-09-20.

`vp run guard:layer-boundary` EXIT=0: 0 new forks, 0 unbaselined dual paths,
524 identical + 84 diverged. `tsc --noEmit` EXIT=0, `guard:publish-drift` EXIT=0.

## #571 — two ratchets that still described the pre-Solid-2 tree, and one of them twice

Steps 169 and 185. Both gates are seconds; neither needs a build. Three edits,
none of them in a published package, so no changeset is owed.

### 1. The children baseline kept an entry for a site that was fixed

`scripts/idiomatic-solid-children-baseline.json`: the single entry

```json
{ "file": "packages/viviana-ui/src/gridlist/index.tsx", "ident": "resolved", "ordinal": 0, "line": 1054, "ticket": 192 }
```

deleted by hand — no `--write-baseline` in the diff, so nothing else was
absorbed. 29 sites remain, including the solid-spectrum twin at `:1043`, which
still renders the snapshot and stays.

The cause is named rather than assumed: `92ddc52b` ("#542: restore Solid 2
hydration owner parity") replaced
`const resolved = resolveChildren(() => local.children as JSX.Element)` with
`return resolveChildren(…)` in viviana-ui's gridlist. There is no longer a
`resolved` binding at that site, so the entry described nothing. A baseline line
deleted without a named cause is exactly #573.

### 2. `ALLOWED_IMPORTS` had no `@solidjs/web`

`scripts/check-examples-purity.ts`: `/^@solidjs\/web$/` added beside
`/^solid-js(\/[a-z]+)?$/`. Solid 2 moved the DOM runtime out of `solid-js/web`
into its own package, so an import that was already allowed is now spelled
elsewhere — the same permission, not a new one. Six files failed, five of them
the `public-face` worktree's under the owner's exception; none was edited.

Exact match, not the subpath shape beside it, and that is a choice rather than a
constraint: every failing import is the bare specifier, and `@solidjs/web` also
publishes `./server-functions`, `./frames` and `./storage`, which are not "the
framework the page runs on". A subpath import will fail this gate, which is the
point.

### 3. The destructure allowlist entry had stopped allowlisting its own site

Not in the ticket, and a live FAIL at HEAD — the conductor's own capture
`.agents/chain-walk-2026-09-20/ladder-idiomatic-solid.out.txt` carries both FAIL
lines, the destructure at line 7 and the gridlist site at line 47.

`scripts/check-idiomatic-solid.ts:159` allowlists
`solidaria/src/overlays/createInteractOutside.ts` by snippet, matched with
`rel.endsWith(a.file) && code.includes(a.snippet)` (`:194`). The snippet was

```
onInteractOutsideStart, isDisabled } = props
```

which matches nothing in the source any more: `163f4377` ("#531: port the seven
pack packages onto Solid 2 RC") made `isDisabled` a `MaybeAccessor` and moved it
out of the destructure into the effect's tracked function as
`access(props.isDisabled)`. So the entry had stopped allowlisting the site it
names, and the site was being reported as new. Re-pointed at the text that is
there, with the reason restated for the shape the port left.

That is the same failure as the baseline entry above and the same failure as
#573 — a record that stopped tracking the tree — and this one ratchet had two of
them, at opposite ends: a baseline that outlived its site, and an allowlist that
lost its own.

`packages/solidaria/src/overlays/createInteractOutside.ts` is untouched. An
earlier attempt fixed the source instead and was reverted on the conductor's
scope check: editing a published package owes a changeset and its own ticket,
and it is not what this ticket was filed on.

### What the allowlist still permits

Stated here rather than discovered later, and repeated beside the entry itself.
The destructure at `:55` is re-read on every effect run, but the effect's
tracked function reads `access(props.isDisabled)` and the ref, not the two
handlers — so a consumer that swaps `onInteractOutside` without touching
`isDisabled` or the ref keeps the stale handler. Pre-existing, and upstream's
`useInteractOutside` has the same shape, so it is not fixed in this commit.

It deserves a ticket. Reading `props.onInteractOutside` at event time is the
parity-faithful Solid form rather than a divergence — React's hook body re-runs
per render, which is the only reason the identical destructure is safe there —
and the fix is four call sites in one file. It edits a published package, so it
owes a `@proyecto-viviana/solidaria` changeset and a test that a swapped handler
is re-read. Left for the conductor to file.

`vp run guard:idiomatic-solid` EXIT=0: no reactive-props destructures,
children-snapshot baseline holds over 29 sites, 9 reviewed-benign destructures
allowlisted across 1750 scanned files. `vp run guard:examples-purity` EXIT=0:
examples are library-pure across 2 directories.

## #572 — a marker that outlived the mechanism it stood for

Step 219, and the first gate in this sitting that needs `vp run build`. Written
before the build runs rather than after it, so the reading is on the record
independently of what the heavy command returns.

### The reading taken: retire the marker

`scripts/check-jsx-ref-dead-code.ts:62` asserts

```
/setAttribute\(["']aria-labelledby["'],\s*trigger\.id\)/
```

against the bundled `packages/solidaria-components/src/Dialog.tsx`.
`grep -c setAttribute` on that file is 0. `70a8d478` (#555, "resolve the
dialog's title and content ids as slots") made the labelling declarative:
`:295` binds `aria-labelledby={ariaLabelledBy()}`, and `:252-261` is the
fallback the deleted line used to write by hand — `p["aria-labelledby"]` wins,
`aria-label` suppresses, otherwise `triggerContext?.triggerRef()?.id ??
triggerContext?.triggerId`. The behaviour is present and expressed better; the
assertion's message, `package transform dropped …`, blames a build that did
nothing.

The marker was a proxy for "the trigger's id reaches the dialog's
`aria-labelledby`". That is asserted directly at
`packages/solidaria-components/test/Dialog.test.tsx:339` —
`expect(dialog).toHaveAttribute("aria-labelledby", button.id)` followed by
`toHaveAccessibleName("Settings")`, after a real click through
`DialogTrigger`/`Modal`/`Dialog`. That test asserts the outcome; the regex
asserted the mechanism, and the mechanism is gone while the outcome holds. A
source-text second copy of coverage a behavioural test already owns is the
weaker copy — "never the third copy" — so it is retired rather than re-pointed.

Not re-pointed, and the condition for re-pointing was checked rather than waved
past: a source-text marker earns its place only if the build can eat the
behaviour in a way the test misses. Here a JSX-ref rewrite that dropped
`aria-labelledby={ariaLabelledBy()}` would take the attribute off the rendered
`<section>`, and `Dialog.test.tsx:339` reads that attribute off the rendered
node. There is no hole for the regex to cover. If there were, it would be a
finding larger than this ticket.

`/closest\([^)]*alertdialog/` is untouched. It is live at `Dialog.tsx:361`,
inside the id-adoption path that has no declarative equivalent.

### Could the guard have caught its own staleness?

Yes, and cheaply. The markers are asserted against the *bundled* output only, so
"this regex matches nothing" and "the build dropped this" are indistinguishable
to it. Asserting each marker against the **source file** first would separate
them: a marker that matches neither source nor bundle is stale and should say
so, and only a marker present in source and absent from the bundle is the
dead-code defect this guard exists to find. That is the third ratchet in two
days that stopped tracking the tree, after #571's two, and the first one whose
staleness the tool could have reported itself. Not done here — it widens a gate
inside a ticket filed to make it green. Flagged for the conductor.

### The retirement, falsified rather than asserted

Retiring a marker is a claim that coverage does not shrink, so the claim was
tested instead of stated. `aria-labelledby={ariaLabelledBy()}` was removed from
`Dialog.tsx:295` — the exact loss the regex existed to detect — and the suite
run: `Tests 1 failed | 32 passed (33)`, failing at
`Dialog.test.tsx:339`, `expect(dialog).toHaveAttribute("aria-labelledby", button.id)`.
Reverted; the file is byte-identical to HEAD. So the behavioural test catches
what the source-text marker would have, at the outcome rather than the
mechanism, and the retirement removes a duplicate and not a guard.

`vp run build` EXIT=0, 39 tasks, `guard:package-artifacts` PASS over 1053
manifest targets. `vp run guard:jsx-ref-dead-code` EXIT=0: 12 reviewed-safe
direct refs and 6 emitted behavior fixtures retained — 5 markers now, the
`closest(...alertdialog)` one among them.
`vp test run packages/solidaria-components/test/Dialog.test.tsx` EXIT=0, 33/33.

## #573 — bucket 3 first, and bucket 3 says stop

Step 227. No baseline moved, no `--allow-growth` run, no heavy command needed:
`vp run guard:upstream-test-parity` reads source and the vendored oracle and
takes 0.8s, so the packages built for #572 were never a dependency of it. The
thirty added facts are listed by the check run itself
(`scripts/check-upstream-test-parity.ts:729-751` prints them on failure), so the
`--write-baseline` refusal path was not needed to enumerate them and was not
run.

Twelve of the thirty are ROLE rows. Classified one at a time, each against the
source on both sides, before anything was written.

### The seven `role|form` rows are one cause

`checkbox`, `combobox`, `numberfield`, `radiogroup`, `searchfield`, `select`,
`textfield` — all seven in `packages/solidaria-components/test/`, all the same
idiom: a `<form aria-label="… form">` wrapper fetched with
`getByRole("form", { name: … })` purely as a handle to call `requestSubmit()` or
`reset()`. Seven commits, all dated 2026-09-04, all one campaign — `51c9a10f`,
`74d42826`, `9156bc6a`, `49b825eb`, `61f82d72`, `e1ed9cd0`, `7ad95617` — porting
native form validation and reset onto the field components.

Upstream asserts the same behaviour and reaches the form a different way:
`react-aria-components/test/Checkbox.test.js:386`, `checkbox.form.requestSubmit()`
— the DOM property off the input, which queries no role at all. So the divergence
is in how the test grips the form, not in what either side claims the component
is. One fact about our test idiom, recorded once; not seven facts about seven
components.

### The other five ROLE rows, yes/no each

| fact                          | our test asserts the wrong thing? | what it actually is                                                                                            |
| ----------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `tabs\|role\|textbox`         | no                                | a bare `<textarea aria-label="Synopsis">` fixture inside a `TabPanel`, `viviana-ui/test/Tabs.test.tsx:30`         |
| `searchfield\|role\|dialog`   | no                                | `ContextualHelp`'s popover, composed into the field, `solid-spectrum/test/SearchField.test.tsx:281`              |
| `checkbox\|role\|img`         | no                                | the `(required)` asterisk; S2 `Icon.tsx:134,205` sets `role="img"` with a label, ours at `spectrum-icon.tsx:277` |
| `combobox\|role\|presentation`| no                                | the section heading; mirrors S2 `ComboBox.tsx:781` exactly                                                       |
| `select\|role\|presentation`  | no                                | the same heading; mirrors S2 `Picker.tsx:497` exactly                                                            |

Zero of the twelve is our test asserting a role the component should not have.
Three are broader coverage of a shape upstream really does render and its own
tests never assert. Nine are a role that belongs to something else in the render
— a fixture element, or a composed child owned by another component.

### Which makes this a finding about the guard

The extractor takes every `getByRole(…)` in a test file and attributes it to the
component the **file name** names (`RX.role`, `:336-339`; keys from the filename
via `ALIASES`, `:120`). A test file's vocabulary is therefore everything it
renders, not what the component under test is. Nine of twelve ROLE rows are that,
and the stall is not confined to the role bucket: `tabs|aria|aria-hidden` is
`<span aria-hidden="true">icon</span>` scaffolding at
`solid-spectrum/test/Tabs.test.tsx:495`.

The clearest case is not in bucket 3 at all. `switch|aria|aria-checked` comes
from `packages/viviana-ui/test/Switch.test.tsx`, which imports `TabSwitch` and
`SegmentedControl` and does not render a `Switch` anywhere — it is a segmented
control that renders radios. The oracle pairs that file against upstream's
`Switch` tests on the strength of its name, so one component's whole vocabulary
is filed under another's. That is not drift the baseline should absorb.

So, per the hand-over's own condition — "if most of bucket 3 turns out to be the
second kind, stop and tell me" — stopped here. The baseline is untouched
(`sha256` unchanged), nothing was re-blessed, and no test file was edited,
because bucket 3 proved none of them wrong.

What the guard could have reported itself, for #577 rather than here: it knows
which file each fact came from and does not carry it into the fact, so
`switch|aria|aria-checked` cannot say that its source file never renders a
Switch. A fact that carried its file would make a mis-pairing visible in the
output instead of in a reader's head.
### Re-blessed on the conductor's answer

The stop was answered: none of the thirty is a defect in our tests, so holding
the gate red holds it on the oracle's filename attribution rather than on
anything this repository can fix, and the nine mis-attributed rows are stable —
they reproduce identically every run, so they distort the reading and not the
drift detection. Written before the heavy step, as the protocol asks.

### What the re-bless wrote

`vp run build` EXIT=0 (39 tasks), then
`vp exec tsx scripts/check-upstream-test-parity.ts --write-baseline --allow-growth 573`
EXIT=0 and `vp run guard:upstream-test-parity` EXIT=0. Only
`scripts/upstream-test-parity-baseline.json` moved, 87 insertions and 11
deletions; the guard script is untouched and no test file was edited.

The floor is now suspects 187, coverageGaps 43, upstreamOnly 16 — the two
shrinking counts are the ratchet tightening, which it is allowed to do in either
direction as long as it only shrinks. `growthLog` takes its sixth entry:
ticket 573, 30 added suspects, 0 gaps, 0 unmatched suites, so the added facts sit
in the file that names them rather than in a commit subject. Dated `2026-09-21`
because `:701` stamps `new Date().toISOString()`, which is UTC and past midnight
there; the work is 2026-09-20 local, and it is worth knowing before someone
tries to match that date to a commit.

The nine oracle artifacts are in the baseline under this ticket and are not
settled by being there. They are waiting on the conductor's new ticket for
filename attribution; when a fact carries its source file, those rows should
leave the baseline rather than be re-blessed again.

## #578 — the certified suite is 169 red, and the first question is which of them are real here

Written before the first heavy command, so the next worker starts from this
rather than from an empty tree.

What the receipt is: `.agents/certified-2026-09-20/unwaived-failures.txt`, 169
named lines from run 35546816816 at `ef7d4c4d`, eight shards, all completed.
That is the worklist. The merged summary in `merge-ef7d4c4d.log.txt` carries the
component × driver table the counts came from; it does not carry a single
failure message, so nothing in either receipt says *why* any of the 169 failed.
Every cause in this ticket has to come from a run here.

The local hazard, named before it can be mistaken for a finding: this is the
WSL2 host of `tooling.md`'s host note. Chrome for Testing 151 never issues a
compositor frame through SwiftShader, so every browser gate needs
`COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`. D3 already routes
around the worst of it — `clonedElementScreenshot` plus CDP
`Page.captureScreenshot` instead of `locator.screenshot` — and `pixel.ts` calls
`assertCompositorPaintAvailable()` first, so a paint-starved host fails loudly
rather than grading a blank. A local red that does not reproduce with that
switch set is a host artifact and is not one of the 169.

Order of work: `VIVIANA_GATE=1 vp run build` first (the gate builds the tree it
grades and refuses to reuse a preview server), then the single test the ticket
names — `toast` D1 `neutral · dark` — and its diff image, before anything is
grouped.

### Step 1 — `toast` D1 `neutral · dark`, reproduced, and it is not a pixel diff

`VIVIANA_GATE=1 vp run build` EXIT=0 (39 tasks, 0/39 cache hit), then

    npx playwright test certified/toast -g "D1 state matrix.*Toast.*neutral.*dark"

EXIT=1, reproduced on the first attempt with
`COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer` set, so it is not the
host note's paint starvation. Two notes for whoever runs this next: the file
filter is `certified/toast`, not the path printed in the receipt, and this
sandbox redirects the Playwright browser cache, so runs need
`PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright` or the launch fails with
"Executable doesn't exist".

The ticket asks to look at the diff image. **There is no diff image.** The test
never reaches a screenshot: it dies in `beforePanel`, at
`toast.certified.spec.ts:104`, on

    await expect(page.getByRole("alertdialog")).toBeVisible();   // element(s) not found

`openToast` had already got past its own preconditions — the stage reported
`data-comparison-toast-is-active="true"`, the variant trigger was visible, and
Enter was delivered. So this is a D1 row failing for a reason D1 does not
measure, and reading the driver name would have sent the reader to the state
matrix.

A direct probe against a preview build (both stacks, same page, same controls
event) isolates it to one side:

| side  | `[role="alertdialog"]` | `.solidaria-ToastRegion` | `[data-solidaria-top-layer]` | region `Notifications` |
| ----- | ---------------------: | -----------------------: | ---------------------------: | ---------------------: |
| react |                      1 |                        — |                            — |                 present |
| solid |                      0 |                        0 |                            0 |                  absent |

React queues and paints a toast. Solid paints **nothing at all** — not an
empty region, not a portal node. Clicking the trigger twice and waiting two
seconds changes nothing, and neither a console message nor a page error is
emitted. So the Solid toast surface is missing, not mis-styled, and every
`toast` and `toast-icon` row in the receipt (37 of the 169) runs the same
`openToast` in `beforePanel` — D1, D3, D6 and D7 alike. That is one cause
covering 37 rows if a run confirms it, which is step 2's job, not this
paragraph's.

Where it goes next, as hypotheses and labelled as such: `ToastRegion` gates its
whole output on `<Show when={isHydrated() && hasToasts()}>`
(`packages/solidaria-components/src/Toast.tsx:380`), so either the hydration
gate never opens or the region's `visibleToasts()` never sees the queued toast.
The hydration half is the less likely one — Popover rides the same gate and its
`light` rows pass in the receipt — but neither half is proved yet, and nothing
goes into a commit message until one is.

This is very likely the same defect as **#576**, which found the playground
Toast region missing its `Notifications` landmark. The probe above is that
landmark absent on a second surface. The hand-over asked whoever takes either
ticket to read the other; they should be treated as one defect until a run
separates them.

The demo fixture that queues the toast is
`apps/comparison/src/components/solid/fixtures/styled/toast.tsx`, which is
inside the public-face worktree's fence. It is not the suspect — it calls
`ToastQueue[variant]` on the published entry and the React side of the same
file works — but if a fix ever needs to touch it, it needs the conductor first.

### Step 2, batch 1 — three proven causes outside the overlay family

`certified/form certified/tabs certified/togglebutton certified/togglebuttongroup`,
same command shape as step 1, `BATCH1_EXIT=1`, 15 failed of 221, output kept at
`/tmp/578-batch1.out`. The 15 match the receipt's rows for those four
components exactly. Three causes, each read off the run rather than inferred:

- **`form`, 12 rows, one cause.** The Solid form's second grid row is frozen at
  `32px` at every size while React scales it. React reports
  `grid-template-rows: "64px 24px"` / `height: 108px` at `size-s`,
  `"100px 40px"` / `172px` at `size-l`, `"118px 48px"` / `206px` at `size-xl`;
  Solid reports `… 32px` with heights `116 / 164 / 190`. That is why `size-m`
  passes and s/l/xl fail: 32px is the correct value at `size-m` only, so the
  frozen row coincides there. The six D3 rows in this component are the same
  defect seen as a height delta (`Expected: <= 0, Received: 16`), not a separate
  pixel-diff cause.
- **`togglebutton` and `togglebuttongroup` D2 (reduced), 2 rows, one cause.**
  React records two hover transitions — `background-color` and `color`, both
  `150ms cubic-bezier(0.45, 0, 0.4, 1)`. Solid records `[]`.
- **`tabs` D4, 1 row, one cause.** At the moment the keydown is logged the
  roving `tabindex` is swapped relative to React: React has Overview `-1` and
  Parity `0`, Solid has Overview `0` and Parity `-1`.

None of the three is an overlay and none is a screenshot-only artefact, which
settles the ticket's own warning: there are at least three families here.

### Step 2, #576 candidate 2 — ruled out. The region is absent, not renamed

The conductor asked for `[role=region]` alone rather than the class and data
attributes my step-1 probe used, because a renamed-but-present landmark would
hide from both. Same preview build, same page, one click on the Solid trigger,
then a dump of every `[role="region"]` and every `[role="alertdialog"]` on the
page with their names:

| side  | `[role=region]` | `[role=alertdialog]` | `<ol>` | body children |
| ----- | --------------: | -------------------: | -----: | ------------: |
| solid | 0               | 0                    | 0      | 6             |
| react | 1, `aria-label="Notifications"`, `data-react-aria-top-layer` | 1 | 1 | 7 |

The only toast-classed nodes on the Solid side before and after the click are
the two `comparison-toast-stage` wrappers, which are the comparison harness's
own. So this is #576 candidate 1 or 3 — nothing renders — and **not** candidate
2. The accessible name has not moved, so nothing here argues for changing the
library's name or the test's expectation, and no upstream S2 name needs to be
quoted.

Where that leaves the cause: `ToastRegion` is gated on
`isHydrated() && hasToasts()` (`packages/solidaria-components/src/Toast.tsx:379`).
`useIsHydrated()` is the same gate `Popover` and `Modal` use, and both pass in
the same runs, so the hydration half is unlikely. `globalToastQueue` is
constructed with no `wrapUpdate`, so `notify` fans out synchronously — there is
no view-transition deferral to blame on this host. That leaves the queue never
receiving the toast, or `visibleToasts()` never re-reading, or the portal never
attaching. Unproven; next run decides between them. Note that every
`solid-spectrum` Toast unit test renders with `portal={false}`, so the portal
path the browser actually takes is the one with no coverage.

### Correction — the comparison Solid fixture is mine, not the public-face writer's

I logged in step 1 that `apps/comparison/src/components/solid/fixtures/styled/toast.tsx`
sits inside the public-face grant. It does not. The conductor read the grant
back to me: hub `AGENTS.md:65-70` gives that writer `README.md`,
`CONTRIBUTING.md`, `CREDITS.md`, `packages/*/README.md` and **page content**
under `apps/web/src/**` and `apps/comparison/src/**`, and closes with "the main
writer keeps everything else". A certified-harness fixture is machinery, not
page content, so it is mine, as is `registry.ts` and anything else under those
two trees that is not user-visible prose. The blocker was not real and should
not have been written down. It changes nothing about where the fix belongs.

### Step 2 — the toast cause, proven: the view transition never calls its callback

`packages/solid-spectrum/src/toast/index.tsx:327` installs a `wrapUpdate` on the
global queue, so every queue notification fans out to subscribers inside
`startViewTransition`. That function, at **line 317**, reads:

```ts
const viewTransition = doc.startViewTransition(() => fn);
```

The callback **returns** `fn` instead of calling it. A returned function is not
a thenable, so the transition resolves immediately and the update callback never
runs: `createToastState`'s subscriber is never invoked, `visibleToasts()` stays
empty, and the `<Show when={isHydrated() && hasToasts()}>` at
`solidaria-components/src/Toast.tsx:379` never opens. Nothing renders — which is
exactly what both probes saw.

It is proved by A/B on the same page and the same build, with no rebuild and no
source change, by deleting `document.startViewTransition` in an init script so
`startViewTransition` takes its own `else` branch and calls `fn()` directly:

| `document.startViewTransition` | `[role=region]` | `[role=alertdialog]` | `[data-solidaria-top-layer]` |
| ------------------------------ | --------------: | -------------------: | ---------------------------: |
| present (`function`)           | none            | 0                    | 0                            |
| deleted (`undefined`)          | `"Notifications"` | 1                  | 1                            |

That also settles why every Toast unit test is green — `vp test run packages/solid-spectrum/test/Toast.test.tsx`,
EXIT=0, 39 passed. jsdom has no View Transitions API, so the suite only ever
exercises the `else` branch. The browser takes the branch nothing covers.

**One defect, four witnesses.** The certified rows for `toast` (25) and
`toast-icon` (12) and the two `a11y:smoke` failures of #576 are one cause seen
from four places, not two defects. The witness I proved is the comparison
Solid toast stage in a real Chromium; the other three are re-runs, not
arithmetic, and they stay ungraded until those runs exist.

It is also not host-specific. The WSL compositor note explains a stalled
animation, not a callback that is never called; this fails wherever the View
Transitions API exists, which includes GitHub's runners.

Two consequences beyond the region: `ToastContainer`'s expand and collapse go
through the same `startViewTransition`, so they are dead in a browser too, and
every certified driver for this component is blocked behind `beforePanel`, which
is why the whole 37 rows fall together.

### Step 3, cause 1 — the fix, both copies, and the coverage gap that hid it

`grep -rn '=> fn)' packages/*/src/` returns exactly two lines and nothing else:
`packages/solid-spectrum/src/toast/index.tsx:317` and
`packages/viviana-ui/src/toast/index.tsx:320`, character for character in two
separately published packages. Both are fixed in this commit; neither is fixed
alone.

The repair is not the naive `doc.startViewTransition(fn)`. The browser snapshots
when the callback returns, and Solid's DOM write need not have landed by then —
upstream reaches for `flushSync` inside that callback for exactly this reason.
So the callback calls `fn()` and then flushes, in the `try/catch` shape
`createToastState` already uses, since `flush` is forbidden inside effect apply.
`fn` alone would have restored the landmark and still let the transition capture
a stale frame, which would have read as a second defect.

The coverage gap is the point: jsdom has no View Transitions API, so all 39
existing Toast tests took the synchronous `else` branch and proved nothing about
the branch a browser takes. Both packages now carry a regression test that
installs a faithful `document.startViewTransition` stub — one that actually
invokes its callback and resolves — and asserts the `Notifications` landmark.
Verified as guards, not decoration: with the two source lines stashed,
`vp test run packages/solid-spectrum/test/Toast.test.tsx packages/viviana-ui/test/Toast.test.tsx`
is EXIT=1 with exactly those two tests failing, 2 failed / 39 passed; with the
fix it is EXIT=0, 41 passed. `viviana-ui` had no Toast test file at all before
this.

Not extracted, ticketed instead. The two toast modules are 1162 and 1248 lines
and differ on 118 lines after whitespace folding — about ninety per cent of the
module is duplicated, not just this helper, and `startViewTransition` closes
over each package's own `ensureToastAnimationStyles` and `globalReduceMotion`.
Lifting twenty lines while a thousand stay doubled would be the gesture, not the
fix. Ticket filed for the module.

### Step 3, cause 1 — the parity shape, and the run that closes 37 rows

Two corrections to what I first wrote, both the conductor's, both taken.

The repair is not my hand-rolled `fn(); try { flush() }`. Upstream answers it
exactly — `@react-spectrum/s2` 1.7.0, `dist/private/Toast.mjs:69`:

```js
let viewTransition = document.startViewTransition(() => flushSync(fn));
```

so the provenance of the defect is exact: `() => flushSync(fn)` was ported as
`() => fn`, the wrapper dropped and the call with it. Solid 2 has the same
primitive — `flush<T>(fn: () => T): T`, the second overload in
`@solidjs/signals` 2.0.0-rc.9 `dist/types/core/scheduler.d.ts:338`, re-exported
from `solid-js`, so no new dependency. Both copies now read
`doc.startViewTransition(() => flush(fn))`, which mirrors upstream line for line
rather than inventing a Solid-flavoured variant, and forecloses the stale-frame
failure my version would have left: the landmark appears, the transition
captures the old frame, and it reads as a second defect.

And the first re-run graded a tree nobody built. `vp run build` (EXIT=0) does
**not** rebuild `apps/comparison`; its `dist/_astro/toast.*.js` was still
22:34 while the build finished after 23:50, and the certified run was 37 failed
against the old bundle. `vp run comparison:build` is the one that matters
(EXIT=0, 91 pages), after which the bundle reads
`startViewTransition(()=>n(e))` — the fix, minified — rather than the old
`()=>e`. Worth remembering next to the standing note that `vp run build` does
not rebuild `apps/web` either: the same is true of the comparison app, and a
gate that only previews will happily serve a stale `dist`.

The run, on the rebuilt tree:

```
cd apps/comparison && PLAYWRIGHT_BROWSERS_PATH=… VIVIANA_GATE=1 \
  COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer npx playwright test certified/toast
→ EXIT=0.  Totals: 37 passed, 0 failed, 0 skipped, 0 waived, 0 flaky  (2.3m)
```

37 of 37, which is every `toast` and `toast-icon` row on the receipt: 25 + 12.
Two of the four witnesses are now proved — the comparison Solid stage and the
certified suite. #576's two `a11y:smoke` failures remain ungraded until that run
exists; they are not counted here.

**169 → 132.** Unit side re-run on the final shape: EXIT=0, 41 passed, and
`vp run typecheck` EXIT=0.

Duplication discharged by ticket, not by gesture: **#580**, the two toast
modules at 1162 and 1248 lines differing on 118 after whitespace folding.

## #581 — the `attr:` namespace on both date picker buttons, 44 certified rows

The conductor's census named the cause from CI; this seat proved it locally and
fixed it. Eight props in `packages/solidaria-components/src/DatePicker.tsx`
(`:1068-1071`, `:1146-1149`) were `attr:data-focused={isFocused() ? "true" :
undefined}`. They now read `data-focused={dataAttr(isFocused())}`, which is what
the other 34 `data-hovered` sites in this package already write, and `dataAttr`
was already imported and used two lines above each block. `grep -rn 'attr:'
packages/*/src/ apps/*/src/` returns nothing.

Runs, each after `VIVIANA_GATE=1 vp run comparison:build` — the stale-`dist`
hazard from #578 applies here too, `vp run build` does not rebuild
`apps/comparison`:

- `certified/datepicker certified/daterangepicker` — **110 passed, 4 failed**.
  The 4 are exactly `D2 motion — DatePicker motion › open · open-enter`, its
  reduced twin, and the two DateRangePicker equivalents. So all 44 rows the
  census attributes to this defect are green.
- Mutation check, rebuilt both ways: with the eight lines reverted,
  `certified/datepicker.certified -g "D1 state matrix"` is **4 passed, 6
  failed**; with them restored, the same slice is **10 passed, 0 failed**.
- `packages/solidaria-components/test/{DatePicker,DateRangePicker}.test.tsx` —
  **72 passed**, including one new guard per suite asserting the trigger carries
  `data-focused` and no attribute name beginning `attr:`. Guards mutation-checked
  the #578 way: put the eight lines back to `attr:` and exactly 2 of 72 fail,
  both of them the new tests.
- `vp run typecheck` — clean.

The motion pairs do not ride along, and they are not a keyframe value.
`packages/solid-spectrum/src/popover/index.tsx:118-130` and
`@react-spectrum/s2@1.7.0/src/Popover.tsx:123-132` are the same table to the
digit: `top` enters at `4`, `bottom` at `-4`. Ours records `0px -4px` and
React's `0px 4px`, so the two sides disagree about which placement the popover
is in at capture, not about what that placement animates to. Filed as **#582**
rather than folded in here.

Standing: 169 → 132 after #578's first cause, → **88** after this.

## #497 — started, proved, not landed

Status: **abandoned uncommitted**, nothing in flight;
`packages/solid-spectrum/src/combobox/index.tsx` is clean at `eb75ee0e`. The
candidate patch is kept outside the tree.

Restoring both halves of #497 in combobox — `isFocused: baseColor("accent").isFocusVisible`
on `comboBoxCheckmark` and `isFocusVisible: renderProps.isFocused || renderProps.isFocusVisible`
on the option — makes the whole combobox-list block green (26 passed: D1 6, D3
6, D7 2, D9 6, D10 2, plus D5/D6/D8), and the mutation check is exact: reverted,
the same slice is 5 passed / 22 failed, and the 22 are the census's 22 to the
row.

It also turns `combobox-field` D13 `open-arrow-enter-reopen-scroll-escape` red,
which is green on `main`: step 0 (click trigger), mismatch `0.0504`
(1283/25440), reproducible alone and identical across runs. Bisected, each half
fails it on its own — the checkmark half at 50/25440 px in a 10x9 box at
(18,46), which is the checkmark glyph and nothing else; the option half at the
full row band.

So two live-React oracles disagree about the same pointer-opened list, and the
spec header argues D13's side (`combobox.certified.spec.ts:50-53`: a pointer
open "must not read as focus-visible"). The reading that would reconcile them —
row focus-visible from the page-global keyboard modality ANDed with virtual
focus, as the field group does at `:672` — is worse, 4 passed / 23 failed with
D1 and D3 all red again plus D6, which rules it out. Handed back rather than
landed: it trades a proven green for a proven red.

## #585 — picker list, 21 rows

The brief named the wrong site. `pickerListBox` already mirrors upstream: Picker
uses ComboBox's `listbox` style, not `menu`, and that has no padding and the
same overflow split. Tried the brief's patch first and measured it: D3/D8 green,
D1/D9/D10 red on a new diff (React listbox `padding: 0px`, ours `8px`) —
reverted. A DOM probe found the cause: `SelectListBox` ignored the parent
Virtualizer, so rows sat in flow, edge to edge, with no ListLayout inset.
76f0e267 fixed this for ComboBox only. Copied the ComboBoxListBox wiring into
`Select.tsx`.

- `certified/picker.certified`: 60 passed / 2 failed (both `Picker trigger`
  D13, #584, red before too).
- Mutation, `-g "Picker list"`, rebuilt each way: defect 5 / 21 failed (D1 6,
  D3 6, D8 1, D9 6, D10 2); restored 26 / 0.
- Unit twin guard in `Select.test.tsx`: defect back, 1 of 87 fails, the new
  one. Select + ComboBox + Picker suites 216 passed; typecheck clean.

## #584 — picker trigger attributes, slice landed, D13 still red

Root `data-*` through `dataAttr`; trigger drops `data-open`, takes
`data-focused` from its own ring; option `data-focus-visible` from its own
ring (RAC `useOption`). `certified/picker` 60/2, both D13, now failing at
open-arrow step 0 `focus` and keyboard-only step 1 `events` instead of `dom`.
Mutations: trigger+option halves back → both D13 at `dom`; raw boolean on root
`data-open` → unit reads `""`. Three causes left, in ticket 584: pointer-open
focus is our `createInteractionModality` ignoring untrusted clicks (upstream
does not, and D5 depends on it), React's dialog focusin/focusout before the
option on keyboard open, and overlay mid-entry opacity (the #582 family).
Ticket stays in-progress. The comparison dist was last built from the
mutated source; rebuild before the next certified run.

## #583 — handed back, conflicts with #484

The media branch the ticket says to delete was added by `1af6eb71` to close
#484, whose owner-delegated ruling is that upstream is not the ceiling for
reduced motion; actionbutton's D2 reduced already has per-stack contracts, the
toggle specs do not. Either reverse #484 or extend the split to the two toggle
specs. Not edited; decision recorded in ticket 583.

## popover-surface — the fixture built the popover outside its Provider

The census's cause (set the colour scheme on the portal root) was already
done: `solid-spectrum` Popover spreads `setColorScheme()` from `useTheme()`, as
upstream reads `ColorSchemeContext`. The live dark case carried the
`"light dark"` variant, so `useTheme()` returned the default. `e4c3b26b`
turned the fixture's routed content from a thunk into an eager
`createComponent(Keyed, …)` in the demo scope, which runs outside the
`SolidSpectrumProvider` owner; only the portaled surface can tell. Made it a
thunk again, and the same in `breadcrumbs.tsx`, whose collapsed menu portals.
The existing fix this repeats is the `hc()` thunk pattern the other fixtures
use.

- Defect in, same build otherwise: `certified/popover.certified` 13 failed /
  14 passed (D1 6 dark, D3 6 dark, D7 placement-top dark).
- Fixed: 27 / 0. With breadcrumbs: 29 passed, 1 skipped; the skip is the
  July `knownDivergence` on D6 `overflow`, not new.

## form, 12 rows — the button family never took the Form's size

`Button.tsx` merged a `size: "M"` defaults literal under the props before
`useFormProps`, so the proxy found `size` set and never consulted the Form;
ActionButton, ToggleButton and LinkButton carried the same literal and did not
call `useFormProps` at all. Upstream (`s2@1.7.0` Button `:414-417`, LinkButton
`:539-543`, ActionButton `:333-334`, ToggleButton `:77-78`) applies it after
context and defaults at destructuring. All four now drop the literal (the
read-time `?? "M"` already existed) and wrap the context merge in
`useFormProps`. Unticketed; the census names it untracked.

- `certified/form.certified` 44 / 0. Defect back and rebuilt: 12 failed / 32
  passed. With button, actionbutton, togglebutton, togglebuttongroup: 286 / 2,
  the 2 being D2 reduced hover-transition on the toggle specs, #583's rows.
- Unit guard in `Form.test.tsx`, one case per button: defect back, exactly the
  4 new ones fail of 17. Button family + Form suites 93 passed, SSR 9, hydrate
  9; typecheck clean.

## #139 — pack-script deletes refuse paths outside the temp directory

One helper, `scripts/scratch-dir.mjs`, for the three env paths in both
scripts: strictly under the real `tmpdir()`, not holding and not inside the
repository, symlinks followed. The unset stage is `mkdtempSync`; no literal
`/tmp` left. `scripts/scratch-dir.test.ts` 8 / 0; old scripts back, the three
per-variable tests fail. A default `pack-local-chain` run still packs all
seven. Merged.

## 2026-09-21 — #574 postcard currency: ancestry plus coverage

- Shape 1, as the conductor decided. `certifiedSuitePostcardCurrency` replaces
  equality. It is current only when the revision is in the clone, is an ancestor
  of HEAD, and no covered path has changed since. The evidence file itself is
  excluded, and that exclusion is the witness.
- Covered: `packages/*/src/**`, `apps/comparison/src/**`,
  `apps/comparison/e2e/**`. READMEs are excluded. The `certification-gates`
  checkout at :47 now has `fetch-depth: 0`.
- Tests: 15 passed, including a real temp git repo test. Mutations: drop the
  exclusion and 1 fails, the witness test; restore equality and 4 fail.
- `comparison:report:parity:strict` still exits 1, with the postcard as its sole
  gap: 2575 covered paths changed since `0f1e1198`. Closing it needs a fresh full
  certified run (#547/#194). The ticket is in-progress, not merged.
- Also `d6b2f2fd`: the typecheck error TS7016 in my own `scripts/scratch-dir.test.ts`
  (from `80c429ec`) is fixed with the siblings' `@ts-expect-error` idiom.
  `vp run typecheck` is clean.

## 2026-09-21 — #194 slice 4: the strict baseline only shrinks

- `parity-strict-baseline.ts` gains `staleBaselineSlugs`. `report:parity:strict`
  now fails on any baselined slug whose gap no longer occurs, and names the entry
  to delete. Growth is pinned by a test that holds every section to #85's
  frozen nine.
- Planted `button` in `missingControlGroups`: the old report passed it silently;
  the new one fails naming it, and the pin test fails 1 of 5. All 27 real entries
  still occur.
