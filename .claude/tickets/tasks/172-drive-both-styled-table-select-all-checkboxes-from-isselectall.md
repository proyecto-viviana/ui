---
id: 172
type: task
title: "Drive both styled Table select-all checkboxes from isSelectAll"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

solid-spectrum uses `state.isSelectAll`. viviana-ui uses
`selectedKeys === "all"`. `SelectionManager.isSelectAll` is also true when
every item key is selected individually. viviana-ui treats that case as mixed.
viviana-ui has no Table.test.tsx.

## Work

Use `isSelectAll` / `isEmpty` in both styled Tables. Add a regression for the
explicit full set.

## Done when

An explicit full selection shows selected, not mixed, in both packages.

## Relationship

F-QUALITY-001. #20 verified shared grid state; this is the styled wrapper
fork. Delta on #1.
