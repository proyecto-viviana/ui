import { expect, test } from "@playwright/test";
import {
  comparisonCoveragePath,
  comparisonInternalRobots,
  comparisonSiteDescription,
} from "../src/data/site-meta";
import { waitForComparisonRouteReady } from "./comparison-page";

test.describe("comparison site chrome", () => {
  test("landing describes a parity harness and has a document description", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Solid Spectrum");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      comparisonSiteDescription,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spectrum 2, made for Solid.");
    await expect(page.getByRole("main")).toContainText("parity harness");
    const browse = page.getByRole("link", { name: "Browse components" });
    await expect(browse).toHaveCount(2);
    await expect(browse.first()).toHaveAttribute("href", comparisonCoveragePath);
    await expect(browse.nth(1)).toHaveAttribute("href", comparisonCoveragePath);
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  test("coverage names the catalogue", async ({ page }) => {
    await page.goto(comparisonCoveragePath);
    await expect(page).toHaveTitle("Coverage | Solid Spectrum");
    await expect(page.getByRole("heading", { level: 1, name: "Solid Spectrum" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Top navigation" }).getByRole("link", { name: "Docs" }),
    ).toHaveAttribute("href", comparisonCoveragePath);
  });

  test("the not-found page is in the static tree", async ({ page }) => {
    // Astro preview SPA-falls unknown paths to `/`. Production wrangler serves
    // this file as HTTP 404 via not_found_handling: "404-page".
    const response = await page.goto("/404.html");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse components" })).toHaveAttribute(
      "href",
      comparisonCoveragePath,
    );
  });

  test("robots.txt allows the catalogue and hides internal routes", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const body = (await response?.text()) ?? "";
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /astro-smoke");
    expect(body).toContain("Disallow: /d12");
    expect(body).toContain("Disallow: /experiments");
    expect(body).toContain("Disallow: /keyboard-shortcuts");
  });

  test("internal harness routes are noindex", async ({ page }) => {
    await page.goto("/keyboard-shortcuts/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      comparisonInternalRobots,
    );

    await page.goto("/d12/button/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      comparisonInternalRobots,
    );
  });

  test("catalogue hrefs use trailing slashes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Browse components" }).first()).toHaveAttribute(
      "href",
      comparisonCoveragePath,
    );
    await page.goto(comparisonCoveragePath);
    await expect(
      page
        .locator("[data-entry-card][data-title='Accordion'], a[href='/components/accordion/']")
        .first(),
    ).toHaveAttribute("href", "/components/accordion/");
  });

  test("a live component route still mounts both panels", async ({ page }) => {
    await page.goto("/components/button/");
    await waitForComparisonRouteReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
  });
});
