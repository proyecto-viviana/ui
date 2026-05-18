# Calendar Validation Notes

Date: 2026-05-18
Status: partial

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                                                                         | Blockers/owner                                                                                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | partial | Official page opened 2026-05-18: https://react-spectrum.adobe.com/Calendar. Primary example and viewer controls are now represented by `apps/comparison/e2e/calendar-contract.spec.ts`.          | `docs-blocker`: international calendar and custom calendar examples are inventoried but not route-supported.                           |
| External Authority And Standards         | partial | S2 docs page, local S2 source, S2 stories, RAC Calendar source, React Aria calendar source, and React Stately calendar source checked.                                                           | `authority-blocker`: APG/WCAG/browser forced-colors and keyboard references still need explicit rows.                                  |
| Upstream React Source Parity             | partial | Source rows below map `@react-spectrum/s2`, RAC Calendar, React Aria calendar, and React Stately calendar branches to Solid owners.                                                              | `source-blocker`: custom `createCalendar` remains a gap; full branch ledger is not exhaustive yet.                                     |
| Solid Idiomatic Implementation           | partial | Solid state now keeps separate focused date and visible range start, and route props are passed through reactive getters.                                                                        | `idiom-blocker`: ref semantics and context merging still need focused proof rows.                                                      |
| Accessibility And I18n                   | partial | Package and browser tests cover accessible labels, disabled nav, unavailable disabled semantics, invalid error text, and first-day headers.                                                      | `a11y-blocker`: keyboard/focus movement, international calendars, RTL, and forced-colors semantics remain unproven.                    |
| Behavior State Machine                   | partial | Tests cover default unselected route, controlled selection, unavailable/read-only suppression, disabled navigation, multi-month, and `pageBehavior`.                                             | `behavior-blocker`: keyboard paths, focus callbacks, controlled/uncontrolled reset, and custom calendar transitions remain incomplete. |
| Style Source-To-Computed Parity          | partial | Visual smoke covers official default and controlled selected states in light/dark, default seven-column width without a trailing ghost column, title typography, and multi-month heading layout. | `style-blocker`: no strict pair diff or source-to-computed token ledger yet.                                                           |
| React-Vs-Solid Comparison Harness Parity | partial | React fixture imports real `@react-spectrum/s2` Calendar; Solid fixture imports public `@proyecto-viviana/solid-spectrum`; controls drive both.                                                  | `route-blocker`: strict pair diff and international/custom calendar states missing.                                                    |
| Evidence And Handoff                     | partial | Focused package tests, comparison browser tests, `check:fix`, export report, and gap report are used for closeout.                                                                               | Calendar must remain partial until blockers above are closed.                                                                          |

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

