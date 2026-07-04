import { registerAxTreeDriver } from "../drivers/ax";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): ProgressCircle — the circular sibling of
 * ProgressBar. A pure-SVG determinate/indeterminate spinner with no text.
 * Upstream S2 `ProgressCircle` (over RAC `useProgressBar`) and the port both
 * render
 *
 *   <div role="progressbar" aria-valuenow aria-valuemin aria-valuemax
 *        aria-valuetext aria-label class=wrapper>
 *     <svg fill="none" width="100%" height="100%" style="display:block">
 *       <circle r=… class=hcmStroke/>   // forced-colors safety stroke
 *       <circle r=… class=track/>        // gray-300 rail
 *       <circle r=… class=fill           // blue-900 arc
 *              pathLength=100 stroke-dasharray="100 200"
 *              stroke-dashoffset={100 - percentage} stroke-linecap=round/>
 *     </svg>
 *   </div>
 *
 * The structures are byte-identical (verified against RAC `ProgressBar` — the
 * shared value/label hook — and a line-for-line read of the upstream
 * `wrapper`/`track`/`fill`/`hcmStroke` `style()` macros, the `radiusForSize`
 * `calc(50% - …rem)` table, and the `pxToRem` stroke-width scale). So the
 * `role="progressbar"` div is the D1 `target`, and the three concentric circles
 * (plus the `<svg>` itself) are diffed `parts`: `svg` (the geometry host, where
 * the fix below lives), `hcm` / `track` / `fill` (the stroke table + the fill's
 * dash geometry + the −90° rotate).
 *
 * Applicable drivers — D1 (computed styles: the SVG stroke/geometry longhands),
 * D3 (pixel), and D6 (AX: role=progressbar + aria-valuenow/min/max/valuetext,
 * and their *absence* when indeterminate). The rest are **not** registered:
 *   - D2 motion: the only animation is the *indeterminate* spin — an infinite
 *     `rotationAnimation`+`dashoffsetAnimation` pair that (a) runs from load with
 *     no interaction trigger to freeze into a stable filmstrip, and (b) is
 *     emitted under build-time-hashed `keyframes()` identifiers that differ
 *     between stacks by construction, so a metadata pair-diff on `animation` /
 *     `animation-name` would be a false positive. The keyframe *content* and
 *     timing are verified byte-identical by source read instead: rotation
 *     `0deg → 360deg`, dash-offset `75 → 20` (peak at 30%), composed as
 *     `<rot> 1s cubic-bezier(.6,.1,.3,.9) infinite, <dash> 1s
 *     cubic-bezier(.25,.1,.25,1.3) infinite` on both stacks (the port's
 *     `s2ProgressCircleIndeterminateAnimation` mirrors upstream's inline literal
 *     exactly). Determinate value changes carry no transition.
 *   - D7 contrast: ProgressCircle has **no text node** — it is a bare SVG arc, so
 *     there is no foreground/background text pair to measure. The arc-vs-track
 *     colour is a shared-token `stroke` already asserted byte-for-byte by D1.
 *   - D4 events / D5 focus: not pressable or focusable — `role="progressbar"`
 *     with no tabindex or press handling.
 *   - D8 target-size: not an interactive target — no hit box to floor-check.
 *
 * Source-read faithfulness fix landed alongside this cert (a self-inflicted
 * divergence from the upstream `<svg>` source, per the parity rule):
 *   - The port's `<svg>` omitted upstream's `style={{display: 'block'}}`
 *     (upstream ProgressCircle.tsx). An inline SVG sits on the text baseline and
 *     reserves line-box descender space, so the omission is a real computed-style
 *     (and potential pixel) divergence — now **guarded** by diffing the `svg`
 *     part with `display` in the allowlist (red before the fix: `inline` vs
 *     upstream `block`).
 */
const progressCircleScenario: DriverScenario = {
  slug: "progresscircle",
  title: "ProgressCircle",
  // The ProgressCircle root carries `role="progressbar"` and the `wrapper` macro.
  // `data-comparison-progresscircle="controlled"` is threaded onto it by both
  // fixtures and forwarded through `getDataAttributes` (data-* is always kept),
  // so it is present and unique on the root (the outer row wrapper carries the
  // separate `data-comparison-control-root`).
  target: ({ canvas }) => canvas.locator('[data-comparison-progresscircle="controlled"]'),
  parts: {
    // The `<svg>` geometry host — `fill: none`, and (the fix) `display: block`.
    svg: ({ canvas }) => canvas.locator('[data-comparison-progresscircle="controlled"] > svg'),
    // The three concentric circles, in DOM order: hcm-stroke, track, fill.
    hcm: ({ canvas }) =>
      canvas.locator('[data-comparison-progresscircle="controlled"] > svg > circle:nth-child(1)'),
    track: ({ canvas }) =>
      canvas.locator('[data-comparison-progresscircle="controlled"] > svg > circle:nth-child(2)'),
    // The fill arc: variant `stroke`, the −90° `rotate`, and the dash geometry
    // (`stroke-dasharray` / `stroke-dashoffset` = `100 - percentage`).
    fill: ({ canvas }) =>
      canvas.locator('[data-comparison-progresscircle="controlled"] > svg > circle:nth-child(3)'),
  },
  cases: [
    // Default: value 50 → 50% → stroke-dashoffset 50, size M.
    { id: "default", params: {} },
    // A distinct percentage → stroke-dashoffset 75 (100 − 25).
    { id: "value-25", params: { value: "25" } },
    // percentage = (30-10)/(50-10) = 50% → same 50%-arc as default but a distinct
    // aria-valuenow/min/max triple (30 / 10 / 50) for D6.
    { id: "custom-range", params: { value: "30", minValue: "10", maxValue: "50" } },
    // The 16px / 64px ends of the size scale (radius + stroke-width both change).
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    // staticColor swaps track/fill to the transparent-overlay ramp over the
    // fixture's coloured backdrop.
    { id: "static-white", params: { staticColor: "white" } },
    // Indeterminate: no aria-valuenow / aria-valuetext, animated arc. The infinite
    // spin makes the pixel/computed capture non-deterministic in phase, so it is
    // excluded from the steady-state D1/D3 sweep and referenced only by D6, where
    // the *absence* of the value semantics is the whole point.
    { id: "indeterminate", params: { isIndeterminate: "true" }, steadyState: false },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // ProgressCircle's parity lives entirely in SVG longhands the default D1
  // allowlist omits: the `<svg>` `fill`/`display`, each circle's `stroke` /
  // `stroke-width`, the fill arc's dash geometry + `stroke-linecap`, the geometry
  // attributes (`r`/`cx`/`cy`), and the fill's `rotate` / `transform-origin`. The
  // wrapper's `aspect-ratio: square` completes the box.
  styleProps: {
    add: [
      "fill",
      "stroke",
      "stroke-width",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-linecap",
      "r",
      "cx",
      "cy",
      "rotate",
      "transform-origin",
      "aspect-ratio",
    ],
  },
  // D6: the determinate cases pin role=progressbar + aria-valuenow/min/max/
  // valuetext (the accessible name is the fixture's aria-label "Loading…", since
  // ProgressCircle has no visible label); `custom-range` proves the min/max
  // triple + percentage math; `indeterminate` proves aria-valuenow/valuetext are
  // *dropped* (name still wired) — identically on both stacks.
  ax: {
    cases: ["default", "custom-range", "indeterminate"],
  },
};

registerStateMatrixDriver(progressCircleScenario);
registerPixelDriver(progressCircleScenario);
registerAxTreeDriver(progressCircleScenario);
