---
"@proyecto-viviana/ui": patch
---

Load the Geist font register again by moving its `@import` to the top of
`font-faces.css`.

The remote `@import` for Geist / Geist Mono / Geist Pixel sat at the end of the
file, after ~11KB of inlined S2 `@font-face` rules. CSS requires `@import` to
precede every rule other than `@charset` and `@layer` statements, so the rule
was invalid: browsers ignored it and bundlers stripped it from the output
entirely. The `--font-ui` / `--font-mono` / `--font-display` tokens still named
the Geist families, so every consumer silently rendered the whole Glasselated
register in the fallback sans-serif, with no warning and no failed request.

Verified against a packed consumer in a real browser: previously zero Geist
faces registered and zero font requests; now all three families register and
load, with Geist measuring distinctly from both the fallback and a nonexistent
family.
