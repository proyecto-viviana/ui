# @proyecto-viviana/solidaria-components

## 0.4.0

### Minor Changes

- 83c9a6f: Make `CheckboxField` help text faithful to upstream react-aria-components. The
  `description` / `errorMessage` props are dropped; `CheckboxField` now provides
  `TextContext` description/errorMessage slots so a child `<Text slot="description">`
  or `<FieldError>` resolves the id that the checkbox's `aria-describedby` references.
  `createCheckbox` / `createCheckboxGroupItem` now expose `descriptionProps` /
  `errorMessageProps` and bake the slot ids into the input's `aria-describedby`
  (grouped items keep their own describedby and append the group's shared ids,
  mirroring `useCheckboxGroupItem`). The deprecated `Checkbox` monolith keeps its
  prop-based help text.
- 5bc7d29: ComboBox, DatePicker, and DateRangePicker now provide their description and
  errorMessage as TextContext slots, so a `<Text slot="description">` /
  `<Text slot="errorMessage">` child resolves the id its `aria-describedby`
  references — mirroring upstream react-aria-components field wiring. The existing
  per-component description/error sub-components are unchanged.
- 69d7ee4: DateField and TimeField now provide their description and errorMessage as
  TextContext slots, so a `<Text slot="description">` / `<Text slot="errorMessage">`
  child resolves the id its `aria-describedby` references — mirroring upstream
  react-aria-components field wiring. The existing `DateFieldDescription` /
  `TimeFieldDescription` sub-components are unchanged.
- aee055a: Port the context/slot machinery from React Aria (spine keystone 3)

  Makes the headless `utils.tsx` context helpers faithful to
  react-aria-components, so collection/field components can consume slotted
  contexts and merge refs the way upstream's `useContextProps(props, ref, ctx)`
  does. Additive — there are no functional consumers yet (every component still
  uses native `Context.Provider`), so existing behavior and snapshots are
  unchanged; the `migrate-*-spine` tasks wire components onto this.
  - **`Provider`** — was a no-op; now nests each `[Context, value]` pair around the
    children, last pair outermost (matching upstream's wrap-in-iteration-order).
    Children render through a lazy getter inside the innermost provider so child
    components are _created_ within every provider's owner — Solid binds
    `useContext` at component-execution time, so eager children would miss the
    providers.
  - **`useSlottedContext(context, slot)`** — resolves a `slots` record: `slot`
    (or `DEFAULT_SLOT`) is looked up and throws on an unknown name; an explicit
    `null` slot opts out of the context; a bare (non-slotted) value passes through.
  - **`useContextProps(props, ref, context)`** — resolves the context for
    `props.slot`, merges context props under the component's own (props win,
    handlers chain via the reactive `mergeProps`, so prop changes keep flowing),
    and merges the component ref with the context ref into one callback.
  - **`useSlot`** — ref callback + accessor reporting whether slotted content was
    rendered, for the `aria-label` fallback pattern.
  - Adds `RefLike` / `WithRef` / `SlottedValue` / `SlottedContextValue` types,
    `assignRef` / `mergeRefs`, and re-typed `ContextValue<T, E>` to upstream's
    slotted-with-ref shape. `DEFAULT_SLOT` stays the string `"default"` (upstream
    uses `Symbol('default')`) so slot records remain `Record<string, …>`, matching
    the styled-layer `SpectrumContextValue` contract.

- 229dbed: Add the RAC 1.19 form-field split: `SwitchField`/`SwitchButton`/`SwitchFieldContext`, `CheckboxField`/`CheckboxButton`/`CheckboxFieldContext`, `RadioField`/`RadioButton`/`RadioFieldContext`

  Upstream `react-aria-components` 1.19 split each monolithic Switch / Checkbox /
  Radio into a `*Field` wrapper (owns toggle state, validation, and help text) that
  contains a `*Button` control (the clickable label + indicator). The nine names
  are now exported from `@proyecto-viviana/solidaria-components`, closing the
  `guard:rac-export-gap` shortfall (0 RAC names missing).

  The split is faithful to upstream's component contract — same render-prop shapes
  (`isSelected`/`isDisabled`/`isReadOnly`/`isInvalid`/`isRequired`, plus
  `isIndeterminate`/`isPressed` where upstream exposes them), `data-*` attributes,
  and `description`/`errorMessage` bridged onto `aria-describedby`. Because our
  `<Provider>` is a no-op and `TextContext` is inert (the tracked `port-context-slots`
  debt), the field→button handoff uses a native context (`Internal*Context`) read
  inside the provider via the proven `Show … keyed` owner pattern rather than
  upstream's `Provider values={…}` slot mechanism. The deprecated monolith
  wrappers (`ToggleSwitch`, `Checkbox`, `Radio`) remain the styled primaries.

