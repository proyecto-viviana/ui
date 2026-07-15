import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 8: TimelineItem — a custom Viviana ("Silapse") social-timeline
 * event card: two `role=img` avatars flanking an icon, over a centered message
 * whose user names are emphasized runs, on a `--color-bg-200` panel. Like its
 * Tier-6 siblings it has NO upstream React Spectrum pair, so the pair-oracle
 * drivers (D1 rest matrix, D3 pixels, D2 motion) are out of scope and the route
 * is Solid-only (`frameworks: ["solid"]`).
 *
 * TimelineItem is **purely presentational** — the avatars are images, the icon
 * and message are text, and nothing is focusable or interactive. So, like the
 * static ColorSwatch (CP9.68), D5 (keyboard/focus) and D8 (target size) are out
 * of scope: there are no interactive targets to size, and asserting D8 would
 * (correctly) hard-fail the "no interactive elements" guard. Correctness is
 * certified against D7 contrast plus D6 image/AX assertions.
 *
 *   • D7 contrast (`assertAA`) — two text runs on the `--color-bg-200` card:
 *     the emphasized user names and the connecting message body. Both were red:
 *     - the names were painted `--color-accent` (#df5c9a, same both themes),
 *       which on the light `bg-200` panel renders **~1.9:1** and on the dark
 *       panel **~4.48:1** — both under the 4.5:1 small-text floor (no accent
 *       shade clears AA on `bg-200` in BOTH modes, so a colored emphasis is not
 *       viable here);
 *     - the message body was `--color-text-secondary`, the recurring **3.84:1**
 *       light failure (cf. EventCard/ProfileCard/LateralNav).
 *     FIX (matching CalendarCard CP9.73): both take the flipping `--color-text`
 *     (**7.53:1 light / 15.33:1 dark**); the names stay emphasized via their
 *     `bold` weight, not a sub-AA color.
 *   • D6 AX — asserted inline: exactly the two avatar images, each named from its
 *     user's `alt`; the event message (names + connecting phrase) is visible
 *     text; and there are no buttons or links (the card is display-only).
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded and
 * the only direction-sensitive affordances (the row `gap`, the card `padding`)
 * are symmetric.
 */
const timelineItemScenario: DriverScenario = {
  slug: "timelineitem",
  title: "TimelineItem",
  // Custom Viviana surface — no upstream React pair; single Solid card.
  frameworks: ["solid"],
  // A stable in-card element; the driver measures the whole canvas (the card).
  target: ({ canvas }) => canvas.getByRole("img", { name: "María López" }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure the emphasized names + the message body across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
};

registerContrastDriver(timelineItemScenario);

const timelineItemRoute = "/components/timelineitem/";

test.describe("D6 AX — TimelineItem", () => {
  test("exposes its avatar images and event message, with nothing interactive", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(timelineItemRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D6: exactly the two avatars, each named from its user's `alt`.
    await expect(canvas.getByRole("img")).toHaveCount(2);
    await expect(canvas.getByRole("img", { name: "María López" })).toBeVisible();
    await expect(canvas.getByRole("img", { name: "Diego Ramírez" })).toBeVisible();

    // The event message renders as visible text: the emphasized names + the
    // connecting phrase for the "follow" event.
    await expect(canvas.getByText("María López", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Diego Ramírez", { exact: true })).toBeVisible();
    await expect(canvas.getByText("ha empezado a seguir a", { exact: false })).toBeVisible();

    // The card is display-only — no interactive affordances.
    await expect(canvas.getByRole("button")).toHaveCount(0);
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });
});
