---
id: 484
type: task
title: "Decide and honor the reduced motion budget for Button"
created: 2026-09-06
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-06,
      note: "VUI-004; blocked on an owner ruling, because main currently documents the opposite policy and the ledger never wrote a threshold",
    }
---

Button animates for a user who asked the operating system not to animate.

## Cause

`packages/viviana-ui/src/button/s2-button-styles.ts:62` declares
`transition: "default"`. `packages/viviana-ui/src/style/spectrum-theme.ts:1731-1734`
expands that to `transitionDuration: 150` with **no media condition**, so
`prefers-reduced-motion: reduce` never suppresses it. Unchanged since the
0.6.3 tag.

## Blocked on an owner ruling

This cannot be closed by code alone, and the ruling is not ours to assume.

`main` currently documents Button's transition as deliberate React Spectrum
parity, at
`apps/comparison/playbook/components/button-validation-notes.md:365-368`, and
the certification gate is a parity diff. Honoring reduced motion therefore
**breaks a parity assertion on purpose**. Closing this entry means the owner
rules that Viviana's reduced-motion budget overrides React Spectrum parity for
Button, and that ruling has to be written down before the code changes —
otherwise the next certified run reverts it as drift.

The ledger also never specified an acceptance threshold. "Honors reduced
motion" needs a number or a rule: transition suppressed entirely under the
media query, or clamped to some ceiling. Write it.

Until both exist, this ticket stops at a written proposal. Do not land the
style change against a document that says the opposite.

## Work, once the ruling exists

- Record the policy where the certified comparison reads it, and amend
  `button-validation-notes.md:365-368` so the parity note and the policy no
  longer contradict each other.
- Write the acceptance threshold into the ledger entry.
- Apply the fix. `64b722b2` on stale branch `fix/184-vui-004-reduced-motion`
  carries it: two source edits apply to `main` with zero drift. The one merge
  is a `hoverLocator(target)` line in
  `apps/comparison/e2e/certified/button.certified.spec.ts`. Its ticket number
  collides with the taken 186 slot — renumber to this ticket.
- Extend the same treatment to the sibling action-button, which shares the
  token and has the same defect.
- Add a changeset.

## Out of scope

- A repo-wide motion audit. Other components almost certainly share
  `transition: "default"`; enumerate them in a follow-up rather than
  widening this one.
- Publishing. That is #448 under #443.

## Done when

The policy and the threshold are written, the parity note agrees with them,
Button and action-button suppress the transition under
`prefers-reduced-motion: reduce`, a test proves it, and a changeset is present.

## Relationship

Child of #24. VUI-004 in the La Frontera consumer defect ledger. Sequenced by
La Frontera's `producer-release-and-cutover-sequence-2026-09-06.md`; does not
claim that checkout.
