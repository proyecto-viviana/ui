import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 5: ProfileCard — a custom Viviana ("Silapse") profile card in the
 * S2 UserCard shape (avatar + name/bio + follower/following stats + a footer
 * action). Like Chip (CP9.70), NavHeader (CP9.71), EventCard (CP9.72) and
 * CalendarCard (CP9.73) it has NO upstream React Spectrum pair, so the
 * pair-oracle drivers (D1 rest matrix, D3 pixels, D2 motion) are out of scope;
 * the route is Solid-only (`frameworks: ["solid"]`) and correctness is certified
 * against absolute oracles. The footer action renders the already-certified Chip.
 *
 *   • D7 contrast (`assertAA`) — the red→green driver. The card is a
 *     `--color-bg-200` surface (dark-grey dark / light-blue light). Its name and
 *     bold stat values (`--color-primary-100`) already clear AA, but the bio and
 *     the stat connector words ("seguidores" / "siguiendo") were painted in
 *     `--color-text-secondary`, which measured only 3.84:1 on the light-blue card
 *     (5.86:1 dark) — the identical text-secondary-on-`bg-200` failure EventCard
 *     hit. They take the flipping `--color-text` (15.33:1 dark / 7.53:1 light) and
 *     stay visually secondary to the `heading-sm` name through their smaller
 *     `ui-sm` size, not a sub-AA color.
 *   • D8 target size (`assert24`) — the "Seguir" footer Chip is a pressable
 *     HeadlessButton and must clear the WCAG 2.5.8 24px floor.
 *   • D5 focus/keyboard + D6 AX — asserted inline: the name is a level-3 heading,
 *     the footer action exposes role=button with a name from its content and is a
 *     real focus stop, and the bio + stats render as visible text.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded and the
 * only formatting (compact follower counts) is locale-independent; direction rides
 * the already-certified Provider stack.
 */
const profileCardScenario: DriverScenario = {
  slug: "profilecard",
  title: "ProfileCard",
  // Custom Viviana surface — no upstream React pair; single Solid panel.
  frameworks: ["solid"],
  target: ({ canvas }) => canvas.getByRole("button", { name: "Seguir" }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure every card text run across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: the footer Chip is the interactive target; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(profileCardScenario);
registerTargetSizeDriver(profileCardScenario);

const profileCardRoute = "/components/profilecard/";

test.describe("D5/D6 keyboard + AX — ProfileCard", () => {
  test("exposes the name heading, a named footer action, and the bio + stats", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(profileCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );
    // D6: the name is a level-3 heading; the footer action is a single button
    // named from its content; the bio, stat values and connectors render as
    // visible text.
    await expect(canvas.getByRole("heading", { name: "María López", level: 3 })).toBeVisible();
    await expect(canvas.getByRole("button")).toHaveCount(1);
    await expect(canvas.getByRole("button", { name: "Seguir" })).toBeVisible();
    await expect(
      canvas.getByText("Organizadora de eventos culturales en Madrid.", { exact: true }),
    ).toBeVisible();
    await expect(canvas.getByText("12.4K", { exact: true })).toBeVisible();
    await expect(canvas.getByText("320", { exact: true })).toBeVisible();
    // The card is presentational text + one pressable action — no links.
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });

  test("the footer action is keyboard-focusable", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(profileCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: the footer action is a real focus stop.
    const action = canvas.getByRole("button", { name: "Seguir" });
    await action.focus();
    await expect(action).toBeFocused();
  });
});
