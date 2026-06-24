# @proyecto-viviana/solid-stately

## 0.4.0

### Minor Changes

- 7c1708c: Port the two-layer selection model from React Stately (spine keystone)

  Upstream splits collection selection into two layers, and our engine had
  collapsed them into one. This restores the upstream shape so the rest of the
  headless spine (the selectable-collection keyboard delegate, context slots, the
  autocomplete bridge) can build on a faithful base.
  - **`createMultipleSelectionState`** — the raw lower layer (port of
    `useMultipleSelectionState`): owns selected keys, focus, selection behavior,
    and disabled keys, but is _not_ collection-aware. Includes the faithful
    `selectionBehavior` sync rules (long-press-to-select reset, prop changes).
  - **`SelectionManager`** — the collection-aware upper layer (port of the
    `SelectionManager` class): toggle / replace / extend-range / select-all /
    `firstSelectedKey` / `lastSelectedKey` / `withCollection`, etc., built on top
    of the raw state. Now exported publicly (`SelectionManager`,
    `SelectionManagerOptions`, `LayoutDelegate`).
  - **`createListState`** now builds `createMultipleSelectionState` +
    `SelectionManager` internally and exposes the manager as
    `ListState.selectionManager` (matching upstream `useListState`). The flattened
    surface is kept as a delegating shim for back-compat.
  - **`ComboBoxState` / `SelectState`** expose `selectionManager` too, mirroring
    upstream `useComboBoxState` / `useSelectState` (the combobox manager stays
    bound to the unfiltered collection; filtering is display-only).

  Faithful behavior change: `onSelectionChange` now receives a `Selection` (a
  `Set` subclass carrying `anchorKey` / `currentKey`) instead of a plain `Set`,
  exactly as upstream does. A `Selection` _is_ a `Set`, so `.has`, iteration,
  `.size`, spread and `instanceof Set` all behave identically — the anchor/current
  metadata is what lets controlled consumers continue shift-click ranges across a
  round-trip. Tests that asserted an exact plain-`Set` instance now compare
  contents.

### Patch Changes

- 1e480e9: Fix `createCalendarState` to default the visible-range alignment to `center`,
  matching `@react-stately/calendar` `useCalendarState`. Previously it defaulted to
  `start`, which only diverged for views of 3+ months (e.g. a 3-month view focused
  on June rendered June–August instead of the centered May–July).
- 1fb52f6: Calendar: add `CalendarMonthPicker` and `CalendarYearPicker` (port of react-aria-components 1.18)

  React Aria 1.18 added month/year "jump-to" pickers to the Calendar so users can
  move focus directly to a month or year instead of paging. This ports the full
  stack: the `createCalendarMonthPicker` / `createCalendarYearPicker` aria hooks in
  `solidaria`, and the headless `CalendarMonthPicker` / `CalendarYearPicker`
  render-prop components in `solidaria-components`.

  Mirroring upstream, each component is context-agnostic — it reads whichever
  calendar state is present (`CalendarContext` or `RangeCalendarContext`) and works
  inside both `Calendar` and `RangeCalendar`. The month picker exposes the months
  of the focused year (count derived from `calendar.getMonthsInYear`, honoring
  `getFormattableMonth` for offset calendars); the year picker exposes a sliding
  window of `visibleYears` (default 20) centered on the focused year and clamped to
  the calendar's `minValue` / `maxValue`. Both expose `aria-label`, the focused
  `value`, an `onChange` that calls `setFocusedDate`, and a localized `items` list.

  To support the year picker's clamp, `CalendarState` and `RangeCalendarState` now
  expose `minValue` / `maxValue` accessors. Exported from `solidaria` as the
  `createCalendar{Month,Year}Picker` hooks (+ `CalendarMonthPickerProps`,
  `CalendarMonthPickerItem`, `CalendarMonthPickerAria`, `CalendarYearPickerProps`,
  `CalendarYearPickerFormatOptions`, `CalendarYearPickerItem`,
  `CalendarYearPickerAria`) and from `solidaria-components` as the two components
  (+ their props and render-prop value types).

- c0a8ec9: Calendar: add `selectionMode="multiple"` for selecting multiple dates (port of react-aria-components 1.18)

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

- d99d486: DateField/DatePicker: constrain dates on blur instead of as-you-type (port of react-aria-components 1.18)

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

