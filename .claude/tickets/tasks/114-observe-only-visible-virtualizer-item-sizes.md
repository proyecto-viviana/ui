---
id: 114
type: task
title: "Observe only visible Virtualizer item sizes"
created: 2026-08-20
parent: 31
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-72" }
  - {
      state: in-progress,
      at: 2026-09-15,
      note: "VirtualizerItem now matches RAC useVirtualizerItem: estimated rows still measure once; shouldObserveItemSize observes the wrapper's direct children via ResizeObserver; isElementVisible skips a hidden collection so size 0 cannot stick. Unit tests cover observe / hidden / observation-off. Not verified.",
    }
  - {
      state: in-progress,
      at: 2026-09-15,
      note: "Observation landed in 3f4f11bf. Virtualizer.test.tsx 78 passed (observe / hidden / observation-off). ComboBox/Picker do not pass shouldObserveItemSize (RAC ComboBox/Picker also omit it). Scroll/relayout comparison evidence still required before verified. Not verified.",
    }
---

Port `shouldObserveItemSize` and the hidden-element measurement guard.

The local Virtualizer has neither branch. Do not mix this work with the separate
reverse-layout question.

## Done when

Visible items update their measured size when enabled, hidden items are not
measured, observation can be disabled, and scroll and relayout evidence matches
upstream. Part of #82.
