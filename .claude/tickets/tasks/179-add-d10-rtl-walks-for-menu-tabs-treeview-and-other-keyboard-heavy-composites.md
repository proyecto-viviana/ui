---
id: 179
type: task
title: "Add D10 RTL walks for Menu Tabs TreeView and other keyboard-heavy composites"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`registerRtlDriver` is called from only thirteen certified specs. Menu,
ActionMenu, Tabs, TreeView, Accordion, Breadcrumbs, ListView, and others omit
it. Tabs marks Accessibility complete without D10.

## Work

Register D10 for those keyboard-heavy composites. TreeView may stay partial
with the documented Virtualizer skip.

## Done when

Every keyboard-heavy note that claims i18n complete has a D10 walk.

## Relationship

F-A11Y-006. Not #98 (StepList prefixes).

## Round-2 note (2026-09-01)

Round 2: registering D10 on Menu/Tabs/TreeView/ColorSwatchPicker will not go green until the mappers read `useLocale` (#201) and the demos accept `?locale` (#202); D10 as written compares direction and focus trails, not catalog strings or RTL paint (#202).
