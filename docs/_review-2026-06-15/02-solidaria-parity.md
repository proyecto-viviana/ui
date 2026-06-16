# solidaria — React Aria parity audit (2026-06-15)

Scope: `packages/solidaria/src/**` (ARIA/interaction layer). Standard: AGENTS.md
Rules #1/#2/#4/#5/#7. Upstream truth: vendored `react-spectrum/packages/@react-aria/*`
(pinned ~3.27). Lane: **fidelity to react-aria's implementation** (not APG/WCAG —
agents 7/8 own that). Every claim cites our `path:line` + the upstream reference.

In-flight note: the working tree's menu changeset (`.changeset/menu-parity-followups.md`)
and the modified `Menu.tsx`/`ActionMenu.tsx` are **upper-layer** (solidaria-components /
solid-spectrum). The solidaria-layer menu gaps below are **NOT** touched by it
(`createMenu.ts`/`createMenuItem.ts` last changed in `ba12c76c`).

---

### [Critical] No `useSelectableCollection` / `useSelectableList` / `useSelectableItem` / `ListKeyboardDelegate` port — collection keyboard/focus/selection is reimplemented ad-hoc per widget

- Evidence: upstream centralizes ALL collection navigation in
  `react-spectrum/packages/@react-aria/selection/src/{useSelectableCollection,useSelectableList,useSelectableItem,ListKeyboardDelegate,DOMLayoutDelegate}.ts`, and
  `useMenu` (`@react-aria/menu/src/useMenu.ts:57`), `useListBox`, `useGridList`,
  `useTable`, `useTree` all delegate to `useSelectableList`. Our
  `packages/solidaria/src/selection/index.ts` exports **only** `createTypeSelect`;
  there is no `createSelectableCollection`/`...Item`/`ListKeyboardDelegate`
  (`rg "SelectableCollection|SelectableItem|ListKeyboardDelegate" packages/solidaria/src` → nothing).
  Instead, `createMenu.ts:201-406` and `createListBox.ts:193-...` hand-roll
  ArrowUp/Down/Home/End/PageUp/Down inline on the container; `createMenuItem.ts`
  and `createOption.ts` each re-derive item press/focus logic separately.
- Why: Rule #4 (behavior must live in the lowest shared layer) and Rule #5
  (this is patch-as-structure #50 — fifty copies of navigation, one per widget,
  instead of the one delegate that upstream proves parity with). Guarantees drift:
  any keyboard fix must be applied N times; widgets already diverge (below).
- Fix: port `ListKeyboardDelegate` + `useSelectableCollection`/`useSelectableList`/
  `useSelectableItem` into `packages/solidaria/src/selection/`, then make menu,
  listbox, select, gridlist, tree consume them. This is the structural root of most
  findings here.

### [Critical] Collection arrow navigation has no RTL flipping; `getKeyRightOf`/`getKeyLeftOf` semantics are absent

- Evidence: upstream `useSelectableCollection.ts:125` reads `let {direction} = useLocale()`
  and at `:202-223` flips ArrowLeft/ArrowRight via `delegate.getKeyLeftOf/getKeyRightOf`
  with `direction === 'rtl'` first/last fallbacks. Our inline handlers in
  `createMenu.ts:211-405` and `createListBox.ts:193-...` only implement ArrowDown/Up/
  Home/End and never consult `useLocale().direction`. `ListKeyboardDelegate`'s
  `getKeyRightOf = direction === 'rtl' ? getKeyAbove... ` flipping is gone.
- Why: Rule #2 — silent drift of real keyboard maps. RTL users get wrong/no
  horizontal navigation in any collection that should support it (orientation
  `horizontal` menus, action groups).
- Fix: comes free once the delegate is ported with the `direction` parameter (above).

### [Critical] `createMenuItem` does not own Enter/Space activation or keyboard-vs-pointer close logic — it has no keyboard handler at all

- Evidence: upstream `useMenuItem.ts` gives the **item** a `useKeyboard` handler that
  on `' '`/`'Enter'` records `interaction.current = {pointerType:'keyboard', key}` then
  calls `target.click()` (`useMenuItem.ts` Space/Enter cases), and its `onClick`
  computes `shouldClose` from `interaction.current.key === 'Enter' || selectionMode==='none' || isLink` vs multi-select. Our `createMenuItem.ts` has **no** keyboard
  handler (`rg "click\(\)|keyboardProps|interaction" createMenuItem.ts` → none); it
  relies on the container's inline handler `createMenu.ts:254-267`, which closes on
  **both** Space and Enter identically (`if (p.shouldCloseOnSelect !== false) onClose()`).
- Why: Rule #1/#2 — observable behavior diverges: upstream keeps a multi-select menu
  **open** on Space (toggle) and closes on Enter; ours closes on both. Selection of
  the focused item also bypasses the item's own press path.
