import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme, type ComparisonColorScheme } from "./visual-diff";

async function calendarFixtures(page: Page, theme: ComparisonColorScheme = "dark") {
  await pinComparisonTheme(page, theme);
  await page.goto("/components/calendar/");
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="calendar"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="calendar"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactRoot, solidRoot };
}

async function calendarVisualContract(root: Locator) {
  return root
    .locator('[role="grid"]')
    .first()
    .evaluate((grid) => {
      const root = grid.closest('[data-comparison-control-root="calendar"]') as HTMLElement | null;
      const selectedRoot = root?.querySelector(
        '[data-selected], [aria-selected="true"]',
      ) as HTMLElement | null;
      const selectedPaintElement = selectedRoot
        ? ([selectedRoot, ...Array.from(selectedRoot.querySelectorAll("*"))] as HTMLElement[]).find(
            (element) => {
              const rect = element.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                window.getComputedStyle(element).backgroundColor !== "rgba(0, 0, 0, 0)"
              );
            },
          )
        : null;
      const heading = root?.querySelector("h2");
      const gridRect = grid.getBoundingClientRect();
      const selectedRect = selectedRoot?.getBoundingClientRect();
      const selectedStyles = selectedPaintElement
        ? window.getComputedStyle(selectedPaintElement)
        : null;

      return {
        headingText: heading?.textContent?.trim() ?? null,
        gridColumnCount: grid.querySelectorAll("thead th").length,
        gridWidth: Math.round(gridRect.width),
        gridHeight: Math.round(gridRect.height),
        selectedText: selectedRoot?.textContent?.trim() ?? null,
        selectedWidth: selectedRect ? Math.round(selectedRect.width) : null,
        selectedHeight: selectedRect ? Math.round(selectedRect.height) : null,
        selectedBackground: selectedStyles?.backgroundColor ?? null,
        selectedColor: selectedStyles?.color ?? null,
      };
    });
}

test.describe("comparison Calendar visual coverage", () => {
  test("Calendar default surface renders a selected S2 grid in light and dark themes", async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      const { reactRoot, solidRoot } = await calendarFixtures(page, theme);

      const react = await calendarVisualContract(reactRoot);
      const solid = await calendarVisualContract(solidRoot);

      expect(react.headingText).toContain("February 2025");
      expect(solid.headingText).toContain("February 2025");
      expect(react.gridColumnCount).toBe(7);
      expect(solid.gridColumnCount).toBe(7);
      expect(react.selectedText).toBe("3");
      expect(solid.selectedText).toBe("3");
      expect(react.gridWidth).toBeGreaterThan(180);
      expect(solid.gridWidth).toBeGreaterThan(180);
      expect(react.gridHeight).toBeGreaterThan(150);
      expect(solid.gridHeight).toBeGreaterThan(150);
      expect(react.selectedBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(solid.selectedBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(react.selectedColor).not.toBe(react.selectedBackground);
      expect(solid.selectedColor).not.toBe(solid.selectedBackground);
    }
  });
});
