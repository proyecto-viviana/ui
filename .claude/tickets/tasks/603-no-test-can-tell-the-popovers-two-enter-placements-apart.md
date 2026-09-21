---
id: 603
type: task
title: "No test can tell the popover's two enter placements apart, and it still enters before it is placed"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: 'opened from the 2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`, findings `r2-certified-b/F2` (medium) and `r2-certified-b/F3` (low), both partly confirmed. #582 is merged and the scheme has no backward transition, so the residue lives here. F2: `6ad3d12d` deletes the exact hold `6383939c` (2026-09-02, #257 #251) added to turn the same four DatePicker D2 rows green, and adds no test that can tell the two directions apart - `packages/solidaria-components/test/Popover.test.tsx:1234` renders `placement="bottom start"` where JSDOM measures every rect as 0, so `"bottom"` is both the seed and the measurement and the assertion is green under the old hold and the new pass-through. The skeptic refuted ''unproved'': #582 records a mutation (hold restored, D2 18/8, exactly those four) and `4f1c8435` (2026-09-15) centres the canvas, which explains why the opposite code was once green. What survives is that only a fixture flip discriminates, and no unit does. F3: RAC gates entering on a resolved placement (`react-aria-components@1.21.0 dist/private/Popover.mjs:100,112`) and ours reports entering while unplaced and substitutes the preferred axis (`packages/solidaria-components/src/Popover.tsx:774-776,789`), so a flipped popover can paint the bottom keyframe for a frame inside a running 200ms translate (`packages/solid-spectrum/src/popover/index.tsx:118-130,144-145`). That half predates `6ad3d12d` and is documented as a local deviation at `Popover.tsx:760-768`; the skeptic calls the painted reversal unproven because D2 pauses the first frame',
    }
---

## Scope

1. Add a Popover test that forces a flip — measured placement stubbed to `top`
   while `placement="bottom start"` — and assert `data-placement` is `top`.
   Check it fails on `6ad3d12d^` and passes at HEAD. That is the discriminating
   test #582 landed without.
2. Record in #582 why the 2026-09-02 certification was wrong: the D2 rows were
   green under the opposite implementation because the walk did not yet centre
   the canvas (`4f1c8435`), so the fixture, not the code, decided the sign.
3. Decide the entering seam and write the decision down. Either gate
   `isEntering` on a resolved placement and leave `data-placement` absent until
   measured, as `Popover.mjs:100/112` does, or - if Solid's post-paint
   measurement makes that impossible - keep the substitution and name it in the
   comment as a local deviation instead of "as upstream". Measure before
   choosing: record every frame's translate through the enter, not only the
   captured one.

## Done when

The flip test is green at HEAD and red at `6ad3d12d^`, `certified/datepicker
certified/daterangepicker` is 114 passed with its run recorded, and the entering
seam is either matched to RAC or written down as a named deviation with the
frame evidence that justifies it.

## Proof

`cd apps/comparison && vp run test:datepicker` at HEAD and at `6ad3d12d^`; the
unit run's counts; the per-frame translate record. In the commit and in a dated
`.agents/` receipt.

## Relationship

Child of #544, stage S2-h on [#544's path](../initiatives/544-cut-the-solid-2-release-candidate-and-its-public-face.md).
Residue of #582, which is merged; the fix it landed stands, and what is owed is
the proof that distinguishes it from its own predecessor. Bears on #584, whose
open-arrow D13 step 0 fails on `overlay` mid-entry (opacity 0.41, dy 34 against
React's 1 and 36) - the same enter, measured by a different driver.
