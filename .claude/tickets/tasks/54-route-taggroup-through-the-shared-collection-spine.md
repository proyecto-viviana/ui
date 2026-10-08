---
id: 54
type: task
title: "Route TagGroup through the shared collection spine"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task migrate-taggroup-spine" }
  - {
      state: verified,
      at: 2026-10-08,
      note: "createTagGroup navigates through createGridList. createTag keeps Delete and Backspace removal, the tab stop override, and the remove-button tab. The local arrow, home, and end copy is gone. createTagGroup.test.tsx passed 7 tests and TagGroup.test.tsx passed 49.",
    }
---

Route TagGroup through the shared selection manager and keyboard delegate.

The component is behavior-certified, but `createTag` and `createTagGroup` still
implement horizontal Arrow/Home/End navigation, container-focus transfer, and
the item `tabIndex` calculation inline. Build `createTagGroup` on
`createGridList`; keep `useTag` as a thin grid-list-item wrapper with only the
Delete/Backspace removal behavior. Direction already flows through the
component data.

Delete the per-widget navigation copy after parity evidence passes.

## Relationship

Replaces `migrate-taggroup-spine` from the retired tech-debt note. Its
legacy manager and delegate prerequisites are complete.
