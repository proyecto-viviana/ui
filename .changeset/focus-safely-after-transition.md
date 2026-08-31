---
"@proyecto-viviana/solidaria": patch
---

Port React Aria `focusSafely`: when the interaction modality is virtual, wait until CSS transitions end before moving focus. Contain-restore after a programmatic focus then lands after a following pointer hover, so `createFocusRing` re-samples pointer modality instead of keeping a keyboard ring.
