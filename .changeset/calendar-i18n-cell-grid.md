---
"@proyecto-viviana/solidaria": minor
---

Localize calendar cell and grid accessible labels

The calendar hooks now route their accessible strings through the shipped i18n
dictionaries instead of hardcoding English, mirroring `@react-aria/calendar`:

- **Cell label** (`createCalendarCell`): the selected/today suffix goes through
  `formatCalendarLabel`, matching useCalendarCell. Today's cell now gains the
  localized "Today, …" prefix it previously dropped, and the selected suffix is
  localized (en-US `… selected`, fr-FR `… sélectionné`, ar-AE `… المحدد`) instead
  of a hardcoded `" selected"`. The non-today, non-RTL output is byte-identical to
  before.
- **Grid accessible name** (`createCalendar` / `createRangeCalendar` /
  `createCalendarGrid`): the calendar publishes its `aria-label`/`aria-labelledby`
  into the shared `CalendarHookData`, and each grid composes
  `[ariaLabel, visibleRangeDescription].filter(Boolean).join(", ")` over its own
  start/end — so a multi-month calendar names each grid by its own month, matching
  useCalendarGrid. Previously the grid had no accessible name.

A contract test exercises en-US, fr-FR, and the RTL ar-AE locale, plus the
per-grid accessible name, closing the i18n regression gap for these strings.

The date/time segment field label remains English-only for now (tracked
separately); this change covers the calendar cell and grid only.
