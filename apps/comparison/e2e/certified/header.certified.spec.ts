import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 11: Header — a custom Viviana ("Silapse") top app-bar: a centered
 * max-width row with a logo group (the certified Logo wordmark) on the start edge
 * and a `<nav>` slot for actions on the end edge, painted on the `--color-header-bg`
 * bar with a `--color-border` bottom rule. Like its Tier-6 siblings it has NO
 * upstream React Spectrum pair, so the pair-oracle drivers (D1 rest matrix, D3
 * pixels, D2 motion) are out of scope and the route is Solid-only
 * (`frameworks: ["solid"]`).
 *
 * Header is a **composition cert**: its own chrome (the bar + border + the two
 * flex containers) carries no text, so every measured text run comes from two
 * already-certified leaves it embeds — so it is a clean-green composition rather
 * than a fresh red→green:
 *   • the Logo wordmark (CP9.79) — whose primary word (`--color-primary-100`) and
 *     flipping accent word (`--color-accent-500`) both clear the large-text floor
 *     on the lighter `--color-header-bg` by even wider margins than on the
 *     `--color-bg-200` panel they were certified on;
 *   • solid-fill Chips (CP9.70) as the nav actions — whose labels sit on the chips'
 *     own opaque fills (`--color-primary-700` / `--color-accent`), so their contrast
 *     is exactly what the Chip cert already pinned, independent of the header bar.
 *
 *   • D7 contrast (`assertAA`) — the Logo tones on the header bar + both chip labels
 *     on their fills; all pre-certified, asserted green in both themes.
 *   • D8 target size (`assert24`) — the nav Chips are `HeadlessButton`s with
 *     `minHeight: 24`, clearing the WCAG 2.5.8 24px floor.
 *   • D5 focus/keyboard + D6 AX — asserted inline: the `<nav>` navigation landmark,
 *     the two wordmark words as visible text, exactly the two chip buttons (named
 *     from their text) as keyboard focus stops, and no stray links.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the strings are hard-coded and the bar's
 * `space-between` layout rides the certified Provider's `dir`.
 */
const headerScenario: DriverScenario = {
  slug: "header",
  title: "Header",
  // Custom Viviana surface — no upstream React pair; single Solid app-bar.
  frameworks: ["solid"],
  // The first nav action; the drivers measure the whole canvas (the bar).
  target: ({ canvas }) => canvas.getByRole("button").first(),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast and target size.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: the Logo tones on the header bar + both chip labels on their fills; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: the nav chips are the interactive targets; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(headerScenario);
registerTargetSizeDriver(headerScenario);

const headerRoute = "/components/header/";

test.describe("D5/D6 keyboard + AX — Header", () => {
  test("exposes the nav landmark, the wordmark and the nav action chips", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(headerRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D6: the Header exposes a navigation landmark (the `<nav>` action slot).
    await expect(canvas.getByRole("navigation")).toHaveCount(1);

    // Both wordmark words render as visible text (the certified two-tone Logo).
    await expect(canvas.getByText("Proyecto", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Viviana", { exact: true })).toBeVisible();

    // D6: exactly the two nav-action chips, each named from its text.
    await expect(canvas.getByRole("button")).toHaveCount(2);
    await expect(canvas.getByRole("button", { name: "Docs" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Playground" })).toBeVisible();

    // The wordmark is display-only — the only controls are the two nav chips.
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });

  test("the nav action chips are keyboard-focusable in DOM order", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(headerRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: each nav chip is a real focus stop.
    const docs = canvas.getByRole("button", { name: "Docs" });
    const playground = canvas.getByRole("button", { name: "Playground" });
    await docs.focus();
    await expect(docs).toBeFocused();
    await playground.focus();
    await expect(playground).toBeFocused();
  });
});
