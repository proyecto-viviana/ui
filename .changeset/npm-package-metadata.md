---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/ui": patch
---

Give every package the metadata npm renders.

None of the five set `homepage` or `bugs`, so the npm page had no link to
documentation and no way to report a problem. `homepage` now points at the docs
site — https://ui.proyectoviviana.org — and `bugs` at the shared issue tracker.

`@proyecto-viviana/ui` also had no keywords at all — it could not be found by
search — and a description written for a maintainer rather than a user ("a
reskinned fork of @proyecto-viviana/solid-spectrum: the styled top layer is
duplicated and remapped to the Viviana v2 register"). It now says what the
package is: the Viviana design system for SolidJS, accessible and themeable, on
a headless ARIA foundation.

`guard:outbound-links` checks all of it, so a new package cannot publish
anonymously.
