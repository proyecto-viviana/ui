---
"@proyecto-viviana/solid-spectrum": patch
---

Tabs / SegmentedControl: freeze the selection indicator under `prefers-reduced-motion`

The animated selection indicator in `Tabs` (the line that slides to the active
tab) and `SegmentedControl` (the pill that slides to the selected segment)
transitioned its `translate`/`width`(/`height`) unconditionally. Upstream S2
gates that transition behind `'@media (prefers-reduced-motion: reduce)': 'none'`
on both indicators, so users who ask for reduced motion get an instant move
instead of a slide.

Both `style()` macro blocks now mirror upstream: the `transition` is the object
form with a `reduce → none` override, matching the existing precedent in our
`Disclosure`. No change for users without the reduced-motion preference.
