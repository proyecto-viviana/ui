---
id: 576
type: task
title: "The playground's toast region never renders, so two a11y:smoke tests fail on a missing landmark"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor running step 251 of the ladder, `VIVIANA_GATE=1 vp run a11y:full`. Legs one and two are green (playground axe 10/10, comparison axe 81/81); `a11y:smoke` is 7 failed / 67 passed, and two of the seven are these: `playground-components.spec.ts:583` and `:614`, both timing out on `getByRole('region', { name: 'Notifications' })` with `element(s) not found` after a click on the `Success Toast` trigger. Not a flake and not a timing miss - the locator finds nothing at all for the full 5s, and every other overlay test in the same file passes in the same run, including tooltip, popover, dialog and alertdialog. Evidence `.agents/chain-walk-2026-09-20/ladder-axe-full.out.txt`. The other five failures are a different cause and are #575",
    }
---

## Scope

`apps/web/src/routes/solid-spectrum/playground.tsx` wraps the page in
`<ToastProvider useGlobalQueue>` at `:292` and renders
`<ToastContainer placement="bottom end" />` at `:1309`. The test clicks the
section's `Success Toast` button and then expects the notification landmark:

```
apps/web/e2e/playground-components.spec.ts:591
  const region = page.getByRole("region", { name: "Notifications" }).first();
```

Nothing matches. The second failing test, `:614`, asserts the same region's
`aria-labelledby` / `aria-describedby` wiring and dismissal, so it fails for
the same reason and is not independent evidence.

## What the shape of the failure says

Three candidates, and the run already narrows them:

1. **The container renders nothing.** `ToastContainer` mounts but produces no
   landmark until the queue is non-empty, and the queue never received the
   toast. Then the defect is in `addToast` / `useGlobalQueue` and the click is
   reaching a button that does nothing.
2. **The landmark lost its accessible name.** The region exists but is no
   longer named `Notifications`, so a role+name locator misses it while the
   toast is visibly on screen. This is the cheap one to rule out and should be
   ruled out first: query `[role=region]` alone and print what is there.
3. **The portal never attaches.** Toasts portal, and this repository has a
   recorded trap about portal roots — a themed island keeping its overlays in
   scope, and a portal root needing its own scheme. If the portal target is
   missing or is outside the page under test, the container mounts and paints
   nowhere.

Candidate 1 is the one this campaign makes most likely: the Solid 2 port moved
the whole chain, and a global queue is exactly the kind of module-level
singleton that breaks when ownership or module identity changes. But the other
overlay tests passing in the same run argues that portals in general are fine,
which is evidence against 3 — so start by printing the DOM, not by reasoning.

## Work

1. Open the playground under the same build the gate uses and print every
   `[role=region]` and every `[role=alertdialog]` after one click. That single
   observation separates 1 from 2.
2. Fix the cause that observation names. If it is the accessible name, the fix
   is in the library and owes a changeset; the test asserts the name a user
   hears, so **change the library to match the test, not the test to match the
   library**, unless upstream S2 gives a different name — in which case mirror
   upstream and say so, with the upstream answer quoted.
3. Re-run both tests and the whole `a11y:smoke` leg, not just the two.

## Done when

`vp run a11y:smoke` passes `playground-components.spec.ts:583` and `:614`, and
the ticket records which of the three candidates it was and the DOM evidence
that decided it.

## Relationship

Child of #544. Step 251 of `.github/workflows/certification-gates.yml`, the
last blocking step of the `gates` job, reachable for the first time since
`1df7af51` fixed `build:web`. Sibling of #575, the other five failures of the
same run.

Bears on the toast chain that `@proyecto-viviana/ui` and `solid-spectrum` both
publish, so a fix there is a published change and owes a changeset. If the
cause turns out to be the global queue's identity under Solid 2, it belongs to
the #531 port family as well and should say so.
