# A11y audit — Collections & Overlays (Agent 07)

Lane: accessibility **correctness vs. the state-of-the-art web standard** (WAI-ARIA APG,
WAI-ARIA 1.2, accname 1.2, WCAG 2.2). Not fidelity-to-upstream (Agents 2/4 own that),
though upstream is cited where it informs the correct contract. READ-ONLY.

Scope reviewed: Menu/ActionMenu, ListBox/Option, ComboBox, Picker/Select, Dialog/Modal/
Popover/Tooltip, FocusScope + modal containment (ariaHideOutside / preventScroll), Tree
(treegrid), Table (grid), TagGroup, Toast, Tabs, Toolbar, Disclosure, Breadcrumbs.

Net: the overlay/focus infrastructure (`FocusScope`, `ariaHideOutside`, `createPreventScroll`)
and the ListBox/ComboBox/Table/Tree/Tabs/TagGroup/Tooltip/Toast ARIA wiring are strong,
faithful ports. The **Menu** family is the weak spot: it neither moves DOM focus to the
active item nor exposes `aria-activedescendant`, and its trigger drops the open-direction
focus strategy. There is in-flight Menu work (`.changeset/menu-parity-followups.md`) — the
two Menu findings below are **not** addressed by it (that changeset targets close-on-select,
submenu ArrowLeft, etc., not the focus model).

---

### [Critical] Menu/ActionMenu — Keyboard focus never moves to the active item; no `aria-activedescendant`

