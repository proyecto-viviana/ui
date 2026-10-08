---
id: 639
type: task
title: "Preserve MenuItem content during press"
created: 2026-10-08
parent: 24
priority: high
status: in-progress
history:
  - { state: open, at: 2026-10-08, note: "Owner added Visualmode D24." }
  - {
      state: next,
      at: 2026-10-08,
      note: "Qualify pointer-target identity after #632 acceptance; repair only a current-source failure.",
    }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Admit three owning suites and delegated native target proof after accepted #557; repair only a reproduced current-source owner.",
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

The original nested label remains connected and contained through managed
pointerdown, verified synchronously at the framework delegation root and after
real mouse down before up. Document delivery matches measured React behavior
and pinned propagation; no forced bubbling. Press/hover/focus and external text
updates keep child identity and live state. Stateful descendants stay mounted,
action fires once and legitimate close-on-action behavior remains. Passing
current source gets regression proof rather than an unnecessary product patch.

## Proof

Cover headless and both styled siblings: text, slotted label, render-prop JSX,
mount counter and external updates. Native down/up proof observes the original
event after delegated managed handling, with count one, positive pressed state,
and containment in both captured menu and framework roots. Measure document
capture/bubble with plain-menuitem and installed React controls: plain bubble
count one validates the harness; React/Solid delivery must agree, with connected
containment whenever received. Record installed versions separately from pinned
source. ComposedPath is diagnostic only. Include keyboard/focus checks. Save
old-source failure for a repair; distinguish current passing source from
published-source reports. Run owning/candidate gates and report actual
release/consumer evidence.

## Relationship

Child of #24, prioritized by #87 after accepted #632 because files overlap.
#557 owns separate native focus proof. Producer for Visualmode #10154/#10224.
Request: `visualmode/visualmode/.agents/ui-requests-2026-10-07/D24-menuitem-redraws-its-label-on-a-press.md`.
Pinned RAC/S2 reconciliation is the oracle. No duplicate Changeset for proof
only; a real fix notes actual package owners. Rollback stays within MenuItem
content. Planning evidence: `/tmp/ui-D23-D24-triage-2026-10-08.md`.

## Registered D24 qualification — 2026-10-08

After #557's accepted native accessor slice and exact-generation stop, the
sole OS/herdr writer receives `/tmp/ui-639-dispatch-2026-10-08.md` in eligible
`repo:ui` on main. This is bounded current-source qualification, with product
repair conditional on an owning regression. The dispatch overrides the older
brief's native paths and unconditional document-bubble assertion.

Local createPress and pinned usePress both stop handled primary pointerdown.
Both installed frameworks delegate handlers to their render root, so an item
native listener runs too early. Qualify target identity synchronously in a
native bubble listener registered at the same framework root after its
handler registration, then immediately after actual mouse down before up. Both the captured menu
root and framework root must contain the original label; fixture-root
containment alone is insufficient.
Measure document bubble alongside installed React and plain-DOM positive
controls; do not change propagation or force dispatch. The connected-target
contract remains required. Extra document delivery beyond actual pinned
behavior is a separate extension decision, not a prerequisite for parity.

Admit owning Menu tests in solidaria-components and solid-spectrum and new
private viviana-ui Menu.test.tsx; existing focus-browser main.tsx and existing
filetrigger-dropzone-focus.browser.ts; new private comparison
`e2e/fixtures/menu-react-control.js`; this ticket and generated views. Preserve
all eight accepted native cases, pre-navigation error/rejection observers,
original tab sequence, runner and Vite config. The React control resolves
existing comparison dependencies; record versions separately from the pin.
Conditional product paths are headless Menu.tsx or both styled menu/index.tsx
adapters only after a reproduced current-source owner failure. A real repair
gets exact-base source controls, failure-safe restoration, and a Changeset
for changed owners only. Shared utils, press/menu hooks, OptionContent,
styles, public API, dependencies, configs and consumer code are read-only.

All three owning suites cover live render state with stable nodes, slotted
labels/descriptions, primitive/render-prop/stateful content, external updates,
latest once-only action, disabled inertness and legitimate final close.
Headless native proof is bounded; full styled-native, candidate, release and
installed-consumer gates remain separate. Passing current source receives
honest proof-only evidence and no fabricated red or duplicate Changeset.

## Bounded current-source proof — 2026-10-08

Worker generation `38a5600f-00bd-4913-a003-ade252218973` qualified clean
`de2b27fcb5209208a3c531d735cde2b5d14633af` after accepted #557 commit
`182b57e0` and its closed owned stop. Current source passes: no product repair,
negative source substitution or Changeset. The reported built `0.8.0-rc.0`
consumer failure was not rerun and remains distinct from this source proof.

The three owning Menu suites pass 201 tests, including 24 added cases for
stable primitive/slotted/render-prop/stateful content, external updates,
latest callbacks, disabled items and managed action close. Standalone Enter
retains original children; managed close permits unmount. Existing #632
popup precedence and #542 indicator assertions remain intact.

The unchanged strict native runner passes all 12 cases (eight retained,
four added). Real nested-label mouse down yields one capture and one later
framework-root observation per control. Original targets remain connected
and contained in both captured menu and framework roots, with pressed and
live-pressed positive before mouse up. Document bubble counts are plain 1,
React 0, Solid 0. Both frameworks activate once on release, report close at
that stage, and retain standalone nodes after Enter. Every case records zero
console errors, page errors and unhandled rejections. Solid development
`STRICT_READ_UNTRACKED` warnings remain visible, not suppressed.

Installed React/ReactDOM 19.2.8 and RAC 1.21.0 are runtime controls; the
source oracle remains `f56660b234bd588751c9f35b85d6fe6e17e45ccf`, with no
claim of byte identity. Root typecheck exits 2 with the same 24 diagnostics
as #557, all in unchanged files; its scope excludes these test files.

Handoff: `/tmp/ui-639-worker-result-2026-10-08.md`, checks/digests JSON,
raw logs and actual diff. Await conductor review and exact-generation stop.
Full styled-native, candidate, release and installed-consumer proof remains
pending, as does separate #632 Escape-focus debt. This bounded result does
not close #639 or certify the Menu family.

## Conductor acceptance of bounded proof — 2026-10-08

The conductor read the final handoff, checks, actual diff and independent
review; verified all recorded source, changed-path, raw-log and receipt
digests; and closed generation `38a5600f-00bd-4913-a003-ade252218973`
with an owned stop returning `ok:true`, `closed:true`. The accepted evidence
is 201 owning unit tests and 12 native cases, with no product change or
Changeset. The independent review includes the corrected standalone Enter
identity assertions. Root typecheck still has 24 inherited diagnostics;
252 development warnings and the hub audit's 13 failed checks remain
recorded limitations, rather than green gates. Full styled-native, candidate,
release and installed-consumer qualification, plus separate #632 Escape
focus debt, remain open. Acceptance receipts are
`/tmp/ui-639-conductor-verification-2026-10-08.json` and
`/tmp/ui-639-owned-stop-2026-10-08.json`.
