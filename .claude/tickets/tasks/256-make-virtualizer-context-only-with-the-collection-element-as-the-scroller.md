---
id: 256
type: task
title: "Make Virtualizer context-only with the collection element as the scroller, as RAC does"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "surfaced by #252: the S2 ComboBox/Picker wrap had to sit inside the popover because the Solid Virtualizer renders DOM; the harness already compensates for the extra scroller",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "RAC split landed: Virtualizer is context-only; CollectionRoot owns createScrollView against the collection element; harness ancestor-scroller compensation deleted. ComboBox/Picker Popover > Virtualizer > ListBox wrap-order is deferred to the concurrent S2 overlay lane.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "#260 dnd-listbox functional pass reconfirmed D-reorder red and did not waive it. After Enter, Solid active is listbox:Permissions vs React option:Insert between Read and Write; AX also shows duplicate Insert between Read and Write / Insert between Write and Admin. Single-item drop order still matches once Enter is pressed on the (unfocused) drop target. Multi-item keys/description is #332, not this ticket.",
    }
---

## Cause

RAC's `Virtualizer` renders no DOM
(`react-aria-components/src/Virtualizer.tsx:71-95`: two context providers
around `children`). The collection element itself — `<div role="listbox">`,
the grid, the table — is the scroll container (`scrollRef` is the collection
ref), and `CollectionRoot` (`:100-150`) renders one inner
`<div {...contentProps}>` from `useScrollView` for content sizing. S2 can
therefore wrap `Popover > Virtualizer > ListBox` (`s2/ComboBox.tsx:796-817`,
`Picker.tsx:457-521`) and the listbox is still the scroller users and
assistive tech see.

The port's `Virtualizer` (`packages/solidaria-components/src/Virtualizer.tsx:864-890`)
renders `<div data-virtualizer>` (the scroll container it measures) plus
`<div data-virtualizer-content>` **around** its children, so:

- Two extra DOM nodes appear above the collection element; the collection
  element is not the scroller. Every D13 `dom` observation and `list.scrollTop`
  read (#244) diffs here, and `aria-hidden` sibling counts differ.
- #252 could not mirror S2's `Popover > Virtualizer > ListBox` order: wrapping
  outside the popover shifted hydration keys, so the wrap sits inside the
  popover around the listbox (`solid-spectrum/src/combobox/index.tsx:1031-1055`,
  `picker/index.tsx:1112-1137`).
- The harness already patches around it: `apps/comparison/e2e/drivers/scroll-window.ts:66-73`
  looks for a `[data-virtualizer]` **ancestor** scroller because "our port wraps
  the listbox". That is verification code compensating for a structural
  divergence — the thing Rule #4 forbids.

## Work

- Port the RAC split: `Virtualizer` becomes context-only
  (`CollectionRendererContext` + `VirtualizerOptionsContext`); the
  virtualized `CollectionRoot` owns `useVirtualizerState` + `useScrollView`
  against the collection element ref and renders the single content div
  (`Virtualizer.tsx:100-150`). Read the port's current `useScrollView`
  equivalent and `ListBox.tsx:763-810` (the existing virtualizer consumer) so
  every collection (ListBox, GridList, Table, Tree, Menu if applicable) goes
  through the same root.
- Move the ComboBox/Picker wrap outside the popover, in S2's order, once the
  DOM shape allows it; keep the layout options from #252 unchanged.
- Delete the ancestor-scroller compensation in `scroll-window.ts` and any
  `[data-virtualizer]` selector in `apps/comparison/e2e/**` and
  `apps/comparison/src/**`; the harness targets the collection element as
  RAC's does.
- Tests: the collection element is `scrollHeight > clientHeight` scroller and
  its `scrollTop` moves on keyboard navigation; no `[data-virtualizer]` node
  exists; hydration keys unchanged (`vp run test:hydrate`); the virtualizer
  keyboard guard (#205) unchanged.

## Done when

`rg -n "data-virtualizer" packages apps` returns nothing; D13 seed journeys on
ComboBox and Picker (#244) show no extra wrapper nodes in the `dom` diff and
`list.scrollTop` matches React; certified ListBox/GridList/TableView/TreeView
counts unchanged or better; #205 guard green.

## Relationship

Child of #136. Follows #252 (which lands the S2 wrap in the only order the
current DOM allows). Blocks the `list` observation rows of #245/#246 and the
scroll journeys in `apps/comparison/playbook/journeys/*.md`.

## Landed

Pin `f56660b` / RAC 1.21.0 / S2 1.7.0.

### Upstream → Solid

- RAC `Virtualizer` context-only, no DOM (`react-aria-components/src/Virtualizer.tsx:71-96`) → `packages/solidaria-components/src/Virtualizer.tsx:797-815` (`CollectionRendererContext` + `VirtualizerContext` + `VirtualizerOptionsContext` + scroll runtime around `children`).
- RAC virtualized `CollectionRoot` (`Virtualizer.tsx:99-151`: `useVirtualizerState` + `useScrollView(…, scrollRef)` + `<div {...contentProps}>`) → `Virtualizer.tsx:829-894` (`createScrollView` against `scrollRef` + content padding from `getVisibleRange` / persisted keys).
- RAC `useScrollView` (`react-aria/src/virtualizer/ScrollView.tsx:70-404`; `contentProps` `:400-403`; `pointerEvents: isScrolling ? 'none'` `:389`) → `packages/solidaria/src/virtualizer/ScrollView.ts:66-183` (`createScrollView`; `contentProps` `:171-178`).
- RAC collections pass `scrollRef` = collection ref: ListBox `:429`, GridList `:455`, Table `:921` / `:507`, Tree `:650`, Menu `:159` / `:397` → ListBox `:912-915` (`listRef`), GridList `:664-667` (`ref`), Table `:1345-1348` (`context.getScrollElement()`, `:873`), Tree `:1379-1382` (`ref`), Menu `:1237-1240` (`menuRef`).
- RAC `CollectionRootProps.scrollRef` (`Collection.tsx:183`) → `packages/solidaria-components/src/Collection.tsx:165-172` + `useCollectionRoot` `:206-209`.
- Content `pointer-events: none` while scrolling: RAC `ScrollView.tsx:389` → `ScrollView.ts:176`.
- Window scrolling: RAC `allowsWindowScrolling: true` (`Virtualizer.tsx:109,140`) → `createScrollView({ allowsWindowScrolling })` `Virtualizer.tsx:835`.
- Virtualized table is a `div` host (RAC `Table.tsx` TableElementType): `Table.tsx:144-155` `TableHost`.
- S2 sizes/overflows the **collection** as the scroller (`s2/ListView.tsx:202` `overflow: auto`, `TableView.tsx:260`, `TreeView.tsx:201`, `CardView.tsx:202` `overflowY`). solid-spectrum / viviana-ui twins already overflow the collection; **no styled-layer edits**. NEW forks 0.

CollectionRoot is rendered **only when** `parentCollectionRenderer?.isVirtualized` (Table: `context.isVirtualized`). Default CollectionRoot as a component still shifts SSR hydration keys; non-virtualized ListView/Tree keep the HEAD fragment/For tree.

### Deleted wrapper / compensation

- `Virtualizer` `<div data-virtualizer>` + `<div data-virtualizer-content>` (was `Virtualizer.tsx:864-890`).
- Harness ancestor/descendant `findScroller` (`apps/comparison/e2e/drivers/scroll-window.ts` HEAD `:66-73` and inlined copies). The collection element is the scroller. RAC's inner div is `contentProps`, not overflow — no descendant-scroller branch.

### Tests

- `renders no wrapper DOM around children`
- `uses the collection element as the scroller with RAC listbox > content > items shape`
- `publishes option aria-posinset and aria-setsize for the full collection when windowed`
- `keeps heading and loader row heights in CollectionRoot content padding`
- `disables content pointer events while scrolling and restores after the debounce`
- `pads the CollectionRoot content div along the inline axis when the layout is horizontal`
- `vp run test:ssr` then `vp run test:hydrate`

Red-then-green: `git restore` forbidden, so the wrapper-present tree was not remounted. The new assertions `expect(container.querySelector("[data-virtualizer]")).not.toBeInTheDocument()` are red if that node exists and green on this tree (`Virtualizer.test.tsx` included in 5001 passed). Hydrate **was** remounted red then green in this session:

Red (CollectionRoot wrapping non-virtualized ListView/Tree):

```
FAIL |hydrate| packages/viviana-ui/test/Collections.hydrate.test.tsx
Error: Hydration Mismatch. Unable to find DOM nodes for hydration key: 0000000000101000100100001
❯ packages/solidaria-components/src/GridList.tsx:827
FAIL |hydrate| packages/viviana-ui/test/Tree.hydrate.test.tsx
Error: Hydration Mismatch. Unable to find DOM nodes for hydration key: 000000000011210010000030
❯ Object.get children packages/solidaria-components/src/Tree.tsx:1665
```

Green (CollectionRoot only when virtualized; `vp run test:ssr` then `vp run test:hydrate`):

```
Test Files  12 passed (12)
Tests  28 passed | 1 expected fail (29)
```

### Deferred

ComboBox/Picker wrap-order (`Popover > Virtualizer > ListBox`, S2 `ComboBox.tsx:796-817` / `Picker.tsx:457-521`) is **not** this lane. Concurrent agents own `packages/solid-spectrum/src/{combobox,picker,menu,tabs,popover}/**`. This DOM shape is the prerequisite; the wrap move follows.

- Orchestrator (2026-09-02): nothing to move. S2's own order is
  `Popover > div > Provider > Virtualizer > ListBox` — the Virtualizer sits
  _inside_ the popover — and that is already what
  `solid-spectrum/src/combobox/index.tsx` (`ComboBoxListBoxPopover >
FormContext.Provider > Virtualizer > HeadlessComboBoxListBox`) and the
  Picker render after #252/#257. The "outside the popover" wording in
  `## Work` described a #252 experiment that was never S2's shape; the item is
  closed. The remaining S2 deltas in that block (the `display:flex; size:full`
  div and `renderEmptyState` on the ListBox instead of a sibling `<Show>`) are
  #248 step-0 / #254 territory.

### Remaining `data-virtualizer` string hits

Negative test assertions (`Virtualizer.test.tsx:32,59`); unused `data-virtualizer-spacer` attrs on the **non-virtualized** branch (`virtualRange()` is null, they never mount); historical `CHANGELOG.md`. No harness selector. No wrapper node.

- Orchestrator (2026-09-02): the dead `data-virtualizer-spacer` blocks and the
  two unused `virtualSpacerStyle` helpers were deleted from ListBox, GridList,
  Tree and Menu (the non-virtualized arm can never see a range). `rg -n
"data-virtualizer" packages apps` now returns only the negative assertions
  and CHANGELOG history.

### Wave-3 regression fix

Certified failures after #256 (`52ab0c52`) / comparison wave-3. DnD is **not** a #248 (`1d988fd9`) or #229 (`e97bb6f2`) ListBox a11y regression — the drop-indicator focus trail broke in the DragManager / collection-register / item-remount path below.

#### D-scroll window (fixed)

- **Root cause:** RAC Virtualizer is context-only (`react-aria-components/src/Virtualizer.tsx:71-151`). After the wrapper DOM was removed, leftover Virtualizer `class`/`style` were dropped. Comparison fixtures still put `height`/`overflow` on Virtualizer, so `createScrollView` (`packages/solidaria/src/virtualizer/ScrollView.ts`, RAC `react-aria/src/virtualizer/ScrollView.tsx`) measured an unconstrained listbox and `virtualRange()` never windowed (Solid rendered posinset 1..60).
- **Fix:** Viewport first-paint in `ScrollView.ts` `createRenderEffect` (RAC layout effect). Style the collection (RAC + React fixture), not Virtualizer. The `class`/`style` context shim was deleted in the close-out session.
- **Test:** `packages/solidaria-components/test/Virtualizer.test.tsx` — `"windows from the collection element's measured size when the collection is the scroller"`.
- **Certified:** `e2e/certified/virtualizer.certified.spec.ts` D-scroll **passed**.

#### D-reorder keyboard DnD (partial — remaining certified fail)

- **Root cause (mount, fixed):** RAC `isDropTarget(target)` is a per-target predicate (`useDroppableCollectionState.ts:207`). Port `isDropTarget` is a collection-level boolean (`createDroppableCollectionState.ts:458`) that keyboard `setTarget` never flips. `useRenderDropIndicator` gated on that boolean → no indicator. **Fix:** `DragAndDrop.tsx` `useRenderDropIndicator` also matches `state.target`.
- **Root cause (register, fixed):** Nested `ListBoxDropIndicator` remounted every parent re-render and `onCleanup(unregister)` emptied `dropItems`. **Fix:** module-level `ListBoxDropIndicatorWrapper` + `createDropIndicator.ts` (RAC `useDropIndicator.ts`) + `createDroppableItem.ts` register/focus (RAC `useDroppableItem.ts:49-88`).
- **Root cause (isInternal race, fixed):** RAC `useDraggableCollection.ts:29-32` sets `globalDndState.draggingCollectionRef` during render before `beginDragging`. The port's `createDraggableCollection` `createEffect` could write `null` or clear the ref before DragManager rAF `setup()`, so `isInternal` was false, `onReorder` canceled, and the collection dropped out of `validDropTargets` — `onFocus` then focused `listbox:Permissions`. **Fix:** stamp dragging collection ref + keys in `createDraggableItem` `onKeyUp` before `beginDragging`; do not overwrite with a null ref; skip the clear while `isVirtualDragging()`. `createDroppableCollection` register effect untracks `collection` (RAC effect deps `[localState, ref, onDrop, direction]`). DragManager matches `currentDropTarget` by element, not object identity (`DragManager.ts:421`). `createSelectableCollection` `onFocusOut` restore is skipped during a virtual drag.
- **Root cause (option remount, remaining in Chromium comparison):** After Enter, Solid's dragged `Read` option is a **new DOM node** (`sameNode: false`); React's is stable. `ariaHideOutside({shouldUseInert:true})` keeps `dragTarget.element` (the disconnected node) and **inerts the new Read**. Chromium then maps focus off the indicator onto `listbox:Permissions`. jsdom keeps the node (`document.getElementById("read")` identity assertion). Comparison fixture uses hyperscript `hc(ListBoxOption)` as `children`; a `For` item template that re-runs still remounts that option. Added `ListBoxItemWithDropIndicators` so indicator mount is a sibling computation (RAC ListBoxItem stays mounted while Collection inserts indicator siblings). **Comparison still remounts the option after Enter** — remaining certified fail.
- **Tests:**
  - `ListBox.test.tsx` — `"moves DOM focus to the insert-between drop indicator after Enter starts a keyboard drag"` (indicator `data-drop-target`, polite live `"Insert between Read and Write"`, option node identity via `id="read"`).
  - `createDroppableCollection.test.tsx` — `"does not re-register the DragManager drop target when collection identity changes"`.
- **Certified (preview `:4341`, `COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`):** 27 passed / **2 failed** (both D-reorder trails) / 1 skipped. Failures: after Enter, Solid `active` is `listbox:Permissions` vs React `option:Insert between Read and Write`.

#### Gates (verbatim)

```
vp test run packages/solidaria-components packages/solidaria
  Test Files  162 passed (162)
  Tests  3918 passed | 6 skipped (3924)

vp run typecheck
  pass (tsc --noEmit -p tsconfig.typecheck.json)

vp run test:ssr
  Test Files  12 passed (12)
  Tests  26 passed (26)

vp run test:hydrate
  Test Files  12 passed (12)
  Tests  28 passed | 1 expected fail (29)

vp run guard:layer-boundary
  NEW forks 0
  PASS: no new Spectrum forks into viviana-ui

vp run guard:virtualizer-keyboard-parity
  PASS (oracle walk checks)

vp run guard:upstream-test-parity
  count delta vs baseline: suspects 155 → 157 (Δ+2), coverageGaps 47 → 47 (Δ0), upstreamOnly 18 → 18 (Δ0)
  New suspect facts:
    - listbox|aria|aria-hidden
    - listbox|aria|aria-live
  (did not write baseline)

vp run guard:attribution-headers
  report only; mismatches:
    - packages/solidaria/src/dnd/createDropIndicator.ts
    - packages/solidaria/src/dnd/createDroppableItem.ts
    - packages/solidaria/src/dnd/index.ts
    - packages/solidaria/src/index.ts
  (orchestrator re-records reviewed-local hashes)

vp check --fix <owned files>
  pass

git diff --check
  pass
```

#### Orchestrator (close-out session, 2026-09-02 16:20)

- Deleted the `class`/`style` Virtualizer context shim. RAC `VirtualizerProps`
  has neither (`Virtualizer.tsx:44-55`); the React comparison fixture already
  styles the ListBox. Solid fixture and unit tests now do the same. Viewport
  first-paint stays in `ScrollView.ts` `createRenderEffect` (RAC layout
  effect `:305-315`).
- Re-recorded reviewed-local hashes for `packages/solidaria/src/index.ts` and
  `dnd/index.ts` (re-export-only `createDropIndicator` / `getDroppableCollectionRef`).
  `vp run sync:attribution-headers` for the new exact file. Guard green.
- Absorbed ratchet growth `--write-baseline --allow-growth 256`:
  `listbox|aria|aria-hidden` (RAC `useDropIndicator.ts:110-118`) and
  `listbox|aria|aria-live` (RAC `DragManager.ts:599` `announce(label, 'polite')`).
- Changeset `.changeset/virtualizer-dnd-first-paint.md`.
- DnD remaining (unchanged): comparison hyperscript remounts the dragged option
  after Enter so Chromium maps focus to `listbox:Permissions`. Unit tests pass;
  certified D-reorder still needs the host node to stay mounted.

#### Orchestrator (close-out, 2026-09-02 19:55)

Certified against preview `:4341` (`COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer`):

- Virtualizer D-scroll window + focus retention: **green**.
- ListBox / GridList / TableView / TreeView certified in the same run: **green**
  (27 passed / 1 skipped with the two D-reorder fails below).
- D-reorder keyboard DnD (2): still **red**. After Enter, Solid `active` is
  `listbox:Permissions` vs React `option:Insert between Read and Write`.
  Isolated the option render (`ListBoxRenderedItem` + `untrack` thunk
  instantiate; comparison fixture uses `createComponent` not `hc`). Unit
  `getElementById("read") === read` passes for JSX and one-shot thunks.
  `createRenderEffect` register/focus hung unit tests (focus retriggers the
  flush) — left `createEffect` + rAF. Remaining cause is DragManager
  focus vs `ariaHideOutside` timing, not the Virtualizer scroller.

#### SSR hydration of a virtualized ListBox (PR #33 lane, 2026-09-02 19:30)

Found while repairing `apps/web` `docs/components/virtualizer.tsx` for the
context-only Virtualizer (the page still passed `class`/`style` to
`Virtualizer` → `typecheck:apps` red). The rewritten page — `Virtualizer >
ListBox` with List / Grid / Waterfall layouts, styled on the ListBox — threw
`Hydration Mismatch` in the route error boundary on first load. "Hydration
keys unchanged (`vp run test:hydrate`)" above held only because no hydrate
fixture mounted a Virtualizer or an option with element children. Two causes,
both below the docs page:

- **Scroll view measures mid-walk** (`packages/solidaria/src/virtualizer/ScrollView.ts`).
  RAC `useScrollView` initializes the viewport in `useLayoutEffect`
  (`ScrollView.tsx:305-315`); React runs that after the hydrated commit. Solid
  runs `createRenderEffect` while `sharedConfig.context` is still live, so the
  0-height server window (3 overscan rows) widened to the client viewport
  during the walk and the new rows called `getNextElement` for nodes the
  server never emitted. **Fix:** the render effect skips the first emit while
  `sharedConfig.context && !sharedConfig.done` (dom-expressions
  `isHydrating()`); the `createEffect` — which Solid runs after
  `setHydrateContext()` — makes the first emit as a client re-render. CSR
  first-paint (the D-scroll fix above) is unchanged: the render effect still
  measures when no walk is live.
- **Option children read three times** (`ListBox.tsx`, `ComboBox.tsx`,
  `Select.tsx` option bodies). `hasPrimitiveLabel()` probed
  `typeof props.children` twice and `renderChildren()` read it a third time.
  Every read of a compiled element child consumes a hydration key on both
  sides; the server emits only the last read (`…3102`), the client throws on
  the first (`…3100`). Text-only options were immune (no template), which is
  why the list demo hydrated and the grid tiles did not. **Fix:** internal
  `OptionContent` (`utils.tsx`, not exported from the package) reads
  `renderChildren()` once in a tracked memo and wraps a primitive in the
  `labelProps` span; the three option components mount it inside their
  `TextContext` provider so `<Text>` slots still resolve.

Tests (red → green, both remounted against the unfixed tree):

- `packages/solidaria-components/test/Virtualizer.ssr.test.tsx` — zero-height
  server window is a strict subset of the collection; element-children ListBox
  writes one tile per option.
- `packages/solidaria-components/test/Virtualizer.hydrate.test.tsx` — hydrates
  the server window with a 320px stubbed `clientHeight` and asserts the range
  grows to ≥ 10 rows _after_ hydration (red: `Hydration Mismatch … 00000003000200132030`);
  element-children options hydrate and the tile keeps the server `data-hk`
  (red: `Hydration Mismatch … 0030002000203100`).

Browser (dev `:4399`, Playwright): all three docs demos hydrate; list 12/1000
mounted (`scrollHeight` 40000), grid 21/200 in 3×169px columns (`scrollHeight`
8040), waterfall 16/200 in 2 columns; grid `scrollTop=4000` → `aria-posinset`
94–114, `padding-top` 3720px. Console: no `Hydration Mismatch`.

Gates: `vp check` pass · `typecheck` + `typecheck:apps` pass · `test:ssr` 13
files / 29 · `test:hydrate` 13 files / 30 + 1 expected fail ·
`guard:idiomatic-solid`, `guard:upstream-test-parity` (Δ0),
`guard:source-artifacts`, `guard:attribution` PASS. Changeset
`.changeset/virtualizer-listbox-option-hydration.md`.

Open (not this lane): the same probe-then-render idiom —
`typeof x.children === "function" ? x.children(...) : x.children` and
variants — appears at ~40 sites across `solidaria-components`,
`solid-spectrum`, and `viviana-ui` (`rg -n 'typeof (props|local)\.children ==='`).
Every site that reads a non-function child more than once has the same key
drift when that child is a compiled element under SSR; only the sites with
hydrate fixtures are proven either way. Needs its own ticket and a shared
one-read helper, not 40 patches.

### Wave-3 regression fix 2 — Table column/cell hydration order (2026-09-02)

Site Gate `a11y:contrast` → `/showcase/collections` failed WCAG AA: the route
error boundary was on screen. Its cause: "Cannot read properties of null
(reading 'nextSibling')" from S2 `TableColumn`'s template walk during
hydration of the `selectionMode="multiple"` table. jsdom reproduction:
`Hydration Mismatch … 000100110001001101`.

Root cause (this ticket's `52ab0c52`): headless `TableColumn` and `TableCell`
went from `<th …>{columnChildren()}</th>` to `<th {...columnProps()} />` with
`children: columnChildren()` evaluated eagerly inside the props object. The
two compilers key that differently. DOM: `getNextElement(th)` claims the
element's key, then `spread` inserts children. SSR: `ssrElement("th",
columnProps(), …)` receives the object already built, so the children (and the
select-all checkbox component) took keys 0 and 1 and the `<th>` took 2. A key
trace of the failing hydration showed the client claiming the server's
select-all `<span>` as its `<th>`, then asking for key `…1101` (the server's
checkbox component id) as an element. The same skew hit every column and
cell; non-selectable tables walked mismatched nodes without throwing.

Fix: `TableColumn` and `TableCell` render through `TableHost` (`th`/`td`,
`div` when virtualized) with children as JSX children; the eager `children`
entry survives only for the `render` prop, where both compilers evaluate it
before the consumer's element. `TableRow` was never affected — its
`children: rowChildrenContent` is a function, resolved lazily on both sides.

Tests (red → green): `packages/solid-spectrum/test/Table.ssr.test.tsx` writes
the `/showcase/collections` selectable table; `Table.hydrate.test.tsx`
hydrates it with no mismatch and asserts all 9 header/row cells still carry
the server `data-hk`. Browser (`vp preview :4000`, production build):
`/showcase/collections` hydrates with no console error, select-all checks the
row checkboxes; `a11y:contrast` passes for that route and the six
table/tree/gridlist docs routes (WSL2 needs `--disable-software-rasterizer`
for headless Chromium to produce frames; not a repo change).

Changeset `.changeset/table-column-cell-hydration-order.md`.
