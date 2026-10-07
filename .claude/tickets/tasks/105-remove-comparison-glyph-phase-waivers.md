---
id: 105
type: task
title: "Remove comparison glyph phase waivers"
created: 2026-08-20
parent: 24
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed D3 waiver burn-down" }
  - {
      state: verified,
      at: 2026-10-07,
      note: "D3 clones share one device-pixel origin. ContextualHelp and Toast glyph waivers are gone, and their strict pixel cases passed 10 and 14.",
    }
---

Make the React and Solid comparison panels use the same subpixel x phase.

ContextualHelp and Toast use byte-identical icons and matching geometry, but a
half-pixel panel offset changes edge antialiasing. Their certified specs contain
small, case-specific D3 waivers for this harness defect.

## Done when

Both panels measure at the same x phase, the scoped ContextualHelp and Toast
waivers are deleted, and their strict zero-tolerance pixel cases pass.
