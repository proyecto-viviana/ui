import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 2: NavHeader — a custom Viviana ("Silapse") nav bar. Like Chip
 * (CP9.70) it has NO upstream React Spectrum pair, so the pair-oracle drivers
 * (D1 rest matrix, D3 pixels, D2 motion) are out of scope; the route is
 * Solid-only (`frameworks: ["solid"]`) and correctness is certified against
 * absolute oracles. NavHeader adds the FIRST landmark dimension to Tier 6:
 *
 *   • D7 contrast (`assertAA`) — the red→green driver. The wordmark sits on the
 *     `--color-bg-400` bar and painted `--color-primary-700`, a NON-flipping
 *     brand fill that moves the same direction as the bar (light blue in light
 *     mode, dark blue in dark mode). It read only 2.10:1 light / 2.92:1 dark.
 *     The rendered `title-xl` measures under 24px, so the driver scores it as
 *     normal text (4.5:1 floor, not the 3:1 large-text exception). The fix
 *     repoints it to the correctly-flipping `--color-primary-500` (dark-on-light
 *     / light-on-dark), the smallest ramp step that also clears 4.5:1 — lifting
 *     it to 5.37:1 light / 7.00:1 dark. `assertAA: true` hard-fails any sub-AA
 *     node, so it reds before the fix and greens after in both themes.
 *   • D8 target size (`assert24`) — the menu button is a pressable target and
 *     must clear the WCAG 2.5.8 24px floor (the demo gives it a 32px icon box).
 *   • D5 focus/keyboard + D6 AX — asserted inline: the bar is a `nav` landmark,
 *     the menu button exposes role=button with its aria-label as the accessible
 *     name and is a real focus stop, and the wordmark renders as visible text.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded with
 * no locale-dependent formatting; direction-sensitive layout (logo lead / menu
 * trail) rides the already-certified Provider stack.
 */
const navHeaderScenario: DriverScenario = {
  slug: "navheader",
  title: "NavHeader",
  // Custom Viviana surface — no upstream React pair; single Solid panel.
  frameworks: ["solid"],
  target: ({ canvas }) => canvas.getByRole("button", { name: "Open menu" }),
  // The only rendered text run (the wordmark) is state-independent, so a single
  // default-state pass fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure the wordmark contrast on the bar across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: the menu button is the interactive target; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(navHeaderScenario);
registerTargetSizeDriver(navHeaderScenario);

const navHeaderRoute = "/components/navheader/";

test.describe("D5/D6 keyboard + AX — NavHeader", () => {
  test("exposes a nav landmark, a named menu button, and the wordmark text", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(navHeaderRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );
    // D6: exactly one nav landmark, one menu button named from its aria-label,
    // and the wordmark rendered as visible text.
    await expect(canvas.getByRole("navigation")).toHaveCount(1);
    await expect(canvas.getByRole("button")).toHaveCount(1);
    await expect(canvas.getByRole("button", { name: "Open menu", exact: true })).toBeVisible();
    await expect(canvas.getByText("Silapse", { exact: true })).toBeVisible();
    // The wordmark is decorative-plain text, not a heading or a link.
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });

  test("the menu button is keyboard-focusable", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(navHeaderRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: the menu button is a real focus stop.
    const menu = canvas.getByRole("button", { name: "Open menu", exact: true });
    await menu.focus();
    await expect(menu).toBeFocused();
  });
});
