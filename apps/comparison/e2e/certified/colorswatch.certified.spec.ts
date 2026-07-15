import { registerAxTreeDriver } from "../drivers/ax";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 5, the static color preview): ColorSwatch. A
 * single `<div role="img">` that paints a preview of one color — upstream S2
 * `ColorSwatch.tsx` → `AriaColorSwatch` (react-aria-components/ColorSwatch →
 * `useColorSwatch`), a LEAF with no thumb, track, input, or gradient channel and
 * — critically — NOTHING FOCUSABLE (no `tabIndex`, no interactive descendant):
 *
 *   AriaColorSwatch(role="img", aria-roledescription="color swatch",
 *                   aria-label="<colorName>, <label>", forced-color-adjust:none,
 *                   background: <flat color over checkerboard> | <transparent slash>)
 *
 * DOM shape verified against upstream `@react-spectrum/s2` ColorSwatch.tsx +
 * `@react-aria/color` useColorSwatch.ts and the port stack (`createColorSwatch`
 * → headless `ColorSwatch` → styled `colorSwatchRoot`). The styled swatch is a
 * SINGLE div — the headless renders `<div {...swatchProps} class style>` with no
 * wrapper — so the fixture wrapper holds exactly one measurable element:
 *
 *   <div data-comparison-control-root="colorswatch">              ← fixture wrapper
 *     <div role="img" aria-roledescription="color swatch"          ← the swatch (D1+D3+D6)
 *          aria-label="…" style="background:…; border:1px solid …; forced-color-adjust:none">
 *     </div>
 *   </div>
 *
 * The target is anchored on the stable `[role="img"]` (its geometry is entirely
 * prop-driven: size → 16/24/32/40px, rounding → sm/none/full radius). There are
 * NO named parts — the swatch div is the only styled element, and the D1 driver
 * always captures the `target` itself, so `parts: {}` measures exactly it.
 *
 * The style merge is a VERIFIED no-divergence (both sides put `background` LAST).
 * The hook sets `{ background-color, forced-color-adjust }`; the styled layer sets
 * the `background` SHORTHAND (a `linear-gradient(color,color), checkerboard` for an
 * opaque/alpha color, or a `linear-gradient(…) no-repeat` diagonal slash when
 * alpha == 0). The port's headless `mergedStyle()` spreads
 * `{ ...swatchProps.style, ...renderStyle }` and the oracle's RAC ColorSwatch
 * spreads `{ ...colorSwatchProps.style, ...renderProps.style }` — both put the
 * `background` shorthand after `background-color`, so the shorthand resets computed
 * `background-color` to transparent identically on each side. D1 captures
 * `background-color` + `background-image` + the position/size/repeat companions to
 * pin that equivalence rather than assume it.
 *
 * ONE survey-caught (driver-blind) parity fix — the port's `createColorSwatch`
 * HARDCODED the two English strings `"color swatch"` (the `aria-roledescription`)
 * and `"transparent"` (the alpha == 0 color name), where upstream `useColorSwatch`
 * localizes BOTH via `stringFormatter.format('colorSwatch' | 'transparent')` and
 * every sibling port hook (`createColorArea`, `createColorSlider`) already threads
 * `createColorStringFormatter()`. The swatch was the lone outlier; the port intl
 * catalog already carries both keys (en-US identical: `"color swatch"` /
 * `"transparent"`), so the fix is en-US byte-identical (zero blast radius) but
 * mandated by Parity Rule #1 — the same "survey-caught, driver-blind" shape as
 * CP9.67's ColorSlider thumb-role revert. Both panels render en-US, so all three
 * drivers stay green either way; it is reverted on principle, not to clear a red.
 *
 * Applicable drivers:
 *   - D1 (rest-state style matrix) — the swatch's prop-driven geometry
 *     (`width`/`height` per size, `border-radius` per rounding), the constant
 *     `1px solid gray-1000/42` border + `border-box` + `forced-color-adjust:none`,
 *     and the `background` shorthand's longhands (`background-color` reset to
 *     transparent, `background-image` = the flat-color-over-checkerboard or slash
 *     gradient, plus the `background-position`/`size`/`repeat` companions the
 *     default allowlist omits).
 *   - D3 (pixel — the swatch) — the painted color, checkerboard (visible only when
 *     the color is semi-transparent), diagonal red slash (alpha == 0), rounded /
 *     circular corners, and the border. The rounded/circular corner AA, the
 *     checkerboard conic-gradient tile boundaries, and the slash diagonal can round
 *     a single 8-bit LSB (Δ=1 grayscale) between two computed-identical subtrees —
 *     waived below (±1 LSB everywhere, dimensions exact, any real divergence Δ≥2
 *     still rejected).
 *   - D6 (AX) — the leaf `img` with `aria-roledescription="color swatch"` and the
 *     generated accessible name `"<colorName>, <label>"`. Captured for `default`
 *     (auto colorName from the color value), `transparent` (the localized
 *     `"transparent"` name at alpha == 0 — the branch the parity fix touches), and
 *     `named` (an explicit `colorName` override). Both panels compute the auto name
 *     via the same ported `getColorName`, so the pair-diff pins name generation
 *     without hard-coding the exact string.
 *
 * NOT registered:
 *   - D5 focus/keyboard: the swatch is a STATIC preview — `role="img"`, no
 *     `tabIndex`, no interactive descendant — so it is not in the tab order and has
 *     no focus trail to certify. (This is the first Tier-5 color unit with no D5.)
 *   - D4 events: no interaction — the swatch neither takes input nor emits events.
 *   - D2 motion: no transition or animation.
 *   - D7 contrast: no text node — the swatch paints only color.
 *   - D8 target size: not an interactive target.
 *
 * CASES — `default` (opaque #ff6600, M, `sm` radius — the baseline flat-color
 * swatch), `transparent` (#fff0, alpha == 0 → the diagonal slash + localized
 * "transparent" name), `alpha` (a 50%-alpha color → the checkerboard shows through
 * the flat-color layer), `rounded` (rounding `full` → a circle, AA all around),
 * `square-xs` (rounding `none` + size XS → a 16px sharp-cornered swatch), `large`
 * (size L → 40px), and `named` (an explicit `colorName` override for D6).
 */

