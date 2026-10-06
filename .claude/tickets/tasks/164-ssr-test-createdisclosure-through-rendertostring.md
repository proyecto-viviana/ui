---
id: 164
type: task
title: "SSR-test createDisclosure through renderToString"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-10-06,
      note: "createDisclosure SSR and hydration are tested via renderToString in createDisclosure.ssr.test.tsx and hydrateOverSsr in createDisclosure.hydrate.test.tsx.",
    }
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
