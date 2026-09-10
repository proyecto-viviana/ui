---
id: 528
type: task
title: "Mount a Solid Geist Button fixture in the comparison app"
created: 2026-09-10
parent: 526
status: open
history:
  - { state: open, at: 2026-09-10, note: "Solid-only until a legal React oracle exists" }
---

Mount a Solid Geist Button fixture in the comparison harness.

## Scope

- Cover variant, size, shape, svgOnly, prefix, loading, disabled, light,
  and dark cases.
- Keep Geist paint out of `apps/comparison`.
- Do not mount `@vercel/geistcn`. It is not on public npm.

## Done when

The Solid fixture renders in development and production builds. Shared
controls update the public API. No comparison-local CSS changes Geist
paint.

## Relationship

Depends on #527. There is no React pair until an owner-approved oracle
exists.
