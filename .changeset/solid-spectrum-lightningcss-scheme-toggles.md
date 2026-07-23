---
"@proyecto-viviana/solid-spectrum": patch
---

Restore the upstream `--lightningcss-light` / `--lightningcss-dark` space-toggle
atoms in `setColorScheme`.

lightningcss downlevels `light-dark()` ahead of time, so it cannot see a
`color-scheme` supplied through a CSS variable and picks the wrong branch. S2
carries these two transform atoms for exactly that case (and for a component
compiled against an older S2 embedded in a newer provider); dropping them was a
divergence from the pin, not a simplification.
