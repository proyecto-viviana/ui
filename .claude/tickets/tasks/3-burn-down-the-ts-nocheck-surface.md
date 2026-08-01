---
id: 3
type: task
title: "Burn down the ts-nocheck surface"
created: 2026-08-01
status: open
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
---
**58 files carrying `@ts-nocheck`, covering 37,456 lines** — in the design system every product
in the hub imports. Type errors in those files are not errors; they are invisible, including in
the public API surface consumers rely on.

## Scope

This is a burn-down, not a sprint. Order by consumer exposure: **public API surface first**,
internals last. Track the count so it can only go down — add a check that fails when a new
`@ts-nocheck` appears (which is cheap, and stops the number growing while the backlog is
worked).

## Done when

The count only decreases, and no file in the public API surface carries the pragma.

## Relationship

Finding `L1-M2-typecheck-gate-skips-37k-lines` (CONFIRMED). Related: #2 (same class of suppressed signal).

