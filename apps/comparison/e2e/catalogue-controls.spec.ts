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

    const docsLayout = page.locator(".s2-layout");
    await expect(docsLayout).toHaveCount(1);
    await expect
      .poll(() =>
        docsLayout.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--comparison-docs-layout-macro").trim(),
        ),
      )
      .toBe("1");

    const macroStyledTopbar = topbarMount.locator(".s2-topbar");
    await expect(macroStyledTopbar).toHaveCount(1);
    await expect
      .poll(() =>
        macroStyledTopbar.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--comparison-docs-topbar-macro").trim(),
        ),
      )
      .toBe("1");

    await expect(page.getByRole("link", { name: "Solid Spectrum home" })).toHaveAttribute(
      "href",
      "/",
    );
    const searchButton = page.getByRole("button", { name: "Search Solid Spectrum" });
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toHaveAttribute("aria-expanded", "false");
    await searchButton.click();

    const searchDialog = page.getByRole("dialog", { name: "Search" });
    await expect(searchDialog).toBeVisible();
    await expect(searchButton).toHaveAttribute("aria-expanded", "true");
    const chromeSearch = searchDialog.getByRole("searchbox", { name: "Search components" });
    await chromeSearch.fill("Accordion");
    await expect(searchDialog.getByRole("link", { name: /Accordion/ })).toHaveAttribute(
      "href",
      "/components/accordion",
    );
    await page.keyboard.press("Escape");
    await expect(searchDialog).toHaveCount(0);

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

    const macroStyledToc = tocMount.locator(".s2-docs-toc");
    await expect(macroStyledToc).toHaveCount(1);
    await expect
      .poll(() =>
        macroStyledToc.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--comparison-docs-toc-macro").trim(),
        ),
      )
      .toBe("1");

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

  test("hydrates the catalogue overview chrome", async ({ page }) => {
    await page.goto("/");

    const overviewMount = page.locator(".js-catalogue-overview-mount");
    await expect(overviewMount).toHaveAttribute("data-mounted", "true");
    await expect(overviewMount.locator("[data-catalogue-overview-fallback]")).toHaveCount(0);

    const accordionRow = overviewMount.locator("[data-entry-card][data-title='Accordion']");
    await expect(accordionRow).toBeVisible();
    await expect(accordionRow).toHaveAttribute("href", "/components/accordion");
    await expect(overviewMount.getByRole("searchbox", { name: "Search" })).toBeVisible();
    await expect(overviewMount.getByRole("button", { name: "All Parity" })).toBeVisible();
    await expect(overviewMount.getByRole("button", { name: "All Status" })).toBeVisible();
    await expect(overviewMount.getByRole("button", { name: "Docs order Sort" })).toBeVisible();
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
    const themeToggle = page.locator("[data-theme-toggle]");
    await expect(themeToggle).toHaveAttribute("aria-label", /Using system (light|dark) mode/);
    await themeToggle.click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("[data-theme-toggle-icon]")).toHaveText("Light");
    await expect(themeToggle).toHaveAttribute("aria-label", "Using light mode (press to switch)");
    await themeToggle.click();
    await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("[data-theme-toggle-icon]")).toHaveText("Dark");
    await expect(themeToggle).toHaveAttribute("aria-label", "Using dark mode (press to switch)");
  });
});
