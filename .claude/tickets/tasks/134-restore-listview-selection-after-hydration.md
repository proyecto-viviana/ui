---
id: 134
type: task
title: "Restore ListView selection after hydration"
created: 2026-08-22
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-08-22,
      note: "found while consolidating package test helpers during ticket #19",
    }
---

The interactive ListView hydration test fails after the client hydrates the
saved server markup in `listview-interactive-ssr.html`. The first row receives
DOM focus after a click, but its `aria-selected` value stays `false`.

## Evidence

The hydration suite uses this command:

```bash
vp test run --config vitest.hydrate.config.ts packages/viviana-ui/test/Collections.hydrate.test.tsx
```

Eight tests passed. The interactive ListView test failed. A focused retry gave
the same result.

The failure is not caused by the test-helper consolidation in ticket #19. A
controlled A/B run used the previous package-local `setupUser` helper, then the
shared `@proyecto-viviana/solid-spectrum-test-utils` helper. Both runs moved
focus to the row and left `aria-selected="false"`.

## Done when

- A click on a hydrated ListView row moves focus to that row and sets
  `aria-selected="true"`.
- A second click sets `aria-selected="false"`.
- The static ListView hydration case remains green.
- Hydration reports no markup mismatch.
- A focused regression test fails if this behavior changes.

## Relationship

Initiative #24 owns component acceptance. This defect was found while closing
ticket #19, but it is independent of the attribution and test-helper changes.
