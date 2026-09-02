---
id: 242
type: task
title: "Improve usePreventScroll setStyle and focus handling"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "ported kebab-case setStyle and Reflect focus override; tests red-then-green",
    }
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

## Landed

`react-spectrum/packages/react-aria/src/overlays/usePreventScroll.ts:74-75`
→ `packages/solidaria/src/overlays/createPreventScroll.ts:85-86`
(`scrollbar-gutter` / `padding-right` via `setStyle`)

`react-spectrum/packages/react-aria/src/utils/domHelpers.ts:72-131`
→ `packages/solidaria/src/utils/dom.ts:142` (`addEvent`), `:170` (`setStyle`)

`react-spectrum/packages/react-aria/src/overlays/usePreventScroll.ts:195-222`
→ `packages/solidaria/src/overlays/createPreventScroll.ts:209,242` (`Reflect.defineProperty` focus override and restore)

→ `writes kebab-case scrollbar-gutter / padding-right via setProperty, not camelCase style keys`

Red-then-green: passed camelCase keys to `setStyle`; kebab test failed (`kebabCalls.length` was 0). Restored, green.
