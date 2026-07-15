import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 4: CalendarCard — a custom Viviana ("Silapse") "followed calendar"
 * card. Like Chip (CP9.70), NavHeader (CP9.71) and EventCard (CP9.72) it has NO
 * upstream React Spectrum pair, so the pair-oracle drivers (D1 rest matrix, D3
 * pixels, D2 motion) are out of scope; the route is Solid-only
 * (`frameworks: ["solid"]`) and correctness is certified against absolute oracles.
 * The card composes the already-certified Chip for its tags.
 *
 *   • D7 contrast (`assertAA`) — the red→green driver. The card is a
 *     `--color-bg-300` surface (dark-grey dark / light-blue light). Its title
 *     (`--color-primary-100`), followers connectors (`--color-text-secondary`)
 *     and primary tag chips already clear AA, but the emphasized follower NAMES
 *     were painted in `--color-accent` (a fixed pink #df5c9a in BOTH themes).
 *     Pink does not flip, so on the light-blue card the names measured only
 *     2.42:1 (5.08:1 dark) — and no pink ramp step clears the small-text 4.5:1
 *     floor on both card backgrounds (`--color-accent-500` is 4.39:1 dark, a
 *     hair under). The names keep their emphasis via `fontWeight: bold` and take
 *     the flipping `--color-text` (17.40:1 dark / 9.63:1 light); the card's pink
 *     accent moment stays on the thumbnail border, which bears no text.
 *   • D8 target size (`assert24`) — the tag chips are pressable HeadlessButtons
 *     and must clear the WCAG 2.5.8 24px floor.
 *   • D5 focus/keyboard + D6 AX — asserted inline: the card title renders as
 *     visible text (a `<span>`, not a heading), the tags expose role=button
 *     named from their text and are real focus stops, and the followers line —
 *     including the emphasized names — renders as visible text.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded with
 * no locale-dependent formatting; direction-sensitive layout rides the
 * already-certified Provider stack.
 */
const calendarCardScenario: DriverScenario = {
  slug: "calendarcard",
  title: "CalendarCard",
  // Custom Viviana surface — no upstream React pair; single Solid panel.
  frameworks: ["solid"],
  target: ({ canvas }) => canvas.getByRole("button", { name: "Música" }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure every card text run across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: the tag chips are the interactive targets; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(calendarCardScenario);
registerTargetSizeDriver(calendarCardScenario);

const calendarCardRoute = "/components/calendarcard/";

test.describe("D5/D6 keyboard + AX — CalendarCard", () => {
  test("exposes the title, named tag chips, and the followers line", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(calendarCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );
    // D6: the card title renders as visible text; the two tags are pressable
    // buttons named from their text; the followers line + emphasized names read
    // as visible text.
    await expect(canvas.getByText("Conciertos en el Parque", { exact: true })).toBeVisible();
    await expect(canvas.getByRole("button")).toHaveCount(2);
    await expect(canvas.getByRole("button", { name: "Música" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Comunidad" })).toBeVisible();
    await expect(canvas.getByText("María López", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Ana Ruiz", { exact: true })).toBeVisible();
    // The card is presentational text + pressable chips — no links.
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });

  test("the tag chips are keyboard-focusable", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(calendarCardRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: a tag chip is a real focus stop.
    const chip = canvas.getByRole("button", { name: "Música" });
    await chip.focus();
    await expect(chip).toBeFocused();
  });
});
