---
id: 111
type: task
title: "Gate virtual pointer detection on Android"
created: 2026-08-20
parent: 31
status: merged
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-64" }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "HEAD subset D4 Button mouse-click: RAC onPressStart pointerType mouse on the same untrusted 1x1 PointerEvent; Solid ignored pointerdown as virtual and completed on click as virtual. The 1-by-1 clause was not Android-gated.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "isVirtualPointerEvent 1-by-1 clause is Android-only, matching RAC isVirtualEvent.ts. Package tests: zero-size off/on Android, 1-by-1 off/on Android, createPress mouse vs TalkBack. Did not re-run certified D4.",
    }
---

Match the current upstream `isVirtualPointerEvent` 1-by-1 pixel rule.

The second 1-by-1 clause must apply only on Android. The local rule can classify
a trackpad mouse event as virtual on other platforms.

## Done when

Unit tests cover the platform matrix and real-browser evidence distinguishes
trackpad input from virtual input. Part of #82.