- Evidence:
  - `packages/solidaria/src/menu/createMenu.ts:200-406` — `onKeyDown` updates only
    `state.setFocusedKey(...)`. The container props (`createMenu.ts:412-436`) set
    `role="menu"`, `tabIndex: 0`, but **no `aria-activedescendant`**.
  - `packages/solidaria/src/menu/createMenuItem.ts:159` — items use roving tabindex
    (`tabIndex: isFocused() ? 0 : -1`) but the hook never calls `.focus()` on the element,
    and there is **no effect** anywhere that moves DOM focus when `isFocused()` flips.
  - `packages/solidaria-components/src/Menu.tsx` — `MenuItem` (≈1480-1595) has no
    `createEffect` that focuses the row on `isFocused`; `setItemRef` (`Menu.tsx:117`) only
    wires submenu-trigger refs. The only `FocusScope autoFocus` is the submenu-only branch
    (`Menu.tsx:1288`); the top-level menu (the `fallback` at `Menu.tsx:1287`) has none.
  - Contrast: ListBox sets `aria-activedescendant` (`createListBox.ts:302-303`) and ComboBox
    likewise (`createComboBox.ts:648-649`). Upstream `useMenu` routes through
    `useSelectableList`/`useSelectableCollection`, which `focusSafely()`-moves real DOM focus
    to the active item (react-spectrum `@react-aria/menu/src/useMenu.ts:58-71`).
  - Standard: APG Menu/Menubar requires one of two focus models — roving tabindex with **DOM
    focus on the item**, or `aria-activedescendant` on the container
    (https://www.w3.org/WAI/ARIA/apg/patterns/menu/ §Keyboard / "Focus Management"). WAI-ARIA
    1.2 `aria-activedescendant` (https://www.w3.org/TR/wai-aria-1.2/#aria-activedescendant).
- Why: With neither DOM focus nor activedescendant, arrowing through the menu changes
  `tabIndex`/`data-focused` but the screen-reader focus point never updates, so AT announces
  nothing as the user navigates, and Enter/Space act on a `focusedKey` the user can't perceive.
  This makes the menu effectively unusable with a screen reader and is a roving-tabindex
  violation (the tabbable item is not the focused element). WCAG 2.4.7 Focus Visible /
  4.1.2 Name,Role,Value are also at risk because the active item's state isn't conveyed.
- Fix: Mirror upstream's selectable-collection model. Either (a) add a focus driver that
  `focusSafely()`-moves DOM focus to the element of `state.focusedKey()` whenever it changes
  (and on open per the trigger's strategy), keeping roving tabindex; or (b) set
  `aria-activedescendant` on the menu container to the active item's id (as ListBox already
  does) and ensure each `menuitem` has a stable matching `id` (currently
  `createMenuItem.ts:153` uses `id: String(key)` — usable for activedescendant).

### [Critical] Menu Button trigger — ArrowUp/ArrowDown don't set the open focus strategy (first/last)

- Evidence:
  - `packages/solidaria/src/menu/createMenuTrigger.ts:46-67` — `ArrowDown` and `ArrowUp`
    both just call `state.open()` with no focus direction; there is no `focusStrategy`
    concept, and `menuTriggerProps` (`createMenuTrigger.ts:70-83`) never forwards one.
  - No compensating logic in `MenuTrigger` (`Menu.tsx:320-358`) — `createMenuTriggerState`
    is created without first/last strategy, and nothing focuses first/last on open.
  - Upstream: `useMenuTrigger` does `ArrowDown → state.toggle('first')`,
    `ArrowUp → state.toggle('last')`, and passes `autoFocus: state.focusStrategy || true`
    to the menu (react-spectrum `@react-aria/menu/src/useMenuTrigger.ts:79-92, 152`).
  - Standard: APG Menu Button — "Down Arrow: opens the menu and moves focus to the first
    item; Up Arrow (optional): opens and moves focus to the **last** item"
    (https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/ §Keyboard).
- Why: Compounds the finding above — even once focus movement is fixed, opening with
  ArrowUp will not land on the last item, and Enter/Space/ArrowDown won't deterministically
  start at the first item. Breaks the expected menu-button keyboard contract.
- Fix: Add a `focusStrategy` to the menu-trigger state; in `onKeyDown` open with `'first'`
  for Enter/Space/ArrowDown and `'last'` for ArrowUp; consume that strategy to set the
  initial `focusedKey`/autoFocus when the menu mounts.

### [High] FocusScope — scope contents are captured once on mount; dynamic children break containment & Tab-trap

- Evidence:
  - `packages/solidaria/src/focus/FocusScope.tsx:261-273` — scope elements are collected in
    a single `onMount` walk between the start/end sentinels and stored in `scopeElements`;
    there is **no `MutationObserver`** to refresh them. `getFocusableElements`
    (`FocusScope.tsx:96-117`) re-queries `querySelectorAll("*")` at call time, so the Tab
    handler (`FocusScope.tsx:325-349`) and `focusFirst`/`focusLast` operate on the live DOM
    of whatever top-level nodes existed at mount — but if the modal's content subtree is
    swapped/replaced (e.g. async content, route change, conditional first child), the
    captured top-level node set can go stale.
  - Standard: APG Dialog (modal) requires Tab/Shift+Tab to never leave the dialog and to
    wrap (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ §Keyboard); WCAG 2.1.2 No
    Keyboard Trap and 2.4.3 Focus Order assume a stable, complete tab ring.
  - Upstream `@react-aria/focus` re-walks via a TreeWalker against the scope ref on each Tab
    and observes tree changes, rather than snapshotting once.
- Why: For the common case (static modal subtree) this works. But when the contained subtree
  re-renders to a new root element after mount, the trap's first/last computation and the
  `focusin` recapture (`FocusScope.tsx:351-364`) can reference detached/stale nodes, allowing
  Tab to escape the modal or wrap incorrectly. Suspected-leaning, but the missing observer is
  a concrete structural gap vs. the standard's "focus stays in the dialog" guarantee.
- Fix: Recompute scope membership reactively (observe child mutations between the sentinels,
  or derive the focusable set from the sentinel range on each Tab/focusin rather than from a
  one-shot snapshot).

### [Medium] Modal — redundant ad-hoc scroll lock instead of `createPreventScroll` (layout shift; no iOS handling)

- Evidence:
  - `packages/solidaria-components/src/Modal.tsx:405-415` sets
    `document.documentElement.style.overflow = "hidden"` directly, rather than calling the
    purpose-built `createPreventScroll` (`packages/solidaria/src/overlays/createPreventScroll.ts`),
    which also adds `scrollbar-gutter`/`padding-right` compensation
    (`createPreventScroll.ts:54-72`) and the iOS Safari `touchmove` work-arounds
    (`createPreventScroll.ts:97-207`).
  - Standard: not a hard ARIA requirement, but WCAG 1.4.10 Reflow / 2.4.11 Focus Not
    Obscured are easier to violate when the page shifts under the modal, and iOS rubber-band
    scrolling lets background content move behind an `aria-modal`-style overlay.
- Why: On desktop the page content jumps by the scrollbar width when the modal opens
  (no gutter compensation); on iOS the background can still scroll/zoom behind the dialog,
  weakening the "outside is inert" contract that justifies omitting `aria-modal`.
- Fix: Replace the inline overflow toggle with `createPreventScroll({ isDisabled: () => !isOpen() })`.

### [Medium] Menu items — selectable roles applied to every item in a selectable menu

- Evidence:
  - `packages/solidaria/src/menu/createMenuItem.ts:147-156` — `role` is derived purely from
    the parent `selectionMode`: `single → menuitemradio`, `multiple → menuitemcheckbox`,
    else `menuitem`, and `aria-checked` is emitted for **every** item whenever
    `mode !== "none"`.
  - Standard: WAI-ARIA 1.2 — `menuitemradio`/`menuitemcheckbox` carry required `aria-checked`
    and convey a selectable control; plain action items in the same menu should remain
    `menuitem` (https://www.w3.org/TR/wai-aria-1.2/#menuitemradio,
    https://www.w3.org/TR/wai-aria-1.2/#menuitemcheckbox). APG models selection as per-section
    behavior, not a blanket menu-wide role swap.
- Why: A menu that mixes a selectable section with action items (e.g. a "View" radio group
  plus "Settings…"/"Help") will mislabel the action items as radios/checkboxes and announce a
  spurious checked/unchecked state for them, misrepresenting role and state to AT (4.1.2).
- Fix: Drive the item role/`aria-checked` from whether the item's owning section is selectable
  (per-section selection behavior), not from the whole menu's `selectionMode`.

### [Low] Toolbar / Disclosure / Breadcrumbs — confirm focus-visible meets WCAG 2.4.11/2.4.13

- Evidence: `createFocusRing`-based `data-focus-visible` is plumbed widely (e.g.
  `createOption.ts:188`, `createMenuItem.ts:163`), but the **visual** focus indicator
  (size/contrast/obscuring) is a style-layer concern not verifiable from the hooks alone.
  Standard: WCAG 2.2 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (Min), 2.4.13 Focus
  Appearance (https://www.w3.org/TR/WCAG22/#focus-appearance).
- Why: Out of this lane's code reach; flagged so a styling/visual pass confirms indicators
  aren't clipped by overflow containers (menus, popovers, toolbars) and meet the 2.4.13 area
  threshold.
- Fix: Visual verification in the comparison app per Rule #1 (axe is not enough).

---

## Confirmed-correct (spot-checked, no action)

- **ListBox / ComboBox** — `role="listbox"/"combobox"/"option"`, `aria-autocomplete`,
  `aria-activedescendant`, `aria-controls`, `aria-expanded`, `aria-multiselectable`, plus
  live-region count/focus/selection announcements and `ariaHideOutside`
  (`createListBox.ts:289-317`, `createComboBox.ts:241-328, 617-727`,
  `createOption.ts:166-194`). Activedescendant/id pairing matches for standalone ListBox.
- **ariaHideOutside** — TreeWalker-based, ref-counted, MutationObserver-watched, keeps
  `[data-live-announcer]`/top-layer visible, supports `inert` (`ariaHideOutside.ts:38-209`).
  This is what makes the deliberate `aria-modal` omission acceptable.
- **createPreventScroll** — scrollbar-gutter compensation + full iOS Safari handling
  (`createPreventScroll.ts`).
- **Dialog** — focuses container on mount, Safari VO re-focus work-around, `aria-labelledby`
  auto-wired to Heading id, trigger-id fallback (`createDialog.ts:60-127`, `Dialog.tsx:176-218`).
  Note: `aria-modal` intentionally omitted (matches upstream's documented Safari-bug rationale
  at `@react-aria/dialog/src/useDialog.ts:69-73`) and is sound **only because** Modal applies
  `ariaHideOutside([modalRef])` (`Modal.tsx:451-473`).
- **Tree (treegrid)** — `role="treegrid"/"row"/"gridcell"`, `aria-level/posinset/setsize`,
  `aria-expanded` only on expandable rows, `aria-multiselectable`, full Right/Left
  expand-collapse (RTL-aware), Up/Down/Home/End, `*` expand-siblings
  (`createTree.ts:63-241`, `createTreeItem.ts:177-251`). Expand button labeled via
  `aria-labelledby={expandButtonId rowId}`. (As a treegrid it must satisfy the Treegrid
  pattern, not Tree View — keyboard contract checks out.)
- **Table (grid)** — `role="grid"`, `aria-rowcount/colcount/rowindex/colindex`, `aria-sort`,
  2-D arrow navigation, column-resize keyboard (`createTable.ts:141-584`, `createTableCell.ts`,
  `createTableColumnHeader.ts:125-145`).
- **Tabs** — `tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, `aria-orientation`,
  roving `tabIndex`, panel `tabIndex=0` (`createTabs.ts:294-479`).
- **TagGroup** — `grid`(→`group` when empty)/`row`/`gridcell`, `Delete`/`Backspace` remove,
  remove button labeled `aria-labelledby={removeButtonId rowId}` (`createTag.ts:155-309`,
  `createTagGroup.ts:79-143`).
- **Tooltip** — `role="tooltip"`, trigger `aria-describedby`, Escape dismiss, hoverable bubble
  (WCAG 1.4.13: `isHovered` keeps it open) (`createTooltip.ts:62-63`,
  `createTooltipTrigger.ts:118-225`).
- **Toast** — `role="alertdialog"` container + `role="alert"`/`aria-live="assertive"`/
  `aria-atomic` content, `aria-modal="false"` (`createToast.ts:76-91`). Matches WCAG 4.1.3.

---

## Suspected (unconfirmed)

- **ComboBox listbox `aria-activedescendant` id mismatch** — `createComboBox.ts:648-649`
  builds `${listBoxId}-option-${focusedKey}`, but `createOption` defaults option `id` to
  `String(key)` (`createOption.ts:178`). Unless the ComboBox's ListBox passes a matching
  `optionId` to each option, the activedescendant points to a non-existent id and AT cannot
  track the active option. Needs confirmation of how `ComboBox.tsx` threads `optionId`.
- **Picker/Select active-option tracking** — Select reuses ListBox; if the popup ListBox is
  rendered with DOM focus inside it, confirm `aria-activedescendant` (not just roving) so the
  collapsed-then-expanded listbox announces the active option. Not traced end-to-end here.
- **FocusScope restore target** — restore uses `onCleanup` + rAF against the mount-time
  `nodeToRestore` (`FocusScope.tsx:376-388`); if the trigger unmounts with the overlay, focus
  may land on `<body>` (focus lost, WCAG 2.4.3). Upstream walks to a sensible fallback. Needs a
  live repro to confirm severity.
- **Menubar orientation** — `createMenu` always emits `role="menu"` with no `aria-orientation`
  override and no `menubar` path; if a horizontal Menubar is ever built on this hook, Left/Right
  navigation + `aria-orientation="horizontal"` would be missing. No menubar consumer found, so
  unverified.
