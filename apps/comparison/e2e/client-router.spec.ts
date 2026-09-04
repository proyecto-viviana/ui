import { expect, test, type Page, type Request } from "@playwright/test";
import { waitForComparisonRouteReady } from "./comparison-page";

const TABLEVIEW = "/components/tableview/";
const BUTTON = "/components/button/";

function componentIndexPath(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  return /^\/components\/[^/]+\/$/.test(parsed.pathname) ? parsed.pathname : null;
}

function isChromeCssUrl(url: string): boolean {
  return (
    url.includes("virtual:comparison-chrome.css") ||
    url.includes("comparison-chrome.css") ||
    /\/comparison-chrome[\w.-]*\.css(?:\?|$)/.test(url)
  );
}

function isDocumentLike(request: Request): boolean {
  const resourceType = request.resourceType();
  return (
    resourceType === "document" ||
    resourceType === "other" ||
    resourceType === "prefetch" ||
    resourceType === "fetch" ||
    resourceType === "xhr"
  );
}

async function docsNavLink(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Components" })
    .getByRole("link", { name, exact: true });
}

test.describe("comparison ClientRouter", () => {
  test.describe.configure({ timeout: 180_000 });

  test("hover prefetches the next slug HTML, click-nav stays one document, and islands remount", async ({
    page,
  }) => {
    const hoverComponentPaths = new Set<string>();
    const clickChromeCss: string[] = [];
    const clickUrls: string[] = [];
    let recordingHover = false;
    let recordingClick = false;

    page.on("request", (request) => {
      const url = request.url();
      if (recordingHover && isDocumentLike(request)) {
        const path = componentIndexPath(url);
        if (path && path !== TABLEVIEW) {
          hoverComponentPaths.add(path);
        }
      }
      if (recordingClick) {
        clickUrls.push(url);
        if (isChromeCssUrl(url)) {
          clickChromeCss.push(url);
        }
      }
    });

    await page.goto(TABLEVIEW);
    await waitForComparisonRouteReady(page);

    await expect(page.locator('meta[name="astro-view-transitions-enabled"]')).toHaveAttribute(
      "content",
      "true",
    );
    await expect
      .poll(() => page.evaluate(() => performance.getEntriesByType("navigation").length))
      .toBe(1);

    const buttonLink = await docsNavLink(page, "Button");
    await expect(buttonLink).toHaveAttribute("data-astro-prefetch", "hover");

    recordingHover = true;
    await buttonLink.hover();
    await expect.poll(() => hoverComponentPaths.has(BUTTON)).toBe(true);
    recordingHover = false;

    expect([...hoverComponentPaths]).toEqual([BUTTON]);

    await page.evaluate(() => {
      const seq: Array<string | null> = [];
      const record = () => {
        const mount = document.querySelector(".js-component-example-section-mount");
        seq.push(mount?.getAttribute("data-islands-mounted") ?? null);
      };
      (
        window as unknown as { __comparisonIslandsSeq: Array<string | null> }
      ).__comparisonIslandsSeq = seq;
      document.addEventListener("astro:after-swap", () => {
        record();
        const mount = document.querySelector(".js-component-example-section-mount");
        if (!(mount instanceof HTMLElement)) {
          return;
        }
        new MutationObserver(record).observe(mount, {
          attributes: true,
          attributeFilter: ["data-islands-mounted"],
        });
      });
    });

    recordingClick = true;
    await buttonLink.click();
    await expect(page).toHaveURL(/\/components\/button\/$/);
    await waitForComparisonRouteReady(page);
    recordingClick = false;

    await expect
      .poll(() => page.evaluate(() => performance.getEntriesByType("navigation").length))
      .toBe(1);
    await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();

    const islandsSeq = await page.evaluate(
      () =>
        (window as unknown as { __comparisonIslandsSeq?: Array<string | null> })
          .__comparisonIslandsSeq ?? [],
    );
    expect(islandsSeq.some((value) => value !== "true")).toBe(true);
    expect(islandsSeq.at(-1) === "true" || islandsSeq.includes("true")).toBe(true);

    expect(clickChromeCss).toEqual([]);

    const modulePreloadCount = await page.locator('link[rel="modulepreload"]').count();
    test
      .info()
      .annotations.push(
        { type: "click-nav-requests", description: String(clickUrls.length) },
        { type: "hover-prefetch-paths", description: [...hoverComponentPaths].join(",") },
        { type: "modulepreload", description: String(modulePreloadCount) },
      );
  });
});