- f7df649: Make `RadioField` help text faithful to upstream react-aria-components. The
  per-option `description` / `errorMessage` props are dropped; `RadioField` now
  provides a `TextContext` description slot so a child `<Text slot="description">`
  resolves the id that the radio's `aria-describedby` references. `createRadio`
  exposes `descriptionProps` and bakes the slot id into the input's
  `aria-describedby` in upstream order (the user's own describedby, the radio's own
  description, then the group's invalid error message and shared description),
  mirroring `useRadio`. Radios have no per-option error slot — errors are reported
  at the group level. The deprecated `Radio` monolith keeps its prop-based help
  text.
- 58904aa: SearchField and NumberField now provide their description and errorMessage as
  TextContext slots, so a `<Text slot="description">` / `<Text slot="errorMessage">`
  child picks up the id its `aria-describedby` references — mirroring upstream
  react-aria-components field wiring.
- b113196: Split the `.` barrel into per-primitive build entries and add subpath exports

  Both packages previously shipped a single bundled `dist/index.jsx` for the `solid`
  export condition. Because that barrel exceeded 500 KB, any consumer — even one
  importing a single primitive — dragged the whole file through `vite-plugin-solid`,
  tripping Babel's `compact: "auto"` deopt ("the code generator has deoptimised …
  as it exceeds 500KB"). App-level `babel.compact` only masked the warning.

  The build now emits one entry per public module (shared code hoisted into
  `_chunk/` chunks), so `dist/index.jsx` is a thin re-export barrel and no emitted
  `.jsx` approaches the deopt threshold — the warning is gone for barrel consumers
  too. Each primitive also gains a subpath export:

  ```ts
  import { createButton } from "@proyecto-viviana/solidaria/button";
  import { Button } from "@proyecto-viviana/solidaria-components/Button";
  ```

  The `.` barrel is preserved, so existing imports keep working — this is additive.
  solidaria's impl lands inside its type directory (`dist/<name>/index.jsx`) so the
  barrel's relative `export … from "./<name>"` resolves to the typed directory
  rather than a flat sibling file. A new `guard:jsx-deopt-size` check keeps every
  published `.jsx` under the threshold.

- 608a401: SwitchField now mirrors upstream react-aria-components exactly for help text.
  `createToggle`/`createSwitch` mint `descriptionProps`/`errorMessageProps` (slot
  ids) and bake the combined `aria-describedby` into the input, and `SwitchField`
  exposes those ids through `TextContext` slots.

  Breaking: `SwitchField` no longer accepts `description` / `errorMessage` props.
  Render the help text as children instead — `<Text slot="description">…</Text>`
  and `<FieldError>…</FieldError>` — matching upstream. The legacy `ToggleSwitch`
  monolith is unchanged.

- f7c038d: Make `Text` slot-aware, the foundational slice of `migrate-describedby-slots`.
  `TextContext` now defaults to `{}` and `Text` resolves its slot through
  `useContextProps`, so a field can provide the `id` (and other props) for a named
  slot and a `<Text slot="description">` child picks it up — mirroring
  react-aria-components' `Text`. The logical `slot` prop is excluded from the DOM
  spread. Additive and behavior-preserving: no field provides `TextContext` slots
  yet, so an unprovided `<Text>` renders exactly as before.
- 228f14a: `TextField` now provides its `descriptionProps` / `errorMessageProps` as
  `TextContext` slots (`description` / `errorMessage`) through the generic
  `Provider`, mirroring react-aria-components' `TextField`. A
  `<Text slot="description">` / `<Text slot="errorMessage">` child inside a
  `TextField` picks up the `id` its `aria-describedby` references via the faithful
  slot path. Additive: existing consumers that read these props off
  `TextFieldContext` are unaffected.

### Patch Changes

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

- 58a62d5: GridList: make the keyboard navigation axis orientation-aware

  The custom GridList keyboard handler (`createGridList`) only ever navigated the
  block axis (Up/Down), so in a `orientation="horizontal"` list the Left/Right
  arrows did nothing. It now mirrors upstream's `ListKeyboardDelegate` for a
  `stack` layout:
  - **Vertical (default):** Left/Right stay no-ops (upstream strips
    `getKeyLeftOf`/`getKeyRightOf` for a vertical stack); Up/Down navigate
    prev/next.
  - **Horizontal:** Left/Right become the primary axis — Right moves to the next
    item, Left to the previous — flipped under RTL (Right=prev, Left=next). Up/Down
    keep navigating the block axis too, matching upstream.

  The `solidaria-components` `GridList` threads its resolved `orientation` and text
  `direction` (reusing the same `getComputedStyle`/`document.dir` resolution as its
  drag-and-drop delegate) into the hook. This completes the `T-18` horizontal
  GridList follow-up: the windowing/layout half already shipped in
  `virtualizer-horizontal-orientation.md`; this is the navigation half. The default
  vertical orientation is unchanged.

- 7de4ea8: GridList, Menu, Table: forward the `disabledBehavior` prop to collection state

  `GridList` and `Menu` now expose `disabledBehavior` (`"selection" | "all"`), and all
  three wrappers forward it to their `createGridState` / `createMenuState` /
  `createTableState` call. `Table` already accepted the prop but dropped it before it
  reached the state, so it was silently ignored. The default stays `"all"`, leaving
  existing behavior unchanged; under `"selection"` a disabled item stays focusable and
  fires `onAction` while remaining unselectable, matching React Aria's `RACGridList`,
  `Menu`, and `Table`.

- a6aa0af: Route GridList, Tree, and Table row selection/actions through the shared selectable item press path, including replace-mode secondary actions, focused-row keyboard activation, and disabled-for-selection rows. Align S2 TableView's default selection timing with upstream RAC by leaving normal rows on pointer-down selection unless drag selection requests pointer-up timing.
- d03dac4: GridList: stop Space/Enter from double-toggling the focused row

  The grid container and the row both handled Space (toggle selection) and Enter
  (onAction). Solid delegates keydown at the document and replays it up the
  composed path, so a keypress on the focused row fired both handlers — toggling
  selection twice (a net no-op) and double-invoking onAction.

  Upstream's `useSelectableCollection` has no Space/Enter case: the focused item
  owns both, via `useSelectableItem`. The port now follows that split — Space and
  Enter are dropped from `createGridList` and owned by `createGridListItem`. For
  the row's handlers to receive the keypress, browser focus follows the roving
  tabindex onto the focused row from a post-commit effect (mirroring Table),
  located by a stable `data-key` now rendered on each `GridListItem`.

  `createGridListItem` gains an `"all"`-gated interaction guard so rows that are
  focusable-but-not-selectable (`disabledBehavior: "selection"`) stay actionable
  via keyboard, matching the grid hook's existing navigation gate.

- 18ec24f: ListBox: make the keyboard navigation axis orientation-aware

  `createListBox`'s keyboard handler only navigated the block axis (Up/Down), so in
  an `orientation="horizontal"` listbox the Left/Right arrows did nothing. It now
  mirrors upstream's `ListKeyboardDelegate` for a `stack` layout:
  - **Vertical (default):** Left/Right stay no-ops (upstream strips
    `getKeyLeftOf`/`getKeyRightOf` for a vertical stack); Up/Down navigate
    prev/next.
  - **Horizontal:** Left/Right become the primary axis — Right moves to the next
    option, Left to the previous — flipped under RTL (Right=previous, Left=next).
    Up/Down keep navigating the block axis too, matching upstream. With nothing
    focused, either arrow enters at the first option (upstream's `getFirstKey()`
    fallback), and disabled options are skipped.

  The Left/Right cases carry the same selection-on-focus side effects as Up/Down
  (replace in single-select, shift-extend in multi-select). The
  `solidaria-components` `ListBox` threads its `orientation` and the `useLocale()`
  text direction into the hook — the same direction source upstream's ListBox uses.
  The default vertical orientation is unchanged.

- 5a741e0: Move real DOM focus onto the focused item during Menu keyboard navigation.

  Arrow/Home/End keys flipped each item's `tabIndex` (the declarative half of
  roving tabindex) but never called `element.focus()`, so the keyboard cursor and
  the assistive-technology cursor never moved off the menu container — making the
  Menu unusable with a screen reader. `createMenuItem` now imperatively focuses
  the item's element when it becomes the collection's focused key (and the menu is
  focused), mirroring React Aria's `useSelectableItem`. `Menu` wires the item ref
  through to the behavior, including the inner anchor for link items.

