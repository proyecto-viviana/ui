---
id: 654
type: task
title: "Diagnose the Picker fuzz failure at seed 20261012"
created: 2026-10-12
parent: 243
status: merged
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Journey Fuzz Nightly run 38269147587 failed its Picker leg on main; the seed also fails locally at a5341815.",
    }
  - {
      state: merged,
      at: 2026-10-12,
      note: "Fuzz artefact, two of them: an orphan keyUp against React's render-time focus-visible snapshot, and a browser crash counted as a divergence. Driver fixed; the seed passes. The next nightly verifies.",
    }
---

## Cause

The nightly D13 fuzz compares the React and Solid Picker panels over a seeded
journey. Seed 20261012 generated six steps: click trigger, wheel on list
(dy 41), keyUp Enter, touchUp trigger, dispatch scroll on the list, resize
900x600. Hosted run 38269147587 minimized the failure to click trigger, keyUp
Enter; a local replay minimized it to wheel on list. Both verdicts come from
the harness, for different reasons.

**The hosted verdict.** With each panel's observations printed, the only
difference is at the keyUp step: the focused option, Pro, carries
`data-focus-visible="true"` in Solid and not in React. The step is a release of
Enter with no press before it. A lone `keyup` switches the interaction modality
to keyboard in both libraries and changes no state. Pinned `useOption` computes
`isFocusVisible: isFocused && manager.isFocused && isFocusVisible()` while
rendering, so React shows the value from its last render until something else
re-renders the option; Solid's option reads the modality reactively and
follows it at once. React's panel holds a stale snapshot, Solid's holds the
current modality. No keyboard produces the step, and freezing Solid's option to
match an unrendered React state would be a defect, not parity.

**The local verdict.** Replaying "wheel on list" alone gave `page.goto: Page
crashed`. `journeyFails` returned true for any thrown error, so the minimizer
accepted a browser crash as a divergence and reduced the journey to the step
that was running when Chromium died.

## Scope

Find out which of the two it is: a real React and Solid difference in the
Picker, or a harness verdict on a step with no target. Replay each minimized
journey on both panels with the observations printed. A real difference gets a
certified Picker case and a repair in its owner. A harness verdict gets the
driver changed so a step without a target is the same no-op on both panels,
and the nightly stops failing on it. No retry added to the nightly.

## Done when

The cause is named with the two panels' observations for both minimized
journeys, and `JOURNEY_SEED=20261012` passes locally for the Picker for the
right reason.

## Proof

```bash
vp run comparison:build
JOURNEY_FUZZ=1 JOURNEY_SEED=20261012 JOURNEY_BUDGET_MS=180000 JOURNEY_MAX_STEPS=16 \
  vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/certified/picker.certified.spec.ts --grep "D13 fuzz" --reporter=line
```

Failed before the repair with `picker seed 20261012 minimized failing journey`.

## Relationship

Child of #243. Nightly from #247. Related: #246 (Picker journeys), #635,
#642, #652.

## Repair — 2026-10-12

`apps/comparison/e2e/drivers/journeys-fuzz.ts`:

- `dropOrphanKeyUps` removes each `keyUp` that no earlier `keyDown` of the same
  key is holding. `journeyFails` applies it to every journey it runs, so the
  minimizer cannot recreate the step by deleting a `keyDown`.
- A browser failure (`Page crashed`, a closed target) is rethrown instead of
  counted, so the run fails with the real error and nothing is minimized.

`journeys-driver.unit.test.ts` covers the filter: the hosted journey reduces to
its click, a paired press and release stay, a second release goes. With the
driver changed, the Proof command above passes for the Picker, and the same
seed passes for the ComboBox (2 passed). `vp run
comparison:test:journeys-driver`: 13 passed.

Not yet proved: a green hosted Journey Fuzz Nightly, which runs on its
schedule after the push.
