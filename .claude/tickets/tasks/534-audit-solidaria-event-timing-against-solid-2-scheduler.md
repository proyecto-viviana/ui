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
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "native Hover boundary/lifecycle slice repairs two reproduced failures: original-owner target loss and false exit between children. Owning 28/28 and affected 287/287 pass; fresh SSR 75/75 then hydrate 98/98, one worker. A later order-dependent Pressable fixture leak is repaired by owning test cleanup, without changing assertions. Native disable/disposal/shared-listener proof and a decisive cleanup negative control pass review. Separate 50 ms versus 500 ms touch timing audit, Menu/virtual-focus/final owning proof and all sibling/build/attribution/release requirements remain open",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "touch timing slice: pinned useHover clears emulated-mouse suppression after 500 ms; ours cleared after 50. Source now 500. A boundary test holds both the pointer and the mouse-fallback path at 499 ms and releases at 500; with 50 restored it fails 2 of 30. Affected files pass 145/145, one worker. Tooltip and Button suites own their cleanup and settle the suppression timer. Menu, virtual-focus and the final owning audit remain",
    }
  - {
      state: in-progress,
      at: 2026-09-27,
      note: "A delayed autofocus winner stays owned through the virtual-modality runAfterTransition frame. Cancel, disposal, and clear after the delay timer suppress focus and onFocus. The successful frame still focuses once. focus.test.tsx and focusSafely.test.tsx pass 56/56. Menu drag, item keyboard and modality re-entry, and the final owning audit remain",
    }
  - {
      state: in-progress,
      at: 2026-09-27,
      note: "Space and Enter on a menu item restore keyboard modality after target.click() publishes virtual. During the action the modality is virtual; after the handler it is keyboard. createMenu.test.tsx passes 66/66. Menu drag and the final owning audit remain",
    }
  - {
      state: in-progress,
      at: 2026-09-27,
      note: "A different-origin mouse release activates the item under the pointer and selects it once. The synthetic click no longer re-emits that selection. createMenu.test.tsx passes 69/69. The final owning press, hover, and focus audit remains",
    }
  - {
      state: verified,
      at: 2026-09-27,
      note: "Press, hover, focus, modality, long-press, and menu tests pass 433/433 across 17 files. Space and Enter restore keyboard modality after the virtual click. A different-origin release selects once. eventPathContains stays. One FocusScope mount case prints FLUSH_IN_EFFECT_CALLBACK while its assertion passes",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Reopened for the current-tree Menu effect and canonical bound-event tuple qualification slice before #632. Historical 433/433 proof is preserved. Admission supplies no new passing proof or release acceptance.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Bounded slice at HEAD d1195428: StackedSubmenuTrigger uses two-phase createEffect (initial sample, latest callback, same-state guard). Private callEventHandler calls handler(data, event). Menu, tabs, and combobox use it. Collection untouched; menuProps.tabIndex getter stays. Old Menu ArrowRight failed in 71ms with MISSING_EFFECT_FN (exit 1, not a hang). Hook suites 188/188. New stacked notification test passed under the 35s bound (exit 0). Five Menu Enter activation failures also fail on HEAD sources and stay inherited. Root typecheck exits 2; the createMenu tabIndex HTMLAttributes error is on HEAD, and the old onKeyDown not-callable error is gone. docs:generate and docs:check passed. Full audit, SSR, browser, and release remain open. #557 still blocks candidate qualification.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Review gap: createTab now records bound tuples from the real createFocusRing and createPress producers for onFocus, onBlur, onKeyDown, onMouseDown, onPointerDown, and onClick, including undefined data, and still records focusin roving order on ArrowRight. HEAD createTabs fails that test with focusCalls []. Spies restore in finally, and createTab plus createComboBox restoreAllMocks in afterEach. ComboBox open ArrowDown still delegates once; closed, read-only, and disabled do not. Focused hook files 189/189. Typecheck still exits 2. docs:check passed. No source scope added. Audit and release remain open.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Direction before fixture change: five inherited Menu failures fire Enter on the menu root. createMenu.ts delegates item Enter/Space to createMenuItem, matching pinned useMenuItem, and does not activate from the root handler. Named groups are individual closeOnSelect=false, static MenuSection selection, static section disabled/close, section radio, and section checkbox. One focused-item user.keyboard Enter control must pass with activeElement and exact action/selection/close assertions before those five event targets are corrected. No root-activation product behavior. The createMenu tabIndex diagnostic stays a local listProps boundary; the public camelCase getter and native mapping stay, with no collection migration.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Precontrol log /tmp/ui-534-menu-enter-precontrol.log: the five titles fail on fireEvent Enter at the menu root (menu still mounted, Bold stays checked, onAction not called, radio and checkbox stay unchecked). The static MenuSection control then passes with menu.focus, user.keyboard ArrowDown, activeElement on Italic, and Enter selecting Italic. The other four fixtures use that same focused-item path. Root-activation titles are renamed to focused keyboard activation. Disabled Archive is skipped. close and no-close outcomes stay. createMenu strips the list's camelCase tabIndex through a local boundary and keeps the reactive getter. Typecheck still exits 2 with no createMenu diagnostic. No collection migration and no root-activation product behavior. Audit and release remain open.",
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

## 2026-09-19 native Hover boundary and lifecycle slice

Native regression proof exposes two failures in createHover: after child removal,
outside pointerover reported the outside body as hoverend.target; child-to-child
pointerout ended hover even though the pointer remained inside the owner. The
bounded source repair retains state.target for outside recovery and checks
relatedTarget containment for native pointerout. Pinned useHover preserves the
original owner; React's enter/leave normalization excludes internal transitions.
No scheduler, callback-order, touch-duration or disposal-policy change is needed.

The initially-disabled proof now dispatches real native events and includes an
enabled control, replacing absent optional mouse-handler calls. Native disable
inside hover-start preserves start/change(true)/end/change(false), avoids a second
terminal event and can restart. Disposal checks exact capture-listener identity
and no callbacks after unmount; two owners share touch suppression until final
disposal. Feature mocks restore only after owner cleanup. Existing helper unit
coverage remains. Baseline 2/28 failed, 26 passed; corrected owning 28/28 and six
affected suites 287/287 pass. Fresh complete SSR 75/75 then hydration 98/98 pass,
one worker. A restored rerun exposed an order-dependent Pressable fixture leak
into Button (1/287 failed); test-only named extension to Pressable.test.tsx adds
file-level cleanup without changing any assertions. A decisive cleanup negative
control also fails on leaked post-disposal hoverend despite recorded removal
calls, then is restored. Final corrected proof and exact commands:
`.agents/UI-EXECUTION-534-HOVER-2026-09-19.md`.

Separate review debt remains: local emulated-mouse suppression is 50 ms versus
pinned upstream 500 ms; existing 100 ms recovery expectations are unchanged in
this slice and do not certify timing parity. Audit this explicitly alongside
Menu drag/item-keyboard/modality, virtual-focus handoff and final owning proof.
Attribution still reports the same 64 mismatches; no hashes are refreshed or
waived. This slice does not complete #534, #531 or release acceptance.

## Done when

All press, hover, and focus interaction tests pass cleanly in `packages/solidaria`
under the Solid 2.0 scheduler.

## Relationship

Child of #531. Sibling of #532 and #533.

## 2026-10-08 bounded qualification admission

Register `ui-534-menu-events-20261008`, Grok source implementer in eligible
repo:ui main, using `/tmp/ui-534-worker-2026-10-08.md`. The previous #635
generation has stopped and its accepted repair is committed. The conductor
alone reviews, stops the exact generation and commits. No worker commit,
push, publication, extra writer, dependencies or public names are admitted.

Source paths:

- `packages/solidaria-components/src/Menu.tsx`: only StackedSubmenuTrigger's
  obsolete one-argument effect. Track open state separately from untracked
  notification, suppress initial sample and read the latest callback on real
  transitions. Preserve sibling/root close and disposal. #51 stays verified.
- `packages/solidaria/src/menu/createMenu.ts`
- `packages/solidaria/src/tabs/createTabs.ts`
- `packages/solidaria/src/combobox/createComboBox.ts`
- Private `packages/solidaria/src/utils/callEventHandler.ts`: canonical
  `[handler, data]` calls handler(data, event), including undefined data;
  plain functions receive event. No public barrel export or upward import.

Tests:

- `packages/solidaria/test/createMenu.test.tsx`
- `packages/solidaria/test/createTabs.test.tsx`
- `packages/solidaria/test/createComboBox.test.tsx`
- `packages/solidaria/test/callEventHandler.test.ts`
- `packages/solidaria-components/test/Menu.test.tsx`
- `packages/solidaria-components/test/Tabs.test.tsx`
- `packages/solidaria-components/test/ComboBox.test.tsx`

Also admitted: this ticket, `.changeset/menu-solid2-event-adapters.md`
covering actual changed owners, `/tmp/ui-534-*` evidence, and generated
`.claude/current/status.md` / `.claude/current/roadmap.md` through standard
tooling. Preserve all unrelated work and earlier receipts.

Shared `packages/solidaria/src/selection/createSelectableCollection.ts` is
not admitted for automatic edits. First prove a native rendered tabindex or
focus-movement failure and obtain conductor path extension. A casing type
error alone does not justify a shared public tabIndex migration.

Require old-source controls and focused final passes. The Menu effect test
settles mount, opens once, swaps callbacks without notification, closes through
the latest callback, and checks absence/disposal. Actual hook producer tuples
must exercise Menu/Tabs forwarding; helper-only tests are insufficient.
Retain keyboard/typeahead, Escape and disabled guards, Tabs focus-in ordering,
ComboBox open/closed/read-only behavior, eventPathContains and modality proof.
Bound the potentially hanging old Menu test to 35 seconds plus 5 seconds
termination grace; timeout is a hang result, never a pass. Run scoped
format/lint, actual root typecheck and generated-doc checks. Record exact
generation, HEAD, file digests, commands, exits, counts and limitations in
`/tmp/ui-534-worker-result-2026-10-08.md`. Keep broader scheduler and candidate
qualification open; no full audit or release claim follows from this slice.

## 2026-10-08 bounded acceptance

The conductor read the final diff, saved controls and final logs in
`/tmp/ui-534-worker-result-2026-10-08.md`, independently matched all 14 recorded
path digests, and accepted this bounded repair. The owned Grok generation
`3ece5827-5500-4ad9-8ec0-5c8f0cc94426` was stopped through OS/herdr with
`closed: true` before integration. Independent read-only review accepted the
event adapters, local list-props boundary, effect and focused-item fixtures.

The three saved old-source controls fail on the obsolete Menu effect, bound
Menu keydown dispatch and bound Tabs dispatch. Final owning tests pass 328/328
across five files. Scoped format and lint and generated-doc checks pass.
Root typecheck exits 2 with 24 inherited diagnostics and none in the admitted
source. The five inherited root-Enter fixtures now focus the intended item
and assert activeElement before Enter; their selection, action and close
assertions remain. This adds no root-activation product behavior.

This acceptance covers source and focused local proof. Existing effect-flush
diagnostic traces remain; SSR, hydration, builds, native browser #557 and
candidate/release qualification were not run in this slice. The remaining
scheduler audit and this ticket stay in progress.
