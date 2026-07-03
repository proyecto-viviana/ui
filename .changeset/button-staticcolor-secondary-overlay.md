---
"@proyecto-viviana/solid-spectrum": patch
---

Button: static-color secondary/outline text uses `transparent-overlay-1000`

Ported the S2 1.5.1 `Button.tsx` fix: under `staticColor`, the secondary-fill
text color and the outline-fill default text color are now
`transparent-overlay-1000` across default/hover/focus-visible/pressed states.
Our port had `baseColor("transparent-overlay-800")` here (default -800 bumping
to -900 on interaction), which matched neither the 1.5.0 value (`white`) nor
the corrected 1.5.1 one — static-color buttons are deliberately state-invariant
in upstream's fix.
