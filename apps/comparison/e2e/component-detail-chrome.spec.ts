import { expect, test } from "@playwright/test";
import { waitForComparisonRouteReady } from "./comparison-page";

const S2_PRIMARY_FONT_PRELOAD_URL =
  "https://use.typekit.net/af/ca4cba/0000000000000000775c55a1/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n1&v=3";

interface RenderSample {
  body: boolean;
  bodyBackground?: string;
  bodyColorScheme?: string;
  bodyFontFamily?: string;
  documentResolvedTheme?: string;
  documentTheme?: string;
  label: string;
  mainBackground?: string;
  resolvedTheme?: string;
  theme?: string;
}

interface LayoutShiftSample {
  hadRecentInput: boolean;
  value: number;
}

declare global {
  interface Window {
    __comparisonLayoutShifts?: LayoutShiftSample[];
    __comparisonRenderSamples?: RenderSample[];
  }
}

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

    const docsNav = page.getByRole("navigation", { name: "Components" });
    // Sidebar is a flat list aligned with the upstream S2 docs (no "Components"
    // disclosure button); the nav is identified by its aria-label above.
    await expect(docsNav.getByRole("link", { name: "Accordion" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(docsNav.getByRole("link", { name: "ActionBar" })).toBeVisible();
    await expect(docsNav.getByText("Overview", { exact: true })).toHaveCount(0);
    await expect(docsNav.getByText("Navigation & Structure", { exact: true })).toHaveCount(0);
    await expect(docsNav.getByText("Visual parity", { exact: true })).toHaveCount(0);

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

  test("applies the saved theme before first render and keeps examples stable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addInitScript(() => {
      window.localStorage.setItem("solid-spectrum-theme", "dark");
      window.__comparisonRenderSamples = [];
      window.__comparisonLayoutShifts = [];

      const sample = (label: string) => {
        const body = document.body;

        if (!body) {
          window.__comparisonRenderSamples?.push({ body: false, label });
          return;
        }

        const main = document.querySelector(".s2-main");
        const bodyStyle = getComputedStyle(body);
        const mainStyle = main ? getComputedStyle(main) : undefined;

        window.__comparisonRenderSamples?.push({
          body: true,
          bodyBackground: bodyStyle.backgroundColor,
          bodyColorScheme: bodyStyle.colorScheme,
          bodyFontFamily: bodyStyle.fontFamily,
          documentResolvedTheme: document.documentElement.dataset.resolvedTheme,
          documentTheme: document.documentElement.dataset.theme,
          label,
          mainBackground: mainStyle?.backgroundColor,
          resolvedTheme: body.dataset.resolvedTheme,
          theme: body.dataset.theme,
        });
      };

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            window.__comparisonLayoutShifts?.push({
              hadRecentInput: layoutShift.hadRecentInput,
              value: layoutShift.value,
            });
          }
        }).observe({ buffered: true, type: "layout-shift" });
      } catch {
        // The first-render theme assertion still covers browsers without Layout Instability API.
      }

      sample("init");
      document.addEventListener("DOMContentLoaded", () => sample("domcontentloaded"), {
        once: true,
      });
      window.addEventListener("load", () => sample("load"), { once: true });
      requestAnimationFrame(() => {
        sample("raf1");
        requestAnimationFrame(() => {
          sample("raf2");
          setTimeout(() => sample("timeout250"), 250);
        });
      });
    });
    await page.goto("/components/accordion/", { waitUntil: "load" });
    await page.waitForTimeout(350);

    const primaryFontPreload = await page.evaluate((href) => {
      const links = Array.from(
        document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]'),
      );
      const match = links.find((link) => link.href === href);

      return match
        ? {
            crossorigin: match.getAttribute("crossorigin"),
            href: match.href,
            type: match.type,
          }
        : null;
    }, S2_PRIMARY_FONT_PRELOAD_URL);
    const renderState = await page.evaluate(() => ({
      layoutShifts: window.__comparisonLayoutShifts ?? [],
      samples: window.__comparisonRenderSamples ?? [],
    }));
    const firstBodySample = renderState.samples.find((sample) => sample.body);
    const firstMainSample = renderState.samples.find(
      (sample) => sample.body && sample.mainBackground,
    );

    expect(firstBodySample).toMatchObject({
      bodyBackground: "rgb(27, 27, 27)",
      bodyColorScheme: "dark",
      bodyFontFamily:
        "adobe-clean-spectrum-vf, adobe-clean-variable, adobe-clean, ui-sans-serif, system-ui, sans-serif",
      documentResolvedTheme: "dark",
      documentTheme: "dark",
    });
    expect(primaryFontPreload).toEqual({
      crossorigin: "",
      href: S2_PRIMARY_FONT_PRELOAD_URL,
      type: "font/woff2",
    });
    expect(firstMainSample).toMatchObject({
      mainBackground: "rgb(17, 17, 17)",
    });
    expect(
      renderState.layoutShifts.filter((shift) => !shift.hadRecentInput && shift.value > 0),
    ).toEqual([]);
  });
});
