import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 5, the 1D color slider): ColorSlider. A single
 * channel dragged along a horizontal or vertical track — upstream S2
 * `ColorSlider.tsx` → `AriaColorSlider` (react-aria-components/ColorSlider →
 * `useColorSlider` → `useSlider` + `useSliderThumb`), rendering (for a horizontal
 * slider) a `FieldLabel`, a `SliderOutput`, and a `SliderTrack` holding one
 * `ColorHandle`:
 *
 *   AriaColorSlider(NO role, display:grid "label output"/"track track", data-orientation)
 *     -> div.labelWrapper (grid-area:label) -> FieldLabel  ← only when a visible label
 *     -> SliderOutput      (grid-area:output, aria-live:off) ← only when horizontal
 *     -> SliderTrack(role="group", position:relative, gradient + checkerboard bg)
 *          -> ColorHandle == ColorThumb(position:absolute at the channel %, transform)
 *               <input type="range">   ← the sole native slider (tabIndex 0, aria-valuetext)
 *               <div ring/>            ← the inner 1px ring (loupe is drag-only)
 *
 * DOM shape verified against upstream `@react-spectrum/s2` ColorSlider.tsx +
 * ColorHandle.tsx and the port's regression snapshot (the styled `colorSliderRoot` /
 * `colorSliderLabel` / `colorSliderOutput` / `colorSliderTrack` / `colorSliderThumb`
 * macros mirror the S2 source), for a horizontal, aria-labelled, no-visible-label
 * slider (children `[output, track]`):
 *
 *   <div data-comparison-control-root="colorslider">           ← fixture wrapper
 *     <div style=display:grid;grid-template-areas data-orientation="horizontal"> ← root (roleless)
 *       <output style=grid-area:output aria-live="off">50°</output>
 *       <div role="group" aria-label="Hue" style=position:relative;background:gradient,checkerboard> ← track
 *         <div style=position:absolute;left;top;transform>       ← thumb (roleless — see below)
 *           <input type="range" (tabindex 0, aria-orientation, aria-valuetext)>
 *           <div (ring)/>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * The root's children SHIFT by case — the visible label appears only when labelled and
 * the output only when horizontal — so the parts are anchored on the stable
 * `role="group"` track, NOT `:nth-child` from the root: track = `${root} [role="group"]`,
 * thumb = the sole `<div>` child of the track, ring = the sole `<div>` grandchild (the
 * `<input>` is skipped since it is not a `<div>`), and the input = the single
 * `${root} input`.
 *
 * NOT the slider inversion — the same distinguishing strength as ColorArea / ColorWheel.
 * The classic Slider / RangeSlider inverted the thumb (the `<div>` carries `role="slider"`
 * + tabindex while the native `<input>` is aria-hidden + tabindex -1), forcing a
 * `slider-thumb-native-input-semantics` deferral (a `div[role=slider]` omits its value in
 * the Chromium AX tree). ColorSlider does NOT invert: the thumb `<div>` is roleless and a
 * single native `<input type="range">` backs the semantics — at rest it is the sole tab
 * stop (`tabIndex:0`, faithfully mirroring `useSliderThumb.ts` — a native range input is
 * focusable by default and `disabled` drops it from the tab order) and carries the
 * channel `aria-valuetext` + min/max/step + `aria-orientation`. So ColorSlider CAN certify
 * BOTH D5 (the channel input is the sole real tab stop) and D6 (the native slider surfaces
 * its value in the AX tree) with no such deferral.
 *
 * ONE survey-caught (driver-blind) parity fix — the port's `createColorSlider` thumbProps
 * carried an invented `role="presentation"`. Upstream `useColorSlider` spreads
 * `useSliderThumb`'s roleless `thumbProps` and adds only `forcedColorAdjust` (no role),
 * and S2's `ColorHandle` wraps RAC `ColorThumb` passing no role — so the S2 thumb is
 * roleless (unlike ColorArea, whose `useColorArea` genuinely DOES set `role:'presentation'`
 * → that port is faithful). The fix removes the line, matching upstream and the roleless
 * ColorWheel port. This divergence is invisible to all four drivers (`presentation` ≡
 * roleless in the AX tree — both are pruned; D1/D3 don't capture `role`), so it is a
 * parity fix found by reading the oracle, not a red the pair-oracle produced; the four
 * drivers stay green either way. (The dependent regression snapshot drops the same attr.)
 *
 * SCOPE — D1/D3 run at `states:["default"]` (rest). The focusable surface is the clipped
 * 1px `<input>`, not the painted track, so no single element is focusable-and-styled;
 * everything that varies (disabled / channel / orientation) is prop-driven and captured at
 * rest. The thumb's focus-visible expansion (16→32px, driven by the hidden input's focus,
 * not a gesture) is exercised by D5 for the semantic and left out of the rest-state
 * pixel/style diff — the same rest-only philosophy the slider family, ColorArea, and
 * ColorWheel use.
 *
 * Applicable drivers:
 *   - D1 (rest-state style matrix) — the roleless root's `display:grid`/`block` +
 *     orientation layout; the track's channel gradient + always-appended checkerboard +
 *     outline/radius + relative position + disabled-token bg; the thumb's absolute
 *     `left`/`top` + `transform:translate(-50%,-50%)` + size/border/outline/radius +
 *     `linear-gradient(color,color), checkerboard` bg; the ring's 1px border. `styleProps.add`
 *     reaches the geometry + gradient-detail longhands the default allowlist omits
 *     (position/left/top/right/bottom, box-sizing, the four `background-*` companions the
 *     layered checkerboard needs). The output/label TEXT (color + font) is pinned by D3's
 *     whole-root pixel diff (glyph-exact — stronger than a computed-color check) rather
 *     than D1, since those nodes are conditional (absent from vertical / unlabelled cases)
 *     and so cannot be always-present parts.
 *   - D3 (pixel — whole slider) — track gradient + checkerboard + thumb + ring + the
 *     output/label text. The circular thumb + ring edges (and text sub-pixel AA) can round
 *     a single 8-bit LSB (Δ=1 grayscale) differently between two computed-identical DOM
 *     subtrees — the `slider-thumb-antialias-1lsb` situation — waived below (±1 LSB
 *     everywhere, dimensions exact, any real divergence Δ≥2 still rejected).
 *   - D5 (focus/keyboard) — the channel `<input type=range>` is the SOLE tab stop; the
 *     `tab-cycle` walk certifies focus lands on it and Tab/Shift+Tab exit and return.
 *   - D6 (AX) — the roleless root wraps the `group` track wrapping the native `slider`
 *     (name from the label / aria-label, `aria-valuetext`, `aria-orientation`); captured
 *     for `default` (named via aria-label, horizontal), `labeled` (named via the visible
 *     label), and `vertical` (`aria-orientation="vertical"`). No known divergence — the
 *     native input backs the value.
 *
 * NOT registered:
 *   - D4 events: the pointer drag along the track + arrow-key channel stream is a
 *     per-control event concern the two fixtures wire differently (onInput/onChange +
 *     `data-comparison-value` bookkeeping), deferred with the slider/field family; the
 *     drag's VISUAL result is not a fixed-state cert concern and the thumb geometry it
 *     targets is certified at rest by D1/D3.
 *   - D7 contrast: the output/label text color is pinned exactly (to the S2 oracle) by
 *     D3's glyph-exact pixel diff; there is no standalone contrast driver in this harness.
 *   - D8 target size: the composite adds no hit target of its own beyond the track.
 *   - D2 motion: the thumb's `[width,height]` transition is pinned by D1; the loupe
 *     enter/exit keyframes are drag-only, deferred with D4.
 *
 * CASES — `default` (hue, horizontal, aria-labelled → `[output, track]`), `labeled`
 * (visible label → `[label, output, track]`), `disabled` (track outline/bg + thumb border
 * to disabled tokens), `rgb-red` (a 2-stop red-channel gradient), `alpha` (the transparent
 * gradient that makes the track's checkerboard show through), and `vertical` (`display:block`,
 * no output, `aria-orientation="vertical"`, thumb positioned by `top`).
 */