const root = '[data-comparison-control-root="colorswatch"]';

/** The swatch `<div role="img">` (the sole child of the fixture wrapper) — the
 *  D1/D3/AX target. Its geometry is prop-driven (size → width/height, rounding →
 *  border-radius) and its `background` shorthand carries the flat-color-over-
 *  checkerboard or transparent-slash paint. */
const swatchTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} [role="img"]`);

const colorSwatchScenario: DriverScenario = {
  slug: "colorswatch",
  title: "ColorSwatch",
  target: swatchTarget,
  // No named parts — the swatch div is the only styled element and D1 always
  // captures the `target` itself, so an empty parts map measures exactly it.
  parts: {},
  cases: [
    // The baseline — opaque #ff6600, size M (32px), rounding default (`sm` radius):
    // a flat color layer fully covering the checkerboard, over the constant border.
    { id: "default", params: { ariaLabel: "Background color" } },
    // alpha == 0 → the styled `getStyle` swaps to the diagonal red slash
    // (`linear-gradient(…) no-repeat`, no checkerboard) and the hook names the color
    // "transparent" (the localized branch the parity fix touches).
    { id: "transparent", params: { color: "#fff0", ariaLabel: "Background color" } },
    // A 50%-alpha color — alpha > 0 keeps the checkerboard path, and the semi-
    // transparent flat layer lets the checkerboard show through (the one opaque-path
    // case where the checkerboard is visible in D3).
    { id: "alpha", params: { color: "hsla(30, 100%, 50%, 0.5)", ariaLabel: "Background color" } },
    // rounding `full` → a circle: certifies `border-radius:9999px` and the
    // all-around edge AA (waived ±1 LSB below).
    { id: "rounded", params: { color: "#0066ff", rounding: "full", ariaLabel: "Background color" } },
    // rounding `none` + size XS → a 16px sharp-cornered swatch: the smallest
    // geometry with no corner AA.
    {
      id: "square-xs",
      params: { color: "#00cc66", rounding: "none", size: "XS", ariaLabel: "Background color" },
    },
    // size L → 40px: the largest geometry.
    { id: "large", params: { color: "#9933ff", size: "L", ariaLabel: "Background color" } },
    // An explicit `colorName` override — the name is taken verbatim (no auto
    // generation, no localization), certified by D6.
    {
      id: "named",
      params: { color: "#ff0000", colorName: "Brand red", ariaLabel: "Background color" },
    },
  ],
  // Rest only — nothing is focusable or interactive, so there is no gesture state
  // to drive; everything that varies (color / size / rounding) is prop-driven.
  states: ["default"],
  styleProps: {
    add: [
      // The swatch's `border-box` (the 1px border is inside the size box).
      "box-sizing",
      // The `background` shorthand's companions the default allowlist omits — the
      // checkerboard layer is positioned `0% 50%` at `16px 16px`, and the slash is
      // `no-repeat`. `background-color` + `background-image` are already captured.
      "background-position",
      "background-size",
      "background-repeat",
    ],
  },
  // D3: the rounded/circular corner AA, the checkerboard conic-gradient tile
  // boundaries, and the transparent-slash diagonal can round a single 8-bit LSB
  // (Δ=1, grayscale) differently between two computed-identical DOM subtrees (all
  // D1 styles match; the swatch CSS mirrors upstream byte-for-byte). The waiver
  // tolerates that one LSB per channel everywhere while keeping dimensions exact
  // and rejecting any real divergence (Δ≥2).
  // D3: no pixel waiver — every case × theme is strict pair-clean (D3 burn-down
  // 2026-07-15 verified 0 mismatched at exactPairDiff across two runs).
  // D6: the leaf `img` with `aria-roledescription="color swatch"` and the generated
  // `"<colorName>, <label>"` name. Captured for the auto-name default, the localized
  // "transparent" (alpha == 0), and an explicit colorName override. NO
  // knownDivergences — both panels compute the auto name via the same ported
  // `getColorName`, so the pair-diff matches without hard-coding the string.
  ax: {
    cases: ["default", "transparent", "named"],
    roots: {
      swatch: swatchTarget,
    },
  },
};

registerStateMatrixDriver(colorSwatchScenario);
registerPixelDriver(colorSwatchScenario);
registerAxTreeDriver(colorSwatchScenario);
