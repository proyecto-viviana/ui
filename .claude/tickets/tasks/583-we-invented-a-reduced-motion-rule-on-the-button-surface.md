---
id: 583
type: task
title: "We invented a reduced-motion rule on the button surface, and it costs two certified rows"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "graded by the conductor from shard 8 of Certification Gates run 35556441049 while grading the 132. Two rows, one cause, and the cause is a divergence we wrote ourselves rather than anything Solid forced. Filed separately from #582 because that one is a placement question in the popover and this one is two style declarations in the button family",
    }
---

## The defect

`D2 motion (reduced) — ToggleButton › default · hover-transition` and its
`ToggleButtonGroup` twin. The driver asserts bare pair equality at
`apps/comparison/e2e/drivers/motion.ts:207` —
`expect(JSON.stringify(snaps.solid)).toBe(JSON.stringify(snaps.react))` — so
received is ours and expected is upstream.

Under `prefers-reduced-motion: reduce`, upstream records two 150ms transitions
on the trigger, `background-color` and `color`, easing
`cubic-bezier(0.45, 0, 0.4, 1)`. We record `[]`. The unreduced variant of the
same case passes, so the two sides agree everywhere except inside the media
query, where we suppress a hover colour transition that S2 keeps.

`@react-spectrum/s2@1.7.0/src/ActionButton.tsx:141` is a plain
`transition: 'default',` with no media branch, and `Button.tsx:116` is the same.
Ours are `packages/solid-spectrum/src/button/s2-action-button-styles.ts:112-113`
and `packages/solid-spectrum/src/button/s2-button-styles.ts:57-58`, both

    transition: { default: "default", "@media (prefers-reduced-motion: reduce)": "none" }

`ToggleButton.tsx:13` imports `btnStyles` from `./ActionButton`, which is why
the roster lands the rows on togglebutton rather than on button.

## Scope

`packages/solid-spectrum/src/button/` only. Delete the reduced-motion branch
from those two `transition` declarations so each reads `transition: "default"`.

Explicit non-goal: the other four sites are faithful and must not be touched.
`disclosure/index.tsx:358` matches `Disclosure.tsx:357`, `tabs/index.tsx:389`
matches `Tabs.tsx:375`, `segmentedcontrol/index.tsx:165` matches
`SegmentedControl.tsx:131`, and the two runtime ones, `skeleton/index.tsx:95`
and `toast/index.tsx:871`, match `Skeleton.tsx:34` and `Toast.tsx:410`. Upstream
applies the pattern to moving indicators and chevrons, never to a control
surface; the bug is that someone carried it one element too far.

Also a non-goal: arguing the accessibility merits. Parity is the rule, and a
150ms colour crossfade is not what 2.3.3 is about. If the owner wants to
diverge here it is an owner decision recorded as one, not a silent style line.

## Done when

`certified/togglebutton certified/togglebuttongroup` is green, and the D2
reduced snapshots on both sides carry the same two transitions. Button,
ActionButton and LinkButton stay green, in both motion variants.

## Proof

Run `certified/togglebutton certified/togglebuttongroup certified/button
certified/actionbutton certified/linkbutton` and record the counts here.
Mutation-prove it the way #578 and #581 were proved: put the branch back, watch
the two rows go red again, take it out.

## Relationship

Child of #544, and one of the fourteen components the roster census at
`.agents/certified-169-census-2026-09-21.md` names. Independent of #582, which
is the four date-picker motion rows.
