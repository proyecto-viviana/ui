# RangeCalendar Validation Notes

Date: 2026-05-21
Status: accepted

## Target

- Component: RangeCalendar
- Slug: `rangecalendar`
- Family or direct subcomponents: `RangeCalendar`, `RangeCalendarContext`,
  `RangeCalendarGrid`, `RangeCalendarCell`, styled S2 RangeCalendar wrapper.
- Pass goal: close the current-gate parity blockers for official docs/viewer
  controls, installed S2 source branches, Solid ref/context semantics,
  accessibility/i18n, style source-to-computed parity, comparison harness
  fidelity, and evidence handoff.

## Task Status

| Task                   | Status   | Evidence                                                                                                                                                                                                                         | Blocker or next action |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | complete | React Spectrum S2 RangeCalendar docs checked through MCP; installed S2 source inspected at `apps/comparison/node_modules/@react-spectrum/s2/src/RangeCalendar.tsx` and shared `Calendar.tsx`.                                    | none                   |
| 1 Baseline             | complete | Prior partial note blockers identified: locale/calendar-system rows, ref proof, style computed ledger, forced-colors branch, and broader route-state evidence.                                                                   | none                   |
| 2 Route harness        | complete | `apps/comparison/e2e/rangecalendar-visual.spec.ts` now covers root/grid pair diffs, controls, Provider locale, RTL, Unicode calendar locale, custom calendar system, and forced-colors computed contracts.                       | none                   |
| 3 Source map/API       | complete | Installed S2 `visibleMonths`, error-message slot, context/ref behavior, seven-column grid math, selected range paint, unavailable strike, invalid help text, and API/documentation drift are mapped below.                       | none                   |
| 4 Cross-layer audit    | complete | Solid state, headless components, ARIA hooks, styled wrapper, comparison fixtures, and reports are listed in source/style rows.                                                                                                  | none                   |
| 5 Transitions          | complete | Range selection, disabled/read-only/unavailable suppression, invalid descriptions, paging, focused-date routing, Provider locale/direction, and custom display calendar routing covered.                                         | none                   |
| 6 State                | complete | `packages/solid-stately/test/createRangeCalendarState.test.ts` covers accessor-backed `pageBehavior` with multi-month paging.                                                                                                    | none                   |
| 7 ARIA hooks           | complete | `packages/solidaria/src/calendar/createRangeCalendarCell.ts` exposes React Aria-style selected range descriptions, selected/today localized labels, invalid description composition, era/calendar-aware labels, and prompt text. | none                   |
| 8 Headless             | complete | `packages/solidaria-components/src/RangeCalendar.tsx` forwards root refs and routes `pageBehavior`/`selectionAlignment` into state props instead of dropping them.                                                               | none                   |
| 9 Styled S2            | complete | Existing styled S2 RangeCalendar geometry is now covered by root and grid pair diffs plus forced-colors computed contracts.                                                                                                      | none                   |
| 10 Runtime lifecycle   | complete | Focus sync remains `focusSafely`; secondary button hook calls preserve root calendar hook data so explicit invalid error ids are not overwritten.                                                                                | none                   |
| 11 Harness integrity   | complete | React fixture imports real `@react-spectrum/s2` RangeCalendar; Solid fixture imports public `@proyecto-viviana/solid-spectrum`; route props and Provider locale/custom calendar options drive both stacks.                       | none                   |
| 12 Comparison evidence | complete | RangeCalendar browser suite passed 9/9 with `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/rangecalendar-visual.spec.ts --reporter=line`.                                                                 | none                   |
| 13 Acceptance          | complete | Focused package tests, comparison build/browser tests, export/gap reports, RAC guards, `vp run check`, and this note are refreshed for the current gate.                                                                         | none                   |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                                                                                                             | Files changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Evidence added                                                                                                                                                                     | Commands run                                                                                                                                                                                                                                                                                                | Blockers | Next owner |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2 docs MCP; installed S2 RangeCalendar/Calendar source; RangeCalendar state/headless/ARIA/styled tests; comparison fixtures/specs; Calendar validation note; component status README. | `packages/solid-stately/src/calendar/createRangeCalendarState.ts`, `packages/solid-stately/src/calendar/createRangeCalendarState.d.ts`, `packages/solid-stately/test/createRangeCalendarState.test.ts`, `packages/solidaria/src/calendar/createRangeCalendar.ts`, `packages/solidaria/src/calendar/createRangeCalendarCell.ts`, `packages/solidaria/src/calendar/intl/index.ts`, `packages/solidaria/src/calendar/utils.ts`, `packages/solidaria-components/src/RangeCalendar.tsx`, `packages/solidaria-components/test/RangeCalendar.test.tsx`, `packages/solid-spectrum/test/RangeCalendar.test.tsx`, comparison RangeCalendar data/fixtures/specs, status docs. | Root ref/context assertions, accessor paging assertions, selected-range accessible labels, locale/RTL/Unicode/custom-calendar route rows, root/grid pair diffs, forced-colors row. | `vp test run packages/solid-stately/test/createRangeCalendarState.test.ts packages/solidaria-components/test/RangeCalendar.test.tsx packages/solid-spectrum/test/RangeCalendar.test.tsx`; `vp run --filter @proyecto-viviana/comparison build`; RangeCalendar Playwright suite; reports/guards/check below. | none     | none       |

