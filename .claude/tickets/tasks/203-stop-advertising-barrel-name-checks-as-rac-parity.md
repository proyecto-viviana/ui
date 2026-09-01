---
id: 203
type: task
title: "Stop advertising barrel-name checks as RAC parity"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`guard:rac-parity` requires 16 symbols and warns without failing when a
tracked name vanishes (`scripts/check-rac-parity.ts:13-36, 99-107`).
`guard:rac-export-gap` diffs `export { Name } from './relative'` clauses and
fails only when RAC has a name solidaria lacks
(`scripts/check-rac-export-gap.ts:69-93`); direct `export function` /
`export *` and sibling re-exports (`TokenFieldValue` from
`react-stately/useTokenFieldState`) are invisible, so it printed PASS with
"Missing: 0" while `TokenFieldValue` is not re-exported from
`solidaria-components`. Both were green today with 168 extras, and
PreviewTrigger / TokenField present on both barrels while #117 / #118 remain
open. The PASS line reads "covers every upstream RAC value export"; agents
treat Train 8 as absorbed.

## Work

Rename the guard output to what it proves (barrel-name presence); parse
upstream sibling re-exports; add `TokenFieldValue` to #118's list; document
in `certification.md` which gates are name checks and which are behavior
evidence.

## Done when

No blocking gate prints "parity" for a string match; a RAC value export
re-exported from a sibling module is counted; `TokenFieldValue` resolves
from `solidaria-components`.

## Relationship

F-UP-003, F-API-008. Delta on #33 (prune extras) and #118.
