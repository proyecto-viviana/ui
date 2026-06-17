---
"@proyecto-viviana/solidaria-components": patch
---

Slider: add the `SliderFill` component (port of react-aria-components 1.18)

React Aria 1.18 added `SliderFill`, a child of the slider that renders the
filled portion of the track so consumers no longer hand-compute a positioned
`<div>` from the slider's value. This ports it to our Slider family.

`SliderFill` reads the slider state from context and positions itself
absolutely: by default it spans from the slider's `minValue` (0%) to the current
value, and an `offset` prop moves the fill's start (clamped to the slider range).
It honours orientation — horizontal fills with `inset-inline-start`/`width`,
vertical with `bottom`/`height` — and exposes `isHovered`, `isDisabled`,
`orientation`, and `valuePercent` render-prop values plus the matching
`data-hovered`/`data-disabled`/`data-orientation` attributes, mirroring upstream.

Upstream's fill math is array-based (multi-thumb `SliderState`); our
`SliderState` is single-value, so this implements the single-thumb branch using
the same `(value - min) / (max - min)` percent formula the state itself uses.
Exported as `SliderFill` / `Slider.Fill` with `SliderFillProps`,
`SliderFillRenderProps`, and a `SliderFillContext` alias for export-surface
parity with React Aria.
