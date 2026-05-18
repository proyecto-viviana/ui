import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import {
  calendarDemoDefaults,
  calendarFirstDayOfWeekOptions,
  calendarVisibleMonthsOptions,
} from "../src/data/calendar-demo";

function calendarQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function calendarFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/calendar/${calendarQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="calendar"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="calendar"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function clickDate(panel: Locator, day: number, options: { force?: boolean } = {}) {
  await panel
    .getByRole("button", { name: new RegExp(`February ${day}, 2025`, "i") })
    .first()
    .click(options);
}

test.describe("comparison Calendar route contract", () => {
  test("Calendar route mounts React and Solid styled references", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page);

    const expectedProps = JSON.stringify(calendarDemoDefaults);

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactRoot).toHaveAttribute("data-comparison-value", "2025-02-03");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "2025-02-03");
    await expect(reactPanel.getByRole("grid")).toBeVisible();
    await expect(solidPanel.getByRole("grid")).toBeVisible();
  });

  test("Calendar controls cover first day, month count, validation, and immutable states", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page, {
      firstDayOfWeek: "mon",
      visibleMonths: "2",
      constrainRange: true,
      unavailableDates: true,
      isInvalid: true,
      errorMessage: "Date is unavailable.",
    });

    await expect(
      page
        .locator('select[name="firstDayOfWeek"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...calendarFirstDayOfWeekOptions]);
    await expect(page.locator('select[name="firstDayOfWeek"]')).toHaveValue("mon");
    await expect(
      page
        .locator('input[name="visibleMonths"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...calendarVisibleMonthsOptions]);
    await expect(page.locator('input[name="visibleMonths"]:checked')).toHaveValue("2");
    await expect(page.locator('input[name="constrainRange"]')).toBeChecked();
    await expect(page.locator('input[name="unavailableDates"]')).toBeChecked();
    await expect(page.locator('input[name="isInvalid"]')).toBeChecked();

    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        ...calendarDemoDefaults,
        firstDayOfWeek: "mon",
        visibleMonths: "2",
        constrainRange: true,
        unavailableDates: true,
        isInvalid: true,
        errorMessage: "Date is unavailable.",
      }),
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        ...calendarDemoDefaults,
        firstDayOfWeek: "mon",
        visibleMonths: "2",
        constrainRange: true,
        unavailableDates: true,
        isInvalid: true,
        errorMessage: "Date is unavailable.",
      }),
    );
    await expect(reactPanel.getByRole("grid")).toHaveCount(2);
    await expect(solidPanel.getByRole("grid")).toHaveCount(2);
    await expect(reactPanel.getByText("Date is unavailable.")).toBeVisible();
    await expect(solidPanel.getByText("Date is unavailable.")).toBeVisible();
  });

  test("Calendar selection updates value and unavailable/read-only dates do not", async ({
    page,
  }) => {
    const fixtures = await calendarFixtures(page);

    await clickDate(fixtures.reactPanel, 12);
    await clickDate(fixtures.solidPanel, 12);
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-value", "2025-02-12");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-value", "2025-02-12");

    const unavailable = await calendarFixtures(page, { unavailableDates: true });
    await expect(
      unavailable.reactPanel.getByRole("button", { name: /February 10, 2025/i }).first(),
    ).toBeDisabled();
    await expect(
      unavailable.solidPanel.getByRole("button", { name: /February 10, 2025/i }).first(),
    ).toBeDisabled();
    await expect(unavailable.reactRoot).toHaveAttribute("data-comparison-value", "2025-02-03");
    await expect(unavailable.solidRoot).toHaveAttribute("data-comparison-value", "2025-02-03");

    const readOnly = await calendarFixtures(page, { isReadOnly: true });
    await clickDate(readOnly.reactPanel, 12, { force: true });
    await clickDate(readOnly.solidPanel, 12, { force: true });
    await expect(readOnly.reactRoot).toHaveAttribute("data-comparison-value", "2025-02-03");
    await expect(readOnly.solidRoot).toHaveAttribute("data-comparison-value", "2025-02-03");
  });

  test("Calendar disabled state disables calendar navigation in both stacks", async ({ page }) => {
    const { reactPanel, solidPanel } = await calendarFixtures(page, { isDisabled: true });

    await expect(
      reactPanel.getByRole("button", { name: /^Previous( month)?$/ }).first(),
    ).toBeDisabled();
    await expect(
      solidPanel.getByRole("button", { name: /^Previous( month)?$/ }).first(),
    ).toBeDisabled();
    await expect(
      reactPanel.getByRole("button", { name: /^Next( month)?$/ }).first(),
    ).toBeDisabled();
    await expect(
      solidPanel.getByRole("button", { name: /^Next( month)?$/ }).first(),
    ).toBeDisabled();
  });
});
