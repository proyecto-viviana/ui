import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "../comparison-page";
import { registerContrastDriver } from "../drivers/contrast";
import type { DriverScenario } from "../drivers/scenario";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { pinComparisonTheme } from "../visual-diff";

/**
 * Tier-6 unit 9: Conversation — a custom Viviana ("Silapse") chat surface: a
 * ConversationPreview list row (a pressable `HeadlessButton` with an avatar,
 * name, last-message, timestamp and unread badge) over a thread of message
 * bubbles (a `user` accent-filled variant + an `other` neutral `bg-300`
 * variant). Like its Tier-6 siblings it has NO upstream React Spectrum pair, so
 * the pair-oracle drivers (D1 rest matrix, D3 pixels, D2 motion) are out of
 * scope and the route is Solid-only (`frameworks: ["solid"]`).
 *
 *   • D7 contrast (`assertAA`) — many text runs across three backgrounds: the
 *     preview (transparent, on the `bg-200` panel), the neutral bubble (`bg-300`)
 *     and the accent bubble (`--color-accent`). Several were red, in two families:
 *     - MUTED text on the light panels: the preview timestamp + neutral-bubble
 *       timestamp (`--color-text-muted`, ~1.7–2.8:1) and the preview message
 *       (`--color-text-secondary`, 3.84:1 light) → the flipping `--color-text`;
 *     - LIGHT text on the non-flipping pink `--color-accent` fill (the Chip
 *       CP9.70 pattern): the unread badge number, the user-bubble body and its
 *       timestamp (`--color-bg-400` / `--color-bg-300`, ~2.4–2.7:1 light) →
 *       `--color-grey-900` (5.2–6.1:1), the darkest existing token.
 *   • D8 target size (`assert24`) — the ConversationPreview is a `HeadlessButton`,
 *     the one interactive target; as a padded avatar+text row it clears the WCAG
 *     2.5.8 24px floor comfortably.
 *   • D5 focus/keyboard + D6 AX — asserted inline: the surface exposes exactly one
 *     button (the preview row), named from its content; the avatar image, the
 *     preview fields, the unread count and both bubble messages render as visible
 *     text; and the preview button is a real focus stop.
 *
 * D9 (i18n) and D10 (RTL) are deferred: the demo's strings are hard-coded and the
 * only direction-sensitive affordances (the row gaps, the bubble alignment) ride
 * the certified Provider's `dir`.
 */
const conversationScenario: DriverScenario = {
  slug: "conversation",
  title: "Conversation",
  // Custom Viviana surface — no upstream React pair; single Solid chat panel.
  frameworks: ["solid"],
  // The one interactive target; the drivers measure the whole canvas (the panel).
  target: ({ canvas }) => canvas.getByRole("button").first(),
  // Every rendered text run is state-independent, so a single default-state pass
  // fully covers contrast and target size.
  states: ["default"],
  cases: [{ id: "default" }],
  // D7: measure the preview runs, the unread badge and both bubble variants
  // (body + timestamp) across both themes; hard-fail AA.
  contrast: {
    assertAA: true,
  },
  // D8: the pressable preview row is the interactive target; hard-fail below 24px.
  targetSize: {
    assert24: true,
  },
};

registerContrastDriver(conversationScenario);
registerTargetSizeDriver(conversationScenario);

const conversationRoute = "/components/conversation/";

test.describe("D5/D6 keyboard + AX — Conversation", () => {
  test("exposes the pressable preview row, avatar and thread messages", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(conversationRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D6: exactly one button — the ConversationPreview row — plus the avatar image.
    await expect(canvas.getByRole("button")).toHaveCount(1);
    await expect(canvas.getByRole("img", { name: "Ana Torres" })).toBeVisible();

    // The preview fields render as visible text.
    await expect(canvas.getByText("Ana Torres", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Te espero en la entrada", { exact: true })).toBeVisible();
    await expect(canvas.getByText("12:45", { exact: true })).toBeVisible();
    await expect(canvas.getByText("3", { exact: true })).toBeVisible();

    // Both thread bubbles render their message text.
    await expect(canvas.getByText("¿Vienes al evento del sábado?", { exact: true })).toBeVisible();
    await expect(canvas.getByText("¡Sí, allí estaré!", { exact: true })).toBeVisible();

    // The bubbles are non-interactive markup — the only control is the preview.
    await expect(canvas.getByRole("link")).toHaveCount(0);
  });

  test("the preview row is keyboard-focusable", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(conversationRoute);
    await waitForComparisonRouteReady(page, ["solid"]);

    const canvas = page.locator(
      '.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas',
    );

    // D5: the preview row is a real focus stop.
    const preview = canvas.getByRole("button").first();
    await preview.focus();
    await expect(preview).toBeFocused();
  });
});
