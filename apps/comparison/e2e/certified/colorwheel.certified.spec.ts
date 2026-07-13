import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 5, the hue wheel): ColorWheel. A hue-only ring
 * with a thumb dragged around the circumference — upstream S2 `ColorWheel.tsx` →
 * `AriaColorWheel` (react-aria-components/ColorWheel → `useColorWheel`), rendering a
 * track, an inner-border ring, and a single `ColorHandle`/`ColorThumb`:
 *
 *   AriaColorWheel(NO role, position:relative, outerRadius*2 px square)
 *     -> ColorWheelTrack   (conic-gradient hue sweep, clip-path evenodd ring)
 *     -> div (inner border) (position:absolute inset:24, pointer-events:none, ring)
 *     -> ColorThumb(NO role, position:absolute at the hue angle, transform:center)
 *          <input type="range" hue>   ← the sole native slider (tabIndex 0)
 *          <div ring/>                ← the inner 1px ring (loupe is drag-only)
 *
 * DOM shape (demo default: aria-label "Hue", value "hsl(0, 100%, 50%)", size 192,
 * enabled), verified against upstream `@react-spectrum/s2` ColorWheel.tsx +
 * ColorHandle.tsx (a VERBATIM match — the port's styled `colorWheelRoot` /
 * `colorWheelTrack` / `colorWheelInnerBorder` / `colorWheelThumb` styles and the
 * track/inner-border/handle render order are byte-for-byte the S2 source) and both
 * fixtures:
 *
 *   <div data-comparison-control-root="colorwheel">        ← fixture wrapper
 *     <div style=position:relative;width:192px;height:192px>  ← AriaColorWheel (roleless)
 *       <div style=conic-gradient;clip-path:ring>             ← ColorWheelTrack
 *       <div style=position:absolute;inset:24px>              ← inner border
 *       <div style=position:absolute;left;top;transform>      ← ColorThumb (roleless)
 *         <input type="range" (hue, tabindex 0, aria-valuetext)>
 *         <div (ring)/>
 *       </div>
 *     </div>
 *   </div>
 *
 * Both fixtures wrap the component in the `data-comparison-control-root="colorwheel"`
 * `<div>` (its sole child), so the wheel root is `${root} > div` (a wrapper hop). The
 * three wheel children are strict DOM siblings in a fixed order, so the track is
 * `:nth-child(1)`, the inner border `:nth-child(2)`, the thumb `:nth-child(3)`. RAC's
 * `ColorThumb` renders the input(s) as children of the thumb div; the wheel is hue-only
 * so `yInputProps` is undefined and there is exactly ONE `<input>` (ColorThumb.tsx:132)
 * — the ring is then the only `<div>` child of the thumb (the drag-only loupe portals to
 * `<body>` and is absent at rest), i.e. `${root} > div > div:nth-child(3) > div`.
 *
 * NOT the slider inversion — the same distinguishing strength as ColorArea. Slider /
 * RangeSlider / ColorSlider inverted the thumb (the `<div>` carries `role="slider"` +
 * tabindex while the native `<input>` is aria-hidden + tabindex -1), which forced them
 * to DEFER D5/D6-value under `slider-thumb-native-input-semantics` (a `div[role=slider]`
 * omits the AX value in Chromium). ColorWheel does NOT invert: its thumb is roleless
 * (NO role attribute at all — not even `presentation`; `createColorWheel` verified —
 * `thumbProps` carries no `role`) and the single native `<input type="range">` backs
 * the semantics — at rest it is the sole tab stop (`tabIndex:0`) and carries the hue
 * `aria-valuetext` + min 0 / max 360 / step. So ColorWheel CAN certify BOTH D5 (the hue
 * input is the sole real tab stop) and D6 (the native slider surfaces its value in the
 * AX tree) with NO known divergence. (The recalled note lumping ColorWheel into the
 * inverted-slider group is inaccurate — the thumb is roleless, not `div[role=slider]`.)
 *
 * SCOPE — D1/D3 run at `states:["default"]` (rest). The focusable surface is the
 * clipped 1px `<input>`, not the painted ring, so no single element is
 * focusable-and-styled; everything that varies (disabled / size) is prop-driven and
 * captured at rest. The thumb's focus-visible expansion (16→32px, driven by the hidden
 * input's focus, not a target gesture) is exercised by D5 for the semantic and left out
 * of the rest-state pixel/style diff — the same rest-only philosophy the slider family
 * and ColorArea use.
 *
 * Applicable drivers:
 *   - D1 (rest-state style matrix) — the roleless root's position:relative + size; the
 *     track's `conic-gradient` hue sweep + `clip-path` evenodd ring + outline/radius +
 *     disabled-token bg; the inner border's `position:absolute inset:24` + outline; the
 *     thumb's absolute `left`/`top` + `transform:translate(-50%,-50%)` + size/border/
 *     outline/radius/checkerboard bg + the `[width,height]` transition; the ring's 1px
 *     border. `styleProps.add` reaches the geometry + gradient-detail longhands the
 *     default allowlist omits (position/left/top/right/bottom, box-sizing, clip-path,
 *     the four `background-*` longhands the thumb's layered checkerboard needs).
 *   - D3 (pixel — whole 192px square) — conic ring + inner border + thumb + ring pixels.
 *     The whole surface is anti-aliased circular edges (the clip-path ring's outer +
 *     inner boundary, the thumb's circle), each of which can round a single 8-bit LSB
 *     (Δ=1 grayscale) differently between two computed-identical DOM subtrees — the
 *     `slider-thumb-antialias-1lsb` situation — waived below (±1 LSB everywhere,
 *     dimensions exact, any real divergence Δ≥2 still rejected).
 *   - D5 (focus/keyboard) — the hue `<input type=range>` is the SOLE tab stop; the
 *     `tab-cycle` walk certifies focus lands on it and Tab/Shift+Tab exit and return.
 *   - D6 (AX) — the roleless root wraps the hue native `slider` (name from the
 *     color-input label, `aria-valuetext`); no group node, no second input. NO known
 *     divergence (native input backs the value — the whole point vs the inverted
 *     sliders).
 *
 * NOT registered:
 *   - D4 events: the pointer drag around the ring + arrow-key hue stream is a
 *     per-control event concern the two fixtures wire differently (onInput/onChange +
 *     `data-comparison-value` bookkeeping), deferred with the slider/field family; the
 *     drag's VISUAL result is not a fixed-state cert concern and the thumb geometry it
 *     targets is certified at rest by D1/D3.
 *   - D7 contrast: ColorWheel renders NO text content (the label is an `aria-label`
 *     attribute, not a visible node), so there is nothing to measure.
 *   - D8 target size: the composite adds no hit target of its own beyond the ring.
 *   - D2 motion: the thumb's `[width,height]` transition is pinned by D1; the loupe
 *     enter/exit keyframes are drag-only, deferred with D4.
 *
 * CASES — `default` (size 192 → outerRadius 96 / innerRadius 72), `disabled` (track
 * outline `none` + disabled-token bg + disabled thumb border), and `size-175` /
 * `size-256` to exercise the `Math.max(size, 175)/2` radius math at the floor (87.5 /
 * 63.5 — fractional radii, a good stress on the `clip-path` string) and at a large
 * value (128 / 104). ColorWheel is hue-only — there is no `colorSpace` prop.
 */

const root = '[data-comparison-control-root="colorwheel"]';

/** The roleless `AriaColorWheel` `<div>` (sole child of the fixture wrapper) — the
 *  D1/D3/AX target: position:relative, outerRadius*2 px square. */
const wheelTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The track `<div>` (`:nth-child(1)`) — conic-gradient hue sweep, `clip-path` evenodd
 *  ring, full radius, 1px gray-1000/10 outline (offset -1). */
const trackTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The inner-border `<div>` (`:nth-child(2)`) — position:absolute inset:24,
 *  pointer-events:none, full radius, outline. */
const innerBorderTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The roleless thumb `<div>` (`:nth-child(3)`) — absolute left/top at the hue angle,
 *  `transform:translate(-50%,-50%)`, 16→32px size, 2px white border, 1px black/42
 *  outline, checkerboard + current-color bg. */
const thumbTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(3)`);
/** The inner ring `<div>` (the only `<div>` child of the thumb once the single `<input>`
 *  is skipped; the loupe is drag-only + portals to `<body>`) — 1px black/42 border. */
const ringTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(3) > div`);
/** The hue `<input type="range">` — the tabbable native slider (the sole tab stop). */
const hueInputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`).first();

const colorWheelScenario: DriverScenario = {
  slug: "colorwheel",
  title: "ColorWheel",
  target: wheelTarget,
  parts: {
    // The track — conic-gradient hue sweep clipped to the evenodd ring, full radius,
    // gray-1000/10 outline.
    track: trackTarget,
    // The inner border — position:absolute inset:24, full radius, outline.
    innerBorder: innerBorderTarget,
    // The thumb — absolute position + focus-expand size + white border + black/42
    // outline + full radius + the `linear-gradient(color,color), checkerboard` bg.
    thumb: thumbTarget,
    // The inner ring — size:full, full radius, 1px black/42 border.
    ring: ringTarget,
  },
  cases: [
    { id: "default" },
    // Disabled — track outline `none` + disabled token bg, thumb border/bg to disabled.
    { id: "disabled", params: { isDisabled: "true" } },
    // size 175 / 256 — the `Math.max(size, 175)/2` radius math at the floor (fractional
    // 87.5 / 63.5 radii) and at a large value (128 / 104); drives width/height,
    // clip-path, and the thumb's resting angle position.
    { id: "size-175", params: { size: "175" } },
    { id: "size-256", params: { size: "256" } },
  ],
  states: ["default"],
  styleProps: {
    add: [
      // Root position:relative; inner border + thumb position:absolute.
      "position",
      // Thumb left/top at the hue angle; inner border `inset:24` → all four sides.
      "left",
      "top",
      "right",
      "bottom",
      // Thumb + ring border-box.
      "box-sizing",
      // The track's defining geometry — the evenodd ring (outer + inner circle) the
      // default allowlist omits.
      "clip-path",
      // The thumb's layered `linear-gradient(color,color), checkerboard 50% / 16px 16px`
      // bg — the default allowlist carries `background-image` but not these companions.
      "background-position",
      "background-size",
      "background-repeat",
      "background-blend-mode",
    ],
  },
  // D3: the whole ring is anti-aliased circular edges — the clip-path outer + inner
  // boundary and the thumb circle — each of which can round a single 8-bit LSB (Δ=1,
  // grayscale) differently between two computed-identical DOM subtrees (all D1 styles
  // match; the track/thumb CSS is byte-identical to upstream). The waiver tolerates that
  // one LSB per channel everywhere while keeping dimensions exact and rejecting any real
  // divergence (Δ≥2). Shares the slider family's `slider-thumb-antialias-1lsb`.
  pixel: {
    waivers: [
      {
        caseId: "*",
        state: "*",
        theme: "*",
        threshold: { maxMismatchRatio: 0, maxDimensionDelta: 0, pixelThreshold: 1 },
        reason: "slider-thumb-antialias-1lsb: circular ring/thumb edges round ±1 LSB grayscale",
      },
    ],
  },
  // D5: the hue native slider is the sole tab stop — Tab exits, Shift+Tab returns.
  focus: {
    walks: [{ id: "tab-cycle", start: hueInputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the roleless root wraps the hue native `slider` (name + `aria-valuetext`); no
  // group node, no second input. NO knownDivergences: unlike the inverted sliders,
  // ColorWheel's native `<input>` surfaces its AX value.
  ax: {
    cases: ["default"],
    roots: {
      wheel: wheelTarget,
    },
  },
};

registerStateMatrixDriver(colorWheelScenario);
registerPixelDriver(colorWheelScenario);
registerFocusTrailDriver(colorWheelScenario);
registerAxTreeDriver(colorWheelScenario);
