---
id: 537
type: task
title: "Re-certify the live parity suite on Solid 2 runtime"
created: 2026-09-13
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to run the full certified interaction parity suite against Solid 2.0",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "fresh-session planning reconciles the historical 2118 count with the last confirmed live discovery of 2177. Rediscover at execution, after foundation source work and #194 evidence integrity; preserve same-revision zero-failure/skip/waiver acceptance. No certified run or ticket closure occurred",
    }
---

## Cause

The core contract of `@proyecto-viviana/ui` is exact behavioral parity with
React Aria / React Spectrum S2 across keyboard, focus, ARIA, and mouse/touch
journeys. The original 2,118 count is historical; the last confirmed live
discovery is 2,177 cases. Upgrading the reactive runtime must not break
any interaction guarantees.

## Work

1. After the remaining foundation source work and #194 evidence prerequisites,
   rediscover the current suite and run the full comparison certified battery
   on one exact candidate revision:
   `vp run comparison:test:certified`.
2. Run axe accessibility contrast and WCAG 2.2 AA suites:
   `vp run a11y:ci`.
3. Verify zero drift across keyboard navigation, focus rings, and selection
   states.

## Done when

All live-discovered certified cases (last confirmed: 2,177) pass on the exact
Solid 2.0 candidate revision with zero failures, skips, waivers or incomplete
evidence. A count change requires explicit inventory reconciliation, never a
reduced bar or silent omission. Required accessibility checks also pass.

## Relationship

Child of #531. #194 evidence integrity and the other foundation source work
precede execution. Completing this task does not waive #531's remaining build,
child-verification or release requirements. Do not run the full lane during
the fresh-session documentation handoff.
