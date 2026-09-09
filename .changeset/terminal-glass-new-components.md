---
"@proyecto-viviana/ui": minor
---

Add the Terminal Glass atmosphere and readout components: `PixelMeter` (row, ring
and grid pixel readouts over the headless Meter), `TerminalLog` (a matte-well
transcript with per-span channels, boot-in stagger and a caret), `HudFrame`
(corner brackets, CRT grille and scan sweep around media) and `SceneBackdrop` (a
graded, pixelated scene plate with veil, skyline, perspective grid and sweep).
All four are local additions with no S2 counterpart; every animation is gated on
`prefers-reduced-motion` in CSS.
