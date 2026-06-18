---
kind: process
status: current
---

# Upstream release audit — RAC 1.14→1.18 / S2 1.0→1.4

A backlog of **atomic tickets** distilled from Adobe's release notes across every
train since we started porting (the S2 1.0.0 major) up to our current pin. Each
ticket is a single "do we have this change, or not?" question. Working this list
is how we catch the changes the mechanical gates can't see: the
`guard:upstream-test-parity` oracle diffs ARIA *vocabulary*, so it is blind to
behavioral/focus fixes, new props, and whole new components that don't alter an
asserted role. The release notes are the only signal those happened — see the
"Read the release notes for intent" step in [upstream-sync.md](./upstream-sync.md).

> **Status — pass 1 complete; pass 2 scheduled 2026-06-18.** The tickets below come
> from the release **highlights** (pass 1, done). **Pass 2** — mining the website
> per-PR "Fixed" lists (`react-aria.adobe.com/releases/v1-16-0`, …) to resolve every
> 🔍 ticket into a firm ✅/⛔ — is the **next session's** job. Until then treat 🔍 as
> "unverified." Execution of the confirmed ⛔ gaps has started (leaf-first, no
> conflicts): **T-29 SliderFill ✔**, **T-25 Calendar month/year pickers ✔**,
> **T-23 Calendar multi-select ✔**, and **T-26 RangeCalendar available-range ✔** —
> which **completes the Calendar 1.18 cluster**. See the shortlist at the foot.

## Scope & sources

| Train (date) | RAC | S2 | Notes (highlights) |
| --- | --- | --- | --- |
| 2025-12-16 | 1.14.0 | **1.0.0** (S2 GA, the major) | rac v1-14-0 · rs v1-0-0 |
| 2026-02-04 | 1.15.0 | 1.1.0 | rac v1-15-0 · rs v1-1-0 |
| 2026-03-04 | 1.16.0 | 1.2.0 | rac v1-16-0 · rs v1-2-0 |
| 2026-04-15 | 1.17.0 | 1.3.0 | rac v1-17-0 · rs v1-3-0 |
| 2026-05-30 | 1.18.0 | 1.4.0 | rac v1-18-0 · rs v1-4-0 ← **current pin** |

Tickets below are built from the **per-package GitHub Release highlights**
(`gh release view '<pkg>@<ver>' --repo adobe/react-spectrum`). Those are summaries;
the exhaustive per-PR "Fixed" lists live on the website
(`https://react-aria.adobe.com/releases/v1-16-0`,
`https://react-spectrum.adobe.com/releases/v1-2-0`, …). Mining those pages is the
**second pass** — this list is the high-value first pass.

## How to work it

- **Oldest first.** Port/verify trains top-to-bottom. Later trains often build on
  earlier ones (e.g. expandable Table rows assume the collection refactor); doing
  them in order avoids porting against a foundation that isn't there yet.
- **Reconcile to the pin, not the intermediate.** Our oracle is pinned at
  1.18/1.4, so the *current truth* for any surface is its 1.18/1.4 state. When an
  earlier ticket touches a surface a later ticket also changes (flagged
  **⇄ dedup/superseded** below), port the net-current behavior — don't re-port the
  intermediate and then overwrite it.
- **Verify, don't trust the status tag.** Tags are a first-pass signal (grep +
  spot checks); an identifier existing ≠ the feature fully/faithfully ported.
  Confirm each against upstream `src` + our code before closing, the same
  component-wrong-vs-test-wrong way the parity sweep does, and land a changeset
  when published-package `src` changes.

**Status legend:** ✅ have (identifier present — verify depth) · ⛔ gap (confirmed
absent — real port ticket) · 🔍 verify (uncertain: behavioral, or matched only a
generic term) · ✔ done (ported by us this cycle) · ➖ n/a (docs/website/deps/
internal — not a port concern).

---

## Train 1 — RAC 1.14.0 / S2 1.0.0 (2025-12-16, S2 GA)

