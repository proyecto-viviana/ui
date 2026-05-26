import { expect, test, type Page } from "@playwright/test";

async function selectPickerOption(page: Page, label: string, option: string) {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: option }).click();
}

test.describe("comparison catalogue controls", () => {
  test("filters by search text and reports visible count", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("searchbox", { name: "Search" }).fill("Accordion");

    const visibleCards = page.locator("[data-entry-card]:not([hidden])");
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toHaveAttribute("data-title", "Accordion");
    await expect(page.locator("[data-result-count]")).toHaveText("1 component");
  });

  test("sorts visible entries by component name", async ({ page }) => {
    await page.goto("/");

    await selectPickerOption(page, "Sort", "Name");

    const titles = await page
      .locator("[data-entry-card]:not([hidden]) .s2-component-name")
      .allTextContents();
    const firstTen = titles.slice(0, 10);
    const sortedFirstTen = [...firstTen].sort((a, b) => a.localeCompare(b));

    expect(firstTen.length).toBeGreaterThan(0);
    expect(firstTen).toEqual(sortedFirstTen);
  });

  test("switches the docs theme", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("body")).toHaveAttribute("data-theme", "system");
    await page.getByRole("button", { name: "Switch color theme" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Switch color theme" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
  });
});
