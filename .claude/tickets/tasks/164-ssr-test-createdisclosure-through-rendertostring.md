---
id: 164
type: task
title: "SSR-test createDisclosure through renderToString"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`createDisclosure.ssr.test.tsx` hard-codes `role: "group"` and `aria-hidden`
in the test body, then asserts those literals. It never calls
`renderToString`. The "after hydration" case never hydrates.

## Work

Replace the helper with `renderToString` of `createDisclosure`.

## Done when

The file fails if the real SSR props drift.

## Relationship

F-TEST-008. Rule #7 tautology.