## Acceptance Gate Checklist

- [x] Official Docs And Viewer Parity
- [x] External Authority And Standards
- [x] Upstream React Source Parity
- [x] Solid Idiomatic Implementation
- [x] Accessibility And I18n
- [x] Behavior State Machine
- [x] Style Source-To-Computed Parity
- [x] React-Vs-Solid Comparison Harness Parity
- [x] Evidence And Handoff

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                               | Blockers/owner |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 docs and installed source checked 2026-05-21. The comparison route exposes the visible viewer control set for controlled range value, focusedValue, `visibleMonths`, `pageBehavior`, `selectionAlignment`, `firstDayOfWeek`, min/max constraints, unavailable dates, non-contiguous ranges, disabled/read-only/invalid state, and error text. Provider locale and custom calendar-system examples are route-testable docs/API rows. | none           |
| External Authority And Standards         | complete | S2 docs/source, React Aria calendar label/prompt behavior, React Stately paging/alignment semantics, and WCAG name-role-value/non-text-contrast concerns are mapped to package tests and browser route contracts below.                                                                                                                                                                                                                | none           |
| Upstream React Source Parity             | complete | Installed S2 source branches are covered: root `visibleMonths` to `visibleDuration`, error slot props, seven-column grid geometry, shared Calendar cell range styling, unavailable strike, forced-colors affordances, Provider locale/direction, and custom `createCalendar`.                                                                                                                                                          | none           |
| Solid Idiomatic Implementation           | complete | Solid keeps reactive state props as accessors, forwards root refs, preserves context/local style/ref merging, scopes hook metadata through the shared state without clobbering root error ids, and exposes route/test contracts through getters rather than DOM inference.                                                                                                                                                             | none           |
| Accessibility And I18n                   | complete | Package/browser tests cover root `application` semantics, localized range-selection prompts, invalid error id composition, read-only prompt suppression, selected range boundary labels, French Provider locale, Arabic RTL focus movement, Unicode Indian calendar display/labels, custom calendar display, unavailable disabled semantics, and forced-colors computed contrast branches.                                             | none           |
| Behavior State Machine                   | complete | Tests cover controlled/default ranges, completed range selection, selection start/end, disabled/read-only, min/max, unavailable dates, focusedValue routing, visibleMonths, `pageBehavior="single"`, selection alignment, context merging, Provider locale/direction, Unicode calendar locale, and custom `createCalendar`.                                                                                                            | none           |
| Style Source-To-Computed Parity          | complete | Strict zero-tolerance pair diffs cover both month grids in the deterministic two-month route, and the isolated selected range root shell uses zero dimension tolerance with a small antialias channel threshold. Browser contracts assert seven-column geometry, no trailing ghost day column, unavailable strike markup, range background/border, invalid helper text, and forced-colors computed values against React Spectrum.      | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports real `@react-spectrum/s2` RangeCalendar; Solid fixture imports public `@proyecto-viviana/solid-spectrum`; both receive serialized demo props, Provider locale, custom calendar factory, controlled value/focus state, color scheme evidence, and root data attributes.                                                                                                                                           | none           |
| Evidence And Handoff                     | complete | Focused package tests, comparison build, RangeCalendar browser suite, export/gap reports, RAC guards, full repo check, README normalization status, and this note are refreshed.                                                                                                                                                                                                                                                       | none           |

## Version Drift Caveat

- The current S2 docs mention `commitBehavior`, but the installed local
  packages used by this repository do not expose it:
  `@react-spectrum/s2@1.3.0`, `react-aria-components@1.15.1`, and
  `@react-types/calendar@3.8.2`.
- This pass treats `commitBehavior` as docs-forward upstream drift rather than
  an installed-source parity blocker. Revisit it when the local S2/RAC calendar
  dependency set is upgraded to a version that includes the prop.

## Official Docs And Viewer Inventory

