# Depth audit — Calendar / date / time family

## Stage

This is a first depth-first source audit slice after the breadth map. It is research-only and records source deltas and proof obligations.

## Scope audited

Local Solid surfaces:

- `packages/solid-spectrum/src/calendar/index.tsx`
- `packages/solid-spectrum/src/calendar/RangeCalendar.tsx`
- `packages/solid-spectrum/src/calendar/DateField.tsx`
- `packages/solid-spectrum/src/calendar/TimeField.tsx`
- `packages/solid-spectrum/src/calendar/DatePicker.tsx`
- `packages/solid-spectrum/src/calendar/DateRangePicker.tsx`
- `packages/solidaria-components/src/Calendar.tsx`
- `packages/solidaria-components/src/DatePicker.tsx`
- `packages/solidaria-components/src/DateRangePickerContext.tsx`
- `packages/solidaria-components/src/HiddenDateInput.tsx`
- `packages/solidaria/src/calendar/createCalendarCell.ts`
- `packages/solidaria/src/datepicker/createDateSegment.ts`
- `packages/solidaria/src/datepicker/createDatePickerGroup.ts`
- `packages/solid-stately/src/calendar/createCalendarState.ts`
- `packages/solid-stately/src/calendar/createRangeCalendarState.ts`

Upstream and external surfaces:

- `@react-spectrum/s2/src/Calendar.tsx`
- `@react-spectrum/s2/src/RangeCalendar.tsx`
- `@react-spectrum/s2/src/DateField.tsx`
- `@react-spectrum/s2/src/TimeField.tsx`
- `@react-spectrum/s2/src/DatePicker.tsx`
- `@react-spectrum/s2/src/DateRangePicker.tsx`
- React Aria / React Stately date and calendar hooks where behavior is mirrored.
- `@internationalized/date` for date math and formatting behavior.

## Findings

### DTC-001 — Calendar/RangeCalendar source shape is broadly mirrored, but Solid wrappers are not thin RAC equivalents

- Local Spectrum wrappers normalize visible months, render heading/navigation, and map repeated month grids similarly to upstream S2.
- Local `solidaria-components` Calendar creates state/hook wiring and owns root data attributes.
- Local Calendar uses `useIsHydrated()` and renders a placeholder until hydrated, which differs from RAC/S2 server-rendered React output.
- Local Calendar injects a visually hidden heading based on computed `aria-label`; upstream relies on RAC/S2 labeling/heading structure.
- Required proof/fix: decide whether hydration placeholder and hidden heading are accepted Solid deviations, and add SSR/no-JS/first-accessibility-tree tests if accepted.

### DTC-002 — Calendar cell DOM/ARIA has a likely mismatch risk

- Local `createCalendarCell` exposes `td` cell props plus inner `div role="button"` button props.
- The inner `div` receives disabled-related data/ARIA, but native `disabled` has no effect on `div`.
- Local activation uses manual pointerdown/click suppression around selection.
- Risk: RAC CalendarCell behavior may differ in focus, press, disabled, unavailable, and keyboard activation semantics.
- Required proof/fix: compare actual upstream DOM; add tests for pointer/keyboard activation count, disabled/unavailable suppression, focus-visible modality, and screen-reader role/name/state.

### DTC-003 — DateField/TimeField style structure is close, but type-safety debt blocks certification

- Local DateField/TimeField expose Spectrum sizing, label/description/error, required indicator, and unsafe class/style props.
- Local date/time segments expose spinbutton roles, value metadata, readonly/disabled/invalid states, contenteditable editing, input mode, and keyboard/input/composition handlers.
- The audited local Spectrum wrappers include `@ts-nocheck`, which hides upstream generic prop drift and date/time value incompatibilities.
- Local wrappers also include compatibility `class` aliases in addition to upstream-style unsafe class names.
- Required proof/fix: remove `@ts-nocheck`, generate prop-surface diffs, and add segment editing parity tests across locale, granularity, hour cycle, timezone, placeholder, min/max, and validation.

### DTC-004 — DatePicker is substantial but invalid styling, time popover, and close behavior need proof

- Local DatePicker forwards key Calendar/DatePicker props and renders DateInput, segments, trigger button, popover Calendar, and optional TimeField.
- Local headless DatePicker creates DatePicker state, DateField state, Calendar state, contexts, overlay state, and hidden input.
- Wrapper-level invalid styling appears to rely on explicit `local.isInvalid === true`, while headless invalidity can derive from state/builtin validation.
- Local time popover maps day granularity to minute granularity when `hasTime` is true; this needs upstream verification.
- Required proof/fix: consume headless invalid render/state for styling, test `shouldCloseOnSelect`, focus restoration, open/close via button and `Alt+Arrow`, outside click, Escape, and DateTime/ZonedDateTime hidden inputs.