- 220ba68: Menu: pass the activated item's value as the second `onAction` argument

  Menu-level `onAction` now fires `(key, value)` instead of `(key)`, matching
  React Aria 1.19. Upstream `@react-aria/menu` `useMenu` types it as
  `onAction?: (key: Key, value: T) => void` and threads `props.onAction` into the
  shared, type-erased `MenuData` (`utils.ts`: `onAction?: (key, value: any)`),
  where both `useMenuItem` `performAction` (press/keyboard) and the menu's own
  keyboard activation invoke `onAction(key, item?.value)`.
  - **solidaria / createMenu**: `AriaMenuProps` is now generic (`AriaMenuProps<T>`),
    its `onAction` typed `(key, value: T)`. The keyboard activation path passes
    `collection.getItem(focusedKey)?.value`, and `MenuData.onAction` is type-erased
    (`value: unknown`) like upstream's `MenuData`.
  - **solidaria / createMenuItem**: the press path now calls
    `data.onAction(key, item?.value)` after the item-level `onAction()`, mirroring
    `useMenuItem` `performAction`.
  - **solidaria-components / Menu**: `MenuProps.onAction` is typed `(key, value: T)`.
    For dynamic collections the forwarded `value` is the user's data item (the node
    `value`); static JSX children are modeled with an internal item descriptor that
    upstream React Aria Components does not expose as `value` (RAC `Menu.tsx`
    auto-sets `MenuItem.value` only for dynamic collections), so it is suppressed to
    `undefined` there to match.

  The new `value` argument also flows transparently through the S2 `ActionMenu` and
  `Menu` (`@proyecto-viviana/solid-spectrum`), which forward the underlying
  collection's `onAction`.

