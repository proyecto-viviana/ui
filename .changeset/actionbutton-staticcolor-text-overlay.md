---
"@proyecto-viviana/solid-spectrum": patch
---

ActionButton/ToggleButton: static-color text uses `transparent-overlay-1000`

The shared static-color style (`s2ActionButtonStaticColor`) had
`baseColor("transparent-overlay-800")` as its default text color; upstream S2
uses a state-invariant `'transparent-overlay-1000'` (selected state is
`'auto'`, disabled `'transparent-overlay-400'` — both already matched).
Surfaced by the comparison app's staticColor contract test once the installed
upstream deps were aligned to the pinned S2 1.5.1.
