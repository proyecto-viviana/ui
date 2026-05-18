import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";

async function rangeCalendarRoot(panel: Locator) {
  const root = panel.locator('[data-comparison-control-root="rangecalendar"]');
  await expect(root).toHaveCount(1);
  await expect(root).toBeVisible();
  return root;
}

async function rangeCalendarFixtures(page: Page) {
  await page.goto(
    "/components/rangecalendar/?visibleMonths=2&firstDayOfWeek=mon&isInvalid=true&unavailableDates=true&allowsNonContiguousRanges=true&constrainRange=true",
  );
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = await rangeCalendarRoot(reactPanel);
  const solidRoot = await rangeCalendarRoot(solidPanel);

  return { reactRoot, solidRoot };
}

async function rangeCalendarContract(root: Locator) {
  return root.evaluate((element) => {
    const calendarRoot = element.querySelector(".comparison-rangecalendar-root") ?? element;
    const rootRect = calendarRoot.getBoundingClientRect();
    const grids = Array.from(element.querySelectorAll('[role="grid"]')) as HTMLElement[];
    const gridRects = grids.map((grid) => grid.getBoundingClientRect());
    const lastGridRect = gridRects[gridRects.length - 1] ?? rootRect;
    const selectedButtons = Array.from(
      element.querySelectorAll('[data-selected], [aria-selected="true"]'),
    ) as HTMLElement[];
    const unavailable = Array.from(element.querySelectorAll('[role="button"]')).find((button) =>
      (button.getAttribute("aria-label") ?? "").includes("February 10, 2025"),
    );
    const error = Array.from(element.querySelectorAll("*")).find(
      (node) => node.textContent?.trim() === "Choose a valid date range.",
    );

    return {
      gridCount: grids.length,
      columnCounts: grids.map((grid) => grid.querySelectorAll("thead th").length),
      rowCellCounts: grids.map((grid) =>
        Array.from(grid.querySelectorAll("tbody tr")).map((row) => row.children.length),
      ),
      gridWidths: gridRects.map((rect) => Math.round(rect.width)),
      gridGap: gridRects.length > 1 ? Math.round(gridRects[1].left - gridRects[0].right) : null,
      rootRightGap: Math.round(rootRect.right - lastGridRect.right),
      selectedCount: selectedButtons.length,
      unavailableDisabled:
        unavailable?.getAttribute("aria-disabled") === "true" ||
        unavailable?.hasAttribute("data-disabled") ||
        false,
      errorVisible: error instanceof HTMLElement && error.offsetParent !== null,
    };
  });
}

test.describe("comparison RangeCalendar visual coverage", () => {
  test("route mounts both styled stacks with S2 range calendar gates", async ({ page }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page);

    for (const root of [reactRoot, solidRoot]) {
      await expect
        .poll(async () =>
          JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}"),
        )
        .toMatchObject({
          visibleMonths: "2",
          firstDayOfWeek: "mon",
          isInvalid: true,
          unavailableDates: true,
          allowsNonContiguousRanges: true,
          constrainRange: true,
        });

      await expect(root.locator('[role="grid"]')).toHaveCount(2);
      await expect(root.getByText("Choose a valid date range.")).toBeVisible();
    }

    const reactContract = await rangeCalendarContract(reactRoot);
    const solidContract = await rangeCalendarContract(solidRoot);

    for (const contract of [reactContract, solidContract]) {
      expect(contract.gridCount).toBe(2);
      expect(contract.columnCounts).toEqual([7, 7]);
      for (const rowCounts of contract.rowCellCounts) {
        expect(rowCounts.every((count) => count === 7)).toBe(true);
      }
      expect(contract.gridWidths).toEqual([224, 224]);
      expect(contract.gridGap).toBe(24);
      expect(Math.abs(contract.rootRightGap)).toBeLessThanOrEqual(1);
      expect(contract.selectedCount).toBeGreaterThan(0);
      expect(contract.unavailableDisabled).toBe(true);
      expect(contract.errorVisible).toBe(true);
    }
  });
});
