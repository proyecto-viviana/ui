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

## Relationship

Child of #243. Depends on #244. Findings that are Solid defects become
tickets under #136 or the component's own ticket.
