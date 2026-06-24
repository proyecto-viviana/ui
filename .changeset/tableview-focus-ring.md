---
"@proyecto-viviana/solid-spectrum": patch
---

TableView now mirrors React Spectrum S2's focus-ring overlay geometry.

Focused rows publish the upstream `--topFocusRing` and `--bottomPosition` custom
properties and draw the raw row `::after` focus indicator. Focused headers, body
cells, selection cells, and editable cells render the presentational
`CellFocusRing` child, so non-first body cell focus rings overlap the divider
above by 1px like upstream.