### DTC-005 — DateRangePicker appears to miss or under-prove important upstream prop branches

- Upstream S2 DateRangePicker picks `commitBehavior` from RangeCalendar props.
- The audited local Spectrum DateRangePicker prop excerpt did not show `commitBehavior` exposed.
- Local `allowsNonContiguousRanges` documentation in range state appears semantically wrong: it says selecting the same date for start/end, not non-contiguous unavailable ranges.
- Placeholder/time derivation for range time fields needs direct upstream comparison.
- Required proof/fix: add/verify `commitBehavior`, correct docs/semantics for non-contiguous ranges, and test partial range, hover preview, unavailable ranges, non-contiguous ranges, controlled/uncontrolled range values, start/end focus, hidden inputs, and time-zone values.

### DTC-006 — RangeCalendar state uses correct date math but may be static where upstream is dynamic

- Local state correctly relies on `@internationalized/date` for calendar creation, conversion, month/week math, and titles.
- `visibleMonths` is captured as a number at state creation in audited state code, not as a reactive accessor.
- Calendar state similarly stores `visibleMonths` rather than deriving it reactively.
- Risk: dynamic prop changes for visible months, min/max, focused value, locale, first day, or calendar factory may not match upstream re-render behavior.
- Required proof/fix: add dynamic prop tests or explicitly document mount-only semantics where accepted.

### DTC-007 — Hidden date input needs browser-level form parity certification

- Local `HiddenDateInput` serializes dates, chooses `date`, `datetime-local`, `hidden`, or `text`, and forwards form/name/autocomplete/disabled/required/min/max plus validation state.
- Zoned values and native validation behavior are tricky and need real browser verification against RAC output.
- Required proof/fix: pair hidden input DOM and `FormData` output for CalendarDate, CalendarDateTime, ZonedDateTime, native vs aria validation, form reset, and controlled updates.

## Highest-risk blockers from this slice

1. DateRangePicker `commitBehavior` and non-contiguous range semantics.
2. Calendar cell `div role="button"` activation/focus/disabled parity.
3. `@ts-nocheck` on date/time Spectrum wrappers.
4. Hydration placeholders and hidden headings changing SSR/accessibility surface.
5. Hidden input native validation and serialization parity.
6. Dynamic state prop reactivity for visible months and constraints.

## Suggested test matrix

- Calendar/RangeCalendar: arrow keys, PageUp/PageDown, Home/End, selection, disabled/unavailable dates, invalid state, multi-month pagination, `pageBehavior`, `selectionAlignment`, first day, locale/RTL, non-Gregorian calendars.
- DateField/TimeField: segment names/values, typing, paste/composition, arrows, page keys, wrapping, min/max, placeholder blur, hour cycle, RTL, hidden input and form validation.
- DatePicker/DateRangePicker: open/close, focus return, `shouldCloseOnSelect`, start/end field focus, time field popovers, DateTime/ZonedDateTime, form submission/reset, native and ARIA validation.

## Commands used by the depth-audit agent

- `rg -n "Calendar|DateField|TimeField|DatePicker|DateRangePicker|RangeCalendar" packages apps -g '*.{ts,tsx,jsx,js,md}'`
- `find packages -path '*node_modules*' -prune -o \( -iname '*calendar*' -o -iname '*date*' -o -iname '*time*' \) -print`
- `rg -n "function (Calendar|DateField|DatePicker|DateRangePicker|RangeCalendar|TimeField)|create(Calendar|DateField|DatePicker|DateRangePicker|RangeCalendar|TimeField)State|Hidden|validation|onKeyDown|pageBehavior|selectionAlignment|visibleMonths|shouldCloseOnSelect|granularity|hourCycle|placeholderValue|UNSAFE|@ts-nocheck|useIsHydrated" <local date/calendar files>`
- `rg -n "export function|interface .*Props|visibleMonths|maxVisibleMonths|UNSAFE|CalendarGrid|CalendarCell|TimeField|DatePicker|RangeCalendar|DateRangePicker|DateField|useSpectrumContextProps|react-aria-components|CalendarContext|RangeCalendarContext|FieldError|Text|Popover|DialogTrigger|shouldCloseOnSelect|pageBehavior|granularity|hourCycle|hideTimeZone|placeholderValue" <upstream S2 files>`
- `nl -ba <audited files> | sed -n <ranges>`
- `git status --short --branch`