const root = '[data-comparison-control-root="colorslider"]';

/** The roleless `AriaColorSlider` `<div>` (sole child of the fixture wrapper) — the
 *  D1/D3/AX target: display:grid (horizontal) / block (vertical), the grid-template-areas,
 *  data-orientation. */
const sliderTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The track `<div role="group">` — position:relative, the channel gradient + appended
 *  checkerboard bg, gray-1000/10 outline, default radius, grid-area:track. Both panels
 *  merge `useSlider`'s group role onto the track, so this resolves on each. */
const trackTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} [role="group"]`);
/** The roleless thumb `<div>` (the sole `<div>` child of the track) — absolute left/top at
 *  the channel %, `transform:translate(-50%,-50%)`, 16→32px size, 2px white border, 1px
 *  black/42 outline, `linear-gradient(color,color), checkerboard` bg. */
const thumbTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [role="group"] > div`);
/** The inner ring `<div>` (the sole `<div>` grandchild of the track — the `<input>` is
 *  skipped since it is not a `<div>`; the loupe is drag-only + portals to `<body>`) — 1px
 *  black/42 border, full radius. */
const ringTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [role="group"] > div > div`);
/** The channel `<input type="range">` — the tabbable native slider (the sole tab stop). */
const inputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`).first();

const colorSliderScenario: DriverScenario = {
  slug: "colorslider",
  title: "ColorSlider",
  target: sliderTarget,
  parts: {
    // The track — position:relative, the channel gradient + appended checkerboard, outline,
    // radius, grid-area:track, and the orientation-driven width/height (horizontal full×24,
    // vertical 24×full).
    track: trackTarget,
    // The thumb — absolute position + focus-expand size + white border + black/42 outline +
    // full radius + `linear-gradient(color,color), checkerboard` bg.
    thumb: thumbTarget,
    // The inner ring — size:full, full radius, 1px black/42 border, box-sizing:border-box.
    ring: ringTarget,
  },
  cases: [
    // Horizontal, aria-labelled, no visible label — children `[output, track]`; the hue
    // 7-stop gradient. Reproduces the port's regression-snapshot structure exactly.
    { id: "default", params: { ariaLabel: "Hue" } },
    // A visible label — children `[label, output, track]`; certifies the label's paint (D3)
    // and the label→slider name wiring (D6).
    { id: "labeled", params: { label: "Hue" } },
    // Disabled — track outline `none` + disabled token bg (no gradient/checkerboard), thumb
    // border/bg to disabled tokens.
    { id: "disabled", params: { ariaLabel: "Hue", isDisabled: "true" } },
    // A 2-stop red-channel gradient (min-red → max-red at the current green/blue).
    { id: "rgb-red", params: { ariaLabel: "Red", colorSpace: "rgb", channel: "red" } },
    // The alpha channel — a transparent→opaque gradient that makes the track's always-
    // appended checkerboard show through (the one case where the track checkerboard is visible).
    { id: "alpha", params: { ariaLabel: "Alpha", channel: "alpha" } },
    // Vertical — root `display:block`, NO output, NO visible label (children `[track]`),
    // `aria-orientation="vertical"`, thumb positioned by `top` (24px-wide × full-height track).
    { id: "vertical", params: { ariaLabel: "Hue", orientation: "vertical" } },
  ],
  states: ["default"],
  styleProps: {
    add: [
      // Track position:relative; thumb position:absolute.
      "position",
      // Thumb left/top at the channel %; right/bottom (auto on both) kept for completeness.
      "left",
      "top",
      "right",
      "bottom",
      // Thumb + ring border-box.
      "box-sizing",
      // The track's + thumb's layered `<gradient>, checkerboard 50% / 16px 16px` bg — the
      // default allowlist carries `background-image` but not these companions.
      "background-position",
      "background-size",
      "background-repeat",
      "background-blend-mode",
    ],
  },
  // D3: the circular thumb + ring edges and the output/label text sub-pixel AA can round a
  // single 8-bit LSB (Δ=1, grayscale) differently between two computed-identical DOM
  // subtrees (all D1 styles match; the track/thumb/output/label CSS mirrors upstream). The
  // waiver tolerates that one LSB per channel everywhere while keeping dimensions exact and
  // rejecting any real divergence (Δ≥2). Shares the slider family's `slider-thumb-antialias-1lsb`.
  // D3: no pixel waiver — every case × theme is strict pair-clean (D3 burn-down
  // 2026-07-15 verified 0 mismatched at exactPairDiff across two runs).
  // D5: the channel native slider is the sole tab stop — Tab exits, Shift+Tab returns.
  focus: {
    walks: [{ id: "tab-cycle", start: inputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the roleless root wraps the `group` track wrapping the native `slider` (name +
  // `aria-valuetext` + `aria-orientation`). Captured for the aria-labelled default, the
  // visible-label case, and the vertical case (aria-orientation="vertical"). NO
  // knownDivergences: unlike the inverted sliders, the native `<input>` surfaces its value.
  ax: {
    cases: ["default", "labeled", "vertical"],
    roots: {
      slider: sliderTarget,
    },
  },
};

registerStateMatrixDriver(colorSliderScenario);
registerPixelDriver(colorSliderScenario);
registerFocusTrailDriver(colorSliderScenario);
registerAxTreeDriver(colorSliderScenario);