- 5db5585: Menu parity fixes: shouldCloseOnSelect, mouse pressed state, ActionMenu rich items, roving focus

  **solidaria / createMenu**: gate `onClose` on `shouldCloseOnSelect !== false` so keyboard-activated items with that prop set do not close the menu — mirrors `@react-aria/menu` `useMenuItem` line 231.

  **solidaria / createMenuItem**: rename `_ref` to `ref` and wire a `createEffect` that imperatively calls `focusSafely` when the item becomes the focused key and real DOM focus has not already landed there. Completes the roving-tabindex loop: the declarative tabIndex 0/-1 swap is now backed by an actual focus call, matching `@react-aria/selection` `useSelectableItem`.

  **solidaria-components / Menu**: fix `shouldCloseOnSelect` splitProps grouping (was in `local`, now in `stateProps`) so the value reaches `createMenu`; add `MenuItemCloseRegistryContext` for per-item override; add `get shouldCloseOnSelect()` getter on `ariaProps`; wire mouse-pressed signal into `MenuTriggerContextValue` so `MenuButton` reflects pointer-down state correctly.

  **solid-spectrum / ActionMenu**: replace the internal `HeadlessMenuItem` usage with the full `MenuItem` component; surface description, shortcut, icon, `isDisabled`, and link props (`href`/`target`/`rel`/`download`) matching the upstream S2 `ActionMenu` API.

  **solid-spectrum / menu/index**: extract `MenuItemContents` as a named SolidJS component to allow reuse by `ActionMenu`.

- 7e7fe8c: NumberField a11y: render the input as a textbox, not a spinbutton

  **solidaria / createNumberField**: mirror upstream `useNumberField`, which wraps `useSpinButton` but deliberately overrides its output — `role: null` plus `aria-valuenow/min/max/text: null` — because a `spinbutton` cannot be focused with VoiceOver. The input is now a plain `textbox` inside the existing `role=group` wrapper, with `aria-roledescription="number field"`; the formatted value is announced through the input's own value. Previously we leaked the raw spinbutton semantics (`role="spinbutton"` + `aria-value*`), diverging from `@react-aria/numberfield` `useNumberField.ts`.

  **solidaria-components / NumberField** and **solid-spectrum / NumberField** inherit the corrected contract: their rendered input now exposes `role=textbox` (queryable as such) rather than `spinbutton`. Date/time-segment spinbuttons are unaffected.

- 92c0cc2: Overlay positioning: add the `getTargetRect` override

  Mirror `useOverlayPosition`'s `getTargetRect?: (target) => DOMRect | null`. The
  callback overrides the trigger's measured bounding rect so an overlay can be
  positioned relative to an arbitrary point — e.g. the mouse cursor for a context
  menu or a text selection — instead of the trigger element itself.

  `calculatePosition` gains a `targetRect` option threaded through
  `getElementOffset`/`getPosition` into the child-offset computation; when omitted
  or `null` it falls back to `target.getBoundingClientRect()` exactly as before.
  `createOverlayPosition` exposes `getTargetRect` on `AriaPositionProps` and
  forwards its result as `targetRect` (called against the live target node, and —
  matching upstream — left out of the position-update dependency tracking). The
  headless `Popover` component adds `getTargetRect` to its prop allowlist;
  `createPopover` and the S2 `Popover` inherit it through their prop-spread.

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

