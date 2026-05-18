# Calendar Validation Notes

Date: 2026-05-18

## Scope

- React reference: `@react-spectrum/s2/Calendar`.
- Solid target: `@proyecto-viviana/solid-spectrum/Calendar`.
- Checklist source: S2 docs sections Value, Validation, Controlling the focused date, and API.

## Covered

- Public root export and `./Calendar` subpath export.
- `CalendarContext` export for S2-style prop context composition.
- Controlled `value` and `onChange` selection behavior.
- `firstDayOfWeek` string normalization for S2 values.
- `visibleMonths` one- and two-month rendering.
- `minValue`, `maxValue`, and `isDateUnavailable` route coverage.
- `isDisabled`, `isReadOnly`, `isInvalid`, and `errorMessage` route coverage.
- Light and dark visual route smoke coverage for selected-day styling.

## Follow-Ups

- `pageBehavior`, `selectionAlignment`, and custom `createCalendar` are still lower-level calendar state gaps.
- Strict React-vs-Solid pixel pair-diff is still planned; the route now has live visual evidence and behavioral contracts.
