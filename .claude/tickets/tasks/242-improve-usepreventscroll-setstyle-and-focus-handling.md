---
id: 242
type: task
title: "Improve usePreventScroll setStyle and focus handling"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
---

## Cause

RAC 1.21.0 changes `usePreventScroll` to set kebab-case CSS
(`scrollbar-gutter`, `padding-right`) and to override
`HTMLElement.prototype.focus` via `Reflect.defineProperty` so restore is
clean (`packages/react-aria/src/overlays/usePreventScroll.ts:74-75, 195-222`
on `f56660b`). `setStyle`/`addEvent` moved to `domHelpers`. Release note:
"Improve setStyle and focus handling in usePreventScroll". Local still
passes camelCase `'scrollbarGutter'` / `'paddingRight'`
(`packages/solidaria/src/overlays/createPreventScroll.ts:74-77`).

## Work

Port the kebab-case style keys and the Reflect focus override. Keep
`setStyle`/`addEvent` on the shared DOM helpers if that is how upstream
landed.

## Done when

Prevent-scroll restore returns the previous focus implementation and the
previous gutter/padding; a test fails if camelCase style keys are written
again.

## Relationship

Child of #220. Adjacent to #234 (overlay position).