- cc47204: Reveal the focused option in `aria-activedescendant` collections on keyboard navigation (T-10 follow-up). Adds a shared `createScrollIntoViewOnFocus` hook (`solidaria`) — a faithful port of `@react-aria/selection`'s `useSelectableCollection` focused-key scroll effect, which upstream runs for _all_ selectable collections (it is **not** gated on virtual focus). On a keyboard-modality `focusedKey` change it `scrollIntoViewport`s the matching `[data-key]` element into the collection root, deferred one microtask so a virtualizer's force-include can commit the focused row first; pointer-driven changes and inactive (background) collections are skipped.

  Wired into the three collections that don't move real DOM focus: `ListBox` and `Menu` (pure `aria-activedescendant`) and the `ComboBox` listbox (explicit virtual focus). `Select` already reveals its focused option through real `focusSafely` focus (native browser scroll), so it is intentionally left unwired. Grid / gridlist remain deferred — they move roving real focus with no programmatic row focus / `aria-activedescendant` and don't port upstream's `useGridCell` focus-mode walker, so there's no focused-row reveal to attach a scroll to yet.

- ddd697d: Slider: add the `SliderFill` component (port of react-aria-components 1.18)

  React Aria 1.18 added `SliderFill`, a child of the slider that renders the
  filled portion of the track so consumers no longer hand-compute a positioned
  `<div>` from the slider's value. This ports it to our Slider family.

  `SliderFill` reads the slider state from context and positions itself
  absolutely: by default it spans from the slider's `minValue` (0%) to the current
  value, and an `offset` prop moves the fill's start (clamped to the slider range).
  It honours orientation — horizontal fills with `inset-inline-start`/`width`,
  vertical with `bottom`/`height` — and exposes `isHovered`, `isDisabled`,
  `orientation`, and `valuePercent` render-prop values plus the matching
  `data-hovered`/`data-disabled`/`data-orientation` attributes, mirroring upstream.

  Upstream's fill math is array-based (multi-thumb `SliderState`); our
  `SliderState` is single-value, so this implements the single-thumb branch using
  the same `(value - min) / (max - min)` percent formula the state itself uses.
  Exported as `SliderFill` / `Slider.Fill` with `SliderFillProps`,
  `SliderFillRenderProps`, and a `SliderFillContext` alias for export-surface
  parity with React Aria.

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

- 7fcc93e: Table: fix keyboard row selection (subtree recreation + double-toggle)

  Pressing Space on a focused Table row never updated the selection. Two stacked
  bugs:
  - The root children were invoked with live render values
    (`props.children(renderValues())`), and `renderValues()` reads the focus-ring
    signals, so every focus change re-ran the children insert and recreated the
    whole `thead`/`tbody` subtree. That detached the DOM-focused row, dropping
    browser focus to `<body>` before Space could reach the row handler. React
    re-invokes the render-prop children on each render and reconciles; Solid has
    no reconciliation, so the root children are now invoked once with an untracked
    snapshot of the render values, and kept out of the reactive `<table>`
    attribute spread.
  - With focus retained on the row, Space then toggled selection twice — once in
    the row handler and once in the grid handler — netting no change. Upstream
    `useSelectableCollection` has no Space/Enter case (selection is owned by the
    row via `useSelectableItem`), so the grid-level Space/Enter selection block is
    removed. Space/Enter fall through to type-ahead, which now carries the
    upstream `useTypeSelect` leading-Space guard so a bare Space no longer seeds
    the search buffer.

- 649371e: Move real DOM focus onto the focused cell during Table keyboard navigation.

  `createTable` previously chased the roving tabindex with a `queueMicrotask`
  callback that looked the target up by its transient `tabindex`, which raced the
  reactive tabindex memo and frequently left browser focus behind — so keyboard
  row selection (ArrowDown then Space) never updated the selection because focus
  had not landed on the focused row. It now commits the roving tabindex and then,
  from a post-commit effect, moves focus onto the focused key's element looked up
  by its stable `data-key` — mirroring React Aria's `useSelectableCollection`,
  which focuses by key rather than by transient tabindex. `Table` rows and cells
  now expose `data-key` so the effect (and the existing PageUp/PageDown paging)
  can target them.

- b0a822c: Table: stop `TableRow` recreating its cell subtree on render-prop churn, and let
  `Popover` accept `AriaLabelingProps`

  Both changes support hosting a modal editor inside a table cell (the styled
  `EditableCell` in `solid-spectrum`), but the `TableRow` fix is a general
  correctness improvement.

  `TableRow` previously bound every reactive value (including `children`) through a
  single reactive `tableRowProps()` call, so any signal flip — e.g. an editor
  popover toggling — disposed and recreated the whole `<tr>` subtree. It now builds
  the row's children **exactly once**, inside both `TableRowContext.Provider` and
  `ButtonContext.Provider`, and binds the `<tr>`'s attributes individually on a
  stable element. `buttonContextValue` is now a stable object whose `drag` / `chevron`
  slots are getters, so the provider value keeps a constant identity (no
  provider-driven recreation) while the slot props stay reactive. This fixes
  slotted `<Button slot="drag">` / `<Button slot="chevron">` losing their
  `ButtonContext` (they must be instantiated under the provider), which the
  recreation path had been breaking.

  `PopoverProps` now extends `AriaLabelingProps`, so a popover accepts `aria-label`
  (already forwarded at runtime via `filterDOMProps(rest, {global: true})`),
  mirroring React Aria's `Popover`.

