import { expect, test } from "@playwright/test";
import { frameworkCanvas, styledSection } from "./comparison-page";
import { defaultVisualCases } from "./default-state-cases";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

test.describe("comparison default visual states", () => {
  for (const item of defaultVisualCases) {
    test(`${item.title} default state matches current React Spectrum`, async ({ page }) => {
      await pinComparisonTheme(page, "dark");
      await page.goto(`/components/${item.slug}/`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("astro-island")).toHaveCount(0);

      const section = await styledSection(page);
      const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
      const solidCanvas = await frameworkCanvas(section, "Solidaria stack");

      await clearPointer(page);
      await expectScreenshotPair(
        page,
        reactCanvas,
        solidCanvas,
        `${item.title} default state`,
        item.threshold,
      );
    });
  }
});
