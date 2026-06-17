---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Calendar: add `CalendarMonthPicker` and `CalendarYearPicker` (port of react-aria-components 1.18)

React Aria 1.18 added month/year "jump-to" pickers to the Calendar so users can
move focus directly to a month or year instead of paging. This ports the full
stack: the `createCalendarMonthPicker` / `createCalendarYearPicker` aria hooks in
`solidaria`, and the headless `CalendarMonthPicker` / `CalendarYearPicker`
render-prop components in `solidaria-components`.

Mirroring upstream, each component is context-agnostic — it reads whichever
calendar state is present (`CalendarContext` or `RangeCalendarContext`) and works
inside both `Calendar` and `RangeCalendar`. The month picker exposes the months
of the focused year (count derived from `calendar.getMonthsInYear`, honoring
`getFormattableMonth` for offset calendars); the year picker exposes a sliding
window of `visibleYears` (default 20) centered on the focused year and clamped to
the calendar's `minValue` / `maxValue`. Both expose `aria-label`, the focused
`value`, an `onChange` that calls `setFocusedDate`, and a localized `items` list.

To support the year picker's clamp, `CalendarState` and `RangeCalendarState` now
expose `minValue` / `maxValue` accessors. Exported from `solidaria` as the
`createCalendar{Month,Year}Picker` hooks (+ `CalendarMonthPickerProps`,
`CalendarMonthPickerItem`, `CalendarMonthPickerAria`, `CalendarYearPickerProps`,
`CalendarYearPickerFormatOptions`, `CalendarYearPickerItem`,
`CalendarYearPickerAria`) and from `solidaria-components` as the two components
(+ their props and render-prop value types).
