import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 opener: Chip — the first custom Viviana ("Silapse") component to be
 * certified. Unlike Tiers 1–5, a custom component has NO upstream React Spectrum
 * pair, so the pair-oracle drivers (D1 state matrix, D3 pixels, D2 motion) do
 * not apply: there is nothing to diff against. The route is Solid-only
 * (`frameworks: ["solid"]`), and correctness is certified against absolute
 * oracles instead of a pair:
 *
 *   • D7 contrast (`assertAA`) — every chip label must clear the WCAG AA 4.5:1
 *     floor in BOTH themes. This is the red→green driver: the accent variant's
 *     text was `--color-bg-400` (near-white), only 2.74:1 on the pink accent
 *     fill in light mode — a real WCAG failure. The fix repoints it to the
 *     darkest grey token (`--color-grey-900`), lifting it to 5.24:1 light /
 *     6.14:1 dark. `assertAA: true` hard-fails the driver on any sub-AA node,
 *     so it reds before the fix and greens after.
 *   • D8 target size (`assert24`) — every chip is a pressable target and must
 *     clear the WCAG 2.5.8 24px floor (minHeight 24 + 2px border ⇒ 28px box).
 *   • D5 focus/keyboard + D6 AX — asserted inline below (absolute, not paired):
 *     the four chips are keyboard-reachable in DOM order and expose the correct
 *     role + accessible name.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's labels are hard-coded English
 * with no locale-dependent formatting or direction-sensitive layout, so there is
 * nothing locale/direction-specific to certify beyond the shared Provider stack
 * already certified across Tiers 1–5.
 */
const chipScenario: DriverScenario = {
  slug: "chip",
  title: "Chip",
  // Custom Viviana surface — no upstream React pair. The route renders a single
  // Solid panel; the shared drivers walk only it and assert absolute WCAG floors.
  frameworks: ["solid"],
  target: ({ canvas }) => canvas.getByRole("button", { name: "Accent" }),
  // Chip label colors are state-independent (the style() macro carries no
  // per-gesture color), so a single default-state pass fully covers contrast.
  states: ["default"],
  cases: [{ id: "variants" }],
  // D7: measure every chip label's contrast on its fill across both themes and
  // hard-fail below AA. Root defaults to the canvas, so all four variants are
  // measured in one pass.
  contrast: {
    assertAA: true,
  },
  // D8: every chip is an interactive target; hard-fail any that falls under 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(chipScenario);
registerTargetSizeDriver(chipScenario);

const chipRoute = "/components/chip/";
const chipNames = ["Primary", "Secondary", "Accent", "Outline"] as const;

test.describe("D5/D6 keyboard + AX — Chip", () => {
  test("every chip exposes role=button with its label as the accessible name", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(chipRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );
    // D6: exactly the four chips are exposed as buttons, each with the right name,
    // and nothing else interactive leaks into the certified subtree.
    await expect(canvas.getByRole("button")).toHaveCount(chipNames.length);
    for (const name of chipNames) {
      await expect(canvas.getByRole("button", { name, exact: true })).toBeVisible();
    }
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });

  test("chips are keyboard-focusable in DOM order", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(chipRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: focus the first chip, then Tab through the rest — each pressable chip
    // is a real focus stop, reached in source order.
    const first = canvas.getByRole("button", { name: "Primary", exact: true });
    await first.focus();
    await expect(first).toBeFocused();

    for (const name of chipNames.slice(1)) {
      await page.keyboard.press("Tab");
      await expect(canvas.getByRole("button", { name, exact: true })).toBeFocused();
    }
  });
});
