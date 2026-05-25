import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

type PrimitiveSlug = "icons" | "illustrations";
type PrimitiveKind = "icon" | "illustration";

async function primitiveFixtures(page: Page, slug: PrimitiveSlug, kind: PrimitiveKind) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/${slug}/`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator(`[data-comparison-control-root="${slug}"]`).first();
  const solidRoot = solidPanel.locator(`[data-comparison-control-root="${slug}"]`).first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();
  await expect(reactRoot.locator(`[data-comparison-${kind}]`)).not.toHaveCount(0);
  await expect(solidRoot.locator(`[data-comparison-${kind}]`)).not.toHaveCount(0);

  return { reactCanvas, solidCanvas, reactRoot, solidRoot };
}

async function svgContract(target: Locator) {
  return target.evaluate((element) => {
    const svg = element as SVGSVGElement;
    const styles = window.getComputedStyle(svg);
    const rect = svg.getBoundingClientRect();

    return {
      tagName: svg.tagName,
      role: svg.getAttribute("role"),
      ariaLabel: svg.getAttribute("aria-label"),
      ariaHidden: svg.getAttribute("aria-hidden"),
      dataSlot: svg.getAttribute("data-slot"),
      focusable: svg.getAttribute("focusable"),
      size: svg.getAttribute("size"),
      width: svg.getAttribute("width"),
      height: svg.getAttribute("height"),
      viewBox: svg.getAttribute("viewBox"),
      computedWidth: styles.width,
      computedHeight: styles.height,
      flexShrink: styles.flexShrink,
      boxWidth: rect.width,
      boxHeight: rect.height,
    };
  });
}

async function expectMatchingContract(reactTarget: Locator, solidTarget: Locator) {
  await expect(svgContract(solidTarget)).resolves.toEqual(await svgContract(reactTarget));
}

test.describe("comparison Icon and Illustration primitive parity", () => {
  test("Icon gallery is pixel-identical and preserves semantics", async ({ page }) => {
    const fixtures = await primitiveFixtures(page, "icons", "icon");

    await expectExactScreenshotPair(page, fixtures.reactCanvas, fixtures.solidCanvas, "Icons");

    await expectMatchingContract(
      fixtures.reactRoot.locator('[data-comparison-icon="labelled"]'),
      fixtures.solidRoot.locator('[data-comparison-icon="labelled"]'),
    );
    await expectMatchingContract(
      fixtures.reactRoot.locator('[data-comparison-icon="decorative"]'),
      fixtures.solidRoot.locator('[data-comparison-icon="decorative"]'),
    );
    await expectMatchingContract(
      fixtures.reactRoot.locator('[data-comparison-icon="skeleton"]'),
      fixtures.solidRoot.locator('[data-comparison-icon="skeleton"]'),
    );
    await expectMatchingContract(
      fixtures.reactRoot.locator('[data-comparison-icon="button-context"] svg'),
      fixtures.solidRoot.locator('[data-comparison-icon="button-context"] svg'),
    );
  });

  test("Illustration gallery is pixel-identical and preserves semantics", async ({ page }) => {
    const fixtures = await primitiveFixtures(page, "illustrations", "illustration");

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Illustrations",
    );

    await expectMatchingContract(
      fixtures.reactRoot.locator('[data-comparison-illustration="labelled"]'),
      fixtures.solidRoot.locator('[data-comparison-illustration="labelled"]'),
    );
    await expectMatchingContract(
      fixtures.reactRoot.locator('[data-comparison-illustration="decorative"]'),
      fixtures.solidRoot.locator('[data-comparison-illustration="decorative"]'),
    );
    await expectMatchingContract(
      fixtures.reactRoot.locator('[data-comparison-illustration="skeleton"]'),
      fixtures.solidRoot.locator('[data-comparison-illustration="skeleton"]'),
    );
  });
});
