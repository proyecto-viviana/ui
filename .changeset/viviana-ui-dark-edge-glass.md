---
"@proyecto-viviana/ui": patch
---

Split the Glasselated edge-glass rim into a control rim and a surface rim, and
brighten both on dark.

The night `--edge-glass` top highlight was `rgba(255,255,255,0.14)` — all but
invisible — while daylight sat at `0.9`. Controls (buttons, chips, badges, tags,
nav pills, switches, meters) now match daylight exactly at `0.9 / 0.35`: they are
opaque, so their own fill contains the rim and it reads as the same lit edge in
either scheme.

Translucent containers cannot carry that value. Over a dark blurred backdrop the
full-strength ring outlines the whole container instead of catching its edge, so
they take a new `--edge-glass-surface` at `0.45 / 0.09` — cards, panels, popovers,
modals, trays, menus, the pill tab bar, and anything built on the `glassSurface()`
helper. The `boxShadow` theme keys follow suit: `emphasized` and `elevated` resolve
to the surface rim, `edge-glass` stays the control rim, and `edge-glass-surface` is
available for components that spell it directly. Daylight declares both aliases at
the same value — white-on-light barely separates from its ground, so one rim lifts
a button and a panel alike.

The `edgeGlassShadow` / `edgeGlassSurfaceShadow` fallbacks in
`style/spectrum-theme.ts` (used when a consumer never loads the token file) track
the same night values.
