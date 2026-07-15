import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 5, the first 2D color surface): ColorArea.
 * A 2D gradient thumb-drag control — upstream S2 `ColorArea.tsx` → `AriaColorArea`
 * (react-aria-components/ColorArea → `useColorArea`), rendering a single
 * `ColorHandle`/`ColorThumb`:
 *
 *   AriaColorArea(role="group", aria-label, gradient background on the ROOT)
 *     -> ColorThumb(role="presentation", position:absolute at the 2D value)
 *          <input type="range" x>      ← the tabbable native slider (tabIndex 0)
 *          <input type="range" y>      ← aria-hidden, tabIndex -1 (2nd axis)
 *          <div ring/>                 ← the inner 1px ring (loupe is drag-only)
 *
 * DOM shape (demo default: aria-label "Color", value "#9B80FF", colorSpace rgb
 * inferred, xChannel red / yChannel green, enabled), verified against upstream
 * `@react-spectrum/s2` ColorArea.tsx + ColorHandle.tsx (a VERBATIM match — the
 * port's styled `colorAreaRoot`/`colorAreaThumb`/`colorAreaThumbRing` styles and
 * the gradient-on-root / `position:undefined` render are byte-for-byte the S2
 * source) and both fixtures:
 *
 *   <div data-comparison-control-root="colorarea">     ← fixture wrapper
 *     <div role="group" aria-label="Color" style=background:gradient>  ← AriaColorArea
 *       <div role="presentation" style=position:absolute;left;top>     ← ColorThumb
 *         <input type="range" (x, tabindex 0, aria-orientation=horizontal)>
 *         <input type="range" (y, tabindex -1, aria-hidden, aria-orientation=vertical)>
 *         <div (ring)/>
 *       </div>
 *     </div>
 *   </div>
 *
 * Both fixtures wrap the component in the `data-comparison-control-root="colorarea"`
 * `<div>` (its sole child), so the group is `${root} > div` (a wrapper hop, like the
 * field family). RAC's `ColorThumb` renders the two `<input>`s as children of the
 * thumb div (ColorThumb.tsx:132-133), exactly as the port does, so the thumb is
 * `${root} > div > div` and the ring — the only `<div>` child of the thumb once the
 * inputs are skipped, the drag-only loupe portaling to `<body>` — is
 * `${root} > div > div > div`.
 *
 * NOT the slider inversion. Slider / RangeSlider / ColorSlider inverted the thumb
 * (the `<div>` carries `role="slider"` + tabindex while the native `<input>` is
 * aria-hidden + tabindex -1), which forced them to DEFER D5/D6-value under
 * `slider-thumb-native-input-semantics` (a `div[role=slider]` omits the AX value in
 * Chromium). ColorArea does NOT invert: its thumb is `role="presentation"` and the
 * native `<input type="range">` back the 2D-slider semantics (`useColorArea`
 * verified — thumb `role:"presentation"` at createColorArea.ts:344; the x input at
 * rest is `aria-hidden:undefined` + `tabIndex:0`, the y input `aria-hidden:"true"` +
 * `tabIndex:-1` at :382/:390/:427/:433). So ColorArea CAN certify BOTH D5 (the x
 * input is a real tab stop) and D6 (the native slider surfaces its value in the AX
 * tree) with NO known divergence — the distinguishing strength of this cert over the
 * three inverted sliders. (The slider cert's comment lumping ColorArea into the
 * inversion group is inaccurate for ColorArea and does not apply here.)
 *
 * SCOPE — D1/D3 run at `states:["default"]` (rest). The focusable surface is the
 * clipped 1px `<input>`, not the painted area, so no single element is
 * focusable-and-styled; everything that varies (disabled / colorSpace) is prop-driven
 * and captured at rest. The thumb's focus-visible expansion (16→32px, driven by the
 * hidden input's focus, not a target gesture) is exercised by D5 for the semantic and
 * left out of the rest-state pixel/style diff — the same rest-only philosophy the
 * slider family uses.
 *
 * Applicable drivers:
 *   - D1 (rest-state style matrix) — the group's gradient `background-image` +
 *     size/minSize/outline/radius/disabled-token bg; the thumb's 2D `left`/`top` +
 *     `translate(-50%,-50%)` + size/border/outline/radius/checkerboard bg + the
 *     `[width,height]` transition; the ring's 1px border. `styleProps.add` reaches
 *     the geometry + gradient-detail longhands the default allowlist omits
 *     (position/left/top, box-sizing, min-width/height, the four `background-*`
 *     longhands the layered gradients need).
 *   - D3 (pixel — whole 192px area) — gradient + thumb + ring pixels. The one
 *     sub-exact region is the thumb's anti-aliased circular edge (a single 8-bit LSB,
 *     Δ=1 grayscale, rounding differently between two computed-identical subtrees —
 *     the exact `slider-thumb-antialias-1lsb` situation), waived below; the flat 2D
 *     gradient renders deterministically from byte-identical CSS so it needs no waiver.
 *   - D5 (focus/keyboard) — the x `<input type=range>` is the SOLE tab stop; the
 *     `tab-cycle` walk certifies focus lands on it and Tab/Shift+Tab exit and return.
 *   - D6 (AX) — the `role="group"` (named from `aria-label`) wrapping the x native
 *     `slider` (name from the color-input label, `aria-roledescription` "2D slider",
 *     `aria-valuetext`, `aria-orientation=horizontal`); the y input is `aria-hidden`
 *     at rest so it is absent from the tree. NO known divergence (native input backs
 *     the value — the whole point vs the inverted sliders).
 *
 * NOT registered:
 *   - D4 events: the 2D pointer drag + arrow-key value stream is a per-control event
 *     concern the two fixtures wire differently (onInput/onChange + `data-comparison-
 *     value` bookkeeping), deferred with the slider/field family; the drag's VISUAL
 *     result is not a fixed-state cert concern and the thumb geometry it targets is
 *     certified at rest by D1/D3.
 *   - D7 contrast: ColorArea renders NO text content (the label is an `aria-label`
 *     attribute, not a visible node), so there is nothing to measure.
 *   - D8 target size: the composite adds no hit target of its own beyond the area.
 *   - D2 motion: the thumb's `[width,height]` transition is pinned by D1; the loupe
 *     enter/exit keyframes are drag-only, deferred with D4.
 *
 * CASES — `default` (rgb red/green), `disabled` (gradient drops to the disabled
 * token bg + outline `none` + disabled thumb border), and `colorSpace-hsl` /
 * `colorSpace-hsb` to exercise all three `generateGradient()` branches (the demo's
 * `normalizeChannelPair` auto-remaps the invalid rgb channels to the space's default
 * pair — hsl→saturation/lightness, hsb→saturation/brightness — so a bare `colorSpace`
 * param is sufficient). ColorArea is a fixed 192px control — there is no `size` prop.
 */

