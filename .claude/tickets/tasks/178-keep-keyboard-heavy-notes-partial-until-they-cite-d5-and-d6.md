---
id: 178
type: task
title: "Keep keyboard-heavy notes partial until they cite D5 and D6"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

ListView is `accepted` without registering D5/D6 (it cites GridList, which
has no note). SelectBoxGroup and SegmentedControl mark Accessibility `passing`
with no certified D5/D6. TableView is `accepted` while D5 is out of scope
(#89). None of the 66 notes contain the ids `D5` or `D6`. `done` / `passing`
are unnormalized outcomes.

## Work

Normalize notes to `complete` / `partial` / `not-started`. Require a D5/D6
citation for keyboard-heavy composites. Mark ListView, SelectBoxGroup,
SegmentedControl, and TableView partial until the drivers exist or #89 lands.

## Done when

A keyboard-heavy note without a D5/D6 citation cannot read as accepted.

## Relationship

F-A11Y-003, F-A11Y-004, F-A11Y-005, F-A11Y-010. TableView architecture stays
on #89.
