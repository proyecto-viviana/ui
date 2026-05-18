# DateRangePicker Validation Notes

Date: 2026-05-18
Status: partial

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                                                                                                                                                                       | Blockers/owner                                                                                                                                                                                                         |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | partial | Official S2 page checked 2026-05-18 through the S2 docs MCP. Primary example is `import {DateRangePicker} from '@react-spectrum/s2/DateRangePicker'; <DateRangePicker />`. Docs sections inventoried: Value, Forms, API. The comparison route now mounts React and Solid styled stacks.        | Dedicated route states are still needed for min/max/unavailable dates, `firstDayOfWeek`, `pageBehavior`, form submission with `startName`/`endName`, time granularity/hour cycle, and locale/calendar-system examples. |
| Upstream React Source Parity             | partial | React S2 source was checked locally from `apps/comparison/node_modules/@react-spectrum/s2/src/DateRangePicker.tsx`. Solid now mirrors the S2 size names, field shell, required/invalid/help text surface, calendar button state, and popover surface where the current headless model permits. | Solid does not yet expose slot-based start/end `DateInput` segment fields like React Aria Components, and RangeCalendar S2 styling remains its own component pass.                                                     |
| Solid Idiomatic Implementation           | partial | `DateRangePicker` now supports uncontrolled `defaultOpen`, controlled `isOpen`, and `onOpenChange` through overlay state rather than a local effect. Package tests assert default-open rendering and controlled open requests.                                                                 | Hidden form inputs for `startName`/`endName` are not implemented.                                                                                                                                                      |
| Accessibility And I18n                   | partial | Existing headless tests cover localized start/end labels, keyboard open, Escape close, disabled/read-only data, validation descriptions, and popup rendering. Styled tests cover labels, description/error linkage, disabled button state, and S2 size prop acceptance.                        | Screen-reader matrix, locale/calendar-system rows, and form submission rows remain open.                                                                                                                               |
| Style Source-To-Computed Parity          | partial | Solid styled DateRangePicker moved from legacy utility class sizing to generated S2 field/popup classes, with route controls for `size` and `maxVisibleMonths`.                                                                                                                                | Strict React-vs-Solid field and overlay pair diffs remain planned until segmented DateInput and RangeCalendar S2 work land.                                                                                            |
| React-Vs-Solid Comparison Harness Parity | partial | React fixture imports real `@react-spectrum/s2` DateRangePicker; Solid fixture imports public `@proyecto-viviana/solid-spectrum` DateRangePicker. Both fixtures expose value, open-state, color-scheme, and serialized control evidence.                                                       | Browser evidence is intentionally smoke-level for this pass.                                                                                                                                                           |
| Evidence And Handoff                     | partial | Focused package tests, focused browser route coverage, `check:fix`, gap report, and export report passed/refreshed on 2026-05-18.                                                                                                                                                              | Component remains partial until blockers above are closed.                                                                                                                                                             |

## Covered

- DateRangePicker is now live on both React and Solid styled comparison stacks.
- Side-panel controls cover label, S2 size, max visible months, description, error text, disabled, required, and invalid states.
- Headless DateRangePicker open state is controlled/uncontrolled without a mirror effect.
- Solid styled DateRangePicker uses S2 size values and generated field/popup shell styling.

## Remaining Gaps

- Replace display-only start/end field text with segment-based DateInput editing parity.
- Complete RangeCalendar S2 styling and strict overlay pair-diff evidence.
- Add route states for date availability, min/max, first day of week, page behavior, form names/submission, time values, and locale/calendar systems.
- Add explicit assistive-technology rows for range entry and selection.
