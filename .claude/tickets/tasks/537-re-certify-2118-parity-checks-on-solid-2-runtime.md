---
id: 537
type: task
title: "Re-certify 2118 parity checks on Solid 2 runtime"
created: 2026-09-13
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to run the full certified interaction parity suite against Solid 2.0",
    }
---

## Cause

The core contract of `@proyecto-viviana/ui` is exact behavioral parity with
React Aria / React Spectrum S2 across keyboard, focus, ARIA, and mouse/touch
journeys (2,118 certified checks). Upgrading the reactive runtime must not break
any interaction guarantees.

## Work

1. Run the full comparison certified battery:
   `vp run comparison:test:certified`.
2. Run axe accessibility contrast and WCAG 2.2 AA suites:
   `vp run a11y:ci`.
3. Verify zero drift across keyboard navigation, focus rings, and selection
   states.

## Done when

All 2,118 certified parity checks pass with 0 waivers on the Solid 2.0 runtime.

## Relationship

Child of #531. Closes the migration vanguard initiative.
