---
id: 193
type: task
title: "Replace export-floor and did-not-throw tautologies with behavior contracts"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Round 1 bundled these into F-TEST-009 and dropped them as #91 (the six
`it.skip` sites). They are not skips. `createPress` / `FocusScope` /
`createInteractOutside` cleanup cases fire events after unmount then
`expect(true).toBe(true)` ("No errors should occur")
(`packages/solidaria/test/createPress.test.tsx:2546-2565`,
`FocusScope.test.tsx:838-847, 884-895`,
`createInteractOutside.test.tsx:328-343`). An uncaught throw already fails a
test; the assertion cannot detect a listener that still runs.
`packages/solidaria-components/test/re-exports.test.ts:24-58` and the first
two `useDragAndDrop.test.tsx` cases assert `typeof … === "function"` /
`toBeDefined()`. `Pressable.test.tsx:18-21` / `Focusable.test.tsx:18-21` are
"can be exported from index" checks. Rule #7: named logic that cannot fail
on behavior drift.

## Work

Replace each cleanup tautology with an assertion on the observable (a spy
that must not be called after unmount; no listener left on `document`).
Replace export-existence floors with one behavior case per export or delete
them.

## Done when

No `expect(true).toBe(true)` in package tests; every remaining
`typeof === "function"` assertion is accompanied by a behavior case in the
same file.

## Relationship

F-TEST-016. Not #91 (skips) and not #163 (missing suites).
