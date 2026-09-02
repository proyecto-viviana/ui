---
id: 225
type: task
title: "Build the per-export cost table and ratchet from the packed consumer smoke"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
---

## Cause

Owner decision on #219 item 1. The only live size evidence is
`guard:jsx-deopt-size`, a 500 KB per-`.jsx` Babel-deopt ceiling with 3.7×
headroom and no ratchet. Style `.js` at 971 KB and solid-stately's 423 KB
barrel are invisible to it.

## Work

Extend the packed consumer smoke (#146) to build one consumer entry per
public export (`import { X } from "@proyecto-viviana/<pkg>"`) and record
min+brotli of the resulting bundle. Check in the table as a baseline. A
ratchet fails when any export's cost grows past a tolerance unless a
changeset in the same change names the export and the reason. Print S2's
cost for the same React import alongside, report-only. The Babel ceiling
stays as a compiler guard, not as size evidence.

## Done when

The table exists for all six public packages; the ratchet is on a blocking
workflow; the first baseline is committed with the S2 column populated.

## Relationship

Owner decision on #219 item 1. Builds on #146 and #212; #211 proceeds
independently.
