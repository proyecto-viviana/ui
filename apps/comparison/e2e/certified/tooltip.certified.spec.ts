import { expect } from "@playwright/test";
import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type {
  DriverScenario,
  PanelContext,
  TargetResolver,
  TimingContext,
} from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTimingDriver } from "../drivers/timing";

/**
 * Recertification march unit (Tier 3, first overlay): Tooltip.
 *
 * This certifies the STYLED TOOLTIP SURFACE the S2 `Tooltip` paints — the
 * byte-copied `tooltip` `style()` object (colorScheme, maxWidth 160, minHeight
 * 24, font ui-sm, gray-25 on `neutral`, borderRadius default, edge-to-text
 * paddingX, centerPadding paddingY) plus the directional arrow `<svg>` styled
 * by the byte-copied `arrowStyles` (fill gray-800, 10×5, rotate/translateX per
 * placement) — against upstream S2 `Tooltip.tsx` (`@react-spectrum/s2@1.5.1`,
 * the installed pin) rendered live in the React panel.
 *
 * OVERLAY PATTERN (mirrors dialog.certified.spec.ts): the tooltip portals to a
 * page-level `OverlayContainer`, so targets resolve from `page`, NOT `canvas`.
 * Both panels share the route, so opening via `?isOpen=true` would open BOTH
 * tooltips at once and make `page.getByRole("tooltip")` ambiguous. Instead the
 * panel-major walk opens ONE panel's tooltip at a time: `beforePanel` hovers
 * this panel's trigger with the warmup pinned to `delay:0` (hover is the demo's
 * canonical trigger, and `forEachScenarioPanel` neutralizes the pointer before
 * `beforePanel`, so the hover is the only pointer signal on the page), so exactly
 * one tooltip is live when the drivers measure.
 *
 * DOM shape (both stacks, verified against upstream + the styled fixtures):
 *
 *   <div role="tooltip" lang dir data-placement=…>   ← the `tooltip` style surface
 *     <…arrow wrapper…><svg class={arrowStyles}/></…> ← OverlayArrow (upstream) /
 *     Tooltip content                                    hand-rolled div (port)
 *   </div>
 *
 * D1 TARGET = the `role="tooltip"` surface `<div>` (the painted body). The arrow
 * `<svg>` is the one named part; `page.getByRole("tooltip").locator("svg")`
 * resolves it in BOTH stacks (each renders exactly one svg inside the surface).
 *
 * CASES — the four resolved placements, `shouldFlip:false` pinned so each stack
 * renders at the requested placement (the port's flip heuristic is hand-rolled;
 * flip-parity is a separate concern, out of scope here). The placement cases
 * certify the arrow's `rotate`/`translateX` map (top 0, bottom 180deg, left
 * -90deg, right 90deg; ±25% cross translate) byte-for-byte, so `rotate`,
 * `translate`, and `fill` are added to the D1 allowlist (the default list carries
 * only `transform`, and the macro emits the independent `rotate`/`translate`
 * longhands).
 *
 * SCOPE — applicable drivers: D1 (rest surface + arrow style), D3 (pixel: the
 * painted body; the arrow sits outside the body's border-box so an element
 * screenshot of the surface is position-independent and clean), D6 (AX: the
 * `role="tooltip"` subtree + accessible name), D7 (contrast: gray-25 on
 * `neutral`, both themes). NOT registered here:
 *   - D2 (motion): the enter/exit animation (opacity 0→1, ±4px translate) is a
 *     real tooltip behavior, but the port drives it through a from-scratch
 *     positioning/animation state machine in `solidaria-components/Tooltip.tsx`
 *     (a hand-rolled `updatePosition()` + `getAnimations()`-based enter/exit),
 *     NOT React Aria's `useOverlayPosition` + `useEnterAnimation`. Certifying the
 *     motion metadata is blocked on realigning that headless layer to the RAC
 *     overlay machinery (which is also what would let the styled arrow use the
 *     real `<OverlayArrow>` with computed `arrowProps`). Tracked as a follow-up
 *     in ticket #64; deferred to that dedicated headless-overlay unit.
 *   - D4/D5 (events/focus): open-on-hover/focus, close-on-Escape, and focus
 *     restoration are `TooltipTrigger` behaviors, not the Tooltip surface's;
 *     they belong to a TooltipTrigger interaction unit.
 *   - D8 (target size): the tooltip surface is not an interactive hit target;
 *     the trigger is an ActionButton, certified by its own unit.
 */

const triggerLabel = "Inspect";

