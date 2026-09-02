---
id: 246
type: task
title: "Author Picker journeys from the upstream suites"
created: 2026-09-02
parent: 243
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
---

## Work

Same as #245 for Picker (RAC `Select`): inventory at
`apps/comparison/playbook/journeys/picker.md`, cited to RAC
`Select.test.js`, `react-aria/test/select/HiddenSelect.test.tsx`,
`@react-aria/test-utils/src/select.ts`, S2 `Picker.test.tsx` /
`Picker.browser.test.tsx`, and the overlay suites. Includes the hidden
`<select>` form path, autofill, `isQuiet`/size variants only where S2 exposes
them, and the mobile tray branch if the harness can emulate it.

## Done when

As #245.

## Relationship

Child of #243. Depends on #244.
