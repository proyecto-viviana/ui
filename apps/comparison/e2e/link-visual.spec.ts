import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

function linkQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function linkFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/link/${linkQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="link"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="link"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function linkContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      tagName: element.tagName,
      role: element.getAttribute("role"),
      text: element.textContent?.trim(),
      href: element.getAttribute("href"),
      display: styles.display,
      color: styles.color,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
      textDecorationLine: styles.textDecorationLine,
      textDecorationStyle: styles.textDecorationStyle,
      borderRadius: styles.borderRadius,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
      outlineColor: styles.outlineColor,
    };
  });
}

test.describe("comparison Link visual parity", () => {
  test("Link default state is pixel-identical", async ({ page }) => {
    const fixtures = await linkFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Link default",
    );
  });

  test("Link prop controls drive both implementations", async ({ page }) => {
    const fixtures = await linkFixtures(page, {
      children: "Open billing",
      href: "https://example.com/billing",
      variant: "secondary",
      staticColor: "white",
      isStandalone: true,
      isQuiet: true,
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        children: "Open billing",
        href: "https://example.com/billing",
        variant: "secondary",
        staticColor: "white",
        isStandalone: true,
        isQuiet: true,
      }),
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        children: "Open billing",
        href: "https://example.com/billing",
        variant: "secondary",
        staticColor: "white",
        isStandalone: true,
        isQuiet: true,
      }),
    );
  });

  test("Link computed styles match React Spectrum across variants and static colors", async ({
    page,
  }) => {
    for (const params of [
      { variant: "primary" },
      { variant: "secondary" },
      { staticColor: "black" },
      { staticColor: "white" },
      { isStandalone: true, isQuiet: true },
    ] as const) {
      const fixtures = await linkFixtures(page, params);

      await expect(linkContract(fixtures.solidRoot)).resolves.toEqual(
        await linkContract(fixtures.reactRoot),
      );
    }
  });
});
