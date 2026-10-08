---
id: 641
type: task
title: "Qualify Visualmode component caller contracts"
created: 2026-10-08
parent: 24
priority: high
status: next
history:
  - { state: open, at: 2026-10-08, note: "Owner added Visualmode D26." }
  - {
      state: next,
      at: 2026-10-08,
      note: "Prioritize bounded Card/AlertDialog parity checks and separate existing contracts, extensions and dev diagnostics.",
    }
---

## Scope

UI owns D26 through separate slices naming exact paths, oracle and negative
control before source edits:

- Card lowercase tabindex appears filtered from static/link cards despite its
  declaration. Start at both styled Card boundaries, preserving reactive getters,
  managed GridList focus and #630 child identity; shared helpers need admission.
- AlertDialog drops caller DOM/label attributes that pinned S2 forwards. Test
  both styled owners before repair, preserving authoritative role/name/state.
- Prove existing styled Picker onOpenChange and headless DropZone isDisabled.
  Investigate Button title against lower/S2 types: S2 omits GlobalDOMAttributes,
  so runtime forwarding alone does not authorize a styled declaration expansion.
- Capture exact Solid dev stacks, versions and action timing for reported
  STRICT_READ_UNTRACKED in Button/Dialog/DialogTrigger before naming its owner.
  No broad untrack or scheduler workaround.

Pinned S2 DropZone omits isDisabled and fixes padding at 24; standalone Card
id/selection and AlertDialog close-before-action also match the pin. Changing
these contracts or adding async keep-open/new props/sizes needs a distinct owner
decision. No omnibus API expansion, dependency or consumer edits.

## Done when

Every allegation has current-source regression evidence and a disposition.
Reproduced parity gaps are repaired at their lowest owner in both siblings.
Existing contracts have exact behavior proof. Extensions receive concrete owner
choices; dev claims retain stacks or explicit unreproduced limits. No subpart
disappears behind an umbrella completion claim.

## Proof

Card: static/link tabindex, same-node updates and managed precedence. AlertDialog:
supported id/data/labels, accessible naming/role, action/cancel ordering and SSR.
Picker: exact open/close counts and callback replacement. Headless DropZone:
disabled drop/paste isolation. Button: pinned type evidence before declarations.
Diagnostics: actual dev reproduction. Save old-source failures for real fixes,
final scoped checks and candidate gates. Notes cover actual changed packages;
report published versions and installed-consumer verification.

## Relationship

Child of #24, prioritized by #87. Producer for Visualmode #10151/#10153/#10154.
Request: `visualmode/visualmode/.agents/ui-requests-2026-10-07/D26-button-card-dropzone-and-alertdialog-lack-props.md`.
#635 owns Picker counts, #246 broader journeys, #636 FileTrigger, #557 native
focus and #534 confirmed scheduler work. Preserve those independent boundaries.
Each slice has a bounded commit/rollback scope and actual package Changeset.
Planning evidence: `/tmp/ui-D25-D26-triage-2026-10-08.md`.
