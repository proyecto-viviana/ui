---
id: 114
type: task
title: "Observe only visible Virtualizer item sizes"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-72" }
---

Port `shouldObserveItemSize` and the hidden-element measurement guard.

The local Virtualizer has neither branch. Do not mix this work with the separate
reverse-layout question.

## Done when

Visible items update their measured size when enabled, hidden items are not
measured, observation can be disabled, and scroll and relayout evidence matches
upstream. Part of #82.
