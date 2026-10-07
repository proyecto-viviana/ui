---
id: 3
type: task
title: "Burn down the ts-nocheck surface"
created: 2026-08-01
parent: 24
status: in-progress
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
  - {
      state: open,
      at: 2026-08-08,
      note: "froze the exact 59-file inventory; blocking CI budget now permits only removals",
    }
  - {
      state: open,
      at: 2026-09-01,
      note: "owner 2026-09-01: do not enable noUncheckedIndexedAccess or exactOptionalPropertyTypes repo-wide until this burn-down shrinks; that is a later phase of this ticket, public API first",
    }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "Dropped @ts-nocheck from CardView, button/s2-progress-circle-styles.ts, and s2-internal/page.macro.ts in both solid-spectrum and viviana-ui. guard:ts-nocheck-budget is 53/53. CardView omits ref and layout from the headless props, and loading follows loadingState, matching upstream. Public component modules still carry the pragma, so this is not verified. noUncheckedIndexedAccess and exactOptionalPropertyTypes stay off.",
    }
---

**53 files still carry `@ts-nocheck`.** The 2026-08-01 audit counted 59 files and 38,091 lines.
The ceiling is 53. Type errors in the files that remain are invisible, including in the public
API surface consumers rely on.

## Scope

This is a burn-down, not a sprint. Order by consumer exposure: **public API surface first**,
internals last. Track the count so it can only go down — add a check that fails when a new
`@ts-nocheck` appears (which is cheap, and stops the number growing while the backlog is
worked).

The current inventory is tracked path-by-path in
`scripts/ts-nocheck-baseline.json`. `guard:ts-nocheck-budget` runs blocking in
Certification Gates. #577 already made this a ratchet: a path that loses the
pragma fails as stale until `--write-baseline` drops it, and that writer
refuses growth. The ceiling is 53. Public component modules still carry the
pragma; this burn-down is not finished.

## Done when

The count only decreases, and no file in the public API surface carries the pragma.
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are a later phase
after that shrink, not a parallel type war (#156).

## Relationship

Finding `L1-M2-typecheck-gate-skips-37k-lines` (CONFIRMED). Related: #2 (same class of suppressed signal).
This ticket also replaces legacy task `ts-nocheck-components` from
the retired tech-debt note; both records describe the same burn-down.
