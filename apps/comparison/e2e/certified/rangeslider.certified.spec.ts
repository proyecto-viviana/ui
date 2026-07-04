import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, two-thumb slider): RangeSlider. Upstream S2
 * `RangeSlider.tsx` reuses `Slider.tsx`'s shared parts — it `import`s the SAME
 * `SliderBase`, `track`, `upperTrack`, `filledTrack`, `thumb`, `thumbContainer`,
 * `thumbHitArea` styles and renders:
 *
 *   SliderBase(role="group", field()+slider() grid)
 *     labelContainer(grid)  ->  FieldLabel(div>label) | SliderOutput("30–60")
 *     inputRow(inline-flex) ->  SliderTrack(position:relative)
 *                                 upperTrack(div) -> SliderFill(nested)
 *                                 SliderThumb#0 (minimum)  -> VisuallyHidden<input> + thumb
 *                                 SliderThumb#1 (maximum)  -> VisuallyHidden<input> + thumb
 *
 * The Solid port does NOT share the slider spine: `RangeSlider.tsx` is fully
 * hand-rolled (its own pointer/keyboard math and its own DUPLICATED copies of every
 * Slider style object). Those duplicates carried the exact same four presentational
 * divergences already realigned in `Slider` — so the same four reverts are applied
 * here to the RangeSlider copies (verified against the pinned
 * `@react-spectrum/s2@1.5.1` `Slider.tsx`/`RangeSlider.tsx`/`Field.tsx` source):
 *
 *   (1) FILL NESTING. The port rendered the filled track as a *sibling* of the
 *       upperTrack. Upstream nests `<SliderFill/>` *inside* `<div className={upperTrack}>`.
 *       Reverted: the hand-rolled fill div now nests inside the upperTrack. → D1
 *       `upperTrack` + `fill` parts, D3.
 *   (2) upperTrack BORDER → OUTLINE. `borderStyle/Width/Color` → `outlineStyle:'solid',
 *       outlineWidth:'[.5px]', outlineOffset:-0.5, outlineColor`. A .5px border eats the
 *       4px track height under border-box; an inset outline does not. → D1 `upperTrack`, D3.
 *   (3) filledTrack `isEmphasized` COLOR. `baseColor("accent-900")` (emits hover/press
 *       state variants) → the plain token `isEmphasized:'accent-900'`. filledTrack keeps
 *       its `border*` hairline (upstream `filledTrack` uses border, only `upperTrack` uses
 *       outline). → D1 `fill` part (emphasized case), D3.
 *   (4) LABEL WRAPPER + ELEMENT. Bare `<span id=…class={fieldLabel}>` → the shared
 *       `FieldLabel` shape: an inline wrapper `<div>` (gridArea:label + label-align
 *       text-align + top paddingBottom(--field-gap) + contain(inline-size)) around a real
 *       `<label>`. Also the `<Show when>` gate changed from `label || contextualHelp` to
 *       `label` (upstream FieldLabel renders nothing without label children). → D1
 *       `labelWrapper` + `label` parts, D3, D6.
 *
 *   The align-items merge clobber fixed in `Slider` is present in the RangeSlider copy
 *   too: `sliderRoot` spreads `...field()` (align-items:baseline) then overrides
 *   `alignItems:{labelPosition:{side:'center'}}` in one `style()`, clobbering baseline so
 *   `top` layout resolved to CSS `normal`. Restored `default:'baseline'`. → D1 root/parts, D3.
 *
 *   (5) OUTPUT TEXT + RESERVE WIDTH — the RangeSlider-specific root cause (all 44 reds).
 *       RAC 1.19 `SliderOutput` defaults its child to `state.getFormattedValue()`, and
 *       react-stately's `getFormattedValue([start,end])` switches on arity →
 *       `Intl.NumberFormat.formatRange(start,end)`, yielding an en-dash with NO spaces
 *       ("30–60"). The port emitted a hand-rolled `${format(start)} – ${format(end)}` =
 *       "30 – 60". Upstream `SliderBase` also measures the reserve width via the SAME
 *       `getFormattedValue([min,min+step])` / `([max-step,max])` — arrays that format as
 *       *ranges*, not `.format([array])→NaN`; the port's prior `3+max*2` over-reserved 9ch,
 *       widening the output column and shifting the thumbs. Fixed via a faithful
 *       `getFormattedValue` helper backing both the visible output and the reserve. → D1
 *       `output` + labelContainer `grid-template-columns`, D3 thumb positions, D7 output text.
 *
 * DOM shape (demo default: label "Range", range 30–60, size M, top label, thin track):
 *
 *   <div data-comparison-control-root="rangeslider">
 *     <div role="group">                                 ← SliderBase (field+slider)
 *       <div labelContainer>
 *         <div labelWrapper><label>Range</label></div>   ← FieldLabel (revert 4)
 *         <output>30–60</output>                          ← SliderOutput (top; formatRange, en-dash no spaces)
 *       </div>
 *       <div inputRow>
 *         <div track>
 *           <div upperTrack><div fill/></div>            ← nested fill (revert 1)
 *           …thumb#0…  …thumb#1…                          ← deferred (see below)
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * SCOPE — D1/D3 run at `states:["default"]`: no D1 part (root grid, label, output,
 * track, upperTrack, fill) reacts to a gesture; only the two thumbs do, and the thumbs
 * are NOT D1 parts (deferred inversion below). Everything that varies (size / disabled /
 * emphasized / track-style / thumb-style / range-span / label-position) is prop-driven
 * and captured at rest. The thumb parts are excluded from D1 because the port's thumb
 * subtree has an extra VisuallyHidden sibling, so a shared nth-child selector cannot
 * resolve the SAME logical element on both stacks; the thumbs' pixels are certified by
 * D3 (whole-canvas diff) in every case.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel — both round knobs + the
 * range fill + the outline hairline), D6 (AX: the two `slider` nodes named "Minimum"/
 * "Maximum" inside `role="group"`), D7 (contrast: the label + the output value text).
 * NOT registered — the SAME deferred concerns as single Slider, doubled for two thumbs:
 *   - D5 focus/keyboard trails + D8 target size: depend on WHICH element is focusable.
 *     Upstream's are the two native `<input type=range>` (tabindex 0) inside the
 *     thumbContainers; the port inverts this — the thumb `<div>` carries
 *     `role="slider"`+`tabindex 0` while the `<input>` (there is none; the port has no
 *     native input at all) is absent. Tracked as `slider-thumb-native-input-semantics`
 *     (shared spine with Slider/ColorSlider/ColorArea) and deferred.
 *   - D4 events + D2 motion: per-gesture thumb concerns, out of scope at rest.
 *
 * D6 uses the `default` case. Both stacks expose two `slider` nodes named
 * "Minimum"/"Maximum" (en-US) inside the `role="group"` wrapper — role/name/group all
 * match. React's native `<input type=range>` exposes each value ("30"/"60") in the AX
 * tree; the port's `<div role=slider aria-valuenow>` does not surface a value in
 * Chromium's computed AX despite correct ARIA. Matching that requires the native input
 * to back the slider semantics — the deferred `slider-thumb-native-input-semantics`
 * inversion — so D6 default is registered as a known divergence until it lands.
 */

