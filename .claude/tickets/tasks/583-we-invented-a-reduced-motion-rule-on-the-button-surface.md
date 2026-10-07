---
id: 583
type: task
title: "We invented a reduced-motion rule on the button surface, and it costs two certified rows"
created: 2026-09-21
parent: 544
status: verified
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "graded by the conductor from shard 8 of Certification Gates run 35556441049 while grading the 132. Two rows, one cause, and the cause is a divergence we wrote ourselves rather than anything Solid forced. Filed separately from #582 because that one is a placement question in the popover and this one is two style declarations in the button family",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "not started, handed back: the scope contradicts a recorded ruling. The two reduced-motion branches (s2-button-styles.ts:56-59, s2-action-button-styles.ts:111-114) were added on purpose by 1af6eb71, closing #484, where the owner delegated the call on 2026-09-07 that React Spectrum is not the ceiling for reduced motion. That commit split D2 reduced into per-stack contracts, react recording upstream's retained transition and solid asserting none (actionbutton.certified.spec.ts:71-87); the togglebutton and togglebuttongroup specs never got the split, so they still demand pair equality. Neither this ticket, the brief nor the census names #484. Two ways out, and choosing is not mine: reverse #484 and delete the branch as scoped here, or keep #484 and give the two toggle specs the same per-stack reduced contract, which touches spec files only",
    }
  - {
      state: open,
      at: 2026-09-22,
      note: "waiver bookkeeping only; nothing about the defect or the #484 question changed. #578's review split `certified-waivers.json` one entry per case, so this ticket's two rows are now two entries - `D2 motion (reduced) — ToggleButton › default · hover-transition` and the `ToggleButtonGroup` twin - each anchored `^…$` on the whole haystack, which starts with the declaring file `e2e/drivers/motion.ts` and not with the spec path. A test in `apps/comparison/src/data/certified-waivers.test.ts` now puts every entry through Playwright's own `--list` discovery and fails unless it matches exactly one case, so widening either pattern is caught locally. `expires` moved from `2026-12-31` to `2026-10-21`: the recorded rule is that a waiver stands until the next release, no release date exists on disk, and the loader now refuses anything past a 60-day horizon; #610 owns replacing the horizon with the release",
    }
  - {
      state: in-progress,
      at: 2026-09-24,
      note: "aligned togglebutton.certified.spec.ts and togglebuttongroup.certified.spec.ts with #484's per-stack expectedMotion contract (react 150ms background-color/color transition, solid 0ms). Both certified specs pass 100% (154/154 passed, 0 failed, 0 waived). Awaiting CI certified report to retire waiver entries.",
    }
  - {
      state: verified,
      at: 2026-10-07,
      note: "Local named specs, VIVIANA_GATE=1 COMPARISON_PORT=4322, workers 2: 214 passed, 30 failed, of 244. ToggleButton 84/84 and ToggleButtonGroup 70/70 green. Button 42/42 green, both D2 rows included. ActionButton D2 normal and reduced green. The 30 reds are ActionButton D1, D3, D7, and D8, a text-slot width and contrast-descriptor mismatch (span versus button), outside the motion clause. No linkbutton.certified.spec.ts; LinkButton uses s2Button, which Button's D2 row covers. Retired both #583 waiver entries. The reduced-motion CSS branches stay, per #484 and 1af6eb71. Mutation: pointing Solid's reduced expectation at background-color and color at 150ms made both reduced toggle rows fail on an empty transition list; the empty Solid contract was restored by hand. vp test run apps/comparison/src/data/certified-waivers.test.ts: 38 passed.",
    }
---

## The defect

`D2 motion (reduced) — ToggleButton › default · hover-transition` and its
`ToggleButtonGroup` twin. Under `prefers-reduced-motion: reduce`, pinned React
Spectrum still records two 150ms transitions on the trigger, `background-color`
and `color`, easing `cubic-bezier(0.45, 0, 0.4, 1)`. Solid records no animation.

That split is the owner ruling on #484 (2026-09-07), landed in `1af6eb71`: React
Spectrum is not the ceiling for reduced motion, and Button and ActionButton
resolve nonessential interaction transitions to zero duration. The branches stay
in `packages/solid-spectrum/src/button/s2-action-button-styles.ts` and
`s2-button-styles.ts`:

    transition: { default: "default", "@media (prefers-reduced-motion: reduce)": "none" }

Upstream `ActionButton.tsx` and `Button.tsx` keep a plain `transition: 'default'`.
`ToggleButton` shares the action-button style, which is why the roster landed
the rows on togglebutton. Those two specs still demanded pair equality after
the ruling, so the rows stayed red. `9f1942a8` gave them the same per-stack
`expectedMotion` the button family already had. The two waiver entries stayed
until that contract was proved and the entries removed.

## Scope

Keep both reduced-motion branches. Do not delete them, and do not copy the
edit onto `viviana-ui`: the layer-boundary baseline marks both button style
files diverged, and they already carry the same branch.

The contract, already on the specs:

- Normal motion stays exact pair equality, and each side's absolute expectation
  is the upstream transition set at 150ms.
- Reduced motion is per stack. React records the upstream transitions. Solid
  records `transitionProperties: []`, `durationMs: 0`, and
  `maxAnimationDurationMs: 0`.

On the action-button surface (ActionButton, ToggleButton, ToggleButtonGroup)
those properties are `background-color` and `color`. On Button they are the six
painted color properties. LinkButton uses `s2Button` and has no certified spec
of its own.

The toggle spec comments name #484. The two #583 entries leave
`apps/comparison/e2e/certified-waivers.json` in the same change that verifies
this ticket. A verified ticket with those entries still listed fails
`CLOSED_TICKET_STATES` in the waiver guard.

Explicit non-goal: disclosure, tabs, segmented control, skeleton, and toast
reduced-motion sites stay as they are. Arguing the accessibility merits again
is also a non-goal; #484 already recorded the owner call. ActionButton width
and contrast rows are a different defect and are not this ticket.

## Done when

`certified/togglebutton` and `certified/togglebuttongroup` are green. Reduced
motion on those rows is the per-stack contract above, not the same two
transitions on both sides. Button and ActionButton D2 rows, normal and reduced,
stay green. LinkButton has no `linkbutton.certified.spec.ts`; Button covers the
shared `s2Button` surface.

## Proof

Run `certified/togglebutton`, `certified/togglebuttongroup`, `certified/button`,
and `certified/actionbutton`, and record the counts in history. There is no
`certified/linkbutton` spec. Mutation-prove the reduced rows by pointing Solid's
reduced expectation at the two 150ms properties, watching those rows go red,
and restoring the empty Solid contract by hand. Do not put the CSS branch back:
that reverses #484 and needs a comparison rebuild.

## Relationship

Child of #544, and one of the fourteen components the roster census at
`.agents/certified-169-census-2026-09-21.md` names. Independent of #582, which
is the four date-picker motion rows.
