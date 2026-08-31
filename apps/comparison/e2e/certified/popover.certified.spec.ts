import { expect } from "@playwright/test";
import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 3, overlay): Popover.
 *
 * This certifies the STYLED POPOVER the S2 `Popover` paints. Unlike Tooltip
 * (whose headless layer hand-rolls its arrow and exposes no `arrowProps`), the
 * port's `createPopover` DOES compute `arrowProps`, so this unit lands the
 * FAITHFUL two-layer realignment that closes three self-inflicted divergences
 * that had been baked into the styled layer:
 *
 *   1. The invented `padding: 'none'|'sm'|'md'|'lg'` scale (default `md`=16)
 *      merged onto the SURFACE class — reverted to upstream's exported
 *      `Popover`, which paints TWO nested divs: the `AriaPopover` surface (the
 *      `popoverStyles` box — bg `layer-2`, outline, radius `lg`, elevation, and
 *      the `size` width) and an inner content div carrying `innerDivStyle`
 *      (`padding` default `'default'`=8 / `'none'`=0, box-sizing, overflow auto,
 *      position relative, width full). `UNSAFE_*`/`class`/`styles` now sink to
 *      the inner div, matching upstream; the surface class is PURELY
 *      `popoverStyles`.
 *   2. The Tailwind positioning class on the arrow wrapper
 *      (`absolute data-[placement=…]:…-full`) — reverted to upstream's
 *      `<OverlayArrow className="">`, now that the headless `OverlayArrow`
 *      self-positions (position:absolute + `[placement]:100%` + the cross-axis
 *      `left`/`top` from `arrowProps`), exactly like RAC's `OverlayArrow`.
 *   3. The headless arrow's `aria-hidden="true"` + `role="presentation"` —
 *      reverted; upstream leaves the arrow `<svg>` in the AX tree (it surfaces
 *      as an unnamed `img`), matching `<OverlayArrow className="">`.
 *
 * The rendered DOM is now byte-faithful to upstream in BOTH stacks:
 *
 *   <div role="dialog" aria-label="Feedback" tabindex=-1 data-placement=…>   ← popoverStyles surface
 *     <button aria-label="Dismiss" tabindex=-1/>                             ← modal dismiss sentinel
 *     <div class="">                                                         ← OverlayArrow wrapper (empty class)
 *       <svg viewBox="0 0 18 10" class={arrowStyles}>…</svg>                    self-positioned, arrowProps offset
 *     </div>
 *     <div class={innerDivStyle}>                                            ← inner content div (padding 8, scroll)
 *       <div style="width:300px;padding:12px"><p>…body…</p></div>              the demo content
 *     </div>
 *     <button aria-label="Dismiss" tabindex=-1/>                             ← trailing dismiss sentinel
 *   </div>
 *
 * OVERLAY PATTERN (mirrors dialog.certified.spec.ts): the popover portals to a
 * page-level container, so targets resolve from `page`, NOT `canvas`. Both
 * panels share the route, so the panel-major walk opens ONE panel's popover at
 * a time — `beforePanel` clicks THIS panel's `Feedback` trigger (the default
 * `dialogTrigger` mode), and `forEachScenarioPanel`'s per-panel fresh
 * `page.goto` guarantees isolation.
 *
 * D1/D3 TARGET = the `role="dialog"` surface `<div>` itself (the popover paints
 * `popoverStyles` — bg/outline/radius/elevation — directly onto it; unlike the
 * Dialog surface, which is transparent and paints on its parent modal). The
 * arrow `<svg>` is the one named D1 part; it self-positions OUTSIDE the surface
 * border-box (`[placement]:100%`), so the surface element screenshot clips it
 * out and stays arrow-position-independent (cleaner than Tooltip, which needed
 * a subpixel waiver — the popover arrow rides the real `arrowProps`).
 *
 * CASES — the four resolved placements (`shouldFlip:false` pinned so each stack
 * renders at the requested axis) certify the arrow's byte-copied `arrowStyles`
 * rotate/translate map (top 0, bottom 180deg, left -90deg, right 90deg; ±25%
 * cross translate); `size-m`/`size-l` certify the surface `width` variant
 * (416/576). `showForm:false` pins the content to the deterministic
 * fixed-width (300px) body `<p>` so the surface fits a stable box in both
 * stacks. `hideArrow` is intentionally NOT a case: its only effect (box-shadow
 * elevated vs the arrow-shown `filter` elevated) lands outside the surface
 * border-box and outside the D1 allowlist, so no driver would observe it.
 *
 * SCOPE — applicable drivers: D1 (surface box + arrow style), D3 (pixel: the
 * painted surface; arrow clipped out), D6 (AX: the `role="dialog"` subtree +
 * accessible name + the two dismiss sentinels + the arrow img), D7 (contrast:
 * the body copy on `layer-2`, both themes). NOT registered here:
 *   - D2 (motion): the enter/exit fade (opacity 0→1, ±4px translate) — the port
 *     does not internally drive `isEntering` (it is a prop, not a
 *     `useEnterAnimation`-style state machine), so the port has no default
 *     enter animation to compare frame-for-frame. Tracked as the shared
 *     headless-overlay work in ticket #68.
 *   - D4/D5 (events/focus): open-on-press, close-on-Escape/interact-outside,
 *     underlay dismiss, and focus containment/restoration are
 *     `PopoverTrigger`/`DialogTrigger` behaviors, not the surface's; they belong
 *     to a trigger interaction unit.
 *   - D8 (target size): the dismiss sentinels are RAC-injected screen-reader
 *     controls (same as Dialog's, certified there); the surface is not a hit
 *     target.
 */

const triggerLabel = "Feedback";
const popoverName = "Feedback";

/** The `role="dialog"` surface `<div>` — the D1/D3/AX/contrast root. */
const popoverSurface: TargetResolver = ({ page }) =>
  page.getByRole("dialog", { name: popoverName });
/** The directional arrow `<svg>` — the only svg inside the surface (the
 *  `showForm:false` content is a plain `<div><p>`), carrying the byte-copied
 *  `arrowStyles`. */
const popoverArrow: TargetResolver = ({ page }) =>
  page.getByRole("dialog", { name: popoverName }).locator("svg");

/** Click this panel's `Feedback` trigger to open its (and only its) popover.
 *  `forEachScenarioPanel` neutralizes the pointer and does a fresh `page.goto`
 *  before `beforePanel`, so this is the only trigger fired on the page. */
const openPopover = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: triggerLabel }).first().click();
  await expect(page.getByRole("dialog", { name: popoverName })).toBeVisible();
};

