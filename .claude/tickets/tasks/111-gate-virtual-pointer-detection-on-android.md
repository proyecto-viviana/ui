---
id: 111
type: task
title: "Gate virtual pointer detection on Android"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-64" }
---

Match the current upstream `isVirtualPointerEvent` 1-by-1 pixel rule.

The second 1-by-1 clause must apply only on Android. The local rule can classify
a trackpad mouse event as virtual on other platforms.

## Done when

Unit tests cover the platform matrix and real-browser evidence distinguishes
trackpad input from virtual input. Part of #82.
