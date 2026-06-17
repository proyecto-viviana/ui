---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Calendar: add `selectionMode="multiple"` for selecting multiple dates (port of react-aria-components 1.18)

React Aria 1.18 added multiple-date selection to the Calendar: with
`selectionMode="multiple"` the value becomes an array and clicking a day toggles
it on or off instead of replacing the single selection. This ports the full
stack across `solid-stately`, `solidaria`, and `solidaria-components`.

The value model mirrors upstream. `createCalendarState` gains a second,
defaulted generic — `M extends CalendarSelectionMode = "single"` — so existing
single-mode callers are unchanged (`value` stays `DateValue | null`), while
`M extends "multiple"` widens `value` / `defaultValue` / `onChange` to
`readonly DateValue[]` via the new `CalendarValueType<T, M>` helper. In multiple
mode `setValue(null)` clears to `[]` (rather than `null`), `selectDate` toggles
the target via `isSameDay` (removing it if already present, appending it
otherwise), `isSelected` tests array membership, and `selectFocusedDate` routes
through `selectDate` so keyboard Enter/Space toggles too. `createCalendarState`
also exposes a `selectionMode` accessor on the state. New type exports:
`CalendarSelectionMode` and `CalendarValueType`.

In `solidaria`, `createCalendarGrid` now sets `aria-multiselectable="true"` on
the grid when the state is a RangeCalendar (`highlightedRange`) **or** a Calendar
in multiple-selection mode, matching upstream `useCalendarGrid`.

In `solidaria-components`, the headless `Calendar` is now generic over `M`,
threads `selectionMode` into the state props, and forwards the widened
`value` / `defaultValue` / `onChange` types so render-prop consumers get the
array value. `CalendarProps` gains the `M` generic (defaulted to `"single"`, so
existing usages need no change).
