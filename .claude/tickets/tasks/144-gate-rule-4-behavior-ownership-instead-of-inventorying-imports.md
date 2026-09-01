---
id: 144
type: task
title: "Gate Rule 4 behavior ownership instead of inventorying imports"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`guard:layer-boundary` freezes the dual-tree. `report:layer-imports` is an
inventory, not in CI. No gate fails when a styled component reimplements
keyboard or ARIA instead of wrapping RAC. RangeSlider is the existing example
(#74 / #76).

## Work

Define a fail-closed ownership check that distinguishes composition from
reimplementation. Do not add another waiver list around RangeSlider.

## Done when

A new styled-layer keyboard/ARIA reimplementation fails CI unless an existing
ticket names it.

## Relationship

F-ARCH-004. RangeSlider stays on #74 / #76.
