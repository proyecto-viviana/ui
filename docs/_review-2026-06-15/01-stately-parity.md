# Stately Parity Audit — `packages/solid-stately/src/**`

Scope: the state layer vs `react-spectrum/packages/@react-stately/<domain>/src/`.
Deep dives: selection, collections, list, combobox, calendar, menu (+ reactivity).
Pinned upstream ≈ @react-stately ~3.9, except combobox (vendored is a newer
multi-select build — noted inline). Every claim cites our path:line and the
upstream path:line checked.

Lane note: an in-flight menu-parity effort has modified `Menu.tsx`/`ActionMenu.tsx`
and an open changeset. Menu findings below are flagged where they overlap that lane.

---

### [Critical] Selection logic is a from-scratch rewrite, not a port — `extendSelection`/anchor model diverges

- Evidence: `packages/solid-stately/src/collections/createSelectionState.ts:241-269` reimplements range selection with a single `anchorKey` signal (`:101`) and a flat `collection.getKeys()` slice. Upstream keeps **two** markers (`anchorKey`+`currentKey`) on the `Selection` set itself (`react-spectrum/packages/@react-stately/selection/src/Selection.ts:19-33`) and `SelectionManager.extendSelection` deletes the old anchor→current range then re-adds anchor→toKey using DOM order (`.../SelectionManager.ts:213-249`). The Solid `Selection` type is a plain `Set` and drops `anchorKey`/`currentKey` entirely (`collections/types.ts:18`).
- Why: Rule #2 (silent reinvention of a state machine) + Rule #1 (shift-select-then-shrink, the canonical drag-back case, behaves differently and is untested). Upstream's anchor stays put while `currentKey` moves; Solid's `anchorKey` is overwritten by every `toggleSelection` (`:205`), so a shift-click after a normal click anchors from the wrong cell.
- Fix: Port `Selection` (Set subclass w/ anchor+current) and lift selection logic into a `SelectionManager` equivalent; do not store the anchor in a sibling signal.

### [Critical] Submenu state is entirely missing (`expandedKeysStack`, `openSubmenu`, `closeSubmenu`, `useSubmenuTriggerState`)

- Evidence: `packages/solid-stately/src/collections/createMenuState.ts:112` is `export { createOverlayTriggerState as createMenuTriggerState }` — a bare alias. Upstream `useMenuTriggerState` returns `focusStrategy`, `expandedKeysStack`, `openSubmenu`, `closeSubmenu`, and a `close()` that clears all submenus (`react-spectrum/packages/@react-stately/menu/src/useMenuTriggerState.ts:50-99`); `useSubmenuTriggerState` (`.../useSubmenuTriggerState.ts`) has no Solid counterpart (grep across `solid-stately` + `solidaria` finds zero `expandedKeysStack`/`openSubmenu`).
- Why: Rule #1/#4 — nested menus are a core Spectrum behavior with no state to drive them; the lowest layer can't open/track a submenu tree.
- Fix: Port `useMenuTriggerState`/`useSubmenuTriggerState` into solid-stately. (Overlaps the in-flight menu-parity lane — coordinate.)

### [Critical] `MenuTriggerState` interface is declared but the export does not implement it

- Evidence: `collections/createMenuState.ts:84-106` declares `MenuTriggerStateProps`/`MenuTriggerState` with `focusStrategy`/`setFocusStrategy`, then `:112` exports `createOverlayTriggerState` (which has neither). Upstream type at `useMenuTriggerState.ts:18-43`.
- Why: Rule #2 (the public type promises behavior the implementation lacks — silent drift) + Rule #7 (no test can hold `focusStrategy` because it isn't returned).
- Fix: Either implement the interface (preferred, see above) or delete the dead interface so the API doesn't over-promise.

### [Critical] Calendar default `selectionAlignment` is wrong (`start`), and a test certifies the bug

- Evidence: `packages/solid-stately/src/calendar/createCalendarState.ts:183-198` — the `selectionAlignmentOffset` switch falls through to `start` (offset 0) when `props.selectionAlignment` is undefined. Upstream defaults to **`center`** (`react-spectrum/packages/@react-stately/calendar/src/useCalendarState.ts:97-106` — default case `alignCenter`; documented `@default 'center'` at `:57`). Worse: `packages/solid-stately/test/createCalendarState.test.ts:758-769` asserts `visibleRange().start === 2024-05-01` for a 2-month calendar focused on 2024-05-15 — center alignment would start in **April**. The test encodes the drift.
- Why: Rule #2 (wrong default) + Rule #1/#7 (the test asserts the wrong behavior, so the bug is "certified").
- Fix: Default `selectionAlignment` to `center` (port `alignCenter`/`alignStart`/`alignEnd`); fix the test expectation to April.

