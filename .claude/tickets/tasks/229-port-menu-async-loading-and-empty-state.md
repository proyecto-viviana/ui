---
id: 229
type: task
title: "Port Menu async loading and empty state"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "porting MenuLoadMoreItem + empty-state sibling from RAC Menu.tsx",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "MenuLoadMoreItem exported; async-loading tests red-then-green; pending export-gap row removed",
    }
---

## Cause

RAC 1.21.0 adds `MenuLoadMoreItem` (`packages/react-aria-components/src/Menu.tsx:665`
on `f56660b`) and wires it through `LoaderNode` plus `useLoadMoreSentinel`.
`renderEmptyState` was already on `MenuProps` (`Menu.tsx:292`); the 1.21 tests
prove it together with the loader (`test/Menu.test.tsx` "async loading"
describe, +110 lines). Local Menu already has `renderEmptyState`
(`packages/solidaria-components/src/Menu.tsx:144, 1240-1243`) but does not
export `MenuLoadMoreItem`. `guard:rac-export-gap` lists that name missing.
Release note: "Add async loading and empty state support to Menu".

## Work

Port `MenuLoadMoreItem` and the loader-sentinel path from pinned RAC Menu.
Prove `renderEmptyState` still shows when the collection is empty and that
`onLoadMore` fires from the sentinel. Do not stub the export.

## Done when

`MenuLoadMoreItem` is a public export; async-load, loading-spinner, and empty
state branches have keyboard, ARIA, and browser evidence matching
`Menu.test.tsx` at `f56660b`. `guard:rac-export-gap` no longer lists
`MenuLoadMoreItem`.

## Relationship

Child of #220. Adjacent to #106 (Menu on Popover).

## Landed

`react-spectrum/packages/react-aria-components/src/Menu.tsx:665`
→ `packages/solidaria-components/src/Menu.tsx:1920` (`MenuLoadMoreItem`; LoaderNode + sentinel + `data-loading` like ListBox/GridList/Table)
→ `packages/solidaria-components/src/index.ts:277,290` (public export)
→ `scripts/rac-export-gap-pending.json` (removed `{ "symbol": "MenuLoadMoreItem", "ticket": 229 }`)

Empty state is a sibling of children (RAC CollectionRoot + emptyState), not exclusive — `packages/solidaria-components/src/Menu.tsx` empty-state branch.

Tests (`packages/solidaria-components/test/Menu.test.tsx` `describe("Menu async loading")`):

- `should render the loading element when isLoading is true`
- `should render the sentinel but not the loading indicator when not loading`
- `should properly render the renderEmptyState if menu is empty`
- `should only fire onLoadMore when intersection is detected regardless of loading state`
- `keyboard navigation skips the loader row`

Red-then-green: stripped `data-testid="loadMoreSentinel"` and restored exclusive empty-state (hide children when empty); sentinel + empty-state tests failed; restored, green.
