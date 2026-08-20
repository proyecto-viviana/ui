---
id: 68
type: task
title: "Drive Popover enter and exit motion"
created: 2026-08-20
parent: 33
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task popover-enter-motion" }
---

Drive Popover's `isEntering` and `isExiting` flags from the overlay lifecycle.

The styled motion tokens already match S2, but the headless Popover treats the
flags as external render props and never changes them. Mirror RAC enter/exit
animation behavior after overlay positioning is ready, then add D2 evidence.

Also match RAC's nested-dialog guard: only add `role="dialog"` when the content
does not already contain a dialog.

## Relationship

Replaces `popover-enter-motion` from `.claude/current/tech-debt.md`.