- [ ] **T-01** 🔍 RAC — animated **Tab** transitions (animate the selected-indicator/panel between tabs). Tabs exist; confirm transition support.
- [ ] **T-02** 🔍 S2 — inline **TableView** cell editing. Confirm whether our TableView supports inline editing.

## Train 2 — RAC 1.15.0 / S2 1.1.0 (2026-02-04)

- [ ] **T-03** 🔍 RAC — **DOM customization render prop** (new render prop to swap the rendered DOM element — Router `Link`, animation libs). Cross-cutting API; confirm we expose the equivalent.
- [x] **T-04** ✔ RAC — **DateField/DatePicker**: constrain dates **on blur**, not as-you-type (their most-upvoted issue). **Behavioral — invisible to the ARIA gate.** **Done by us** this cycle (changeset `datefield-constrain-on-blur.md`): ported upstream's `IncompleteDate` display model into `solid-stately`. A new `calendar/IncompleteDate.ts` (port of `@react-stately/datepicker`) holds the raw segment values, so a momentarily-impossible edit (e.g. month set to February while the day still reads `31`) is held exactly as typed while focused and constrained (Feb 31 → Feb 28) only on blur via `confirmPlaceholder`. `createDateFieldState` was reworked around a `displayValue: IncompleteDate` signal: `setSegment`/`incrementSegment`/`decrementSegment`/`clearSegment` operate on it; a complete + valid edit commits eagerly (fires `onChange`), an incomplete/invalid edit is held without firing `onChange` until blur; `segments` render the raw typed value via `Intl.NumberFormat`. **Divergence removed:** a typed value is no longer snapped to `minValue`/`maxValue` — out-of-range dates are kept and reported through validation (`rangeUnderflow`/`rangeOverflow`), matching React Aria (the 3 old clamp tests were rewritten to assert this). The `DateFieldState` public interface is unchanged, so `createDateSegment` (solidaria) and the `DateField`/`DatePicker`/`DateRangePicker` components (solidaria-components / solid-spectrum) inherit the behavior without API changes. **Solid note:** `confirmPlaceholder` only resets the `displayValue` signal when the value actually changed (a commit or a constrained Feb-31-style value), because blur fires on every focus move and Solid's reference-keyed `<For>` would otherwise recreate the just-focused segment node and drop focus. 13 stately tests (incl. invalid-combo-on-blur + eager-commit); full solid-stately suite green (836).
- [ ] **T-05** 🔍 S2 — **Menu** renders correctly when opened from within a **Popover** (regression fix). Verify our popover-nested menu.
- [ ] **T-06** 🔍 S2 — **TreeView** `disabledBehavior` styling updated to latest designs. Verify.

## Train 3 — RAC 1.16.0 / S2 1.2.0 (2026-03-04)

- [ ] **T-07** ✅ RAC — **multi-select ComboBox** (`selectionMode="multiple"`, `ComboBoxValue`, TagGroup display). Confirmed present in `ComboBox.tsx`; verify `ComboBoxValue` render + tag display.
- [x] **T-08** ✔ RAC — **Tree sections** (`TreeSection` + `TreeHeader`). **Done by us** this cycle — item 3b, commit `8341b2c3` (rowgroup/row/rowheader port).
- [ ] **T-09** 🔍 RAC — overlay **positioning** improvements. Behavioral; second-pass.
- [ ] **T-10** 🔍 RAC — **scroll-into-view** behavior. Behavioral; second-pass.
- [ ] **T-11** ➖ RAC — assorted crash fixes. Mine the per-PR list in the second pass.
- [ ] **T-12** 🔍 S2 — **ListView** GA. We have GridList/ListView surfaces; verify parity.
- [ ] **T-13** ✅ S2 — **unavailable menu items** (`isUnavailable`). Present in `menu/`; verify depth.
- [ ] **T-14** 🔍 S2 — **ActionBar** support for **TreeView**. Verify.
- [ ] **T-15** 🔍 S2 — **Picker** custom render for the display value. Verify (grep matched a generic term).

## Train 4 — RAC 1.17.0 / S2 1.3.0 (2026-04-15)

