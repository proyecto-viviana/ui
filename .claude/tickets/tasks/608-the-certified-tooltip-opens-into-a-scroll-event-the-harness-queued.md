---
id: 608
type: task
title: "The certified tooltip opens into a `scroll` event the harness queued one step earlier"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 certified census of CI run 35646778662, which graded row 28 - `tooltip-surface D3 › placement-left · light` - as harness, not component: `expect(getByRole('tooltip')).toBeVisible()` timed out at 5000 ms with 'element(s) not found', then passed on retry 1. `certified-case-floor.json` carries `flakyBudget: 0`, so one retry-pass turns the blocking `certified report` job red on a harness race. It cannot be waived - a waiver names a failure, and this case passes - and the budget is not the thing to move: a suite that tolerates one flake stops being able to say a component is certified. The census did not open this ticket; it recorded that one was owed",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "diagnosed as a harness race and fixed in the harness, with the component ruled out first by reading upstream. `react-aria/dist/private/overlays/useCloseOnScroll.js` closes an overlay on any capture-phase `scroll` whose target contains the trigger, and the port mirrors it line for line, so closing a hover tooltip on an ancestor scroll is upstream-faithful behaviour and not a defect to fix on the component side. A browser probe confirmed the mechanism is live and identical on both stacks: a real `<main>` scroll issued while the tooltip is open closes it 3/3 on the React Spectrum stack and 3/3 on the Solidaria stack. The race is one step earlier. `walk.ts:111-131` calls `scrollLocatorIntoView(canvas, 'center')` one CDP call before `scenario.beforePanel`, which is where `openTooltip` hovers, and Chromium dispatches the `scroll` event that DOM `scrollIntoView` queues at the next rendering update rather than in the task that called it. Instrumented on this host the event lands ~19-27 ms before the tooltip opens (`scroll(MAIN)@1225`, `tooltip=1@1253`, `hover-returned@1269`); nothing orders the two, so a loaded runner that delays a rendering update past that window flips them - the tooltip opens, registers `closeOnScroll`, the stale event closes it, and nothing reopens it, which is exactly a 5 s empty `getByRole('tooltip')` that passes on retry. Fixed once in the shared primitive rather than in each opener: `scrollLocatorIntoView` now snapshots the window and every ancestor offset, calls `scrollIntoView`, and returns immediately when nothing moved; when something did move it polls a page-side capture `scroll` counter from the Node side until the event it queued has been delivered, capped at 250 ms. Node-side polling is required, not incidental - D11 drives hovers under a frozen Playwright clock where page timers and rAF never fire - and the cap is `waitForPaintSettle`'s degradation contract: a host that never issues a rendering update proceeds instead of deadlocking. No sleep and no retry: it waits on the event, so a tooltip that genuinely fails to open still fails. Proof, all run at `bf52b79d`. The regression test is `apps/comparison/e2e/comparison-page.unit.test.ts`, deterministic because the browser ordering is not: `vp run comparison:test:journeys-driver` exits 1 on the pre-fix helper, `Test Files 1 failed | 1 passed (2)`, `Tests 2 failed | 6 passed (8)`, failing on 'returned with its `scroll` event still queued' and 'must have polled for the event'; after the fix exit 0, `2 passed (2)`, `8 passed (8)`. The flake does not reproduce on this host either way, which is the point of a unit proof: `playwright test e2e/certified/tooltip.certified.spec.ts --grep 'placement-left · light' --repeat-each 15 --workers 1` is 30 passed / 0 flaky before (1.9m) and 30 passed / 0 flaky after (2.0m). The whole certified tooltip spec after the fix is exit 0, 20 passed / 0 failed / 0 flaky, covering the D11 frozen-clock path through `hoverLocator`. `vp run typecheck` in `apps/comparison` exit 0 over 440 files, `vp lint` exit 0, `vp check` exit 0 on the four files. No changeset: nothing under `packages/` is touched, and the certified case count is unchanged, so `certified-case-floor.json` stays as it is. `merged`, not `verified`: this seat does not push, so no CI run backs these numbers and the only thing that can retire the flake budget question is a green `certified report` job",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "a review of the landed fix raised two problems and both were real, measured against the tree before anything was changed. One: the fix waited out the `scroll` event `scrollLocatorIntoView` queued, and nothing else. `journeys-steps.ts:297` still ran `page.evaluate((y) => window.scrollTo(0, y))` for the D13 `scrollPage` step, and the document is the one scroller whose tree contains every trigger, so upstream `useCloseOnScroll` closes anything opened into its event - the fuzz alphabet generates `scrollPage(200)` followed by a click freely, and `journeys-nightly.yml` runs that alphabet every night. Two: the ancestor walk inside the helper was not covered. The stub scrolled the window and gave the element `parentElement: null`, so deleting the whole loop left the suite green - measured, `3 passed`, exit 0 - while the scroller in the #608 reading was `<main>`, which is the case the walk exists for. Fixed by making the wait a property of the page rather than of one helper: one page-side `performScroll` body, shipped by `locator.evaluate` and shared by `scrollLocatorIntoView` and a new `scrollWindowTo`, so there is no second copy of the counter or the offset snapshot; `scrollPage` now goes through it. Both fixes are proved by tests that fail without them: the new `D13 scrollPage` case on the pre-fix step gives `Tests 1 failed | 5 passed (6)`, exit 1; the new ancestor-scroller case, whose stub moves an ancestor offset and asserts `window.scrollY` stayed 0, turns the same deletion of the walk from green into `1 failed | 6 passed (7)`, exit 1. Green after, all run at `298f8e7c`: `vp run comparison:test:journeys-driver` exit 0, `Test Files 2 passed (2)`, `Tests 12 passed (12)` (was 8); the whole certified tooltip spec exit 0, `20 passed`, `0 failed`, `0 flaky`, 1.2m, which is the only local exercise of the D11 frozen clock through the changed code; `vp run typecheck` in `apps/comparison` exit 0 over 440 files, 0 errors; `vp lint` and `vp check` exit 0 on the three files; `vp exec tsx scripts/check-changeset-required.mjs` exit 0, nothing under `packages/` touched. `playwright test e2e/certified/picker.certified.spec.ts --grep D13` is exit 1 with 2 failures and is not this change: both fail at step 0 and step 1, before any scroll step runs, and #578 records the same `picker-trigger` D13 2 from CI run 35638122333. That run is still evidence, because it put `scrollWindowTo` and `performScroll` through a real browser with no page-side `ReferenceError`. Three things deliberately left: the seed journey's 220 ms `settle` after `scrollPage` stays, because the wait makes it redundant but removing it needs a full D13 run on both stacks to prove nothing regressed, and that is not this review's subject; `page.mouse.wheel` stays outside the wait, because journey wheels name the listbox and a scroll inside the overlay does not contain the trigger, so upstream ignores it - the reason is written where the exception lives; and `scrollWindowTo` is a new export inside `apps/comparison`, which is not published, so it is harness API and not an owner-gated public name. Still `merged`, not `verified`, for the reason the entry above gives: this seat does not push",
    }
