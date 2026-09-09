---
"@proyecto-viviana/ui": minor
---

Move every overlay onto the Terminal Glass float tier.

Popover, Dialog, Tooltip and Toast now share one surface — `--surface-float` over
`--blur-clear`, the `--shadow-float` cast plus the `--edge-glass` rim, a `--track` edge —
instead of each wearing a different weight of glass or, in the tooltip's case, an opaque
Spectrum fill. Corners follow the re-cut ladder: 8 for a popover, 12 for a dialog, 5 for a
tooltip, 8 for a toast. Menu inherits the surface from the popover it opens in, insets its
rows at a flat 10px rather than off Spectrum's height-derived ramp, and paints the selected
row with `--surface-active`.

The info toast becomes the fuchsia ask rather than the blue accent, and takes `create-ink`
— white on the dark scheme's fuchsia is 2.9:1. Its action and close buttons resolve their
own ink from the toast's fill. `ContextualHelpTrigger` drops the sixteen hex literals it
carried and paints from register tokens.
