# Image Validation Notes

Pre-pass note. Image has not had its own full component validation pass yet.
This file exists so Button-family discoveries are not lost before that pass.

## Target

- Component: Image
- Slug: image
- Family or direct subcomponents: ImageCoordinator
- Pass goal: pending
- Date: 2026-05-14

## Incoming Cross-Component Findings

| Discovered in      | Upstream owner | Affected API/context | Required later validation                                                                                  |
| ------------------ | -------------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Button-family pass | `ActionButton` | `ImageContext`       | Validate that Image consumes context-provided `styles`, hidden/visibility behavior, refs, and local props. |

## Notes

- Upstream S2 `ActionButton` provides `ImageContext` for children rendered
  inside an action button.
- The Button-family pass added only enough Solid Image context handling to
  exercise nested ActionButton composition and pending-state visibility.
- The Image pass must still validate standalone Image docs/API, ImageCoordinator
  if applicable, loading/error behavior, accessibility, visual parity, and route
  coverage.

## Current Evidence

- Nested ActionButton composition is covered by
  `packages/solid-spectrum/test/ButtonFamilyContext.test.tsx`.
- Standalone Image acceptance is not covered by that test.
