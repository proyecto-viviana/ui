---
id: 153
type: task
title: "Ratchet the ts-nocheck allowlist after each removal"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`guard:ts-nocheck-budget` fails new paths. Removals are only logged.
`baseline.paths` never shrinks, so restoring `@ts-nocheck` on a cleaned file
still passes.

## Work

Drop a path from `allowed` when it is removed. Keep `--write-baseline` for
intentional inventory edits.

## Done when

Re-adding `@ts-nocheck` to a cleaned path fails CI.

## Relationship

F-TS-001. Child of #3. The burn-down itself stays on #3.
