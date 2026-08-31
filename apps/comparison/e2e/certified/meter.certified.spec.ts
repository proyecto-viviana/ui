import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): Meter — a labelled value-bar display
 * primitive (the static-value sibling of ProgressBar). Upstream S2 `Meter` and
 * the port both render
 *
 *   <div role="meter" aria-valuenow aria-valuetext aria-labelledby class=wrapper(grid)>
 *     <div class=labelWrapper><span id=labelId class=fieldLabel>{label}</span></div>
 *     <span data-rsp-slot="text" class=value>{valueText}</span>
 *     <div class=track><div class=fill style="width:N%"/></div>
 *   </div>
 *
 * verified **byte-identical** by source read: the port's `wrapperStyles`
 * reproduces upstream's shared `bar()` macro line-for-line (same `staticColor()`,
 * `display: grid`, the deliberate 2-column / 3-area `side` template
 * `gridTemplateColumns.side: ['auto','1fr']` against `gridTemplateAreas.side:
 * ['label bar value']` — the third "value" column is implicit — the `alignItems:
 * baseline`, `minWidth 48` / `maxWidth 768`, and the `--field-height` /
 * `--track-to-label` / `--field-gap` custom-property trio); `trackStyles` matches
 * `track()` + the `{S:4,M:6,L:8,XL:10}` height scale; `fillStyles` matches the
 * `lightDark` variant colour table (informative/positive/notice/negative); and
 * `valueStyles` / `labelStyles` match `fieldLabel()`. The label region is the same
 * `<div class=labelWrapper><span>` on both. Upstream S2 wraps RAC `Meter` and
 * `Label`; the port wraps the corresponding headless Meter and Label. Both Label
 * contexts set `elementType: 'span'`, so the label is a `<span>` (not a `<label>`).
 * `Text` renders
 * `<span data-rsp-slot="text">` on both, and `SkeletonWrapper` emits no wrapper
 * element outside a `<Skeleton>` provider on both, so the track is a direct child.
 *
 * The wrapper is the D1 `target`; the four grid children are diffed `parts`:
 * `label` (the label span), `value` (the value Text span), `track` (the rail), and
 * `fill` (the coloured bar, where the variant colour + `width:%` live).
 *
 * Applicable drivers — D1 (computed styles: grid geometry + the variant fill
 * table + track box), D3 (pixel), D6 (AX: role=meter + the aria-labelledby name
 * wiring + aria-valuenow/valuetext), and D7 (contrast: the label + value text).
 * The interaction/motion drivers are **not** registered:
 *   - D2 motion: the macros carry no transition/animation — a Meter's fill width
 *     is a static inline style, not an animated sweep (unlike ProgressBar's
 *     indeterminate keyframe).
 *   - D4 events / D5 focus: a Meter is not pressable or focusable — no tabindex,
 *     no press handling; `role="meter"` is a live value, not an interactive widget.
 *   - D8 target-size: not an interactive target — no hit box to floor-check.
 *
 * KNOWN, TRACKED DIVERGENCE — role token. Upstream `useMeter` deliberately emits
 * the ARIA fallback token list `role="meter progressbar"` (documented in-source:
 * Chrome/Firefox historically fall back from `meter`, so the `progressbar` token
 * is a safety net). The port emits the single token `role="meter"`, and the
 * comparison's React fixture patches its native `"meter progressbar"` down to
 * `"meter"` so the two panels match. That normalization *masks* a genuine
 * self-inflicted divergence; both token lists resolve to the same `meter` role in
 * the accessibility tree, so D6 is green either way, but the port should emit the
 * faithful `"meter progressbar"` and the fixture patch should be removed. That fix
 * is filed as ticket #104 —
 * it is deferred here only because it also touches solidaria's `createMeter` (a
 * dist rebuild) and must be re-validated against the web a11y/axe gate, which is
 * out of this unit's harness. Everything else below is honest byte-identical
 * parity.
 */
