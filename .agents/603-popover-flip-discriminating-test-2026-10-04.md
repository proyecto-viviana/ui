# Receipt: #603 Popover Flip Discriminating Test & Entering Seam

**Date:** 2026-10-04  
**Ticket:** #603  
**Status:** verified  

## 1. Summary of Changes

1. **Discriminating Popover Flip Test:**
   Added `updates data-placement to top when positioning flips even while entering` to `packages/solidaria-components/test/Popover.test.tsx`.
   - The test configures `placement="bottom start"` on `Popover`.
   - HTMLElement bounds and offsets are stubbed such that the trigger is positioned near the bottom edge of the viewport (`top: 700, bottom: 730, innerHeight: 768`), leaving only 38px below. The dialog requires 200px.
   - `calculatePosition` evaluates available space below (38px) vs above (692px), triggering a flip to `top`.
   - `mockGetAnimations` keeps the enter animation active (`data-entering="true"`).
   - Asserts `data-placement` updates to `"top"` even while `data-entering` is present.

2. **Mutation Verification:**
   - On HEAD (`placement: popoverAria.placement() ?? preferred`):
     - `vp test run packages/solidaria-components/test/Popover.test.tsx` -> **48 passed (48)**.
   - Under `6ad3d12d^` hold (`placement: entering ? preferred : (popoverAria.placement() ?? preferred)`):
     - `vp test run packages/solidaria-components/test/Popover.test.tsx` -> **1 failed | 47 passed (48)**:
       `AssertionError: expected 'bottom' to be 'top'`.

3. **Certified DatePicker / DateRangePicker E2E:**
   - `vp run test:datepicker`: 57 passed (0 failed).
   - `vp run test:daterangepicker`: 57 passed (0 failed).
   - Total: 114 passed across both suites.

4. **Entering Seam Decision (Scope 3):**
   - React Aria Components uses `useLayoutEffect` to resolve overlay position synchronously prior to browser paint (`Popover.mjs:100,112`).
   - SolidJS executes effects (`createEffect`) after DOM element creation and mount.
   - Gating `isEntering` on `!!placement` or omitting `data-placement` causes an unstyled flash at origin (`top: 0; left: 0`) before reactive measurement finishes.
   - Therefore, seeding the preferred axis while open-and-unplaced provides the baseline entering transform and keyframe, and measured placement immediately supersedes it (even mid-enter) once calculated.
   - This architectural decision is documented as a named local deviation in `packages/solidaria-components/src/Popover.tsx`.

5. **Historical Correction in #582 (Scope 2):**
   - Recorded why the 2026-09-02 certification was green under the prior hold implementation: the fixture canvas was not yet centered (`4f1c8435`), so fixture geometry rather than component placement logic determined the sign.