---

## Scope

One owning repository, `ui`, and one behaviour: the certified tooltip fixture's
own open step must not depend on a rendering-update race.

Write paths: `apps/comparison/e2e/**` only. Explicit non-goals - do not move
`flakyBudget` in `apps/comparison/e2e/certified-case-floor.json`, do not add a
waiver (there is no failure to name), do not add a sleep or a retry around the
open, and do not change tooltip behaviour in any published package.

The harness is the subject only because the evidence says so. If the open had
proved to be a real divergence from upstream, that would have been a behaviour
ticket against the component and the harness would not have been bent around
it.

## Done when

`scrollLocatorIntoView` cannot hand the page to an overlay opener with the
`scroll` event it queued still undelivered, and the guarantee is held by a test
that fails without it. Every opener that reaches the harness through
`hoverLocator` or `pressLocator` inherits it without a second copy of the
waiting logic.

## Proof

A test that fails on the pre-fix helper and passes on the fixed one, run both
ways; the certified tooltip case repeated 15 times before and after with its
pass count recorded; and the whole certified tooltip spec, which is the only
local exercise of the D11 frozen clock through the changed code.

The repeat runs cannot prove the flake gone - it has never reproduced on this
host, and a race that needs a loaded runner is not reproducible on demand. They
prove the fix costs nothing and breaks nothing. The thing that can close this
is a `certified report` job that stays green across runs, and that needs a push
this seat does not make.

## Relationship

Work-child of #578, which owns the certified census and graded this row as
harness rather than component; `parent` names #544 because the board's
generator refuses a task whose parent is a task. It is not one of #578's 27
unwaived failures: those are red, this one passes and is red only through the
flake budget, so it blocks the same job by a different route.

Bears on #574: both are reasons the blocking `certified report` job exits 1
while nothing is actually broken in a component.
