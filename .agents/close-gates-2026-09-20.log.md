# close-gates — 2026-09-20

Writer seat, ticket #553 (slices 0, 4–10) and #194 (slices 1–3).
Brief: `.agents/close-gates-2026-09-20.task.md`.

## Now

Slice 4 — `guard:release-prerequisites` enumerates from the tree. Slices P, 0,
1, 2 and 3 are closed. Third writer; brief
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

Slice P is done. Nothing from it goes to `## Left red`.

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
