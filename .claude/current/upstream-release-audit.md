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

> **Status — pass 1 complete; source-based depth-verify done; web pass 2 remains.**
> The tickets below come from the release **highlights** (pass 1, done). A
> **source-based depth-verify** (oldest-first, reconciling each greppable 🔍/✅
> against upstream `src` + ours) then resolved most of the list: confirmed-present
> **T-07, T-12, T-13, T-14, T-15, T-20, T-24, T-27, T-28, T-30, T-33** and the
> animated **T-01**; confirmed-gap **T-02** (EditableCell), **T-18** (horizontal
> virtualization), **T-32** (field `prefix`). What's **left for the web pass 2** is
> only the genuinely *behavioral* tickets a grep can't settle — **T-03** (DOM
> render prop), **T-05** (Menu-in-Popover), **T-06** (TreeView disabledBehavior),
> **T-09** (overlay positioning), **T-10** (scroll-into-view), **T-22** (icons),
> and the TableView-highlight half of **T-31** — via the per-PR "Fixed" lists
> (`react-aria.adobe.com/releases/v1-16-0`, …). Treat those 🔍 as "unverified."
> Execution of the confirmed ⛔ gaps (leaf-first, no conflicts): **T-29 SliderFill
> ✔**, **T-25 Calendar month/year pickers ✔**, **T-23 Calendar multi-select ✔**,
> **T-26 RangeCalendar available-range ✔** — which **completes the Calendar 1.18
> cluster** — and **T-16 Table expandable rows ✔** (the `UNSTABLE_` tree grid,
> headless React-Aria parity). New confirmed gaps (T-02, T-18, T-32) are on the
> shortlist at the foot.

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

- [x] **T-01** ✔ RAC — animated **Tab** transitions (animate the selected-indicator/panel between tabs). **Verified present + refined** this cycle (changeset `selection-indicator-reduced-motion.md`): our `Tabs` already animates the selected indicator via a `SelectionIndicator` + a `translate`/`width`/`height` transition (200ms, `out`), matching upstream. The depth-verify surfaced one faithfulness gap — the indicator transition was **not** gated behind `@media (prefers-reduced-motion: reduce): none` the way upstream's is — now fixed, and the **same gap in `SegmentedControl`'s selection pill** was fixed alongside it (the two form the S2 selection-indicator cluster; `Disclosure` already had the gate). **Adjacent finding (separate, larger — tracked):** our S2 `Toast` implements **no** enter/exit/restack animations at all (it sets `translate`/`opacity` instantly), whereas upstream animates them through the View Transitions API with its own `prefers-reduced-motion` gate. That is a standalone animation-port follow-up, not a reduced-motion tweak — adding a reduced-motion gate to a non-animating toast would be a no-op.
- [ ] **T-02** ⛔ S2 — inline **TableView** cell editing. **Confirmed gap** (depth-verify this cycle). Upstream ships an `EditableCell` component exported from S2 `TableView.tsx` (the `editableCell` style + `EditableCell`/`EditableCellInner`, ~lines 1480–1834) with a `renderEditing: () => ReactNode` slot that swaps a cell into an edit affordance (TextField, Picker, …) with its own focus + edit-overlay handling; exercised by `EditableTableView.test.tsx`. Our `solid-spectrum/src/table` exports no `EditableCell` and has no editing path — a real S2 port ticket (depends on our TableView + Picker/TextField cell rendering). Added to the shortlist.

## Train 2 — RAC 1.15.0 / S2 1.1.0 (2026-02-04)

