import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 3: EventCard — a custom Viviana ("Silapse") event surface. Like
 * Chip (CP9.70) and NavHeader (CP9.71) it has NO upstream React Spectrum pair,
 * so the pair-oracle drivers (D1 rest matrix, D3 pixels, D2 motion) are out of
 * scope; the route is Solid-only (`frameworks: ["solid"]`) and correctness is
 * certified against absolute oracles. The module exports two surfaces — the
 * `EventCard` summary card and the compact `EventListItem` row — and the demo
 * renders both.
 *
 *   • D7 contrast (`assertAA`) — the red→green driver. The card paints its
 *     title and meta-icon glyphs in `--color-accent` (a fixed pink #df5c9a in
 *     BOTH themes) over the `--color-bg-200` card, and the author/date meta in
 *     `--color-text-secondary`. `--color-accent` does not flip, so no pink ramp
 *     step clears the floor on a card that is dark-grey in dark mode AND
 *     light-blue in light mode: the accent runs measured 1.89:1 light / 4.48:1
 *     dark, and the secondary meta measured 3.84:1 light. Two different fixes,
 *     because the driver scores the runs differently: the title renders 22px /
 *     weight 800 → WCAG LARGE text (bold path, 3:1 floor), so it keeps a pink
 *     identity via the flipping `--color-accent-500` (3.87:1 dark / 4.91:1
 *     light); the meta glyphs + text are small `ui-sm` → 4.5:1 floor, and since
 *     no pink clears 4.5:1 on both card backgrounds they take the flipping
 *     `--color-text` (7.53:1 light / 15.33:1 dark). Every card run then clears
 *     its floor in both themes. The `EventListItem` runs (primary-100 title /
 *     secondary subtitle) already clear AA on the `--color-bg-300` panel.
 *   • D8 target size (`assert24`) — the `EventListItem` is a full-width
 *     pressable row and must clear the WCAG 2.5.8 24px floor.
 *   • D5 focus/keyboard + D6 AX — asserted inline: the card title is a heading,
 *     the list row exposes role=button with a name from its content and is a
 *     real focus stop, and author/date render as visible text.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded with
 * no locale-dependent formatting; direction-sensitive layout rides the
 * already-certified Provider stack.
 */
const eventCardScenario: DriverScenario = {
  slug: "eventcard",
  title: "EventCard",
  // Custom Viviana surface — no upstream React pair; single Solid panel.
  frameworks: ["solid"],
  target: ({ canvas }) => canvas.getByRole("button", { name: /Design Review/ }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure every card/row text run across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: the list row is the interactive target; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(eventCardScenario);
registerTargetSizeDriver(eventCardScenario);

const eventCardRoute = "/components/eventcard/";

test.describe("D5/D6 keyboard + AX — EventCard", () => {
  test("exposes the card title heading, a named list row, and the meta text", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(eventCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );
    // D6: the card title is a level-3 heading; the compact row is a single
    // button named from its content; author + date render as visible text.
    await expect(canvas.getByRole("heading", { name: "Weekly Team Sync", level: 3 })).toBeVisible();
    await expect(canvas.getByRole("button")).toHaveCount(1);
    await expect(canvas.getByRole("button", { name: /Design Review/ })).toBeVisible();
    await expect(canvas.getByText("María López", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Jul 15 · 10:00", { exact: true })).toBeVisible();
    // The card is presentational text + one pressable row — no links.
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });

  test("the list row is keyboard-focusable", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(eventCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: the list row is a real focus stop.
    const row = canvas.getByRole("button", { name: /Design Review/ });
    await row.focus();
    await expect(row).toBeFocused();
  });
});
