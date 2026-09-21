---
id: 578
type: task
title: "The certified suite is 169 red on GitHub's runners, concentrated in thirteen components"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor on 2026-09-20 while checking #194's stage-3 obligation, by reading CI rather than by running anything. `Certification Gates` is **active**, not disabled, and has been running on every `main` push; almost every run is cancelled by the next push, and run 35546816816 at `ef7d4c4d` is the only recent one where all eight certified shards completed. Its merged summary: `Run status: failed`, `Totals: 2004 passed, 169 failed, 4 skipped, 0 waived, 0 flaky`, against a recorded postcard of 2170 passed / **0 failed** at `0f1e1198` (2026-08-21). The `certified report` job failed at `Merge certified reports`, which is #194 slice 1 working exactly as built - a non-pass status the summary does not explain is now a hard failure instead of a green merge of zeros. Receipts `.agents/certified-2026-09-20/merge-ef7d4c4d.log.txt` and `unwaived-failures.txt`, 169 named lines",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "handed to the close-gates writer after #573 merged (`2b444a89`), ahead of #574, #575 and #576, on this ticket's own argument: those three are steps of the `gates` job and each is smaller, while this is the `certified` job and it is the evidence #547 asks for. The hand-over asks for steps 1 and 2 only - one failure reproduced and understood, then the 169 grouped by proven cause with the ungraded remainder named as ungraded - and a report back before any fixing at scale. Four rules were given priority in the brief, in the order they are easy to break: reproduce before theorising, no waiving, one cause per commit with its re-run in the message, and never update a screenshot baseline to make a test pass. The count in this ticket is from run 35546816816 at `ef7d4c4d`; the run in flight when this was handed over was `1d7551cb`, whose gates job failed at step 36 - the gate #573 has since closed - so the first revision that can walk past step 227 is this commit",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "taken by the close-gates writer. Steps 1 and 2 only, per the hand-over: one failure reproduced against its own diff image, then the 169 graded by proven cause with the ungraded remainder named as ungraded, and a report before any fixing at scale. Local runs use `COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer` (`tooling.md` host note: Chrome 151 on this WSL2 host never issues a compositor frame through SwiftShader), so a local red needs that switch ruled out before it is called a real failure",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Three findings land here. `578-census/toast-browser-branch-stub-sync`: the new toast tests stub `startViewTransition` synchronously, so the branch they claim to cover is not exercised the way a browser runs it. `578-census/attr-namespace-unguarded`: nothing stops the `attr:` namespace from returning - the fix that closed #581 is two per-component assertions, not a guard. `board-truth/581-merged-below-its-bar`: #581 is merged although its Done-when demands zero failures and four remain; two of the four are #584's. The census this ticket owns is the place those rows are accounted for.",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`, finding `r2-guards/r2-guards-3`, high, confirmed: the census commit `65254a8c` is stale on arrival. It reports CI run 35558449632, head `eb75ee0e`, created 2026-09-21T03:42:53Z and finished 04:06:14Z, but was committed at 13:46:11Z with 18 commits in between (`git rev-list --count eb75ee0e..65254a8c`), and it is written in the present tense - where every row now belongs, the largest untracked block left, this table is the whole distance - so a reader takes it for current state. It is not: at `65254a8c` the form block it calls never ticketed was fixed by `7e93d238` at 06:18:18Z, the calendar block it calls ungraded by `6e43c436` at 07:11:38Z, and the three it closes with as ticketed and cheap are #585 merged, #584 in-progress and #583 open because `a32e6bab` handed it back over #484's owner ruling. The finding's own times mix local and UTC and the gap is three hours wider than it reads; the UTC figures here were re-measured with `TZ=UTC git log --date=format-local`. Fix: re-head the table as a snapshot of run 35558449632 at `eb75ee0e`, add a landed-since column naming `495582e9`, `413b2f23`, `f8e5833e`, `7e93d238`, `6e43c436` and `6ad3d12d`, move #583 out of cheap into owner-blocked, and let the next Certification Gates run on the pushed tip supply the roster instead of re-deriving it by hand",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "placed at stage S0-e of #544's path, which had named this ticket only in a history note although the job it owns is blocking. Re-measured at the last run, 35560076342 at `96376e9a`: the `certified report` job failed, its `Merge certified reports` step reported `Run status: failed`, `2085 passed, 88 failed, 4 skipped, 0 waived, 1 flaky`, and exited 1. The step carries no `continue-on-error` (`certification-gates.yml:691`) while the eight shards do (`:646`), and the job's own summary row calls it Blocking (`:402`), so the release condition cannot be met without it. The path now states what makes the job exit 0, because `certification-debt.md` on its own does not: `merge-certified-reports.ts` exits 1 while `waiverGateFails` is true, which it is while any failure is unwaived (`apps/comparison/scripts/certified-waivers.ts:269-271`), and no workflow, script or `package.json` entry reads the debt file. So a named-debt failure ships as a `certified-waivers.json` entry - `[]` today - with an open board ticket and a future `expires`, plus its debt entry; the owner decision on #544 authorises the debt, the waiver is what the gate reads. Work item 3 is still the default: fix by cause, waive only what an owner call names as deliberate. This ticket also supplies the revision #574's postcard pin needs, so S0-d's widened rule lands first",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the roster this ticket carries is out of date and the correction is measured, not guessed. Against the 88 failures of run 35560076342 at `96376e9a`, the first complete run under the new shard shape - 35638122333 at `45714230`, all eight shards run and merged - reports `Totals: 2146 passed, 27 failed, 4 skipped, 0 waived, 1 flaky`. Its 27 unwaived failures, counted from the report job's log (job 106467836508): `combobox-list` 22 (D1 6, D3 6, D7 2, D9 6, D10 2), `picker-trigger` D13 2, `tabs` D4 1, `togglebutton` D2 1, `togglebuttongroup` D2 1 - five components, not thirteen. Run 35646778662 at `d1c5f4b3` fails the same four shards. Which of these are crash-class is the census's call and is not decided here; by the owner's soft-launch cut on #544 the crash-class subset is in the RC and the rest is deferred, and nothing is waived - `certified-waivers.json` is `[]`",
    }
