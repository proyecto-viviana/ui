---
id: 52
type: task
title: "Route Menu through the shared collection spine"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task migrate-menu-spine" }
  - {
      state: verified,
      at: 2026-10-08,
      note: "createMenu navigates through createSelectableList and ListKeyboardDelegate. The local arrow, home, end, page, and typeahead copy is gone. createMenu.test.tsx passed 73 tests.",
    }
---

Route Menu through the shared selection manager and keyboard delegate. Delete
the per-widget copy after parity evidence passes.

## Relationship

Replaces `migrate-menu-spine` from the retired tech-debt note. Its legacy
manager and delegate prerequisites are complete.
