import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, single-thumb slider): Slider. Upstream S2
 * `Slider.tsx` → `SliderBase` wraps RAC `<AriaSlider>` (a `role="group"` div with
 * `field()`+`slider()` grid) around a `labelContainer` (shared `FieldLabel` + the
 * `SliderOutput`) and a `fieldInput` `inputRow` holding the `<SliderTrack>`:
 *
 *   AriaSlider(role="group")
 *     labelContainer(grid)  ->  FieldLabel(div>label) | SliderOutput(top)
 *     inputRow(inline-flex) ->  SliderTrack(position:relative)
 *                                 upperTrack(div)  ->  SliderFill(nested)
 *                                 SliderThumb(thumbContainer) -> VisuallyHidden<input> + thumb
 *
 * FOUR presentational port divergences were realigned to upstream here (verified
 * against the pinned `@react-spectrum/s2@1.5.1` `Slider.tsx`/`Field.tsx` source and
 * the styled fixture DOM dump):
 *
 *   (1) FILL NESTING. The port rendered the filled track as a *sibling* of the
 *       upperTrack with a hand-rolled `filledStyle()` (left/width via `cssDirection`).
 *       Upstream nests `<SliderFill offset={fillOffset} className={filledTrack}/>`
 *       *inside* `<div className={upperTrack}>` and positions it with
 *       `inset-inline-start`+`width` (the RAC `SliderFill` math). Reverted: the port
 *       now nests our faithful `SliderFill` primitive inside the upperTrack, dropping
 *       the hand-rolled `filledStyle`/`currentValue`/`cssDirection`. → D1 `upperTrack`
 *       + `fill` parts, D3.
 *   (2) upperTrack BORDER → OUTLINE. The port drew the .5px hairline with
 *       `borderStyle/Width/Color`; upstream uses `outlineStyle:'solid',
 *       outlineWidth:'[.5px]', outlineOffset:-0.5, outlineColor`. With
 *       `boxSizing:border-box` a .5px border eats into the 4px track height (content
 *       3px); an inset outline does not. Reverted to outline. → D1 `upperTrack`, D3.
 *   (3) filledTrack `isEmphasized` COLOR. The port wrapped the emphasized fill color
 *       in `baseColor("accent-900")` (which emits hover/press state variants);
 *       upstream uses the plain token `isEmphasized:'accent-900'`. Reverted to the
 *       plain token. → D1 `fill` part (the `emphasized` case), D3.
 *   (4) LABEL WRAPPER + ELEMENT. The port rendered the label as a bare
 *       `<span id=…class={fieldLabel}>`; upstream's shared `FieldLabel` renders an
 *       inline wrapper `<div>` (gridArea:label + label-align text-align + top
 *       paddingBottom(--field-gap) + contain(inline-size)) around a `<Label>` — which
 *       defaults to a `<label>` element. Reverted: label is now a `<label>` inside a
 *       faithful `fieldLabelWrapper` div. → D1 `labelWrapper` + `label` parts, D3, D6.
 *
 * DOM shape (demo default: label "Volume", value 40, size M, top label, thin track),
 * verified against the styled fixture on both stacks:
 *
 *   <div data-comparison-control-root="slider">          ← fixture wrapper
 *     <div role="group">                                 ← AriaSlider (field+slider)
 *       <div labelContainer>
 *         <div labelWrapper><label>Volume</label></div>  ← FieldLabel (revert 4)
 *         <output>40</output>                            ← SliderOutput (top)
 *       </div>
 *       <div inputRow>
 *         <div track>
 *           <div upperTrack><div fill/></div>            ← nested SliderFill (revert 1)
 *           …thumb…                                      ← deferred (see below)
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * The slider group is the DIRECT first child of the fixture wrapper (`${root} > div`),
 * so parts hang off it with no extra hop.
 *
 * SCOPE — D1/D3 run at `states:["default"]`: no D1 part (root grid, label, output,
 * track, upperTrack, fill) changes under a gesture; only the thumb reacts to
 * hover/focus/drag, and the thumb is NOT a D1 part (see the deferred inversion below).
 * Everything that varies (size / disabled / emphasized / track-style / thumb-style /
 * fill-offset / label-position) is prop-driven and captured at rest. The thumb parts
 * (thumbContainer / thumbHitArea / thumb) are excluded from D1 because the port's
 * thumb subtree has an extra VisuallyHidden sibling (the deferred inversion), so a
 * shared nth-child part selector cannot resolve the SAME logical element on both
 * stacks; the thumb's pixels are certified by D3 (whole-canvas diff) in every case.
 *
 * Applicable drivers: D1 (rest-state style matrix — the root grid + label wrapper +
 * label + output + inputRow + track + upperTrack + fill), D3 (pixel — incl. the round
 * thumb knob + the fill + the outline hairline), D6 (AX: the `slider` node named from
 * the label, inside the `role="group"` wrapper), D7 (contrast: the label + the output
 * value text). NOT registered:
 *   - D5 focus/keyboard trails + D8 target size: both depend on WHICH element is the
 *     focusable/interactive slider. Upstream's is the native `<input type=range>`
 *     (tabindex 0) inside the thumbContainer; the port inverts this — the thumbContainer
 *     `<div>` carries `role="slider"`+`tabindex 0` while the `<input>` is
 *     `aria-hidden`+`tabindex -1`. That inversion lives in the headless
 *     `createSlider`/`SliderThumb` spine (shared by RangeSlider/ColorSlider/ColorArea),
 *     so it is a structural realignment, not a per-component edit — tracked as
 *     `slider-thumb-native-input-semantics` and deferred. D5 (focus lands on a
 *     different element) and D8 (the interactive element's border-box is 1px hidden
 *     input on upstream vs 20px div on the port) both diverge only because of it.
 *   - D4 events: the drag/keyboard value-change ordering is a per-control concern the
 *     two fixtures wire differently (onInput vs onChange); out of scope here.
 *   - D2 motion: the only motion is the thumb press-scale transform + the thumb
 *     focus-ring transition — per-gesture thumb concerns, not a mount animation.
 *
 * D6 uses the `default` case. Both stacks expose exactly one `slider` node (upstream
 * via the native `<input type=range>`; the port via the `<div role="slider">`, its
 * `aria-hidden` input excluded), named "Volume" from the label, wrapped in the
 * `role="group"` node — so the resting AX tree matches DESPITE the deferred thumb
 * inversion (which changes only which DOM node backs the identical `slider` semantics,
 * not the exposed role/name/value).
 */

