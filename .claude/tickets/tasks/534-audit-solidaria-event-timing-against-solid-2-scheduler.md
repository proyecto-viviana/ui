---
id: 534
type: task
title: "Audit solidaria event timing against Solid 2 scheduler"
created: 2026-09-13
parent: 531
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to review eventPathContains and modality guards against Solid 2 batched scheduling",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "coordination from #536 focus lifecycle review: createAutoFocus removes queued requests on cancel/disposal, but processAutoFocusQueue schedules an untracked positive-delay winner after clearing the queue. Cancellation after that handoff needs an owning failing regression and bounded repair under this scheduler audit; #536 registration parity neither fixes nor claims coverage of that branch",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner-directed bounded delayed-autofocus slice reproduces nine old-source failures while all 34 original tests and delayed-success control pass. Per-request ownership now spans queue/dequeued/timer phases, cancels by identity on cancel/disposal/clear, and preserves reentrant next-batch recovery. Owning 46/46, focused SSR/hydrate 16/16 each and fresh complete SSR 75/75 then hydrate 98/98 pass with one worker. Remaining press/hover/focus/menu scheduler audit and every initiative/release gate remain open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#534 native Press proof retains eventPathContains after a decisive detached-target negative control, restores exact upstream propagation expectations and proves global/pending-click disposal cleanup. A combined-worker Button fixture leak is repaired by owning test cleanup only, with 56-failure removal control. Final affected ordinary 235/235 and fresh complete SSR 75/75 then hydrate 98/98 pass, one worker; no lasting product changes. Native Hover, Menu drag/item-keyboard/modality, virtual-focus handoff and final owning audit remain; all sibling/build/attribution and release gates stay open",
    }
---

## Cause

In Solid 1.x, native synchronous event bubbling interacts with immediate signal
updates, requiring adapters like `eventPathContains` in `createPress` and
modality guards around `target.click()` in `createMenuItem`. Solid 2.0 introduces
a refined scheduler and batching model.

## Work

1. Audit `createPress`, `createHover`, and `createFocusRing` in `packages/solidaria`
   under the Solid 2.0 scheduler.
2. Verify whether `eventPathContains` and synthetic click modality guards can be
   simplified or whether browser event dispatch semantics require keeping them.
3. Test drag-selection, pointer replacement during pointerdown, and keyboard
   activation sequences.
4. Prove and repair cancellation of an already-dequeued delayed autofocus
   request. Keep the target connected and use `force: true` with a focused
   sentinel so a missing focus callback cannot pass through the should-focus
   guard. Include a successful delayed positive control; verify cancel and
   owner disposal after queue processing suppress both focus and callbacks.
   Retain priority, skip and queue cleanup contracts. The dated slice below
   records its failing baseline and repair; the wider audit remains open.

## 2026-09-19 delayed-autofocus slice

Named source/test paths: `packages/solidaria/src/focus/createAutoFocus.ts` and
`packages/solidaria/test/focus.test.tsx`. One stable request identity and an
active set retain ownership after dequeue; each delayed timer is canceled by
explicit cancellation, owner disposal or queue clearing. Shared-ref hooks no
longer cancel each other. Reentrant skip callbacks cannot revive canceled
requests; a throwing callback releases its detached batch but preserves an
independently queued next batch and the original thrown object.

Nine baseline failures prove the old source issue. All 34 existing tests and the
positive delayed-focus control pass before repair; final owning 46/46 passes.
New tests require a connected target, force:true, keyboard modality, focused
sentinel, queue 1→0 before cancellation, exact timer/callback counts and the
99/100 ms successful delay boundary. Existing priority, skip and immediate manual
focus behavior remains. After owner disposal retained manual focus is now inert;
queue clearing does not disable manual focus. Symmetric onSettled allocation
from #536 is unchanged.

Fresh focused SSR and hydrate pass 16/16 each; subsequent complete SSR passes
75/75, then hydrate 98/98, one worker. Independent source and test reviews accept
the bounded repair. Attribution still reports the same 64 mismatches; this is
not a clean attribution or release gate and no reviewed hash is refreshed here.

This bounded repair stops work before its owned timer fires. Virtual-modality
focusSafely can subsequently defer focus through runAfterTransition; cancellation
after that handoff is not certified here. The remaining audit must also cover
native Press target replacement/propagation/cleanup, native Hover owner lifecycle,
and full Menu drag and item-level keyboard re-entry/modality sequences. Native
composedPath and synthetic-click guards are not assumed obsolete from batching.
Receipt: `.agents/UI-EXECUTION-534-AUTOFOCUS-2026-09-19.md`.

## 2026-09-19 native Press slice

Native pointerdown now replaces its target synchronously before ancestor press
handling, capturing disconnected/not-contained/composed-path membership during
dispatch. Exact event sequence, target identity, state and timer cleanup pass;
removing only the composedPath fallback loses pressstart and fails the regression.
Keep eventPathContains: Solid batching does not erase native event-path semantics.
An unrelated native release cancels without activation.

Owning propagation tests forward onPressUp and enforce pinned upstream default
inner 3/outer 0 and continued inner 4/outer 4 sequences. Global listener cleanup checks
exact registrations/removals and no post-disposal callbacks. Pending-click cleanup
uses a reattached connected target and direct click/focus spies; positive fallback
coverage checks the 79/80 ms boundary and settles Solid before asserting DOM state.
Independent negative controls reproduce leaked pressend and post-disposal click.
All temporary product mutations are restored; no product change is needed here.

Affected ordinary proof exposed ineffective automatic Button fixture cleanup in
the combined worker: removing only explicit cleanup reproduces 56 failures while
Press remains green. Named test-only extension to
packages/solidaria-components/test/Button.test.tsx registers file-level cleanup,
including its sibling ToggleButton suite, without changing assertions or queries.
Final affected ordinary proof passes 235/235 across four suites, one worker.
Fresh complete lanes and remaining checks are recorded in
`.agents/UI-EXECUTION-534-PRESS-2026-09-19.md`.

Native Hover owner lifecycle, full Menu drag/item-keyboard/modality sequences,
virtual-focus handoff cancellation and final all-owning interaction proof remain
open. This slice does not complete #534 or the initiative/release requirements.

## Done when

All press, hover, and focus interaction tests pass cleanly in `packages/solidaria`
under the Solid 2.0 scheduler.

## Relationship

Child of #531. Sibling of #532 and #533.
