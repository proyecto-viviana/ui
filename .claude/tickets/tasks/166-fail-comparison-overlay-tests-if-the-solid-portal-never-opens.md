---
id: 166
type: task
title: "Fail comparison overlay tests if the Solid portal never opens"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-09-27,
      note: "overlay assertions follow the expanded trigger (aria-controls or aria-labelledby). A React body dialog does not satisfy the Solid panel; Dialog and DatePicker still open on both stacks",
    }
---

## Cause

DatePicker / DateRangePicker D4 and Dialog certified specs query
`page.getByRole("dialog")` page-global. If Solid does nothing while a React
dialog is open, `toBeVisible()` can still pass.

## Work

Scope overlay locators to the driven panel, or fail if the Solid portal never
opens.

## Done when

A Solid trigger that does not open a dialog fails the Solid panel assertion.

## Relationship

F-TEST-011.

## Round-2 note (2026-09-01)

Severity raised to high (F-HARNESS-002): React `ComparisonIsland` portals to `document.body`, Solid to the island's `comparison-overlay-root`, so a leftover React dialog satisfies a page-global `getByRole("dialog")` when Solid fails to open. ContextualHelp uses the same locator; `collection-button-controls-visual.spec.ts` never calls `waitForComparisonRouteReady`; route-ready accepts an empty-state canvas (F-HARNESS-006).