- [ ] **T-16** ⛔ RAC — **Table expandable rows** (`treeColumn` + chevron button in cells; macOS-Finder-style trees). No `treeColumn` anywhere. Real gap.
- [x] **T-17** ✔ RAC — **window scrolling** in **Virtualizer** (collection scrolls with the page; no fixed height). **Done by us** this cycle (changeset `virtualizer-window-scrolling.md`): the `Virtualizer` now computes its visible viewport as the scroll view's height intersected with the window viewport and offsets the visible range by how far the scroll view has been pushed above the viewport by page/ancestor scrolling, all driven by a single document-level capturing `scroll` listener — mirroring upstream `ScrollView`. A new `allowsWindowScrolling` prop (default `true`, matching RAC `CollectionRoot`'s hard-coded value) opts back into element-only scrolling; an explicit `viewportSize` layout option still wins. Behavior-preserving for a fixed-height collection inside the viewport (the `window ∩ element` math reduces exactly to element scroll), so existing collections are unaffected unless they actually scroll with the page; 58 Virtualizer tests (2 new window-scroll tests) plus the downstream collection suites stay green. **Follow-ups (do not affect window-scroll correctness):** the `isScrolling` `pointer-events: none` optimization and the imperative `scrollToItem`/`scrollToRect` API are not yet ported. ⇄ same feature as **T-21**.
- [ ] **T-18** 🔍 RAC — **horizontally virtualized** GridList + ListBox. Verify orientation support in our virtualizer.
- [ ] **T-19** ➖ RAC — dependency-management improvements (internal; not a port concern).
- [ ] **T-20** 🔍 S2 — **highlight selection** in **TreeView**. ⇄ related to **T-31**. Verify.
- [x] **T-21** ✔ S2 — **window scrolling** in collection components. ⇄ **dedup of T-17** — the S2-styled collections (`ListBox` / `Table` / `Tree` / `Menu` / …) inherit the default-on window scrolling through the shared `solidaria-components` `Virtualizer`; covered by the same changeset (`virtualizer-window-scrolling.md`), and the S2 collection suites (85 tests) stay green.
- [ ] **T-22** 🔍 S2 — updated **workflow icons** set. Verify our icon set is regenerated.

## Train 5 — RAC 1.18.0 / S2 1.4.0 (2026-05-30, current pin)