const root = '[data-comparison-control-root="colorarea"]';

/** The `role="group"` AriaColorArea `<div>` (sole child of the fixture wrapper) — the
 *  D1/D3 target: gradient background, 192px size, 64px minSize, outline, radius. */
const areaTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The `role="presentation"` thumb `<div>` (sole child of the group) — 2D position,
 *  16→32px size, 2px white border, 1px black/42 outline, checkerboard + current-color bg. */
const thumbTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div > div`);
/** The inner ring `<div>` (the only `<div>` child of the thumb once the two `<input>`s
 *  are skipped; the loupe is drag-only + portals to `<body>`) — 1px black/42 border. */
const ringTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div > div > div`);
/** The x `<input type="range">` — the tabbable native slider (the sole tab stop). */
const xInputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`).first();

const colorAreaScenario: DriverScenario = {
  slug: "colorarea",
  title: "ColorArea",
  target: areaTarget,
  parts: {
    // The thumb — 2D absolute position + focus-expand size + white border + black/42
    // outline + full radius + the `linear-gradient(color,color), checkerboard` bg.
    thumb: thumbTarget,
    // The inner ring — size:full, full radius, 1px black/42 border.
    ring: ringTarget,
  },
  cases: [
    { id: "default" },
    // Disabled — gradient drops to the `disabled` token bg, outline `none`, thumb
    // border/bg go to the disabled token.
    { id: "disabled", params: { isDisabled: "true" } },
    // colorSpace hsl/hsb — the two non-rgb `generateGradient()` branches (channels
    // auto-remap to the space default pair).
    { id: "colorSpace-hsl", params: { colorSpace: "hsl" } },
    { id: "colorSpace-hsb", params: { colorSpace: "hsb" } },
  ],
  states: ["default"],
  styleProps: {
    add: [
      // Thumb 2D geometry — absolute placement + the centering translate.
      "position",
      "left",
      "top",
      "translate",
      // Thumb + ring border-box.
      "box-sizing",
      // Root minSize:64 → min-width / min-height.
      "min-width",
      "min-height",
      // Layered gradients (root 2D gradient + thumb checkerboard) — the default
      // allowlist carries `background-image` but not these companions.
      "background-position",
      "background-size",
      "background-repeat",
      "background-blend-mode",
    ],
  },
  // D3: the only sub-exact pixels are the thumb's anti-aliased circular edge — a
  // single 8-bit LSB (Δ=1, grayscale) that rounds differently between two
  // computed-identical DOM subtrees (all D1 styles match; the thumb CSS is byte-
  // identical to upstream ColorHandle). The waiver tolerates that one LSB per channel
  // while keeping dimensions exact and rejecting any real divergence (Δ≥2) — the flat
  // 2D gradient itself renders deterministically from identical CSS. Shares the
  // slider family's `slider-thumb-antialias-1lsb`.
  pixel: {
    waivers: [
      // D3 burn-down 2026-07-15: only the HSB color-space case rounds ±1 LSB (its
      // saturation/brightness gradient band; verified deterministic in both themes
      // across two runs). Every other case is held strict (exactPairDiff), and
      // pixelThreshold:1 still fails any real ≥2-LSB shift, resize, or recolor.
      {
        caseId: "colorSpace-hsb",
        state: "*",
        theme: "*",
        threshold: { maxMismatchRatio: 0, maxDimensionDelta: 0, pixelThreshold: 1 },
        reason: "colorarea-hsb-antialias-1lsb: HSB saturation/brightness gradient band rounds ±1 LSB grayscale",
      },
    ],
  },
  // D5: the x native slider is the sole tab stop — Tab exits, Shift+Tab returns.
  focus: {
    walks: [{ id: "tab-cycle", start: xInputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the `role="group"` (named from aria-label) wrapping the x native `slider`
  // (name + `aria-roledescription` "2D slider" + `aria-valuetext` + horizontal
  // orientation). The y input is `aria-hidden` at rest → absent. NO knownDivergences:
  // unlike the inverted sliders, ColorArea's native `<input>` surfaces its AX value.
  ax: {
    cases: ["default"],
    roots: {
      area: areaTarget,
    },
  },
};

registerStateMatrixDriver(colorAreaScenario);
registerPixelDriver(colorAreaScenario);
registerFocusTrailDriver(colorAreaScenario);
registerAxTreeDriver(colorAreaScenario);
