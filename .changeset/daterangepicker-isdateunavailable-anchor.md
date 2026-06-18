---
"@proyecto-viviana/solid-spectrum": patch
---

DateRangePicker: widen the internal `isDateUnavailable` annotation to the anchor-aware form

The S2 `DateRangePicker`'s internal display helper annotated `isDateUnavailable`
as the old single-argument `(date) => boolean`, even though it already forwards
the now anchor-aware callback straight through to the embedded `RangeCalendar` at
runtime. The signature is now `(date, anchorDate) => boolean`, matching upstream's
`useRangeCalendarState` / `DateRangePicker` and the `RangeCalendarStateProps`
callback it forwards to (the second argument is the in-progress range's anchor
date, `null` outside an active selection).

Type fidelity only — the public `DateRangePickerProps` already exposed the
two-argument form by inheritance, and a one-argument callback stays assignable, so
there is no API or behavior change. Existing tests already cover the forwarding
(an unavailable day renders `aria-disabled` in the popover calendar).
