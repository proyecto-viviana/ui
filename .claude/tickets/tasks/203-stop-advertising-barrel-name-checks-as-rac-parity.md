---
id: 203
type: task
title: "Stop advertising barrel-name checks as RAC parity"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "guards now print export present/missing; sibling re-exports are scored; ticketed pending list unblocks the pin-first train",
    }
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

## Landed

- `scripts/check-rac-parity.ts` and `scripts/check-rac-export-gap.ts` print
  `export present` / `export missing`. They no longer say "parity".
- Shared parser in `scripts/rac-export-presence.ts` counts every `export { … }
from` value name, including RAC sibling re-exports from `react-aria` /
  `react-stately` (`exports/index.ts:130-302` on the pin).
- `scripts/rac-export-gap-pending.json` lists ticketed misses. Open ticket →
  PENDING (exit 0 for that symbol). Unlisted missing, closed ticket, or a
  now-present listed symbol fails. Seeded with NavigationTree ×7 (#228),
  `MenuLoadMoreItem` (#229), `setInteractionModality` (#231), and
  `TokenFieldValue` (#118).
- Unit tests: `scripts/check-rac-export-gap.test.ts` (fixture barrels, not the
  live repo).
- `certification.md` is owned by another lane this session; the name-check
  vs behavior distinction is in `.claude/current/tooling.md`.
- `TokenFieldValue` still does not resolve from `solidaria-components` — that
  remains #118. The gate now sees it.
