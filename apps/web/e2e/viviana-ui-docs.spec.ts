import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

/**
 * Pins the VIVIANA UI docs entry: header, landing CTA, and showcase brand must
 * open `/viviana-ui/docs`, not `/showcase`. The sidebar must list the shrunk
 * tree (Getting Started, Installation, Button, two hooks) plus Playground and
 * the API reference. Listed in `a11y:smoke` so `ci:site` actually runs it.
 */

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
}

function linkByHref(href: string) {
  return `a[href="${href}"]`;
}

test.describe("Viviana UI docs entry", () => {
  test("header viviana-ui opens /viviana-ui/docs, not /showcase", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    const nav = page
      .locator("header nav")
      .filter({ has: page.getByRole("link", { name: "viviana-ui", exact: true }) });
    const link = nav.getByRole("link", { name: "viviana-ui", exact: true });

    await expect(link).toHaveAttribute("href", routes.vivianaUiDocs);
    await expect(link).not.toHaveAttribute("href", "/showcase");
  });

  test("landing CTA reads Read docs → and opens /viviana-ui/docs", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    const card = page.locator(".pv-register-card").filter({ hasText: "@proyecto-viviana/ui" });
    const cta = card.getByRole("link", { name: "Read docs →" });

    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", routes.vivianaUiDocs);
    await expect(cta).not.toHaveAttribute("href", "/showcase");
  });

  test("showcase brand Viviana UI opens /viviana-ui/docs", async ({ page }) => {
    await page.goto("/showcase");
    await waitForPageReady(page);

    const brand = page.locator("a.gls-brand");
    await expect(brand).toHaveText("Viviana UI");
    await expect(brand).toHaveAttribute("href", routes.vivianaUiDocs);
    await expect(brand).not.toHaveAttribute("href", "/showcase");
  });

  test("docs sidebar lists Getting Started, Installation, Button, hooks, Playground, and API", async ({
    page,
  }) => {
    await page.goto(routes.vivianaUiDocs);
    await waitForPageReady(page);

    const sidebar = page
      .locator("nav")
      .filter({ has: page.locator(linkByHref(routes.vivianaUiDocsComponent("button"))) })
      .first();

    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Getting Started" })).toHaveAttribute(
      "href",
      routes.vivianaUiDocs,
    );
    await expect(sidebar.getByRole("link", { name: "Installation" })).toHaveAttribute(
      "href",
      `${routes.vivianaUiDocs}/installation`,
    );
    await expect(
      sidebar.locator(linkByHref(routes.vivianaUiDocsComponent("button"))),
    ).toBeVisible();
    await expect(
      sidebar.locator(linkByHref(routes.vivianaUiDocsHook("create-button"))),
    ).toBeVisible();
    await expect(
      sidebar.locator(linkByHref(routes.vivianaUiDocsHook("create-press"))),
    ).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Open Playground" })).toHaveAttribute(
      "href",
      "/showcase",
    );
    await expect(sidebar.getByRole("link", { name: "API reference" })).toHaveAttribute(
      "href",
      routes.apiReference,
    );
  });
});
