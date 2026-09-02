---
id: 236
type: task
title: "Allow Calendar selection outside the visible range when isDateUnavailable is set"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "ported useCalendarState.normalizeValue lowerBound; range calendar at the pin still walks from visibleRange.start — no Solid change",
    }
---

## Cause

RAC 1.21.0 lets Calendar select a date outside the visible month when
`isDateUnavailable` is set. `useCalendarState.normalizeValue` now walks
`previousAvailableDate` from `minValue ?? minDate(constrained, startDate)`
instead of from `startDate` alone
(`packages/react-stately/src/calendar/useCalendarState.ts:232-235` on
`f56660b`). Tests:
`packages/react-aria-components/test/Calendar.test.js:524, 553`. Local range
state still walks from `visibleRange().start`
(`packages/solid-stately/src/calendar/createRangeCalendarState.ts:800-803`).
Release note: "Allow selecting dates outside the visible range when
isDateUnavailable is set".

## Work

Port the lower-bound change in calendar state (single and range). Add the
before/after visible-range selection tests.

## Done when

Selecting a date before or after the visible month with
`isDateUnavailable={() => false}` succeeds; the tests fail if the walk is
clamped to `startDate`.

## Relationship

Child of #220. Adjacent to #189 (SSR date/calendar).

## Landed

- `react-stately/src/calendar/useCalendarState.ts:232-235` → `packages/solid-stately/src/calendar/createCalendarState.ts:428-460` → `selects a date before the visible range when isDateUnavailable is provided` / `selects a date after the visible range when isDateUnavailable is provided` (`packages/solid-stately/test/createCalendarState.test.ts`; same names in `packages/solidaria-components/test/Calendar.test.tsx`)
- Range: pin `useRangeCalendarState.ts:178-182` still walks `previousAvailableDate` from `calendar.visibleRange.start`. Solid `createRangeCalendarState.ts:800-803` already matches. Ticket claim that range needed the same lowerBound change is wrong vs the pin — no invent.
- Red-then-green: before-visible-range with walk clamped to `startDate` left `value()` undefined / `"none"`; restored, green.
