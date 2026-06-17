---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

DateField/DatePicker: constrain dates on blur instead of as-you-type (port of react-aria-components 1.18)

React Aria 1.18 reworked `useDateFieldState` so that an in-progress edit which
momentarily forms an impossible date — e.g. setting the month to February while
the day still reads `31` — is held exactly as typed while the field is focused,
and is only constrained (February 31st → February 28th) when the field is
blurred. Previously each keystroke was constrained immediately, so the day would
silently jump as soon as the month changed. This was Adobe's most-upvoted
DateField issue.

`createDateFieldState` now mirrors upstream by modelling the in-progress edit
with an `IncompleteDate` display value:

- A new `IncompleteDate` (ported from `@react-stately/datepicker`) holds the raw
  segment values, which may represent an invalid combination. It backs the
  segments shown while editing, so the field renders what you typed (`31`) even
  when the resolved date is `28`.
- `setSegment`/`incrementSegment`/`decrementSegment`/`clearSegment` operate on the
  display value. A complete, valid edit commits eagerly (fires `onChange`); an
  incomplete or invalid edit is held without firing `onChange` until blur.
- `confirmPlaceholder` (called on blur) constrains a complete-but-invalid display
  value to the nearest real date and commits it.

As part of matching upstream exactly, a typed value is **no longer snapped to
`minValue`/`maxValue`**. An out-of-range date is kept as entered and reported
through validation (`rangeUnderflow`/`rangeOverflow`) rather than being moved to
the boundary, which is how React Aria behaves.

The `DateFieldState` public interface is unchanged, so `createDateSegment`
(solidaria) and the `DateField`/`DatePicker`/`DateRangePicker` components
(solidaria-components) inherit the new behavior without API changes.
