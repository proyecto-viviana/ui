---
id: 484
type: task
title: "Decide and honor the reduced motion budget for Button"
created: 2026-09-06
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-06,
      note: "VUI-004; blocked on an owner ruling, because main currently documents the opposite policy and the ledger never wrote a threshold",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "owner delegated the ruling; policy and threshold written below, fix extended to action-button, renumbered from the colliding 186 slot",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "Button and ActionButton both green in real Chromium, normal and reduced, 4/4",
    }
---

Button animates for a user who asked the operating system not to animate.

## Cause

`packages/viviana-ui/src/button/s2-button-styles.ts:62` declares
`transition: "default"`. `packages/viviana-ui/src/style/spectrum-theme.ts:1731-1734`
expands that to `transitionDuration: 150` with **no media condition**, so
`prefers-reduced-motion: reduce` never suppresses it. Unchanged since the
0.6.3 tag.

`packages/*/src/button/s2-action-button-styles.ts` carries the same token and
the same defect.

## The ruling

The owner delegated this decision on 2026-09-07. It is recorded here, and the
parity note now agrees with it rather than contradicting it.

**Policy.** Pinned React Spectrum is the parity oracle for _normal_ motion and
stays that way. It is **not** the ceiling for reduced motion. Viviana owns a
stricter budget: under `prefers-reduced-motion: reduce`, Button and
ActionButton resolve their nonessential interaction transitions to zero
duration. Upstream's contrary behavior is **recorded** by the certified suite,
not enforced on the port.

This does not break the certification gate — it splits it. The D2d assertion
stops being one React-equals-Solid comparison and becomes two explicit
per-stack contracts, so upstream drift is still caught and the deliberate
divergence cannot be silently reverted as drift.

**Threshold.** Under the reduced-motion media query, the certified Button and
ActionButton report, through real Chromium `Element.getAnimations()`:

- zero CSS transitions, and
- no animation of nonzero or infinite duration (`maxAnimationDurationMs: 0`).

Normal motion is unchanged and stays an exact pair-oracle contract: for the
`primary-outline` Button, exactly `background-color`, the four
`border-*-color` properties, and `color`, each at 150 ms.

**Scope of the divergence.** This ticket owns transition _timing_, not pressed
geometry. `pressScale` still applies its perspective/`translate3d` transform
and `will-change` under reduced motion, exactly as upstream does; removing the
transition makes that state change instant rather than animated. The existing
`pressScale` parity note therefore remains true as written.

**Rejected alternative.** Suppressing only the motion-bearing properties
(`transform, translate, scale, rotate`) and keeping the color fades was
considered, on the reading that `prefers-reduced-motion` targets movement
rather than color. It was rejected on the measurement: the six transitions the
Button actually emits on hover are all color properties, so that variant would
have closed the ticket while changing nothing a user could observe. It would
also have required a new `transitionProperty` key in the theme — a permanent
lowest-layer divergence in a fidelity-pinned port, carried through every future
upstream sync, bought for no measured benefit.

## Work

- [x] Record the policy where the certified comparison reads it, and amend
      `button-validation-notes.md` so the parity note and the policy no longer
      contradict each other.
- [x] Write the acceptance threshold into this entry.
- [x] Apply the fix to `s2Button` in both public styled packages.
- [x] Extend the same treatment to the sibling action-button, which shares the
      token and has the same defect.
- [x] Add a changeset.

## Out of scope

- A repo-wide motion audit. The remaining `transition: "default"` call sites in
  the button family are enumerated in the follow-up ticket rather than widened
  into this one.
- Publishing. That is #448 under #443.

## Done when

The policy and the threshold are written, the parity note agrees with them,
Button and action-button suppress the transition under
`prefers-reduced-motion: reduce`, a test proves it, and a changeset is present.

## Validation

Carried over from the superseded 186 slot, which measured the Button fix on
exact base `ffdd3e5`:

- Red-first normal positive control: an isolated `COMPARISON_PORT=4333` passed
  `D2 motion — Button` 1/1, proving exact React/Solid parity for
  `background-color`, four border-color properties, and `color`, each at 150 ms.
- Red-first reduced-motion failure on the same unpatched source: an isolated
  `COMPARISON_PORT=4335` failed `D2 motion (reduced) — Button` 1/1. Pinned React
  passed at the same six properties and 150 ms; Solid then returned those six
  forbidden transitions against its expected empty set.
- Post-fix real Chromium on `COMPARISON_PORT=4336` passed both D2 cases, 2/2.
- Focused public-package Button suites passed 2 files and 39 tests.

The ActionButton extension was measured and pinned in this pass, on current
`main` (`127bb0d9`):

- Red-first: with the ActionButton style condition applied but no pinned
  contract, `COMPARISON_PORT=4341` failed `D2 motion (reduced) — ActionButton`
  1/1 on the driver's pair-equality fallback. The failure output is the
  measurement — pinned React reported `background-color` and `color`, each at
  150 ms; Solid reported `[]`. Normal motion passed unchanged in the same run.
- Green: with `expectedMotion` pinned to that measurement,
  `COMPARISON_PORT=4342` ran both certified specs together and passed **4/4** —
  `D2 motion` and `D2 motion (reduced)` for Button and ActionButton — in 8.4 s.
- Command: `vp exec -c 'COMPARISON_PORT=4342 playwright test
e2e/certified/button.certified.spec.ts e2e/certified/actionbutton.certified.spec.ts
--grep "D2 motion" --reporter=line'` from `apps/comparison`.

Repository gates on the twelve changed paths: `git diff --check` clean,
`vp fmt --check` clean, `vp check` clean, `vp run typecheck` clean,
`guard:style-macro-parity` PASS (20/20 corpus entries still byte-identical to
the pinned upstream macro — the fix adds a condition at the call sites and
leaves the macro untouched), `docs:check` passed after `docs:generate`, and the
focused Button/ActionButton/ToggleButton suites passed 5 files and 46 tests.
`changeset:status --since=origin/main` lists both patch bumps.

No versioning, release, registry, publish, or push action was performed. La
Frontera must consume a published release and rerun its consumer evidence before
VUI-004 moves to `verified`.

## Relationship

Child of #24. VUI-004 in the La Frontera consumer defect ledger. Sequenced by
La Frontera's `producer-release-and-cutover-sequence-2026-09-06.md`; does not
claim that checkout. Renumbered from a `186` draft that collided with the taken
186 slot (`186-apply-iconcontext-styles-reactively-in-createicon`).
