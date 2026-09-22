---
id: 609
type: task
title: "Tabs' roving `tabindex` lands one frame after the arrow move"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: 'opened from the 2026-09-21 certified census as one of #578''s remaining behaviour-class reds, and it is the one the census had not yet ticketed - #583 and #584 own the other two. Read from CI, not re-run locally: Certification Gates run 35668806426 at `b22a44eb` (= `origin/main`), shard job 106561030691, `[chromium] › e2e/drivers/events.ts:124:9 › D4 event sequence — Tabs › horizontal-regular · arrow-next-from-selected`. It failed on the first attempt and again on retry #1 and retry #2, so it is a failure and not a flake, and the merge job 106565094355 lists it as the row `tabs D4 — chromium › certified/tabs.certified.spec.ts › D4 event sequence — Tabs › horizontal-regular · arrow-next-from-selected`. The whole diff is two lines, `- Expected - 2 / + Received + 2`, at the D4 assertion `e2e/drivers/events.ts:143` (`expect(JSON.stringify(logs.solid, null, 2)).toBe(JSON.stringify(logs.react, null, 2))`): in two entries of the compared log the tab named `Overview` reads `"tabindex": "0"` where React reads `"-1"`, and the tab named `Parity` reads `"-1"` where React reads `"0"`. Both stacks agree on every event type, order, target role and name; only the roving tab stop disagrees, and it disagrees in the direction of being late - ours still names the old tab as the stop in the frame the events are recorded in. The gesture is small and fully in the spec: `tabs.certified.spec.ts:43-49` focuses the selected tab (`Overview`) with `focusLocator`, then presses `ArrowRight`; the recorded parts are `tablist`, `selected-tab` and `tabpanel`, and the target tab is `Parity`. Graded behaviour, not crash: keyboard navigation works and settles on the right tab, so this is carried into the RC as a ticket-backed waiver in `apps/comparison/e2e/certified-waivers.json` under #578''s waiver rule, with `expires: 2026-12-31` standing for the next release. What to investigate, named as a lead and not as a proven cause: the port commits `focusedKey` on two different clocks. `packages/solid-stately/src/tabs/createTabListState.ts:236` keeps a `selectedToFocusedFrame` handle and copies the selected key into the focused key inside `requestAnimationFrame` (`:255-256`, cancelled at `:261-263`), with a comment that this mirrors RAC writing in `useEffect` after paint; `packages/solidaria/src/tabs/createTabs.ts:322` writes `state.setFocusedKey(nextKey)` inside the keydown batch and then moves DOM focus in the same handler so it lands before keyup, while `:413` records that `focusedKey` is also written by `handleFocusIn`. A rendered `tabindex` that is derived from `focusedKey` can therefore be read after the events fire but before the frame that commits it. #507 (`merged`) owns this exact mechanism - it was opened to keep the mouse-click tab stop stable - and its merged note claims a local `arrow-next-from-selected` pass, so this row reopens that claim rather than reporting something #507 never touched',
    }
---

## Scope

One owning repository, `ui`, and one behaviour: after `ArrowRight` from the
selected tab, the roving `tabindex` must already name the newly focused tab in
the same turn the keyboard events are observed, as it does upstream.

Write paths: the tabs chain only - `packages/solid-stately/src/tabs/**` and
`packages/solidaria/src/tabs/**` - plus whatever regression test proves it.
Explicit non-goals: do not widen or delete the D4 tabs case, do not move
`flakyBudget` or any other budget in
`apps/comparison/e2e/certified-case-floor.json`, and do not edit
`apps/comparison/e2e/certified-waivers.json` except to remove this ticket's
entry once the case is green on CI.

The two-clock reading above is a lead. Reproduce the case first and let the
diff say where the write is late; if the real cause is elsewhere, fix that and
correct this ticket.

## Done when

`D4 event sequence — Tabs › horizontal-regular · arrow-next-from-selected` is
green, the rest of the certified tabs spec stays green, and a test that fails
on the pre-fix tree holds the ordering. #507's claim is restated on its own
ticket: either its note is corrected to say the case was not in fact covered,
or the mechanism it stabilised is shown to be untouched by this fix.

## Proof

The failing case run both ways with its exit code, the whole certified tabs
spec after the fix, and the package tests for both changed packages. A pixel or
screenshot baseline is not evidence here and must not be updated to make
anything pass.

Closing the waiver needs CI, not this host: the entry comes out of
`certified-waivers.json` when a `certified report` job shows the case passing,
and the guards that read the list
(`vp run comparison:test:certified-waivers`, `vp run
comparison:guard:certified-waiver-tickets`) must stay green across that edit.

## Relationship

Work-child of #578, which owns the certified census and graded this row as
behaviour rather than crash; `parent` names #544 because the board's generator
refuses a task whose parent is a task. Sibling of #583 (ToggleButton D2 under
reduced motion) and #584 (Picker D13 focus on open): the three are #578's
remaining behaviour-class reds and the only three entries in the waiver list.

Reopens the coverage claim in #507, which owns the same roving-tabindex
mechanism. Bears on #544: this is one of the reds the soft-launch cut carries
into the RC instead of holding the release for.
