import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): ProgressBar — the first primitive whose
 * headline parity surface is **ARIA value semantics** rather than press/focus.
 * Upstream S2 `ProgressBar` (over RAC `useProgressBar`) and the port both render
 *
 *   <div role="progressbar" aria-valuenow aria-valuemin aria-valuemax
 *        aria-valuetext aria-labelledby class=wrapper(grid)>
 *     <div class=labelWrapper><span id=labelId class=fieldLabel>{label}</span></div>
 *     <span class=fieldLabel+value>{valueText}</span>          // determinate only
 *     <div class=track><div class=fill style="width:N%"/></div>
 *   </div>
 *
 * The structures are byte-identical (verified against RAC `ProgressBar` — which
 * pins `LabelContext` `elementType: 'span'`, so the S2 `FieldLabel` renders a
 * `<span>` on both stacks — and the `bar()`/`track()`/`fieldLabel()` macros the
 * port inlines). So the `role="progressbar"` div is the D1 `target`, and the
 * grid children are diffed `parts`: `label` (the label span), `value` (the value
 * span), `track` (the rail), and `fill` (the accent bar).
 *
 * Applicable drivers — D1 (computed styles: grid geometry + track/fill), D3
 * (pixel), **D6 (AX — the meaty surface: role + aria-valuenow/min/max/valuetext,
 * and their *absence* when indeterminate)**, and D7 (contrast: the label + value
 * text). The interaction/derived drivers are **not** registered:
 *   - D2 motion: the only animation is the *indeterminate* fill keyframe, which
 *     (a) runs infinitely from load with no interaction trigger to freeze, and
 *     (b) is emitted under a build-time-hashed `keyframes()` identifier that
 *     differs between stacks by construction (upstream `indeterminateLTR` vs the
 *     port's `progressBarIndeterminateLtr`), so a metadata pair-diff on the raw
 *     `animation-name` would be a false positive. The keyframe *content* and
 *     timing (`1000ms cubic-bezier(.37,0,.63,1) infinite`) are verified
 *     byte-identical by source read instead. Determinate value changes carry no
 *     transition, so there is no other motion surface.
 *   - D4 events / D5 focus: a progress bar is not pressable or focusable —
 *     `role="progressbar"` with no tabindex or press handling.
 *   - D8 target-size: not an interactive target, so there is no hit box to
 *     floor-check.
 *
 * Source-read faithfulness fixes landed alongside this cert (both self-inflicted
 * divergences from the upstream `fill`/keyframe source, per the parity rule):
 *   1. `fill` `transformOrigin` was applied unconditionally (`'left'`) instead of
 *      only when indeterminate (`{isIndeterminate: 'left'}`). Visually inert on
 *      the untransformed determinate bar, but a real computed-style divergence —
 *      now **guarded** by adding `transform-origin` to the D1 allowlist and
 *      diffing the `fill` part (red before the fix: `0px …` vs upstream centre).
 *   2. The RTL indeterminate keyframe did not mirror the LTR one (port
 *      `70% → -100%` vs upstream `100% → -70%`). Not reachable by the LTR-only
 *      harness, so it is a source-verified fix (the comparison app has no RTL
 *      ProgressBar variant to exercise it).
 */
const progressBarScenario: DriverScenario = {
  slug: "progressbar",
  title: "ProgressBar",
  // The ProgressBar root carries `role="progressbar"` and the `wrapper` grid
  // macro. `data-comparison-progressbar="controlled"` is threaded onto it by
  // both fixtures and survives filterDOMProps, so it is present and unique.
  target: ({ canvas }) => canvas.locator('[data-comparison-progressbar="controlled"]'),
  parts: {
    // The label span lives inside the FieldLabel wrapper div (`> div > span`);
    // the value span is a direct child (`> span`). The track is the `> div`
    // whose child is the fill `> div` (the label wrapper's child is a span, so
    // `:has(> div)` disambiguates), and the fill is that grandchild div.
    label: ({ canvas }) =>
      canvas.locator('[data-comparison-progressbar="controlled"] > div > span'),
    value: ({ canvas }) =>
      canvas.locator('[data-comparison-progressbar="controlled"] > span'),
    track: ({ canvas }) =>
      canvas.locator('[data-comparison-progressbar="controlled"] > div:has(> div)'),
    fill: ({ canvas }) =>
      canvas.locator('[data-comparison-progressbar="controlled"] > div:has(> div) > div'),
  },
  cases: [
    { id: "default", params: {} },
    { id: "value-25", params: { value: "25" } },
    // percentage = (30-10)/(50-10) = 50% → same valuetext "50%" as default but a
    // distinct aria-valuenow/min/max triple (30 / 10 / 50).
    { id: "custom-range", params: { value: "30", minValue: "10", maxValue: "50" } },
    // valueLabel overrides the formatted value in both the value span and
    // aria-valuetext.
    { id: "value-label", params: { valueLabel: "3 of 7" } },
    { id: "size-s", params: { size: "S" } },
    { id: "size-xl", params: { size: "XL" } },
    // labelPosition:side switches the grid to the `label bar value` single row —
    // the case that exercises the 3-column resolution.
    { id: "label-side", params: { labelPosition: "side" } },
    // Non-percent formatOptions format the clamped *value* (50) rather than the
    // fraction → currency "$50" (RAC/port both branch on style === 'percent').
    { id: "format-currency", params: { formatOptions: "currency" } },
    // staticColor swaps the track/fill/text to the transparent-overlay ramp over
    // the fixture's coloured backdrop.
    { id: "static-white", params: { staticColor: "white" } },
    // Indeterminate: no aria-valuenow / aria-valuetext, no value span, animated
    // fill. The animated fill makes the pixel/computed capture non-deterministic
    // in phase, so it is excluded from the steady-state D1/D3 sweep and referenced
    // only by D6 (the AX driver), where the *absence* of the value semantics is
    // the whole point.
    { id: "indeterminate", params: { isIndeterminate: "true" }, steadyState: false },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // ProgressBar is a grid whose parity lives in layout longhands the default D1
  // allowlist omits: the wrapper's grid template, each child's grid-area, the
  // track's overflow clip + min/max box, and — the guard for fix #1 — the fill's
  // transform-origin.
  styleProps: {
    add: [
      "grid-template-columns",
      "grid-template-areas",
      "grid-area",
      "transform-origin",
      "overflow-x",
      "overflow-y",
      "min-width",
      "max-width",
      "position",
      "isolation",
      "z-index",
    ],
  },
  // D6 is the headline surface. The determinate cases pin
  // role=progressbar + aria-valuenow/min/max/valuetext; `custom-range` proves the
  // min/max triple + percentage math; `value-label` proves the override wins;
  // `format-currency` proves the non-percent formatter path; and `indeterminate`
  // proves aria-valuenow/valuetext are *dropped* (with the label still wired via
  // aria-labelledby) identically on both stacks.
  ax: {
    cases: ["default", "custom-range", "value-label", "format-currency", "indeterminate"],
  },
  // D7: the label + value text contrast against the surface, plus the
  // staticColor overlay ramp — all measured to 2dp against upstream in both
  // themes. Positive control: identical `fieldLabel()` color tokens must match.
  contrast: {
    cases: ["default", "size-xl", "static-white"],
  },
};

registerStateMatrixDriver(progressBarScenario);
registerPixelDriver(progressBarScenario);
registerAxTreeDriver(progressBarScenario);
registerContrastDriver(progressBarScenario);
