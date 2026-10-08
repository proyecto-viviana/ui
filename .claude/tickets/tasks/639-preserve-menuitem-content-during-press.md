---
id: 639
type: task
title: "Preserve MenuItem content during press"
created: 2026-10-08
parent: 24
priority: high
status: next
history:
  - { state: open, at: 2026-10-08, note: "Owner added Visualmode D24." }
  - {
      state: next,
      at: 2026-10-08,
      note: "Qualify pointer-target identity after #632 acceptance; repair only a current-source failure.",
    }
---

## Scope

UI owns D24. A MenuItem reportedly replaces its label before document
pointerdown bubbling. Qualify accepted current source first: #630/#534 and
stable child rendering may already repair the published rc.0 issue. Candidate
owners are `packages/solidaria-components/src/Menu.tsx` and both styled
`packages/{solid-spectrum,viviana-ui}/src/menu/index.tsx` adapters. Name exact
paths after #632 handoff. Repair only the lowest failing owner; shared helpers
need separate admission. No frozen render state, new API or consumer edits.

## Done when

A document bubble listener receives pointerdown with its original nested label
target connected and contained. Press/hover/focus and external text updates keep
child identity and live state. Stateful descendants stay mounted, action fires
once and legitimate close-on-action behavior remains. Passing current source
gets regression proof rather than an unnecessary product patch.

## Proof

Cover headless and both styled siblings: text, slotted label, render-prop JSX,
mount counter and external updates. Native down/up proof asserts containment
synchronously in the document listener after the item handler and verifies the
event was received. ComposedPath is diagnostic only. Include plain-menuitem and
pinned React controls plus keyboard/focus checks. Save old-source failure for
a repair; distinguish current passing source from published-source reports.
Run owning/candidate gates and report actual release/consumer evidence.

## Relationship

Child of #24, prioritized by #87 after accepted #632 because files overlap.
#557 owns separate native focus proof. Producer for Visualmode #10154/#10224.
Request: `visualmode/visualmode/.agents/ui-requests-2026-10-07/D24-menuitem-redraws-its-label-on-a-press.md`.
Pinned RAC/S2 reconciliation is the oracle. No duplicate Changeset for proof
only; a real fix notes actual package owners. Rollback stays within MenuItem
content. Planning evidence: `/tmp/ui-D23-D24-triage-2026-10-08.md`.
