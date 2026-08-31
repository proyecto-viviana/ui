import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { expect } from "@playwright/test";

/**
 * Recertification march unit (Tier 3, overlay): Toast.
 *
 * A Toast is a transient `role="alertdialog"` surface the port renders inside a
 * `role="region"` ToastRegion that portals to the document body. The demo drives
 * it through the shared `comparison:controls-change` event: each stack owns a
 * SEPARATE global toast queue (different module instances), and an `activeSide`
 * gate keeps exactly one stack's trigger surface live at a time (React renders
 * `null` when inactive; Solid keeps an empty ToastContainer + a `hidden` trigger
 * div). So `beforePanel` gates THIS panel's stack active, then clicks its variant
 * trigger — yielding exactly one toast, in exactly one stack, per iteration.
 *
 * PORT FIXES landed with this unit (faithful reverts of self-inflicted
 * divergences, grounded in @react-spectrum/s2 Toast.tsx):
 *   - the `toastBody` div was missing `role="presentation"` (upstream sets it).
 *   - the content div was missing the ARIA live-region wiring; it now carries
 *     `data-solidaria-toast-content` so the headless effect applies upstream's
 *     `role="alert"`/`aria-atomic` (the announce-on-appear surface).
 *   - the variant glyph was a hand-rolled `<span>` wrapper; upstream wraps it in
 *     `<CenterBaseline>` (the port's is byte-identical), so it now does too.
 *   - the dismiss control was a hand-rolled `HeadlessToastCloseButton` +
 *     `closeButtonStyles` carrying the 20px workflow `CloseIcon`; upstream renders
 *     `<CloseButton staticColor="white">`, whose glyph is the 12px ui-icon Cross.
 *     Reverted to the port's faithful `CloseButton` (fixes both the glyph 20->12
 *     and the button box), wiring its `onPress` to close+remove (the same pair the
 *     headless close-button delegation ran) since it doesn't carry the delegated
 *     `[data-solidaria-toast-close-button]` attribute.
 *
 * DEFERRED (inventory in ticket #11, not this paint cert): the extra
 * `toastText` wrapper + the invented `description` slot (an additive API with
 * possible downstream consumers; visually identical for the single-line demo),
 * the `<div data-solidaria-toast-title>` vs upstream `<span slot="title">` title
 * element type (paints identically; the accessible name still resolves via the
 * labelledby -> title-id effect), and the D6 announce-transcript diff (the
 * announcement mechanism is certified structurally by the `role="alert"` live
 * region appearing in the AX snapshot; the live-transcript oracle over a
 * body-portaled toast is tracked in ticket #79).
 *
 * OVERLAY PATTERN (mirrors popover/contextualhelp): the toast portals to a
 * body-level region, so targets resolve from `page`, not `canvas`. The case route
 * (`?variant=…`) is shared by both panels (both render the same variant); only
 * `activeSide` differs per panel, set by the `beforePanel` dispatch which reads
 * the variant back from the URL. `forEachScenarioPanel`'s per-panel fresh
 * `page.goto` (a full reload → fresh queue module state) guarantees isolation.
 *
 * SCOPE — applicable drivers: D1 (the toast box + the close button; the variant
 * glyph in a second scenario), D3 (pixel: the whole box, plus the glyph), D6 (AX:
 * the `role="alertdialog"` subtree — name from the title, the `role="alert"` live
 * region, the RAC dismiss button), D7 (contrast: the white copy on the variant
 * background, both themes). NOT registered here: D2 (the add/remove view
 * transition is forced-reduced in the fixture and shares the overlay-motion
 * realignment), D4/D5/D8 (open-on-press, auto-dismiss timing, focus movement, and
 * the trigger/close hit-areas are interaction behaviours — the close button's own
 * target size is certified by CloseButton/Dialog, not this unit's paint).
 */

const dismissName = "Dismiss";

