---
id: 245
type: task
title: "Author ComboBox journeys from the upstream suites"
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

Implement `apps/comparison/playbook/journeys/combobox.md` (the orchestrator's
inventory: every interaction and the expected observation, cited to RAC
`ComboBox.test.js`, `react-aria/test/combobox/useComboBox.test.js`,
`@react-aria/test-utils/src/combobox.ts`, S2 `Combobox.test.tsx`, and the
overlay suites) as D13 journeys in `combobox.certified.spec.ts`. Every
inventory row becomes a step with an expectation; a row the harness cannot
observe is recorded as a waiver with the reason, never skipped silently.

## Done when

All inventory rows are journeys; each fails when its expectation is broken
on the Solid panel (prove one per axis in /tmp); the certified suite is green
or every red step is a ticket with source evidence.

## Inventory (orchestrator, 2026-09-02)

`apps/comparison/playbook/journeys/combobox.md` is written: 50 journeys
(CB-OC-01…CB-TCH-01) in the #244 step vocabulary, each step with the React
expectation and the upstream fact ids it proves; a coverage ledger maps all 345
rows of `journeys/facts/combobox.md` to a journey or to `unit-only` with the
owning suite. Prerequisites listed at the top of the file and owned here:

- fixture controls to add on **both** stacks: `selectedKey=none`,
  `itemsSource` (`defaultItems` default — today the fixture passes `items`, so
  typing filters nothing on either stack), `itemsPreset`
  (three/sections/many/empty/link/textValue/relabel), `layout`
  (default/nearBottom/inScroller/inDialog), `sentinels`, `withForm` (+ submit
  count, FormData snapshot), `loadingState` incl. `filtering` (+ load-more
  count), `autoFocus`, `shouldFocusWrap`, `shouldCloseOnBlur`, `prefix`,
  `eventLog` (`data-comparison-events`; fully-controlled handlers must follow
  the SEL047 contract).
- driver extensions (with #246, in `journeys-steps.ts`): `focus`,
  `keyDown/keyUp`, `touchDown/touchUp`, `dispatch`, `control`, `submit`,
  `reset`, `tapAt`, `ua(profile)`; a `motion` class that compares the
  enter/settled/exiting **phase**; live-region capture for `ua:apple`.
- ledger correction: OV020 is wrong (trailing DismissButton is always rendered,
  `Popover.tsx:353-357`).

## Relationship

Child of #243. Depends on #244. Findings that are Solid defects become
tickets under #136 or the component's own ticket.
