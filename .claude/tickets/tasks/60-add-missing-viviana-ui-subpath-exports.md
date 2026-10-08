---
id: 60
type: task
title: "Add missing viviana-ui subpath exports"
created: 2026-08-20
parent: 32
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task viviana-ui-subpath-exports" }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Mirrored the 55 solid-spectrum component subpath entries into @proyecto-viviana/ui (package exports, pack entries, identical source). subpath-exports.test.ts closes the inventory. Did not run ui:smoke.",
    }
---

Add the 19 `solid-spectrum` subpath exports that are missing from
`@proyecto-viviana/ui` where the derivative-layer contract requires them.

## Done when

The export inventory closes and packed-consumer tests prove each public path.

## Relationship

Replaces `viviana-ui-subpath-exports` from the retired tech-debt note.
