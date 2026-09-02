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
