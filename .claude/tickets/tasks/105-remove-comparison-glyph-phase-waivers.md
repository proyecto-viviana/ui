---
id: 105
type: task
title: "Remove comparison glyph phase waivers"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed D3 waiver burn-down" }
---

Make the React and Solid comparison panels use the same subpixel x phase.

ContextualHelp and Toast use byte-identical icons and matching geometry, but a
half-pixel panel offset changes edge antialiasing. Their certified specs contain
small, case-specific D3 waivers for this harness defect.

## Done when

Both panels measure at the same x phase, the scoped ContextualHelp and Toast
waivers are deleted, and their strict zero-tolerance pixel cases pass.
