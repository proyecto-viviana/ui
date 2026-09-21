---
id: 578
type: task
title: "The certified suite is 169 red on GitHub's runners, concentrated in thirteen components"
created: 2026-09-20
parent: 544
status: next
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

Not a duplicate of #574 (comparison parity strict, step 239) or #575/#576
(`a11y:smoke`, step 251): those are the `gates` job, this is the `certified`
job, and the two ladders' relationship is #568's subject.
