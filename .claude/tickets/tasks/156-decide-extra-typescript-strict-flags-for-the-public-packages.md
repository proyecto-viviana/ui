---
id: 156
type: task
title: "Decide extra TypeScript strict flags for the public packages"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: do not enable noUncheckedIndexedAccess or exactOptionalPropertyTypes repo-wide now; make solid-stately extend the root tsconfig; revisit after #3 shrinks",
    }
  - {
      state: merged,
      at: 2026-09-01,
      note: "solid-stately tsconfig.json now extends tsconfig.typecheck.json",
    }
  - { state: verified, at: 2026-09-01, note: "owner 2026-09-01" }
---

## Cause

Root `strict` is on. `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes` are not. Tree `return potentialTargets[0]` after
`length < 2` can be undefined. solid-stately's package tsconfig does not
extend the root.

## Decision

Owner 2026-09-01: do not enable those extra flags repo-wide now. Make package
tsconfigs extend the root (or `tsconfig.typecheck.json`) so a package-local
`tsc` is not a weaker back door. Revisit `noUncheckedIndexedAccess` as a
later phase of #3, public API first.

## Work

Make `packages/solid-stately/tsconfig.json` extend the shared typecheck
config.

## Done when

The decision is recorded, and package tsconfigs either extend the root or
name their weaker flags.

## Relationship

F-TS-005. Owner decision.
