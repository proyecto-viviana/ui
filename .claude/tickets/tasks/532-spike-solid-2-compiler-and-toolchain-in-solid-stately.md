---
id: 532
type: task
title: "Spike Solid 2 compiler and toolchain in solid-stately"
created: 2026-09-13
parent: 531
status: merged
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to test Solid 2.0 compiler, tsdown/esbuild, and vitest against pure state package",
    }
  - {
      state: open,
      at: 2026-09-18,
      note: "workspace pin freeze to solid-js@2.0.0-rc.9 / @solidjs/web@2.0.0-rc.9 / @solidjs/vite-plugin@3.0.0-next.44; split createEffect and drop createComputed/batch/on in solid-stately",
    }
  - {
      state: merged,
      at: 2026-09-19,
      note: "Workspace freeze on rc.9 + vite-plugin next.44. solid-stately rewritten for split createEffect, ownedWrite, live internal signals (getObserver + mirror; latest() does not see unflushed writes). 924/924 unit tests pass. vp pack + tsc build. Remaining comboBox STRICT_READ_UNTRACKED is one apply-callback snapshot.",
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
