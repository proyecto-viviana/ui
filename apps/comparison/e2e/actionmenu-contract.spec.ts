import { expect, test, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import {
  actionMenuAlignOptions,
  actionMenuDirectionOptions,
  actionMenuMenuSizeOptions,
  actionMenuSizeOptions,
} from "../src/data/actionmenu-demo";

function actionMenuQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function actionMenuFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/actionmenu/${actionMenuQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="actionmenu"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="actionmenu"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function expectKeyboardMenuButtonContract(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect.poll(() => trigger.getAttribute("aria-haspopup")).toMatch(/^(menu|true)$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");

  await page.keyboard.press("Enter");

  const menu = page.getByRole("menu").first();
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();
  await expect(menu).toHaveAttribute("id", menuId!);
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");
  await expect
    .poll(async () => {
      return menu.evaluate((element) => {
        return element.contains(document.activeElement);
      });
    })
    .toBe(true);

  await page.keyboard.press("Escape");

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "false");
  await expect(trigger).toBeFocused();
}

async function expectOutsidePointerClosesMenu(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Awaited<ReturnType<typeof frameworkPanel>>,
) {
  const trigger = panel.getByRole("button", { name: "More actions" });

  await trigger.click();

  const menu = page.getByRole("menu").first();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /Copy/ })).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");

  await page.mouse.click(8, 8);

  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "false");
}

test.describe("comparison ActionMenu route contract", () => {
  test("ActionMenu route mounts the React and Solid styled references", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    const expectedProps = JSON.stringify({
      size: "M",
      menuSize: "M",
      align: "start",
      direction: "bottom",
      shouldFlip: true,
      isQuiet: false,
      isDisabled: false,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactPanel.getByRole("button", { name: "More actions" })).toBeVisible();
    await expect(solidPanel.getByRole("button", { name: "More actions" })).toBeVisible();
  });

  test("ActionMenu controls match the S2 viewer axes and drive both implementations", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page, {
      size: "XL",
      menuSize: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      isQuiet: true,
      isDisabled: true,
    });

    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionMenuSizeOptions]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("XL");
    await expect(
      page
        .locator('input[name="align"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionMenuAlignOptions]);
    await expect(page.locator('input[name="align"]:checked')).toHaveValue("end");
    await expect(
      page
        .locator('select[name="direction"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...actionMenuDirectionOptions]);
    await expect(page.locator('select[name="direction"]')).toHaveValue("top");
    await expect(
      page
        .locator('input[name="menuSize"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionMenuMenuSizeOptions]);
    await expect(page.locator('input[name="menuSize"]:checked')).toHaveValue("L");
    await expect(page.locator('input[name="shouldFlip"]')).not.toBeChecked();
    await expect(page.locator('input[name="isQuiet"]')).toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).toBeChecked();

    const expectedProps = JSON.stringify({
      size: "XL",
      menuSize: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      isQuiet: true,
      isDisabled: true,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactPanel.getByRole("button", { name: "More actions" })).toBeDisabled();
    await expect(solidPanel.getByRole("button", { name: "More actions" })).toBeDisabled();
  });

  test("ActionMenu item actions fire with matching keys", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await reactPanel.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: /Copy/ }).click();
    await expect(reactRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(reactRoot).toHaveAttribute("data-comparison-last-action", "copy");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem", { name: /Copy/ })).toHaveCount(0);

    await solidPanel.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: /Copy/ }).click();
    await expect(solidRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(solidRoot).toHaveAttribute("data-comparison-last-action", "copy");
  });

  test("ActionMenu keyboard state follows the APG menu-button contract", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectKeyboardMenuButtonContract(page, reactPanel, reactRoot);
    await expectKeyboardMenuButtonContract(page, solidPanel, solidRoot);
  });

  test("ActionMenu outside pointer press closes the open menu", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await actionMenuFixtures(page);

    await expectOutsidePointerClosesMenu(page, reactPanel, reactRoot);
    await expectOutsidePointerClosesMenu(page, solidPanel, solidRoot);
  });
});
