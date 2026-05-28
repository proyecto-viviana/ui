import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "./comparison-page";
import { pinComparisonTheme } from "./visual-diff";

test.describe("component page layout", () => {
  test("keeps rendered framework examples visible near the top of tall previews", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto("/components/searchfield/");
    await waitForComparisonRouteReady(page);

    const section = page.locator("#example").filter({
      has: page.locator("h2", { hasText: "Example" }),
    });
    const metrics = await section.locator(".s2-framework-panel").evaluateAll((panels) =>
      panels.map((panel) => {
        const fixture = panel.querySelector<HTMLElement>("[data-comparison-control-root]");

        if (fixture == null) {
          throw new Error("Expected framework panel to contain a rendered fixture root.");
        }

        const panelRect = panel.getBoundingClientRect();
        const fixtureRect = fixture.getBoundingClientRect();

        return {
          framework: panel.getAttribute("data-framework") ?? "unknown",
          fixtureTop: Number(fixtureRect.top.toFixed(4)),
          topOffset: Number((fixtureRect.top - panelRect.top).toFixed(4)),
          viewportHeight: window.innerHeight,
        };
      }),
    );

    expect(metrics).toHaveLength(2);

    for (const metric of metrics) {
      expect(
        metric.fixtureTop,
        `${metric.framework} fixture should be in the initial viewport`,
      ).toBeLessThan(metric.viewportHeight);
      expect(
        metric.topOffset,
        `${metric.framework} fixture should not be vertically centered below tall controls`,
      ).toBeLessThanOrEqual(160);
    }
  });
});
