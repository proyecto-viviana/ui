---
id: 576
type: task
title: "The playground's toast region never renders, so two a11y:smoke tests fail on a missing landmark"
created: 2026-09-20
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor running step 251 of the ladder, `VIVIANA_GATE=1 vp run a11y:full`. Legs one and two are green (playground axe 10/10, comparison axe 81/81); `a11y:smoke` is 7 failed / 67 passed, and two of the seven are these: `playground-components.spec.ts:583` and `:614`, both timing out on `getByRole('region', { name: 'Notifications' })` with `element(s) not found` after a click on the `Success Toast` trigger. Not a flake and not a timing miss - the locator finds nothing at all for the full 5s, and every other overlay test in the same file passes in the same run, including tooltip, popover, dialog and alertdialog. Evidence `.agents/chain-walk-2026-09-20/ladder-axe-full.out.txt`. The other five failures are a different cause and are #575",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: 'candidate 1, and already fixed: #578''s first cause, `d2f94530`. The global queue wraps every update in `startViewTransition`, and the port handed the browser `() => fn`, so the toast was never added and `ToastContainer` had nothing to render. The step-251 walk (`d5165521`, 22:48) predates that fix (00:04). It did not reproduce at HEAD: both tests pass. The first mutation, source only, still passed, because apps/web resolves `@proyecto-viviana/solid-spectrum` through its `exports` to the built dist, not source (apps/web''s tsconfig maps no workspace paths, and never has). Decided by putting `() => fn` back in `packages/solid-spectrum/src/toast/index.tsx` and rebuilding the dist: `playground-components.spec.ts -g Toast` is 2 failed, `element(s) not found` on `region "Notifications"`, the conductor''s exact evidence. Restored and rebuilt: 2 passed. The whole leg, `vp run a11y:smoke`: 71 passed / 3 failed, and the three are `examples.spec.ts:179` (explore-empty, lesson, playground), which are #575''s. No library change here. The apps/web `vite.config.ts` comments claimed source resolution and now say dist, with the rebuild-first consequence for a local web gate; CI builds at :213 before `a11y:full` at :258, so CI was never stale',
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`, finding `r2-certified-b/F4`, low, partly. This ticket's Done-when asks it to record which of the three candidates it was **and the DOM evidence that decided it**; the note above names candidate 1 and records a dist-rebuild mutation, but carries no DOM print from Work step 1 - no `[role=region]` or `[role=alertdialog]` output - so the choice rests on the mutation and on inference, not on the evidence the bar names. The skeptic narrowed the finding to that: the mutation does exclude candidate 2, and the factual core of the entry above holds - `apps/web/tsconfig.json` has only the `@/*` and `~/*` paths and is byte-identical across `c8ae8538`, `8751e5a8`, `e652cb81` and `ca1a0d82`, so it never mapped workspace packages, and `certification-gates.yml` builds at :211 before `a11y:full` at :258, so CI really was never stale. The second half of the finding is that the stale-dist trap is documented only as a comment in `apps/web/vite.config.ts`, where the analogous comparison trap is held by `guard:comparison-atom-css`; the skeptic calls that largely moot for CI, for the same :211 reason, so it is a local-gate hazard only. The scheme has no backward transition from merged: either paste the Work-step-1 DOM output here, or say here that the candidate rests on the mutation. Until one of the two, read this ticket as merged on a mutation and not on a DOM print",
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