### [Critical] `getDatesInWeek` never emits leading `null` placeholders → broken grid for clamped/first weeks

- Evidence: `createCalendarState.ts:519-542` builds the week as `weekStart.add({days:i})` for i=0..6 and always pushes a date (the `else` branch's comment "Still include" is the bug). Upstream pads the START with `null` for `getDayOfWeek(...)` days when `startOfWeek` clamps, and pads the END with `null` at the calendar-system boundary (`useCalendarState.ts:333-362`).
- Why: Rule #1/#2 — first-row/last-row alignment and non-Gregorian calendar edges render wrong; the documented null contract (consumed by the grid renderer) is violated.
- Fix: Port the upstream `getDatesInWeek` null-padding logic verbatim.

### [High] `isCellDisabled` does not disable dates outside the visible range

- Evidence: `createCalendarState.ts:422-434` checks only `isDisabled`/`isDateDisabled`/min/max. Upstream also disables anything outside `[startDate,endDate]`: `date.compare(startDate) < 0 || date.compare(endDate) > 0` (`useCalendarState.ts:317-319`). Tests only probe in-month dates (`createCalendarState.test.ts:440-512`), so it's uncertified.
- Why: Rule #1/#2 — spill-over days from adjacent months are interactable when they should be inert.
- Fix: Add the visible-range bounds to `isCellDisabled`.

### [High] `isSelected`/`isCellFocused` drop their upstream guards

- Evidence: `createCalendarState.ts:405-414`. Upstream `isSelected` additionally requires `!isCellDisabled && !isCellUnavailable` (`useCalendarState.ts:311-313`); `isCellFocused` is gated on `isFocused` (`:314-316`). Solid's `isSelected` matches a disabled/unavailable day, and `isCellFocused` ignores `isFocused()` so a cell shows focused styling even when the calendar isn't focused.
- Why: Rule #2 — visual/selection state drifts from upstream branches.
- Fix: Add the `!isCellDisabled && !isCellUnavailable` guard to `isSelected`; gate `isCellFocused` on `isFocused()`.

### [High] Calendar `setValue` omits `previousAvailableDate`; missing `isPreviousVisibleRangeInvalid`/`isNextVisibleRangeInvalid`

- Evidence: `createCalendarState.ts:373-389` constrains to min/max only. Upstream snaps to the previous available date when the target is unavailable (`useCalendarState.ts:151-152`, `previousAvailableDate`). The prev/next-page-invalid predicates that disable the page arrows at range edges (`useCalendarState.ts:323-332`) have no Solid equivalent (grep: absent).
- Why: Rule #1/#2 — selecting near an unavailable run and the disabled-arrow affordance both diverge.
- Fix: Port `previousAvailableDate` into `setValue` and add the two range-invalid predicates.

### [High] `useFocusedKeyReset` is not ported — focusedKey can dangle on a deleted item

- Evidence: `packages/solid-stately/src/collections/createListState.ts` has no focused-key reset effect (only `setFocusedKey`, `:155-158`). Upstream runs an effect that, when the focused item is removed from the collection, moves focus to the nearest surviving item via index math + disabled-skipping (`react-spectrum/packages/@react-stately/list/src/useListState.ts:87-136`).
- Why: Rule #1 — after async list updates/filtering, keyboard focus points at a non-existent row.
- Fix: Port `useFocusedKeyReset` as a `createEffect` keyed on the collection (with `onCleanup`/cached-collection ref).

### [High] ComboBox filtered collection mis-navigates: `getKeyBefore`/`getKeyAfter` delegate to the unfiltered collection

- Evidence: `packages/solid-stately/src/combobox/createComboBoxState.ts:754-759` — the filtered collection's `getKeyBefore`/`getKeyAfter` call `original.getKeyBefore/After(key)`. Upstream rebuilds a real `ListCollection` from filtered nodes so prev/next chains only span visible items (`react-spectrum/packages/@react-stately/combobox/src/useComboBoxState.ts:475-477` → `new ListCollection(filterNodes(...))`, whose constructor wires `prevKey`/`nextKey`, `.../list/src/ListCollection.ts:39-66`).
- Why: Rule #1/#2 — ArrowUp/Down in a filtered list jumps to keys that aren't on screen.
- Fix: Build the filtered collection through `ListCollection` (which already computes prev/next) instead of a hand-rolled object delegating to the original.

### [High] ComboBox has no `FormValidationState`, and does not freeze the displayed collection on close

- Evidence: `createComboBoxState.ts` never imports/uses form-validation state; upstream wires `useFormValidationState` over `{inputValue,value,selectedKey}` (`useComboBoxState.ts:351-354`, plus `validation.commitValidation()` in `setFocused`, `:425-427`). Upstream also snapshots `lastCollection` and shows it while closing (`:190-263`, `:433-443`); Solid's `displayedCollection` is `showAllItems()? original : filtered` (`createComboBoxState.ts:317-319`) with no frozen-on-close path.
- Why: Rule #1/#4 — validation belongs in the state layer and is absent; menu contents visibly mutate during the close animation.
- Fix: Add `createFormValidationState` integration; keep a `lastCollection` signal updated on close to freeze the list.

### [High] ComboBox `selectedKey` uses insertion order, not collection order (`firstSelectedKey` missing)

- Evidence: `createComboBoxState.ts:285` derives the single key via `Array.from(keys)[0]`. Upstream uses `selectionManager.firstSelectedKey`, which compares DOM order via `compareNodeOrder` (`useComboBoxState.ts:169`; `SelectionManager.firstSelectedKey` `.../SelectionManager.ts:178-188`). `compareNodeOrder`/`getChildNodes`/`firstSelectedKey`/`lastSelectedKey` are all absent from solid-stately (grep).
- Why: Rule #2 — order-dependent selection (and any `firstSelectedKey` consumer) drifts.
- Fix: Port `compareNodeOrder`/`getChildNodes` and a `firstSelectedKey`/`lastSelectedKey` on the selection layer; use it here.

### [High] `createListState` collapses item-level disabled into `disabledKeys` regardless of `disabledBehavior`

- Evidence: `createListState.ts:104-117` unions `props.disabledKeys` with every node whose `isDisabled` is true, unconditionally, then feeds that to selection state whose `isDisabled` is just `disabledKeys.has(key)` (`createSelectionState.ts:147-149`). Upstream separates the two: `SelectionManager.canSelectItem` blocks selection on `item.props.isDisabled` (`SelectionManager.ts:491-502`), while `SelectionManager.isDisabled` (which governs _all_ interaction) only returns true when `disabledBehavior === 'all'` (`:504-506`).
- Why: Rule #2 — with `disabledBehavior: 'selection'`, an item should still be focusable/actionable but not selectable; Solid makes it fully disabled.
- Fix: Track item-disabled separately; honor `disabledBehavior` in the equivalents of `isDisabled` vs `canSelectItem`.

### [High] `ListCollection` navigation skips section headers; `size` semantics differ

- Evidence: `packages/solid-stately/src/collections/ListCollection.ts:58-80` — `getKeyBefore`/`getKeyAfter`/`getFirstKey`/`getLastKey` iterate `getAllItems()` (items only, `:96-111`). Upstream keeps sections in the prev/next chain (`.../list/src/ListCollection.ts:42-69`) and `size` counts only sections+items (excluding loaders/separators) (`:51-67`); Solid `size` is `keyMap.size` including every nested child key (`:34-36`).
- Why: Rule #2 — keyboard traversal and emptiness/size checks diverge for sectioned/loader-bearing collections.
- Fix: Mirror upstream constructor (compute prev/next across all nodes; count size as section+item).

### [Medium] `createOverlayTriggerState.setOpen` fires `onOpenChange` even when the value didn't change

- Evidence: `packages/solid-stately/src/overlays/createOverlayTriggerState.ts:47-53` calls `p.onOpenChange?.(open)` unconditionally. Upstream routes through `useControlledState`, which only calls `onChange` when `!Object.is(valueRef.current, newValue)` (`react-spectrum/packages/@react-stately/utils/src/useControlledState.ts:50-62`; `useOverlayTriggerState.ts:35`).
- Why: Rule #2 — `open()` on an already-open overlay (or controlled no-op) emits a spurious `onOpenChange`, which downstream (menu/combobox open-trigger bookkeeping) can double-handle.
- Fix: Guard the callback on an actual change (mirror `useControlledState` change-gate), and apply consistently to every hand-rolled controlled-state pair in the layer.

### [Medium] Single-select list "always fire onSelectionChange on same key" is implemented in a drift-prone spot

- Evidence: `createListState.ts:198-239` (`createSingleSelectListState`) routes same-key re-selection through `replaceSelection` and relies on `allowDuplicateSelectionEvents: true`. Upstream fires `onSelectionChange` explicitly when `key === selectedKey` _before_ `setSelectedKey` (`react-spectrum/packages/@react-stately/list/src/useSingleSelectListState.ts:56-63`). Solid's `setSelectedKey(null)` path calls `clearSelection()` (`:247-253`), which early-returns under `disallowEmptySelection` (always true here, `createSelectionState.ts:226-229`) — so programmatic `setSelectedKey(null)` is a silent no-op.
- Why: Rule #1/#2 — clearing a single-select list via `setSelectedKey(null)` does nothing.
- Fix: Mirror upstream: keep a dedicated controlled `selectedKey` and fire-on-same-key; allow null to clear.

## SolidJS idiom & reactivity

### [High] NumberField mutates signals inside read paths (`syncControlledValue` called from getters/memos)

- Evidence: `packages/solid-stately/src/numberfield/createNumberFieldState.ts:218-237` — `syncControlledValue()` calls `setNumberValue`/`setInputValueInternal`, and it is invoked from `parsedInputValue()` (`:233-237`), which runs inside the `canIncrement`/`canDecrement` memos (`:300`, `:316`) and the `inputValue` getter (`:400-404`). Writing signals during a derivation is a Solid anti-pattern (out-of-order updates, redundant recomputation, potential loops). Controlled→state sync should be a `createEffect`, not a side-effect smuggled into a read.
- Why: Rule #2/#5 — replaces upstream's render-time reconciliation with read-time mutation; fragile structure, not parity.
- Fix: Move controlled-value reconciliation into a `createEffect` keyed on `props.value`; keep memos pure.

### [Medium] `createComboBoxState` does init work and snapshots props at construction time (outside reactive scope)

- Evidence: `createComboBoxState.ts:341-352` runs a one-shot `if (!inputInitialized ...)` that reads `originalCollection()` and writes signals during factory execution; `:618` returns `defaultSelectedKey: getProps().defaultSelectedKey ?? null` and `:625` `defaultInputValue: ...` as **plain values captured once** (not getters). If `items`/`defaultSelectedKey` arrive asynchronously (the documented async-load case upstream handles, `useComboBoxState.ts:335-345`), the initial input value never derives from the selected item.
- Why: Rule #2 — upstream recomputes default input value via `getDefaultInputValue(...)` against the live collection; Solid freezes it.
- Fix: Make `defaultSelectedKey`/`defaultInputValue` getters; derive initial input via a memo/effect over the collection rather than a construction-time one-shot.

### [Medium] NumberField default `step` reads `p.formatOptions?.style` non-reactively in one branch

- Evidence: `numberfield/createNumberFieldState.ts:164-170` reads `p.formatOptions?.style` inside the `step` memo (reactive, OK) but `applyConstraints` (`:176-185`) and `safeNextStep` (`:326-342`) re-read `getProps()` each call (OK). The reactivity risk is the `handleDecimalOperation`/`snapToStep` math being a reinvention of upstream `@internationalized/number` (`NumberParser`) — `parseNumber` strips with `/[^\d.-]/g` (`:143`), which mishandles grouping, sign placement, and currency/percent round-trips.
- Why: Rule #2 — bespoke parser vs the upstream `NumberParser` the rest of the stack assumes.
- Fix: Use `@internationalized/number` (already a transitive dep of the upstream stack) for parse/format; drop the regex stripper.

---

## Suspected (unconfirmed)

- **DateField uses a `placeholderDate` partial-signal model instead of upstream `IncompleteDate`** (`packages/solid-stately/src/calendar/createDateFieldState.ts:178-211` vs `react-spectrum/packages/@react-stately/datepicker/src/useDateFieldState.ts:173-233` + `IncompleteDate.ts`). The vendored upstream is a newer build than the pinned 3.9; needs a version-matched diff before grading. Likely the datefield reviewer's lane.
- **RangeCalendar lacks `updateAvailableRange`/`isInvalidSelection`** (grep finds neither in `createRangeCalendarState.ts`; upstream `useRangeCalendarState.ts:76-138` stores an available-range ref and clamps drag selection). The anchor/highlight scaffolding exists (`:322-355`) but the unavailable-date clamping during drag appears absent — confirm by tracing `selectDate`/`highlightDate`.
- **ComboBox multi-select (`selectionMode:'multiple'`, `onSelectionChangeMultiple`)** (`createComboBoxState.ts:46-47,576-599`) partially matches the _newer_ upstream multi-select API but uses a divergent prop shape (`onSelectionChangeMultiple` vs upstream `value`/`onChange`/`SelectionMode`). If the target pin is 3.9 (single-select only) this is a Solid-only addition needing a documented "local addition"; if the target is the newer build, the prop names are drift. Needs an owner decision on the pinned combobox version.
- **`createSelectionState.toggleSelection` cannot toggle off a key while `selectedKeys === 'all'`** (`createSelectionState.ts:190-193` early-returns). Upstream materializes the select-all set then removes the key (`SelectionManager.toggleSelection.ts:330-345` via `getSelectAllKeys`). Confirm whether any Solid component reaches this path (depends on whether `'all'` is ever set without a real collection).
