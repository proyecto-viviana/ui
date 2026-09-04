---
id: 241
type: task
title: "Handle shadow-DOM focus events in preventFocus and RangeCalendar"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "ported preventFocus shadow-root listeners and RangeCalendar getEventTarget; tests red-then-green",
    }
---

## Cause

RAC 1.21.0 adds real-browser shadow-root tests that jsdom cannot reproduce.
`preventFocus` now listens on the target's shadow root and treats descendant
focus/blur as moving to/from the target
(`packages/react-aria/src/interactions/utils.ts:125-185` on `f56660b`).
`useRangeCalendar` reads `getEventTarget(e)` instead of `e.target`
(`packages/react-aria/src/calendar/useRangeCalendar.ts:79`). New suites:
`test/ShadowDOMFocus.browser.test.tsx` (ComboBox/NumberField/Menu inside a
shadow root), `test/RangeCalendar.shadow.test.tsx`, and S2
`test/DateRangePicker.browser.test.tsx`. `guard:upstream-test-parity` added
unmatched `shadowdomfocus` and `rangecalendar.shadow`.

## Work

Port the shadow-root `preventFocus` listeners and RangeCalendar
`getEventTarget`. Add shadow-root browser evidence for ComboBox, NumberField,
RangeCalendar, and DateRangePicker.

## Done when

The three new upstream shadow suites have Solid counterparts that fail if
focus events are only listened on `window`/`document`.

## Relationship

Child of #220. Adjacent to #123 (scroll across shadow roots).

## Landed

`react-spectrum/packages/react-aria/src/interactions/utils.ts:135-136`
→ `packages/solidaria/src/utils/focus.ts:194-195`
→ `listens for focus events on the target shadow root, not only the window`

`react-spectrum/packages/react-aria/src/calendar/useRangeCalendar.ts:79`
→ `packages/solidaria/src/calendar/createRangeCalendar.ts:226`
→ `uses getEventTarget so a pointerup whose event.target is not the inner node still sees the composed path`
(also `should commit the selection when releasing a drag outside the calendar`, `should commit the selection when tabbing away mid selection`)

Red-then-green: forced `root = ownerWindow` in preventFocus; shadow spy test failed (0 calls). Used `e.target` instead of `getEventTarget`; composed-path test failed (onChange fired). Restored, green.

## Out of lane

- ComboBox / Menu shadow-root browser suite (`ShadowDOMFocus.browser.test.tsx`): ComboBox source and `ComboBox.test.tsx` belong to the concurrent lane. preventFocus coverage is the shared branch those components use.
- NumberField shadow-root browser suite: same preventFocus branch; no NumberField source change in this lane.
- S2 `DateRangePicker.browser.test.tsx`: `packages/solid-spectrum/**` is out of fence.
