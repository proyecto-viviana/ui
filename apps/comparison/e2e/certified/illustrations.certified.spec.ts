import { registerAxTreeDriver } from "../drivers/ax";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): Illustration — the `createIllustration`
 * HOC, sibling of `createIcon`. It wraps a raw illustration `<svg>` and stamps
 * the same S2 icon contract, differing from `createIcon` only in the base macro:
 * a three-step size scale (S 48 / M 96 / L 160) instead of the icon's fixed 20.
 * Upstream S2 `createIllustration` (`s2/src/Icon.tsx`) and the port
 * (`icon/spectrum-icon.tsx`) both render the passed `<Component>` svg with:
 *
 *   <svg role="img" focusable={false} size={size}
 *        aria-label={label} aria-hidden={label ? (hidden||undefined) : true}
 *        data-slot={slot} class=illustrationStyles(size, styles)>
 *     …glyph…
 *   </svg>
 *   → render ? render(svg) : svg    // IllustrationContext.render passthrough
 *
 * verified **byte-identical** by source read: the port's `illustrationBaseStyles`
 * is the same `style()` macro as upstream `illustrationStyles` — `{size: {S: 48,
 * M: 96, L: 160}, flexShrink: 0}` over the same `allowedOverrides` list — with the
 * default resolving to `M` via `size ?? ctx.size ?? "M"`; the `aria-hidden` gate
 * is the same ternary (`aria-label ? aria-hidden || undefined : true`); `role=
 * "img"`, `focusable={false}`, `data-slot`, the `size` passthrough to the glyph
 * and the `render` passthrough all match; and the skeleton path is DOM-equivalent
 * (upstream `<SkeletonWrapper>` renders no element outside a `<Skeleton>` provider;
 * the port applies the same `loadingStyle` + `inert` + WAAPI ref directly). The
 * demo's three glyphs (Plan / DropZone / IllustratedMessage) are byte-identical
 * across stacks — same `viewBox`, same `<rect>`/`<path>`/`<circle>` geometry, same
 * `fill: var(--iconPrimary, #222)` — so each rendered glyph is pixel-identical.
 *
 * One **driver-invisible** DOM difference is knowingly tolerated: upstream's demo
 * glyph spreads `{...props}` (so the `size` prop leaks onto the svg as an invalid
 * `size="S"` attribute), while the port's glyph destructures `size` out. An
 * unknown `size` attribute on `<svg>` has no computed-style, pixel, or AX effect
 * (svg sizes from width/height, not `size`), so no driver observes it — and the
 * port's omission is if anything the tidier DOM. It is a demo-fixture artifact,
 * not a library divergence (the library `createIllustration` is byte-identical).
 *
 * The demo renders three standalone illustrations under
 * `data-comparison-control-root="illustrations"`, each a different glyph at a
 * different default size — so a single default capture exercises the whole size
 * scale: `labelled` (Plan, S 48) is the D1/D3 `target`, `decorative` (DropZone,
 * M 96, the `aria-hidden:true` branch of the gate) is a diffed `part`, and the
 * `size-l` case drives the `target` to L 160.
 *
 * Applicable drivers — D1 (computed styles: the size scale + flex-shrink), D3
 * (pixel: the byte-identical Plan glyph on the non-animating labelled target), and
 * D6 (AX: role=img + the labelable name gate + the decorative/skeleton icons'
 * absence). The rest are **not** registered:
 *   - D2 motion: the core illustration has no animation; the only motion on the
 *     page is the *skeleton* illustration's shimmer — a WAAPI `element.animate()`
 *     sweep of `background-position` (not a CSS keyframe, `startTime = 0`, `2000ms
 *     ease-in-out infinite`, `100% → 0%`), which belongs to the Skeleton unit and
 *     is verified byte-identical by source read. The skeleton illustration is
 *     deliberately **not** a D1/D3 part so its animated `background-position` never
 *     destabilises the capture (and it is a different glyph besides).
 *   - D7 contrast: an illustration has no text node.
 *   - D4 events / D5 focus: `focusable={false}`, not pressable — no interaction.
 *   - D8 target-size: not an interactive target — no hit box to floor-check.
 */
const illustrationsScenario: DriverScenario = {
  slug: "illustrations",
  title: "Illustration",
  // The pure `createIllustration` output: a labelled Plan illustration (role=img
  // + aria-label, the S 48px box by default). `data-comparison-illustration=
  // "labelled"` is spread onto the svg on both stacks.
  target: ({ canvas }) => canvas.locator('[data-comparison-illustration="labelled"]'),
  parts: {
    // The decorative DropZone illustration — the `aria-hidden: true` branch of the
    // gate, at the M 96px step of the size scale (a different size from target).
    decorative: ({ canvas }) => canvas.locator('[data-comparison-illustration="decorative"]'),
  },
  cases: [
    // Default: labelled = Plan at S (48), decorative = DropZone at M (96). One
    // capture covers two steps of the size scale (S on target, M on the part).
    { id: "default", params: {} },
    // Drive the target to the L (160) step — the third and largest size.
    { id: "size-l", params: { size: "L" } },
    // aria-hidden flips the gate on the labelled illustration → it drops out of the
    // AX tree (the D6 headline). The box is unchanged, so D1/D3 re-confirm the S
    // box is invariant under the gate flip.
    { id: "hidden", params: { ariaHidden: "true" } },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // `flex-shrink` is the one base-macro longhand the default D1 allowlist omits
  // (size = width/height is already covered).
  styleProps: {
    add: ["flex-shrink"],
  },
  // D6: the canvas ariaSnapshot pins `img "Planning illustration"` for the labelled
  // illustration in `default`, and its *absence* when `aria-hidden` (`hidden`); the
  // decorative + skeleton illustrations are always absent (aria-hidden / inert) —
  // identical on both stacks.
  ax: {
    cases: ["default", "hidden"],
  },
};

registerStateMatrixDriver(illustrationsScenario);
registerPixelDriver(illustrationsScenario);
registerAxTreeDriver(illustrationsScenario);
