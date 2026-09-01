---
id: 47
type: task
title: "Move solid-spectrum declarations to Vite Plus packaging"
created: 2026-08-20
parent: 27
status: in-progress
history:
  - { state: in-progress, at: 2026-08-20, note: "migrated from legacy task pkg-build-spectrum-dts" }
---

Use the native Vite Plus package build to emit and validate `solid-spectrum`
declarations. The former 2026-06-20 target is stale.

2026-09-01 audit: every public pack block still sets `dts: false` and every
public `build` script still runs `tsc -p tsconfig.build.json`. solid-stately
pack emits `dist/private/flags/flags.js` while tsc emits `dist/flags/flags.d.ts`.

## Done when

The package build emits the declared public types without the former packaging
path, and the package artifact checks pass.

## Relationship

Replaces `pkg-build-spectrum-dts`. The former packaging path is retired.
