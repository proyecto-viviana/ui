---
id: 256
type: task
title: "Make Virtualizer context-only with the collection element as the scroller, as RAC does"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "surfaced by #252: the S2 ComboBox/Picker wrap had to sit inside the popover because the Solid Virtualizer renders DOM; the harness already compensates for the extra scroller",
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