- Fix: move activation onto the item (port the `useKeyboard` + `interaction.current`
  close-decision logic), ideally via the shared selectable-item hook.

### [Critical] `createMenuItem` drops `useSelectableItem`, `onPressUp` mouse drag-release, virtualization, submenu-trigger, and `aria-describedby` join

- Evidence vs `useMenuItem.ts`:
  - No `useSelectableItem({shouldSelectOnPressUp:true, allowsDifferentPressOrigin:true, linkBehavior:'none'})` — our item selects in `onPress` (`createMenuItem.ts:99-117`) on press-down semantics, not the menu's press-up + different-origin model.
  - No `onPressUp` "mouse-down on trigger, drag, release over item" path (`useMenuItem.ts` onPressUp → `e.target.click()` when `!isPressedRef.current`).
  - Virtualization missing: upstream sets `aria-posinset`/`aria-setsize` when `isVirtualized` (`useMenuItem.ts`); ours never does.
  - Submenu/trigger props missing: `aria-haspopup`/`aria-expanded`/`aria-controls`, `isTriggerExpanded` tabIndex=-1, and `onMouseDown: e=>e.preventDefault()` for virtual-focus/trigger (`useMenuItem.ts` return block). Ours has none.
  - `aria-describedby` is hardcoded to the description id only (`createMenuItem.ts:158`), but upstream joins `[descriptionId, keyboardId]` so the keyboard-shortcut text is announced.
  - IDs are non-unique/colliding: `${key}-label` etc. (`createMenuItem.ts:134-136`) instead of `useSlotId()`; two menus with the same key collide.
- Why: Rule #1/#2. Multiple observable a11y/behavior regressions.
- Fix: rebuild `createMenuItem` against `useMenuItem.ts` once the selectable-item hook exists.

### [Critical] FocusScope has no nested-scope tree — containment, `shouldContainFocus`, and restore are flat and will fight across stacked overlays

- Evidence: upstream `FocusScope.tsx` (1039 lines) maintains a global
  `focusScopeTree` of `TreeNode`s, an `activeScope`, `shouldContainFocus(scopeRef)`
  (`FocusScope.tsx:286`, only the innermost active scope contains), `isElementInChildScope`,
  and a custom `RESTORE_FOCUS_EVENT` to coordinate restore between parent/child scopes
  (`FocusScope.tsx:351,385,412,470`). Our `FocusScope.tsx:316-373` containment is a
  flat `document` `focusin`/`keydown` that only knows its own `scopeElements()` and has
  no concept of an active/innermost scope or child scopes.
- Why: Rule #2/#5. With stacked overlays (menu → dialog, dialog → popover) both scopes
  contain simultaneously and the outer one yanks focus back from the inner — broken
  containment. Restore order across nesting is also undefined.
- Fix: port the `focusScopeTree`/`activeScope`/`shouldContainFocus` machinery and the
  restore-event coordination.

### [High] FocusScope tab-containment ignores radio-group/visibility nuances and uses `querySelectorAll('*')` instead of a focusable TreeWalker

- Evidence: upstream uses `getFocusableTreeWalker` (a `createShadowTreeWalker` over a
  `FOCUSABLE_ELEMENT_SELECTOR` with `isElementVisible`/shadow-DOM handling,
  `FocusScope.tsx:13-24,513-521`) and on Tab at the boundary walks the **whole document**
  to move focus to the next tabbable outside when not containing. Ours
  (`FocusScope.tsx:96-117`) collects via `scopeElement.querySelectorAll("*")` filtered by
  `isFocusable`, and its `isTabbable` (`FocusScope.tsx:79-91`) only checks `tabindex`,
  missing radio-group "only the checked/first radio is tabbable" and visibility/`inert`
  filtering that upstream's walker applies.
- Why: Rule #2. Tab order inside dialogs with radios/hidden elements diverges; perf and
  shadow-DOM correctness regress.
- Fix: port `getFocusableTreeWalker` + `isElementVisible` and the radio-tabbable rules.

### [High] FocusScope `autoFocus`/scope-collection runs once in `onMount`; dynamic children added later are never in scope

- Evidence: `FocusScope.tsx:261-273` collects sibling nodes between sentinels in a single
  `onMount`, and `setScopeElements` is never recomputed. Upstream recomputes the node list
  in a `useLayoutEffect` and, more importantly, drives containment off live DOM walks, so
  late-mounted content participates. SolidJS conditional/`<Show>` children that appear after
  mount won't be contained, tabbable, or auto-focusable.
- Why: Rule #2; common with async dialog content.
- Fix: recompute scope membership reactively (e.g. re-walk on a signal/`MutationObserver`)
  or, per upstream, walk the live DOM at use time rather than caching a node array.

