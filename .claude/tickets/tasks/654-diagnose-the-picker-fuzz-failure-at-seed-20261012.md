---
id: 654
type: task
title: "Diagnose the Picker fuzz failure at seed 20261012"
created: 2026-10-12
parent: 243
status: open
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Journey Fuzz Nightly run 38269147587 failed its Picker leg on main; the seed also fails locally at a5341815.",
    }
---

## Cause

Not established. The nightly D13 fuzz compares the React and Solid Picker
panels over a seeded journey and fails when their observations differ or a
panel throws. Seed 20261012 generated six steps: click trigger, wheel on list
(dy 41), keyUp Enter, touchUp trigger, dispatch scroll on the list, resize
900x600.

- Hosted run 38269147587 (origin/main 73884d05) minimized it to two steps:
  click trigger, then keyUp Enter. All three attempts failed.
- A local replay at a5341815 also fails, and minimizes to one step: wheel on
  list, with the list never opened.

The two minimizations disagree, so either more than one divergence hides in
the journey or the minimizer is not deterministic for it. `journeyFails` in
`apps/comparison/e2e/drivers/journeys-fuzz.ts` treats any thrown error as a
failure, so a step aimed at a listbox that is not there may count as a
divergence without the two frameworks differing. An earlier local draft,
`apps/comparison/output/d13-journey-fuzz-picker-20261006.md`, shows seed
20261006 minimizing to a single touchDown on the trigger. The ComboBox leg
passed in the same run.

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

Fails today with `picker seed 20261012 minimized failing journey`.

## Relationship

Child of #243. Nightly from #247. Related: #246 (Picker journeys), #635,
#642, #652.
