---
id: 72
type: task
title: "Generate workflow icons from shipped paths"
created: 2026-08-20
parent: 33
status: done
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task s2wf-icon-shipped-path-provenance",
    }
  - {
      state: done,
      at: 2026-08-21,
      note: "generated workflow and UI icons from pinned shipped inputs, guarded both output trees, and passed focused parity evidence",
    }
---

Generate `s2wf` workflow icons from the paths in the shipped S2 modules, not
from the higher-precision raw SVG sources.

The shipped paths use SVGO-rounded values and are the visual oracle. SearchIcon
was fixed separately after a nine-pixel strict-diff failure.

The generator now owns the complete UI and workflow icon groups. This keeps
their source evidence, notice, and release guard in one place. It reads all 410
workflow modules from the pinned `@react-spectrum/s2@1.6.0` package and checks
that each ESM path matches the rendered CommonJS path. It reads 41 UI variants
from shipped private modules. Two Arrow variants and one Gripper variant use
the exact vendored raw SVG because S2 does not ship private modules for them.

The generator writes 846 files: 423 in Solid Spectrum and the same 423 in
Viviana UI. Each component records its exact generator inputs. The read-only
`vp run guard:generated-icons` command rejects changed, missing, or unexpected
output before release builds.

## Done when

The generator reads all workflow-icon path data from the shipped modules and
affected D3 component evidence passes without per-icon substitutions.

This condition is satisfied. `vp run guard:generated-icons` passes, and the
focused Icons and SearchField Playwright run passed all 44 cases.

## Relationship

Replaces `s2wf-icon-shipped-path-provenance` from
`.claude/current/tech-debt.md`.
