---
id: 238
type: task
title: "Select the autofocused item when selectOnFocus is enabled"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "autoFocus branch only: replaceSelection when selectOnFocus and selectedKeys empty; GridList does not use createSelectableCollection",
    }
---

## Cause

RAC 1.21.0 selects the autofocused item when `selectOnFocus` is on and
nothing is selected
(`packages/react-aria/src/selection/useSelectableCollection.ts:625-635` on
`f56660b`). Tests: GridList
`packages/react-aria-components/test/GridList.test.js` "autoFocus with
selectOnFocus". Local auto-focus sets focused key but never calls
`replaceSelection`
(`packages/solidaria/src/selection/createSelectableCollection.ts:588-589`).
Release note: "Select the autofocused item when selectOnFocus is enabled".

## Work

After setting the autofocused key, if `selectOnFocus` and `selectedKeys` is
empty and the item is selectable, call `replaceSelection`. Cover
`autoFocus="first"|"last"`, `selectionMode="none"`, and existing `"all"`
selection.

## Done when

A GridList with `selectionBehavior="replace"` and `autoFocus="first"` has
the first row `aria-selected="true"` on mount; `selectionMode="none"` does
not select; `"all"` is unchanged.

## Relationship

Child of #220. Adjacent to #100 (virtual focus).

## Landed

- `react-aria/src/selection/useSelectableCollection.ts:625-635` → `packages/solidaria/src/selection/createSelectableCollection.ts:591-598` → `selects the autofocused item when selectOnFocus with autoFocus=$autoFocus` / `does not select the autofocused item when selectionMode is none` / `does not change an existing all selection when autofocusing` (`packages/solidaria/test/createSelectableList.test.tsx`)
- Change kept to the autoFocus branch only. GridList does not go through `createSelectableCollection` (`packages/solidaria/src/gridlist/` is out of fence); coverage is at `createSelectableList`.
- Red-then-green: without `replaceSelection`, `selectedKeys.has(key)` was false; restored, green.