const capitalize = (value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
/** The demo trigger label for a variant, e.g. `positive` -> "Show Positive Toast". */
const triggerLabel = (variant: string) => `Show ${capitalize(variant)} Toast`;

/**
 * Gate THIS panel's stack active (via the controls event) and click its variant
 * trigger so exactly one toast (in this stack) appears. The variant is read back
 * from the case route so the scenario-level hook stays case-agnostic; only
 * `activeSide` varies per panel.
 */
const openToast = async ({ page, canvas, framework }: PanelContext) => {
  const variant = new URL(page.url()).searchParams.get("variant") ?? "neutral";
  await page.evaluate(
    ({ side, v }) => {
      window.dispatchEvent(
        new CustomEvent("comparison:controls-change", {
          detail: {
            component: "toast",
            props: {
              activeSide: side,
              variant: v,
              count: 1,
              placement: "bottom",
              "aria-label": "Notifications",
            },
          },
        }),
      );
    },
    { side: framework, v: variant },
  );
  await canvas.getByRole("button", { name: triggerLabel(variant) }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
};

/** Best-effort dismiss before the next panel (isolation is the per-panel goto);
 *  NEVER asserts — dismissal is a queue behaviour, not this unit's paint. */
const closeToast = async ({ page }: PanelContext) => {
  const dismiss = page.getByRole("alertdialog").getByRole("button", { name: dismissName });
  if (await dismiss.count()) {
    await dismiss
      .first()
      .click()
      .catch(() => {});
  }
};

/** The single portaled toast box in the active stack. */
const toastBox: TargetResolver = ({ page }) => page.getByRole("alertdialog");
/** The RAC dismiss button (aria-label "Dismiss" in both stacks — same S2 intl). */
const toastCloseButton: TargetResolver = ({ page }) =>
  page.getByRole("alertdialog").getByRole("button", { name: dismissName });
/** The variant glyph — the first `<svg>` in DOM order (content precedes the close
 *  button); only present on the icon-bearing variants (neutral has none). */
const toastIcon: TargetResolver = ({ page }) =>
  page.getByRole("alertdialog").locator("svg").first();

// D3 sub-pixel waiver — same artifact as `contextualhelp-trigger-glyph-subpixel`.
// The `info` variant's InfoCircle workflow-icon glyph is byte-identical to React's
// (same S2 asset, same size/fill/color — verified: the box AX/contrast/state drivers
// and the other three variants pass at threshold 0), but the two comparison panels
// lay out at a half-pixel x-offset, so the glyph rasterizes at a different sub-pixel
// phase and one column of edge-AA pixels drifts: ≤13/26760px on the box crop,
// ≤13/7056px on the tighter glyph crop. Dimensions match exactly (maxDimensionDelta:0),
// so a real geometry/asset regression still fails. Scoped to `info` only; tracked in
// Ticket #105 owns the shared measurement-layer x-phase fix that retires this
// and the ContextualHelp waiver together.
const glyphSubpixel = { maxMismatchRatio: 0.002, maxDimensionDelta: 0, pixelThreshold: 0 };
const glyphSubpixelReason =
  "toast-info-glyph-subpixel: byte-identical InfoCircle workflow-icon glyph drifts ≤13/7056px at the edge under the comparison panels' sub-pixel x-phase mismatch (same artifact as contextualhelp-trigger-glyph-subpixel)";

/** Scenario 1 — the toast box across the four variants. Certifies the per-variant
 *  background/radius/shadow/padding/font (the default allowlist plus the box's
 *  min-height/max-width/box-sizing constraints) and the faithful close button. */
const toastScenario: DriverScenario = {
  slug: "toast",
  title: "Toast",
  beforePanel: openToast,
  afterPanel: closeToast,
  target: toastBox,
  pixelTarget: toastBox,
  states: ["default"],
  settleMs: 400,
  cases: [
    { id: "neutral", params: { variant: "neutral" } },
    { id: "positive", params: { variant: "positive" } },
    { id: "negative", params: { variant: "negative" } },
    { id: "info", params: { variant: "info" } },
  ],
  parts: {
    closeButton: toastCloseButton,
  },
  styleProps: {
    add: ["min-height", "max-width", "box-sizing"],
  },
  pixel: {
    waivers: [
      {
        caseId: "info",
        state: "*",
        theme: "*",
        threshold: glyphSubpixel,
        reason: glyphSubpixelReason,
      },
    ],
  },
  // D6: the `role="alertdialog"` subtree — the accessible name (title), the
  // `role="alert"` content live region, and the RAC dismiss button. Structure is
  // variant-independent, so the first case covers the subtree.
  ax: {
    roots: {
      toast: toastBox,
    },
  },
  // D7: the white toast copy on the variant background, both themes, every variant.
  contrast: {
    root: toastBox,
  },
};

/** Scenario 2 — the variant glyph (positive/negative/info; neutral has none). The
 *  box screenshot already covers the glyph in situ, but measuring the `<svg>`
 *  directly pins its size/fill/color so a glyph regression fails on its own. */
const toastIconScenario: DriverScenario = {
  slug: "toast",
  title: "Toast icon",
  beforePanel: openToast,
  afterPanel: closeToast,
  target: toastIcon,
  pixelTarget: toastIcon,
  states: ["default"],
  settleMs: 400,
  cases: [
    { id: "positive", params: { variant: "positive" } },
    { id: "negative", params: { variant: "negative" } },
    { id: "info", params: { variant: "info" } },
  ],
  pixel: {
    waivers: [
      {
        caseId: "info",
        state: "*",
        theme: "*",
        threshold: glyphSubpixel,
        reason: glyphSubpixelReason,
      },
    ],
  },
};

registerStateMatrixDriver(toastScenario);
registerPixelDriver(toastScenario);
registerAxTreeDriver(toastScenario);
registerContrastDriver(toastScenario);

registerStateMatrixDriver(toastIconScenario);
registerPixelDriver(toastIconScenario);
