---
id: 5
type: task
title: "One pnpm version, and settings in pnpm-workspace.yaml"
created: 2026-08-01
status: open
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
  - {
      state: open,
      at: 2026-09-08,
      note: "in-repo half is done on HEAD 9129471d: packageManager pnpm@11.22.0; settings live in pnpm-workspace.yaml; package.json has no pnpm key. Hub-wide Done-when not met. Stays open.",
    }
---

The original finding: this repo disagreed with the rest of the hub about the
pnpm version, and it kept pnpm settings in `package.json` where newer pnpm
expects them in `pnpm-workspace.yaml` — so some settings were silently not
applied.

Small, but it produces resolution differences between repos that get diagnosed as dependency
bugs.

## Scope

Match the hub's pnpm version via `packageManager`. Move the settings to
`pnpm-workspace.yaml`. Then check the resolution actually changed — if it did, that difference
was live.

## Current (HEAD `9129471d`)

The in-repo half is done. `packageManager` is `pnpm@11.22.0`. pnpm settings
live in `pnpm-workspace.yaml` (`overrides`, `allowBuilds`, `catalog`,
`peerDependencyRules`, fetch retries). `package.json` has no `pnpm` key.
pnpm 11 does not read `package.json#pnpm`.

## Done when

Every repo in the hub declares the same `packageManager`, and pnpm reports no ignored settings.
That hub-wide remainder is not proved from this checkout. This ticket stays open.

## Relationship

Findings `L7-pnpm-six-versions-and-dead-overrides`, `L7-node-pinning-and-engines-disagree`. Consolidation row R2.7.
