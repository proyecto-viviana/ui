---
id: 184
type: task
title: "Own lazy Button pending resolution"
created: 2026-09-01
parent: 24
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-01,
      note: "VUI-007 reproduced from a compound isPending prop in the public Viviana UI Button",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "acquired the lowest pending-resolution boundary and the two styled Button copies",
    }
---

La Frontera reported Solid's `computations created outside a createRoot or
render` warning when a compound reactive expression reached Button's lazy
`isPending` path from hover and press handlers. An app-owned memo suppresses
the warning, but does not correct the package boundary.

## Cause

Solid's compiled getter for a compound JSX prop lazily creates a memo when the
prop is read. Button reads pending state again from native interaction handlers,
after the render owner has ended. The current resolver therefore creates the
consumer memo without an owner. The styled Button copies also wrap `onPress`
with a second direct pending read even though the headless Button owns pending
interaction suppression.

## Work

- Retain a minimal public-package reproduction with the original compound
  pending expression and pointer/press path.
- Own pending resolution in `solidaria-components` before event handlers run.
- Remove only the redundant styled-Button pending read around `onPress` in
  `solid-spectrum` and `@proyecto-viviana/ui`.
- Keep pending focusability, disabled semantics, announcements, and press
  suppression unchanged.

## Done when

- The compound expression updates pending and disabled state without an
  ownerless-computation warning.
- Pointer and keyboard activation remain suppressed while pending and resume
  after pending clears.
- The public Viviana UI and Solid Spectrum Button regressions pass.
- Each changed releasable package has a patch changeset.
- Focused Button, build, repository, attribution, and Changesets gates pass.

## Validation

- Before the correction, the retained compound `isPending` reproduction
  emitted eight ownerless-computation warnings from pointer interaction.
- The focused Button suite passed `110/110` tests across
  `solidaria-components`, `solid-spectrum`, and the public
  `@proyecto-viviana/ui` package. The regression covers hover, click, pending
  focusability and `aria-disabled`, suppressed click and Enter activation,
  resumed Enter activation after pending clears, and zero warnings.
- The Solid Spectrum Button SSR test passed `1/1`; its hydration suite passed
  `2/2`.
- `build:components`, `build:solid-spectrum`, and `build:viviana-ui` passed,
  including declaration generation, package attribution, and pack checks.
- The comparison build produced `100` static pages. The strict parity report
  passed its frozen-baseline check with no new catalogue gaps.
- `vp run --no-cache check`, `fmt:check`, `guard:layer-boundary`,
  `guard:attribution`, `vp exec changeset status`, and `git diff --check`
  passed. Changesets reports patch bumps for all three changed packages.
- Two unrelated exact-base gates remain red and are not changed by this
  ticket: documentation generation rejects the invalid `closed` states in
  tickets #182 and #183, and `guard:attribution-headers` rejects the existing
  ContextualHelp reviewed mapping.

## Relationship

Initiative #24 owns component acceptance. This ticket owns producer blocker
VUI-007. La Frontera must still consume a corrected immutable release and rerun
its consumer evidence before it can close that blocker.
