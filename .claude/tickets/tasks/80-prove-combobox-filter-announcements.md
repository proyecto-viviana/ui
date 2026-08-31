---
id: 80
type: task
title: "Prove ComboBox filter announcements"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task combobox-d6-announcements" }
---

Use the transcript oracle from #79 to prove the ComboBox announcements that
run while a user types and filters: focus, option count, and selection text.

ComboBox paint, virtual focus, listbox structure, and other covered gates are
already certified. The full upstream 32-locale message table is already ported;
this task is evidence-harness work.

## Relationship

Replaces `combobox-d6-announcements` from `.claude/current/tech-debt.md`.
Depends on #79.
