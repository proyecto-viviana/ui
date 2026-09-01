---
id: 155
type: task
title: "Include package tests in the typecheck gate"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`tsconfig.typecheck.json` includes `packages/*/src` and `scripts`. Package
tests live under `packages/*/test` (~292 files) and are compiled by Vitest
esbuild without `tsc`. The same gate config turns `noUnusedLocals` off after
the root tsconfig turned it on.

## Work

Add `packages/*/test` to the typecheck include. Restore unused-local checks
or justify them per file. Triage the existing errors.

## Done when

`vp run typecheck` typechecks package tests.

## Relationship

F-TS-003 and F-TS-004. #49 owns the lint disables, not this tsc include.
