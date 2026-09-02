---
id: 241
type: task
title: "Handle shadow-DOM focus events in preventFocus and RangeCalendar"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
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