| Prop or example          | Official/source expectation                                                         | Solid route/control                                  | Status   |
| ------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | -------- |
| Primary example          | `import {RangeCalendar} from "@react-spectrum/s2/RangeCalendar"; <RangeCalendar />` | React and Solid styled route mount direct wrappers   | matched  |
| `value` / `defaultValue` | Date range selection with `start` and `end`                                         | controlled route values and package tests            | matched  |
| `visibleMonths`          | S2 prop maps to `visibleDuration={{months: visibleMonths}}`                         | side-panel control and browser root/grid diffs       | matched  |
| `pageBehavior`           | `single` pages one month; default/`visible` pages visible month count               | state accessor test and styled wrapper browser test  | matched  |
| `selectionAlignment`     | start/center/end initial visible range alignment                                    | side-panel route and state wiring                    | matched  |
| `firstDayOfWeek`         | string day options and locale defaults                                              | side-panel control plus French locale week headers   | matched  |
| `createCalendar`         | custom calendar factory can alter display calendar                                  | route-only `custom454` docs example                  | matched  |
| Provider locale          | locale controls month titles, labels, direction, and display calendar               | `fr-FR`, `ar-AE`, `hi-IN-u-ca-indian` browser rows   | matched  |
| Validation               | invalid range links selected cells to error message                                 | package invalid description and browser error checks | matched  |
| Unavailable dates        | unavailable dates are disabled/unselectable and visually struck                     | package strike markup and browser forced-colors row  | matched  |
| `commitBehavior`         | docs-forward prop not present in installed local type/source set                    | caveat above                                         | deferred |

## Source Branch Coverage

| Layer      | Upstream branch                                                                  | Solid owner                                                                                | Class       | Observable                                                                                 | Status  |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------ | ------- |
| State      | `visibleMonths` affects visible range size and paging                            | `createRangeCalendarState.ts`                                                              | behavior    | default next jumps by visible months; `pageBehavior="single"` jumps one month              | covered |
| State      | `pageBehavior` and `selectionAlignment` can come from reactive props             | `createRangeCalendarState.ts` and `.d.ts`                                                  | API         | accessors accepted in tests and wrappers                                                   | covered |
| ARIA hooks | selected range boundaries include a selected range description                   | `createRangeCalendar.ts`, `createRangeCalendarCell.ts`, calendar intl/utils                | a11y/i18n   | English and Unicode selected boundary labels match React route labels                      | covered |
| ARIA hooks | invalid selected cells describe the rendered error id and selection prompt       | `createRangeCalendar.ts`, `createRangeCalendarCell.ts`                                     | a11y        | explicit `errorMessageId` remains first in `aria-describedby`; prompt id remains second    | covered |
| ARIA hooks | today/selected labels use localized strings and era/display calendar formatting  | `calendar/intl/index.ts`, `calendar/utils.ts`, `createRangeCalendarCell.ts`                | a11y/i18n   | selected/today labels and Indian calendar labels include the display calendar year         | covered |
| Headless   | root ref is forwarded and context/local props merge through the styled wrapper   | `solidaria-components/src/RangeCalendar.tsx`, `solid-spectrum/test/RangeCalendar.test.tsx` | API/context | context ref and local ref both resolve to root; unsafe styles merge                        | covered |
| Styled S2  | root/header/grid/cell geometry remains seven columns with no trailing blank cell | existing Solid Spectrum RangeCalendar plus browser pair-diff contracts                     | visual      | strict grid diffs, bounded root shell diff, and geometry assertions pass                   | covered |
| Styled S2  | unavailable strike, selected range fill/border, invalid helper, forced-colors    | Solid Spectrum styling and generated S2 classes                                            | visual/a11y | forced-colors computed style object equals React Spectrum                                  | covered |
| Harness    | React side must use official package; Solid side must use public package         | comparison React/Solid fixtures                                                            | route       | route data attrs serialize value, focused value, locale, calendar system, and color scheme | covered |

## Behavior State Rows

