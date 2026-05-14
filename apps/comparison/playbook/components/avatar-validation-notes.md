# Avatar Validation Notes

Pre-pass note. Avatar has not had its own full component validation pass yet.
This file exists so Button-family discoveries are not lost before that pass.

## Target

- Component: Avatar
- Slug: avatar
- Family or direct subcomponents: AvatarGroup
- Pass goal: pending
- Date: 2026-05-14

## Incoming Cross-Component Findings

| Discovered in      | Upstream owner | Affected API/context | Required later validation                                                                                |
| ------------------ | -------------- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| Button-family pass | `ActionButton` | `AvatarContext`      | Validate that Avatar consumes context-provided `size`, `styles`, `slot="avatar"`, refs, and local props. |

## Notes

- Upstream S2 `ActionButton` provides `AvatarContext` for children rendered
  inside an action button.
- The Button-family pass added only enough Solid Avatar context handling to
  exercise nested ActionButton composition.
- The Avatar pass must still validate standalone Avatar docs/API, AvatarGroup,
  image fallback behavior, sizing, accessibility, visual parity, and route
  coverage.

## Current Evidence

- Nested ActionButton composition is covered by
  `packages/solid-spectrum/test/ButtonFamilyContext.test.tsx`.
- Standalone Avatar acceptance is not covered by that test.
