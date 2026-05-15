# Text Validation Notes

Pre-pass note. Text has not had its own full support-component validation pass
yet. This file exists so Button-family discoveries are not lost before that
pass.

## Target

- Component: Text
- Slug: none in current official comparison catalogue
- Family or direct subcomponents: Heading, Keyboard, Content-related text slots
- Pass goal: pending
- Date: 2026-05-14

## Incoming Cross-Component Findings

| Discovered in      | Upstream owner                                         | Affected API/context | Required later validation                                                                                     |
| ------------------ | ------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Button-family pass | `Button`, `LinkButton`, `ActionButton`, `ToggleButton` | `TextContext`        | Validate context-provided text styling, slot markers, pending visibility, refs if supported, and local props. |

## Notes

- Upstream S2 button-family components provide `TextContext` for explicit
  `<Text>` children rendered inside buttons.
- The Button-family pass added only enough Solid Text context handling to
  exercise nested button composition.
- The Text/support pass must still validate Text, Heading, Keyboard, Content
  slots, standalone export expectations, accessibility, and every parent that
  provides text slot context.

## Current Evidence

- Nested Button-family text composition is covered by
  `packages/solid-spectrum/test/ButtonFamilyContext.test.tsx`.
- Standalone Text/support-component acceptance is not covered by that test.

## Acceptance Status

- Text is pre-pass only. It must not be counted as comparison-live or
  playbook-complete.
- The later Text pass must run the full playbook instead of inheriting
  acceptance from Button-family composition evidence.