### [High] `usePress`→`createPress`: manual fallback click uses `target.focus()` (scrolls) instead of `focusWithoutScrolling`

- Evidence: our `createPress.ts:369` calls `pressState.target.focus()` in the 80ms
  click-recovery path; upstream calls `focusWithoutScrolling(state.target)`
  (`usePress.ts` onPointerUp timeout, `focusWithoutScrolling` imported from `@react-aria/utils`).
  `focusWithoutScrolling` exists in solidaria (`utils/focus.ts`, mangled `n`) but isn't used here.
- Why: Rule #2. Pressing a button inside a scroll container can jump the scroll position —
  the exact bug `focusWithoutScrolling` was added to prevent.
- Fix: replace with `focusWithoutScrolling(pressState.target)`.

### [High] `createPress.onClick` omits the `openLink.isOpening` guard

- Evidence: upstream guards the click handler with
  `if (e && e.button === 0 && !state.isTriggeringEvent && !(openLink as any).isOpening)`
  (`usePress.ts` pressProps.onClick). Ours (`createPress.ts:789`) has only
  `e.button === 0 && !pressState.isTriggeringEvent`. `openLink` sets the `isOpening`
  flag in solidaria too (`utils/dom.ts`, mangled `(n as ...).n = true`), so the guard is
  available but unused.
- Why: Rule #2. During programmatic link navigation a re-entrant click can be
  double-processed (double press / double activation) on link items.
- Fix: add `&& !(openLink as any).isOpening` to the onClick condition.

### [High] `mergeProps` does not merge `id` via `mergeIds` — last id silently wins

- Evidence: upstream `@react-aria/utils/src/mergeProps.ts` has a branch
  `else if (key === 'id' && a && b) { result.id = mergeIds(a, b); }`. Our
  `utils/mergeProps.ts:40-64` handles `on*` chaining, `class`/`style`, getters — but has
  **no** `id` case (and `rg mergeIds packages/solidaria/src` → nothing). When two hooks
  each supply an `id`, the later overrides; upstream instead registers an alias so existing
  `aria-labelledby`/`aria-describedby`/`for` references that pointed at the first id keep
  resolving.
- Why: Rule #2. Breaks label/description wiring whenever two layered hooks both set `id`
  (a real pattern in field/label composition).
- Fix: port `mergeIds`/`useId` alias registry and add the `id` branch to `mergeProps`
  (also `ref` merge — upstream merges refs; ours drops one).

### [Medium] Menu PageUp/PageDown is a bespoke DOM-measuring loop, not the delegate's `getKeyPageAbove/Below`

- Evidence: `createMenu.ts:273-404` measures `el.clientHeight` and per-item
  `clientHeight ?? 32` with a hardcoded `DEFAULT_PAGE_SIZE = 10` fallback. Upstream routes
  PageUp/Down through `ListKeyboardDelegate.getKeyPageAbove/Below` (DOM rect math in
  `DOMLayoutDelegate`), shared with every collection. The "32px" and "10-item" magic numbers
  are invented (Rule #2: don't invent sizes).
- Why: Rule #2/#5. Divergent page-jump distances vs upstream; magic constants.
- Fix: delete and use the ported delegate's page methods.

### [Medium] Menu `onAction` precedence differs from upstream `performAction`

- Evidence: upstream `useMenuItem.ts` `performAction()` calls **either**
  `item.props.onAction` **or** `props.onAction(key)` (item wins), **then** `data.onAction(key)`.
  Ours (`createMenuItem.ts:106-116`) always calls `p.onAction?.()` (no key arg — signature
  drift vs upstream `onAction(key)`) **and** `data?.onAction?.(key)`, with no item-vs-prop
  precedence and no `isTrigger` guard (triggers must not perform an action).
- Why: Rule #2. Double-fires / wrong-arg `onAction`; submenu triggers wrongly activate.
- Fix: mirror `performAction` precedence and the `isTrigger` early return.

### [Medium] `createInteractOutside` adds an undocumented local behavior: `[data-solidaria-top-layer]` opt-out

- Evidence: `overlays/createInteractOutside.ts:148-150` treats any target inside
  `[data-solidaria-top-layer]` as "not outside". Upstream `useInteractOutside.ts` has no such
  attribute; its `isValidEvent` only checks button + document-containment + (in newer
  versions) `data-react-aria-top-layer`. If this mirrors the upstream top-layer attribute it
  should use the same name; if it's Viviana-specific it must be marked a **local addition**.
- Why: Rule #2 (Solid-only additions must be explicit + documented; silent additions = drift).
- Fix: confirm against upstream's top-layer handling; rename to match or document as a local
  addition in the file + CREDITS/notes.

### [Medium] Source files in solidaria are name-mangled, undermining the "1-1 mirror" claim

- Evidence: `utils/focus.ts` exports `export function n(...)` / `export const focusSafely = n`;
  `utils/dom.ts` has `export function n(target...)` with `(n as {n?:boolean}).n = true`;
  `grid/GridKeyboardDelegate.ts` and `index.ts` reference `Gridn`, `type n`. These are
  minifier-collapsed identifiers committed as source.
- Why: Rule #2/#6 — the repo's premise is "read upstream and copy structure"; mangled source
  makes faithful comparison and maintenance effectively impossible and hides drift.
- Fix: restore meaningful identifiers (`focusWithoutScrolling`, `openLink`,
  `GridKeyboardDelegate`, `KeyboardDelegate`) matching upstream names.

---

## SolidJS idiom & reactivity

### [Medium] FocusScope effects can't re-run their setup when `contain`/`autoFocus`/`restoreFocus` props change reactively

- Evidence: `FocusScope.tsx:300-373` read `props.autoFocus`/`props.contain` at the top of a
  `createEffect` and early-`return` when falsy, but the `restoreFocus` capture
  (`:276-297`) and scope collection (`:261-273`) are in `onMount` (run-once). Upstream uses
  per-prop layout effects keyed on `[contain]` etc. Toggling `contain` from false→true after
  mount won't (re)install the containment listeners because the effect's only reactive dep is
  `scopeElements()`, not `props.contain` (it's read but the early-return already happened on
  first run with the initial value pattern is fine, but `restoreFocus` set in onMount can't
  react to becoming true later).
- Why: Solid reactivity correctness; dynamic overlay props.
- Fix: read each prop inside the effect so it's a tracked dependency (Solid tracks property
  access on the props proxy), and avoid `onMount` for behavior that must respond to prop flips.

