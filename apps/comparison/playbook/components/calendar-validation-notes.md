# Calendar Validation Notes

Date: 2026-05-18
Status: partial

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                                                                                                                                                      | Blockers/owner                                                                                                              |
| ---------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | partial | Official page opened 2026-05-18: https://react-spectrum.adobe.com/Calendar. Primary example, viewer controls, Provider locale inheritance, and RTL route states are now represented by `apps/comparison/e2e/calendar-contract.spec.ts`.                                       | `docs-blocker`: Unicode calendar-system and custom calendar examples are inventoried but not route-supported.               |
| External Authority And Standards         | partial | S2 docs page, local S2 source, S2 stories, RAC Calendar source, React Aria calendar source, and React Stately calendar source checked.                                                                                                                                        | `authority-blocker`: APG/WCAG/browser forced-colors and keyboard references still need explicit rows.                       |
| Upstream React Source Parity             | partial | Source rows below map `@react-spectrum/s2`, RAC Calendar, React Aria calendar, and React Stately calendar branches to Solid owners.                                                                                                                                           | `source-blocker`: custom `createCalendar` remains a gap; full branch ledger is not exhaustive yet.                          |
| Solid Idiomatic Implementation           | partial | Solid state now keeps separate focused date and visible range start, syncs controlled focused values, and route props are passed through reactive getters.                                                                                                                    | `idiom-blocker`: ref semantics and context merging still need focused proof rows.                                           |
| Accessibility And I18n                   | partial | Package and browser tests cover accessible labels, localized French month/day labels, locale-default week starts, RTL Provider direction, disabled nav, unavailable disabled semantics, invalid error text, first-day headers, and ArrowRight/Enter keyboard focus selection. | `a11y-blocker`: broader keyboard matrix, Unicode calendar systems, and forced-colors semantics remain unproven.             |
| Behavior State Machine                   | partial | Tests cover default unselected route, controlled selection, focusedValue/onFocusChange route updates, unavailable/read-only suppression, disabled navigation, multi-month, and `pageBehavior`.                                                                                | `behavior-blocker`: full keyboard matrix, controlled/uncontrolled reset, and custom calendar transitions remain incomplete. |
| Style Source-To-Computed Parity          | partial | Visual smoke covers official default and controlled selected states in light/dark, default seven-column width without a trailing ghost column, title typography, and multi-month heading layout.                                                                              | `style-blocker`: no strict pair diff or source-to-computed token ledger yet.                                                |
| React-Vs-Solid Comparison Harness Parity | partial | React fixture imports real `@react-spectrum/s2` Calendar; Solid fixture imports public `@proyecto-viviana/solid-spectrum`; controls drive both, including Provider locale route state.                                                                                        | `route-blocker`: strict pair diff plus Unicode calendar-system/custom calendar states missing.                              |
| Evidence And Handoff                     | partial | Focused package tests, comparison browser tests, `check:fix`, export report, and gap report are used for closeout.                                                                                                                                                            | Calendar must remain partial until blockers above are closed.                                                               |

## Official Docs And Viewer Inventory

- Live official page: https://react-spectrum.adobe.com/Calendar, opened 2026-05-18.
- Primary docs example:

```tsx
import { Calendar } from "@react-spectrum/s2/Calendar";

<Calendar aria-label="Event date" />;
```

- Primary viewer controls:

| Prop             | Official surface                                                             | Route value model               | Default / omitted behavior                               |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| `visibleMonths`  | Viewer number/select control; API default `1`; S2 story options `[1, 2, 3]`. | `Default`, `1`, `2`, `3`.       | `Default` omits the prop.                                |
| `pageBehavior`   | Viewer options `single`, `visible`; API default `visible`.                   | `Default`, `single`, `visible`. | `Default` omits the prop and should behave as `visible`. |
| `firstDayOfWeek` | Viewer options `Default`, `sun`, `mon`, `tue`, `wed`, `thu`, `fri`, `sat`.   | Same order.                     | `Default` omits the prop.                                |
| `isDisabled`     | Viewer boolean control.                                                      | Switch.                         | `false`.                                                 |

- Docs examples inventoried:
  - Value: controlled `value` and `onChange`.
  - International calendars: `Provider locale="hi-IN-u-ca-indian"` and `defaultValue`.
  - Custom calendar systems: `createCalendar={() => new Custom454()}`.
  - Validation: `minValue`, `isDateUnavailable`, `isInvalid`, and `errorMessage`.
  - Controlling focused date: `focusedValue`, `onFocusChange`, and an `ActionButton`.
  - API: `visibleMonths`, `createCalendar`, `isDateUnavailable`, `isDisabled`, `isReadOnly`, `focusedValue`, `defaultFocusedValue`, `pageBehavior`, `firstDayOfWeek`, `selectionAlignment`, `styles`, `value`, `defaultValue`, and `onChange`.

## Source Branch Coverage