/** The `role="tooltip"` surface `<div>` — the D1 target + pixel/ax/contrast root. */
const tooltipSurface: TargetResolver = ({ page }) => page.getByRole("tooltip");
/** The directional arrow `<svg>` — one per surface in both stacks (upstream wraps
 *  it in `<OverlayArrow>`, the port in a hand-rolled positioning `<div>`); the svg
 *  itself carries the byte-copied `arrowStyles`. */
const tooltipArrow: TargetResolver = ({ page }) => page.getByRole("tooltip").locator("svg");

/** Hover this panel's trigger to open its (and only its) tooltip. With the warmup
 *  pinned to `delay:0` (see the case params) the hover opens the tooltip
 *  immediately in both stacks — hover is the demo's canonical trigger and the only
 *  gesture the port + upstream both open on with a plain Playwright interaction
 *  (programmatic `.focus()` is not focus-visible, so RAC/the port hold the tooltip
 *  closed). `forEachScenarioPanel` neutralizes the pointer before `beforePanel`,
 *  so this hover is the only pointer signal on the page. */
const openTooltip = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: triggerLabel }).first().hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
};

/**
 * Best-effort close before the next panel. Isolation is actually guaranteed by
 * the fresh `page.goto` `forEachScenarioPanel` runs per panel — the previous
 * panel's tooltip is destroyed on navigation regardless. So this only nudges the
 * page clean and NEVER asserts: close-on-pointer-leave is a `TooltipTrigger`
 * interaction contract (D4/D5 scope), not the surface's, and asserting it here
 * would couple this surface cert to that separate concern. Moving the pointer to
 * the origin lifts the hover so the tooltip is not left visible.
 */
const closeTooltip = async ({ page }: PanelContext) => {
  await page.mouse.move(0, 0);
};

const surfaceScenario: DriverScenario = {
  slug: "tooltip",
  title: "Tooltip surface",
  beforePanel: openTooltip,
  afterPanel: closeTooltip,
  target: tooltipSurface,
  pixelTarget: tooltipSurface,
  // A tooltip surface has no hover/press affordances of its own — the rest
  // matrix (placement × theme) is the whole surface. The enter animation needs
  // time to settle to opacity 1 before measuring.
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "placement-top", params: { placement: "top", shouldFlip: "false", delay: "0" } },
    { id: "placement-bottom", params: { placement: "bottom", shouldFlip: "false", delay: "0" } },
    { id: "placement-left", params: { placement: "left", shouldFlip: "false", delay: "0" } },
    { id: "placement-right", params: { placement: "right", shouldFlip: "false", delay: "0" } },
  ],
  parts: {
    arrow: tooltipArrow,
  },
  // Default allowlist covers color/bg/border/radius/font/padding/width/height/
  // display/transform. Add the tooltip box constraints (max-width/min-height/
  // box-sizing/overflow-wrap) + the arrow's rotate/translate/fill longhands the
  // placement map drives (the default list has only `transform`).
  styleProps: {
    add: ["max-width", "min-height", "box-sizing", "overflow-wrap", "fill", "rotate", "translate"],
  },
  // D3: top/bottom are byte-exact — the arrow is horizontally centered
  // (`left:50%;translateX(-50%)` over a 10px-wide frame lands on an integer
  // pixel). left/right carry a tight, bounded waiver: the port positions the
  // arrow with a hand-rolled `top:50%;translateY(-50%)` frame (see
  // `arrowFrameStyle` in solid-spectrum/src/tooltip/index.tsx), which lands the
  // 5px-tall frame on a fractional half-pixel, whereas upstream's `<OverlayArrow>`
  // consumes a JS-computed INTEGER `top` from React Aria's `useOverlayPosition`
  // `arrowProps`. The result is a ~1px vertical sub-pixel shift of the arrow tip
  // (~19/13728 px, confined to the arrow bounds). Closing this to byte-exact means
  // porting the arrow onto the real `<OverlayArrow>` + `arrowProps`, which is
  // blocked on realigning the from-scratch headless positioning layer to RAC's
  // overlay machinery. Tickets #64 and #68 own this work, including the
  // deferred D2 motion evidence.
  pixel: {
    waivers: [
      {
        caseId: "placement-left",
        state: "*",
        theme: "*",
        threshold: { maxMismatchRatio: 0.003, maxDimensionDelta: 0, pixelThreshold: 0 },
        reason:
          "tooltip-arrow-overlayarrow-subpixel: hand-rolled arrow frame vs OverlayArrow arrowProps",
      },
      {
        caseId: "placement-right",
        state: "*",
        theme: "*",
        threshold: { maxMismatchRatio: 0.003, maxDimensionDelta: 0, pixelThreshold: 0 },
        reason:
          "tooltip-arrow-overlayarrow-subpixel: hand-rolled arrow frame vs OverlayArrow arrowProps",
      },
    ],
  },
  // D6: the `role="tooltip"` subtree + its accessible name ("Tooltip content").
  // Semantics are placement-independent, so the AX driver's first-case default
  // (placement-top) is the whole surface.
  ax: {
    roots: {
      tooltip: tooltipSurface,
    },
  },
  // D7: gray-25 text on the `neutral` surface, both themes. Placement-independent,
  // so one case is the whole contrast surface.
  contrast: {
    cases: ["placement-top"],
    root: tooltipSurface,
  },
};

