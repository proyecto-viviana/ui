import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): StatusLight — a coloured **dot + label**
 * display primitive. Upstream S2 `StatusLight` and the port both render
 *
 *   <div role={role} class=wrapper>
 *     <div class=centerBaseline><svg class=light aria-hidden><circle/></svg></div>
 *     <span data-rsp-slot="text" class>{children}</span>
 *   </div>
 *
 * verified **byte-identical** — the `wrapper`/`light` `style()` macros match the
 * two source files line-for-line (same `controlFont`, `gap: 'text-to-visual'`,
 * `width: 'fit'`, the neutral-only `gray-600` text-colour branch, the 8/10/12/14
 * `size` scale, and the full 19-variant `fill` colour table), `CenterBaseline`
 * is a `<div>` on both, and S2 `Text` is a `<span data-rsp-slot="text">` on both.
 * So the wrapper is the D1 `target`, and the two children are diffed `parts`:
 * `dot` (the `<svg>`, where the variant `fill` and `size` live) and `text` (the
 * label `<span>`, where the inherited font + text colour live).
 *
 * Applicable drivers — D1 (computed styles), D3 (pixel), D6 (AX: the optional
 * `role="status"` live region + the `filterDOMProps` labelable gate), and D7
 * (contrast: the label text). The rest are **not** registered:
 *   - D2 motion: the macros carry no transition/animation (`disableTapHighlight`
 *     is a static `-webkit-tap-highlight-color`, not a transition).
 *   - D4 events / D5 focus: a StatusLight is not pressable or focusable — no
 *     tabindex, no press handling; the optional `role="status"` is a live region,
 *     not an interactive widget.
 *   - D8 target-size: not an interactive target — no hit box to floor-check.
 *
 * The variant `fill` is an SVG presentation property, not `background-color`, so
 * it is not in the default D1 allowlist — `styleProps.add` pulls in `fill` (plus
 * the svg's `overflow`) so the pair diff sees the dot colour on the `dot` part.
 * The label colour is set on the wrapper (`neutral` default, `gray-600` only for
 * the neutral variant) and inherited by the `text` span, so `color` (already in
 * the allowlist) captures it on both the target and the text part.
 */
const statusLightScenario: DriverScenario = {
  slug: "statuslight",
  title: "StatusLight",
  // The wrapper div carries the `wrapper` macro + optional `role`.
  // `data-comparison-control-root="statuslight"` is threaded onto it by both
  // fixtures and survives filterDOMProps (data-* is always kept), so it is
  // present and unique on the wrapper.
  target: ({ canvas }) => canvas.locator('[data-comparison-control-root="statuslight"]'),
  parts: {
    // The `<svg>` dot: its computed `fill` is the variant colour and its
    // width/height are the `size` scale. aria-hidden, so it is invisible to D6.
    dot: ({ canvas }) => canvas.locator('[data-comparison-control-root="statuslight"] svg'),
    // The label `<span>` (Text). CenterBaseline is a `<div>`, so the wrapper's
    // only direct-child span is the label — `> span` resolves it on both stacks.
    text: ({ canvas }) => canvas.locator('[data-comparison-control-root="statuslight"] > span'),
  },
  cases: [
    // Semantic variants — each maps its `fill` to the same-named colour token.
    { id: "default", params: {} }, // neutral: gray-600 text + neutral dot
    { id: "informative", params: { variant: "informative" } },
    { id: "positive", params: { variant: "positive" } },
    { id: "notice", params: { variant: "notice" } },
    { id: "negative", params: { variant: "negative" } },
    // A decorative (non-semantic) variant, sampling the other side of the table.
    { id: "seafoam", params: { variant: "seafoam" } },
    // The 8px / 14px ends of the `size` dot scale.
    { id: "size-s", params: { size: "S" } },
    { id: "size-xl", params: { size: "XL" } },
    // role:status turns the wrapper into a live region and (via filterDOMProps
    // labelable) lets the fixture's aria-label survive — the D6 headline.
    { id: "status-role", params: { role: "status" } },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // The dot colour (`fill`) and the svg overflow are not in the default D1
  // allowlist; add them so the `dot` part diff sees the variant colour + the
  // explicit `overflow: visible`. (size = width/height, gap = column/row-gap,
  // and the inherited text `color` are already covered.)
  styleProps: {
    add: ["fill", "overflow-x", "overflow-y"],
  },
  // D6: with no role the wrapper is generic and only the label text is exposed
  // (`default`); with role="status" the wrapper becomes a `status` live region
  // whose accessible name is the fixture's aria-label (kept because labelable is
  // now true) — proving both the role wiring and the filterDOMProps gate,
  // identically on both stacks.
  ax: {
    cases: ["default", "status-role"],
  },
  // D7: the label text's contrast against the surface. `default` is the neutral
  // variant's gray-600 branch; `positive`/`negative` are the coloured-dot
  // variants whose *label* stays the high-contrast `neutral` token — the pair
  // diff confirms the port reproduces upstream's exact text-colour choice to 2dp
  // in both themes. (The dot's non-text contrast is a shared-token fill already
  // asserted byte-for-byte by D1.)
  contrast: {
    cases: ["default", "positive", "negative"],
  },
};

registerStateMatrixDriver(statusLightScenario);
registerPixelDriver(statusLightScenario);
registerAxTreeDriver(statusLightScenario);
registerContrastDriver(statusLightScenario);
