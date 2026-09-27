import { expect, test } from "@playwright/test";
import {
  clickLocator,
  frameworkCanvas,
  styledSection,
  waitForComparisonRouteReady,
  type FrameworkName,
} from "./comparison-page";
import type { PanelFramework } from "./drivers/scenario";
import { panelDialog } from "./panel-dialog";

const stacks: Array<{ stack: FrameworkName; framework: PanelFramework }> = [
  { stack: "React Spectrum stack", framework: "react" },
  { stack: "Solidaria stack", framework: "solid" },
];

test.describe("panelDialog on the comparison page", () => {
  for (const { stack, framework } of stacks) {
    test(`${stack} datepicker dialog is the one its trigger controls`, async ({ page }) => {
      await page.goto("/components/datepicker/");
      await waitForComparisonRouteReady(page, ["react", "solid"], { paintBudgetMs: 0 });
      const section = await styledSection(page);
      const canvas = await frameworkCanvas(section, stack);
      const other: PanelFramework = framework === "react" ? "solid" : "react";
      const otherCanvas = await frameworkCanvas(
        section,
        framework === "react" ? "Solidaria stack" : "React Spectrum stack",
      );

      await clickLocator(canvas.locator('button[aria-haspopup="dialog"]'));
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(panelDialog({ page, canvas, framework })).toBeVisible();
      await expect(panelDialog({ page, canvas: otherCanvas, framework: other })).toHaveCount(0);
    });
  }
});
