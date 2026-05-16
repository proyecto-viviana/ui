import { expect, test, type Locator, type Page } from "@playwright/test";
import { actionBarSelectedItemCountOptions } from "../src/data/actionbar-demo";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";

function actionBarQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function actionBarFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/actionbar/${actionBarQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="actionbar"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="actionbar"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactRoot, solidRoot };
}

async function expectActionBarVisible(root: Locator, count: string) {
  await expect(root).toHaveAttribute("data-comparison-selected-count", count);
  await expect(root.getByRole("toolbar")).toBeVisible();
  await expect(root.getByRole("button", { name: "Clear selection" })).toBeVisible();
  await expect(root.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(root.getByRole("button", { name: "Copy" })).toBeVisible();
  await expect(root.getByRole("button", { name: "Delete" })).toBeVisible();
}

test.describe("comparison ActionBar route contract", () => {
  test("ActionBar route mounts React and Solid styled references", async ({ page }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page);
    const expectedProps = JSON.stringify({
      selectedItemCount: 3,
      isEmphasized: false,
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-control-props", expectedProps);
      await expectActionBarVisible(root, "3");
      await expect(root).toHaveAttribute("data-comparison-clear-count", "0");
      await expect(root).toHaveAttribute("data-comparison-action-count", "0");
    }
  });

  test("ActionBar controls drive selected count and emphasis into both stacks", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page, {
      selectedItemCount: "all",
      isEmphasized: true,
    });

    await expect(
      page
        .locator('input[name="selectedItemCount"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...actionBarSelectedItemCountOptions]);
    await expect(page.locator('input[name="selectedItemCount"]:checked')).toHaveValue("all");
    await expect(page.locator('input[name="isEmphasized"]')).toBeChecked();

    const expectedProps = JSON.stringify({
      selectedItemCount: "all",
      isEmphasized: true,
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-control-props", expectedProps);
      await expectActionBarVisible(root, "all");
    }
  });

  test("ActionBar hides when selected count is zero", async ({ page }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page, {
      selectedItemCount: "0",
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-selected-count", "0");
      await expect(root.getByRole("toolbar")).toHaveCount(0);
      await expect(root.getByRole("button", { name: "Clear selection" })).toHaveCount(0);
    }
  });

  test("ActionBar clear selection and child actions update both stacks", async ({ page }) => {
    const { reactRoot, solidRoot } = await actionBarFixtures(page);

    for (const root of [reactRoot, solidRoot]) {
      await root.getByRole("button", { name: "Edit" }).click();
      await expect(root).toHaveAttribute("data-comparison-action-count", "1");

      await root.getByRole("button", { name: "Clear selection" }).click();
      await expect(root).toHaveAttribute("data-comparison-clear-count", "1");
      await expect(root).toHaveAttribute("data-comparison-selected-count", "0");
      await expect(root.getByRole("toolbar")).toHaveCount(0);
    }
  });
});
