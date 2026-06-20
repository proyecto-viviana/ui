---
kind: scoping
status: scoped (not started)
tickets: T-34, T-51, T-52, T-56
oracle: react-spectrum/packages/react-aria/src/selection/useSelectableItem.ts
---

# Item-hook press-path migration — epic scope

The collection item hooks that drive grids, trees, and tables inline their
activation logic over **raw pointer/click events**. Upstream routes the same
logic through one shared hook, `useSelectableItem`, built on `usePress` +
`useLongPress`. Four backlog tickets all wait on that same architectural move:

| Ticket | Gap | Depends on |
| --- | --- | --- |
| **T-51** ⛔ | `replace`-mode action model: single-click selects, double-click acts (secondary action); touch long-press → `setSelectionBehavior('toggle')` | the shared press path |
| **T-34** ⛔ | `keyboardNavigationBehavior='tab'` collection keyboard model (child-propagation gating, capture binding only in `'arrow'` mode, tabbable-target pointer guards) | the item-hook surface; sequence after/with the press path |
| **T-52** 🔍 | We pulled the aria-layer modifier decision into stately's `select()` (uses `ctrlKey \|\| metaKey`, never sees `pointerType`). Fix = restore upstream's split: thin `select()` to pointerType+behavior, move modifiers up to an aria-layer `onSelect` | foundational; lands first |
| **T-56** 🔍 | `disabledBehavior:'selection'` item fires `onAction` on keyboard but **not** on pointer click | falls out of the press path (item-hook `performAction` runs for pointer) |

This is high-risk and cross-hook. **Scope and validate on its own before
starting** (the ticket's own directive). This file is the scope; nothing here is
implemented yet.

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

## What we have vs. what's missing

**Primitives present** — no new dependencies needed:

- `solidaria/src/interactions/createPress.ts` — `onPress`/`onPressStart`/
  `onPressUp`, `PressEvent.pointerType`. ✓
- `solidaria/src/interactions/createLongPress.ts`. ✓
- `solid-stately` `createSelectionState`: `select(key, {shiftKey,ctrlKey,metaKey}, collection)`,
  `setSelectionBehavior`, `selectionBehavior`, `disallowEmptySelection`, `isEmpty`,
  `toggle/replace/extendSelection`. ✓

**Missing — to build:**

1. **No shared `createSelectableItem`.** The central deliverable. Each row hook
   reimplements activation. There is no Solid analogue of `useSelectableItem`.
2. **`select()` doesn't thread `pointerType`** and uses `ctrlKey || metaKey`
   (T-52). Needs a richer event param + platform-aware ctrl resolution.
3. **No `isCtrlKeyPressed` / `isNonContiguousSelectionModifier` utils**, and a
   **self-inflicted divergence to revert**. Upstream splits the toggle-vs-replace
   decision across exactly two layers:
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

   We diverged by pulling the aria-layer modifier logic (`shiftKey`,
   `ctrlKey || metaKey`) **down** into `solid-stately`'s `select()`, and our
   `select()` does **not** yet check `pointerType`. That manufactured the
   apparent "stately can't reach `isMac`" problem. The fix is to **restore the
   upstream split**, not to work around it: revert `solid-stately`'s `select()`
   to the `SelectionManager.select` shape (pointerType + behavior, layer-safe,
   no platform util), and move the modifier/shift/link/keyboard decision up into
   the aria layer (`createSelectableItem`'s `onSelect`), where `isMac` already
   lives in `solidaria/src/utils/platform.ts`. Port `isCtrlKeyPressed` and
   `isNonContiguousSelectionModifier` into solidaria as aria-layer utils.
4. **Manager link surface absent.** `manager.canSelectItem`, `manager.isLink`,
   `manager.getItemProps`, and the `linkBehavior` axis do **not** exist on our
   selection state — we thread `href`/`onLinkAction` through item **props**
   instead (e.g. `createTableRow` reads `p.href`, calls `p.onLinkAction`). The
   port must either add a link registry to the manager or adapt
   `createSelectableItem` to the prop-threaded link model we already use.
   Recommend the latter (smaller, matches our collection-builder design) and
   record the divergence.
5. **`keyboardNavigationBehavior` is absent entirely** (T-34) — greps to nothing.

## As-is, per item hook (the migration targets)

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
choice: every option tried to *preserve* our divergence. Parity is the governing
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

**Phase 0 — restore the upstream two-layer split (T-52).**
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

**Phase 1 — build `createSelectableItem` in isolation.**
- New `solidaria/src/selection/createSelectableItem.ts` mirroring the upstream
  contract, **reusing the Phase 0 `onSelect`**: the action model
  (`hasPrimaryAction`/`hasSecondaryAction`/`allowsSelection`/`allowsActions`),
  `createPress` wiring (press-up vs press, keyboard Space/Enter split),
  `onDoubleClick` secondary action, `createLongPress` →
  `setSelectionBehavior('toggle')`, `pointerType` threading, the prop-threaded
  link model (decision in gap #4).
- Validate with a dedicated `createSelectableItem.test.tsx` against the contract
  **before** any consumer migrates — this is the de-risking gate.

**Phase 2 — migrate the three item hooks, one at a time.**
- `createGridListItem` → `createTreeItem` → `createTableRow`, each its own
  commit + parity tests, each green before the next. Reconcile each hook's
  keyboard handler and `gridCellProps`/`expandButtonProps` extras onto the
  shared base. **T-56 falls out here** (the press path runs `performAction` on
  pointer for selection-disabled-but-actionable items).
- Audit the sibling option hooks (`createListBoxOption`, `createMenuItem`) for
  the same click gap; migrate or document why they differ (menus use
  `shouldSelectOnPressUp`).

**Phase 3 — `keyboardNavigationBehavior` (T-34), layered on top.**
- Thread the prop through `createGridList`/`createTree`; gate child-element
  propagation and capture binding by mode; extract `handleTreeExpansionKeys`;
  add the tabbable-target `onPointerDown`/`onMouseDown` guards. Un-omit
  `keyboardNavigationBehavior` on S2 `ListView`/`TreeView`. Separate changeset.

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
`solidaria-components` / `solid-spectrum` — green before committing. Keep the
contract evidence here and in the per-ticket audit entries.