### [Low] `createMenu` `menuData` WeakMap is set during render AND in an effect with cleanup that deletes on every effect re-run

- Evidence: `createMenu.ts:151` calls `updateSharedData()` eagerly, then `:154-160` repeats it
  in a `createEffect` whose `onCleanup` does `menuData.delete(state)`. On any tracked change the
  cleanup deletes the entry before the next run re-adds it; a child `createMenuItem` reading
  `getMenuData(state)` in that window (e.g. during the same flush) can observe `undefined`.
  Upstream stores once via module-level `menuData.set` in `useMenu` body (no delete churn).
- Why: Solid store/effect ordering; transient `undefined` reads.
- Fix: set once (render body) and delete only in a top-level `onCleanup`, not on every effect
  re-run.

### [Low] `injectPressableCSS()` / `linkClickedSet` are module-global side effects without SSR/cleanup symmetry

- Evidence: `createPress.ts:91-103` injects a `<style>` once per module and never removes it;
  `linkClickedSet` (`:87`) is a module WeakSet. These match upstream's module-level `STYLE_ID`
  approach so behavior is fine, but the injected style id `solidaria-pressable-style` plus the
  attribute rename `data-solidaria-pressable` (`:871`) are intentional renames of upstream's
  `react-aria-pressable-style` / `data-react-aria-pressable` — fine, but note them as local
  naming so cross-refs don't assume the upstream attribute.
- Why: Rule #2 naming traceability (low risk).
- Fix: none required; document the rename.

---

## Suspected (unconfirmed)

- **Combobox keyboard likely bypasses the (missing) selectable-collection delegate.**
  `combobox/createComboBox.ts` is 727 lines vs upstream 435 and handles ArrowUp/Down inline
  (`:430,463`) with its own announcer (`:257-305`). It plausibly re-implements listbox
  navigation rather than delegating, repeating the Critical structural pattern — but I did not
  line-diff the full key map (Esc revert/commit, `focusStrategy` first/last, PageUp/Down,
  Tab-commit) against `useComboBox.ts`. Needs a dedicated pass.
- **`createListBox` Home/End/typeahead may not handle `disabledBehavior:'selection'` vs
  `'all'`.** Inline handlers at `createListBox.ts:193+` skip disabled keys unconditionally;
  upstream `ListKeyboardDelegate` respects `disabledBehavior` so "disabled-but-focusable" items
  remain navigable. Unverified.
- **`createMenuTrigger` autofocus first/last via `focusStrategy`.** Only ArrowDown/ArrowUp seen
  at `createMenuTrigger.ts:52,59`; whether it sets the menu's initial `focusedKey` to first
  (ArrowDown) vs last (ArrowUp) per upstream `useMenuTrigger` was not confirmed.
- **`mergeProps` event-chain key test** `key[2] === key[2]?.toUpperCase()` (`mergeProps.ts:44`)
  — correctly excludes lowercase letters, but for non-letter third chars (digits/symbols) it is
  truthy and could chain a non-handler `on…` prop. Upstream uses explicit char-code range
  `65..90`. Low risk; unverified that any such prop exists.
