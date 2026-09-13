---
id: 532
type: task
title: "Spike Solid 2 compiler and toolchain in solid-stately"
created: 2026-09-13
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to test Solid 2.0 compiler, tsdown/esbuild, and vitest against pure state package",
    }
---

## Cause

`solid-stately` is the pure state layer with no DOM dependencies. It provides
the safest isolated boundary to test the Solid 2.0 compiler, fine-grained
reactivity runtime, and build pipelines before touching DOM packages.

## Work

1. Spike `solid-js@2` in `packages/solid-stately`.
2. Verify package build output under `tsdown` / `esbuild`.
3. Run `packages/solid-stately` unit test suite under Vitest.
4. Record breaking compiler changes and JSX runtime differences.

## Done when

`packages/solid-stately` builds cleanly and passes all unit tests on the Solid 2.0
runtime.

## Relationship

Child of #531. Precursor to #533 and #534.
