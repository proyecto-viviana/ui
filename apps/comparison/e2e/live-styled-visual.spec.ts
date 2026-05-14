import { expect, test } from "@playwright/test";
import { frameworkCanvas, styledSection } from "./comparison-page";
import {
  clearPointer,
  expectScreenshotPair,
  pinComparisonTheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

type LiveStyledVisualCase = {
  slug: string;
  title: string;
  threshold: ScreenshotDiffThreshold;
};

const liveStyledVisualCases: LiveStyledVisualCase[] = [
  {
    slug: "linkbutton",
    title: "LinkButton",
    threshold: { maxMismatchRatio: 0.05, maxDimensionDelta: 8, pixelThreshold: 64 },
  },
  {
    slug: "togglebuttongroup",
    title: "ToggleButtonGroup",
    threshold: { maxMismatchRatio: 0.18, maxDimensionDelta: 24, pixelThreshold: 64 },
  },
  {
    slug: "segmentedcontrol",
    title: "SegmentedControl",
    threshold: { maxMismatchRatio: 0.24, maxDimensionDelta: 32, pixelThreshold: 64 },
  },
  {
    slug: "selectboxgroup",
    title: "SelectBoxGroup",
    threshold: { maxMismatchRatio: 0.38, maxDimensionDelta: 96, pixelThreshold: 64 },
  },
  {
    slug: "cardview",
    title: "CardView",
    threshold: { maxMismatchRatio: 0.42, maxDimensionDelta: 128, pixelThreshold: 64 },
  },
];

test.describe("comparison newly-live styled visual coverage", () => {
  for (const item of liveStyledVisualCases) {
    test(`${item.title} default surface matches current React Spectrum`, async ({ page }) => {
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
        `${item.title} default surface`,
        item.threshold,
      );
    });
  }
});
