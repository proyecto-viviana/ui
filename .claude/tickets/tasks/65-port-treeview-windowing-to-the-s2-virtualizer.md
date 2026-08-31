---
id: 65
type: task
title: "Port TreeView windowing to the S2 Virtualizer"
created: 2026-08-20
parent: 33
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task treeview-div-grid-paint" }
---

Wrap TreeView with the upstream S2 `Virtualizer` and `S2ListLayout` instead of
rendering every row in document flow.

Keyboard landing matches today, but the mounted tab-stop census diverges after
End because S2 unmounts offscreen rows. Do not hide the difference by setting
row checkboxes to `excludeFromTabOrder`; upstream checkboxes are tabbable at
rest.

## Done when

Windowing, paint, focus, and mounted-row behavior match upstream and the
TreeView evidence no longer scopes out this structure.

## Relationship

Replaces `treeview-div-grid-paint` from `.claude/current/tech-debt.md`.
