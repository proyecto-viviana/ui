import { test, expect, type Page } from "@playwright/test";

/**
 * Showcase topbar overflow: above 820px the panel strip wraps in-flow;
 * at 820px and below CSS hides the strip and shows `.gls-nav-select`.
 * Named failure: a displayed strip whose scrollWidth exceeds clientWidth
 * while overflow-x clips (today's hidden-scrollbar auto clip), or any
 * displayed `.gls-navlink` box outside `.gls-topbar`.
 * Do not assert `flex-wrap`.
 */

const PANEL_SLUGS = [
  "buttons",
  "inputs",
  "selection",
  "pickers",
  "status",
  "chips",
  "navigation",
  "collections",
  "overlays",
  "datetime",
  "color",
  "cards",
  "sliders",
  "type",
] as const;

const DESTINATIONS = [...PANEL_SLUGS, "parity"] as const;

async function gotoShowcase(page: Page) {
  await page.goto("/showcase", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".gls-topbar").waitFor();
}

type OverflowReport = {
  stripDisplay: string;
  selectDisplay: string;
  overflowX: string;
  scrollWidth: number;
  clientWidth: number;
  hrefs: string[];
  optionValues: string[];
  linksOutsideTopbar: string[];
};

async function measureOverflow(page: Page): Promise<OverflowReport> {
  return page.evaluate(() => {
    const nav = document.querySelector(".gls-topbar-nav");
    const topbar = document.querySelector(".gls-topbar");
    const select = document.querySelector(".gls-nav-select");
    if (
      !(nav instanceof HTMLElement) ||
      !(topbar instanceof HTMLElement) ||
      !(select instanceof HTMLSelectElement)
    ) {
      throw new Error("showcase topbar chrome missing");
    }
    const topbarBox = topbar.getBoundingClientRect();
    const linksOutsideTopbar: string[] = [];
    for (const link of nav.querySelectorAll(".gls-navlink")) {
      if (!(link instanceof HTMLElement)) continue;
      if (getComputedStyle(link).display === "none") continue;
      const r = link.getBoundingClientRect();
      if (
        r.left < topbarBox.left - 0.5 ||
        r.right > topbarBox.right + 0.5 ||
        r.top < topbarBox.top - 0.5 ||
        r.bottom > topbarBox.bottom + 0.5
      ) {
        linksOutsideTopbar.push(link.getAttribute("href") ?? "?");
      }
    }
    return {
      stripDisplay: getComputedStyle(nav).display,
      selectDisplay: getComputedStyle(select).display,
      overflowX: getComputedStyle(nav).overflowX,
      scrollWidth: nav.scrollWidth,
      clientWidth: nav.clientWidth,
      hrefs: [...nav.querySelectorAll("a.gls-navlink")].map(
        (a) => (a as HTMLAnchorElement).getAttribute("href") ?? "",
      ),
      optionValues: [...select.options].map((o) => o.value),
      linksOutsideTopbar,
    };
  });
}

function overflowClips(overflowX: string): boolean {
  return (
    overflowX === "auto" || overflowX === "hidden" || overflowX === "scroll" || overflowX === "clip"
  );
}

test.describe("showcase topbar overflow", () => {
  test("1280 /showcase does not clip the panel strip", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoShowcase(page);
    const report = await measureOverflow(page);

    expect(report.stripDisplay, "strip must be shown at 1280").not.toBe("none");
    const overflows = report.scrollWidth > report.clientWidth;
    expect(
      report.stripDisplay !== "none" && overflows && overflowClips(report.overflowX),
      `strip clips: scrollWidth ${report.scrollWidth} > clientWidth ${report.clientWidth} with overflow-x ${report.overflowX}`,
    ).toBe(false);
    expect(
      overflows,
      `strip overflows: scrollWidth ${report.scrollWidth} > clientWidth ${report.clientWidth} (overflow-x ${report.overflowX})`,
    ).toBe(false);
    expect(
      report.linksOutsideTopbar,
      `navlinks outside topbar: ${report.linksOutsideTopbar.join(", ")}`,
    ).toEqual([]);

    for (const slug of DESTINATIONS) {
      const href = `/showcase/${slug}`;
      const inStrip = report.hrefs.some((h) => h === href || h.endsWith(href));
      const inSelect = report.optionValues.includes(slug);
      expect(inStrip || inSelect, `${slug} missing from strip and select`).toBe(true);
    }
  });

  test("820 /showcase keeps the select and hides the strip", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 720 });
    await gotoShowcase(page);
    const report = await measureOverflow(page);

    expect(report.stripDisplay, "strip must be hidden at 820").toBe("none");
    expect(report.selectDisplay, "select must stay visible at 820").not.toBe("none");

    for (const slug of DESTINATIONS) {
      expect(report.optionValues, `select missing ${slug}`).toContain(slug);
    }
  });
});
