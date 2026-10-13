---
"@proyecto-viviana/ui": patch
---

Remove the Adobe Clean and Source Code Pro `@font-face` blocks from `font-faces.css`. The sheet now holds the Geist import alone and makes no request to `use.typekit.net`. Styles that name the serif, Arabic or Hebrew Spectrum faces fall back to the system faces listed after them.
