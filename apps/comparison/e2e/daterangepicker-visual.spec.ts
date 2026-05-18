import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";

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

test.describe("comparison DateRangePicker visual parity", () => {
  test("route mounts both styled stacks and opens range calendar popovers", async ({ page }) => {
    await page.goto(
      "/components/daterangepicker/?size=XL&maxVisibleMonths=2&isRequired=true&description=Choose%20travel%20dates",
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
        maxVisibleMonths: "2",
        isRequired: true,
      });
    await expect
      .poll(async () =>
        JSON.parse((await solidRoot.getAttribute("data-comparison-control-props")) ?? "{}"),
      )
      .toMatchObject({
        size: "XL",
        maxVisibleMonths: "2",
        isRequired: true,
      });

    await openRangeCalendar(reactPanel);
    await expectOpenState(reactRoot, true);
    await page.keyboard.press("Escape");
    await expectOpenState(reactRoot, false);

    await openRangeCalendar(solidPanel);
    await expectOpenState(solidRoot, true);
    const solidDialog = await solidRangeCalendarDialog(page);
    await expect(solidDialog.locator('[role="grid"]')).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expectOpenState(solidRoot, false);
  });
});
