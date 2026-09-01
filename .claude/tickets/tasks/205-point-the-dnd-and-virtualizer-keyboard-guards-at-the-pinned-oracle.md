---
id: 205
type: task
title: "Point the DnD and virtualizer keyboard guards at the pinned oracle"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`scripts/check-dnd-keyboard-parity.ts:30-64` and
`check-virtualizer-keyboard-parity.ts:18-60` `hasPattern` local files for
identifiers such as `keyboardDelegate?.getKeyBelow` and `oppositeDirection`.
They never read `react-spectrum/`. A local rewrite that keeps the tokens and
changes the walk still passes; both stay green for the life of #84.

## Work

Derive the expected contract from the pinned `useDroppableCollection` /
virtualizer source (or a checked-in extract of it) and diff, not grep.

## Done when

Changing the keyboard walk locally while keeping the identifiers fails the
guard.

## Relationship

F-UP-006. Delta on #84.
