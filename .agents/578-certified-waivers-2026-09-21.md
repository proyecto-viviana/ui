# #578 — the certified reds, their class, and the waiver list

2026-09-21. Base `8361daba` on `main`. Docs, tickets and one JSON file; no
package source touched.

> **Corrected 2026-09-22 by `.agents/578-review-fix-2026-09-22.md`.** Three
> figures below are wrong or stale: the list is now **five** entries, one per
> case, not three; `expires` is `2026-10-21`, not `2026-12-31`; and the local
> case inventory is **2177**, not 3065 — measured from Playwright's own
> `--list`, and equal to `certified-case-floor.json`'s `total`. The patterns
> are also anchored at both ends now, not on the case id alone.

## What the run says

Certification Gates **35668806426**, head `b22a44eb`, push event. Two jobs read
by id rather than by summary page:

- `certification-gates` **106560418098** — steps 1–37 each `success`, step 31
  `guard entry-import-budget` `success`, step 37 `docs:check` `success`, first
  `failure` at step 38 `comparison parity (strict)`. Read with
  `gh api repos/:owner/:repo/actions/jobs/106560418098`.
- `certified report` **106565094355** — `Run status: failed`,
  `Totals: 2146 passed, 27 failed, 4 skipped, 0 waived, 0 flaky`, and a
  `### Unwaived failures` list of 27 lines.

Same job's per-component table: **107 components**, 5 of them with a non-zero
failed column, so 102 are green.

| component           | drivers                       |   n | class     | owner |
| ------------------- | ----------------------------- | --: | --------- | ----- |
| `combobox-list`     | D1 6, D3 6, D9 6, D7 2, D10 2 |  22 | behaviour | #497  |
| `picker-trigger`    | D13 2                         |   2 | behaviour | #584  |
| `togglebutton`      | D2 1                          |   1 | behaviour | #583  |
| `togglebuttongroup` | D2 1                          |   1 | behaviour | #583  |
| `tabs`              | D4 1                          |   1 | behaviour | #609  |

**None of the 27 is crash-class.** Each is a compared difference against the
pair oracle; nothing throws and nothing fails to render.

The tabs row is a true failure, not a flake: shard job **106561030691** shows
`e2e/drivers/events.ts:124:9 › D4 event sequence — Tabs › horizontal-regular ·
arrow-next-from-selected` failing on the first attempt and on retries #1 and
#2, with a two-line diff — Overview `"0"` against `"-1"` and Parity `"-1"`
against `"0"` at `events.ts:143`. That is #609, opened here.

## The waiver list

`apps/comparison/e2e/certified-waivers.json` held `[]`. It now holds three
entries, each ticket-backed with the board's own state and
`expires: 2026-12-31`, standing for the next release:

| ticket | cases matched                                                                               | recorded state |
| ------ | ------------------------------------------------------------------------------------------- | -------------- |
| #584   | `D13 journeys — Picker trigger › D13 journey — open-arrow-enter-reopen-scroll-escape`, `… — keyboard-only` | `in-progress`  |
| #583   | `D2 motion (reduced) — ToggleButton › default · hover-transition`, `… — ToggleButtonGroup › default · hover-transition` | `open`         |
| #609   | `D4 event sequence — Tabs › horizontal-regular · arrow-next-from-selected`                  | `open`         |

Every selector was re-read against the spec files at HEAD, and every pattern is
anchored on the case id with `$`. Breadth, against the 3065-case local
inventory: 2, 2 and 1 matches and nothing else. That check matters because
`evaluateCertifiedWaivers` has no unused-waiver problem kind — an over-broad
pattern would silently swallow a future red.

No waiver for the 22 ComboBox rows: one defect, owned by #497, which is still
`status: next`. No waiver for the certified tooltip row either — it passes and
reddened an earlier run only through `flakyBudget: 0`; that is #608, green in
this run.

## Commands, at this commit

| command                                                                        | result                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------- |
| `vp run comparison:test:certified-waivers`                                     | 3 files, 52 passed, exit 0                        |
| `vp run comparison:guard:certified-waiver-tickets`                             | `3 waiver(s) … agree with the board`, exit 0      |
| waiver list against the run's 27 lines                                         | 3 loaded, 0 load problems, 5 waived, 22 unwaived, `waiverGateFails: true` |
| `vp run docs:generate`                                                         | regenerated `roadmap.md`, `status.md`, exit 0     |
| `vp run docs:check`                                                            | `docs:check passed`, exit 0                       |

Refusals, each from a scratch fixture and through the mechanism that owns it —
they are not the same mechanism, which is itself worth knowing:

- guard, off-board ticket → exit 1,
  `ticket-missing: waiver ticket #9999 is not on the board`.
- guard, recorded state the board moved past → exit 1,
  `ticket-stale: waiver ticket #583 records in-progress; the board says open`.
- verdict, closed ticket → `ticket-closed: waiver ticket #609 is verified;
  remove the waiver`, `waived 0, unwaived 1`, gate fails; same for `merged` and
  `closed`. The guard alone would pass this, because the record agrees with the
  board.
- verdict, case id renamed to `arrow-next-from-last` → unwaived, gate fails.
- verdict, `expires` moved to `2026-09-20` → `expired`, `waived 0`, gate fails.

## Bookkeeping in the same commit

- #578 re-headed from 169 to 27, with the 169 and 88 tables kept as dated
  snapshots and the waiver rule and its owner quotes recorded.
- #547 re-headed to the `rc` dist-tag; #568, #600 and #544 carry the four
  delegated calls with the owner quoted verbatim from the session record. The
  defaults themselves are the conductor's stated defaults the owner accepted,
  and they are written as such.
- #609 opened for the Tabs roving-`tabindex` frame.
- #587: a forward-only note saying what its `verified` does and does not prove —
  the guard's step is CI-proved, its unit test is not, because `test:run` lives
  only in `ci:release-readiness` and Release Readiness is still
  `disabled_manually`. State left at `verified`.
- #594 widened from one site to the whole nine-site census: 9
  `createElement("style")` sites in `packages/*/src`, exactly one nonced, and
  `getNonce` not exported from `solidaria`'s `./utils` barrel.
- `certification-debt.md` carries the 27 and the waivers, with the older
  122/124 counts kept as the 2026-09-18 snapshot the group map is written
  against.

## Not done

- `.agents/drafts-548/claims.md` — untracked and another session's; not read,
  not staged, not edited.
- `ui/AGENTS.md` — left as written. Its last local rule already states the
  `public-face` seat and carries no unrecorded owner attribution.
- Nothing pushed. `certified report` still exits 1 at this revision, on #497.
