import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "./comparison-page";

test.describe("comparison component detail chrome", () => {
  test("hydrates the detail page Solid Spectrum surfaces", async ({ page }) => {
    await page.goto("/components/accordion/");
    await waitForComparisonRouteReady(page);

    const heroMount = page.locator(".js-component-detail-hero-mount");
    await expect(heroMount).toHaveAttribute("data-mounted", "true");
    await expect(heroMount.locator("[data-component-detail-hero-fallback]")).toHaveCount(0);
    await expect(heroMount.getByRole("heading", { level: 1, name: "Accordion" })).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Top navigation" })
        .getByRole("link", { name: "React Spectrum" }),
    ).toHaveAttribute("href", /react-spectrum/);

    const tocRail = page.locator(".s2-docs-toc-rail");
    await expect(tocRail).toBeVisible();
    await expect
      .poll(() =>
        tocRail.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--comparison-docs-toc-rail-macro").trim(),
        ),
      )
      .toBe("1");
    const toc = page.getByRole("navigation", { name: "On this page" });
    await expect(toc.getByRole("listitem")).toHaveCount(8);
    await expect(toc.getByRole("link", { name: "Accordion" })).toHaveAttribute(
      "href",
      "#page-title",
    );
    await expect(toc.getByRole("link", { name: "Accordion" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(toc.getByRole("link", { name: "Example" })).toHaveAttribute("href", "#example");
    await expect(tocRail.getByRole("link", { name: "S2 source" })).toHaveAttribute(
      "href",
      /react-spectrum/,
    );

    const exampleMount = page.locator(".js-component-example-section-mount");
    await expect(exampleMount).toHaveAttribute("data-mounted", "true");
    await expect(exampleMount).toHaveAttribute("data-controls-mounted", "true");
    await expect(exampleMount).toHaveAttribute("data-islands-mounted", "true");
    await expect(exampleMount.locator("[data-component-example-section-fallback]")).toHaveCount(0);
    await expect(exampleMount.locator("[data-component-example-controls-fallback]")).toHaveCount(0);
    await expect(exampleMount.locator("[data-component-example-preview-fallback]")).toHaveCount(0);
    await expect(exampleMount.getByRole("heading", { level: 2, name: "Example" })).toBeVisible();
    await expect(exampleMount.locator('form[data-comparison-controls="accordion"]')).toBeVisible();
    await expect(exampleMount.getByRole("radiogroup", { name: "size" })).toBeVisible();
    await expect(exampleMount.getByRole("switch", { name: "isQuiet" })).toBeVisible();

    const metaMount = page.locator(".js-component-detail-meta-mount");
    await expect(metaMount).toHaveAttribute("data-mounted", "true");
    await expect(metaMount.locator("[data-component-detail-meta-fallback]")).toHaveCount(0);
    await expect(
      metaMount.getByRole("heading", { exact: true, level: 2, name: "Coverage" }),
    ).toBeVisible();
    await expect(
      metaMount.getByRole("heading", { level: 2, name: "Visual State Coverage" }),
    ).toBeVisible();
    await expect(metaMount.getByRole("table", { name: "Accordion API props" })).toBeVisible();
  });
});