const root = '[data-comparison-control-root="rangeslider"]';

/** The SliderBase `role="group"` root (field()+slider() grid) — the D1 target. */
const groupTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The labelContainer grid `<div>` (first group child). */
const labelContainerTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The FieldLabel outer wrapper `<div>` (revert 4) — gridArea label + contain + align. */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > div:nth-child(1)`);
/** The `<label>` element (revert 4) — fieldLabel() color/font + disabled color. */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > div:nth-child(1) > label`);
/** The SliderOutput `<output>` — gridArea output + tabular-nums range value. */
const outputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} output`);
/** The fieldInput `inputRow` `<div>` (second group child) — inline-flex + gap. */
const inputRowTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The SliderTrack `<div>` (first inputRow child) — position:relative + size height. */
const trackTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2) > div:nth-child(1)`);
/** The upperTrack `<div>` (first track child) — track bg + outline hairline (revert 2). */
const upperTrackTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)`);
/** The nested fill `<div>` (revert 1) — position:absolute + inset/width + filledTrack. */
const fillTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(
    `${root} > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)`,
  );

const rangeSliderScenario: DriverScenario = {
  slug: "rangeslider",
  title: "RangeSlider",
  target: groupTarget,
  parts: {
    // labelContainer — grid (top) with [label output] template + gridArea label.
    labelContainer: labelContainerTarget,
    // FieldLabel wrapper (revert 4) — gridArea label + contain(inline-size) + text-align.
    labelWrapper: labelWrapperTarget,
    // The label element (revert 4) — fieldLabel() font/color + disabled color.
    label: labelTarget,
    // The output range value — gridArea output + text-align (direction/labelPosition).
    output: outputTarget,
    // fieldInput inputRow — inline-flex + align center + size-driven gap.
    inputRow: inputRowTarget,
    // SliderTrack — position relative + size-driven height + gridArea track.
    track: trackTarget,
    // upperTrack (revert 2) — track bg + .5px inset OUTLINE (not border) + radius.
    upperTrack: upperTrackTarget,
    // nested fill (reverts 1+3) — position absolute + inset/width + filledTrack bg
    // (gray-700 / plain accent-900 emphasized / disabled) + .5px border hairline.
    fill: fillTarget,
  },
  cases: [
    { id: "default" },
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
    // Disabled — upperTrack/fill background + label color take the `disabled` token.
    { id: "disabled", params: { isDisabled: "true" } },
    // Emphasized — the filled track takes the plain `accent-900` token (revert 3).
    { id: "emphasized", params: { isEmphasized: "true" } },
    // Thick track — upperTrack/fill height 16 + borderRadius `sm` (vs thin 4 + `lg`).
    { id: "track-thick", params: { trackStyle: "thick" } },
    // Precise thumb — thumb width 6 (thumb pixels via D3; not a D1 part).
    { id: "thumb-precise", params: { thumbStyle: "precise" } },
    // Range span 10–40 — the nested fill spans 10%→40% (inset:10%, width:30%): certifies
    // the fill positioning with a non-default two-thumb subset.
    { id: "range-shift", params: { defaultStartValue: "10", defaultEndValue: "40" } },
    // Side label — labelContainer is not a grid; the output moves beside the track.
    { id: "label-side", params: { labelPosition: "side" } },
  ],
  states: ["default"],
  styleProps: {
    add: [
      "box-sizing",
      "text-align",
      "grid-template-columns",
      "grid-template-areas",
      "grid-template-rows",
      "column-gap",
      "gap",
      "align-items",
      "contain",
      "inset-inline-start",
      "left",
      "outline-style",
      "outline-width",
      "outline-offset",
      "outline-color",
      "translate",
    ],
  },
  // D3: the only sub-exact pixels are the two thumbs' anti-aliased circular edges —
  // a single 8-bit LSB (Δ=1, grayscale) that rounds differently between two
  // computed-identical DOM subtrees (all D1 styles match; the thumb CSS is
  // byte-identical to upstream). The waiver tolerates that one LSB per channel
  // while keeping dimensions exact and rejecting any real divergence (Δ≥2).
  // Tracked: `slider-thumb-antialias-1lsb`.
  pixel: {
    waivers: [
      {
        caseId: "*",
        state: "*",
        theme: "*",
        threshold: { maxMismatchRatio: 0, maxDimensionDelta: 0, pixelThreshold: 1 },
        reason: "slider-thumb-antialias-1lsb: thumb edge rounds ±1 LSB grayscale",
      },
    ],
  },
  // D6: two `slider` nodes ("Minimum"/"Maximum") inside the `role="group"` wrapper.
  // React's native `<input type=range>` exposes each value in the AX tree; the port's
  // `<div role=slider aria-valuenow>` does not surface a value in Chromium's computed
  // AX despite correct ARIA. Matching upstream's value output requires the native input
  // to back the slider semantics — the deferred `slider-thumb-native-input-semantics`
  // inversion (shared spine with Slider/ColorSlider/ColorArea). Registered as a known
  // divergence until that lands; role/name/group/output all otherwise match.
  ax: {
    cases: ["default"],
    roots: {
      group: groupTarget,
    },
    knownDivergences: {
      default:
        "slider-thumb-native-input-semantics: div[role=slider] omits AX value vs native input",
    },
  },
  // D7: the label + output value text, resting + disabled, both themes.
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(rangeSliderScenario);
registerPixelDriver(rangeSliderScenario);
registerAxTreeDriver(rangeSliderScenario);
registerContrastDriver(rangeSliderScenario);
