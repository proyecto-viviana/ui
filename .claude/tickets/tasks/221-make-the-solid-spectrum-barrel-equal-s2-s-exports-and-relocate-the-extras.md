---
id: 221
type: task
title: "Make the solid-spectrum barrel equal S2's exports and relocate the extras"
created: 2026-09-01
parent: 33
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
---

## Cause

Owner decision on #218 item 1: the `@proyecto-viviana/solid-spectrum` barrel
equals S2's `exports/index.ts`, guarded. Today it also exports `Select` beside
`Picker`, `ListBox` / `Toolbar`, `ActionGroup`, `StepList`, `Flex`, `Grid`,
`Separator` beside `Divider`, and RAC `Table` / `Tree` / `Toast` / `addToast`
beside `TableView` / `TreeView` / `ToastContainer` — 168 extras that
`guard:rac-export-gap` accepts by design.

## Work

1. Inventory: for every barrel export not in S2's `exports/index.ts`, record
   whether the product (`apps/web`, the owner's consumers) imports it. The
   owner reads this inventory before any deletion.
2. Extras with no consumer are deleted. Extras the product uses move to
   `@proyecto-viviana/ui` with a documented local-addition label.
3. Add a guard that fails when the solid-spectrum barrel and S2's
   `exports/index.ts` differ (names present in one and not the other), with
   the pinned oracle as the source. `guard:rac-export-gap` keeps its job for
   the headless layer.
4. Changeset with the removed names; the generated API reference drops their
   pages.

## Done when

The barrel guard is green and on Certification Gates; every former extra is
either deleted or exported from `@proyecto-viviana/ui` with its label; #33
lists this ticket as its checklist.

## Relationship

Owner decision on #218 item 1. Feeds #33. `MenuButton` is #222; item names
are #224.