const root = '[data-comparison-control-root="slider"]';

/** The AriaSlider `role="group"` root (field()+slider() grid) — the D1 target. */
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
/** The SliderOutput `<output>` — gridArea output + tabular-nums value. */
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
/** The nested SliderFill `<div>` (revert 1) — inset-inline-start/width + filledTrack. */
const fillTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(
    `${root} > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)`,
  );

const sliderScenario: DriverScenario = {
  slug: "slider",
  title: "Slider",
  target: groupTarget,
  parts: {
    // labelContainer — grid (top) with [label output] template + gridArea label.
    labelContainer: labelContainerTarget,
    // FieldLabel wrapper (revert 4) — gridArea label + contain(inline-size) + text-align.
    labelWrapper: labelWrapperTarget,
    // The label element (revert 4) — fieldLabel() font/color + disabled color.
    label: labelTarget,
    // The output value — gridArea output + text-align (direction/labelPosition).
    output: outputTarget,
    // fieldInput inputRow — inline-flex + align center + size-driven gap.
    inputRow: inputRowTarget,
    // SliderTrack — position relative + size-driven height + gridArea track.
    track: trackTarget,
    // upperTrack (revert 2) — track bg + .5px inset OUTLINE (not border) + radius.
    upperTrack: upperTrackTarget,
    // nested SliderFill (reverts 1+3) — position absolute + inset-inline-start/width +
    // filledTrack bg (gray-700 / plain accent-900 emphasized / disabled).
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
    // Fill offset 60 (value 40) — the fill spans 40%→60% (inset-inline-start:40%,
    // width:20%): certifies the nested SliderFill positioning with a non-zero offset.
    { id: "fill-offset", params: { fillOffset: "60" } },
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
      "outline-style",
      "outline-width",
      "outline-offset",
      "outline-color",
      "translate",
    ],
  },
  // D3: the only sub-exact pixels are the thumb's anti-aliased circular edge —
  // a single 8-bit LSB (Δ=1, grayscale) that rounds differently between two
  // computed-identical DOM subtrees (all D1 styles match; the thumb CSS is
  // byte-identical to upstream). The waiver tolerates that one LSB per channel
  // while keeping dimensions exact and rejecting any real divergence (Δ≥2).
  // Tracked: `slider-thumb-antialias-1lsb`.
  pixel: {
    waivers: [
      // D3 burn-down 2026-07-15: the ±1 LSB thumb/track-edge noise is dark-theme
      // only (verified deterministic across two runs), except the thick-track case
      // which also trips one LSB in light. Every other light-theme cell is held
      // strict (exactPairDiff). pixelThreshold:1 still fails any real ≥2-LSB shift.
      {
        caseId: "*",
        state: "*",
        theme: "dark",
        threshold: { maxMismatchRatio: 0, maxDimensionDelta: 0, pixelThreshold: 1 },
        reason:
          "slider-thumb-antialias-1lsb (dark): thumb/track curved edges round ±1 LSB grayscale",
      },
      {
        caseId: "track-thick",
        state: "*",
        theme: "light",
        threshold: { maxMismatchRatio: 0, maxDimensionDelta: 0, pixelThreshold: 1 },
        reason:
          "slider-thumb-antialias-1lsb (light track-thick): thick-track edge rounds ±1 LSB grayscale",
      },
    ],
  },
  // D6: the `slider` node (named "Volume" from the label) inside the `role="group"`
  // wrapper. React's native `<input type=range>` exposes the value ("40") in the
  // AX tree; the port's `<div role=slider aria-valuenow=40>` does not surface a
  // value in Chromium's computed AX despite correct ARIA. Matching upstream's
  // value output requires the native input to back the slider semantics — the
  // deferred `slider-thumb-native-input-semantics` inversion (shared spine with
  // RangeSlider/ColorSlider/ColorArea). Registered as a known divergence until
  // that lands; role/name/group/output all otherwise match.
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

registerStateMatrixDriver(sliderScenario);
registerPixelDriver(sliderScenario);
registerAxTreeDriver(sliderScenario);
registerContrastDriver(sliderScenario);
