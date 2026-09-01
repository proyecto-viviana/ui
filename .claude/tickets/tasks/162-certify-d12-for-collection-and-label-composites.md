---
id: 162
type: task
title: "Certify D12 for collection and label composites"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Driver D12 is in the mandatory catalog. The only certified D12 spec is the
Button island pilot. Package hydrate coverage exists for some composites and
is off-CI.

## Work

Add D12 island routes for ListView, Meter static Label, GridList, Table,
ComboBox/Select, overlays, date fields, Tree selection, Label/ElementTag.

## Done when

Those keyboard-heavy or hydration-sensitive composites have certified D12 or
are explicitly partial.

## Relationship

F-TEST-004. Ranking is in `output/audit-2026-09/testing.md`.

## Round-2 note (2026-09-01)

Correction: round 1 said Button was the only certified D12 spec; Meter and text-entry-callback D12 specs also exist. Meter D12 has no `interact`, so it does not meet `certification.md`'s post-hydration requirement. The collection/label-composite gap stands.
