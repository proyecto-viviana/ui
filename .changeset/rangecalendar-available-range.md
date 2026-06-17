---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria-components": patch
---

RangeCalendar: derive available dates from the first selected date (port of react-aria-components 1.18)

React Aria 1.18 made `RangeCalendar`'s `isDateUnavailable` anchor-aware so that,
once the first endpoint of a range is selected, the still-selectable dates are
bounded by the nearest unavailable date on each side (you can't form a range that
spans an unavailable day unless `allowsNonContiguousRanges` is set).

`createRangeCalendarState` now mirrors upstream `useRangeCalendarState`:

- `isDateUnavailable` widens to `(date: DateValue, anchorDate: CalendarDate | null)
  => boolean`. The second argument is the current selection anchor, so consumers
  can adjust availability based on the user's first pick. (Single-argument
  callbacks remain assignable, so existing callers are unchanged.)
- While anchored, an available range is derived via `nextUnavailableDate` — walking
  outward from the anchor until the first unavailable date on each side — and used
  to narrow the effective min/max. This flows into `isCellDisabled`,
  `isDateOutsideAllowedRange` (so the previous/next page buttons disable at the
  span edges), and `constrainDate` (so focus stays within the span). Setting
  `allowsNonContiguousRanges` skips the narrowing.
- `isValueInvalid` now also reports `true` when a committed range (not mid-drag)
  has an endpoint that is unavailable or outside `[minValue, maxValue]`.

`RangeCalendar` (solidaria-components / solid-spectrum) inherits the widened
callback type from `RangeCalendarStateProps`. The `DateRangePicker` adapts the
anchor-aware callback to the 1-argument form its text fields expect (a field has
no range anchor, so it is called with a `null` anchor).
