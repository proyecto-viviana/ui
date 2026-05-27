import { expect, test, type Page } from "@playwright/test";

async function selectPickerOption(page: Page, label: string, option: string) {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: option }).click();
}

test.describe("comparison catalogue controls", () => {
  test("hydrates the topbar chrome", async ({ page }) => {
    await page.goto("/");

    const topbarMount = page.locator(".js-docs-topbar-mount");
    await expect(topbarMount).toHaveAttribute("data-mounted", "true");
    await expect(topbarMount.locator("[data-docs-topbar-fallback]")).toHaveCount(0);

    await expect(page.getByRole("link", { name: "Solid Spectrum home" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(page.getByRole("button", { name: "Search Solid Spectrum" })).toBeVisible();

    const topnav = page.getByRole("navigation", { name: "Top navigation" });
    await expect(topnav.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/");
    await expect(topnav.getByRole("link", { name: "npm" })).toHaveAttribute(
      "href",
      "https://www.npmjs.com/package/@proyecto-viviana/solid-spectrum",
    );
  });

  test("hydrates the table of contents chrome", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const tocMount = page.locator(".js-docs-toc-mount");
    await expect(tocMount).toHaveAttribute("data-mounted", "true");
    await expect(tocMount.locator("[data-docs-toc-fallback]")).toHaveCount(0);

    const toc = page.getByRole("navigation", { name: "On this page" });
    await expect(toc.getByRole("link", { name: "Solid Spectrum" })).toHaveAttribute(
      "href",
      "#page-title",
    );
    await expect(toc.getByRole("link", { name: "Catalogue controls" })).toHaveAttribute(
      "href",
      "#coverage-title",
    );
    await expect(toc.getByRole("link", { name: "Components" })).toHaveAttribute(
      "href",
      "#components-title",
    );
    await expect(toc.getByRole("link", { name: "S2 source" })).toHaveAttribute(
      "href",
      /react-spectrum/,
    );
  });

  test("filters by search text and reports visible count", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".js-index-hero-mount[data-mounted='true']")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Solid Spectrum" })).toBeVisible();

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
    await expect(page.locator("[data-theme-toggle-icon]")).toHaveText("System");
    await page.getByRole("button", { name: "Switch color theme" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("[data-theme-toggle-icon]")).toHaveText("Light");
    await page.getByRole("button", { name: "Switch color theme" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("[data-theme-toggle-icon]")).toHaveText("Dark");
  });
});
