---
id: 232
type: task
title: "Hide DialogTrigger when nested inside Tabs"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
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