| Layer         | Upstream branch                                                                                                                                           | Solid owner                                                                                                    | Class           | Observable | Status             | Evidence                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------- | ---------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2            | `Calendar` maps `visibleMonths` to RAC `visibleDuration={{months: visibleMonths}}`.                                                                       | `packages/solid-spectrum/src/calendar/index.tsx`                                                               | behavior/layout | yes        | matched            | `Calendar.test.tsx`, `calendar-contract.spec.ts` multi-month assertions.                                                                                              |
| S2            | Calendar primary composition: previous button, heading, next button, one grid per visible month.                                                          | `packages/solid-spectrum/src/calendar/index.tsx`                                                               | DOM/layout      | yes        | ported-differently | Browser route asserts grid count and heading months.                                                                                                                  |
| S2            | `CalendarContext` merges slotted props and refs.                                                                                                          | `packages/solid-spectrum/src/calendar/index.tsx`                                                               | context         | yes        | partial            | `Calendar.test.tsx` covers disabled/firstDay context; ref proof pending.                                                                                              |
| RAC/State     | `pageBehavior="visible"` pages by visible duration; `"single"` pages by one month.                                                                        | `packages/solid-stately/src/calendar/createCalendarState.ts`                                                   | behavior        | yes        | matched            | `Calendar.test.tsx`, `calendar-contract.spec.ts`.                                                                                                                     |
| RAC/State     | `selectionAlignment` aligns initial visible range start/center/end.                                                                                       | `packages/solid-stately/src/calendar/createCalendarState.ts`                                                   | behavior        | yes        | partial            | Implemented for month duration; focused browser comparison pending.                                                                                                   |
| RAC/State     | `firstDayOfWeek` changes week header/order.                                                                                                               | `packages/solid-spectrum/src/calendar/index.tsx`, `packages/solid-stately/src/calendar/createCalendarState.ts` | i18n/layout     | yes        | partial            | Package test covers Monday header; full all-day matrix pending.                                                                                                       |
| RAC/State     | `isDateUnavailable` prevents selection and exposes unavailable cell state.                                                                                | `packages/solidaria/src/calendar/createCalendarCell.ts`                                                        | a11y/behavior   | yes        | matched            | Package and browser tests assert disabled unavailable date and unchanged value.                                                                                       |
| React Aria    | Invalid calendar exposes error text through description linkage.                                                                                          | `packages/solid-spectrum/src/calendar/index.tsx`                                                               | a11y            | yes        | partial            | Package/browser tests cover visible error; accessible description ordering pending.                                                                                   |
| React Stately | `createCalendar` custom calendar factory changes display calendar behavior.                                                                               | none                                                                                                           | i18n/behavior   | yes        | gap                | `source-blocker`; no Solid state owner yet.                                                                                                                           |
| S2 Style      | Root width, seven day columns, month title typography, multi-month heading, selected date, unavailable date, invalid text, and light/dark style branches. | `packages/solid-spectrum/src/calendar/index.tsx`                                                               | style           | yes        | partial            | `calendar-visual.spec.ts` covers flush grid geometry, compact multi-month heading, title typography, and selected paint; computed token ledger and pair diff pending. |

## Behavior State Rows

| State/input                               | Trigger                  | Expected React                                                              | Expected Solid | Evidence                                                |
| ----------------------------------------- | ------------------------ | --------------------------------------------------------------------------- | -------------- | ------------------------------------------------------- |
| Official default, no value                | Route mount              | One unselected calendar grid labeled `Event date`.                          | Same.          | `calendar-contract.spec.ts`, `calendar-visual.spec.ts`. |
| `value=2025-02-03`                        | Click February 12        | Value becomes `2025-02-12`.                                                 | Same.          | `calendar-contract.spec.ts`.                            |
| `isDateUnavailable` for February 10       | Try unavailable date     | Date is disabled/unselectable; value remains February 3.                    | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |
| `isReadOnly`                              | Forced click February 12 | Value remains February 3.                                                   | Same.          | `calendar-contract.spec.ts`.                            |
| `isDisabled`                              | Route mount              | Previous/next buttons disabled.                                             | Same.          | `calendar-contract.spec.ts`.                            |
| Default grid geometry                     | Route mount              | Calendar root width equals the seven-column grid; no trailing blank column. | Same.          | `calendar-visual.spec.ts`.                              |
| `visibleMonths=2` heading geometry        | Route mount              | Two grids fill the root and month heading remains one compact row.          | Same.          | `calendar-visual.spec.ts`.                              |
| `visibleMonths=2`, `pageBehavior=visible` | Next month               | February/March becomes April/May.                                           | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |
| `visibleMonths=2`, `pageBehavior=single`  | Next month               | February/March becomes March/April.                                         | Same.          | `calendar-contract.spec.ts`, `Calendar.test.tsx`.       |

## Covered

- Public root export and `./Calendar` subpath export.
- `CalendarContext` export for S2-style prop context composition.
- Official default route surface: `<Calendar aria-label="Event date" />`.
- Official viewer controls: `visibleMonths`, `pageBehavior`, `firstDayOfWeek`, and `isDisabled`.
- Controlled `value` and `onChange` selection behavior.
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
- International calendar provider/locale route parity is not implemented.
- `selectionAlignment` has source support but lacks browser route proof.
- Keyboard focus movement, `onFocusChange` ordering, and controlled/uncontrolled reset paths need state-machine evidence.
- Forced colors, RTL, full accessible-description ordering, and APG/WCAG rows are not complete.
- Strict React-vs-Solid pixel pair diff is still planned.
