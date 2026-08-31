---
id: 38
type: task
title: "Mount matched React and Solid Kumo Button fixtures in the comparison app"
created: 2026-08-20
parent: 29
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "migrated from legacy task kumo-button-pair-fixture",
    }
---

Mount matched upstream React and ported Solid Kumo Button fixtures in the comparison harness.

## Scope

- Use the exact published `@cloudflare/kumo@2.11.0` package as the React oracle.
- Translate one shared fixture model into each framework's real public API.
- Cover variant, size, shape, icon, loading, disabled, light, and dark cases.
- Identify each panel and state without depending on CSS class names.
- Keep all Kumo component paint out of `apps/comparison`.

## Current evidence

- `e2e/kumo-button.spec.ts` holds 11 paired behavior cases. It covers names,
  click, Enter, Space, disabled and loading behavior, shared controls, form
  participation, callback refs, tab order, `:focus-visible`, SSR, and the first
  hydrated click.
- The same file holds 15 paired visual cases and passed twice. It compares rest,
  hover, pressed, focus, light, and dark branches with measured thresholds.

## Done when

Both fixtures render in development and production builds, shared controls
update both public APIs, no comparison-local CSS changes Kumo paint, and the
focused comparison build and typecheck pass.

## Relationship

Depends on #37. Replaces the legacy paired-fixture task and retains its
completed behavior and visual evidence.
