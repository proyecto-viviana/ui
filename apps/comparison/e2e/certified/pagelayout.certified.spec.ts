import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 12 (final custom unit): PageLayout — a custom Viviana ("Silapse")
 * full-height page shell: a flex column at `min-height: 100vh` / `width: 100%`
 * painted in the base `--color-background` surface with the inherited
 * `--color-text` body color (an optional `withHeader` prop reserves 64px of top
 * space for a fixed header). Like its Tier-6 siblings it has NO upstream React
 * Spectrum pair, so the pair-oracle drivers (D1 rest matrix, D3 pixels, D2
 * motion) are out of scope and the route is Solid-only (`frameworks: ["solid"]`).
 *
 * PageLayout is **purely presentational** — it renders a styled `<div>` and
 * passes its children straight through; the shell has no chrome, no roles, and
 * nothing focusable. So, like the static ColorSwatch (CP9.68), TimelineItem
 * (CP9.77) and the Logo (CP9.79), D5 (keyboard/focus) and D8 (target size) are
 * out of scope: there are no interactive targets to size, and asserting D8 would
 * (correctly) hard-fail the "no interactive elements" guard. Correctness is
 * certified against D7 contrast plus a D6 renders-text / no-roles assertion.
 *
 *   • D7 contrast (`assertAA`) — the shell's own base pairing: the body text
 *     (`--color-text`) on the `--color-background` surface, the only two paint
 *     tokens PageLayout sets. Both are *flipping* tones, so the pairing clears AA
 *     with huge margins in both themes — 21.0:1 dark (#ffffff on #000000) and
 *     12.63:1 light (#1a3040 on #f2f7fa) — a clean-green cert with no source fix.
 *   • D6 AX — asserted inline: the page-content heading + paragraph render as
 *     visible text, and there are no buttons or links (the shell is display-only).
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo strings are hard-coded and the
 * shell's block/column layout rides the certified Provider's `dir`.
 */
const pageLayoutScenario: DriverScenario = {
  slug: "pagelayout",
  title: "PageLayout",
  // Custom Viviana surface — no upstream React pair; single Solid page shell.
  frameworks: ["solid"],
  // A stable in-shell text element; the contrast driver measures the whole canvas.
  target: ({ canvas }) => canvas.getByText("Panel general", { exact: true }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure the base text-on-background pairing across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
};

registerContrastDriver(pageLayoutScenario);

const pageLayoutRoute = "/components/pagelayout/";

test.describe("D6 AX — PageLayout", () => {
  test("renders the page content as visible text, with nothing interactive", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(pageLayoutRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D6: the page content rides the shell's paint and renders as visible text.
    await expect(canvas.getByText("Panel general", { exact: true })).toBeVisible();
    await expect(
      canvas.getByText("Silapse organiza tus proyectos", { exact: false }),
    ).toBeVisible();

    // The shell is display-only — no interactive affordances.
    await expect(canvas.getByRole("button")).toHaveCount(0);
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });
});
