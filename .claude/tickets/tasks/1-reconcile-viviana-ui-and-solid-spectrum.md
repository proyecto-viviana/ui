---
id: 1
type: task
title: "Reconcile viviana-ui and solid-spectrum"
created: 2026-08-01
status: open
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
---

`viviana-ui` and `solid-spectrum` share **533 identical files, 28,092 lines**. Not similar —
identical. The remainder has diverged in both directions, so neither is a clean superset of the
other any more.

This is the single largest duplication in the hub, in the layer every product depends on. Every
fix has to be applied twice, and the parity gates that were supposed to catch the divergence do
not fail (#2).

## Scope

**Do not attempt a big-bang merge.** Order that works:

1. Freeze divergence: #2 first, so the gates fail loudly on new drift.
2. Establish which package is the home. `@proyecto-viviana/ui` is what products import, so it
   is the answer unless there is a reason recorded somewhere.
3. Move the 533 identical files to a single source and have the other re-export.
4. Then, file by file, resolve the diverged remainder.

## Done when

No file content is duplicated between the two packages, and one of them is a thin surface over
the other or gone.

## Relationship

Findings `L1-ui-is-a-fork-not-a-layer` (CONFIRMED),
`L8-design-system-forked-inside-its-own-repo`. Consolidation row R2.6. Blocked in practice by #2.
