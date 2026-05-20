import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

function dividerQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function dividerFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/divider/${dividerQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="divider"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="divider"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function dividerContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);

    return {
      tagName: element.tagName,
      role: element.getAttribute("role"),
      ariaOrientation: element.getAttribute("aria-orientation"),
      dataOrientation: element.getAttribute("data-orientation"),
      dataSize: element.getAttribute("data-size"),
      dataStaticColor: element.getAttribute("data-static-color"),
      width: styles.width,
      height: styles.height,
      alignSelf: styles.alignSelf,
      backgroundColor: styles.backgroundColor,
      borderStyle: styles.borderStyle,
      borderRadius: styles.borderRadius,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
      flexGrow: styles.flexGrow,
      flexShrink: styles.flexShrink,
    };
  });
}

test.describe("comparison Divider visual parity", () => {
  test("Divider default state is pixel-identical", async ({ page }) => {
    const fixtures = await dividerFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Divider default",
    );
  });

  test("Divider prop controls match the S2 viewer surface and drive both implementations", async ({
    page,
  }) => {
    const fixtures = await dividerFixtures(page, {
      orientation: "vertical",
      size: "L",
      staticColor: "white",
    });

    await expect(
      page
        .locator('input[name="orientation"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual(["horizontal", "vertical"]);
    await expect(page.locator('input[name="orientation"]:checked')).toHaveValue("vertical");
    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual(["S", "M", "L"]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("L");

    const staticColorOptions = page.locator('select[name="staticColor"] option');
    await expect(staticColorOptions).toHaveText(["default", "auto", "black", "white"]);
    await expect(page.locator('select[name="staticColor"]')).toHaveValue("white");
    await expect(page.locator('select[name="staticColor"] option', { hasText: /^$/ })).toHaveCount(
      0,
    );

    const expectedProps = JSON.stringify({
      orientation: "vertical",
      size: "L",
      staticColor: "white",
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

  test("Divider computed styles match React Spectrum across orientation, size, and static color", async ({
    page,
  }) => {
    for (const params of [
      { orientation: "horizontal", size: "S" },
      { orientation: "horizontal", size: "M" },
      { orientation: "horizontal", size: "L" },
      { orientation: "vertical", size: "M" },
      { orientation: "vertical", size: "L", staticColor: "white" },
      { orientation: "horizontal", size: "L", staticColor: "black" },
      { orientation: "vertical", size: "S", staticColor: "auto" },
    ] as const) {
      const fixtures = await dividerFixtures(page, params);

      await expect(dividerContract(fixtures.solidRoot)).resolves.toEqual(
        await dividerContract(fixtures.reactRoot),
      );
    }
  });

  test("Divider forced-colors branch matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const fixtures = await dividerFixtures(page, { size: "L", staticColor: "white" });

    await expect(dividerContract(fixtures.solidRoot)).resolves.toEqual(
      await dividerContract(fixtures.reactRoot),
    );
  });
});
