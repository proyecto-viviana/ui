import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

function badgeQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function badgeFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/badge/${badgeQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="badge"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="badge"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function badgeContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const text = element.querySelector('[data-rsp-slot="text"]');
    const textStyles = text ? window.getComputedStyle(text) : null;
    const icon = element.querySelector("svg");
    const iconStyles = icon ? window.getComputedStyle(icon) : null;

    return {
      tagName: element.tagName,
      role: element.getAttribute("role"),
      text: element.textContent?.trim(),
      display: styles.display,
      alignItems: styles.alignItems,
      justifyContent: styles.justifyContent,
      columnGap: styles.columnGap,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      borderTopColor: styles.borderTopColor,
      borderTopStyle: styles.borderTopStyle,
      borderTopWidth: styles.borderTopWidth,
      borderRadius: styles.borderRadius,
      minWidth: styles.minWidth,
      minHeight: styles.minHeight,
      paddingInlineStart: styles.paddingInlineStart,
      paddingInlineEnd: styles.paddingInlineEnd,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      textWhiteSpace: textStyles?.whiteSpace,
      textOverflow: textStyles?.textOverflow,
      hasIcon: !!icon,
      iconColor: iconStyles?.color ?? null,
    };
  });
}

test.describe("comparison Badge visual parity", () => {
  test("Badge default state is pixel-identical", async ({ page }) => {
    const fixtures = await badgeFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Badge default",
    );
  });

  test("Badge prop controls drive both implementations", async ({ page }) => {
    const fixtures = await badgeFixtures(page, {
      children: "Ready",
      variant: "positive",
      fillStyle: "subtle",
      size: "L",
      overflowMode: "truncate",
      iconPlacement: "start",
    });

    const expectedProps = JSON.stringify({
      children: "Ready",
      variant: "positive",
      fillStyle: "subtle",
      size: "L",
      overflowMode: "truncate",
      iconPlacement: "start",
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
  });

  test("Badge computed styles match React Spectrum across variant, fill, and icon states", async ({
    page,
  }) => {
    for (const params of [
      { variant: "neutral", fillStyle: "bold", size: "S" },
      { variant: "positive", fillStyle: "subtle", size: "M" },
      { variant: "negative", fillStyle: "outline", size: "XL" },
      { variant: "notice", fillStyle: "bold", size: "L" },
      { iconPlacement: "start", size: "L" },
      {
        children: "Long publication state",
        overflowMode: "truncate",
        fillStyle: "outline",
        size: "XL",
      },
    ] as const) {
      const fixtures = await badgeFixtures(page, params);

      await expect(badgeContract(fixtures.solidRoot)).resolves.toEqual(
        await badgeContract(fixtures.reactRoot),
      );
    }
  });
});