/**
 * Best-effort close before the next panel. Isolation is actually guaranteed by
 * the fresh `page.goto` `forEachScenarioPanel` runs per panel; this only nudges
 * the page clean and NEVER asserts (close-on-Escape is a trigger interaction
 * contract in D4/D5 scope, not the surface's).
 */
const closePopover = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

const surfaceScenario: DriverScenario = {
  slug: "popover",
  title: "Popover surface",
  beforePanel: openPopover,
  afterPanel: closePopover,
  target: popoverSurface,
  pixelTarget: popoverSurface,
  // A popover surface has no hover/press affordances of its own — the rest
  // matrix (placement/size × theme) is the whole surface. Upstream fades in over
  // 200ms; settle to opacity 1 / translate 0 before measuring.
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "placement-top", params: { placement: "top", shouldFlip: "false", showForm: "false" } },
    {
      id: "placement-bottom",
      params: { placement: "bottom", shouldFlip: "false", showForm: "false" },
    },
    {
      id: "placement-left",
      params: { placement: "left", shouldFlip: "false", showForm: "false" },
    },
    {
      id: "placement-right",
      params: { placement: "right", shouldFlip: "false", showForm: "false" },
    },
    {
      id: "size-m",
      params: { placement: "bottom", size: "M", shouldFlip: "false", showForm: "false" },
    },
    {
      id: "size-l",
      params: { placement: "bottom", size: "L", shouldFlip: "false", showForm: "false" },
    },
  ],
  parts: {
    arrow: popoverArrow,
  },
  // Default allowlist covers color/bg/border/radius/font/padding/width/height/
  // display/transform. Add the popover box constraints (max-width/box-sizing) +
  // the arrow's rotate/translate/fill longhands the placement map drives (the
  // default list carries only `transform`).
  styleProps: {
    add: ["max-width", "box-sizing", "fill", "rotate", "translate"],
  },
  // D6: the `role="dialog"` subtree — accessible name ("Feedback"), the two
  // "Dismiss" sentinels (leading gated on modal + trailing), and the arrow svg
  // (surfaces as an unnamed `img` in both stacks). Semantics are
  // placement-independent, so the AX driver's first-case default (placement-top)
  // is the whole surface.
  ax: {
    roots: {
      popover: popoverSurface,
    },
  },
  // D7: the body copy on the `layer-2` popover surface, both themes.
  // Placement-independent, so one case is the whole contrast surface.
  contrast: {
    cases: ["placement-top"],
    root: popoverSurface,
  },
};

registerStateMatrixDriver(surfaceScenario);
registerPixelDriver(surfaceScenario);
registerAxTreeDriver(surfaceScenario);
registerContrastDriver(surfaceScenario);
