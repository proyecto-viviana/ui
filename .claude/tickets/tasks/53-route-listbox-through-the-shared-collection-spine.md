---
id: 53
type: task
title: "Route ListBox through the shared collection spine"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task migrate-listbox-spine" }
  - {
      state: verified,
      at: 2026-10-08,
      note: "ListBox selection and drop navigation share one ListKeyboardDelegate. The local drop key copy is gone, and the listbox empty state renders as a div.",
    }
---

Route ListBox through the shared selection and keyboard spine. Match the
upstream `div[role]` structure instead of the current `ul`/`li` structure.

## Relationship

Replaces `migrate-listbox-spine` from the retired tech-debt note. Its
legacy manager and delegate prerequisites are complete.
