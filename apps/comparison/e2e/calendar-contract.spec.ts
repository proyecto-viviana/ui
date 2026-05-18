import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import {
  calendarDemoDefaults,
  calendarFirstDayOfWeekOptions,
  calendarPageBehaviorOptions,
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

async function clickNext(panel: Locator) {
  await panel
    .getByRole("button", { name: /^Next( month)?$/ })
    .first()
    .click();
}

async function focusDate(panel: Locator, day: number) {
  await panel
    .getByRole("button", { name: new RegExp(`February ${day}, 2025`, "i") })
    .first()
    .focus();
}

async function focusSelectedDate(root: Locator) {
  await root
    .locator(
      '[data-selected][role="button"], [data-selected] [role="button"], [aria-selected="true"] [role="button"]',
    )
    .first()
    .focus();
}

async function selectedDateLabel(root: Locator) {
  return root
    .locator(
      '[data-selected][role="button"], [data-selected] [role="button"], [aria-selected="true"] [role="button"]',
    )
    .first()
    .getAttribute("aria-label");
}

async function weekHeaderText(panel: Locator) {
  return panel
    .getByRole("grid")
    .first()
    .locator("thead th")
    .evaluateAll((headers) => headers.map((header) => header.textContent?.trim() ?? ""));
}

async function providerDirection(root: Locator) {
  return root.evaluate((element) => element.closest("[dir]")?.getAttribute("dir") ?? null);
}

async function expectMonths(panel: Locator, months: string[]) {
  for (const month of months) {
    await expect(panel.getByText(month, { exact: true }).first()).toBeVisible();
  }
}

async function calendarHeadingText(panel: Locator) {
  return ((await panel.getByRole("heading").first().textContent()) ?? "").replace(
    /^Event date,\s*/,
    "",
  );
}

async function dispatchCalendarControls(page: Page, props: Record<string, string | boolean>) {
  await page.evaluate((nextProps) => {
    window.dispatchEvent(
      new CustomEvent("comparison:controls-change", {
        detail: {
          component: "calendar",
          props: nextProps,
        },
      }),
    );
  }, props);
}

test.describe("comparison Calendar route contract", () => {
  test("Calendar route mounts the official default example on both stacks", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page);

    const expectedProps = JSON.stringify(calendarDemoDefaults);

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactRoot).toHaveAttribute("data-comparison-value", "");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "");
    await expect(reactPanel.getByRole("application", { name: /Event date/i })).toBeVisible();
    await expect(solidPanel.getByRole("application", { name: /Event date/i })).toBeVisible();
    await expect(reactPanel.getByRole("grid")).toBeVisible();
    await expect(solidPanel.getByRole("grid")).toBeVisible();
    await expect(reactRoot.locator('[data-selected], [aria-selected="true"]')).toHaveCount(0);
    await expect(solidRoot.locator('[data-selected], [aria-selected="true"]')).toHaveCount(0);
  });

  test("Calendar side panel matches the official viewer control surface", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page, {
      firstDayOfWeek: "mon",
      visibleMonths: "2",
      pageBehavior: "single",
    });

    await expect(
      page
        .locator('select[name="firstDayOfWeek"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...calendarFirstDayOfWeekOptions]);
    await expect(page.locator('select[name="firstDayOfWeek"]')).toHaveValue("mon");
    await expect(
      page
        .locator('select[name="visibleMonths"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...calendarVisibleMonthsOptions]);
    await expect(page.locator('select[name="visibleMonths"]')).toHaveValue("2");
    await expect(
      page
        .locator('select[name="pageBehavior"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...calendarPageBehaviorOptions]);
    await expect(page.locator('select[name="pageBehavior"]')).toHaveValue("single");
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();

    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        ...calendarDemoDefaults,
        firstDayOfWeek: "mon",
        visibleMonths: "2",
        pageBehavior: "single",
      }),
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        ...calendarDemoDefaults,
        firstDayOfWeek: "mon",
        visibleMonths: "2",
        pageBehavior: "single",
      }),
    );
    await expect(reactPanel.getByRole("grid")).toHaveCount(2);
    await expect(solidPanel.getByRole("grid")).toHaveCount(2);
  });

  test("Calendar inherits Provider locale for month titles and week starts", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page, {
      locale: "fr-FR",
      focusedValue: "2025-02-15",
    });

    await expectMonths(reactPanel, ["février 2025"]);
    await expectMonths(solidPanel, ["février 2025"]);
    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        ...calendarDemoDefaults,
        locale: "fr-FR",
        focusedValue: "2025-02-15",
      }),
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        ...calendarDemoDefaults,
        locale: "fr-FR",
        focusedValue: "2025-02-15",
      }),
    );
    await expect(
      reactPanel.getByRole("button", { name: /samedi 15 février 2025/i }).first(),
    ).toBeVisible();
    await expect(
      solidPanel.getByRole("button", { name: /samedi 15 février 2025/i }).first(),
    ).toBeVisible();
    await expect(weekHeaderText(reactPanel)).resolves.toEqual(["L", "M", "M", "J", "V", "S", "D"]);
    await expect(weekHeaderText(solidPanel)).resolves.toEqual(["L", "M", "M", "J", "V", "S", "D"]);
  });

  test("Calendar inherits RTL direction for keyboard day movement", async ({ page }) => {
    const { reactRoot, solidRoot } = await calendarFixtures(page, {
      locale: "ar-AE",
      value: "2025-02-03",
    });

    await expect(providerDirection(reactRoot)).resolves.toBe("rtl");
    await expect(providerDirection(solidRoot)).resolves.toBe("rtl");

    await focusSelectedDate(reactRoot);
    await page.keyboard.press("ArrowRight");
    await expect(reactRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-02");

    await focusSelectedDate(solidRoot);
    await page.keyboard.press("ArrowRight");
    await expect(solidRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-02");
  });

  test("Calendar supports Unicode calendar-system locale display", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page, {
      locale: "hi-IN-u-ca-indian",
      value: "2025-02-15",
    });

    const reactTitle = await calendarHeadingText(reactPanel);
    const solidTitle = await calendarHeadingText(solidPanel);
    expect(reactTitle).toBe(solidTitle);
    expect(reactTitle).toContain("1946");

    const reactLabel = await selectedDateLabel(reactRoot);
    const solidLabel = await selectedDateLabel(solidRoot);
    expect(reactLabel).toBe(solidLabel);
    expect(reactLabel ?? "").toContain("1946");

    await focusSelectedDate(reactRoot);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(reactRoot).toHaveAttribute("data-comparison-value", "2025-02-16");

    await focusSelectedDate(solidRoot);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "2025-02-16");
  });

  test("Calendar routes custom createCalendar display through both stacks", async ({ page }) => {
    const { reactPanel, solidPanel } = await calendarFixtures(page, {
      calendarSystem: "custom454",
      focusedValue: "2025-03-01",
    });

    const reactTitle = await calendarHeadingText(reactPanel);
    const solidTitle = await calendarHeadingText(solidPanel);

    expect(reactTitle).toBe(solidTitle);
    expect(reactTitle).toBe("February 2025");
  });

  test("Calendar focusedValue and selectionAlignment control the visible range", async ({
    page,
  }) => {
    const cases = [
      {
        selectionAlignment: "start",
        months: ["February 2025", "March 2025", "April 2025"],
      },
      {
        selectionAlignment: "center",
        months: ["January 2025", "February 2025", "March 2025"],
      },
      {
        selectionAlignment: "end",
        months: ["December 2024", "January 2025", "February 2025"],
      },
    ] as const;

    for (const { selectionAlignment, months } of cases) {
      const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page, {
        focusedValue: "2025-02-15",
        visibleMonths: "3",
        selectionAlignment,
      });

      await expectMonths(reactPanel, months);
      await expectMonths(solidPanel, months);
      await expect(reactRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-15");
      await expect(solidRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-15");
    }
  });

  test("Calendar controlled focusedValue responds to route updates", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page, {
      focusedValue: "2025-02-15",
      visibleMonths: "2",
      selectionAlignment: "end",
    });

    await expectMonths(reactPanel, ["January 2025", "February 2025"]);
    await expectMonths(solidPanel, ["January 2025", "February 2025"]);

    await dispatchCalendarControls(page, { focusedValue: "2025-05-15" });

    await expectMonths(reactPanel, ["May 2025", "June 2025"]);
    await expectMonths(solidPanel, ["May 2025", "June 2025"]);
    await expect(reactRoot).toHaveAttribute("data-comparison-focused-value", "2025-05-15");
    await expect(solidRoot).toHaveAttribute("data-comparison-focused-value", "2025-05-15");
  });

  test("Calendar keyboard focus movement reports onFocusChange and selects focused date", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await calendarFixtures(page, {
      value: "2025-02-03",
    });

    await focusDate(reactPanel, 3);
    await page.keyboard.press("ArrowRight");
    await expect(reactRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-04");
    await page.keyboard.press("Enter");
    await expect(reactRoot).toHaveAttribute("data-comparison-value", "2025-02-04");

    await focusDate(solidPanel, 3);
    await page.keyboard.press("ArrowRight");
    await expect(solidRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-04");
    await page.keyboard.press("Enter");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "2025-02-04");
  });

  test("Calendar pageBehavior controls visible range paging", async ({ page }) => {
    const visible = await calendarFixtures(page, {
      value: "2025-02-03",
      visibleMonths: "2",
      pageBehavior: "visible",
    });

    await expectMonths(visible.reactPanel, ["February 2025", "March 2025"]);
    await expectMonths(visible.solidPanel, ["February 2025", "March 2025"]);
    await clickNext(visible.reactPanel);
    await clickNext(visible.solidPanel);
    await expectMonths(visible.reactPanel, ["April 2025", "May 2025"]);
    await expectMonths(visible.solidPanel, ["April 2025", "May 2025"]);

    const single = await calendarFixtures(page, {
      value: "2025-02-03",
      visibleMonths: "2",
      pageBehavior: "single",
    });

    await clickNext(single.reactPanel);
    await clickNext(single.solidPanel);
    await expectMonths(single.reactPanel, ["March 2025", "April 2025"]);
    await expectMonths(single.solidPanel, ["March 2025", "April 2025"]);
  });

  test("Calendar validation docs/API states are still route-testable", async ({ page }) => {
    const { reactPanel, solidPanel } = await calendarFixtures(page, {
      value: "2025-02-03",
      visibleMonths: "2",
      constrainRange: true,
      unavailableDates: true,
      isInvalid: true,
      errorMessage: "Date is unavailable.",
    });

    await expect(reactPanel.getByRole("grid")).toHaveCount(2);
    await expect(solidPanel.getByRole("grid")).toHaveCount(2);
    const reactError = reactPanel.getByText("Date is unavailable.");
    const solidError = solidPanel.getByText("Date is unavailable.");
    await expect(reactError).toBeVisible();
    await expect(solidError).toBeVisible();

    for (const panel of [reactPanel, solidPanel]) {
      const selected = panel.getByRole("button", { name: /February 3, 2025/i }).first();
      const errorId = await panel.getByText("Date is unavailable.").getAttribute("id");
      await expect(selected).toHaveAttribute("aria-invalid", "true");
      await expect(selected).toHaveAttribute("aria-describedby", errorId ?? "");
    }
  });

  test("Calendar selection updates value and unavailable/read-only dates do not", async ({
    page,
  }) => {
    const fixtures = await calendarFixtures(page, { value: "2025-02-03" });

    await clickDate(fixtures.reactPanel, 12);
    await clickDate(fixtures.solidPanel, 12);
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-value", "2025-02-12");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-value", "2025-02-12");

    const unavailable = await calendarFixtures(page, {
      value: "2025-02-03",
      unavailableDates: true,
    });
    await expect(
      unavailable.reactPanel.getByRole("button", { name: /February 10, 2025/i }).first(),
    ).toBeDisabled();
    await expect(
      unavailable.solidPanel.getByRole("button", { name: /February 10, 2025/i }).first(),
    ).toBeDisabled();
    await expect(unavailable.reactRoot).toHaveAttribute("data-comparison-value", "2025-02-03");
    await expect(unavailable.solidRoot).toHaveAttribute("data-comparison-value", "2025-02-03");

    const readOnly = await calendarFixtures(page, { value: "2025-02-03", isReadOnly: true });
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
