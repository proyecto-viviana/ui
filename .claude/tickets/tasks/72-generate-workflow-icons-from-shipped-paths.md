---
id: 72
type: task
title: "Generate workflow icons from shipped paths"
created: 2026-08-20
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task s2wf-icon-shipped-path-provenance",
    }
---

Generate `s2wf` workflow icons from the paths in the shipped S2 modules, not
from the higher-precision raw SVG sources.

The shipped paths use SVGO-rounded values and are the visual oracle. SearchIcon
was fixed separately after a nine-pixel strict-diff failure. UI icons already
use shipped distribution paths; this task applies only to workflow icons.

## Done when

The generator reads all workflow-icon path data from the shipped modules and
affected D3 component evidence passes without per-icon substitutions.

## Relationship

Replaces `s2wf-icon-shipped-path-provenance` from
`.claude/current/tech-debt.md`.