| State/input                              | Trigger                       | Expected React                                                   | Expected Solid | Evidence                                                                 |
| ---------------------------------------- | ----------------------------- | ---------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| Default selected range                   | Route mount                   | Selected start/end dates render and are labelled selected.       | Same.          | `RangeCalendar.test.tsx`, `solid-spectrum/test/RangeCalendar.test.tsx`.  |
| `visibleMonths=2`                        | Route mount                   | February and March grids render with exactly seven columns.      | Same.          | `rangecalendar-visual.spec.ts`.                                          |
| `pageBehavior=visible`                   | Next button                   | February/March pages to April/May.                               | Same.          | `solid-spectrum/test/RangeCalendar.test.tsx`.                            |
| `pageBehavior=single`                    | Next button                   | February/March pages to March/April.                             | Same.          | state/headless/styled tests.                                             |
| `selectionAlignment=end`                 | Side-panel route              | Visible range aligns to the requested focused range.             | Same.          | side-panel route control row.                                            |
| `isInvalid` with selected range          | Package/browser mount         | selected range cells expose invalid state and error description. | Same.          | package invalid description test and browser route contract.             |
| `isDateUnavailable`                      | Click unavailable date        | date is disabled, unselectable, and struck through.              | Same.          | `solid-spectrum/test/RangeCalendar.test.tsx`, browser forced-colors row. |
| `isReadOnly`                             | Focused selected cell         | range prompt descriptions are suppressed.                        | Same.          | `solidaria-components/test/RangeCalendar.test.tsx`.                      |
| Provider `locale=fr-FR`                  | Route mount                   | French title/header/cell labels and Monday first weekday.        | Same.          | `rangecalendar-visual.spec.ts`.                                          |
| Provider `locale=ar-AE`                  | ArrowRight from selected date | RTL direction and focus moves from Feb 3 to Feb 2.               | Same.          | `rangecalendar-visual.spec.ts`.                                          |
| Provider `hi-IN-u-ca-indian`             | Route mount                   | Saka display labels with Gregorian emitted values.               | Same.          | `rangecalendar-visual.spec.ts`.                                          |
| `createCalendar={() => new Custom454()}` | Route mount                   | custom display calendar title matches React.                     | Same.          | `rangecalendar-visual.spec.ts`.                                          |
| Forced-colors selected invalid range     | Browser media emulation       | selected start, range fill/border, unavailable, and error styles | Same.          | computed contract row in `rangecalendar-visual.spec.ts`.                 |

## Accessibility And I18n

- RangeCalendar root keeps `role="application"` and a visible-range accessible
  name.
- Focused selectable cells expose localized React Aria-style start/finish range
  selection prompt descriptions.
- Invalid selected cells compose the rendered error id before the prompt id in
  `aria-describedby`.
- Selected range boundary labels now include a localized selected range
  description before the selected date label, matching React for Unicode
  calendar-system locales.
- Labels are formatted with display-calendar and era options so Gregorian,
  Indian/Saka, and custom calendar examples keep parity with React Spectrum.
- Provider locale drives month titles, weekday headers, cell labels, and RTL
  keyboard movement.
- Live screen-reader transcript collection is not available in this repository;
  accepted AT coverage is the programmatic semantic matrix plus package/browser
  assertions above.

## Style Source-To-Computed Ledger

| Upstream S2 style branch                       | Solid token/style owner                         | Computed or visual evidence                                                                        | Status  |
| ---------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- |
| Root width and two-month layout                | Solid Spectrum RangeCalendar S2 classes         | bounded isolated selected-range root shell pair diff with zero dimension tolerance                 | covered |
| Seven-column month grids                       | RangeCalendar grid/cell wrappers                | strict month-grid pair diffs and no ghost eighth column route assertion                            | covered |
| Selected start/end and in-range background     | shared Calendar range cell styling              | bounded root shell diff, strict grid diffs, and forced-colors selected/range background comparison | covered |
| Range border treatment                         | shared Calendar range border styling            | forced-colors computed `border-top-*` comparison                                                   | covered |
| Unavailable date strike                        | Solid Spectrum unavailable strike markup/styles | package strike markup assertion and forced-colors strike computed equality                         | covered |
| Invalid help text                              | styled RangeCalendar error/help text            | route error visibility and forced-colors error color comparison                                    | covered |
| Provider locale/custom calendar visual routing | comparison fixtures and Solid Provider          | French, Arabic, Indian calendar, and custom 4-5-4 route rows compare React and Solid text/labels   | covered |

## Evidence

```bash
vp test run packages/solidaria-components/test/RangeCalendar.test.tsx -t "should compose invalid error descriptions"
vp test run packages/solid-stately/test/createRangeCalendarState.test.ts packages/solidaria-components/test/RangeCalendar.test.tsx packages/solid-spectrum/test/RangeCalendar.test.tsx
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/rangecalendar-visual.spec.ts --reporter=line
vp run comparison:report:exports
vp run comparison:report:gaps
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check:fix
vp run check
```

Results:

- Focused invalid description regression test: `1 passed`.
- Focused RangeCalendar package slice: `110 passed`.
- Comparison build: passed.
- RangeCalendar browser parity suite: `9 passed`.
- Export report: `@react-spectrum/s2@1.3.0`, S2 value exports `208`,
  `solid-spectrum` public value exports `158`, missing S2 value exports `53`,
  extra Solid value exports `3`, missing catalogue root exports `0`.
- Gap report: official entries `69`, live on both sides `47`, missing/gap
  entries `22`, visual states tracked `268`, visual evidence states `76`,
  strict pair-diff states `46`, blocked visual states `22`.
- RAC guards: no required missing tracked symbols and no RAC named export gap.
- Full repo check: passed after formatter normalization.

## Handoff

- Current-gate status: RangeCalendar is accepted as of 2026-05-21.
- Remaining current-gate gaps: none for the installed dependency versions.
- Deferred caveat: revisit `commitBehavior` after upgrading to an installed S2
  and React Aria Components version that exposes it.
