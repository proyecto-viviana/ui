---
id: 76
type: task
title: "Collapse RangeSlider onto the Slider spine"
created: 2026-08-20
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task rangeslider-duplicates-slider-spine",
    }
---

Make RangeSlider a thin wrapper over the shared Slider layout, geometry, and
style atoms, with only the second thumb added.

The current `RangeSlider.tsx` duplicates the Slider styles and pointer/keyboard
math. Certification had to repair the same divergences in both copies. During
the consolidation, replace hardcoded `Minimum` and `Maximum` labels with the
upstream localized strings.

## Done when

RangeSlider shares the Slider source, remains certification-green, and future
Slider fixes propagate without duplicate edits.

## Relationship

Replaces `rangeslider-duplicates-slider-spine` from
`.claude/current/tech-debt.md`. Coordinate with #74.
