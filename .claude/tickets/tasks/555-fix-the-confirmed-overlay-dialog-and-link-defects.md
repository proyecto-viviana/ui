---
id: 555
type: task
title: "Fix the overlay, dialog and link defects the audit confirmed"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "audit lenses 1 and 5; the conductor reproduced each row against upstream source, see .agents/audit-2026-09-20/VERIFIED.md. RC blocker for the three overlay HIGHs, createDialog and ButtonGroup",
    }
---

## Scope

Each fix mirrors upstream, with a red-then-green test and a changeset. In this
order, because each one narrows the next:

1. `Modal` uses `createPreventScroll` instead of its one-off
   `overflow: hidden` (upstream `useModalOverlay.ts:65-67`).
2. `FocusScope` queries the attribute the toast region sets, and regains
   `isElementInChildOfActiveScope` (upstream `useOverlay.ts:148-161`).
3. `createOverlay` regains `lastVisibleOverlay` tracking and drops the
   `preventDefault` on start (upstream `useOverlay.ts:100-126`); decide
   whether its document-level `focusin` close listener is invented and remove
   it if it is.
4. `createDialog` uses `createSlotId`, not `createUniqueId` (upstream
   `useDialog.ts:56-60`).
5. `ButtonGroup` regains its `children` dependency, in both twins.
6. `openLink` dispatches on the anchor instead of assigning `window.location`
   (upstream `openLink.tsx:106-144`; `RouterProvider.tsx:112-123` already
   holds the faithful copy).
7. `createId` stops skipping `createUniqueId` when a `defaultId` is given, in
   both twins.
8. `Popover` Portal ref, `createToastRegion`'s squashed header, the dead
   imports plus `noUnusedLocals`, the `_s2Cleanups` early-return guard, and
   the `createPreventScroll` style nonce.

The `apps/web` Worker security headers ride with #549, not here.

## Done when

Every item above is committed with the test that fails on the old source, or
named as rejected with the upstream reading that rejects it.

## Proof

Per item, the test's red run on the old source and green run on the fix, and
the suite of the package touched.

## Relationship

Child of #544. Sources `.agents/audit-2026-09-20/lens5-a11y-security.md` and
`lens1-codemod.md`; rows in `VERIFIED.md`.