| Layer         | Upstream branch                                                                                                                                           | Solid owner                                                                                                                                                             | Class           | Observable | Status             | Evidence                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2            | `Calendar` maps `visibleMonths` to RAC `visibleDuration={{months: visibleMonths}}`.                                                                       | `packages/solid-spectrum/src/calendar/index.tsx`                                                                                                                        | behavior/layout | yes        | matched            | `Calendar.test.tsx`, `calendar-contract.spec.ts` multi-month assertions.                                                                                              |
| S2            | Calendar primary composition: previous button, heading, next button, one grid per visible month.                                                          | `packages/solid-spectrum/src/calendar/index.tsx`                                                                                                                        | DOM/layout      | yes        | ported-differently | Browser route asserts grid count and heading months.                                                                                                                  |
| S2            | `CalendarContext` merges slotted props and refs.                                                                                                          | `packages/solid-spectrum/src/calendar/index.tsx`                                                                                                                        | context         | yes        | partial            | `Calendar.test.tsx` covers disabled/firstDay context; ref proof pending.                                                                                              |
| RAC/State     | `pageBehavior="visible"` pages by visible duration; `"single"` pages by one month.                                                                        | `packages/solid-stately/src/calendar/createCalendarState.ts`                                                                                                            | behavior        | yes        | matched            | `Calendar.test.tsx`, `calendar-contract.spec.ts`.                                                                                                                     |
| RAC/State     | `selectionAlignment` aligns initial visible range start/center/end.                                                                                       | `packages/solid-stately/src/calendar/createCalendarState.ts`                                                                                                            | behavior        | yes        | matched            | `calendar-contract.spec.ts` covers start/center/end route mounts for three visible months.                                                                            |
| RAC/State     | Controlled `focusedValue` changes focus and shifts the visible range only when the new focus falls outside the current range.                             | `packages/solid-stately/src/calendar/createCalendarState.ts`                                                                                                            | behavior        | yes        | matched            | `Calendar.test.tsx` and `calendar-contract.spec.ts` cover controlled route updates and React Stately's post-mount visibility behavior.                                |
| RAC/State     | `firstDayOfWeek` changes week header/order.                                                                                                               | `packages/solid-spectrum/src/calendar/index.tsx`, `packages/solid-stately/src/calendar/createCalendarState.ts`                                                          | i18n/layout     | yes        | matched            | Package test covers Monday header; browser route covers locale-default Monday start for `fr-FR`.                                                                      |
| React Aria    | `useCalendarGrid` formats weekday headers from active locale with `weekdayStyle="narrow"` and locale/default first day of week.                           | `packages/solidaria/src/calendar/createCalendarGrid.ts`, `packages/solid-stately/src/calendar/createCalendarState.ts`, `packages/solidaria-components/src/Calendar.tsx` | i18n/layout     | yes        | matched            | Package and browser tests assert French narrow headers `L M M J V S D` with Monday first.                                                                             |
| React Aria    | `useCalendarCell` formats day numbers and cell aria labels from the active locale.                                                                        | `packages/solidaria/src/calendar/createCalendarCell.ts`                                                                                                                 | a11y/i18n       | yes        | matched            | Package/browser tests assert French cell name `samedi 15 février 2025`; browser route compares React and Solid labels.                                                |
| S2/Provider   | Provider locale flows to Calendar title, grid labels, and root writing direction.                                                                         | `packages/solid-spectrum/src/provider/index.tsx`, `packages/solid-spectrum/src/calendar/index.tsx`, `apps/comparison/src/components/solid/fixtures/styled.tsx`          | i18n/a11y       | yes        | matched            | `Provider locale="fr-FR"` package test, `locale=fr-FR` browser route, and `locale=ar-AE` RTL browser route.                                                           |
| React Aria    | RTL direction reverses horizontal day-key movement.                                                                                                       | `packages/solidaria/src/calendar/createCalendarGrid.ts`                                                                                                                 | keyboard/i18n   | yes        | matched            | Browser route focuses the selected date under `locale=ar-AE`; ArrowRight moves from February 3 to February 2 on both stacks.                                          |
| RAC/State     | `isDateUnavailable` prevents selection and exposes unavailable cell state.                                                                                | `packages/solidaria/src/calendar/createCalendarCell.ts`                                                                                                                 | a11y/behavior   | yes        | matched            | Package and browser tests assert disabled unavailable date and unchanged value.                                                                                       |
| React Aria    | Invalid calendar exposes error text through description linkage.                                                                                          | `packages/solid-spectrum/src/calendar/index.tsx`                                                                                                                        | a11y            | yes        | partial            | Package/browser tests cover visible error; accessible description ordering pending.                                                                                   |
| React Stately | `createCalendar` custom calendar factory changes display calendar behavior.                                                                               | none                                                                                                                                                                    | i18n/behavior   | yes        | gap                | `source-blocker`; no Solid state owner yet.                                                                                                                           |
| S2 Style      | Root width, seven day columns, month title typography, multi-month heading, selected date, unavailable date, invalid text, and light/dark style branches. | `packages/solid-spectrum/src/calendar/index.tsx`                                                                                                                        | style           | yes        | partial            | `calendar-visual.spec.ts` covers flush grid geometry, compact multi-month heading, title typography, and selected paint; computed token ledger and pair diff pending. |

