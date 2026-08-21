---
id: 22
type: task
title: "Prove or disable published macro source maps"
created: 2026-08-20
parent: 27
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated A-017 from the latest-work build review" }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "selected after ticket #20; tracing the styled-package macro transform and its published source maps",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "preserved the macro map through JSX output, rejected unmapped late transforms, removed the unused bundling rule, and proved an exact generated-to-authored position",
    }
---

The six-package build passes, but styled package builds emit repeated
`SOURCEMAP_BROKEN` warnings for files transformed by `unplugin-macros`.
Existing structural checks prove that map JSON parses and references existing
files. They do not prove that generated positions map to authored positions.

## Scope

- [x] Create a small style-macro fixture with known authored and generated
      locations.
- [x] Resolve a generated location back to its source with a standard source-map
      consumer.
- [x] Fix the transform map chain if the resolved position is wrong.
- [x] If accurate maps cannot be produced, disable misleading maps explicitly and
      document the release tradeoff.
- [x] Remove the unused `@adobe/spectrum-tokens` `deps.onlyBundle` entry if the
      current build confirms that it has no effect.
- [x] Add a guard that fails on an unreviewed broken-map warning.

Do not treat parseable map JSON as mapping-fidelity evidence.

## Checkpoint

Both styled package builds used the same local wrapper around
`unplugin-parcel-macros`. The JSX-preserve pass removed a virtual CSS import and
then replaced the macro's valid map with `null`. Its `renderChunk` hook also
returned unchanged code as a new transform without a map. Rolldown reported
`SOURCEMAP_BROKEN` for both cases.

The shared package wrapper now keeps the macro map when it removes the appended
CSS import. That removal does not move a retained generated position. The
wrapper returns `null` for an unchanged chunk and rejects any late CSS-import
rewrite. Both styled package builds also fail if Rolldown reports another
`SOURCEMAP_BROKEN` warning.

The regression uses Node's standard `SourceMap` consumer. It maps the generated
`authoredStyle` binding at line 1, column 13 to the fixture binding at line 3,
column 13. The two package builds completed without a broken-map warning. They
also completed without the old unused `deps.onlyBundle` warning after the
configuration set that policy to `false`.

Verification on 2026-08-21:

- `vp run guard:package-sourcemaps` — passed the exact generated-to-authored
  position check and the synthetic broken-warning rejection.
- `vp run build:solid-spectrum` — both build passes completed; the filtered log
  contained no `SOURCEMAP_BROKEN` or `onlyBundle` warning.
- `vp run build:viviana-ui` — both build passes completed; the filtered log
  contained no `SOURCEMAP_BROKEN` or `onlyBundle` warning.

## Done when

The build is warning-free for this condition and a regression proves the
selected source-map policy.

## Relationship

Carries forward adversarial-audit finding A-017. Supports the build migration
review in ticket #10.
