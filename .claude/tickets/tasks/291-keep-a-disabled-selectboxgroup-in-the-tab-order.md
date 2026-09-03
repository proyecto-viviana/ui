---
id: 291
type: task
title: "Keep a disabled SelectBoxGroup in the tab order"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 selectboxgroup functional pass: S2 leaves the listbox focusable and aria-disabled unset; Solid sets aria-disabled and drops tabIndex so Tab skips the group",
    }
---

S2 SelectBoxGroup takes `isDisabled` off the ListBox props and puts it only
on `SelectBoxContext`, so each SelectBox is disabled and the listbox host
stays in the tab order. Solid forwards `isDisabled` onto HeadlessListBox
and also stamps `data-disabled`.

## Evidence

`http://127.0.0.1:4341/components/selectboxgroup/?isDisabled=true` — islands
mounted, one panel at a time.

Rest:

- React listbox: `tabIndex=0`, no `aria-disabled`, no `data-disabled`.
  Options `aria-disabled=true`. AX: `listbox "Plans"` (not marked disabled)
  with disabled options.
- Solid listbox: `tabIndex=-1`, `aria-disabled=true`, `data-disabled=true`.
  AX: `listbox "Plans" [disabled]`.

Tab from the canvas:

- React: focus lands on the listbox `Plans`. ArrowDown/Space keep focus
  there and do not change `selectedKeys=starter`.
- Solid: Tab skips the group; focus goes to the page `Information` button.

Upstream
`@react-spectrum/s2/src/SelectBoxGroup.tsx` destructures `isDisabled` out
of `otherProps` and does not pass it to `ListBox`. Solid
`packages/solid-spectrum/src/selectboxgroup/index.tsx` sets
`isDisabled={local.isDisabled}` and `data-disabled` on `HeadlessListBox`.
Item-level disable via context already matches.

## Done when

A disabled comparison SelectBoxGroup keeps the listbox in the tab order
without `aria-disabled` on the host, matching React. Options stay
`aria-disabled` and reject click/Space. A test fails if Tab skips the
group or the listbox is marked disabled.

## Relationship

Child of #24. Found by #260. Distinct from #265 (Picker native `disabled`
vs `aria-disabled` on a button). Do not start #254.
