import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { expect } from "@playwright/test";

/**
 * Recertification march unit (Tier 3, overlay): ContextualHelp.
 *
 * ContextualHelp = an icon-only quiet `ActionButton` TRIGGER (a `HelpCircle` or
 * `InfoCircle` glyph, `aria-haspopup="dialog"`) composed with a hideArrow S2
 * `Popover` whose content is the contextual-help frame (`wrappingDiv` ->
 * `dialogInner`-style body carrying a Heading/Content/Footer). Two scenarios
 * certify the two paint surfaces:
 *
 *   1. TRIGGER (closed) — the port renders `s2ActionButton` (isQuiet) with the
 *      variant glyph, mapping `ContextualHelp.size` (XS/S) -> `ActionButton.size`.
 *      This certifies the quiet-button size passthrough and the two variant glyphs
 *      (help vs info) paint identically to upstream. The trigger is always
 *      rendered, so this scenario measures the canvas button directly — no open.
 *
 *   2. CONTENT (opened) — the contextual-help popover body. Upstream renders
 *      `<Popover padding="none" hideArrow aria-labelledby={titleId}>` around a
 *      `wrappingDiv` (width 268, padding 24, height full) -> an inner div
 *      (`mergeStyles(dialogInner, {borderRadius:'none', margin:-paddingTop,
 *      padding:24})`) -> Heading (`heading-xs`) + Content (`body-sm`) + Footer
 *      (`body-sm`, marginTop 16). The port mirrors this exactly (this unit reverted
 *      three self-inflicted divergences on that body — see PORT FIXES). The popover
 *      SURFACE chrome (bg `layer-2`, outline, radius, elevation) is already
 *      certified by Popover (CP9.29), so the D1/D3 root here is the `wrappingDiv`
 *      FRAME (the ContextualHelp-distinct content box), not the dialog surface.
 *
 * PORT FIXES landed with this unit (faithful reverts of self-inflicted
 * divergences, grounded in @react-spectrum/s2 ContextualHelp.tsx + Dialog.tsx):
 *   - `contextualHelpFrame` was missing `height: 'full'` (upstream `wrappingDiv`).
 *   - `contextualHelpInner` carried `font:'body-sm'` + `color:'neutral'`; upstream
 *     merges `dialogInner` (only `fontFamily:'sans'`, no font shorthand, no color) —
 *     the body copy's font/color come from the Content/Text/Footer contexts and the
 *     inherited theme neutral. Reverted to `fontFamily:'sans'`.
 *   - the popover's `aria-labelledby` was `aria-label={triggerLabel}`; reverted to
 *     upstream's unconditional `aria-labelledby={titleId}`.
 *   - the `HeadingContext` DEFAULT slot carried `{id: titleId, level: 2}`; upstream's
 *     default slot is styles ONLY (only the explicit `title` slot mints the id +
 *     level 2). With the default slot, a headless `<Heading>` (the canonical story
 *     + this demo) renders `<h3>` (RAC default level) and does NOT name the dialog,
 *     so the popover's `aria-labelledby={titleId}` dangles — the SAME unnamed `<h3>`
 *     dialog in BOTH stacks. This is why the CONTENT targets address the dialog by
 *     bare `role="dialog"` and the heading by bare `role="heading"` (no name/level
 *     filter): the pair is byte-identical, just anonymous, exactly like upstream.
 *
 * OVERLAY PATTERN (mirrors popover.certified.spec.ts): the popover portals to a
 * page-level container, so CONTENT targets resolve from `page`, not `canvas`. Both
 * panels share the route, so `beforePanel` opens ONE panel's popover at a time
 * (clicks THIS panel's trigger); `forEachScenarioPanel`'s per-panel fresh
 * `page.goto` guarantees isolation. The TRIGGER scenario has no `beforePanel`.
 *
 * SCOPE — applicable drivers: D1 (trigger button + glyph; frame/inner/heading/
 * content/footer body parts), D3 (pixel: the icon-only trigger + the painted
 * content frame), D6 (AX: the `role="dialog"` subtree — name from the heading +
 * the Heading/Content/Footer + RAC dismiss sentinels), D7 (contrast: the help copy
 * on `layer-2`, both themes). NOT registered here:
 *   - D2 (motion): the popover enter/exit fade is the same `menuPopover`/Popover
 *     surface concern tracked with the shared headless-overlay realignment.
 *   - D4/D5/D8: open-on-press (`DialogTrigger`), Escape/interact-outside close,
 *     focus containment/restoration, and the trigger's hit-area are interaction
 *     behaviours (and the quiet ActionButton's own target size is certified in
 *     CP9.2), not this unit's paint.
 */

