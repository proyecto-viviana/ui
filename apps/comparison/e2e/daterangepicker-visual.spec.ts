import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  compareScreenshots,
  expectScreenshotPair,
  normalizedElementScreenshot,
  pinComparisonTheme,
} from "./visual-diff";

const dateRangePickerGridPairDiff = {
  maxMismatchRatio: 0.013,
  maxDimensionDelta: 0,
  pixelThreshold: 1,
};
const dateRangePickerFieldPairDiff = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 1,
};

async function controlRoot(panel: Locator) {
  const root = panel.locator('[data-comparison-control-root="daterangepicker"]');
  await expect(root).toHaveCount(1);
  await expect(root).toBeVisible();
  return root;
}

async function openRangeCalendar(panel: Locator) {
  const trigger = panel.getByRole("button", { name: /calendar/i }).first();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
}

async function closedField(panel: Locator) {
  const root = await controlRoot(panel);
  const nestedField = root.locator(".comparison-daterangepicker-root").first();
  if ((await nestedField.count()) > 0) {
    await expect(nestedField).toBeVisible();
    return nestedField;
  }

  await expect(root.locator('[role="spinbutton"]')).toHaveCount(6);
  await expect(root.getByRole("button", { name: /calendar/i })).toBeVisible();
  return root;
}

async function expectOpenState(root: Locator, isOpen: boolean) {
  await expect
    .poll(async () => {
      const dataOpen = await root.getAttribute("data-open");
      const comparisonOpen = await root.getAttribute("data-comparison-open");
      return dataOpen != null || comparisonOpen === "true";
    })
    .toBe(isOpen);
}

