---
id: 208
type: task
title: "Restore RAC Heading and DialogTrigger state wiring"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

RAC `Heading` is a general slot (default `level = 3`, `HeadingContext`).
Local `Heading` lives in `Dialog.tsx`, is documented as the dialog title,
defaults to level 2, and is exported as both `Heading` and `DialogHeading`
(`packages/solidaria-components/src/Dialog.tsx:70-71, 300-317`,
`index.ts:501-513`). A RAC-shaped `<Heading slot="title">` outside a dialog
gets a dialog helper; inside one it gets `h2` where RAC gives `h3`.

RAC `DialogTrigger` uses `useMenuTriggerState` and provides
`OverlayTriggerStateContext`, `RootMenuTriggerStateContext`, `DialogContext`,
`PopoverContext` with `overlayProps.id`. Local uses `createOverlayTriggerState`
and one `DialogTriggerContext` (`Dialog.tsx:98-177`); #113 names the missing
overlay id but not the menu-trigger state swap. Local `DialogProps.onClose`
has no RAC counterpart.

## Work

Add `Heading.tsx` with RAC's contract and context; make Dialog consume it via
`HeadingContext`; port DialogTrigger's state and the four contexts; remove or
label `onClose`.

## Done when

`Heading` defaults to level 3 and works outside Dialog; a Menu inside a
Dialog receives root menu-trigger state; tests fail on the old defaults.

## Relationship

F-UP-010. Extends #113. #106 (Menu onto Popover) is adjacent.