- [ ] **T-03** 🔍 RAC — **DOM customization render prop** (new render prop to swap the rendered DOM element — Router `Link`, animation libs). Cross-cutting API; confirm we expose the equivalent.
- [x] **T-04** ✔ RAC — **DateField/DatePicker**: constrain dates **on blur**, not as-you-type (their most-upvoted issue). **Behavioral — invisible to the ARIA gate.** **Done by us** this cycle (changeset `datefield-constrain-on-blur.md`): ported upstream's `IncompleteDate` display model into `solid-stately`. A new `calendar/IncompleteDate.ts` (port of `@react-stately/datepicker`) holds the raw segment values, so a momentarily-impossible edit (e.g. month set to February while the day still reads `31`) is held exactly as typed while focused and constrained (Feb 31 → Feb 28) only on blur via `confirmPlaceholder`. `createDateFieldState` was reworked around a `displayValue: IncompleteDate` signal: `setSegment`/`incrementSegment`/`decrementSegment`/`clearSegment` operate on it; a complete + valid edit commits eagerly (fires `onChange`), an incomplete/invalid edit is held without firing `onChange` until blur; `segments` render the raw typed value via `Intl.NumberFormat`. **Divergence removed:** a typed value is no longer snapped to `minValue`/`maxValue` — out-of-range dates are kept and reported through validation (`rangeUnderflow`/`rangeOverflow`), matching React Aria (the 3 old clamp tests were rewritten to assert this). The `DateFieldState` public interface is unchanged, so `createDateSegment` (solidaria) and the `DateField`/`DatePicker`/`DateRangePicker` components (solidaria-components / solid-spectrum) inherit the behavior without API changes. **Solid note:** `confirmPlaceholder` only resets the `displayValue` signal when the value actually changed (a commit or a constrained Feb-31-style value), because blur fires on every focus move and Solid's reference-keyed `<For>` would otherwise recreate the just-focused segment node and drop focus. 13 stately tests (incl. invalid-combo-on-blur + eager-commit); full solid-stately suite green (836).
- [ ] **T-05** 🔍 S2 — **Menu** renders correctly when opened from within a **Popover** (regression fix). Verify our popover-nested menu.
- [ ] **T-06** 🔍 S2 — **TreeView** `disabledBehavior` styling updated to latest designs. Verify.

## Train 3 — RAC 1.16.0 / S2 1.2.0 (2026-03-04)