- 736ad7d: Announce toast content in an assertive live region.

  `createToast` has always returned `contentProps` (`role="alert"` /
  `aria-live="assertive"` / `aria-atomic="true"`) for the toast message area, but
  the `Toast` component never applied them — the rendered toast carried only the
  `role="alertdialog"` container, which is not a live region, so a newly shown
  toast was not announced to screen readers. `DefaultToast` now wraps the message
  column in a `ToastContent` element (kept as a sibling of the close button, per
  React Aria guidance), and `Toast` applies the `contentProps` live-region
  attributes to it via the same effect that wires the title/description IDs onto
  pre-composed children. The toast's text is now announced when it appears.

- 6381499: Align Toast queue/viewer behavior, dismiss labeling, and Solid S2 button text-slot handling with upstream parity.
- cfc0432: Let styled ToastRegion callers own viewport placement so Solid Spectrum Toasts center from the full viewport instead of inheriting headless inline geometry.
- 727b16b: GridList/Tree sections: emit upstream rowgroup/row/rowheader ARIA

  `GridListSection` and `TreeSection` previously rendered a plain `<div>` and
  their headers a `role="heading"` element, so assistive technology saw no section
  grouping at all. React Aria instead wraps each section in a `role="rowgroup"`
  whose label comes from the header: the header renders `role="row"` containing a
  `role="rowheader"` whose `id` is wired back to the rowgroup's `aria-labelledby`.

  This ports that structure faithfully:
  - New `createGridListSection` hook in `@proyecto-viviana/solidaria` (mirroring
    upstream `useGridListSection`) returns the `rowProps`/`rowHeaderProps`/
    `rowGroupProps`, deriving the shared heading id via the also-new `createSlotId`
    (the SSR-safe analogue of upstream `useSlotId`, which only labels the rowgroup
    once the header is actually present in the DOM).
  - `GridListSection`/`TreeSection` now render `role="rowgroup"` and provide their
    header the row/rowheader props through context; `TreeSection`/`TreeHeader`
    reuse the GridList section primitives exactly as upstream does. The header
    children are evaluated only inside those providers so their context wiring
    survives Solid's owner-based `useContext` resolution.

  Section headers therefore expose `rowheader` semantics (not `heading`), and the
  section rowgroup is labelled by that rowheader — matching React Aria's
  `GridList` and `Tree` section markup.

- 430a55f: Virtualizer: add a horizontal `orientation` axis for GridList + ListBox

  React Aria's `ListLayout` takes an `orientation` option (default `vertical`) that
  offsets items along `x`/`width` when horizontal, and RAC's ListBox/GridList expose
  `data-orientation`. Ours was hardcoded vertical. This gives our virtualization an
  orientation axis so collections can window horizontally.

  **`VirtualizerLayouts`** — a new `Orientation` type and an `orientation` option on
  `DefaultVirtualizerLayoutOptions` (default `'vertical'`). `ListLayout.getLayoutInfo`
  now offsets along `x` with `width` = itemSize and `height` filling the viewport's
  cross axis when horizontal (mirroring upstream's `offsetProperty` / `heightProperty`
  switch); `getDropTargetFromPoint` measures the drop point along `point.x` instead of
  `point.y`. `getVisibleRange` is unchanged — it is axis-agnostic. `TableLayout`
  inherits and stays vertical.

  **`Virtualizer`** — tracks the scroll view's `scrollLeft` and feeds the horizontal
  scroll axis plus measured width into `getVisibleRange` and page navigation when the
  layout is horizontal, and exposes the resolved `orientation` on its context so
  consumers render their windowing spacers along the correct axis.

  **`GridList`** — gains an `orientation?` prop (default `'vertical'`, mirroring RAC),
  threading it into the render props, the drop-target delegate, and a `data-orientation`
  attribute on the root. **`GridList` + `ListBox`** — their virtualization spacers now
  reserve the windowed-out extent along `width` when the virtualizer is horizontal,
  rather than always `height`.

