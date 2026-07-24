---
"@proyecto-viviana/solid-spectrum": patch
---

Correct the README's CSS import and refresh its parity evidence.

The install example imported `styles.css`, but this package's `theme.css` is a
stub and `components.css` is the file that carries the font faces alongside the
generated rules — following the README left Geist unloaded. The README now
imports `components.css`, says outright that the import is required (components
inject no styles of their own), and notes that `font-faces.css` must precede
other rules because CSS drops an `@import` that anything precedes.

The "Current Parity Evidence" block was also two months stale, reporting 69
catalogue entries with 33 live and 36 missing. The catalogue gap has since
closed: 78 entries, 78 live on both sides. The only remaining export gap is the
seven drag-and-drop and `LabeledValueContext` names, which are now listed
explicitly instead of summarized as "80 missing".
