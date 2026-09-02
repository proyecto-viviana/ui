---
id: 236
type: task
title: "Allow Calendar selection outside the visible range when isDateUnavailable is set"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
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
