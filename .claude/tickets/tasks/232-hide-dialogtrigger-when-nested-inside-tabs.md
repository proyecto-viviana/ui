---
id: 232
type: task
title: "Hide DialogTrigger when nested inside Tabs"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "DialogTrigger useIsHidden early return; Text hideable is out-of-lane (Text.tsx). Nested Tabs test cannot go red without RAC Hidden collection pass",
    }
---

## Cause

RAC 1.21.0 makes `DialogTrigger` return null when it is inside a hidden
collection (Tabs panels). Source:
`packages/react-aria-components/src/Dialog.tsx:98-103` on `f56660b`
(`useIsHidden()`). RAC `Text` also became hideable
(`packages/react-aria-components/src/Text.tsx:22`). Test:
`packages/react-aria-components/test/Tabs.test.js:1120`. Release note: "Allow
DialogTrigger to work when nested inside Tabs". Local DialogTrigger always
renders (`packages/solidaria-components/src/Dialog.tsx:98`) and does not
call `useIsHidden`. #208 restores Heading and menu-trigger state; it does not
cover this hide.

## Work

Port the `useIsHidden` early return on DialogTrigger and the hideable Text
path. Add the Tabs nested DialogTrigger test.

## Done when

A DialogTrigger inside a non-selected TabPanel does not throw and does not
leak a duplicate trigger; the test fails if `useIsHidden` is skipped.

## Relationship

Child of #220. Extends #208; adjacent to #113.

## Landed

- `react-aria-components/src/Dialog.tsx:98-103` → `packages/solidaria-components/src/Dialog.tsx:174-180` → `supports DialogTrigger inside Tabs` (`packages/solidaria-components/test/Tabs.test.tsx`)
- Out-of-lane: RAC `Text.tsx:22` hideable path lives in `packages/solidaria-components/src/Text.tsx` (not in this fence). Solid Tabs does not run RAC's Hidden collection pass, so skipping `useIsHidden` does **not** make the nested-Tabs test fail. Not claimed red-then-green.

Orchestrator note (2026-09-02): `HiddenContext` in `packages/solidaria/src/collections/index.ts:139` has no provider anywhere in the port — the Solid collection builder never renders a hidden pass, so `useIsHidden()` is always false and the RAC bug cannot occur here. The DialogTrigger guard is kept as structural parity with RAC (TokenField already uses `createHideableComponent` the same way) and is unreachable today; it becomes provable only if a hidden pass is ever introduced. The nested-Tabs test is kept as behavior coverage (DialogTrigger opens inside a tab panel), not as proof of the guard. Hideable `Text` follows the same reasoning and is not ported separately.