---

## Why this is filed above the remaining gate reds

#547 asks for "a certified run whose result is recorded, not waived", and the
owner's decision on 2026-09-20 was that the evidence comes from re-enabling
Certification Gates and running it in CI. That has happened. The answer it
returned is 169 failures.

So the gap between here and the release is not four gate tickets. It is four
gate tickets **and this**. Every one of #573, #574, #575 and #576 is smaller
than this ticket, and none of them is on the critical path in the way this is:
a green `gates` job with a 169-red certified suite is not a releasable
revision under #547's own words.

## The shape, counted from the run's own failure list

169 unwaived failures over 37 component × driver rows. By driver:

| driver     | failures | what it is        |
| ---------- | -------: | ----------------- |
| D3         |       61 | pixel diff        |
| D1         |       50 | state matrix      |
| D9         |       24 | forced colors     |
| D7         |       19 | contrast          |
| D2         |        6 | motion (reduced)  |
| D10        |        4 | RTL state matrix  |
| D13        |        2 | journeys          |
| D4, D6, D8 |   1 each | event, ax, target |

By component:

| component       | failures |     | component                                                 | failures |
| --------------- | -------: | --- | --------------------------------------------------------- | -------: |
| toast           |       25 |     | popover-surface                                           |       13 |
| daterangepicker |       22 |     | toast-icon                                                |       12 |
| datepicker      |       22 |     | form                                                      |       12 |
| combobox-list   |       22 |     | calendar                                                  |        6 |
| picker-list     |       21 |     | rangecalendar                                             |        5 |
|                 |          |     | picker-trigger, datepicker-motion, daterangepicker-motion |   2 each |
|                 |          |     | togglebutton, togglebuttongroup, tabs                     |   1 each |

111 of the 169 are D1 and D3, which are both screenshot drivers, and ten of the
thirteen components render their content in an overlay.

## What that pattern is worth, and what it is not

It is worth an ordering, not a diagnosis. **Do not write "one cause" into a
commit until a run proves it.** Two observations cut against the easy story:

- `form` fails D1 and D3 at `size-s`, `size-l` and `size-xl` in both schemes
  and **passes at `size-m`**. A portal that does not render does not pass at one
  size. That is a size-dependent layout change.
- `tabs` D4 is an event-sequence failure and `togglebutton` D2 is motion.
  Neither is a screenshot.

So there are at least three families here, and the overlay screenshot family is
merely the largest. The standing memory that portaled overlays with
`light-dark()` fills need `setColorScheme()` on the portal root is a candidate
for that family and is a hypothesis, not a finding.

These are regressions, not old debt: the same suite was 0 failed at `0f1e1198`,
and the total only moved 2174 → 2177. Everything in this list appeared during
the Solid 2 port window.

## Work

1. Reproduce one failure locally before theorising about 169. Take
   `toast` D1 `neutral · dark` — the largest component, the cheapest driver —
   and look at the actual diff image, not at the test name.
2. Group the 169 by proven cause, not by apparent family. The receipt is the
   worklist; a row leaves it only when a run says why it failed.
3. Fix by cause. Each cause owes its own commit, its own re-run of the affected
   spec, and a changeset if it touches a published package.
4. Anything that is a deliberate Solid 2 divergence rather than a defect goes to
   `certification-debt.md` **by name**, with the owner's call recorded. It does
   not go to `certified-waivers.json` without a ticket and an expiry, which that
   file already enforces.

## Done when

The certified suite on one revision reports zero unwaived failures, or every
remaining failure is named in `certification-debt.md` with an owner decision,
and the postcard in `apps/comparison/src/data/certified-suite-evidence.ts` is
re-pinned to that revision — which is #194's Done when, reached from this side.

## Relationship

Child of #544, and the thing stage 3 of
`.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md` was pointing at without knowing
its size. Blocks #547 directly: this is the "recorded, not waived" evidence.

Closes the open question in #194, which asks for the certified record pinned to
HEAD — it cannot be, because HEAD does not pass. #194's slices 1–3 are why this
was visible at all: slice 1 is what turned a silent green merge into the failing
step that produced this list.

Bears on #576, which found the playground Toast region missing its
`Notifications` landmark. Toast is also the largest certified cluster at 25.
Whoever takes either ticket should read the other first; if they are one defect,
#576 is its cheapest reproduction and should be fixed first.

Not a duplicate of #574 (`comparison parity (strict)`) or #575/#576
(`a11y:smoke`): those are steps of the `gates` job, this is the `certified`
job, and the two ladders' relationship is #568's subject.
