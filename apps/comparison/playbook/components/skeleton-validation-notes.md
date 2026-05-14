# Skeleton Validation Notes

Pre-pass note. Skeleton has not had its own full component validation pass yet.
This file exists so Button-family discoveries are not lost before that pass.

## Target

- Component: Skeleton
- Slug: skeleton
- Family or direct subcomponents: SkeletonCollection
- Pass goal: pending
- Date: 2026-05-14

## Incoming Cross-Component Findings

| Discovered in      | Upstream owner                                         | Affected API/context | Required later validation                                                                                         |
| ------------------ | ------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Button-family pass | `Button`, `LinkButton`, `ActionButton`, `ToggleButton` | `SkeletonContext`    | Validate that button-family components reset skeleton inheritance and that Skeleton consumers follow upstream S2. |

## Notes

- Upstream S2 button-family components provide `SkeletonContext` as `null` so
  skeleton state does not accidentally leak into button child composition.
- The Button-family pass added only the internal context/consumer surface needed
  by button composition. `SkeletonContext` intentionally remains out of the
  root public export surface because upstream S2 does not export it there.
- The Skeleton pass must still validate standalone Skeleton docs/API,
  SkeletonCollection, animation/state behavior, accessibility expectations,
  visual parity, and route coverage.

## Current Evidence

- Button-family providers now mount `SkeletonContext.Provider value={null}`.
- Standalone Skeleton acceptance is not covered by Button-family tests.