const contentText = "Your admin must grant permission before this action is available.";

/** The closed icon-only quiet trigger in THIS panel. The accessible name varies
 *  with `variant` (help vs info), so address it structurally — the demo renders a
 *  single button in the canvas. */
const triggerButton: TargetResolver = ({ canvas }) => canvas.getByRole("button").first();
/** The trigger's variant glyph `<svg>`. */
const triggerIcon: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button").first().locator("svg").first();

/** The opened `role="dialog"` popover surface. With the canonical default-slot
 *  Heading the dialog is UNNAMED in both stacks (dangling `aria-labelledby`), and
 *  `beforePanel` opens exactly one panel's popover, so address it by bare role. */
const contentDialog: TargetResolver = ({ page }) => page.getByRole("dialog");
/** The Heading — a headless `<Heading>` renders at the RAC default level (`<h3>`)
 *  in both fixtures, so address it by bare role. */
const contentHeading: TargetResolver = ({ page }) => page.getByRole("dialog").getByRole("heading");
/** The frame (`wrappingDiv`): the Heading's grandparent (Heading -> inner -> frame,
 *  identical nesting in both stacks; Providers are context, not DOM). */
const contentFrame: TargetResolver = ({ page }) =>
  page.getByRole("dialog").getByRole("heading").locator("xpath=../..");
/** The inner body div (`dialogInner` merge): the Heading's parent. */
const contentInner: TargetResolver = ({ page }) =>
  page.getByRole("dialog").getByRole("heading").locator("xpath=..");
/** The Content copy `<div>`. */
const contentBody: TargetResolver = ({ page }) =>
  page.getByRole("dialog").getByText(contentText, { exact: true });
/** The `<footer>` (marginTop 16, body-sm) — a stable element in both stacks. */
const contentFooter: TargetResolver = ({ page }) => page.getByRole("dialog").locator("footer");

/** Click this panel's trigger to open its (and only its) popover. */
const openHelp = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
};

/** Best-effort close before the next panel (isolation is the per-panel `goto`);
 *  NEVER asserts — close-on-Escape is a DialogTrigger contract, not this unit's. */
const closeHelp = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

/** Scenario 1 — the closed icon-only quiet trigger across variant × size. The
 *  default allowlist covers the button color/bg/border/radius/padding/size/
 *  transform/transition; the variant glyph is a named part.
 *
 *  D3 SUB-PIXEL WAIVER (help-xs, info-xs, info-s) — proven not a port divergence.
 *  The trigger is the CP9.2-certified quiet `ActionButton` carrying a workflow
 *  icon whose SVG path data is byte-identical to the vendored upstream asset
 *  (`S2_Icon_{Help,Info}Circle_20_N.svg`). A geometry probe confirmed the port's
 *  button box, padding (1px,0,1px,0), border (0), min-width, box-sizing, the
 *  rendered icon size (17.14px @S / 15.70px @XS), AND the icon's offset within
 *  the button are all byte-identical between the React and Solid panels. The only
 *  difference is that the Solid comparison panel is laid out at a half-pixel
 *  viewport x (e.g. 651.5 vs React's integer 409), so the two byte-identical
 *  glyphs rasterize at different sub-pixel phases (.42 vs .92). `help-s` survives
 *  that phase mismatch byte-exact (kept under strict zero-tolerance below), and
 *  ActionMenu's identical icon-only quiet trigger (CP9.33, `More` glyph, S/M/L)
 *  needed no waiver — only the phase-sensitive `?`/`i` edges at these sizes drift,
 *  ≤7/7056 px (0.1%) in a ≤2px sliver at the glyph edge, theme-independent and
 *  visually invisible. Closing it to byte-exact needs the comparison harness to
 *  snap both panels to the same sub-pixel x-phase (a shared measurement-layer
 *  concern, not this component) — tracked in recertification.md D3 sub-pixel
 *  burn-down. The waiver is scoped to the three observed cases so any regression
 *  on `help-s` (or beyond ~10px on the others) still fails. */
