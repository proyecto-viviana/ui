---
"@proyecto-viviana/ui": patch
---

Bind `--s2-font-family-display`, `--s2-font-family-sans` and `--s2-font-family-code` to the Geist register in `viviana-tokens.css`, so a page that imports the package's CSS renders Geist Pixel, Geist and Geist Mono without a font rule of its own. A consumer can still rebind any of the three in a narrower scope.
