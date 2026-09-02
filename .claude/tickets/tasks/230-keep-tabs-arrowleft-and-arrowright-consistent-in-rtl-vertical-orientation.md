---
id: 230
type: task
title: "Keep Tabs ArrowLeft and ArrowRight consistent in RTL vertical orientation"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
---

## Cause

RAC 1.21.0 changed `TabsKeyboardDelegate` so `flipDirection` is `direction ===
'rtl'` regardless of orientation
(`packages/react-aria/src/tabs/TabsKeyboardDelegate.ts:28-30` on `f56660b`).
Previously it flipped only for horizontal RTL. Release note: "Keep ArrowLeft
and ArrowRight consistent in RTL vertical orientation". Test:
`packages/react-aria-components/test/Tabs.test.js:474`. Local Tabs still
ignores ArrowLeft/ArrowRight when vertical
(`packages/solidaria/src/tabs/createTabs.ts:256-268`), so RTL vertical arrows
never move. #201 covers `useLocale().direction` in Submenu, Calendar,
ColorSwatchPicker, and Tree — not this Tabs delegate.

## Work

Match the pinned delegate: ArrowLeft/ArrowRight follow locale text direction
in both orientations; ArrowUp/ArrowDown stay unflipped. Add the RTL vertical
Tabs keyboard test from upstream.

## Done when

A vertical Tabs under `locale="ar-AE"` moves with ArrowLeft/ArrowRight the
same way upstream does at `f56660b`; the test fails if `isHorizontal` still
gates those keys.

## Relationship

Child of #220. Note on #201; does not replace it. Adjacent to #179 D10 RTL.
