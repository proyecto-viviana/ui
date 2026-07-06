import { registerAxTreeDriver } from "../drivers/ax";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): Icon — the `createIcon` HOC that wraps a
 * raw workflow-icon `<svg>` and stamps the S2 icon contract onto it. Upstream S2
 * `createIcon` (`s2/src/Icon.tsx`) and the port (`icon/spectrum-icon.tsx`) both
 * render the passed `<Component>` svg with:
 *
 *   <svg role="img" focusable={false}
 *        aria-label={label} aria-hidden={label ? (hidden||undefined) : true}
 *        data-slot={slot} class=iconStyles(size:20, flexShrink:0)>
 *     …glyph paths, fill: var(--iconPrimary, #222)…
 *   </svg>
 *
 * verified **byte-identical** by source read: the `iconStyles`/`iconBaseStyles`
 * `style()` macro is the same `{size: 20, flexShrink: 0}` base over the same
 * `allowedOverrides` list (margin, gridArea, position, zIndex, inset, rotate,
 * `--iconPrimary`, size — deliberately **excluding** width/height/flex so an icon
 * never grows/shrinks past its 20px square); the `aria-hidden` gate is the same
 * ternary (`aria-label ? aria-hidden || undefined : true` — labelled icons expose
 * their name, unlabelled icons are `aria-hidden`); `role="img"`, `focusable=false`
 * and `data-slot` match; and the skeleton path is DOM-equivalent (upstream wraps
 * the svg in `<SkeletonWrapper>`, which renders **no** element outside a
 * `<Skeleton>` provider, while the port applies the same `loadingStyle` +
 * `inert` + WAAPI ref directly on the svg — identical DOM when not loading). The
 * demo's two `createIcon((props) => <svg …>)` glyphs (React vs Solid) are
 * **byte-identical** — same `viewBox="0 0 20 20"`, same two `<path d=…>`, same
 * `fill: var(--iconPrimary, #222)` — so the rendered glyph is pixel-identical.
 *
 * The demo renders four icon contexts under `data-comparison-control-root="icons"`,
 * each tagged `data-comparison-icon`. The pure-`createIcon` output is the D1/D3
 * `target` (`labelled`), and two more contexts are diffed `parts`:
 *   - `decorative` — an unlabelled icon (the `aria-hidden: true` branch of the
 *     gate; same size/flex box as `labelled`).
 *   - `buttonIcon` — the svg inside an accent Button, which provides its own
 *     `IconContext` (`render: centerBaseline({slot:'icon', styles: order:0})`,
 *     `styles: {size: fontRelative(20), marginStart: '--iconMargin', flexShrink:
 *     0}`). Both Button `iconContextValue`s match byte-for-byte, so this part
 *     proves the port's icon **consumes** the Button's IconContext (the
 *     font-relative resize + `--iconMargin` inline-start) exactly like upstream.
 *
 * Applicable drivers — D1 (computed styles: the icon box + the Button-context
 * resize/margin), D3 (pixel: the labelled glyph — the `target` is non-animating,
 * so the page's skeleton shimmer never touches it), and D6 (AX: `role=img` + the
 * labelable name gate + the decorative/skeleton icons' *absence* from the tree +
 * the Button composition). The rest are **not** registered:
 *   - D2 motion: the core icon has no animation; the only motion on the page is
 *     the *skeleton* icon's shimmer, which is a WAAPI `element.animate()` sweep of
 *     `background-position` (not a CSS keyframe) synchronised via `startTime = 0`.
 *     That belongs to the Skeleton unit; its content/timing (`2000ms ease-in-out
 *     infinite`, `100% → 0%`) is verified byte-identical by source read. The
 *     skeleton icon is deliberately **not** a D1/D3 part here so its animated
 *     `background-position` never destabilises the capture.
 *   - D7 contrast: an icon has no text node (the accent Button's label is the
 *     Button's surface, not the icon's).
 *   - D4 events / D5 focus: `focusable={false}`, not pressable — no interaction.
 *   - D8 target-size: not an interactive target — no hit box to floor-check.
 */
const iconsScenario: DriverScenario = {
  slug: "icons",
  title: "Icon",
  // The pure `createIcon` output: a labelled workflow icon (role=img + aria-label,
  // the 20px/flex-shrink base). `data-comparison-icon="labelled"` is passed as a
  // prop and spread (via `...rest`) straight onto the svg on both stacks.
  target: ({ canvas }) => canvas.locator('[data-comparison-icon="labelled"]'),
  parts: {
    // The unlabelled icon — the `aria-hidden: true` branch of the gate. Same box.
    decorative: ({ canvas }) => canvas.locator('[data-comparison-icon="decorative"]'),
    // The svg inside the accent Button — resized/margined by the Button's
    // IconContext. `[data-comparison-icon="button-context"]` is on the Button, so
    // ` svg` (descendant) resolves its single icon.
    buttonIcon: ({ canvas }) => canvas.locator('[data-comparison-icon="button-context"] svg'),
  },
  cases: [
    // Default: the labelled icon exposes its name "Create item" (role=img).
    { id: "default", params: {} },
    // aria-hidden flips the gate on the labelled icon → it drops out of the AX
    // tree (the D6 headline; the box is unchanged, so D1/D3 stay identical).
    { id: "hidden", params: { ariaHidden: "true" } },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // `flex-shrink` is the one base-macro longhand the default D1 allowlist omits
  // (size = width/height and the Button-context `margin` are already covered).
  styleProps: {
    add: ["flex-shrink"],
  },
  // D6: the canvas ariaSnapshot pins `img "Create item"` for the labelled icon,
  // its *absence* when `aria-hidden` (the `hidden` case), the decorative +
  // skeleton icons' absence (aria-hidden / inert), and the accent Button
  // composed as `button "Create"` — all identical on both stacks.
  ax: {
    cases: ["default", "hidden"],
  },
};

registerStateMatrixDriver(iconsScenario);
registerPixelDriver(iconsScenario);
registerAxTreeDriver(iconsScenario);
