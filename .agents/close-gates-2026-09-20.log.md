# close-gates — 2026-09-20

Writer seat, ticket #553 (slices 0, 4–10) and #194 (slices 1–3).
Brief: `.agents/close-gates-2026-09-20.task.md`.

## Now

Slice 0 — the peers allowlist and the always-run audits. Slice P is closed:
`test:run` is green apart from two snapshots, now repaired. Third writer;
brief `.agents/close-gates-2026-09-20.resume.task.md`.

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
