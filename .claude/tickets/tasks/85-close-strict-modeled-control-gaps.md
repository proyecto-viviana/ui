---
id: 85
type: task
title: "Close strict modeled-control gaps"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task labeledvalue-strict-parity" }
---

Add modeled controls for the nine remaining strict-evidence entries:
ActionGroup, Autocomplete, GridList, LabeledValue, ListBox, ListBox DnD,
StepList, Toolbar, and Virtualizer.

`LabeledValueContext` is also the only missing non-DnD S2 support export in the
starting census.

## Done when

All 78 catalogue components have modeled controls, the frozen baseline is
removed, and `LabeledValueContext` closes in coordination with #84's DnD export
work.

## Relationship

Replaces `labeledvalue-strict-parity` from `.claude/current/tech-debt.md`.
GitHub issue #24 holds the original external scope.
