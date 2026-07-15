import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 10: Logo — a custom Viviana ("Silapse") two-word wordmark: the S2
 * title ramp sizes it (`size="lg"` → `title-xl` at `black` weight) and Silapse
 * colors paint it (a primary word + an accent word; `inverted` swaps which word
 * takes the accent tone), on a `--color-bg-200` panel. Like its Tier-6 siblings
 * it has NO upstream React Spectrum pair, so the pair-oracle drivers (D1 rest
 * matrix, D3 pixels, D2 motion) are out of scope and the route is Solid-only
 * (`frameworks: ["solid"]`).
 *
 * Logo is **purely presentational** — it renders a `<span>` of two colored word
 * `<span>`s and nothing is focusable or interactive. So, like the static
 * ColorSwatch (CP9.68) and TimelineItem (CP9.77), D5 (keyboard/focus) and D8
 * (target size) are out of scope: there are no interactive targets to size, and
 * asserting D8 would (correctly) hard-fail the "no interactive elements" guard.
 * Correctness is certified against D7 contrast plus a D6 visible-text assertion.
 *
 *   • D7 contrast (`assertAA`) — two tones on the `--color-bg-200` panel. The
 *     rendered `title-xl` is under 24px but `fontWeight: black` (900) puts it on
 *     the large-text *bold* path (`fontSize ≥ 18.66 && weight ≥ 700`), so the
 *     3:1 large-text floor applies (NOT the 4.5:1 normal floor NavHeader CP9.71
 *     got with its `fontWeight: normal` wordmark).
 *     - the primary word (`--color-primary-100`) is a near-black/near-white
 *       flipping tone → passes comfortably in both themes;
 *     - the accent word was `--color-accent` (#df5c9a, the SAME non-flipping pink
 *       in both themes) → **1.89:1 light / 4.48:1 dark** on `bg-200`; the light
 *       value fails even the 3:1 large floor. No single non-flipping shade clears
 *       a near-white AND a near-black panel, so the fix repoints it to the
 *       *flipping* `--color-accent-500` (dark #d84a8f / light #8a1e4a) →
 *       **3.86:1 dark / 4.91:1 light**, clearing the large-text floor in both
 *       themes while keeping the two-tone pink/blue wordmark identity intact.
 *       (A neutral `--color-text` would clear it too but would collapse the
 *       deliberate two-tone design, so accent-500 is preferred here.)
 *   • D6 AX — asserted inline: both wordmark words render as visible text, and
 *     there are no buttons or links (the wordmark is display-only).
 *
 * D9 (i18n) and D10 (RTL) are deferred: the words are hard-coded and the only
 * direction-sensitive affordance (the inter-word `columnGap`) is symmetric.
 */
const logoScenario: DriverScenario = {
  slug: "logo",
  title: "Logo",
  // Custom Viviana surface — no upstream React pair; single Solid wordmark.
  frameworks: ["solid"],
  // A stable in-wordmark element; the contrast driver measures the whole canvas.
  target: ({ canvas }) => canvas.getByText("Proyecto", { exact: true }),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure both wordmark tones across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
};

registerContrastDriver(logoScenario);

const logoRoute = "/components/logo/";

test.describe("D6 AX — Logo", () => {
  test("exposes both wordmark words as visible text, with nothing interactive", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(logoRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D6: both words render as visible text (the primary word + the accent word).
    await expect(canvas.getByText("Proyecto", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Viviana", { exact: true })).toBeVisible();

    // The wordmark is display-only — no interactive affordances.
    await expect(canvas.getByRole("button")).toHaveCount(0);
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });
});
