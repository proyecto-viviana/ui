---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/solidaria-components": patch
---

Apply SegmentedControlItem pressScale perspective transform to the inner content wrapper instead of the host radio button to preserve button geometry and focus during pointer hold, and use renderChildrenStable in ToggleButton to prevent child unmounting during press transitions.
