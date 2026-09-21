---
id: 591
type: task
title: "createPress opens links with isOpening true, so a collection link item navigates twice on Space"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Three findings on one call path: `solidaria-src/openlink-setopening` (high, confirmed), `555-a/openlink-onclick-reentry` (low, harm refuted), `solidaria-src/linkclicked-dedup` (low, confirmed). `createPress.ts:799` calls `openLink(target, e)` and takes `dom.ts`'s new `setOpening = true` default; upstream `usePress.mjs:320` passes `false` there for exactly one reason - `createSelectableItem.ts:499` reads `if (!openLink.isOpening) e.preventDefault()`, so with the flag set the synthetic click's default action stops being suppressed. `e6384f37` made this load-bearing: `openLink` now dispatches a click the item's own `onClick` sees, so a collection link item navigates natively and again through `onSelect`. The skeptic reproduced both sides and confirmed no commit in `f13fd341..4acbc9e4` touches `createPress.ts`",
    }
---

## Scope

1. Pass `false` as the third argument at
   `packages/solidaria/src/interactions/createPress.ts:799`, as
   `react-aria` 3.52.0 does.
2. Carry upstream's `!openLink.isOpening` guard into `createPress.onClick`, and
   the `false` third argument on the key path. The skeptic refuted the harm —
   net observable behaviour matches today — so this is not a defect fix; it is
   keeping the two halves of one upstream mechanism in step, so the next reader
   does not have to re-derive why one half is missing. Say that in the commit
   rather than claiming a bug.
3. Key the link-open de-duplication on the event rather than on the element
   plus a timeout (`solidaria-src/linkclicked-dedup`). An element-and-timeout
   key drops a legitimate second activation of the same link inside the window
   and keeps a stale one across two different events.

## Done when

Space on a role-overridden `<a href>` inside a selectable collection navigates
exactly once, proved by a test that counts navigations rather than asserting a
handler ran. `createPress`'s link path and `useSelectableItem`'s guard read the
same way as upstream at the pin.

## Proof

The failing-then-passing test, run with the defect reintroduced and again with
it removed, counts both ways in the commit.

## Relationship

Child of #544, stage S2-a, the first of the source defects because it is the
only confirmed one that changes what a user gets. Residue of #555 item 8 and of
`e6384f37`. #592 is the same four call sites seen from the router's side and is
deliberately separate, because that one is a pre-existing parity gap and this
one is not.