- 71e1220: DragTypes: match `*/*` and `type/*` wildcards and accept arrays

  `DragTypes.has` now mirrors `@react-aria/dnd`: it accepts a `DragType` or an array
  of them, matches the `*/*` wildcard against any present type, and matches a
  `type/*` wildcard against the type prefix (e.g. `image/*` accepts `image/png`).
  Previously only an exact MIME string matched, so `acceptedDragTypes: ['image/*']`
  never matched a dragged `image/png` over the DataTransfer-backed path. The
  directory check is also tightened to the directory drag type specifically rather
  than any symbol. The public `DragTypes` interface gains the upstream `DragType`
  alias and the `has(type: DragType | DragType[])` signature.

- 535be08: GridList: skip disabled rows during keyboard navigation under `disabledBehavior: "all"`

  `createGridList`'s `ArrowDown`/`ArrowUp`/`Home`/`End`, the horizontal
  `ArrowRight`/`ArrowLeft` axis, and the focus-in entry point previously landed on
  disabled rows. They now walk past them to the next/previous/first/last enabled
  row, mirroring React Aria's `ListKeyboardDelegate`. The skip is gated on the
  default `disabledBehavior: "all"`; under `"selection"` disabled rows stay
  focusable (only their selection is suppressed).

  To drive this gate the shared grid state now resolves and exposes
  `disabledBehavior` (default `"all"`), the same way upstream reads it from the
  selection manager. `GridStateOptions` and `TableStateOptions` accept the prop,
  and `createTableState` threads it through, so Table inherits the same resolved
  default. Selection of disabled keys remains blocked regardless of
  `disabledBehavior`, matching `SelectionManager.canSelectItem`.

- a6aa0af: Route GridList, Tree, and Table row selection/actions through the shared selectable item press path, including replace-mode secondary actions, focused-row keyboard activation, and disabled-for-selection rows. Align S2 TableView's default selection timing with upstream RAC by leaving normal rows on pointer-down selection unless drag selection requests pointer-up timing.
- 1896fe4: RangeCalendar: derive available dates from the first selected date (port of react-aria-components 1.18)

  React Aria 1.18 made `RangeCalendar`'s `isDateUnavailable` anchor-aware so that,
  once the first endpoint of a range is selected, the still-selectable dates are
  bounded by the nearest unavailable date on each side (you can't form a range that
  spans an unavailable day unless `allowsNonContiguousRanges` is set).

  `createRangeCalendarState` now mirrors upstream `useRangeCalendarState`:
  - `isDateUnavailable` widens to `(date: DateValue, anchorDate: CalendarDate | null)
=> boolean`. The second argument is the current selection anchor, so consumers
    can adjust availability based on the user's first pick. (Single-argument
    callbacks remain assignable, so existing callers are unchanged.)
  - While anchored, an available range is derived via `nextUnavailableDate` — walking
    outward from the anchor until the first unavailable date on each side — and used
    to narrow the effective min/max. This flows into `isCellDisabled`,
    `isDateOutsideAllowedRange` (so the previous/next page buttons disable at the
    span edges), and `constrainDate` (so focus stays within the span). Setting
    `allowsNonContiguousRanges` skips the narrowing.
  - `isValueInvalid` now also reports `true` when a committed range (not mid-drag)
    has an endpoint that is unavailable or outside `[minValue, maxValue]`.

  `RangeCalendar` (solidaria-components / solid-spectrum) inherits the widened
  callback type from `RangeCalendarStateProps`. The `DateRangePicker` adapts the
  anchor-aware callback to the 1-argument form its text fields expect (a field has
  no range anchor, so it is called with a `null` anchor).

- 5e6c0b8: Selection: restore upstream's two-layer onSelect split

  Selection state previously resolved modifier keys (`ctrlKey || metaKey`,
  `shiftKey`) inside `SelectionState.select()` — a divergence from React Spectrum,
  where `react-stately`'s `SelectionManager.select` only consults `pointerType` +
  `selectionBehavior`, and the modifier/shift decision lives in the aria layer's
  `useSelectableItem.onSelect`. That divergence also blocked platform-aware ctrl
  resolution, since `solid-stately` can't reach `isMac`.

  This mirrors the upstream split:
  - **`solid-stately`** `select(key, e?)` is thinned to the `SelectionManager.select`
    shape: single-mode toggle/replace, then `selectionBehavior === 'toggle'` or a
    `touch`/`virtual` `pointerType` toggles, otherwise replace. It no longer reads
    modifier keys or takes a `collection` argument. A new `SelectionPressEvent`
    type describes the press/pointer interaction it consults.
  - **`solidaria`** gains the aria-layer decision `selectItem` (mirroring
    `useSelectableItem.onSelect`) plus the `isCtrlKeyPressed` and
    `isNonContiguousSelectionModifier` helpers. `createMenu`'s keyboard activation
    now routes selection through `selectItem`, so the non-contiguous modifier is
    platform-aware (Command/Alt on macOS, Control elsewhere) and the shift-extend
    path is applied.

  No user-visible behavior change for the existing menu/listbox/actiongroup paths
  beyond making keyboard modifier selection platform-correct; the foundational
  work unblocks the collection item-hook press-path migration.

