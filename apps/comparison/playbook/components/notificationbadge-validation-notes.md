# NotificationBadge Validation Notes

Pre-pass note. NotificationBadge has not had its own full support-component
validation pass yet. This file exists so Button-family discoveries are not lost
before that pass.

## Target

- Component: NotificationBadge
- Slug: none in current official comparison catalogue
- Family or direct subcomponents: none
- Pass goal: pending
- Date: 2026-05-14

## Incoming Cross-Component Findings

| Discovered in      | Upstream owner | Affected API/context       | Required later validation                                                                                                            |
| ------------------ | -------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Button-family pass | `ActionButton` | `NotificationBadgeContext` | Validate context-provided `size`, `staticColor`, `isDisabled`, absolute positioning styles, refs, local props, and localized labels. |

## Notes

- Upstream S2 `ActionButton` provides `NotificationBadgeContext` for children
  rendered inside an action button.
- The Button-family pass added a minimal Solid `NotificationBadge` so nested
  ActionButton badge composition can be represented.
- The support-component pass must still validate value formatting, `99+`
  behavior, indicator-only labeling, disabled behavior, color behavior,
  accessibility, and visual parity against upstream S2.

## Current Evidence

- Nested ActionButton composition and indicator-only Spanish labeling are covered
  by `packages/solid-spectrum/test/ButtonFamilyContext.test.tsx`.
- Standalone NotificationBadge acceptance is not covered by that test.
