# @proyecto-viviana/solidaria

## 0.4.0

### Minor Changes

- bcf6826: Localize calendar cell and grid accessible labels

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

- 83c9a6f: Make `CheckboxField` help text faithful to upstream react-aria-components. The
  `description` / `errorMessage` props are dropped; `CheckboxField` now provides
  `TextContext` description/errorMessage slots so a child `<Text slot="description">`
  or `<FieldError>` resolves the id that the checkbox's `aria-describedby` references.
  `createCheckbox` / `createCheckboxGroupItem` now expose `descriptionProps` /
  `errorMessageProps` and bake the slot ids into the input's `aria-describedby`
  (grouped items keep their own describedby and append the group's shared ids,
  mirroring `useCheckboxGroupItem`). The deprecated `Checkbox` monolith keeps its
  prop-based help text.
- 4d7f2c1: Port the selectable-collection keyboard spine from React Aria (spine keystone 2)

  Builds the keyboard/focus/selection engine on top of keystone 1's
  `SelectionManager`, faithful to `@react-aria/selection`. This is the layer the
  collection components (menu, listbox, combobox, grid) will migrate onto, and it
  unblocks the autocomplete bridge.
  - **`ListKeyboardDelegate`** — port of upstream's delegate: first/last/next/
    previous resolution, disabled skipping (honoring `disabledBehavior`),
    typeahead search via a collator, and orientation/RTL-aware horizontal
    navigation. Horizontal `getKeyLeftOf` / `getKeyRightOf` are present only for
    horizontal (or non-stack) layouts, exactly as upstream deletes them for a
    vertical stack so Left/Right no-op. Row navigation degrades to next/previous
    when item elements can't be measured (no DOM).
  - **`DOMLayoutDelegate`** (+ `LayoutDelegate` / `Rect` / `Size`) — reads item
    geometry from the DOM for page up/down and 2D navigation; virtualized
    collections pass their own `layoutDelegate`.
  - **`createSelectableCollection`** — port of `useSelectableCollection`: arrow /
    Home / End / PageUp / PageDown navigation, Ctrl+A select-all, Escape to clear,
    Tab handling, typeahead, select-on-focus, link behavior, a roving `tabIndex`,
    autofocus, and scroll-into-view. React's per-render effects become
    `createEffect`s reading the manager's reactive getters; bubbling
    `onFocus`/`onBlur` map to native `onFocusIn`/`onFocusOut`.
  - **`createSelectableList`** — port of `useSelectableList`: derives a default
    `ListKeyboardDelegate` from the selection manager (recreated in a `createMemo`
    as collection / disabled keys / behavior change) and forwards the reactive
    collection props.
  - A stable `data-collection` id is shared between a collection container and its
    items so `getItemElement` can scope its lookup. Keyed by the (stable)
    `SelectionManager` rather than upstream's collection object, since a Solid
    collection is rebuilt with a new identity when its items change. Unregistered
    items render no attribute, so unmigrated paths are unchanged.

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

### Patch Changes

- 597a1b7: `createAutocomplete`: defer first-item focus when the collection isn't mounted, and dispatch ArrowLeft/ArrowRight to the focused item before clearing

  Two behaviors from `@react-aria/autocomplete` (the rc.8 build paired with the
  pinned RAC 1.19.0) that the port was missing:
  - **Deferred first-item focus.** When forward typing requests first-item focus
    but the collection element isn't mounted yet, the hook can't dispatch a focus
    event into a not-yet-rendered collection. It now mirrors upstream's
    `autoFocusOnMount` state: `focusFirstItem` sets a deferred flag, and
    `collectionProps.autoFocus` reads `"first"` while the flag is set (`false`
    otherwise) so the collection focuses its first item on mount. Editing/deleting
    resets the flag via `clearVirtualFocus`.
  - **Arrow inline-navigation.** ArrowLeft/ArrowRight with no virtual focus just
    moves the text cursor (stop propagation, no clear). With virtual focus the key
    is dispatched to the focused item first, and the active descendant is cleared
    only afterward — and only if the item didn't cancel the event (so an item that
    consumes the arrow, e.g. an expandable row collapsing, retains virtual focus).

  These are hook-level: the emitted `collectionProps.autoFocus` and the
  focus/clear events are validated directly. Honoring `collectionProps.autoFocus`
  and listening for the `autocomplete:focus`/`autocomplete:clearfocus` events in a
  collection consumer (ListBox/Menu) remains a separate, currently-unwired bridge.