const glyphSubpixel = { maxMismatchRatio: 0.0015, maxDimensionDelta: 0, pixelThreshold: 0 };
const glyphSubpixelReason =
  "contextualhelp-trigger-glyph-subpixel: byte-identical workflow-icon glyph (proven-identical ActionButton geometry) drifts ≤7/7056px at the edge under the comparison panels' sub-pixel x-phase mismatch";
const triggerScenario: DriverScenario = {
  slug: "contextualhelp",
  title: "ContextualHelp trigger",
  target: triggerButton,
  pixelTarget: triggerButton,
  states: ["default"],
  cases: [
    { id: "help-xs", params: { variant: "help", size: "XS" } },
    { id: "help-s", params: { variant: "help", size: "S" } },
    { id: "info-xs", params: { variant: "info", size: "XS" } },
    { id: "info-s", params: { variant: "info", size: "S" } },
  ],
  parts: {
    icon: triggerIcon,
  },
  pixel: {
    waivers: [
      {
        caseId: "help-xs",
        state: "*",
        theme: "*",
        threshold: glyphSubpixel,
        reason: glyphSubpixelReason,
      },
      {
        caseId: "info-xs",
        state: "*",
        theme: "*",
        threshold: glyphSubpixel,
        reason: glyphSubpixelReason,
      },
      {
        caseId: "info-s",
        state: "*",
        theme: "*",
        threshold: glyphSubpixel,
        reason: glyphSubpixelReason,
      },
    ],
  },
};

/** Scenario 2 — the opened contextual-help body. The popover content (heading/
 *  copy/footer) is invariant across variant/size (those only affect the trigger),
 *  so one case is the whole content surface × theme. */
const contentScenario: DriverScenario = {
  slug: "contextualhelp",
  title: "ContextualHelp content",
  beforePanel: openHelp,
  afterPanel: closeHelp,
  target: contentFrame,
  pixelTarget: contentFrame,
  states: ["default"],
  settleMs: 500,
  cases: [{ id: "default", params: { variant: "help", size: "XS" } }],
  parts: {
    inner: contentInner,
    heading: contentHeading,
    content: contentBody,
    footer: contentFooter,
  },
  // Default allowlist covers color/bg/border/radius/font/padding/margin/width/
  // height/display. Add the content box constraints the frame/inner drive beyond
  // it: `min-width` (the 268 floor), `box-sizing` (border-box), the `overflow`
  // pair (the inner's `auto`), and `flex-direction` (the inner's `column`).
  styleProps: {
    add: ["min-width", "box-sizing", "overflow-x", "overflow-y", "flex-direction"],
  },
  // D6: the `role="dialog"` subtree — accessible name (the Heading), the
  // Heading/Content/Footer content, and the RAC dismiss sentinels. Content is
  // variant/size-independent, so the first case is the whole subtree.
  ax: {
    roots: {
      dialog: contentDialog,
    },
  },
  // D7: the help copy on the `layer-2` popover surface, both themes.
  contrast: {
    cases: ["default"],
    root: contentDialog,
  },
};

registerStateMatrixDriver(triggerScenario);
registerPixelDriver(triggerScenario);

registerStateMatrixDriver(contentScenario);
registerPixelDriver(contentScenario);
registerAxTreeDriver(contentScenario);
registerContrastDriver(contentScenario);
