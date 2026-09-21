---
id: 582
type: task
title: "The date picker popover enters from the wrong side, and it is four certified motion rows"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "graded by the close-gates writer while closing #581, because the conductor asked whether `datepicker-motion` and `daterangepicker-motion` ride along with the `attr:` fix. They do not. With all 44 D1/D3/D7/D9/D10 date rows green, `certified/datepicker certified/daterangepicker` reports 110 passed and 4 failed, and the 4 are exactly `D2 motion — DatePicker motion › open · open-enter`, its reduced-motion twin, and the two DateRangePicker equivalents. Own cause, filed rather than folded into #581",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: 'resolution, not timing, and the divergence was ours. Probed at capture on both stacks: React and Solid both measure `data-placement="top"` over the same layout box (popover top 94, triggers centred by the walk), yet our entering class used `bottom`. `solidaria-components/src/Popover.tsx` held the preferred axis for the whole enter, a local deviation added by #251/#257 when React still captured `bottom`; since the walk centres the canvas, both stacks flip to `top` and the hold rendered the unflipped keyframe. Upstream `PopoverInner` passes the measured `placement` straight through. Now the measured axis wins as soon as it exists; the preferred axis only seeds the unplaced frame. `certified/datepicker certified/daterangepicker`: 114 passed. Every certified D2 row: 22 passed / 4 failed, the four being Dialog `modal-open` and its reduced twin (modal stays open after Escape) and the ToggleButton/ToggleButtonGroup reduced rows (#583), all red before this change. Mutation: hold restored and rebuilt, D2 is 18 / 8, the extra four exactly these rows. Package units: 161 files, 3582 passed',
    }
---

## The defect

D2 records the `open-enter` keyframe on both sides of the comparison page. Ours
is `"translate": "0px -4px"`; React's is `"0px 4px"`. A sign, not a magnitude.

The style table is not the divergence. `packages/solid-spectrum/src/popover/index.tsx:118-130`
and `@react-spectrum/s2@1.7.0/src/Popover.tsx:123-132` are the same table to the
digit — `top` enters at `4`, `bottom` at `-4`. So both sides agree on what each
placement animates to, and disagree on which placement the popover is in when
the driver captures it: React reads `top`, we read `bottom`.

That makes this a placement-resolution question, not a token one. Where the
`placement` render prop comes from, and when it is first readable relative to
the entering class, is what to look at — not the numbers above.

## Work

1. Read the `placement` render prop both sides expose at capture time; the
   driver's own record already prints it, so start there rather than in the
   overlay positioner.
2. Fix whichever of resolution or timing is wrong, and mirror upstream.
3. Re-run `certified/datepicker certified/daterangepicker`; 114 rows, all green.

## Done when

The four D2 motion rows pass and the `open-enter` translate matches React's sign
at the same placement.

## Relationship

Child of #544 and the fifth cause under #578. Split out of #581, which closed the
other 44 date rows; #581 has the run that proves these four do not ride along.
