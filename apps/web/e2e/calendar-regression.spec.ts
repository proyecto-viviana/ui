import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

const CALENDAR_SECTION = 'section[data-testid="section-calendar"]';
const RANGE_CALENDAR_SECTION = 'section[data-testid="section-rangecalendar"]';
const DATE_FIELD_SECTION = 'section[data-testid="section-datefield"]';
const TIME_FIELD_SECTION = 'section[data-testid="section-timefield"]';
const DATE_PICKER_SECTION = 'section[data-testid="section-datepicker"]';
const DATE_RANGE_PICKER_SECTION = 'section[data-testid="section-daterangepicker"]';

async function setupErrorCapture(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  return errors;
}

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("show-all-sections")).toBeVisible();
}

function getVisibleCountText(page: Page) {
  return page.getByTestId("visible-section-count").first();
}

async function getVisibleAndTotalCount(page: Page) {
  const text = (await getVisibleCountText(page).textContent()) ?? "";
  const match = text.match(/(\d+)\s+of\s+(\d+)\s+visible/);
  if (!match) return null;
  return {
    visible: Number(match[1]),
    total: Number(match[2]),
  };
}

async function expectVisibleCount(page: Page, expected: number) {
  await expect
    .poll(
      async () => {
        const counts = await getVisibleAndTotalCount(page);
        return counts ? counts.visible : -1;
      },
      { timeout: 15_000 },
    )
    .toBe(expected);
}

async function toggleSection(page: Page, id: string) {
  const toggle = page.getByTestId(`section-toggle-${id}`);
  await expect(toggle).toBeVisible();
  await toggle.click();
}

async function checkNoRuntimeErrors(errors: string[]) {
  const filtered = errors.filter((e) => !/favicon|Failed to load resource/.test(e));
  expect(filtered).toEqual([]);
}

