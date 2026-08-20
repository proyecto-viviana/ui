---
id: 122
type: task
title: "Route repeated navigation through keyboard shortcuts"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-90" }
---

Match repeated-key navigation in the shared selectable-collection spine.

Upstream routes shifted arrows and page keys through `useKeyboard` shortcuts
with `allowRepeats: true`. The local collection uses a hand-built `onKeyDown`
path with no shortcut or repeat branch.

## Done when

The shared implementation covers repeats, shift selection, page navigation,
composition, disabled items, and focus without per-widget copies. Depends on
#108 and is part of #82.
