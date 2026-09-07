---
id: 508
type: task
title: "Close ComboBox and Picker D13 step-0 DOM oracle"
created: 2026-09-07
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **4** unwaived D13 titles.

Journeys **already run** — this is not “D13 not built” and not a bind of initiative #243.

Step 0 (`click trigger` / `Tab to trigger`) field-dom diffs, mixed:

- extra Solid `data-open` / `data-focused` / `data-focus-visible` on trigger, input, or svg
- ComboBox overlay `data-placement: top` vs React `bottom`
- hidden `<form>` vs React `<template>`, extra hidden input
- Picker keyboard-only: extra wrapping `div` with focus data attributes

#209 notes render-prop data attributes; #248 owns overlay misplacement; #254 is the owner composition decision. No single open ticket owns this whole step-0 class.

## Work

Split the step-0 oracle into named misses (render-prop attrs vs placement vs hidden-select/form). Fix in the lowest layer; keep the four journeys as the regression. Prove with focused D13 on combobox-field and picker-trigger. Do not bind #243.

## Done when

Those 4 titles pass step 0 (and the rest of each journey), or each remaining step-0 key is a named child/bind.

## Relationship

Triage class of #493. Sibling under #136. Points at #209/#248/#254; does not bind #243.