async function solidRangeCalendarDialog(page: Page) {
  const dialog = page.getByRole("dialog", { name: /range calendar/i }).first();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function openDialogFromPanel(page: Page, panel: Locator) {
  await openRangeCalendar(panel);
  await page.waitForTimeout(220);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await clearPointer(page);
  const dialog = page.locator('[role="dialog"]').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function rangeCalendarContract(dialog: Locator) {
  return dialog.evaluate((element) => {
    const grids = Array.from(element.querySelectorAll('[role="grid"]')) as HTMLElement[];
    const gridRects = grids.map((grid) => grid.getBoundingClientRect());
    const buttons = Array.from(element.querySelectorAll('[role="button"]'));
    const isDisabled = (label: string) => {
      const button = buttons.find((candidate) =>
        (candidate.getAttribute("aria-label") ?? "").includes(label),
      );
      return (
        button?.getAttribute("aria-disabled") === "true" ||
        button?.hasAttribute("data-disabled") ||
        false
      );
    };
    const error = Array.from(element.querySelectorAll("*")).find(
      (node) => node.textContent?.trim() === "Select a valid date range.",
    );

    return {
      gridCount: grids.length,
      columnCounts: grids.map((grid) => grid.querySelectorAll("thead th").length),
      rowCellCounts: grids.map((grid) =>
        Array.from(grid.querySelectorAll("tbody tr")).map((row) => row.children.length),
      ),
      weekdayLabels: grids.map((grid) =>
        Array.from(grid.querySelectorAll("thead th")).map((cell) => cell.textContent?.trim() ?? ""),
      ),
      gridWidths: gridRects.map((rect) => Math.round(rect.width)),
      minDisabled: isDisabled("February 2, 2025"),
      maxDisabled: isDisabled("February 21, 2025"),
      unavailableDisabled: isDisabled("February 10, 2025"),
      errorVisible: error instanceof HTMLElement && error.offsetParent !== null,
    };
  });
}

test.describe("comparison DateRangePicker visual parity", () => {
  test("closed segmented range fields are pixel-identical", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(
      "/components/daterangepicker/?size=XL&startValue=2025-02-03&endValue=2025-02-14&startName=startDate&endName=endDate",
    );
    await waitForComparisonRouteReady(page);
    await clearPointer(page);

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");

    for (const panel of [reactPanel, solidPanel]) {
      await expect(panel.locator('[role="spinbutton"]')).toHaveCount(6);
      await expect(panel.getByRole("spinbutton", { name: /month/i }).first()).toBeVisible();
      await expect(panel.getByRole("spinbutton", { name: /day/i }).first()).toBeVisible();
      await expect(panel.getByRole("spinbutton", { name: /year/i }).first()).toBeVisible();
    }

    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    const reactField = await closedField(reactPanel);
    const solidField = await closedField(solidPanel);
    await clearPointer(page);
    await expectScreenshotPair(
      page,
      reactField,
      solidField,
      "DateRangePicker closed segmented field",
      dateRangePickerFieldPairDiff,
    );
  });

  test("open range calendar month grids match the parity contract", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto(
      "/components/daterangepicker/?size=XL&startValue=2025-02-03&endValue=2025-03-14&maxVisibleMonths=2&firstDayOfWeek=mon&pageBehavior=single",
    );
    await waitForComparisonRouteReady(page);
    await clearPointer(page);

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");

    const reactDialog = await openDialogFromPanel(page, reactPanel);
    const reactGrids = reactDialog.locator('[role="grid"]');
    await expect(reactGrids).toHaveCount(2);
    const reactGridPngs = await Promise.all([
      normalizedElementScreenshot(reactGrids.nth(0)),
      normalizedElementScreenshot(reactGrids.nth(1)),
    ]);
    const reactContract = await rangeCalendarContract(reactDialog);
    await page.keyboard.press("Escape");

    const solidDialog = await openDialogFromPanel(page, solidPanel);
    const solidGrids = solidDialog.locator('[role="grid"]');
    await expect(solidGrids).toHaveCount(2);
    const solidGridPngs = await Promise.all([
      normalizedElementScreenshot(solidGrids.nth(0)),
      normalizedElementScreenshot(solidGrids.nth(1)),
    ]);
    const solidContract = await rangeCalendarContract(solidDialog);

    for (const contract of [reactContract, solidContract]) {
      expect(contract.gridCount).toBe(2);
      expect(contract.columnCounts).toEqual([7, 7]);
      expect(contract.weekdayLabels).toEqual([
        ["M", "T", "W", "T", "F", "S", "S"],
        ["M", "T", "W", "T", "F", "S", "S"],
      ]);
      for (const rowCounts of contract.rowCellCounts) {
        expect(rowCounts.every((count) => count === 7)).toBe(true);
      }
      expect(contract.gridWidths).toEqual([224, 224]);
    }

    await compareScreenshots(
      page,
      reactGridPngs[0],
      solidGridPngs[0],
      "DateRangePicker leading popover month grid",
      dateRangePickerGridPairDiff,
    );
    await compareScreenshots(
      page,
      reactGridPngs[1],
      solidGridPngs[1],
      "DateRangePicker trailing popover month grid",
      dateRangePickerGridPairDiff,
    );
  });

  test("route mounts both styled stacks and opens range calendar popovers", async ({ page }) => {
    await page.goto(
      "/components/daterangepicker/?size=XL&startValue=2025-02-03&endValue=2025-02-14&maxVisibleMonths=2&firstDayOfWeek=mon&pageBehavior=single&constrainRange=true&unavailableDates=true&allowsNonContiguousRanges=true&startName=startDate&endName=endDate&isRequired=true&isInvalid=true&description=Choose%20travel%20dates",
    );
    await waitForComparisonRouteReady(page);

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = await controlRoot(reactPanel);
    const solidRoot = await controlRoot(solidPanel);

    await expect
      .poll(async () =>
        JSON.parse((await reactRoot.getAttribute("data-comparison-control-props")) ?? "{}"),
      )
      .toMatchObject({
        size: "XL",
        startValue: "2025-02-03",
        endValue: "2025-02-14",
        maxVisibleMonths: "2",
        firstDayOfWeek: "mon",
        pageBehavior: "single",
        constrainRange: true,
        unavailableDates: true,
        allowsNonContiguousRanges: true,
        startName: "startDate",
        endName: "endDate",
        isRequired: true,
        isInvalid: true,
      });
    await expect
      .poll(async () =>
        JSON.parse((await solidRoot.getAttribute("data-comparison-control-props")) ?? "{}"),
      )
      .toMatchObject({
        size: "XL",
        startValue: "2025-02-03",
        endValue: "2025-02-14",
        maxVisibleMonths: "2",
        firstDayOfWeek: "mon",
        pageBehavior: "single",
        constrainRange: true,
        unavailableDates: true,
        allowsNonContiguousRanges: true,
        startName: "startDate",
        endName: "endDate",
        isRequired: true,
        isInvalid: true,
      });

    await openRangeCalendar(reactPanel);
    await expectOpenState(reactRoot, true);
    const reactDialog = page.locator('[role="dialog"]').last();
    await expect(reactDialog).toBeVisible();
    const reactContract = await rangeCalendarContract(reactDialog);
    expect(reactContract.minDisabled).toBe(true);
    expect(reactContract.maxDisabled).toBe(true);
    expect(reactContract.unavailableDisabled).toBe(true);
    expect(reactContract.errorVisible).toBe(true);
    await page.keyboard.press("Escape");
    await expectOpenState(reactRoot, false);

    await openRangeCalendar(solidPanel);
    await expectOpenState(solidRoot, true);
    const solidDialog = await solidRangeCalendarDialog(page);
    await expect(solidDialog.locator('[role="grid"]')).toHaveCount(2);
    const solidContract = await rangeCalendarContract(solidDialog);
    expect(solidContract.minDisabled).toBe(true);
    expect(solidContract.maxDisabled).toBe(true);
    expect(solidContract.unavailableDisabled).toBe(true);
    expect(solidContract.errorVisible).toBe(true);
    await expect(solidPanel.locator('input[name="startDate"]')).toHaveValue("2025-02-03");
    await expect(solidPanel.locator('input[name="endDate"]')).toHaveValue("2025-02-14");
    await page.keyboard.press("Escape");
    await expectOpenState(solidRoot, false);
  });
});
