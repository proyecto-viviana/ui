---
id: 290
type: task
title: "Skip a disabled SelectBox during arrow navigation"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 selectboxgroup functional pass: SelectBox isDisabled is skipped by React arrows and by both stacks for disabledKeys, but Solid ArrowDown moves data-focused onto the disabled option and drops the focus ring",
    }
---

Collection `disabledKeys` already skip keyboard movement on both stacks.
Per-item `SelectBox isDisabled` must do the same. Solid ArrowDown onto a
disabled Pro sets `data-focused` there, clears the Starter focus ring, and
leaves DOM focus on Starter.

## Evidence

`http://127.0.0.1:4341/components/selectboxgroup/?disabledItem=pro` —
islands mounted, one panel at a time. Tab lands on Starter on both
(selected, `tabIndex=0`, focus-visible ring). Then ArrowDown:

- React: stays on Starter. `tabIndex=0`, `data-focused` +
  `data-focus-visible`, outline `rgb(75, 117, 255) solid 2px`. Pro stays
  `aria-disabled=true` and unfocused.
- Solid: DOM focus remains Starter, but Starter `tabIndex=-1` and loses
  `data-focused` / the ring. Pro gets `data-focused=true` with no
  `data-focus-visible` and no ring.

Space after that still toggles Starter on both (`selectedKeys` empty), so
activation follows DOM focus. The missing ring and the `data-focused`
disabled option are user-visible.

`?disabledKeys=pro` ArrowDown stays on Starter on both. Pointer click on
disabled Pro is ignored on both.

## Done when

ArrowDown/ArrowRight from Starter with `disabledItem=pro` keep focus,
roving `tabIndex`, and the focus-visible ring on Starter, matching React
and matching `disabledKeys`. A test fails if `data-focused` lands on the
disabled option.

## Relationship

Child of #24. Found by #260. Distinct from #291 (group `isDisabled` on the
listbox host) and #292 (grid ArrowRight). Not #100 (virtual focus on an
input). Do not start #254.