- bc4b395: Autocomplete: treat IME composition input as forward typing

  `createAutocomplete` now reads the input type from a `beforeinput` listener
  (set before the input's `onChange` runs) and treats `insertCompositionText`
  and `insertFromComposition` like `insertText`, so the first item still gains
  virtual focus while composing CJK/IME text. Previously composition input fell
  into the clear branch, dropping virtual focus mid-composition. Mirrors
  `@react-aria/autocomplete` `useAutocomplete`.

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

- 6e1d7bb: CalendarYearPicker: match upstream `visibleYears` defaulting

  `createCalendarYearPicker` now defaults the window size with
  `props.visibleYears || 20` instead of `?? 20`, mirroring `@react-aria/calendar`
  `useCalendarYearPicker`. The two only differ for a falsy `visibleYears` (`0` or
  `NaN`), which upstream coerces to the default 20-year window; previously a `0`
  produced an effectively empty window. The rest of the year-window math
  (`Math.ceil(visibleYears / 2) - 1`, the `visibleYears - 1` min/max clamps, and
  the inclusive `<= maxDate` loop, so the window includes the `maxValue` /
  `minValue` year) was already faithful, so this is the last remaining divergence
  in the hook.

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

- 1a55ba7: Tree, GridList, ListBox, Menu: fire `onAction` for a `disabledBehavior: "selection"` item on activation

  Activation (Enter, plus Space for Menu and ListBox) was gated on the raw disabled
  check, so a `"selection"`-disabled item — which stays focusable under that
  behavior — never fired its `onAction`. The activation branch now uses the
  navigation-disabled gate (`disabledBehavior === "all"`), mirroring React Aria's
  `useSelectableItem` `allowsActions`, which depends on `SelectionManager.isDisabled`
  (itself gated on `"all"`). Selection stays blocked regardless of behavior: the
  selection mutators (`select` / `toggleSelection` / `replaceSelection`) self-guard
  on the raw disabled check, matching `SelectionManager.canSelectItem`. Under the
  default `"all"` behavior the item is unreachable in keyboard navigation, so its
  behavior is unchanged.

- 71e1220: DragTypes: match `*/*` and `type/*` wildcards and accept arrays

  `DragTypes.has` now mirrors `@react-aria/dnd`: it accepts a `DragType` or an array
  of them, matches the `*/*` wildcard against any present type, and matches a
  `type/*` wildcard against the type prefix (e.g. `image/*` accepts `image/png`).
  Previously only an exact MIME string matched, so `acceptedDragTypes: ['image/*']`
  never matched a dragged `image/png` over the DataTransfer-backed path. The
  directory check is also tightened to the directory drag type specifically rather
  than any symbol. The public `DragTypes` interface gains the upstream `DragType`
  alias and the `has(type: DragType | DragType[])` signature.

- a4cbc85: `FocusScope`: make focus containment descendant-scope aware

  A modal `FocusScope` (`contain`) used to pull focus back whenever it landed on
  an element outside its DOM subtree — including a nested overlay (e.g. a menu
  opened from inside a modal popover) rendered in a portal. That yank tore the
  nested overlay down before it could render, so a menu only opened cleanly inside
  a _non-modal_ outer popover.

  Mirror `@react-aria/focus`'s `focusScopeTree`: each `FocusScope` now registers
  itself in a parent/child tree keyed by its scope-elements accessor, with the
  parent resolved through context (which Solid propagates across portals). The
  containment `focusin` handler consults `isElementInChildScope`, so focus moving
  into a portaled descendant scope is treated as "inside" and left in place
  instead of being restored. Containment of true escapes (focus leaving to an
  unrelated element) is unchanged. The tree's `activeScope`/`shouldContainFocus`
  arbitration between multiple nested _contained_ scopes and tree-aware focus
  restoration remain unported (not needed for this case).

- 47e25bd: Port the full `isFocusable`/`isTabbable`/`isElementVisible` focusable utilities

  `isFocusable` was a simplified tagName/tabindex/contenteditable check with no
  visibility filtering and no `inert` handling, and there was no `isElementVisible`
  or `isTabbable` at all. It now mirrors `@react-aria/utils` (v3.34.1, the version
  paired with the pinned RAC 1.19.0): a candidate must match the focusable selector
  AND not be inside an `inert` subtree AND be visible (`isElementVisible` —
  `checkVisibility` when supported, otherwise a computed-style/attribute walk up the
  ancestor chain, honoring `hidden`, `data-react-aria-prevent-focus`, and
  `<details>`/`<summary>`). `isFocusable` accepts `{skipVisibilityCheck}` to bypass
  that last step (used by the press-path `preventFocus` ancestor walk). `isTabbable`
  and `isElementVisible` are now exported, and the duplicated local `isTabbable`
  copies in `FocusScope` and `createToolbar` collapse onto the shared one. Owner-window
  lookups go through `getOwnerWindow`, which falls back to the global window, so the
  helpers stay robust on detached documents (`defaultView === null`).

  `isStyleVisible` and `isInert` additionally accept the global realm's
  `HTMLElement`/`SVGElement` constructors. Solid clones templates with the document
  that is global at creation time, so a node portaled into another document (e.g. an
  iframe) keeps its original realm's prototype even though its `ownerDocument` — and
  therefore `getOwnerWindow` — resolves to the other document; upstream React creates
  portal nodes with the container's `ownerDocument`, so its single owner-window
  `instanceof` check would reject real cross-document Solid elements. In the common
  same-realm case this is identical to upstream.

- b4fa490: createFormValidation: guard the native-mode effect on `setCustomValidity`

  The `native` validation effect now checks `'setCustomValidity' in input` before
  calling it, matching `@react-aria/form` `useFormValidation`. A ref pointed at
  something that isn't a true form element (e.g. a custom element) no longer
  throws when the effect runs; the effect simply skips it, as upstream does.

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

- b0da42f: createInteractionModality: patch `HTMLElement.prototype.focus` via `defineProperty`

  `setupGlobalFocusEvents` and its teardown now install the focus-tracking patch
  with `Reflect.defineProperty({configurable, writable, value})` instead of plain
  assignment, mirroring `@react-aria/interactions` `useFocusVisible`. When `focus`
  has been replaced with a getter-only accessor — e.g. by a test library's
  `setup()` — plain assignment throws, so our previous `try`/`catch` swallowed the
  error and silently skipped the patch (`canOverride = false`), degrading modality
  tracking for programmatic `focus()` calls. `defineProperty` installs the wrapper
  without throwing and returns `false` rather than throwing in the pathological
  non-configurable case, so the obsolete `canOverride` bookkeeping is removed.

- b4fa490: createKeyboard: forward `continuePropagation` to a parent-wrapped event

  When `createEventHandler` wraps an event that a parent `createEventHandler`
  already wrapped (nested keyboard handlers), continuing propagation now also
  calls the parent's `continuePropagation`, mirroring `@react-aria/interactions`
  `createEventHandler`. Previously the inner wrapper overwrote the parent's
  `continuePropagation` (our port mutates the event via `Object.assign` rather
  than upstream's object spread), so continuing in the inner handler stopped at
  the inner wrapper and never let the outer handler continue. We now capture the
  prior `continuePropagation` before overwriting and invoke it from the new one.

- 64c454e: ListBox: only skip disabled options during navigation under `disabledBehavior: "all"`

  `createListBox`'s `findNextEnabledKey` previously skipped every disabled option
  during arrow/Home/End navigation regardless of `disabledBehavior`, so a
  `"selection"`-disabled option could not be focused. It now gates the skip on the
  resolved `disabledBehavior` (default `"all"`), mirroring React Aria's
  `ListKeyboardDelegate.isDisabled`: under `"selection"` disabled options stay
  focusable, and their selection remains blocked by the selection state
  (`SelectionManager.canSelectItem` semantics).

- d9e36f3: createListBox: only swallow Escape when it clears a selection

  Escape handling now mirrors React Aria's `useSelectableCollection`: it calls
  `preventDefault`/`stopPropagation` and clears the selection only when there is
  actually a selection to clear and empty selection is allowed. Previously
  `createListBox` called `preventDefault` on every Escape, so a ListBox rendered
  inside a popover, combobox, or dialog swallowed Escape even when nothing was
  selected — preventing the enclosing overlay from closing. It also now stops
  propagation when it does clear, so an Escape that clears the selection no longer
  also bubbles up to close the overlay.

- ad5d929: `createListBox`: add the `escapeKeyBehavior` prop

  Mirror `useSelectableCollection`'s `escapeKeyBehavior: 'clearSelection' | 'none'`
  (default `'clearSelection'`). The Escape handler previously hard-coded the
  clear-selection path; it now only clears (and swallows the event) when
  `escapeKeyBehavior` is `'clearSelection'`. Setting `'none'` opts out so Escape
  neither clears the selection nor stops propagation — for when Escape is handled
  externally or shouldn't clear selection contextually. The headless `ListBox`
  component already forwards the prop to the hook via its props rest-spread.

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

- cd0219b: createListBox: only consume navigation keys that move focus

  Arrow-key handling now mirrors React Aria's `useSelectableCollection`: it calls
  `preventDefault` only once a target key is found, so a ListBox at the
  first/last item without wrapping (or an empty one) leaves the arrow alone to
  bubble — e.g. to scroll an enclosing region — instead of swallowing it.
  Previously every Arrow/Home/End press called `preventDefault` unconditionally.
  Home and End now also leave the event untouched when Shift is held with nothing
  focused, matching upstream's no-anchor early return.

- 9645db5: Menu: only skip disabled items during navigation under `disabledBehavior: "all"`

  `createMenu`'s keyboard navigation (arrow keys, Home/End, and PageUp/PageDown)
  skipped every disabled item regardless of `disabledBehavior`, so a
  `"selection"`-disabled item could never be focused. The navigation skip is now
  gated on the resolved `disabledBehavior` (default `"all"`), mirroring React
  Aria's `ListKeyboardDelegate.isDisabled`. Under `"selection"` disabled items
  stay focusable. Activation (Enter/Space) keeps the raw disabled check, so a
  disabled item is never activated regardless of `disabledBehavior`, matching
  `SelectionManager.canSelectItem`.

- 5a741e0: Move real DOM focus onto the focused item during Menu keyboard navigation.

  Arrow/Home/End keys flipped each item's `tabIndex` (the declarative half of
  roving tabindex) but never called `element.focus()`, so the keyboard cursor and
  the assistive-technology cursor never moved off the menu container — making the
  Menu unusable with a screen reader. `createMenuItem` now imperatively focuses
  the item's element when it becomes the collection's focused key (and the menu is
  focused), mirroring React Aria's `useSelectableItem`. `Menu` wires the item ref
  through to the behavior, including the inner anchor for link items.

- 7b221a4: createMenu: only consume navigation keys that move focus

  ArrowDown/ArrowUp now call `preventDefault` only once a target item is found,
  so a Menu at the first/last item without wrapping leaves the arrow alone to
  bubble instead of swallowing it — matching React Aria's
  `useSelectableCollection` and the same fix just applied to `createListBox`.
  Home and End also leave the event untouched when Shift is held with nothing
  focused. (Menu's geometry-based PageDown/PageUp are unchanged for now.)

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

- 3b20e14: `createMenu`: gate PageUp/PageDown on a focused key

  Mirror `useSelectableCollection`, which only enters its Page-key block — and
  only `preventDefault`s — when a key is focused. The menu's PageUp/PageDown
  handlers previously called `preventDefault()` unconditionally, so with nothing
  focused they swallowed the key while doing nothing, instead of letting it bubble
  to scroll an enclosing region (the same gap its arrow keys were already fixed
  for). They now read the focused key first and bail before `preventDefault` when
  none is set; the existing focused-key paging is unchanged (a non-empty
  collection always yields a page target, so a focused key still moves focus and
  swallows the event).

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

- cc47204: Reveal the focused option in `aria-activedescendant` collections on keyboard navigation (T-10 follow-up). Adds a shared `createScrollIntoViewOnFocus` hook (`solidaria`) — a faithful port of `@react-aria/selection`'s `useSelectableCollection` focused-key scroll effect, which upstream runs for _all_ selectable collections (it is **not** gated on virtual focus). On a keyboard-modality `focusedKey` change it `scrollIntoViewport`s the matching `[data-key]` element into the collection root, deferred one microtask so a virtualizer's force-include can commit the focused row first; pointer-driven changes and inactive (background) collections are skipped.

  Wired into the three collections that don't move real DOM focus: `ListBox` and `Menu` (pure `aria-activedescendant`) and the `ComboBox` listbox (explicit virtual focus). `Select` already reveals its focused option through real `focusSafely` focus (native browser scroll), so it is intentionally left unwired. Grid / gridlist remain deferred — they move roving real focus with no programmatic row focus / `aria-activedescendant` and don't port upstream's `useGridCell` focus-mode walker, so there's no focused-row reveal to attach a scroll to yet.

- 6b50770: Port the `@react-aria/utils` scroll-into-view family (T-10). Adds `scrollIntoView(scrollView, element, opts)` and `scrollIntoViewport(target, opts)` — a faithful port including the 1.16 `scrollMargin` + inline/block alignment refinements (PR [#9146](https://github.com/proyecto-viviana/ui/issues/9146)) and the scrollbar-width + RTL handling (PR [#9634](https://github.com/proyecto-viviana/ui/issues/9634)) — plus a `getScrollParents` helper. `scrollIntoViewport` is wired into the three hooks that move real DOM focus, so keyboard navigation reveals an off-screen focused item: the date segment (`createDateSegment`), the calendar cell (`createCalendarCell`), and the table's selectable-collection focus effect (`createTable`).

  Follow-ups (tracked in the upstream-release audit): the `aria-activedescendant` collections (ListBox / Menu / Select) and the in-cell walker navigation (grid / gridlist) are not wired yet — the former manage their own virtualizer scroll and the latter don't port upstream's `useGridCell` focus-mode walker, so there is no equivalent attachment point.

- ebb1a3c: Selection: add `createSelectableItem`, the shared press-path item hook

  Adds `createSelectableItem` (plus `ITEM_ACTION_EVENT` and its option/return
  types) — a faithful Solid port of React Aria's `useSelectableItem`. It produces
  `itemProps` for a selectable row/option and owns the full activation contract:
  the action model (`allowsSelection` / `hasAction` derived from
  `hasPrimaryAction` + `hasSecondaryAction`), select-on-press-down for rows vs.
  select-on-press-up for menus, the keyboard Space-selects / Enter-acts split,
  double-click secondary actions under `replace`, touch toggle, and touch
  long-press → `setSelectionBehavior('toggle')`. Selection routes through the
  Phase 0 aria-layer `selectItem`, so modifier resolution stays platform-aware.

  To carry the keyboard distinction the contract needs, `PressEvent` now exposes
  the originating `key` (present only on keyboard interactions, `undefined` for
  pointer events) — matching upstream's `PressEvent.key`, used here to tell Space
  (`isSelectionKey`) from Enter (`isActionKey`).

  This is the de-risked foundation for migrating the grid/tree/table item hooks;
  no existing component consumes it yet, so there is no user-visible change.

  Local adaptations from upstream, since our `ListState` is thinner than
  `SelectionManager`: `canSelectItem` is computed in the hook from
  `selectionMode`/`isDisabled` rather than read off the manager; the link model is
  prop-threaded (`isLink`/`href`/`routerOptions`/`linkBehavior`) instead of read
  from `manager.isLink`/`getItemProps`; there is no virtual-focus move helper or
  `data-collection` id; and `onDragStart` bubbles (no capture phase). The
  uncontrolled-`replace` `selectionBehavior` default does not exist in our state,
  so a consumer that wants long-press toggle must leave `selectionBehavior`
  uncontrolled.

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

- f658a4c: Table: move browser focus during keyboard navigation when focus is on a row

  `createTable`'s roving-tabindex → DOM-focus bridge only moved browser focus
  while the grid's logical `isFocused` signal was set. That signal is wired to the
  grid element's own non-bubbling `focus`/`blur` handlers, so it never became true
  when focus landed directly on a row (a pointer click, or programmatic row
  focus) — unlike upstream React Aria, whose focusin-based `onFocus` fires for
  descendant focus too. As a result, ArrowDown/End/PageDown updated the focused
  _key_ (and the roving tabindex) without ever moving the browser's focus to the
  target row.

  The bridge now gates on the physical position of focus
  (`el.contains(document.activeElement)`) instead of the logical `isFocused`
  signal. That `contains()` check already prevented the bridge from pulling focus
  back from elsewhere on the page, so the behavior is unchanged when focus is
  outside the table, and keyboard navigation now correctly follows the focused row
  whether focus entered via the grid or directly onto a row.

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

- 389f600: Make the toast container keyboard-focusable (tabIndex: 0).

  `createToast` now includes `tabIndex: 0` in `toastProps`, matching
  `@react-aria/toast` 3.48.0's `useToast` output. The `role="alertdialog"`
  container must be focusable so keyboard users and F6 landmark navigation can
  move focus into a toast to interact with its close button and read its content.

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

- 2befbed: createTypeSelect: match search text with a locale-aware collator

  Type-to-select now compares the leading characters of each item against the
  search string with an `Intl.Collator` (`usage: 'search'`, `sensitivity: 'base'`),
  mirroring React Aria's `ListKeyboardDelegate.getKeyForSearch`. This makes
  matching case- and diacritic-insensitive in a locale-aware way — for example,
  typing an unaccented `e` now matches an item labelled "Éclair". Previously the
  search used `textValue.toLowerCase().startsWith(...)`, which only handled ASCII
  case folding and missed accented characters.

- dfd4d37: createTypeSelect: search starts at the focused key and allows Alt

  Type-to-select now mirrors React Aria's `useTypeSelect` /
  `ListKeyboardDelegate.getKeyForSearch`. The search begins _at_ the currently
  focused item (inclusive) and scans to the end with no internal wrap; when
  nothing at or after the focus matches, it retries from the top. Previously the
  search started at the item _after_ the focus and wrapped internally, so typing a
  prefix the focused item already matched would skip past it to a later match
  (e.g. typing "F" while "Foo" was focused jumped to a subsequent "Foo Bar").

  The keydown guard no longer blocks `altKey`, matching upstream — AltGr produces
  printable characters on many keyboard layouts, so those keystrokes now reach the
  search. `ctrlKey` and `metaKey` combinations remain ignored.

- 6d2dbfa: Type-to-select: mirror upstream `useTypeSelect` keydown semantics

  `createTypeSelect` now follows `@react-aria/selection`'s pinned (1.19) keydown
  behavior more faithfully:
  - Alt combinations are ignored alongside Ctrl/Meta (upstream bails on
    `altKey`), so AltGr-only layouts no longer drive type-select.
  - A matching character now calls `preventDefault()`/`stopPropagation()`, so the
    keystroke doesn't also reach the collection's own keydown handlers.
  - When a keystroke fails to match anything, the search buffer is reset and the
    debounce timer cancelled immediately, so the next keystroke starts a fresh
    search instead of extending a stale buffer.
  - The pending debounce timer is cleared on unmount.

  The capture-phase Spacebar handler and the bubble-phase character handler are
  now split to match upstream's two-handler shape. In Solid a capture listener
  delivered through a `{...props}` spread is inert, so the live bubble handler
  also covers a mid-search Spacebar (its bail only rejects a _leading_ Space).

- Updated dependencies 1e480e9:
- Updated dependencies 1fb52f6:
- Updated dependencies c0a8ec9:
- Updated dependencies d99d486:
- Updated dependencies 71e1220:
- Updated dependencies 535be08:
- Updated dependencies a6aa0af:
- Updated dependencies 7c1708c:
- Updated dependencies 1896fe4:
- Updated dependencies 5e6c0b8:
- Updated dependencies 30512d3:
- Updated dependencies c2b8c5e:
- Updated dependencies e63d870:
- Updated dependencies 8cc7ecc:
  - @proyecto-viviana/solid-stately@0.4.0

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

- Updated dependencies [[`d219335`](https://github.com/proyecto-viviana/ui/commit/d21933524091ef5072a48dcc00ce5da9a7f5832a)]:
  - @proyecto-viviana/solid-stately@0.3.0

## 0.2.8

### Patch Changes

- [#34](https://github.com/proyecto-viviana/proyecto-viviana/pull/34) [`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`5b32b35`](https://github.com/proyecto-viviana/proyecto-viviana/commit/5b32b35d1ae525f81a959c4dcb0fde811c1fd611)]:
  - @proyecto-viviana/solid-stately@0.2.7

## 0.2.7

### Patch Changes

- [#32](https://github.com/proyecto-viviana/proyecto-viviana/pull/32) [`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76) Thanks [@EmoPorEmilio](https://github.com/EmoPorEmilio)! - Align package metadata and workspace tooling with the Bun-first npm release flow.

- Updated dependencies [[`99654ec`](https://github.com/proyecto-viviana/proyecto-viviana/commit/99654ec7b27c30729f75d6b43747d5bf42acbb76)]:
  - @proyecto-viviana/solid-stately@0.2.6

## 0.2.6

### Patch Changes

- Fix ImportMetaWithEnv type to include DEV/PROD boolean properties for Vite environment detection
- Updated dependencies
  - @proyecto-viviana/solid-stately@0.2.5
