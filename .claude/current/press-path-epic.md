---
kind: scoping
status: Phases 0–3 landed (GridList + Tree + Table + ListBox option + Menu item migrated; keyboardNavigationBehavior covered)
tickets: T-34, T-51, T-52, T-56
oracle: react-spectrum/packages/react-aria/src/selection/useSelectableItem.ts
---

# Item-hook press-path migration — epic scope

Status: live epic.
Update when: a phase lands, a ticket's scope changes, or the epic closes.

The collection item hooks that drive grids, trees, and tables inline their
activation logic over **raw pointer/click events**. Upstream routes the same
logic through one shared hook, `useSelectableItem`, built on `usePress` +
`useLongPress`. Four backlog tickets all wait on that same architectural move:

| Ticket     | Gap                                                                                                                                                                                                                                                  | Depends on                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **T-51** ✔ | `replace`-mode action model: single-click selects, double-click acts (secondary action); touch long-press → `setSelectionBehavior('toggle')`                                                                                                         | landed through the shared press path                             |
| **T-34** ✔ | `keyboardNavigationBehavior='tab'` collection keyboard model (child-propagation gating, capture binding only in `'arrow'` mode, tabbable-target pointer guards)                                                                                      | landed as Phase 3                                                |
| **T-52** ✔ | We pulled the aria-layer modifier decision into stately's `select()` (uses `ctrlKey \|\| metaKey`, never sees `pointerType`). Fix = restore upstream's split: thin `select()` to pointerType+behavior, move modifiers up to an aria-layer `onSelect` | landed as Phase 0                                                |
| **T-56** ✔ | `disabledBehavior:'selection'` item fires `onAction` on keyboard but **not** on pointer click                                                                                                                                                        | landed through the shared press path (item-hook `performAction`) |

