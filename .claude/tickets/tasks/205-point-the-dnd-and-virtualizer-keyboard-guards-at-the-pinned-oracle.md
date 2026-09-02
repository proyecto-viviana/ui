---
id: 205
type: task
title: "Point the DnD and virtualizer keyboard guards at the pinned oracle"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "guards now diff the local keyboard walk against pinned useDroppableCollection + DropTargetKeyboardNavigation",
    }
---

## Cause

`scripts/check-dnd-keyboard-parity.ts:30-64` and
`check-virtualizer-keyboard-parity.ts:18-60` `hasPattern` local files for
identifiers such as `keyboardDelegate?.getKeyBelow` and `oppositeDirection`.
They never read `react-spectrum/`. A local rewrite that keeps the tokens and
changes the walk still passes; both stay green for the life of #84.

## Work

Derive the expected contract from the pinned `useDroppableCollection` /
virtualizer source (or a checked-in extract of it) and diff, not grep.

## Done when

Changing the keyboard walk locally while keeping the identifiers fails the
guard.

## Relationship

F-UP-006. Delta on #84.

## Landed

- `scripts/keyboard-parity-oracle.ts` extracts the keyboard walk from the
  pinned oracle: `onKeyDown` key → method order and page-key
  primary-then-opposite fallback from
  `react-spectrum/packages/react-aria/src/dnd/useDroppableCollection.ts:590-790`;
  direction dispatch, drop-position assignments, `includeDisabled` delegate
  calls from
  `react-spectrum/packages/react-aria/src/dnd/DropTargetKeyboardNavigation.ts:3-24`
  (`navigate`), `:27-155` (`nextDropTarget`), `:157-267` (`previousDropTarget`).
- `scripts/check-dnd-keyboard-parity.ts` diffs that contract against
  `packages/solidaria/src/dnd/createDroppableCollection.ts` and
  `packages/solidaria/src/dnd/DropTargetKeyboardNavigation.ts`. Reordering
  the walk while keeping `getKeyBelow` / `onKeyDown` tokens fails the JSON
  diff.
- `scripts/check-virtualizer-keyboard-parity.ts` reads the same oracle
  (RAC `Virtualizer.tsx` does not own the walk; it delegates to layout at
  `react-spectrum/packages/react-aria-components/src/Virtualizer.tsx:80-82`).
  Local `scanFromIndex(clampedStart, delta)` then
  `scanFromIndex(clampedStart - delta, -delta)` must match the oracle
  PageDown fallback; Tree must keep nested `level` / `parentKey` /
  last-child previous. Test titles stay as named failure modes.
