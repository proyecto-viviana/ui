---
id: 54
type: task
title: "Route TagGroup through the shared collection spine"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task migrate-taggroup-spine" }
  - {
      state: verified,
      at: 2026-10-08,
      note: "createTagGroup navigates through createGridList. createTag keeps Delete and Backspace removal, the tab stop override, and the remove-button tab. The local arrow, home, and end copy is gone. createTagGroup.test.tsx passed 7 tests and TagGroup.test.tsx passed 49.",
    }
---

Route TagGroup through the shared selection manager and keyboard delegate.

The component is behavior-certified, but `createTag` and `createTagGroup` still
implement horizontal Arrow/Home/End navigation, container-focus transfer, and
the item `tabIndex` calculation inline. Build `createTagGroup` on
`createGridList`; keep `useTag` as a thin grid-list-item wrapper with only the
Delete/Backspace removal behavior. Direction already flows through the
component data.

Delete the per-widget navigation copy after parity evidence passes.

## Relationship

Replaces `migrate-taggroup-spine` from the retired tech-debt note. Its
legacy manager and delegate prerequisites are complete.

## Bounded compiler qualification — 2026-10-08

Admission: source implementer generation `01d2dec7-aa09-4584-bd17-93841b552f9b`,
base `f8c339e0d3fbd456585ce14cbced4bc2be6a37b3`. Prior #630 owned stop is closed.
Owner authorizes Codex astra LOW fallback after saved Grok/AGY quota failures.
Editable source is only `createGridList.ts`, `createGridListItem.ts`, and
`createTagGroup.ts`; this ticket and generated status/roadmap are admitted.
All other repository paths, including createTag and the three owning suites,
remain read-only. This slice qualifies shared types separately from the verified
behavior history; it does not close native, release, or full-ticket proof.

Compiler qualification removes the four owned launch diagnostics (createTag:139;
createTagGroup:154,255,276). Canonical `vp run typecheck` drops from 19 (4 package,
15 script) to 15 unchanged script diagnostics, with zero new errors. GridList
and its item/helpers accept unconstrained T while retaining GridCollection<T>.
Focus handlers use the existing Solid JSX.EventHandler contract. The adapter
passes its live collection to the required legacy argument; the list manager
still ignores that argument and reads its own collection.

Before explicit suite cleanup, the required three-suite command reported 70/75
passing with five duplicate-DOM query failures. Original-source substitution
reproduced all five; these failures are not attributed to the type changes.
The 2026-10-08 cleanup amendment for this exact base/generation admits only
`packages/solidaria/test/createTagGroup.test.tsx`: import afterEach from vite-plus/test
and register afterEach(cleanup), preserving all tests, assertions, and manual cleanup.

With that lifecycle repair, the identical three-suite command passes 75/75 on
both repaired and admitted original product bytes. The three repaired product
files were restored byte-for-byte, with hashes in `/tmp/ui-54-cleanup-restoration.json`.
The 15-script compiler receipt remains applicable because product bytes did not
change. Import/cache ordering as a cause remains an inference; the paired control
qualifies explicit cleanup without claiming a product behavior regression.
Canonical existing unknown-valued calls and unconstrained declarations establish
the removed object restriction; no dedicated string/number regression is claimed
or required. No primitive fixture, mirrored assertions, Changeset, selection
engine, mergeProps, public names, or createTag edits are included.

Earlier sealed evidence is preserved under `/tmp/ui-54-superseded-artifacts`.
The amended handoff and manifests remain under `/tmp/ui-54-*`.

Independent review and conductor exact-generation owned stop remain required.