- 30512d3: createSelectionState: ignore `selectionBehavior` in single selection mode

  `select()` now mirrors React Aria's `useSelectableItem` `onSelect`: in single
  selection mode the selection behavior is ignored, so re-selecting the currently
  selected item deselects it when empty selection is allowed (and keeps it
  selected when `disallowEmptySelection` is set). Previously a `"replace"`
  behavior short-circuited this path and left the item selected, so a single-mode
  ListBox/Menu with highlight selection could never be cleared by re-activating
  its selected item.

- c2b8c5e: Table: add expandable rows / tree grid (port of react-aria-components 1.17 `UNSTABLE_` tree grid)

  React Aria 1.17 added expandable Table rows — a `treeColumn` whose cells carry a
  chevron button that expands/collapses nested `childItems`, giving a
  macOS-Finder-style tree inside a TableView. This ports the headless stack through
  all three RAC-equivalent layers, keeping upstream's `UNSTABLE_` prefix on the
  public expansion API.

  **solid-stately** — a new `createTreeGridState` (port of
  `@react-stately/table`'s `useTreeGridState`) owns the expanded-keys signal,
  controlled via `UNSTABLE_expandedKeys` or uncontrolled from
  `UNSTABLE_defaultExpandedKeys`, and notifies `UNSTABLE_onExpandedChange`. It
  rebuilds the `TableCollection` whenever the expanded keys (or data) change and
  layers a `toggleKey` plus `expandedKeys` / `treeColumn` getters onto the base
  table state via `defineProperty` (spreading would eagerly evaluate the state's
  reactive getters and break reactivity). Collapsing from `'all'` first
  materialises every expandable row, matching upstream's `toggleKey`.
  `TableCollection` gains a tree-grid mode (selected by passing an `expandedKeys`
  option, even an empty set): `buildTreeRows` walks `childRows`, stamping each
  `GridNode` with its `level`, `isExpandable`, and sibling position so the row hook
  can read `aria-level` / `aria-posinset` / `aria-setsize` directly, and resolves a
  `treeColumn` (the explicit option or the first row-header column). `createTableState`
  exposes inert `expandedKeys` / `treeColumn` / `toggleKey` members for flat tables
  so the row hook has one shape to read from in both modes.

  **solidaria** — `createTableRow` now emits the tree-grid row ARIA
  (`aria-expanded` only when the row has children, plus `aria-level`,
  `aria-posinset`, `aria-setsize`) and an `expandButtonProps` for the chevron.
  Following `useTableRow`'s `expandButtonProps`, the chevron is **press-based**
  (`onPress` toggles the row and moves focus to it) so it flows through our Button's
  `createPress` rather than a raw DOM `onClick`; it is `excludeFromTabOrder` +
  `preventFocusOnPress` and carries `data-react-aria-prevent-focus`, with an
  `aria-label` of `Expand`/`Collapse`. The row's `onKeyDown` handles tree
  expand/collapse on ArrowRight/ArrowLeft (flipped under RTL): expand a focused
  collapsed parent, collapse an expanded one, or move focus to the parent from a
  leaf — stopping propagation so the grid's arrow navigation doesn't also fire.

  **solidaria-components** — `Table` wires `expandButtonProps` to a `chevron`
  Button slot and threads the tree-grid render-prop values
  (`isExpanded` on rows; `hasChildItems` / `isTreeColumn` on cells) so a consumer
  renders the chevron only in the tree column of rows that have children — the same
  gating S2's `TableView` uses. (The chevron registry is reset per render pass so
  cells recreated when a row toggles re-claim their column key instead of stranding
  past the column list.)

  The `UNSTABLE_` prefix is intentionally retained to match upstream's
  still-unstable status. The S2-styled `ExpandableRowChevron` and tree-column
  indentation in the styled `solid-spectrum` TableView are a tracked follow-up and
  are **not** part of this change — this is the headless React-Aria-parity port.

