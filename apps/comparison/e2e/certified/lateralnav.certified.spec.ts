import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 7: LateralNav — a custom Viviana ("Silapse") sidebar navigation:
 * a `--color-bg-200` panel of sections, each an accent-railed list of anchor
 * links with a resting + `active` (current-page) state. Like its Tier-6 siblings
 * it has NO upstream React Spectrum pair, so the pair-oracle drivers (D1 rest
 * matrix, D3 pixels, D2 motion) are out of scope; the route is Solid-only
 * (`frameworks: ["solid"]`) and correctness is certified against absolute oracles.
 *
 *   • D7 contrast (`assertAA`) — three text runs on the `--color-bg-200` surface:
 *     the section titles (`heading-sm`, `--color-primary-200` → 8.78:1 light /
 *     11.26:1 dark), the ACTIVE link (`--color-primary-300` → 6.59:1 light /
 *     8.74:1 dark), and the RESTING link. The resting link is the red: it was
 *     painted `--color-text-secondary`, which on the light-blue `bg-200` panel
 *     renders **3.84:1** — the identical text-secondary-on-`bg-200` failure
 *     EventCard (CP9.72) and ProfileCard (CP9.74) hit. FIX: the resting link takes
 *     the flipping `--color-text` (**7.53:1 light / 15.33:1 dark**); it stays
 *     visually quieter than the active link, which is set apart by its underline +
 *     `medium` weight + `--color-primary-300`, not by a sub-AA color.
 *   • D8 target size (`assert24`) — the links are the interactive targets. As bare
 *     inline `<a>` on the `ui` type ramp they measured ~20px tall, under the WCAG
 *     2.5.8 24px floor. FIX: the link becomes a `minHeight: 32` flex row (a
 *     comfortable, standard sidebar hit target), clearing the floor while keeping
 *     the compact column.
 *   • D5 focus/keyboard + D6 AX — asserted inline: the nav exposes exactly its
 *     links (no buttons), the active link is named from its content, the section
 *     titles render as visible text, and the links are real focus stops in DOM
 *     order (Tab walks title-order down the list).
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded and the
 * only direction-sensitive affordances (the accent rail's `paddingStart`, the
 * panel's `borderEnd`) ride the certified Provider's `dir`.
 */
const lateralNavScenario: DriverScenario = {
  slug: "lateralnav",
  title: "LateralNav",
  // Custom Viviana surface — no upstream React pair; single Solid panel.
  frameworks: ["solid"],
  // A stable in-nav element; the drivers measure the whole canvas (the nav).
  target: ({ canvas }) => canvas.getByRole("link", { name: "Panel general" }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast and target size.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure the titles + resting/active links across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: every link is an interactive target; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(lateralNavScenario);
registerTargetSizeDriver(lateralNavScenario);

const lateralNavRoute = "/components/lateralnav/";

const LINK_LABELS = ["Panel general", "Proyectos", "Equipo", "Perfil", "Ajustes"];

test.describe("D5/D6 keyboard + AX — LateralNav", () => {
  test("exposes its links and section titles", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(lateralNavRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );
    // D6: the nav is a set of links (one per item, no buttons), each named from
    // its content, with the current-page link present.
    await expect(canvas.getByRole("link")).toHaveCount(LINK_LABELS.length);
    await expect(canvas.getByRole("button")).toHaveCount(0);
    for (const label of LINK_LABELS) {
      await expect(canvas.getByRole("link", { name: label })).toBeVisible();
    }
    // The section titles render as visible text.
    await expect(canvas.getByText("Panel", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Cuenta", { exact: true })).toBeVisible();
  });

  test("the links are keyboard-focusable in DOM order", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(lateralNavRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: the first link is a real focus stop, and Tab walks down the list in
    // title order.
    const first = canvas.getByRole("link", { name: LINK_LABELS[0] });
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(canvas.getByRole("link", { name: LINK_LABELS[1] })).toBeFocused();
  });
});
