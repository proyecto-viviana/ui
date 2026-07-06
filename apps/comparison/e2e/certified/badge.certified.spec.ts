import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1): Badge — a non-interactive display
 * primitive that, unlike Avatar, carries **text**, so the D7 contrast driver
 * re-enters the applicable set. Upstream S2 `Badge` and the port both render a
 * `<span role="presentation" class=badge><Text>…</Text></span>` (verified
 * byte-identical, incl. the `badge`/`badgeStyles` macro), so the badge span is
 * the D1 `target` and the inner `<Text>` span is a diffed `part` — the only
 * place the `overflowMode` white-space treatment lives.
 *
 * Prop cases span the parity-critical axes: the `fillStyle` × `variant` colour
 * table (the `bold` fill's white-vs-**black** text exception for
 * notice/orange/yellow/chartreuse/celery is the sharpest contrast surface), the
 * `outline` fill's per-variant coloured border, the `size` scale, the
 * `overflowMode` white-space switch, and the `iconPlacement: start` icon slot.
 *
 * Applicable drivers are styling/AX/contrast — D1 (computed styles), D3 (pixel),
 * D6 (AX), D7 (contrast). The interaction and target-size drivers are **not**
 * registered because they do not apply to a static presentation span:
 *   - D2 motion: the `badge` macro carries no interaction-triggered transition;
 *     a badge has no state that animates.
 *   - D4 events / D5 focus: `role="presentation"`, non-interactive, not
 *     focusable — no press or focus to log.
 *   - D8 target-size: not an interactive target (no button/link/role match), so
 *     there is no hit box to floor-check.
 *
 * The fixture deliberately threads `hidden` + `aria-*` passthrough props to
 * prove `filterDOMProps` (called with no opts) strips them on both stacks; only
 * `id` + `data-*` survive, so `[data-comparison-control-root="badge"]` is the
 * badge span on both panels.
 */
const badgeScenario: DriverScenario = {
  slug: "badge",
  title: "Badge",
  // The badge span carries the `badge` macro (bg / border / colour / control
  // padding + font). `data-*` survives filterDOMProps on both stacks, so this
  // attribute is present and unique on the span.
  target: ({ canvas }) => canvas.locator('[data-comparison-control-root="badge"]'),
  // The inner `<Text>` span holds the `overflowMode` white-space + the ellipsis
  // overflow treatment — invisible on the pixel side for a short label, so it is
  // diffed here directly. `.last()` resolves the text span in every case (for
  // `icon-start` the DOM order is [icon-center-span, text-span]).
  parts: {
    text: ({ canvas }) => canvas.locator('[data-comparison-control-root="badge"] span').last(),
  },
  cases: [
    { id: "default", params: {} },
    { id: "bold-negative", params: { variant: "negative", fillStyle: "bold" } },
    // yellow/notice/orange/chartreuse/celery flip the bold text colour to black.
    { id: "bold-yellow", params: { variant: "yellow", fillStyle: "bold" } },
    { id: "subtle-accent", params: { variant: "accent", fillStyle: "subtle" } },
    { id: "outline-positive", params: { variant: "positive", fillStyle: "outline" } },
    { id: "size-xl", params: { size: "XL" } },
    { id: "truncate", params: { overflowMode: "truncate" } },
    { id: "icon-start", params: { size: "M", iconPlacement: "start" } },
  ],
  // Non-interactive: no hover/focus/press treatment, so the matrix collapses to
  // the single resting state.
  states: ["default"],
  // The white-space / overflow / flex-order longhands are not in the default D1
  // allowlist but are exactly what distinguishes `overflowMode` (on the text
  // span) and the icon/text ordering — add them so the pair diff sees them.
  styleProps: {
    add: ["white-space", "text-overflow", "overflow-x", "overflow-y", "order"],
  },
  // D6: a `role="presentation"` badge contributes no element node — only its
  // text is exposed. The `icon-start` case additionally proves the leading icon
  // is `aria-hidden` (it must not add an image node), leaving the identical
  // single `text` node in both stacks.
  ax: {
    cases: ["default", "icon-start"],
  },
  // D7: the badge label's contrast against its fill. The pair diff is the hard
  // gate — the bold white/black choice, the subtle gray-1000-on-subtle, and the
  // outline gray-1000-on-layer-2 must match upstream to 2dp across both themes.
  // `bold-yellow` is the black-text exception; `outline-positive` carries the
  // coloured border.
  contrast: {
    cases: ["default", "bold-negative", "bold-yellow", "subtle-accent", "outline-positive"],
  },
};

registerStateMatrixDriver(badgeScenario);
registerPixelDriver(badgeScenario);
registerAxTreeDriver(badgeScenario);
registerContrastDriver(badgeScenario);
