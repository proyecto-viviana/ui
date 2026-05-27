import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "./comparison-page";

test.describe("comparison component detail chrome", () => {
  test("hydrates the detail page Solid Spectrum surfaces", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
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
    await expect(page.locator(".s2-brand-text")).toBeVisible();

    const main = page.locator(".s2-main");
    await expect
      .poll(() =>
        main.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--comparison-docs-main-macro").trim(),
        ),
      )
      .toBe("1");
    await expect
      .poll(() =>
        main.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            columnGap: style.columnGap,
            height: Math.round(element.getBoundingClientRect().height),
            paddingTop: style.paddingTop,
          };
        }),
      )
      .toEqual({ columnGap: "40px", height: 648, paddingTop: "40px" });

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
    await expect
      .poll(() =>
        exampleMount
          .locator('[data-control-name="allowsMultipleExpanded"] .s2-control-label')
          .evaluate((label) => {
            const text = label.querySelector(".s2-control-label-text")?.getBoundingClientRect();
            const help = label
              .querySelector(".s2-control-contextual-help")
              ?.getBoundingClientRect();

            if (!text || !help) {
              return false;
            }

            return (
              text.right <= help.left ||
              text.left >= help.right ||
              text.bottom <= help.top ||
              text.top >= help.bottom
            );
          }),
      )
      .toBe(true);

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

  test("matches the upstream mobile header and body chrome", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/components/accordion/");
    await waitForComparisonRouteReady(page);

    await expect(page.locator(".s2-sidebar")).toBeHidden();
    await expect(page.locator(".s2-docs-toc-rail")).toBeHidden();

    const main = page.locator(".s2-main");
    await expect
      .poll(() =>
        main.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            boxShadow: style.boxShadow,
            display: style.display,
            paddingTop: style.paddingTop,
            radius: style.borderTopLeftRadius,
          };
        }),
      )
      .toEqual({
        boxShadow: "none",
        display: "grid",
        paddingTop: "12px",
        radius: "0px",
      });

    const mobileToc = page.locator("[data-mobile-docs-toc]");
    await expect(mobileToc).toBeVisible();
    await expect(page.locator(".s2-brand-text")).toBeHidden();
    await expect(mobileToc.getByRole("button", { name: "Table of contents" })).toContainText(
      "Accordion",
    );
    await expect
      .poll(() =>
        mobileToc.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--comparison-docs-mobile-toc-macro").trim(),
        ),
      )
      .toBe("1");

    const tocButton = mobileToc.getByRole("button", { name: "Table of contents" });
    await expect(tocButton).toBeVisible();
    await tocButton.click();

    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole("option", { name: "Accordion" })).toBeVisible();
    await expect(listbox.getByRole("option", { name: "API" })).toBeVisible();
    await listbox.getByRole("option", { name: "API" }).click();
    await expect(page).toHaveURL(/#api$/);
  });

  test("resolves macro-owned page chrome against the dark color scheme", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addInitScript(() => {
      window.localStorage.setItem("solid-spectrum-theme", "dark");
    });
    await page.goto("/components/accordion/");
    await waitForComparisonRouteReady(page);

    const main = page.locator(".s2-main");
    await expect
      .poll(() =>
        main.evaluate((element) => {
          const bodyStyle = getComputedStyle(document.body);
          const mainStyle = getComputedStyle(element);

          return {
            bodyColorScheme: bodyStyle.colorScheme,
            bodyResolvedTheme: document.body.dataset.resolvedTheme,
            mainBackground: mainStyle.backgroundColor,
          };
        }),
      )
      .toEqual({
        bodyColorScheme: "dark",
        bodyResolvedTheme: "dark",
        mainBackground: "rgb(17, 17, 17)",
      });
  });
});
