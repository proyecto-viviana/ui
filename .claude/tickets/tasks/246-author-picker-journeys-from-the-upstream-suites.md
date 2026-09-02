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

## Inventory (orchestrator, 2026-09-02)

`apps/comparison/playbook/journeys/picker.md` is written: 46 journeys
(PK-OC-01…PK-OV-06) with the React expectation per step and a coverage ledger
over all 312 rows of `journeys/facts/picker.md`. Prerequisites owned here:

- fixture controls to add on both stacks: `selectedKey=none`, `itemsPreset`
  (three/sections/many/empty/link/typeahead/numeric/big/icons), `layout`,
  `sentinels`, `withForm`, `withClearButton`, `autoFocus`,
  `shouldCloseOnSelect` and `isOpen` (verify S2 exposes them; else record the
  rows as `unit-only`), `eventLog` incl. console-warning capture (EV-012).
- driver extensions: same as #245 plus `selectOption(hiddenSelect, value)`
  (the autofill path, FM-008).
- picker-specific expectations that differ from ComboBox and are easy to get
  wrong in a shared port: modal popover (`role=dialog`, underlay, two Dismiss
  buttons, `preventScroll`, `inert`, **no** close on scroll), real DOM focus on
  options (never `aria-activedescendant`), mouse opens on press **start**,
  touch on press **up**, closed-trigger ArrowLeft/Right and 1000 ms typeahead
  select without opening, empty collection cannot open (S2 omits
  `allowsEmptyCollection`), S2 `isPressed={false}` on the trigger.

## Relationship

Child of #243. Depends on #244.
