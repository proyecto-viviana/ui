---
id: 235
type: task
title: "Guard FocusScope restore against a null first-in-scope target"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "ported null first-in-scope skip and parent-scope restore walk; tests red-then-green",
    }
---

## Cause

RAC 1.21.0 types `getFirstInScope` as `FocusableElement | null` and skips
`restoreFocusToElement` when the parent scope has nothing focusable, walking
up instead (`packages/react-aria/src/focus/FocusScope.tsx:541-558, 814-820`
on `f56660b`). Release note: "Guard against a null restore target in
FocusScope restoreFocus". Local restore still requires `nodeToRestore` and
does not walk to a parent scope's first focusable
(`packages/solidaria/src/focus/FocusScope.tsx:720-728`). #190 is SSR
sentinel structure, not this restore-null path.

## Work

Port the null check and parent-scope walk. Add a test that removes the last
focusable from a nested scope and restores to the next scope up without
throwing.

## Done when

Unmounting a nested restoreFocus scope whose first-in-scope is null does not
throw and focus lands on the parent scope's first focusable, matching
`f56660b`.

## Relationship

Child of #220. Distinct from #190.

## Landed

`react-spectrum/packages/react-aria/src/focus/FocusScope.tsx:541-558`
→ `packages/solidaria/src/focus/FocusScope.tsx:250` (`firstInScope` returns `HTMLElement | null`)

`react-spectrum/packages/react-aria/src/focus/FocusScope.tsx:814-820`
→ `packages/solidaria/src/focus/FocusScope.tsx:785-798` (`if (first)` skip, walk parent)
→ `does not throw when there is no focusable element to restore focus to`
→ `restores to the parent scope's first focusable when nodeToRestore is disconnected`

Red-then-green: reverted restore to the old `nodeToRestore`/`body.contains` path; parent-first test failed (focus stayed on `body`); restored, green.