registerStateMatrixDriver(surfaceScenario);
registerPixelDriver(surfaceScenario);
registerAxTreeDriver(surfaceScenario);
registerContrastDriver(surfaceScenario);

/**
 * D11 (timing) — the TooltipTrigger warmup/cooldown state machine.
 *
 * This is a SEPARATE scenario from the surface cert above: that one pins
 * `delay:0` and auto-opens the tooltip in `beforePanel` so the paint drivers can
 * measure a live surface; D11 must instead exercise the REAL delay, so it drives
 * the trigger itself under a frozen clock and never opens anything up front.
 *
 * TARGET = the trigger ActionButton (`canvas`, not the portaled surface). SIGNAL
 * = the trigger's `aria-describedby`, which upstream sets to the tooltip id only
 * while `state.isOpen` (`useTooltipTrigger`) and the port mirrors via the
 * TriggerWrapper effect — i.e. the LOGICAL open state. DOM presence is the WRONG
 * signal here: react-aria-components lingers the `role="tooltip"` element through
 * its CSS exit transition, and the frozen clock suspends that transition so the
 * element never unmounts on the React panel — a D2 (motion) artifact, deferred
 * with the rest of the tooltip motion cert, that would otherwise read as a phantom
 * cooldown divergence.
 *
 * The demo `delay` prop drives the OPEN warmup; `closeDelay` is unset so the close
 * timer uses `TOOLTIP_COOLDOWN` (both from `@react-stately/tooltip`). The timeline
 * pins BOTH boundaries to the exact millisecond — closed at `warmup-1`, open at
 * `warmup`; open at `cooldown-1`, closed at `cooldown` — so a port that shifted
 * either delay by a single tick would red the pair-diff. Both stacks must produce
 * the identical seven-checkpoint timeline. (Focus-instant-open and press/blur
 * immediate-close are the other TooltipTrigger timing paths; they need keyboard
 * focus-visibility to open and are left to the deferred TooltipTrigger interaction
 * unit alongside D4/D5.)
 */
const WARMUP_MS = 1500;
const COOLDOWN_MS = 500;

/** The trigger ActionButton — D11 drives + probes this, not the portaled surface. */
const tooltipTrigger: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button", { name: triggerLabel }).first();

/** Logical open state = the trigger's `aria-describedby` (present only while
 *  `state.isOpen` in both stacks). NOT DOM presence — see the scenario doc. */
const tooltipOpenState = async ({ target }: TimingContext): Promise<string> =>
  (await target.getAttribute("aria-describedby")) ? "open" : "closed";

const hoverTrigger = async ({ target }: TimingContext) => {
  await target.hover();
};
const leaveTrigger = async ({ page }: TimingContext) => {
  await page.mouse.move(0, 0);
};

const timingScenario: DriverScenario = {
  slug: "tooltip",
  title: "Tooltip trigger timing",
  target: tooltipTrigger,
  // Pin the warmup explicitly (the demo default is 1500, but tie the constant to
  // the timeline). `closeDelay` is left to its TOOLTIP_COOLDOWN (500) default.
  cases: [{ id: "hover", params: { delay: String(WARMUP_MS) } }],
  timing: {
    probe: tooltipOpenState,
    timelines: [
      {
        id: "warmup-cooldown",
        steps: [
          { label: "rest" },
          { label: "hover", act: hoverTrigger },
          { label: `warm-${WARMUP_MS - 1}`, advanceMs: WARMUP_MS - 1 },
          { label: `warm-${WARMUP_MS}`, advanceMs: 1 },
          { label: "unhover", act: leaveTrigger },
          { label: `cool-${COOLDOWN_MS - 1}`, advanceMs: COOLDOWN_MS - 1 },
          { label: `cool-${COOLDOWN_MS}`, advanceMs: 1 },
        ],
      },
    ],
  },
};

registerTimingDriver(timingScenario);