## Behavior State Rows

| State/input                                 | Trigger                     | Expected React                                                                  | Expected Solid | Evidence                                                |
| ------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------- |
| Official default, no value                  | Route mount                 | One unselected calendar grid labeled `Event date`.                              | Same.          | `calendar-contract.spec.ts`, `calendar-visual.spec.ts`. |
| `value=2025-02-03`                          | Click February 12           | Value becomes `2025-02-12`.                                                     | Same.          | `calendar-contract.spec.ts`.                            |
| `isDateUnavailable` for February 10         | Try unavailable date        | Date is disabled/unselectable; value remains February 3.                        | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |
| `isReadOnly`                                | Forced click February 12    | Value remains February 3.                                                       | Same.          | `calendar-contract.spec.ts`.                            |
| `isDisabled`                                | Route mount                 | Previous/next buttons disabled.                                                 | Same.          | `calendar-contract.spec.ts`.                            |
| Default grid geometry                       | Route mount                 | Calendar root width equals the seven-column grid; no trailing blank column.     | Same.          | `calendar-visual.spec.ts`.                              |
| `visibleMonths=2` heading geometry          | Route mount                 | Two grids fill the root and month heading remains one compact row.              | Same.          | `calendar-visual.spec.ts`.                              |
| `focusedValue`, `selectionAlignment=start`  | Route mount                 | February/March/April are visible around February 15.                            | Same.          | `calendar-contract.spec.ts`.                            |
| `focusedValue`, `selectionAlignment=center` | Route mount                 | January/February/March are visible around February 15.                          | Same.          | `calendar-contract.spec.ts`.                            |
| `focusedValue`, `selectionAlignment=end`    | Route mount                 | December/January/February are visible around February 15.                       | Same.          | `calendar-contract.spec.ts`.                            |
| Controlled `focusedValue` route update      | Control event               | January/February changes to May/June when focus jumps to May 15.                | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |
| Keyboard ArrowRight then Enter              | Focus February 3            | Focus callback reports February 4, then value becomes February 4.               | Same.          | `calendar-contract.spec.ts`.                            |
| Provider `locale=fr-FR`                     | Route mount                 | Month title, weekday headers, and cell labels render in French.                 | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |
| Provider `locale=ar-AE`                     | ArrowRight on selected date | Root direction is RTL and ArrowRight moves focus from February 3 to February 2. | Same.          | `calendar-contract.spec.ts`.                            |
| `visibleMonths=2`, `pageBehavior=visible`   | Next month                  | February/March becomes April/May.                                               | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |
| `visibleMonths=2`, `pageBehavior=single`    | Next month                  | February/March becomes March/April.                                             | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |

## Covered

- Public root export and `./Calendar` subpath export.
- `CalendarContext` export for S2-style prop context composition.
- Official default route surface: `<Calendar aria-label="Event date" />`.
- Official viewer controls: `visibleMonths`, `pageBehavior`, `firstDayOfWeek`, and `isDisabled`.
- Controlled `value` and `onChange` selection behavior.
- Controlled `focusedValue`, `onFocusChange`, and initial `selectionAlignment` start/center/end behavior.
- Keyboard ArrowRight focus movement followed by Enter selection parity.
- Provider locale inheritance for month titles, weekday headers, localized cell aria labels, and route control serialization.
- RTL Provider direction and horizontal ArrowRight day movement under `ar-AE`.
- `firstDayOfWeek` string normalization for S2 values.
- `visibleMonths` one-, two-, and three-month route model.
- `pageBehavior` visible-vs-single paging behavior.
- `minValue`, `maxValue`, and `isDateUnavailable` route coverage.
- `isDisabled`, `isReadOnly`, `isInvalid`, and `errorMessage` route coverage.
- Light/dark visual route smoke coverage for default and selected-day styling.
- Default Calendar grid geometry now asserts seven columns without the trailing 48px ghost column seen in the installed React package and previous Solid port.
- Multi-month visual coverage now asserts both month grids fill the Calendar root and the heading remains compact instead of stacking.
- Solid Calendar title typography now uses the S2 `title-lg` style path rather than ad hoc inline text styling.

## Remaining Gaps

- `createCalendar` custom calendar support is missing in Solid state.
- Unicode calendar-system route parity such as `hi-IN-u-ca-indian` is not implemented.
- Full keyboard matrix, exact `onFocusChange` ordering, and controlled/uncontrolled reset paths need state-machine evidence.
- Forced colors, full accessible-description ordering, and APG/WCAG rows are not complete.
- Strict React-vs-Solid pixel pair diff is still planned.
