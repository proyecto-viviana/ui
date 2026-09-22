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
