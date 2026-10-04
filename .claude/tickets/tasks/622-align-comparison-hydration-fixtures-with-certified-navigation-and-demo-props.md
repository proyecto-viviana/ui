---
id: 622
type: task
title: "Align comparison hydration fixtures with certified selectboxgroup navigation and steplist controls"
created: 2026-10-04
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-10-04,
      note: "ci release-readiness failed at test:comparison-hydrate on selectboxgroup spatial ArrowRight navigation and steplist comparisonControlProps undefined ariaLabel.",
    }
  - {
      state: merged,
      at: 2026-10-04,
      note: "updated selectboxgroup stage A keyboard test to ArrowDown matching single-column wrapped grid contract; dropped ariaLabel: undefined from stepListDemoDefaults so JSON round-trip matches object identity.",
    }
---

Align `apps/comparison` hydration test suite with certified behavior.

## Current gap

In `apps/comparison/test/solid-integration/fixtures.hydrate.test.tsx`, `selectboxgroup`
tested `ArrowRight` to advance semantic focus between `Starter` and `Pro`. Under
ticket #292, single-column wrapped grid navigation treats horizontal arrows as no-ops
and vertical arrows as column/row traversal.

Additionally, `stepListDemoDefaults` explicitly initialized `ariaLabel: undefined`.
When serialized into `data-comparison-control-props` via `JSON.stringify` and
parsed back, `JSON.parse` omits undefined keys, causing `toMatchObject` to fail.

## Done when

`vp run test:comparison-hydrate` passes cleanly (175/175 tests pass).
