---
id: 79
type: task
title: "Build a live-announcement transcript oracle"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task d6-announcement-calibration" }
---

Build a harness that asserts the string announced by a live region, not only
the live-region structure.

Toast already has structural D6 evidence for its `role="alert"` region. The
remaining calibration must observe add/remove announcements from a body-portaled
Toast whose queue has a separate module instance in each comparison panel.

## Done when

The harness produces stable transcript evidence for the Toast add/remove path
and can support #80.

## Relationship

Replaces `d6-announcement-calibration` from
`.claude/current/tech-debt.md`.
