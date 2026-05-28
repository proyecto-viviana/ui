import { expect, test, type Page } from "@playwright/test";
import { reactSpectrumCatalogue } from "../src/data/react-spectrum-catalogue";
import { comparisonThemeRequestEvent, type ComparisonThemeChoice } from "../src/data/theme";

async function requestTheme(page: Page, theme: ComparisonThemeChoice) {
  await page.evaluate(
    ({ eventName, nextTheme }) => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { theme: nextTheme },
        }),
      );
    },
    { eventName: comparisonThemeRequestEvent, nextTheme: theme },
  );
}

test.describe("comparison component theme contract", () => {
  for (const item of reactSpectrumCatalogue) {
    test(`${item.title} exposes global light and dark theme controls`, async ({ page }) => {
      await page.goto(`/components/${item.slug}/`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("astro-island")).toHaveCount(0);

      const body = page.locator("body");
      const solidThemeRoots = page.locator("[data-comparison-color-scheme]");
      const themeToggle = page.locator("[data-theme-toggle]").first();

      await expect(themeToggle).toBeVisible();
      await expect(themeToggle).toHaveAttribute("aria-label", /Using .* mode \(press to switch\)/);

      await requestTheme(page, "system");
      await themeToggle.click();
      await expect(body).toHaveAttribute("data-theme", "light");
      await expect(body).toHaveAttribute("data-resolved-theme", "light");
      await expectDocsShellFramesToInheritPanelTheme(page);
      if ((await solidThemeRoots.count()) > 0) {
        await expect(solidThemeRoots.first()).toHaveAttribute(
          "data-comparison-color-scheme",
          "light",
        );
      }

      await themeToggle.click();
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
