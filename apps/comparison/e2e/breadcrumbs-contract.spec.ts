import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import { breadcrumbsItemSetOptions, breadcrumbsSizeOptions } from "../src/data/breadcrumbs-demo";

function breadcrumbsQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function breadcrumbsFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/breadcrumbs/${breadcrumbsQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="breadcrumbs"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="breadcrumbs"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function visibleBreadcrumbItems(panel: Locator) {
  return panel
    .locator('[aria-label="Project location"]')
    .first()
    .locator("li")
    .evaluateAll((items) =>
      items.map((item) => ({
        text: item.textContent?.trim() ?? "",
        hasMenuButton: item.querySelector('button[aria-label="More items"]') !== null,
      })),
    );
}

test.describe("comparison Breadcrumbs route contract", () => {
  test("Breadcrumbs route mounts the React and Solid styled references", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page);

    const expectedProps = JSON.stringify({
      size: "M",
      itemSet: "standard",
      isDisabled: false,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactRoot).toHaveAttribute("data-comparison-path", "home,breadcrumbs");
    await expect(solidRoot).toHaveAttribute("data-comparison-path", "home,breadcrumbs");
    await expect(reactPanel.getByRole("list", { name: "Project location" })).toBeVisible();
    await expect(solidPanel.getByRole("navigation", { name: "Project location" })).toBeVisible();
  });

  test("Breadcrumbs controls match the S2 size, item-set, and disabled axes", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      size: "L",
      itemSet: "overflow",
      isDisabled: true,
    });

    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...breadcrumbsSizeOptions]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("L");
    await expect(
      page
        .locator('input[name="itemSet"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...breadcrumbsItemSetOptions]);
    await expect(page.locator('input[name="itemSet"]:checked')).toHaveValue("overflow");
    await expect(page.locator('input[name="isDisabled"]')).toBeChecked();

    await expect(reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ size: "L", itemSet: "overflow", isDisabled: true }),
    );
    await expect(solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({ size: "L", itemSet: "overflow", isDisabled: true }),
    );
    await expect(reactPanel.getByRole("button", { name: "More items" })).toBeDisabled();
    await expect(solidPanel.getByRole("button", { name: "More items" })).toBeDisabled();
  });

  test("Breadcrumbs dispatch onAction and truncate the path on both stacks", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      itemSet: "overflow",
    });

    await reactPanel.getByRole("button", { name: "More items" }).click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Projects" }).click();

    await solidPanel.getByRole("button", { name: "More items" }).click();
    await page.getByRole("menu").getByRole("menuitem", { name: "Projects" }).click();

    await expect(reactRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(solidRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(reactRoot).toHaveAttribute("data-comparison-last-action", "projects");
    await expect(solidRoot).toHaveAttribute("data-comparison-last-action", "projects");
    await expect(reactRoot).toHaveAttribute("data-comparison-path", "home,files,projects");
    await expect(solidRoot).toHaveAttribute("data-comparison-path", "home,files,projects");
  });

  test("Breadcrumbs collapse overflow items into a menu on both stacks", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      itemSet: "overflow",
    });

    await expect(reactPanel.getByRole("button", { name: "More items" })).toBeVisible();
    await expect(solidPanel.getByRole("button", { name: "More items" })).toBeVisible();
    await reactPanel.getByRole("button", { name: "More items" }).click();
    await expect(page.getByRole("menu").getByRole("menuitem", { name: "Files" })).toBeVisible();
    await page.getByRole("menu").getByRole("menuitem", { name: "Files" }).click();

    await solidPanel.getByRole("button", { name: "More items" }).click();
    await expect(page.getByRole("menu").getByRole("menuitem", { name: "Files" })).toBeVisible();
    await page.getByRole("menu").getByRole("menuitem", { name: "Files" }).click();

    await expect(reactRoot).toHaveAttribute("data-comparison-last-action", "files");
    await expect(solidRoot).toHaveAttribute("data-comparison-last-action", "files");
    await expect(reactRoot).toHaveAttribute("data-comparison-path", "home,files");
    await expect(solidRoot).toHaveAttribute("data-comparison-path", "home,files");
  });

  test("Breadcrumbs responsive overflow measurement matches React Spectrum", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await breadcrumbsFixtures(page, {
      itemSet: "overflow",
    });

    await expect(reactPanel.getByRole("button", { name: "More items" })).toBeVisible();
    await expect(solidPanel.getByRole("button", { name: "More items" })).toBeVisible();

    await reactRoot.evaluate((element) => {
      (element as HTMLElement).style.inlineSize = "100px";
    });
    await solidRoot.evaluate((element) => {
      (element as HTMLElement).style.inlineSize = "100px";
    });

    const expectedNarrowItems = [
      { text: "Home", hasMenuButton: false },
      { text: "", hasMenuButton: true },
      { text: "Annual report", hasMenuButton: false },
    ];

    await expect
      .poll(async () => ({
        react: await visibleBreadcrumbItems(reactPanel),
        solid: await visibleBreadcrumbItems(solidPanel),
      }))
      .toEqual({
        react: expectedNarrowItems,
        solid: expectedNarrowItems,
      });
  });
});