- [x] **T-23** ✔ RAC — **Calendar multiple date selection** (changeset `calendar-multiple-selection.md`). `selectionMode="multiple"` ported across `solid-stately` (defaulted `M` generic + `CalendarValueType`, array value, `isSameDay` toggle, `setValue(null)→[]`), `solidaria` (`aria-multiselectable` on the grid), and `solidaria-components` (`Calendar` generic over `M`, threads `selectionMode`). ⇄ same feature as the S2 1.4 Calendar note; the S2 styled `Calendar` (`@ts-nocheck`) already forwards `selectionMode` through to the headless component.
- [ ] **T-24** ✅ RAC — **CalendarHeading** component. Present; verify.
- [x] **T-25** ✔ RAC — **CalendarMonthPicker** + **CalendarYearPicker** (jump to month/year). **Done by us** this cycle (changeset `calendar-month-year-picker.md`): ported the `createCalendar{Month,Year}Picker` aria hooks (solidaria) + the headless `CalendarMonthPicker` / `CalendarYearPicker` render-prop components (solidaria-components). Like upstream, each is context-agnostic (reads `CalendarContext` or `RangeCalendarContext`, works in both Calendar and RangeCalendar) — **not** split per-type. Exposed `minValue`/`maxValue` accessors on both calendar states for the year-window clamp. 6 tests.
- [x] **T-26** ✔ RAC — **RangeCalendar**: available dates derived from the first selected date (`firstAvailableDate` validation). **Done by us** this cycle (changeset `rangecalendar-available-range.md`): `createRangeCalendarState` now mirrors upstream `useRangeCalendarState` — anchor-aware `isDateUnavailable(date, anchorDate)`, an available range derived via `nextUnavailableDate` that narrows the effective min/max (feeding `isCellDisabled` / `isDateOutsideAllowedRange` so the prev/next page buttons disable at the span edges / `constrainDate`, unless `allowsNonContiguousRanges`), and `isValueInvalid` extended to flag a committed range whose endpoint is unavailable or out of `[minValue, maxValue]`. 6 stately tests. The `RangeCalendar` surfaces (solidaria-components / solid-spectrum) inherit the widened callback from `RangeCalendarStateProps`; the `DateRangePicker` adapts it to the 1-arg form its text fields expect (null anchor). **Follow-up:** the S2 `DateRangePicker` (`@ts-nocheck`) keeps a documentary 1-arg `isDateUnavailable` annotation though it already forwards the callback through to the embedded `RangeCalendar` at runtime — widening that annotation is tracked (analogous to the T-23 `CalendarProps` single-mode note).
- [ ] **T-27** ✅ RAC — **TableFooter** component. Present; verify. ⇄ same as the S2 1.4 TableFooter note.
- [ ] **T-28** 🔍 RAC — **description + error messages** for **Checkbox / Radio / Switch** (forms). Verify (generic-term match). ⇄ same as the S2 1.4 note.
- [x] **T-29** ✔ RAC — **SliderFill** component. **Done** (changeset `slider-fill-component.md`): ported to `solidaria-components/Slider.tsx` as `SliderFill` / `Slider.Fill` — single-thumb fill from `offset` (default minValue → 0%) to the current value, orientation-aware (`inset-inline-start`/`width` horizontal, `bottom`/`height` vertical), with `isHovered`/`isDisabled`/`orientation`/`valuePercent` render props + `data-*`, exported with a `SliderFillContext` alias; 12 tests.
- [ ] **T-30** ✅ S2 — **drag & drop** for ListView / TableView / TreeView. `useDragAndDrop`/`DragAndDropHooks` present; verify the three S2 surfaces wire it.
- [ ] **T-31** 🔍 S2 — **TableView highlight selection** + TableFooter. ⇄ TableFooter = **T-27**; highlight relates to **T-20**.
- [ ] **T-32** 🔍 S2 — custom **prefixes** for ComboBox / TextField. Verify (generic-term match).
- [ ] **T-33** ✅ S2 — **LabeledValue** (display non-editable values). Present in `labeledvalue/`; verify.

---

## Confirmed gaps (the actionable shortlist)

From the first pass, these are **confirmed absent** and are the clearest port
candidates (roughly highest-value first):

1. ~~**T-29 SliderFill**~~ — ✔ **done** (changeset `slider-fill-component.md`); first port landed.
2. ~~**T-25 CalendarMonthPicker / CalendarYearPicker**~~ — ✔ **done** (changeset `calendar-month-year-picker.md`); ~~**T-23 Calendar multi-select**~~ — ✔ **done** (changeset `calendar-multiple-selection.md`); ~~**T-26 RangeCalendar firstAvailableDate**~~ — ✔ **done** (changeset `rangecalendar-available-range.md`). **Calendar 1.18 cluster complete.**
3. **T-16 Table expandable rows** (`treeColumn`) — larger; assumes the collection plumbing.
4. ~~**T-17/T-21 Virtualizer window scrolling**~~ — ✔ **done** (changeset `virtualizer-window-scrolling.md`); `window ∩ element` viewport + a document-level capturing scroll listener, default-on via the new `allowsWindowScrolling` prop (opt-out to element-only). `isScrolling` pointer-events and `scrollToItem` tracked as follow-ups.
5. ~~**T-04 DateField constrain-on-blur**~~ — ✔ **done** (changeset `datefield-constrain-on-blur.md`); ported the `IncompleteDate` display model so edits constrain on blur, and removed the non-upstream min/max snap (out-of-range now stays as-typed + flags validation).

Everything tagged 🔍 needs a real check before it's either added here as a gap or
struck as already-present. Everything tagged ✅ still needs a depth/behavior
verify — an identifier is not a faithful port.
