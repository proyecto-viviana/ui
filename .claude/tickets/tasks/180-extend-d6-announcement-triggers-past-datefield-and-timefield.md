---
id: 180
type: task
title: "Extend D6 announcement triggers past DateField and TimeField"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

The D6 driver diffs live-region transcripts when `ax.announce` is set. Only
DateField and TimeField set it. ComboBox omits announcements (#80). ActionBar
`"Actions available."`, Table `Sorted by …`, DragManager drop/cancel, and
TokenField segments have no D6 announce trigger.

## Work

Calibrate D6 announce onto those call sites. Do not add another waiver.

## Done when

Each `announce()` call site has a D6 trigger or a named ticket that owns the
omission.

## Relationship

F-A11Y-007. #79 / #80 stay for Toast and ComboBox.

## Round-2 note (2026-09-01)

Additional `announce()` call site: RAC `Button` announces on pending enter/exit while focused (`packages/solidaria-components/src/Button.tsx:499-510`). Not a Button recertification; another site outside the DateField/TimeField oracle.
