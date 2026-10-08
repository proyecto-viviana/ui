---
id: 55
type: task
title: "Route ComboBox navigation through the shared spine"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task migrate-combobox-nav" }
  - {
      state: verified,
      at: 2026-10-08,
      note: "createComboBox routes arrow, home, end, and page keys through one ListKeyboardDelegate and createSelectableCollection. The local arrow, home, end, and page copy is gone. shouldFocusWrap is read at event time. createComboBox.test.tsx passed 48 tests and ComboBox.test.tsx passed 110.",
    }
---

Replace the ComboBox local navigation logic with the shared keyboard delegate.

## Relationship

Replaces `migrate-combobox-nav` from the retired tech-debt note. Its legacy
delegate prerequisite is complete.
