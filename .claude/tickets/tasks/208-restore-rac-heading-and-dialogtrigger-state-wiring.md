---
id: 208
type: task
title: "Restore RAC Heading and DialogTrigger state wiring"
created: 2026-09-01
parent: 136
status: open
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
---

## Cause

A heading outside a dialog now defaults to level 3, and `DialogTrigger` provides root menu-trigger state.

`Heading` still lives in `Dialog.tsx`. Inside a dialog every `Heading` is the title and defaults to level 2. RAC's unsloated `Heading` inside a dialog stays level 3; only `slot="title"` is level 2. The styled dialog legacy title renders this heading without that slot, so the inside default stays 2.

The public `HeadingContext` export is the collection header context, not RAC's heading slot context. `DialogProps.onClose` has no RAC counterpart.

## Work

Add `Heading.tsx` with RAC's contract and context; make Dialog consume it via
`HeadingContext`; port DialogTrigger's state and the four contexts; remove or
label `onClose`.

## Done when

`Heading` defaults to level 3 and works outside Dialog; a Menu inside a
Dialog receives root menu-trigger state; tests fail on the old defaults.

## Relationship

F-UP-010. Extends #113. #106 (Menu onto Popover) is adjacent.
