import { expect } from "@playwright/test";
import { registerAxTreeDriver } from "../drivers/ax";
import type { DriverScenario, PanelContext, TargetResolver } from "../drivers/scenario";
import { registerPixelDriver } from "../drivers/pixel";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 3, overlay): AlertDialog.
 *
 * AlertDialog is a specialization of Dialog (`role="alertdialog"`) that adds
 * three surfaces the Dialog pilot never exercises, all certified here on the
 * SAME `dialog` route (the demo renders the real S2/port `AlertDialog` when
 * `role=alertdialog`, driven by the added `variant`/`*ActionLabel` params):
 *
 *   1. The VARIANT ICON — for `variant: 'error'` upstream renders
 *      `S2_Icon_AlertTriangle` and for `'warning'` `S2_Icon_AlertDiamond`, each
 *      tinted through `IconContext` with `--iconPrimary` (`error → negative`,
 *      `warning → notice`) and spaced with `marginEnd: 8`. The icon sits inside
 *      a `CenterBaseline` flex row alongside the title.
 *   2. The alertdialog ROLE + labeled-icon AX subtree — the icon carries a
 *      localized `aria-label` (`dialog.alert` → "Alert"), so it surfaces as
 *      `img "Alert"` and folds into the heading's (and thus the alertdialog's)
 *      accessible name.
 *
 * This unit is a genuine red→green march: it caught four faithful-port bugs in
 * `packages/solid-spectrum/src/dialog/AlertDialog.tsx` (fixed in the same
 * commit) — the error/warning glyphs were SWAPPED, the icon had no
 * `--iconPrimary` tint, the heading used an invented `inline-flex + gap` layout
 * instead of `CenterBaseline + marginEnd`, and the icon carried no
 * `aria-label`. It also required adding the `dialog.alert` string to the port
 * intl (`en-US`/`es-ES`), which upstream `@react-spectrum/s2` ships but the
 * port was missing.
 *
 * Non-icon variants (confirmation/information/destructive render no icon) are
 * covered by `confirmation` in the AX scenario; the plain dialog SURFACE
 * (modal box, backdrop, close/focus/motion contracts) is owned by the Dialog
 * pilot + Modal unit and is not re-asserted here. The primary-button VARIANT
 * mapping (confirmation→accent, destructive→negative, else→primary) is faithful
 * in the port and Button itself is Tier-1 certified, so it is not re-diffed.
 *
 * OVERLAY PATTERN (mirrors dialog/modal): the alertdialog portals to a
 * page-level container, so targets resolve from `page`, not `canvas`.
 * `forEachScenarioPanel` does a fresh `page.goto` per panel, so `beforePanel`
 * opens ONE panel's alertdialog at a time via its `Open Dialog` trigger.
 */

/** The open alertdialog surface (only one is ever mounted per panel goto). */
const alertDialog: TargetResolver = ({ page }) => page.getByRole("alertdialog");

/** The `Heading slot="title"` — the `CenterBaseline` row holding the variant
 *  icon + title. Both stacks paint the icon glyph, tint, and spacing here. */
const alertHeading: TargetResolver = ({ page }) =>
  page.getByRole("alertdialog").getByRole("heading").first();

/** The variant icon `<svg>` inside the heading (present for error/warning). */
const alertIcon: TargetResolver = ({ page }) =>
  page.getByRole("alertdialog").getByRole("heading").locator("svg").first();

/** Click this panel's `Open Dialog` trigger to open its (and only its) alertdialog. */
const openAlert = async ({ canvas, page }: PanelContext) => {
  await canvas.getByRole("button", { name: "Open Dialog" }).first().click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
};

/** Best-effort close before the next panel; isolation is guaranteed by the
 *  fresh per-panel `page.goto`. Never asserts (dismissal is a DialogTrigger
 *  D4 contract owned by the Dialog pilot). */
const closeAlert = async ({ page }: PanelContext) => {
  await page.keyboard.press("Escape");
};

/**
 * D1 + D3 — the variant icon + heading across the two icon variants
 * (`error`, `warning`). D1 asserts the heading's layout (`display` — `block`
 * from the title Heading, NOT the port's old `inline-flex`) and, via the `icon`
 * part, the tint (`--iconPrimary`, `fill`) and spacing (`margin-right: 8px`
 * from `marginEnd`). D3 pixel-proves the painted [icon][title] row is
 * byte-identical, which is the decisive catch for the glyph SWAP and the tint.
 * A heading has no gesture states, so the variant × theme matrix is the whole
 * surface; settle past the enter transition before measuring.
 */
const alertHeadingScenario: DriverScenario = {
  slug: "dialog",
  title: "AlertDialog heading + variant icon",
  beforePanel: openAlert,
  afterPanel: closeAlert,
  target: alertHeading,
  pixelTarget: alertHeading,
  states: ["default"],
  settleMs: 500,
  cases: [
    { id: "variant-error", params: { role: "alertdialog", variant: "error" } },
    { id: "variant-warning", params: { role: "alertdialog", variant: "warning" } },
  ],
  parts: {
    icon: alertIcon,
  },
  // The variant icon's tint is a CSS custom property (`--iconPrimary`) that
  // drives `fill`; both are outside the default allowlist, so add them (plus
  // they read as "" on the heading/title where they aren't set — identical in
  // both stacks). `margin-right` (the LTR resolution of `marginEnd: 8`) is
  // already in the default allowlist.
  styleProps: {
    add: ["--iconPrimary", "fill"],
  },
};

/**
 * D6 — the alertdialog AX subtree. `error` proves the labeled variant icon
 * (`img "Alert"`) is present and folds into the heading's / alertdialog's
 * accessible name ("Alert Review Changes"); `confirmation` proves the no-icon
 * path is identical (name "Review Changes", no icon node). The subtree also
 * captures the `alertdialog` role itself and the Cancel/Save action buttons.
 * AlertDialog is never dismissible, so there is NO CloseButton — the Dialog
 * pilot's `createUIIcon` Cross divergence does not apply here and no
 * `knownDivergences` are needed.
 */
const alertAxScenario: DriverScenario = {
  slug: "dialog",
  title: "AlertDialog AX tree",
  beforePanel: openAlert,
  afterPanel: closeAlert,
  target: alertDialog,
  settleMs: 500,
  cases: [
    { id: "variant-error", params: { role: "alertdialog", variant: "error" } },
    { id: "variant-confirmation", params: { role: "alertdialog", variant: "confirmation" } },
  ],
  ax: {
    roots: {
      alertdialog: alertDialog,
    },
  },
};

registerStateMatrixDriver(alertHeadingScenario);
registerPixelDriver(alertHeadingScenario);
registerAxTreeDriver(alertAxScenario);
