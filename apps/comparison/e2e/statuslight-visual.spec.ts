import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

function statusLightQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function statusLightFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/statuslight/${statusLightQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="statuslight"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="statuslight"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function statusLightContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const light = element.querySelector('svg[aria-hidden="true"]');
    const lightStyles = light ? window.getComputedStyle(light) : null;
    const center = light?.parentElement ?? null;
    const centerStyles = center ? window.getComputedStyle(center) : null;
    const text = element.querySelector('[data-rsp-slot="text"]');
    const textStyles = text ? window.getComputedStyle(text) : null;

    return {
      tagName: element.tagName,
      role: element.getAttribute("role"),
      text: element.textContent?.trim(),
      display: styles.display,
      alignItems: styles.alignItems,
      gap: styles.gap,
      width: styles.width,
      color: styles.color,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      lightTagName: light?.tagName ?? null,
      lightWidth: lightStyles?.width ?? null,
      lightHeight: lightStyles?.height ?? null,
      lightFill: lightStyles?.fill ?? null,
      lightOverflow: lightStyles?.overflow ?? null,
      centerDisplay: centerStyles?.display ?? null,
      centerAlignItems: centerStyles?.alignItems ?? null,
      textTagName: text?.tagName ?? null,
      textDisplay: textStyles?.display ?? null,
    };
  });
}

test.describe("comparison StatusLight visual parity", () => {
  test("StatusLight default state is pixel-identical", async ({ page }) => {
    const fixtures = await statusLightFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "StatusLight default",
    );
  });

  test("StatusLight prop controls drive both implementations", async ({ page }) => {
    const fixtures = await statusLightFixtures(page, {
      children: "Investigating",
      variant: "notice",
      size: "XL",
      role: "status",
    });

    const expectedProps = JSON.stringify({
      children: "Investigating",
      variant: "notice",
      size: "XL",
      role: "status",
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

  test("StatusLight computed styles match React Spectrum across variants and sizes", async ({
    page,
  }) => {
    for (const params of [
      { variant: "neutral", size: "M" },
      { variant: "positive", size: "S" },
      { variant: "notice", size: "L" },
      { variant: "negative", size: "XL" },
      { variant: "cyan", size: "M" },
      { children: "Live region update", role: "status", variant: "informative", size: "XL" },
    ] as const) {
      const fixtures = await statusLightFixtures(page, params);

      await expect(statusLightContract(fixtures.solidRoot)).resolves.toEqual(
        await statusLightContract(fixtures.reactRoot),
      );
    }
  });
});
