---
id: 208
type: task
title: "Restore RAC Heading and DialogTrigger state wiring"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: open,
      at: 2026-09-28,
      note: "DialogTrigger now uses createMenuTriggerState and provides RootMenuTriggerStateContext, so a menu inside the dialog closes with the dialog. Heading still defaults to level 2 and still lives in Dialog.tsx; HeadingContext is not ported.",
    }
  - {
      state: open,
      at: 2026-09-28,
      note: "A heading outside a dialog defaults to level 3. Inside a dialog the heading is still the title at level 2, because the styled dialog legacy title renders it without a slot. The public HeadingContext export is still the collection context.",
    }
  - {
      state: verified,
      at: 2026-10-06,
      note: "Heading lives in Heading.tsx, defaults to level 3, and publishes the RAC heading context. An unslotted heading inside a dialog stays level 3; only the title slot is level 2, and the styled legacy title uses that slot. DialogTrigger still provides root menu-trigger state, so a menu inside a dialog closes with the dialog. DialogHeading is not exported.",
    }
---

## Cause

`Heading` lived in `Dialog.tsx` and defaulted to level 2 inside a dialog, including when it was not the title. RAC keeps an unslotted heading at level 3 and uses level 2 only for `slot="title"`. The styled dialog legacy title rendered that heading without the slot. The public `HeadingContext` export was the collection header context.

`DialogProps.onClose` has no RAC counterpart and is unchanged.

## Work

Add `Heading.tsx` with RAC's contract and context; make Dialog consume it via
`HeadingContext`; port DialogTrigger's state and the four contexts; remove or
label `onClose`.

## Done when

`Heading` defaults to level 3 and works outside Dialog; a Menu inside a
Dialog receives root menu-trigger state; tests fail on the old defaults.

## Relationship

F-UP-010. Extends #113. #106 (Menu onto Popover) is adjacent.
