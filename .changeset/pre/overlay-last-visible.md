---
"@proyecto-viviana/solidaria": patch
---

createOverlay hides only the overlay that was topmost when the outside interaction started, and no longer prevents that interaction's default action, so the click that dismisses an overlay can still focus or activate what it landed on.
