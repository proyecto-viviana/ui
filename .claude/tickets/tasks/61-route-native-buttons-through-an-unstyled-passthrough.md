---
id: 61
type: task
title: "Route native buttons through an unstyled passthrough"
created: 2026-08-20
parent: 32
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task viviana-ui-button-passthrough" }
  - {
      state: open,
      at: 2026-10-08,
      note: "Held. The four natives were conversation, chip, nav-header, and event-card under packages/viviana-ui/archive/custom. They imported Button from solidaria-components and skipped solid-spectrum. The owner deleted that archive on 2026-09-01 under verified #62 and #145. Restoring them would add a viviana-native surface. A public unstyled Button name stays on #520.",
    }
---

Add the upstream-aligned unstyled Button passthrough in `solid-spectrum`, then
route the four native button implementations through it.

## Done when

The four paths share the passthrough behavior and preserve their public and
accessibility contracts.

## Relationship

Replaces `viviana-ui-button-passthrough` from
the retired tech-debt note.
