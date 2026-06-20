---
"@proyecto-viviana/solid-spectrum": patch
---

Disclosure: route `DisclosureTitle`'s `styles` to the trigger button, font-restricted

`DisclosureTitle.styles` is meant to let callers tweak only the heading's
typography (`font`, `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`). It was
being merged onto the outer `<Heading>` wrapper, which doesn't carry the title's
own font — so a font override never took effect, and any non-font override leaked
through unfiltered.

It now applies to the trigger `Button` as a `style()` override, gated by
`getAllowedOverrides({ font: true })` — matching upstream S2's `DisclosureTitle`.
An allowed font property overrides the button's base typography; a disallowed
property (e.g. padding) is dropped. The prop type is narrowed to
`StylesPropWithFont`. Adds the `font` option to the internal `getAllowedOverrides`
helper plus the `fontProperties` / `StylesPropWithFont` exports it relies on.
