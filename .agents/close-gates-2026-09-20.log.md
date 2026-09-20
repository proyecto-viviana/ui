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