This is high-risk and cross-hook. **Scope and validate on its own before
starting** (the ticket's own directive). This file is the scope; implementation
status is tracked by phase below.

## The upstream contract (`useSelectableItem`, pinned 1.19)

One hook produces `itemProps` for a selectable row/option. The pieces:

### Action model (lines 242–256)

```
allowsSelection  = !isDisabled && manager.canSelectItem(key) && !isLinkOverride && !isActionOverride
allowsActions    = (onAction || hasLinkAction) && !isDisabled
hasPrimaryAction = allowsActions && (behavior === 'replace' ? !allowsSelection : !allowsSelection || manager.isEmpty)
hasSecondaryAction = allowsActions && allowsSelection && behavior === 'replace'
hasAction        = hasPrimaryAction || hasSecondaryAction
```

So under **`replace`** with selection enabled: single-click **selects**, the row
action is **secondary** (double-click, mouse only). Under **`toggle`** (checkbox)
or with selection disabled: the action is **primary** (single click).

### `onSelect` (lines 144–182)

The selection contract — same one our `createSelectionState.select()` already
mirrors for single mode (`selection-single-mode-replace.md`), **except** it keys
off `e.pointerType`: `touch`/`virtual` force `toggleSelection` (no modifier keys
on those devices), and it uses `isCtrlKeyPressed(e)` not `e.ctrlKey || e.metaKey`.

### Press wiring (lines 282–359)

- `shouldSelectOnPressUp` (menus) → select on `onPressStart`/`onPressUp`;
  otherwise select on `onPressStart` for mouse, action on `onPress` (pointer up).
- Keyboard: Space selects on key down (`isSelectionKey`), Enter performs the
  action on key up (`isActionKey`); gated by `hasAction`/`allowsActions`.
- `modality` ref records the press's `pointerType` for the double-click/drag
  guards.

### Secondary action + long press (lines 400–422)

- `onDoubleClick` (only when `hasSecondaryAction`) → `performAction` if the last
  modality was `mouse`.
- `useLongPress` (enabled when `hasAction && allowsSelection`) → on a `touch`
  long press, `onSelect` + `manager.setSelectionBehavior('toggle')`.
- `onDragStartCapture` suppresses native DnD while long-press selection is armed.

### `performAction` (lines 264–273)

Calls `onAction()`, dispatches a bubbling `react-aria-item-action` CustomEvent,
and for link items opens the href via the router.

## Original gap inventory

**Initial primitives present** — no new dependencies needed:

- `solidaria/src/interactions/createPress.ts` — `onPress`/`onPressStart`/
  `onPressUp`, `PressEvent.pointerType`. ✓
- `solidaria/src/interactions/createLongPress.ts`. ✓
- `solid-stately` `createSelectionState`: `select(key, {shiftKey,ctrlKey,metaKey}, collection)`,
  `setSelectionBehavior`, `selectionBehavior`, `disallowEmptySelection`, `isEmpty`,
  `toggle/replace/extendSelection`. ✓

**Dispositioned gaps:**

1. **No shared `createSelectableItem`.** ✔ Built in Phase 1, then adopted by
   GridList, Tree, Table, ListBox option, and Menu item in Phase 2.
2. **`select()` didn't thread `pointerType`** and used `ctrlKey || metaKey`
   (T-52). ✔ Restored upstream's two-layer split in Phase 0.
3. **No `isCtrlKeyPressed` / `isNonContiguousSelectionModifier` utils**, plus a
   **self-inflicted divergence to revert**. ✔ Resolved in Phase 0 by porting the
   aria-layer utils into solidaria and removing modifier/platform logic from
   stately. Upstream splits the toggle-vs-replace decision across exactly two
   layers:
   - `react-stately` `SelectionManager.select(key, e)` knows **only**
     `pointerType` + `selectionBehavior`: single-mode toggle/replace, then
     `behavior === 'toggle' || pointerType ∈ {touch, virtual}` ⇒ toggle, else
     replace. **No `ctrlKey`/`metaKey`/`shiftKey`/`isMac`/links.**
   - `react-aria` `useSelectableItem` `onSelect(e)` owns everything
     modifier/platform/link aware: keyboard `isNonContiguousSelectionModifier`
     ⇒ toggle, link handling, single-mode, `shiftKey` ⇒ extend, then
     `selectionBehavior === 'toggle' || isCtrlKeyPressed(e) || touch/virtual`
     ⇒ toggle, else replace. `isCtrlKeyPressed = isMac() ? metaKey : ctrlKey` is
     imported from the **aria-layer** util `react-aria/src/utils/keyboard`;
     `isNonContiguousSelectionModifier` from `react-aria/src/selection/utils`.

   The fix was to **restore the upstream split**, not to work around it:
   `solid-stately` `select()` now follows the `SelectionManager.select` shape
   (pointerType + behavior, layer-safe, no platform util), and
   `createSelectableItem` owns the aria-layer modifier/shift/link/keyboard
   decision.

4. **Manager link surface absent.** Adapted in Phase 1. `manager.canSelectItem`,
   `manager.isLink`,
   `manager.getItemProps`, and the `linkBehavior` axis do **not** exist on our
   selection state — we thread `href`/`onLinkAction` through item **props**
   instead (e.g. `createTableRow` reads `p.href`, calls `p.onLinkAction`).
   `createSelectableItem` therefore adapts upstream's link behavior to our
   prop-threaded link model rather than adding a manager registry.
5. **`keyboardNavigationBehavior`** (T-34) is ported in Phase 3. The prop is
   threaded through `createGridList`/`createTree`, row child-key gating lives in
   `createCollectionRowInteraction`, and S2 `ListView`/`TreeView` forward it
   through their headless prop spreads.

## Original as-is, per item hook (pre-migration)

- **`gridlist/createGridListItem.ts`** — `handleActivation` (45–89) conflates
  selection + action; the `replace` branch fires `onAction` on a single click of
  the **sole-selected** row (`isSelected() && size === 1`) instead of
  `replaceSelection`; no double-click, no long-press, no `pointerType`. Pressed
  state via raw `onPointerDown/Up` + a hand-rolled `ignoreNextClick`.
- **`tree/createTreeItem.ts`** — same conflated `onClick` (60–104); same
  single-click-sole-selected → action bug; raw pointer pressed state; plus the
  expand-button propagation stops (already correct, keep).
- **`table/createTableRow.ts`** — most evolved: pointer-down/up disambiguation
  (`didSelectOnPointer`/`didActionOnPointer`), a `forceReplace` select path, an
  `isFromInteractiveElement` guard, and an `onDblClick` — but the dblclick only
  activates an `href` link under `replace`; the **general row action still fires
  on the single activation** (167–168), not as a mouse double-click. No
  long-press, no `pointerType` threading.

None route through `select()` or `createPress`; none thread `pointerType`; none
implement long-press → toggle.

## Resolved — restore upstream's two-layer split (parity is the rule)

The earlier "where does the platform-aware modifier go" question was a false
choice: every option tried to _preserve_ our divergence. Parity is the governing
rule (diverge only when React→Solid makes it impossible), and upstream already
answers it cleanly, so we mirror it:

- **`solid-stately` `select(key, e)`** ⇒ `SelectionManager.select` shape:
  single-mode toggle/replace, then `behavior === 'toggle' || pointerType ∈
{touch, virtual}` ⇒ toggle, else replace. The `e` param carries `pointerType`.
  No modifiers, no `shiftKey`, no `isMac` — so it stays layer-safe with only
  `@internationalized/date` as a dependency.
- **`solidaria` aria-layer `onSelect`** (the future `createSelectableItem`, and
  the existing Menu / ListBox / ActionGroup paths) ⇒ `useSelectableItem.onSelect`
  shape: keyboard `isNonContiguousSelectionModifier` ⇒ toggle, link handling,
  single-mode, `shiftKey` ⇒ extend, `isCtrlKeyPressed || touch/virtual ||
toggle` ⇒ toggle, else replace. `isCtrlKeyPressed` / `isNonContiguousSelection
Modifier` are ported into solidaria (aria-layer utils; `isMac` already lives in
  `solidaria/src/utils/platform.ts`).

This removes the layering problem entirely instead of working around it — the
tell that it is the faithful structure.

## Proposed phasing

**Phase 0 — restore the upstream two-layer split (T-52). ✔ Landed.**
As built (commit "Restore upstream's two-layer onSelect split for selection"):
`solid-stately` `select(key, e?)` thinned to the `SelectionManager.select`
shape (pointerType + behavior, new `SelectionPressEvent` type, no modifier/
collection args); solidaria gained `selectItem` (aria-layer onSelect),
`isCtrlKeyPressed`, `isNonContiguousSelectionModifier`; `createMenu`'s keyboard
activation routes through `selectItem`. The stately test was re-pointed to the
`SelectionManager.select` contract and a discriminating `selectItem` suite added
(platform-aware ctrl/meta, shift-extend, touch/virtual toggle, single-mode
replace). The link branch + pointer-event threading into menu-item/option
presses are deferred to Phases 1–2. Original plan:

- Port `isCtrlKeyPressed` (aria-layer keyboard util) and
  `isNonContiguousSelectionModifier` (aria-layer selection util) into solidaria,
  built on the existing `solidaria/src/utils/platform.ts` `isMac`.
- Add a shared aria-layer `onSelect`-shaped decision in solidaria, mirroring
  `useSelectableItem.onSelect` (keyboard non-contiguous, single-mode, shift ⇒
  extend, `isCtrlKeyPressed || touch/virtual || toggle` ⇒ toggle, else replace).
  This becomes the seed of Phase 1's `createSelectableItem`.
- Revert `solid-stately` `select(key, e)` to the `SelectionManager.select`
  shape: single-mode + `behavior === 'toggle' || pointerType ∈ {touch, virtual}`
  ⇒ toggle, else replace. Drop the `shiftKey`/`ctrlKey`/`metaKey` branch.
- Repoint the existing call sites (`createMenuItem`, `createMenu`,
  `createOption`, `createActionGroup`) to the solidaria `onSelect` so modifier /
  shift multi-select keeps working after stately is thinned — sequence so the
  collection regression (Menu / ListBox / ActionGroup) stays green throughout.
- Unit-test the contract table (touch/virtual ⇒ toggle; ctrl/meta
  platform-aware via `isMac`; shift ⇒ extend). Own changeset for each published
  package touched (`solid-stately` + `solidaria`).

**Phase 1 — build `createSelectableItem` in isolation. ✔ Landed.**
As built (commit "Add createSelectableItem shared press-path item hook"):
`solidaria/src/selection/createSelectableItem.ts` mirrors the upstream contract,
reusing the Phase 0 `selectItem` for the aria-layer onSelect. It ships the
action model (`hasPrimaryAction`/`hasSecondaryAction`/`allowsSelection`/
`allowsActions`/`hasAction`), the `createPress` wiring (select-on-press-up for
`shouldSelectOnPressUp`/menus vs. select-on-press-down for rows, the
`allowsDifferentPressOrigin` branch, keyboard Space-selects / Enter-acts split
via the new `PressEvent.key`), the `onDblClick` secondary action gated on mouse
modality, `createLongPress` → `onSelect` + `setSelectionBehavior('toggle')` for
touch, `onDragStart` native-drag suppression, and `performAction` (onAction +
bubbling `ITEM_ACTION_EVENT` CustomEvent + link open). Exported from
`solidaria` (`createSelectableItem`, `ITEM_ACTION_EVENT`,
`CreateSelectableItemOptions`, `SelectableItemAria`, `LinkBehavior`).

Validated by `solidaria/test/createSelectableItem.test.tsx` (14 tests, the
de-risking gate): the action model across plain/none/replace/toggle/disabled/
link-override, plus the full press path (mouse press-down select, touch toggle,
mouse primary action, Space select, Enter action, double-click secondary,
long-press → toggle). Press-path tests run under fake timers, mirroring the
`createPress` suite. No consumer migrates onto it in this phase.

As-built adaptations from upstream (our collection manager shapes are thinner
than `SelectionManager`) — record alongside gap #4 so they aren't read as port
misses:

- **Selection manager shape is structural.** List-like states pass the
  `selectionManager`; grid-like states pass adapters. `canSelectItem` is read
  from the adapter / selection manager when present; the fallback remains
  `selectionMode() !== 'none' && !isDisabled(key)`.
- **Link model prop-threaded** (`isLink`/`href`/`routerOptions`/`linkBehavior`),
  not `manager.isLink`/`getItemProps`; link open via the `openLink` util, no
  router context.
- **No `moveVirtualFocus`** — virtual-focus updates set the focused key
  directly. `data-collection` is emitted when a collection manager id is
  available, and adapters fall back to their own object identity.
- **`onDragStart` bubbles** (no capture-phase `onDragStartCapture`); merged via
  `mergeProps` so it chains with `createPress`'s own `onDragStart`.
- **`PressEvent.key` added** (`solidaria/src/interactions/PressEvent.ts`) to
  carry the Space-vs-Enter distinction — a faithful parity fix (upstream's
  `PressEvent` carries `key`), additive and back-compatible.
- **No uncontrolled-`replace` `selectionBehavior`** in our state: setting the
  prop makes it controlled and locks `setSelectionBehavior`. The long-press
  toggle wiring is therefore asserted via the manager call, and consumers that
  want long-press toggle must leave `selectionBehavior` uncontrolled
  (state-layer gap, also noted under `disabledBehavior:'selection'`).

**Phase 2 — migrate the row hooks, then sibling option hooks. ✔ Landed.**

As built (2026-06-23, changeset `gridlist-press-path.md`):
`createGridListItem`, `createTreeItem`, and `createTableRow` now route row
selection/actions through `createSelectableItem`. The slice includes
`replace`-mode single-click-selects / mouse-double-click-acts evidence,
Enter-on-keyup alignment, Space-selects on the focused row without container
double-toggle, and `disabledBehavior="selection"` rows that remain
pointer/keyboard-actionable while blocked from selection. `solid-stately` grid,
tree, and table state expose the selection-behavior surface needed for
long-press toggle state; `solidaria-components` GridList and Table pass the
resolved `selectionBehavior` / `shouldSelectOnPressUp` data through; Tree's row
activation mirrors upstream `useTreeItem` by delegating to the shared selectable
item path and keeping expansion-specific behavior on the expand button /
no-action row branch.

The Table migration also fixed a Solid-specific press containment failure found
by the comparison app: a child cell `pointerdown` handler could synchronously
replace the original event target before the row press handler ran. `createPress`
now accepts events whose original composed path contains the press target, which
preserves upstream's containment intent under Solid's synchronous updates. S2
`TableView` also no longer forces `shouldSelectOnPressUp` to `true`; upstream RAC
only uses pointer-up selection when drag selection is active.

ListBox's option hook is now on the same item path too:
`listbox/createOption` delegates selection/action timing to
`createSelectableItem`, defaults plain ListBox back to upstream's pointer-down
selection timing, and keeps the upstream picker/combobox overrides in the
wrappers (`shouldSelectOnPressUp`, virtual focus, hover focus, link/action item
behavior). `disabledBehavior="selection"` options remain pointer-actionable but
unselectable, covered at both hook and component layers. The larger
`createSelectableCollection`/keyboard-delegate spine is still deferred: the
ListBox root keyboard/navigation code remains local, with bubbled item
Space/Enter ignored so item-level press handling does not double-activate.

Menu's item hook is now on the same shared selection path as upstream:
`menu/createMenuItem` composes `createSelectableItem` with
`shouldSelectOnPressUp: true`, `allowsDifferentPressOrigin: true`, and
`linkBehavior: "none"`. The menu-specific layer stays separate, matching
upstream: item/menu `onAction` dispatch, submenu trigger behavior, and the
close-on-select matrix live in `createMenuItem`/`createMenu`, not in the shared
selection hook. Covered branches include disabled-for-selection pointer action,
different-origin pointer release, Enter-vs-pointer close defaults in multiple
selection, mouse release selection without synthetic-click final-state feedback,
upstream duplicate selection callbacks for that release path,
and the root keyboard path's no-double-activation guard.

- `createGridListItem` → `createTreeItem` → `createTableRow` →
  `listbox/createOption` → `menu/createMenuItem` are migrated. **T-56 falls out
  here** for the migrated row/option/menu hooks: the press path runs
  `performAction` on pointer for selection-disabled-but-actionable items while
  selection remains blocked.
- The Menu source reconcile found two Solid timing adapters, documented in
  `.claude/reference/patterns.md`: an intentional keyboard `.click()` can pass
  through `createPress` as `virtual` before the menu action layer reads the
  intended keyboard modality, and the upstream different-origin mouse
  `target.click()` can otherwise feed back into selectable-item virtual
  selection after press-up already selected the release target. The mouse guard
  suppresses the destructive second state mutation but replays React's duplicate
  selection callback with the original press-up payload. Both guards live in
  `createMenuItem` and are scoped to matching upstream's user-observable
  close/action/selection behavior, not a global press monkey patch.

**Phase 3 — `keyboardNavigationBehavior` (T-34), layered on top. Done.**

- Ported the upstream `useGridListItem` model into
  `createCollectionRowInteraction`: in `tab` mode, keyboard events from tabbable
  row children stop before collection selection/action/expansion; `Tab`
  propagates only when leaving the row; capture binding is only installed for
  `arrow` mode; tabbable-child `pointerdown`/`mousedown` guards are unconditional
  like upstream. The prop is exposed by `createGridList`/`createTree`,
  forwarded by RAC `GridList`/`Tree`, and covered at the S2 `ListView`/`TreeView`
  wrapper surface.
- Evidence (2026-06-24): `vp test packages/solidaria/test/createGridList.test.tsx
packages/solidaria/test/createTree.test.ts packages/solidaria-components/test/GridList.test.tsx
packages/solidaria-components/test/Tree.test.tsx packages/solid-spectrum/test/ListView.test.tsx
packages/solid-spectrum/test/Tree.test.tsx` — 6 files, 172 tests.

## Risks

- **High regression surface.** Selection/action behavior changes on **every**
  grid/tree/table row. `replace` is the default `selectionBehavior` for highlight
  TableView, so the single-click-selects / double-click-acts change is
  user-visible there.
- **Existing tests encode the current (partly wrong) behavior** — e.g. tests
  asserting a single click fires the row action under replace. These must be
  re-pointed to the faithful contract, not preserved. Inventory before Phase 2.
- **jsdom interaction timing** — double-click and long-press in jsdom. `createPress`
  already works in tests (Button etc.), but long-press timers + `dblclick`
  synthesis need explicit fake-timer handling.
- **Link-model divergence** (gap #4) is a deliberate local adaptation; must be
  recorded in `certification.md`/`tech-debt.md` so it isn't mistaken for a port
  miss later.

## Validation strategy

Per phase: faithful unit/parity tests that **discriminate** (fail against the
pre-change hook), then the full collection regression — `Table`, `GridList`,
`Tree`, `ListView`, `TreeView`, `Menu`, `ListBox` across `solidaria` /
`solidaria-components` / `solid-spectrum` — green before committing. The
comparison app now has a focused collection gate,
`vp run comparison:test:collections`, for the styled `ListView` / `TableView` /
`TreeView` visual specs. Menu's comparison contract also covers the upstream
different-origin mouse press release selection branch for
`shouldSelectOnPressUp` + `allowsDifferentPressOrigin`, including the duplicate
selection callback count React emits before the menu action. Keep the contract
evidence here and in the per-ticket audit entries.
