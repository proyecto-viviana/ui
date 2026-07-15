import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 6: ProjectCard — a custom Viviana ("Silapse") square logo/preview
 * tile with a caption. Like Chip (CP9.70), NavHeader (CP9.71), EventCard (CP9.72),
 * CalendarCard (CP9.73) and ProfileCard (CP9.74) it has NO upstream React Spectrum
 * pair, so the pair-oracle drivers (D1 rest matrix, D3 pixels, D2 motion) are out of
 * scope; the route is Solid-only (`frameworks: ["solid"]`) and correctness is
 * certified against absolute oracles.
 *
 *   • D7 contrast (`assertAA`) — the card is a `--color-bg-200` surface (dark-grey
 *     dark / light-blue light) and its only text run is the caption, painted in
 *     `--color-primary-200` (11.26:1 dark / 8.78:1 light).
 *
 *     RED→GREEN: the caption's `color` was silently dropped before this cert. In
 *     the S2 `style()` macro the `font` shorthand emits a DEFAULT text color
 *     (`--s2-text`, `light-dark(#292929,#dbdbdb)`); the caption listed its own
 *     `color: [var(--color-primary-200)]` BEFORE the responsive `font` object, so
 *     the font preset's default color won on source order and the caption actually
 *     rendered `#292929`/`#dbdbdb`. That default happens to clear AA too (8.04:1
 *     light / 11.07:1 dark), so it was an invisible design-color regression, not a
 *     floor break — but the caption never showed its intended Silapse color. FIX:
 *     order `color` AFTER `font` in the style object (matching every ProfileCard
 *     style), restoring `--color-primary-200`. Calibration confirms the driver
 *     really measures this run: swapping the caption to `--color-text-secondary`
 *     (now that the color applies) drives D7 light red at 3.84:1.
 *   • D8 target size (`assert24`) — an `href` turns the WHOLE card into a native
 *     `<a>` link; that link is the interactive target and must clear the WCAG
 *     2.5.8 24px floor. This is the same ProfileCard landmine: the base `<div>`
 *     variant has zero interactive elements and would hard-fail the D8 driver, so
 *     the demo renders the link variant.
 *   • D5 focus/keyboard + D6 AX — asserted inline: the card exposes exactly one
 *     link (no buttons), its accessible name contains the visible caption, the
 *     caption renders as visible text, and the link is a real focus stop.
 *
 * OBSERVED (not a floor violation, so left as-is): the link wraps `<img alt={name}>`
 * + `<span>{name}</span>`, so its accessible name is the project name doubled
 * ("Proyecto Aurora Proyecto Aurora"). WCAG 2.5.3 (Label in Name) is still satisfied
 * — the visible caption is contained in the accessible name — so this is a
 * redundancy smell, not a floor failure; the D6 assertion matches the name by
 * substring rather than forcing an API change to the shipped component.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded and there
 * is no locale/direction-sensitive content; direction rides the certified Provider.
 */
const projectCardScenario: DriverScenario = {
  slug: "projectcard",
  title: "ProjectCard",
  // Custom Viviana surface — no upstream React pair; single Solid panel.
  frameworks: ["solid"],
  // The whole card is a link; substring name match tolerates the doubled name.
  target: ({ canvas }) => canvas.getByRole("link", { name: "Proyecto Aurora" }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure the caption run across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: the card link is the interactive target; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(projectCardScenario);
registerTargetSizeDriver(projectCardScenario);

const projectCardRoute = "/components/projectcard/";

test.describe("D5/D6 keyboard + AX — ProjectCard", () => {
  test("exposes a single named link and the caption text", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(projectCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );
    // D6: the card is exactly one link (no buttons), named from its content, and
    // the caption renders as visible text.
    await expect(canvas.getByRole("link")).toHaveCount(1);
    await expect(canvas.getByRole("button")).toHaveCount(0);
    const link = canvas.getByRole("link", { name: "Proyecto Aurora" });
    await expect(link).toBeVisible();
    await expect(canvas.getByText("Proyecto Aurora", { exact: true })).toBeVisible();
  });

  test("the card link is keyboard-focusable", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(projectCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: the card link is a real focus stop.
    const link = canvas.getByRole("link", { name: "Proyecto Aurora" });
    await link.focus();
    await expect(link).toBeFocused();
  });
});
