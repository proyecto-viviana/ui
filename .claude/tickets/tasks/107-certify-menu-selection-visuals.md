---
id: 107
type: task
title: "Certify Menu selection visuals"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed Menu recertification record" }
---

Close the remaining Menu and ActionMenu list-style exclusions.

The certified scenarios omit single and multiple selection. The port still has
a local checkmark treatment and a hand-built checkbox box. The list also removes
`outline-color` from the computed-style comparison because inherited color does
not match upstream, even though the outline does not paint.

## Done when

Single and multiple selection indicators match upstream across sizes and themes,
the inherited color difference is resolved, the `outline-color` exclusion is
deleted, and strict D1, D3, D6, and D7 evidence passes.