- 2fc94b6: Virtualizer: suppress content pointer events while scrolling

  Ports upstream `@react-aria/virtualizer` ScrollView's `isScrolling`
  optimization: while the collection is actively scrolling, the content gets
  `pointer-events: none` so pointer events don't land on rows recycling under a
  stationary cursor (which causes hover-state flicker and needless hit-testing).
  The flag is set on the first scroll and cleared 300ms after the last one,
  matching upstream's debounce — folded into a single clear/reset since our scroll
  handler is already `requestAnimationFrame`-throttled.

  To carry the toggle, the `Virtualizer` now renders the inner content wrapper that
  upstream's ScrollView always has (`<scroll-view><content>…`), where the previous
  single div conflated the two. The outer div remains the scroll container we
  measure and read offsets from; the new `data-virtualizer-content` wrapper is a
  layout-transparent passthrough that only carries `pointer-events`, so the scroll
  container keeps receiving wheel/touch events throughout the gesture.

  Upstream's other `isScrolling` use — deferring DOM reordering of reused views
  until scrolling stops — does not apply: our Virtualizer renders the visible slice
  in order on every pass rather than recycling absolutely-positioned views, so
  there is no out-of-order DOM to defer. The relayout-driven scroll write-back is
  likewise N/A; in our model the browser owns the scroll position and we read it
  through a signal.

- 7fcb1d6: Virtualizer: virtualize collections that scroll with the page (port of react-aria-components 1.18 window scrolling)

  React Aria's `ScrollView` does not assume a virtualized collection has its own
  scroll container. It computes the visible rect as the intersection of the scroll
  view's content size with the browser window viewport, tracking how far the scroll
  view has been pushed above the viewport by page (or ancestor) scrolling. React
  Aria Components enables this by default — `CollectionRoot` hard-codes
  `allowsWindowScrolling: true` — so a `ListBox`, `Table`, `Tree`, etc. rendered at
  its natural height inside a normally scrolling page still only mounts the rows
  that are actually on screen.

  Previously our `Virtualizer` measured only its own element: the visible window
  was the element's `clientHeight` and the offset was the element's `scrollTop`. A
  collection that grew to its full height and scrolled with the page therefore
  rendered every row, defeating virtualization.

  The `Virtualizer` now mirrors upstream:
  - The effective viewport height is the scroll view's height intersected with the
    window viewport (`max(0, min(elementHeight - viewportOffset, window.innerHeight))`).
  - The visible-range offset is the element's own scroll position plus
    `viewportOffset` — how far the scroll view's top edge sits above the window
    viewport, derived from `getBoundingClientRect()`.
  - A single document-level capturing `scroll` listener updates the local scroll
    position when the scroll view itself scrolls, and the window offset when an
    ancestor or the page scrolls, matching `ScrollView`'s capturing listener.

  A new `allowsWindowScrolling` prop (default `true`) opts out: set it to `false`
  to restrict virtualization to the element's own scroll container, which is the
  previous behavior. An explicit `viewportSize` layout option still takes
  precedence over the measured window viewport.

  For a fixed-height collection that sits entirely within the viewport this is
  behavior-preserving — the `window ∩ element` math reduces to the element's own
  scroll — so existing collections are unaffected unless they actually scroll with
  the page.

  Two parts of upstream `ScrollView` are intentionally left as follow-ups and do
  not affect window-scroll correctness: the `isScrolling` state (which toggles
  `pointer-events: none` on the content while scrolling) and the imperative
  `scrollToItem`/`scrollToRect` API.

- Updated dependencies 597a1b7:
- Updated dependencies bc4b395:
- Updated dependencies 1e480e9:
- Updated dependencies bcf6826:
- Updated dependencies 1fb52f6:
- Updated dependencies c0a8ec9:
- Updated dependencies 6e1d7bb:
- Updated dependencies 83c9a6f:
- Updated dependencies d99d486:
- Updated dependencies 1a55ba7:
- Updated dependencies 71e1220:
- Updated dependencies a4cbc85:
- Updated dependencies 47e25bd:
- Updated dependencies b4fa490:
- Updated dependencies 535be08:
- Updated dependencies 58a62d5:
- Updated dependencies a6aa0af:
- Updated dependencies d03dac4:
- Updated dependencies b0da42f:
- Updated dependencies b4fa490:
- Updated dependencies 64c454e:
- Updated dependencies d9e36f3:
- Updated dependencies ad5d929:
- Updated dependencies 18ec24f:
- Updated dependencies cd0219b:
- Updated dependencies 9645db5:
- Updated dependencies 5a741e0:
- Updated dependencies 7b221a4:
- Updated dependencies 220ba68:
- Updated dependencies 3b20e14:
- Updated dependencies 5db5585:
- Updated dependencies 7e7fe8c:
- Updated dependencies 92c0cc2:
- Updated dependencies 4d7f2c1:
- Updated dependencies 7c1708c:
- Updated dependencies f7df649:
- Updated dependencies 1896fe4:
- Updated dependencies cc47204:
- Updated dependencies 6b50770:
- Updated dependencies ebb1a3c:
- Updated dependencies 5e6c0b8:
- Updated dependencies 30512d3:
- Updated dependencies b113196:
- Updated dependencies 608a401:
- Updated dependencies c2b8c5e:
- Updated dependencies f658a4c:
- Updated dependencies 7fcc93e:
- Updated dependencies 649371e:
- Updated dependencies 389f600:
- Updated dependencies e63d870:
- Updated dependencies 8cc7ecc:
- Updated dependencies 727b16b:
- Updated dependencies 2befbed:
- Updated dependencies dfd4d37:
- Updated dependencies 6d2dbfa:
  - @proyecto-viviana/solidaria@0.4.0
  - @proyecto-viviana/solid-stately@0.4.0

