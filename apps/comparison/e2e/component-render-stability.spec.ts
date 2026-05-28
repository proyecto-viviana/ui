import { expect, test, type Page } from "@playwright/test";
import { reactSpectrumCatalogue } from "../src/data/react-spectrum-catalogue";

const S2_PRIMARY_FONT_PRELOAD_URL =
  "https://use.typekit.net/af/ca4cba/0000000000000000775c55a1/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n1&v=3";
const S2_SANS_FONT_STACK =
  "adobe-clean-spectrum-vf, adobe-clean-variable, adobe-clean, ui-sans-serif, system-ui, sans-serif";

interface RenderSample {
  body: boolean;
  bodyBackground?: string;
  bodyColorScheme?: string;
  bodyFontFamily?: string;
  bodyResolvedTheme?: string;
  bodyTheme?: string;
  documentResolvedTheme?: string;
  documentTheme?: string;
  label: string;
  mainBackground?: string;
}

interface LayoutShiftSourceSample {
  currentRect: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  node?: {
    className: string;
    id: string;
    tagName: string;
    textContent: string;
  };
  previousRect: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
}

interface LayoutShiftSample {
  hadRecentInput: boolean;
  sources: LayoutShiftSourceSample[];
  value: number;
}

interface FontFaceSample {
  family: string;
  status: FontFace["status"];
  style: string;
  weight: string;
}

declare global {
  interface Window {
    __comparisonLayoutShifts?: LayoutShiftSample[];
    __comparisonRenderSamples?: RenderSample[];
    __comparisonSampleRender?: (label: string) => void;
  }
}

async function installFirstRenderProbe(page: Page) {
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
        bodyResolvedTheme: body.dataset.resolvedTheme,
        bodyTheme: body.dataset.theme,
        documentResolvedTheme: document.documentElement.dataset.resolvedTheme,
        documentTheme: document.documentElement.dataset.theme,
        label,
        mainBackground: mainStyle?.backgroundColor,
      });
    };

    window.__comparisonSampleRender = sample;

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            sources?: {
              currentRect: DOMRectReadOnly;
              node?: Node;
              previousRect: DOMRectReadOnly;
            }[];
            value: number;
          };
          window.__comparisonLayoutShifts?.push({
            hadRecentInput: layoutShift.hadRecentInput,
            sources: (layoutShift.sources ?? []).map((source) => {
              const element = source.node instanceof HTMLElement ? source.node : undefined;

              return {
                currentRect: {
                  height: source.currentRect.height,
                  width: source.currentRect.width,
                  x: source.currentRect.x,
                  y: source.currentRect.y,
                },
                node: element
                  ? {
                      className: element.className,
                      id: element.id,
                      tagName: element.tagName,
                      textContent: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 120),
                    }
                  : undefined,
                previousRect: {
                  height: source.previousRect.height,
                  width: source.previousRect.width,
                  x: source.previousRect.x,
                  y: source.previousRect.y,
                },
              };
            }),
            value: layoutShift.value,
          });
        }
      }).observe({ buffered: true, type: "layout-shift" });
    } catch {
      // Theme and font assertions still cover older browsers without Layout Instability API.
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
}

async function collectFirstRenderState(page: Page) {
  await page.evaluate(() => window.__comparisonSampleRender?.("after-hydration"));
  await page.waitForTimeout(250);
  await page.evaluate(() => window.__comparisonSampleRender?.("after-stable"));

  return page.evaluate((href) => {
    const fontPreload = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]'),
    ).find((link) => link.href === href);

    return {
      fontFaces: Array.from(document.fonts)
        .filter((fontFace) => fontFace.family === "adobe-clean-spectrum-vf")
        .map(
          (fontFace): FontFaceSample => ({
            family: fontFace.family,
            status: fontFace.status,
            style: fontFace.style,
            weight: fontFace.weight,
          }),
        ),
      fontPreload: fontPreload
        ? {
            crossorigin: fontPreload.getAttribute("crossorigin"),
            href: fontPreload.href,
            type: fontPreload.type,
          }
        : null,
      layoutShifts: window.__comparisonLayoutShifts ?? [],
      samples: window.__comparisonRenderSamples ?? [],
    };
  }, S2_PRIMARY_FONT_PRELOAD_URL);
}

test.describe("comparison component render stability", () => {
  for (const item of reactSpectrumCatalogue) {
    test(`${item.title} keeps first-render chrome stable`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await installFirstRenderProbe(page);
      await page.goto(`/components/${item.slug}/`, { waitUntil: "load" });
      await expect(page.locator("astro-island")).toHaveCount(0);
      await expect(page.locator(".js-component-example-section-mount")).toHaveAttribute(
        "data-mounted",
        "true",
      );
      await expect(page.locator(".js-component-example-section-mount")).toHaveAttribute(
        "data-islands-mounted",
        "true",
      );

      const state = await collectFirstRenderState(page);
      const bodySamples = state.samples.filter((sample) => sample.body);
      const firstBodySample = bodySamples[0];
      const mainSamples = bodySamples.filter((sample) => sample.mainBackground);

      expect(firstBodySample).toMatchObject({
        bodyBackground: "rgb(27, 27, 27)",
        bodyColorScheme: "dark",
        bodyFontFamily: S2_SANS_FONT_STACK,
        bodyResolvedTheme: "dark",
        bodyTheme: "dark",
        documentResolvedTheme: "dark",
        documentTheme: "dark",
      });
      expect(bodySamples.every((sample) => sample.bodyFontFamily === S2_SANS_FONT_STACK)).toBe(
        true,
      );
      expect(
        bodySamples.every(
          (sample) =>
            sample.bodyBackground === "rgb(27, 27, 27)" &&
            sample.bodyColorScheme === "dark" &&
            sample.bodyResolvedTheme === "dark" &&
            sample.bodyTheme === "dark" &&
            sample.documentResolvedTheme === "dark" &&
            sample.documentTheme === "dark",
        ),
      ).toBe(true);
      expect(mainSamples.every((sample) => sample.mainBackground === "rgb(17, 17, 17)")).toBe(true);
      expect(state.fontPreload).toEqual({
        crossorigin: "",
        href: S2_PRIMARY_FONT_PRELOAD_URL,
        type: "font/woff2",
      });
      expect(state.fontFaces).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            family: "adobe-clean-spectrum-vf",
            style: "normal",
            weight: "100 900",
          }),
        ]),
      );
      expect(
        state.layoutShifts.filter((shift) => !shift.hadRecentInput && shift.value > 0),
      ).toEqual([]);
    });
  }
});
