---
id: 238
type: task
title: "Select the autofocused item when selectOnFocus is enabled"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
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