test.describe("Playground Calendar Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.playground);
    await waitForPageReady(page);
  });

  test("calendar toggle renders calendar section and grid cells", async ({ page }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await toggleSection(page, "calendar");

    await expectVisibleCount(page, 1);
    const calendarSection = page.locator(CALENDAR_SECTION);
    await expect(calendarSection).toBeVisible();
    await expect(calendarSection.getByRole("heading", { name: "Calendar" })).toBeVisible();

    await expect
      .poll(() => calendarSection.getByRole("gridcell").count(), { timeout: 15_000 })
      .toBeGreaterThan(20);

    await checkNoRuntimeErrors(errors);
  });

  test("calendar section chip is idempotent and hide-all clears rendered sections", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await toggleSection(page, "calendar");
    await expectVisibleCount(page, 1);
    await expect(page.locator(CALENDAR_SECTION)).toBeVisible();

    // Section control chips are "show/jump" actions, not true on/off toggles.
    await toggleSection(page, "calendar");
    await expectVisibleCount(page, 1);
    await expect(page.locator(CALENDAR_SECTION)).toBeVisible();

    await page.getByTestId("hide-all-sections").click();
    await expectVisibleCount(page, 0);
    await expect(page.locator(CALENDAR_SECTION)).toHaveCount(0);

    await checkNoRuntimeErrors(errors);
  });

  test("show all surfaces both calendar and range calendar sections", async ({ page }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await page.getByTestId("show-all-sections").click();

    await expect
      .poll(
        async () => {
          const counts = await getVisibleAndTotalCount(page);
          return counts ? counts.visible - counts.total : -1;
        },
        { timeout: 20_000 },
      )
      .toBe(0);
    await expect
      .poll(
        async () => {
          const counts = await getVisibleAndTotalCount(page);
          return counts ? counts.total : -1;
        },
        { timeout: 20_000 },
      )
      .toBeGreaterThan(50);

    const calendarSection = page.locator(CALENDAR_SECTION);
    const rangeCalendarSection = page.locator(RANGE_CALENDAR_SECTION);

    await expect(calendarSection).toBeVisible({ timeout: 30_000 });
    await expect(rangeCalendarSection).toBeVisible({ timeout: 30_000 });

    await expect
      .poll(() => calendarSection.getByRole("gridcell").count(), { timeout: 30_000 })
      .toBeGreaterThan(20);
    await expect
      .poll(() => rangeCalendarSection.getByRole("gridcell").count(), { timeout: 30_000 })
      .toBeGreaterThan(20);

    await checkNoRuntimeErrors(errors);
  });

  test("range calendar selection updates summary text", async ({ page }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await toggleSection(page, "rangecalendar");
    await expectVisibleCount(page, 1);

    const rangeCalendarSection = page.locator(RANGE_CALENDAR_SECTION);
    await expect(rangeCalendarSection).toBeVisible();

    const start = rangeCalendarSection
      .locator('[role="button"][aria-label*="June 10, 2024"]')
      .first();
    await start.dispatchEvent("pointerdown");
    const end = rangeCalendarSection
      .locator('[role="button"][aria-label*="June 15, 2024"]')
      .first();
    await end.dispatchEvent("pointerdown");

    await expect(rangeCalendarSection.getByText("Range: 2024-06-10 - 2024-06-15")).toBeVisible();
    await checkNoRuntimeErrors(errors);
  });

  test("date field section exposes labeled segmented field", async ({ page }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await toggleSection(page, "datefield");
    await expectVisibleCount(page, 1);

    const dateFieldSection = page.locator(DATE_FIELD_SECTION);
    await expect(dateFieldSection).toBeVisible();

    const group = dateFieldSection.getByRole("group", { name: "Birth Date" }).first();
    await expect(group).toBeVisible();
    await expect(group.locator('[role="spinbutton"]')).toHaveCount(3);

    await checkNoRuntimeErrors(errors);
  });

  test("time field section exposes labeled segmented field and keyboard segment navigation", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await toggleSection(page, "timefield");
    await expectVisibleCount(page, 1);

    const timeFieldSection = page.locator(TIME_FIELD_SECTION);
    await expect(timeFieldSection).toBeVisible();

    const group = timeFieldSection.getByRole("group", { name: "Meeting Time" }).first();
    await expect(group).toBeVisible();

    const segments = group.locator('[role="spinbutton"]');
    expect(await segments.count()).toBeGreaterThan(1);
    const firstSegment = segments.first();
    const secondSegment = segments.nth(1);

    await firstSegment.focus();
    await page.keyboard.press("ArrowRight");
    await expect(secondSegment).toBeFocused();

    await checkNoRuntimeErrors(errors);
  });

  test("date picker section exposes labeled segmented field and opens calendar popup", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await toggleSection(page, "datepicker");
    await expectVisibleCount(page, 1);

    const datePickerSection = page.locator(DATE_PICKER_SECTION);
    await expect(datePickerSection).toBeVisible();

    // S2's FieldGroup renders role="presentation" (matching Adobe Spectrum 2), so the
    // "Event Date" grouping rides on each segment's composed accessible name (e.g.
    // "month, Event Date") rather than on a wrapping group role.
    const segments = datePickerSection.getByRole("spinbutton", { name: /Event Date/ });
    await expect(segments).toHaveCount(3);
    await expect(segments.first()).toBeVisible();

    const trigger = datePickerSection.getByRole("button", { name: "Calendar Event Date" }).first();
    await trigger.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("grid").first()).toBeVisible();

    await checkNoRuntimeErrors(errors);
  });

  test("date range picker section exposes labeled range fields and keyboard-open behavior", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);

    await expectVisibleCount(page, 0);
    await toggleSection(page, "daterangepicker");
    await expectVisibleCount(page, 1);

    const dateRangePickerSection = page.locator(DATE_RANGE_PICKER_SECTION);
    await expect(dateRangePickerSection).toBeVisible();

    // S2's FieldGroup renders role="presentation" (matching Adobe Spectrum 2), so the
    // "Trip Dates" grouping and Start/End labeling ride on each segment's composed
    // accessible name (e.g. "month, Start Date, Trip Dates") rather than a group role.
    const startSegments = dateRangePickerSection.getByRole("spinbutton", {
      name: /Start Date, Trip Dates/,
    });
    const endSegments = dateRangePickerSection.getByRole("spinbutton", {
      name: /End Date, Trip Dates/,
    });
    await expect(startSegments).toHaveCount(3);
    await expect(endSegments).toHaveCount(3);
    await expect(startSegments.first()).toBeVisible();
    await expect(endSegments.first()).toBeVisible();

    // Keyboard-open: focus the trigger and press Enter (the calendar opens from the
    // trigger button, not from a segment).
    const trigger = dateRangePickerSection
      .getByRole("button", { name: "Calendar Trip Dates" })
      .first();
    await trigger.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("grid").first()).toBeVisible();

    await checkNoRuntimeErrors(errors);
  });
});
