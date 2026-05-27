import { expect, test, type Page } from "@playwright/test";
import { reactSpectrumCatalogue } from "../src/data/react-spectrum-catalogue";

async function setThemeFromControl(page: Page, theme: "light" | "dark") {
  await page
    .getByRole("radiogroup", { name: "Color scheme" })
    .locator("label", { hasText: theme })
    .click();
}

test.describe("comparison component theme contract", () => {
  for (const item of reactSpectrumCatalogue) {
    test(`${item.title} exposes light and dark theme controls`, async ({ page }) => {
      await page.goto(`/components/${item.slug}/`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("astro-island")).toHaveCount(0);

      const body = page.locator("body");
      const solidThemeRoots = page.locator("[data-comparison-color-scheme]");

      await expect(page.getByRole("radiogroup", { name: "Color scheme" })).toBeVisible();

      await setThemeFromControl(page, "light");
      await expect(body).toHaveAttribute("data-theme", "light");
      await expect(body).toHaveAttribute("data-resolved-theme", "light");
      await expectDocsShellFramesToInheritPanelTheme(page);
      if ((await solidThemeRoots.count()) > 0) {
        await expect(solidThemeRoots.first()).toHaveAttribute(
          "data-comparison-color-scheme",
          "light",
        );
      }

      await setThemeFromControl(page, "dark");
      await expect(body).toHaveAttribute("data-theme", "dark");
      await expect(body).toHaveAttribute("data-resolved-theme", "dark");
      await expectDocsShellFramesToInheritPanelTheme(page);
      if ((await solidThemeRoots.count()) > 0) {
        await expect(solidThemeRoots.first()).toHaveAttribute(
          "data-comparison-color-scheme",
          "dark",
        );
      }
    });
  }
});

async function expectDocsShellFramesToInheritPanelTheme(page: Page) {
  const frameBackgrounds = await page
    .locator(".s2-framework-panel .comparison-reference-frame")
    .evaluateAll((frames) => frames.map((frame) => window.getComputedStyle(frame).backgroundColor));

  expect(frameBackgrounds.every((background) => background === "rgba(0, 0, 0, 0)")).toBe(true);
}
