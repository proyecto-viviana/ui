---
id: 5
type: task
title: "One pnpm version, and settings in pnpm-workspace.yaml"
created: 2026-08-01
status: open
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
---
This repo disagrees with the rest of the hub about the pnpm version, and it keeps pnpm settings
in `package.json` where newer pnpm expects them in `pnpm-workspace.yaml` — so some settings
are silently not applied.

Small, but it produces resolution differences between repos that get diagnosed as dependency
bugs.

## Scope

Match the hub's pnpm version via `packageManager`. Move the settings to
`pnpm-workspace.yaml`. Then check the resolution actually changed — if it did, that difference
was live.

## Done when

Every repo in the hub declares the same `packageManager`, and pnpm reports no ignored settings.

## Relationship

Findings `L7-pnpm-six-versions-and-dead-overrides`, `L7-node-pinning-and-engines-disagree`. Consolidation row R2.7.

