---
id: 294
type: task
title: "Apply the DialogTrigger overlay id to the modal Dialog"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 dialog functional pass: Solid trigger aria-controls points at solidaria-cl-164 which is not in the document; the role=dialog section has no id. React aria-controls equals the dialog id",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Headless Dialog spreads DialogTrigger overlayProps so the section id matches trigger aria-controls.",
    }
---

On `/components/dialog/`, opening the modal sets `aria-expanded=true` and
`aria-controls` on both triggers. React's `aria-controls` is the open
`role="dialog"` section's `id`. Solid's `aria-controls` (`solidaria-cl-164`)
does not resolve (`document.getElementById` is null) and the dialog
`<section>` has no `id`.

`DialogTrigger` already puts `overlayProps.id` on `DialogTriggerContext`
(`packages/solidaria-components/src/Dialog.tsx`, `createOverlayTrigger`).
The headless Dialog section spreads `dialogProps` / `domProps` and never
applies that id. RAC puts `useOverlayTrigger` `overlayProps.id` on the
dialog, so the trigger reference is valid.

## Evidence

`http://127.0.0.1:4341/components/dialog/`, one panel at a time,
`data-islands-mounted`. Pointer / Enter / Space open, settled.

- React: trigger `aria-controls` = dialog `id` (`react-aria…-_r_0_`),
  `getElementById` returns the `role="dialog"` / `alertdialog` section.
- Solid: trigger `aria-controls=solidaria-cl-164`, dialog `id` absent,
  `getElementById` null. Accessible name, `aria-labelledby`, heading, and
  AX snapshot otherwise match.

Same dangling id on AlertDialog, `hasTitle=false`, sizes S–XL, live
`isOpen`, and live `role=alertdialog`.

## Done when

An open comparison Dialog's trigger `aria-controls` resolves to the modal
`role="dialog"` (or `alertdialog`) node on both stacks. A route walk fails
if Solid `aria-controls` is missing from the document or points at a
different element than React's dialog.

## Relationship

Child of #24. Found by #260. Distinct from #113 (PopoverContext overlay id)
and #208 (Heading + four DialogTrigger contexts; `overlayProps` is already
on `DialogTriggerContext`). Do not start #254.