- e63d870: Toast: animate enter/exit/restack via the View Transitions API (port of the S2 toast animations)

  Previously our S2 `Toast` set `translate`/`opacity` instantly, so adding,
  removing, expanding, or restacking toasts snapped into place with no animation.
  Upstream `@react-spectrum/s2` animates every queue mutation through the View
  Transitions API, with a `prefers-reduced-motion` fallback. This ports that
  faithfully across two layers:
  - **`solid-stately`** — `ToastQueue` gains a generic `wrapUpdate(fn, action)`
    hook (mirroring `@react-stately/toast`), where `action` is the `ToastAction`
    (`'add' | 'remove' | 'clear'`) that triggered the update. The new visible
    toasts are still computed synchronously; only the subscriber fan-out that
    drives the re-render runs inside `wrapUpdate`, so it can be wrapped in a view
    transition without changing what the queue resolves to. A `setWrapUpdate`
    method lets a shared queue (e.g. the global one) attach the wrapper after
    construction. With no wrapper installed the queue notifies exactly as before.
  - **`solid-spectrum`** — `ToastContainer` installs a `wrapUpdate` that runs each
    global-queue mutation, plus stack expand/collapse, inside
    `document.startViewTransition()` (the queue mutation is applied via Solid's
    `batch` so the post-state is captured synchronously, the analog of upstream's
    `flushSync`). It adds a `toast-<action>` class to `<html>` so the injected CSS
    can target the transition, tracks `prefers-reduced-motion` (with a
    `PRIVATE_forceReducedMotion` test hook) into the reduced-motion path, and
    tags each toast with a `view-transition-name` / `view-transition-class`
    matching upstream — the numeric queue keys are prefixed (`toast-<key>`) so they
    are valid CSS idents, and background stack toasts gain a per-index suffix under
    reduced motion so the list cross-fades instead of sliding. The upstream
    `Toast.module.css` keyframes, `::view-transition-group()` rules, and global
    `html.toast-*` selectors — none of which the atomic `style()` macro can
    express — are injected once at runtime as a guarded `<style>`, the same idiom
    `solidaria` already uses for `createPress` / `createPreventScroll`.

  Where the View Transitions API is unavailable (SSR, jsdom, older browsers) the
  mutation runs synchronously, so behavior is unchanged.

- 8cc7ecc: Tree: align disabled-key keyboard and selection semantics with upstream

  Disabled tree keys now follow React Aria's split between navigation and
  selection, instead of conflating the two:
  - **Keyboard navigation skips disabled rows under the default `disabledBehavior:
"all"`.** `createTree`'s `ArrowDown`/`ArrowUp`/`Home`/`End` handlers (and the
    focus-in entry point) previously landed on disabled rows; they now walk past
    them to the next/previous/first/last enabled row, mirroring
    `ListKeyboardDelegate.getKeyBelow`/`getKeyAbove`/`getFirstKey`/`getLastKey`.
    Under `disabledBehavior: "selection"` disabled rows stay focusable, matching
    upstream (only their selection is suppressed). `TreeState` now exposes the
    resolved `disabledBehavior` so the navigation layer can apply this gate, the
    same way upstream reads it from the selection manager.
  - **Disabled keys are never selectable, regardless of `disabledBehavior`.**
    `toggleSelection`/`replaceSelection`/`extendSelection` previously only blocked
    disabled keys under `"all"`, so a `"selection"`-disabled key could still be
    selected. They now block disabled keys unconditionally, mirroring
    `SelectionManager.canSelectItem`, which ignores `disabledBehavior`.

  Expansion behavior is unchanged.

## 0.3.0

### Minor Changes

- [`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Build with tsdown (Rolldown/Oxc) and adopt the standard Solid-library
  JSX-preserve layout.

  The `solid` export condition now resolves to a built, JSX-preserved `dist/*.jsx`
  entry that the consumer compiles per-environment, alongside a compiled
  `dist/*.js` `default` fallback — replacing the dual DOM+SSR bundle (whose SSR
  half was never wired into `exports`). SSR consumers can now resolve the packages
  from `node_modules` without recompiling first-party source. solid-spectrum's
  `style()` macro still runs at build time (emitting `styles.css`), so consumers
  don't need the macro plugin. viviana-ui ships its first real dist (a thin
  re-export of solid-spectrum).

## 0.2.7

### Patch Changes

- [#34](https://github.com/proyecto-viviana/proyecto-viviana/pull/34) [`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

## 0.2.6

### Patch Changes

- [#32](https://github.com/proyecto-viviana/proyecto-viviana/pull/32) [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

## 0.2.5

### Patch Changes

- Fix Set generic inference in createSelectionState and createSelectState to use explicit Set<Key> type parameters