const meterScenario: DriverScenario = {
  slug: "meter",
  title: "Meter",
  // The Meter root carries `role="meter"` and the `bar()` grid macro.
  // `data-comparison-control-root="meter"` is threaded onto it by both fixtures
  // and survives filterDOMProps (data-* is always kept), so it is present and
  // unique on the root.
  target: ({ canvas }) => canvas.locator('[data-comparison-control-root="meter"]'),
  parts: {
    // The label span lives inside the labelWrapper div (`> div > span`). The
    // labelWrapper is the only direct-child div whose child is a span (the track
    // div's child is the fill div), so `> div > span` resolves it uniquely.
    label: ({ canvas }) => canvas.locator('[data-comparison-control-root="meter"] > div > span'),
    // The value Text is the meter's only direct-child span (`> span`); the label
    // span is nested one level deeper inside the labelWrapper div.
    value: ({ canvas }) => canvas.locator('[data-comparison-control-root="meter"] > span'),
    // The track is the direct-child div that contains the fill div; the
    // labelWrapper div (whose child is a span) is excluded by `:has(> div)`.
    track: ({ canvas }) =>
      canvas.locator('[data-comparison-control-root="meter"] > div:has(> div)'),
    // The fill is the track's child div (variant colour + inline `width:%`).
    fill: ({ canvas }) =>
      canvas.locator('[data-comparison-control-root="meter"] > div:has(> div) > div'),
  },
  cases: [
    // Default: informative variant, value 72 → 72%, size M, labelPosition top.
    { id: "default", params: {} },
    // The rest of the variant colour table — each maps its `fill` background-color
    // to the same-named lightDark token pair.
    { id: "positive", params: { variant: "positive" } },
    { id: "notice", params: { variant: "notice" } },
    { id: "negative", params: { variant: "negative" } },
    // The 4px / 10px ends of the track height scale.
    { id: "size-s", params: { size: "S" } },
    { id: "size-xl", params: { size: "XL" } },
    // labelPosition:side switches the grid to the single `label bar value` row —
    // the 2-column template + implicit value column — moving the value inline.
    { id: "label-side", params: { labelPosition: "side" } },
    // valueLabel overrides the formatted value in both the value span and
    // aria-valuetext.
    { id: "value-label", params: { valueLabel: "45 GB" } },
    // percentage = (30-10)/(50-10) = 50% → a distinct aria-valuenow/min/max triple
    // (30 / 10 / 50) and a 50%-wide fill.
    { id: "custom-range", params: { value: "30", minValue: "10", maxValue: "50" } },
    // staticColor swaps the track/fill to the transparent-overlay ramp over the
    // fixture's coloured backdrop.
    { id: "static-white", params: { staticColor: "white" } },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // Meter is a grid whose parity lives in layout longhands the default D1
  // allowlist omits: the wrapper's grid template, each child's grid-area, the
  // track's overflow clip + min/max box, and the isolation/z-index stacking. (No
  // transform-origin here — unlike ProgressBar, a Meter fill never animates.)
  styleProps: {
    add: [
      "grid-template-columns",
      "grid-template-areas",
      "grid-area",
      "overflow-x",
      "overflow-y",
      "min-width",
      "max-width",
      "position",
      "isolation",
      "z-index",
    ],
  },
  // D6: pin role=meter + the shared Label-context aria-labelledby wiring (the
  // label span gets an ID and becomes the meter's accessible name) +
  // aria-valuenow/valuetext. `custom-range`
  // proves the min/max triple + percentage math; `value-label` proves the override
  // wins in aria-valuetext — identically on both stacks. (The role *token* itself
  // is fixture-normalized per the header note; ariaSnapshot exposes the resolved
  // `meter` role + name on both regardless.)
  ax: {
    cases: ["default", "custom-range", "value-label"],
  },
  // D7: the label + value text contrast against the surface, plus the staticColor
  // overlay ramp — all measured to 2dp against upstream in both themes. The
  // variant only recolours the fill, not the text, so the `fieldLabel()` text
  // tokens are a shared-token positive control the pair diff must reproduce.
  contrast: {
    cases: ["default", "size-xl", "static-white"],
  },
};

registerStateMatrixDriver(meterScenario);
registerPixelDriver(meterScenario);
registerAxTreeDriver(meterScenario);
registerContrastDriver(meterScenario);