## 0.3.3

### Patch Changes

- 3a740bb: Fix TextField label hydration during SSR and republish the Viviana UI package chain against the fixed components.

## 0.3.2

### Patch Changes

- [`7502ee7`](https://github.com/proyecto-viviana/ui/commit/7502ee70a735d1831a2c62b581fb0ba690146327) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Keep Button and ActionButton dynamic aria trigger props reactive, and export BellIcon from the root Spectrum/Viviana surface.

## 0.3.1

### Patch Changes

- Fix SSR hydration mismatch in overlay components (Picker, ComboBox, Menu, DatePicker, Dialog).

  The overlay primitives (`Popover`, `Modal`, `Toast`) gate their portalled content behind `useIsHydrated()` so the server emits nothing for a closed overlay. But they passed `children: props.children` to `useRenderProps`, which read the children getter eagerly at construction — instantiating the gated content's DOM template during the synchronous hydration walk that the server never emitted. SolidJS then threw `Hydration Mismatch. Unable to find DOM nodes for hydration key: …` at `_$getNextElement`.

  Fixed structurally by reading children lazily (`get children()`) so the read is deferred until `renderChildren()` runs inside the gated `<Show>`/`<Portal>`. The value is identical; only the eager template instantiation — the bug — is removed.

  Also, `useIsHydrated()` now flips on `onMount` (the effect phase, after the synchronous hydration pass) instead of `requestAnimationFrame`. This keeps the gate matching the server on the first render, mounts the content as a clean client-side update (no `getNextElement` walk), and — unlike rAF — fires synchronously under `render()`, so the gated content also renders in unit tests / pure CSR.

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

### Patch Changes

- Fix an SSR hydration mismatch in the overlay primitives. A closed overlay's
  `if (isServer)` early-return (`return null` in Popover/Toast, `return <>{children}</>`
  in Modal) made the server render a different tree than the client's `<Show>`/`<Portal>`,
  desyncing hydration. The portal is now gated on `useIsHydrated()` so the server and the
  first client render agree. Fixes Popover, Modal, and Toast — and the components built on
  them (Picker, ComboBox, Menu/ActionMenu, Tooltip/TooltipTrigger, Dialog, DatePicker/
  DateRangePicker/Calendar, ContextualHelp).
- Updated dependencies [[`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a)]:
  - @proyecto-viviana/solid-stately@0.3.0
  - @proyecto-viviana/solidaria@0.3.0

## 0.2.9

### Patch Changes

- [#34](https://github.com/proyecto-viviana/proyecto-viviana/pull/34) [`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611)]:
  - @proyecto-viviana/solid-stately@0.2.7
  - @proyecto-viviana/solidaria@0.2.8

## 0.2.8

### Patch Changes

- [#29](https://github.com/proyecto-viviana/proyecto-viviana/pull/29) [`e19344c`](https://github.com/proyecto-viviana/proyecto-viviana/commit/e19344ca740ae3db4d6a990caa465b5093704288) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.

- [#32](https://github.com/proyecto-viviana/proyecto-viviana/pull/32) [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76)]:
  - @proyecto-viviana/solid-stately@0.2.6
  - @proyecto-viviana/solidaria@0.2.7

## 0.2.7

### Patch Changes

- Rebuild dist with all missing type declarations (ActionBar, Alert, ToggleButton, DateRangePicker, Virtualizer, DragAndDrop, and more)
- Updated dependencies
- Updated dependencies
  - @proyecto-viviana/solidaria@0.2.6
  - @proyecto-viviana/solid-stately@0.2.5

## 0.2.6

### Patch Changes

- e19344c: Normalize internal dependency ranges so automated Changesets releases can keep dependent package versions aligned.
