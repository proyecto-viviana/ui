---
id: 535
type: task
title: "Replace DOM inspection slot styling with SlotContext"
created: 2026-09-13
parent: 531
status: verified
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to retire applySlotClasses and querySelectorAll DOM inspection before Solid 2.0",
    }
  - {
      state: verified,
      at: 2026-09-28,
      note: "SlotContext in solidaria-components/slots applies Text, Icon, and Button slot classes during render on solid-spectrum and viviana-ui. SelectBox, Tree, and GridList render those classes on first paint; the querySelectorAll slot walks are gone. Vertical comparison cards measure 48px 8px 18px with the description hidden; horizontal cards measure 18px 30px over 48px 10px 250px. SelectBoxGroup tests 10/10",
    }
---

## Cause

Components like `SelectBox`, `GridList`, and `Tree` currently use `children()`
to inspect DOM nodes and run `createEffect` with `querySelectorAll` to stamp
slot classes (F-PERF-008, #169, #102). This causes layout shifts, misses SSR
styling, and snapshots dynamic mixed text.

## Work

1. Implement a headless `SlotContext` in `packages/solidaria-components`.
2. Allow slotted child components (`Text`, `Icon`, `Button`) to consume slot
   classes at render time on both server and client.
3. Remove `applySlotClasses` and `querySelectorAll` DOM walking loops.

## Done when

SelectBox, Tree, and GridList apply slot classes during initial render without
calling `querySelectorAll` in effects or snapshotting children.

## Relationship

Child of #531. Closes F-PERF-008. Sibling of #168 and #169.