- [x] **T-07** ✅ RAC — **multi-select ComboBox** (`selectionMode="multiple"`, `ComboBoxValue`, TagGroup display). **Verified present** this cycle: `ComboBoxValue` exported + used in `solidaria-components/ComboBox.tsx`. (Deep tag-display parity is a component-validation concern, not this audit's "do we have it" question.)
- [x] **T-08** ✔ RAC — **Tree sections** (`TreeSection` + `TreeHeader`). **Done by us** this cycle — item 3b, commit `8341b2c3` (rowgroup/row/rowheader port).
- [ ] **T-09** 🔍 RAC — overlay **positioning** improvements. Behavioral; second-pass.
- [ ] **T-10** 🔍 RAC — **scroll-into-view** behavior. Behavioral; second-pass.
- [ ] **T-11** ➖ RAC — assorted crash fixes. Mine the per-PR list in the second pass.
- [x] **T-12** ✅ S2 — **ListView** GA. **Verified present**: styled `ListView.ts` + `gridlist/` in solid-spectrum (S2 ListView = the styled GridList).
- [x] **T-13** ✅ S2 — **unavailable menu items** (`isUnavailable`). **Verified present**: `isUnavailable` wired in `solid-spectrum/menu/index.tsx`.
- [x] **T-14** ✅ S2 — **ActionBar** support for **TreeView**. **Verified present**: `actionbar/index.tsx` (solid-spectrum) + `ActionBar.tsx` (solidaria-components), referenced by our `tree/index.tsx` (and gridlist/cardview/table). Deep Tree-integration parity is a component-validation concern.
- [x] **T-15** ✅ S2 — **Picker** custom render for the display value. **Verified present**: `renderValue` in `solid-spectrum/picker/index.tsx` + `solidaria-components/Select.tsx`.

## Train 4 — RAC 1.17.0 / S2 1.3.0 (2026-04-15)

- [x] **T-16** ✔ RAC — **Table expandable rows** (`treeColumn` + chevron button in cells; macOS-Finder-style trees). **Done by us** this cycle (changeset `table-expandable-rows.md`): ported the `UNSTABLE_` tree-grid stack headless-first through all three RAC-equivalent layers, keeping the `UNSTABLE_` prefix. **solid-stately** — new `createTreeGridState` (port of `useTreeGridState`) owns the expanded-keys signal (controlled `UNSTABLE_expandedKeys` / uncontrolled `UNSTABLE_defaultExpandedKeys` / `UNSTABLE_onExpandedChange`), rebuilds the collection on expansion change, and layers `toggleKey` + `expandedKeys`/`treeColumn` getters onto the base state via `defineProperty` (spread would break the reactive getters); collapse-from-`'all'` materialises every expandable row first. `TableCollection` gained a tree-grid mode (`buildTreeRows` stamps each node's `level`/`isExpandable`/sibling position; resolves `treeColumn`), and `createTableState` exposes inert `expandedKeys`/`treeColumn`/`toggleKey` so the row hook reads one shape in both modes. **solidaria** — `createTableRow` emits the tree-grid row ARIA (`aria-expanded` only when the row has children, `aria-level`/`aria-posinset`/`aria-setsize`) and a **press-based** `expandButtonProps` (mirrors `useTableRow`: `onPress` toggles + focuses the row, `excludeFromTabOrder` + `preventFocusOnPress` + `data-react-aria-prevent-focus`, `Expand`/`Collapse` label) so the chevron flows through our Button's `createPress` rather than a raw DOM `onClick`; ArrowRight/ArrowLeft expand/collapse (RTL-flipped, leaf → focus parent), stopping propagation so grid navigation doesn't double-fire. **solidaria-components** — `Table` wires `expandButtonProps` to a `chevron` Button slot and threads the render-prop values (`isExpanded` on rows; `hasChildItems`/`isTreeColumn` on cells) so the consumer renders the chevron only in the tree column of rows with children — S2's `TableView` gating. **Behavioral note removed:** no invented `aria-hidden` on leaf chevrons (upstream conditionally renders the chevron instead). Tests per layer (stately `createTreeGridState`, solidaria `createTableRow` tree-grid + press, components `Table` tree grid); full suites green (solid-stately, solidaria 3397, solidaria-components 2075); `guard:upstream-test-parity` exit 0 (the tree `aria-expanded`/`-level`/`-posinset`/`-setsize` show as we-only — confirmed faithful to `useTableRow` source). **Follow-up:** the S2-styled `ExpandableRowChevron` + tree-column indentation in the `solid-spectrum` styled TableView is tracked, not in this pass.
- [x] **T-17** ✔ RAC — **window scrolling** in **Virtualizer** (collection scrolls with the page; no fixed height). **Done by us** this cycle (changeset `virtualizer-window-scrolling.md`): the `Virtualizer` now computes its visible viewport as the scroll view's height intersected with the window viewport and offsets the visible range by how far the scroll view has been pushed above the viewport by page/ancestor scrolling, all driven by a single document-level capturing `scroll` listener — mirroring upstream `ScrollView`. A new `allowsWindowScrolling` prop (default `true`, matching RAC `CollectionRoot`'s hard-coded value) opts back into element-only scrolling; an explicit `viewportSize` layout option still wins. Behavior-preserving for a fixed-height collection inside the viewport (the `window ∩ element` math reduces exactly to element scroll), so existing collections are unaffected unless they actually scroll with the page; 58 Virtualizer tests (2 new window-scroll tests) plus the downstream collection suites stay green. **Follow-ups (do not affect window-scroll correctness):** the `isScrolling` `pointer-events: none` optimization and the imperative `scrollToItem`/`scrollToRect` API are not yet ported. ⇄ same feature as **T-21**.
- [ ] **T-18** ⛔ RAC — **horizontally virtualized** GridList + ListBox. **Confirmed gap.** Upstream `ListLayout` (`react-stately/src/layout/ListLayout.ts`) takes an `orientation` option (default `vertical`) and offsets items along `x` or `y` (`offsetProperty = orientation === 'horizontal' ? 'x' : 'y'`); RAC ListBox/GridList expose `data-orientation="horizontal"`. Our `solidaria-components/VirtualizerLayouts.ts` is hardcoded vertical (`y: row * rowHeight`, `height: rowHeight`) with no orientation axis. Real gap. Added to the shortlist.
- [ ] **T-19** ➖ RAC — dependency-management improvements (internal; not a port concern).
- [x] **T-20** ✅ S2 — **highlight selection** in **TreeView**. **Verified present**: our `tree/index.tsx` has `TreeSelectionStyle = "checkbox" | "highlight"` (default `checkbox`) feeding the style conditions, mirroring upstream's `selectionStyle` + `selectionBehavior={highlight ? 'replace' : 'toggle'}`. ⇄ The **TableView**-highlight half of **T-31** is separate (upstream S2 `TableView` exposes no `selectionStyle` — behavioral; left for Pass 2).
- [x] **T-21** ✔ S2 — **window scrolling** in collection components. ⇄ **dedup of T-17** — the S2-styled collections (`ListBox` / `Table` / `Tree` / `Menu` / …) inherit the default-on window scrolling through the shared `solidaria-components` `Virtualizer`; covered by the same changeset (`virtualizer-window-scrolling.md`), and the S2 collection suites (85 tests) stay green.
- [ ] **T-22** 🔍 S2 — updated **workflow icons** set. Verify our icon set is regenerated.

## Train 5 — RAC 1.18.0 / S2 1.4.0 (2026-05-30, current pin)

- [x] **T-23** ✔ RAC — **Calendar multiple date selection** (changeset `calendar-multiple-selection.md`). `selectionMode="multiple"` ported across `solid-stately` (defaulted `M` generic + `CalendarValueType`, array value, `isSameDay` toggle, `setValue(null)→[]`), `solidaria` (`aria-multiselectable` on the grid), and `solidaria-components` (`Calendar` generic over `M`, threads `selectionMode`). ⇄ same feature as the S2 1.4 Calendar note; the S2 styled `Calendar` (`@ts-nocheck`) already forwards `selectionMode` through to the headless component.
- [x] **T-24** ✅ RAC — **CalendarHeading** component. **Verified present**: `CalendarHeading` in Calendar + RangeCalendar across solidaria-components and solid-spectrum.
- [x] **T-25** ✔ RAC — **CalendarMonthPicker** + **CalendarYearPicker** (jump to month/year). **Done by us** this cycle (changeset `calendar-month-year-picker.md`): ported the `createCalendar{Month,Year}Picker` aria hooks (solidaria) + the headless `CalendarMonthPicker` / `CalendarYearPicker` render-prop components (solidaria-components). Like upstream, each is context-agnostic (reads `CalendarContext` or `RangeCalendarContext`, works in both Calendar and RangeCalendar) — **not** split per-type. Exposed `minValue`/`maxValue` accessors on both calendar states for the year-window clamp. 6 tests.
- [x] **T-26** ✔ RAC — **RangeCalendar**: available dates derived from the first selected date (`firstAvailableDate` validation). **Done by us** this cycle (changeset `rangecalendar-available-range.md`): `createRangeCalendarState` now mirrors upstream `useRangeCalendarState` — anchor-aware `isDateUnavailable(date, anchorDate)`, an available range derived via `nextUnavailableDate` that narrows the effective min/max (feeding `isCellDisabled` / `isDateOutsideAllowedRange` so the prev/next page buttons disable at the span edges / `constrainDate`, unless `allowsNonContiguousRanges`), and `isValueInvalid` extended to flag a committed range whose endpoint is unavailable or out of `[minValue, maxValue]`. 6 stately tests. The `RangeCalendar` surfaces (solidaria-components / solid-spectrum) inherit the widened callback from `RangeCalendarStateProps`; the `DateRangePicker` adapts it to the 1-arg form its text fields expect (null anchor). **Follow-up:** the S2 `DateRangePicker` (`@ts-nocheck`) keeps a documentary 1-arg `isDateUnavailable` annotation though it already forwards the callback through to the embedded `RangeCalendar` at runtime — widening that annotation is tracked (analogous to the T-23 `CalendarProps` single-mode note).
- [x] **T-27** ✅ RAC — **TableFooter** component. **Verified present**: `TableFooter` exported from `solidaria-components/Table.tsx` + `solid-spectrum/table`. ⇄ same as the S2 1.4 TableFooter note.
- [x] **T-28** ✅ RAC — **description + error messages** for **Checkbox / Radio / Switch** (forms). **Verified present**: `description` / `errorMessage` / `FieldError` wired in all three (`solidaria-components/{Checkbox,RadioGroup,Switch}.tsx`). ⇄ same as the S2 1.4 note.
- [x] **T-29** ✔ RAC — **SliderFill** component. **Done** (changeset `slider-fill-component.md`): ported to `solidaria-components/Slider.tsx` as `SliderFill` / `Slider.Fill` — single-thumb fill from `offset` (default minValue → 0%) to the current value, orientation-aware (`inset-inline-start`/`width` horizontal, `bottom`/`height` vertical), with `isHovered`/`isDisabled`/`orientation`/`valuePercent` render props + `data-*`, exported with a `SliderFillContext` alias; 12 tests.
- [x] **T-30** ✅ S2 — **drag & drop** for ListView / TableView / TreeView. **Verified present**: `useDragAndDrop` wired across `ListBox` / `GridList` / `Table` / `Tree` / `Menu` in solidaria-components.
- [ ] **T-31** 🔍 S2 — **TableView highlight selection** + TableFooter. ⇄ TableFooter = **T-27**; highlight relates to **T-20**.
- [ ] **T-32** ⛔ S2 — custom **prefixes** for ComboBox / TextField. **Confirmed gap.** Upstream hosts `prefix?: ReactNode` on the shared `FieldGroup` (`s2/src/Field.tsx`, with a `prefixId` + `aria-labelledby` association) and threads it into **ColorField, ComboBox, NumberField, TextField**. Prefix-only (no `suffix`). Our `solid-spectrum/field` exposes no prefix slot. Real gap. Added to the shortlist.
- [x] **T-33** ✅ S2 — **LabeledValue** (display non-editable values). **Verified present**: `solid-spectrum/labeledvalue/`.

---

## Confirmed gaps (the actionable shortlist)

From the first pass, these are **confirmed absent** and are the clearest port
candidates (roughly highest-value first):

1. ~~**T-29 SliderFill**~~ — ✔ **done** (changeset `slider-fill-component.md`); first port landed.
2. ~~**T-25 CalendarMonthPicker / CalendarYearPicker**~~ — ✔ **done** (changeset `calendar-month-year-picker.md`); ~~**T-23 Calendar multi-select**~~ — ✔ **done** (changeset `calendar-multiple-selection.md`); ~~**T-26 RangeCalendar firstAvailableDate**~~ — ✔ **done** (changeset `rangecalendar-available-range.md`). **Calendar 1.18 cluster complete.**
3. ~~**T-16 Table expandable rows**~~ (`treeColumn`) — ✔ **done** (changeset `table-expandable-rows.md`); the `UNSTABLE_` tree-grid stack ported headless-first through solid-stately (`createTreeGridState` + `TableCollection` tree mode) → solidaria (`createTableRow` tree ARIA + press-based chevron + arrow expand/collapse) → solidaria-components (`Table` chevron slot + `hasChildItems`/`isTreeColumn` render props). S2-styled chevron/indentation tracked as a follow-up.
4. ~~**T-17/T-21 Virtualizer window scrolling**~~ — ✔ **done** (changeset `virtualizer-window-scrolling.md`); `window ∩ element` viewport + a document-level capturing scroll listener, default-on via the new `allowsWindowScrolling` prop (opt-out to element-only). `isScrolling` pointer-events and `scrollToItem` tracked as follow-ups.
5. ~~**T-04 DateField constrain-on-blur**~~ — ✔ **done** (changeset `datefield-constrain-on-blur.md`); ported the `IncompleteDate` display model so edits constrain on blur, and removed the non-upstream min/max snap (out-of-range now stays as-typed + flags validation).

**Pass-1 shortlist (1–5) fully cleared.** New confirmed gaps now come from the
depth-verify of the 🔍/✅ tickets (oldest-first), highest-value first:

6. **T-02 inline TableView cell editing** (`EditableCell` + `renderEditing`) — S2-styled; depends on our TableView + Picker/TextField cell rendering. Largest of the open gaps.
7. **S2 Toast animations** (not a numbered release-notes ticket — found while verifying T-01). Our `Toast` sets `translate`/`opacity` instantly with no enter/exit/restack animation; upstream animates via the View Transitions API (with its own reduced-motion gate). Standalone animation-port follow-up.
8. **T-32 custom field `prefix`** — well-bounded: add `prefix?` to our `FieldGroup` (with `prefixId` + `aria-labelledby`) and thread it into ColorField / ComboBox / NumberField / TextField. Smallest of the open gaps; good next port.
9. **T-18 horizontal virtualization** — give our `VirtualizerLayouts` an `orientation` axis (offset along `x`/width when horizontal) so GridList/ListBox can virtualize horizontally. Layout-level; larger.

Everything tagged 🔍 needs a real check before it's either added here as a gap or
struck as already-present. Everything tagged ✅ still needs a depth/behavior
verify — an identifier is not a faithful port.
