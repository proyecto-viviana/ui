import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  expectExactPreparedInPlaceScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";
import {
  illustratedMessageOrientationOptions,
  illustratedMessageSizeOptions,
} from "../src/data/illustratedmessage-demo";

function illustratedMessageQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function illustratedMessageFixtures(
  page: Page,
  params: Record<string, string | boolean> = {},
) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/illustratedmessage/${illustratedMessageQuery(params)}`);
  await page.addStyleTag({
    content: ".s2-topbar, astro-dev-toolbar { visibility: hidden !important; }",
  });
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel
    .locator('[data-comparison-control-root="illustratedmessage"]')
    .first();
  const solidRoot = solidPanel
    .locator('[data-comparison-control-root="illustratedmessage"]')
    .first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function illustratedMessageContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const illustration = element.querySelector("svg");
    const illustrationStyles = illustration ? window.getComputedStyle(illustration) : null;
    const heading = Array.from(element.children).find((child) => /^H[1-6]$/.test(child.tagName)) as
      | HTMLElement
      | undefined;
    const headingStyles = heading ? window.getComputedStyle(heading) : null;
    const content = Array.from(element.children).find(
      (child) => child.tagName === "DIV" && child.textContent?.includes("Upload or import"),
    ) as HTMLElement | undefined;
    const contentStyles = content ? window.getComputedStyle(content) : null;
    const buttonGroup = Array.from(element.children).find(
      (child) => child.querySelectorAll("button").length > 0,
    ) as HTMLElement | undefined;
    const buttonGroupStyles = buttonGroup ? window.getComputedStyle(buttonGroup) : null;
    const buttons = Array.from(element.querySelectorAll("button"));

    return {
      tagName: element.tagName,
      id: element.getAttribute("id"),
      role: element.getAttribute("role"),
      ariaLabel: element.getAttribute("aria-label"),
      ariaDescribedBy: element.getAttribute("aria-describedby"),
      ariaDetails: element.getAttribute("aria-details"),
      dataComparisonRoot: element.getAttribute("data-comparison-control-root"),
      dataComparisonProps: element.getAttribute("data-comparison-control-props"),
      text: element.textContent?.replace(/\s+/g, " ").trim() ?? "",
      display: styles.display,
      maxWidth: styles.maxWidth,
      width: styles.width,
      gridTemplateAreas: styles.gridTemplateAreas,
      gridTemplateRows: styles.gridTemplateRows,
      gridTemplateColumns: styles.gridTemplateColumns,
      justifyItems: styles.justifyItems,
      textAlign: styles.textAlign,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      boxSizing: styles.boxSizing,
      illustrationDataSlot: illustration?.getAttribute("data-slot") ?? null,
      illustrationRole: illustration?.getAttribute("role") ?? null,
      illustrationAriaHidden: illustration?.getAttribute("aria-hidden") ?? null,
      illustrationWidth: illustrationStyles?.width ?? null,
      illustrationHeight: illustrationStyles?.height ?? null,
      illustrationFlexShrink: illustrationStyles?.flexShrink ?? null,
      illustrationGridArea: illustrationStyles?.gridArea ?? null,
      illustrationAlignSelf: illustrationStyles?.alignSelf ?? null,
      illustrationPrimary: illustrationStyles?.getPropertyValue("--iconPrimary") ?? null,
      headingTag: heading?.tagName ?? null,
      headingText: heading?.textContent?.trim() ?? null,
      headingGridArea: headingStyles?.gridArea ?? null,
      headingAlignSelf: headingStyles?.alignSelf ?? null,
      headingMarginTop: headingStyles?.marginTop ?? null,
      headingMarginRight: headingStyles?.marginRight ?? null,
      headingMarginBottom: headingStyles?.marginBottom ?? null,
      headingMarginLeft: headingStyles?.marginLeft ?? null,
      headingFontFamily: headingStyles?.fontFamily ?? null,
      headingFontSize: headingStyles?.fontSize ?? null,
      headingLineHeight: headingStyles?.lineHeight ?? null,
      contentText: content?.textContent?.trim() ?? null,
      contentGridArea: contentStyles?.gridArea ?? null,
      contentAlignSelf: contentStyles?.alignSelf ?? null,
      contentFontFamily: contentStyles?.fontFamily ?? null,
      contentFontSize: contentStyles?.fontSize ?? null,
      contentLineHeight: contentStyles?.lineHeight ?? null,
      buttonGroupTag: buttonGroup?.tagName ?? null,
      buttonGroupGridArea: buttonGroupStyles?.gridArea ?? null,
      buttonGroupMarginTop: buttonGroupStyles?.marginTop ?? null,
      buttonTexts: buttons.map((button) => button.textContent?.trim() ?? ""),
    };
  });
}

async function expectRadioValues(
  page: Page,
  name: string,
  values: readonly string[],
  checked: string,
) {
  await expect(
    page
      .locator(`input[name="${name}"]`)
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
  ).resolves.toEqual([...values]);
  await expect(page.locator(`input[name="${name}"]:checked`)).toHaveValue(checked);
}

test.describe("comparison IllustratedMessage visual parity", () => {
  test("IllustratedMessage default docs composition is pixel-identical", async ({ page }) => {
    const fixtures = await illustratedMessageFixtures(page);

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "IllustratedMessage default",
      async () => {},
      async () => {},
    );
  });

  test("IllustratedMessage prop controls match the S2 viewer surface and drive both implementations", async ({
    page,
  }) => {
    await illustratedMessageFixtures(page);

    await expectRadioValues(page, "size", illustratedMessageSizeOptions, "M");
    await expectRadioValues(page, "orientation", illustratedMessageOrientationOptions, "vertical");
    await expect(page.locator('input[name="withActions"]')).toBeChecked();

    const fixtures = await illustratedMessageFixtures(page, {
      size: "L",
      orientation: "horizontal",
      withActions: false,
    });

    const expectedProps = JSON.stringify({
      size: "L",
      orientation: "horizontal",
      withActions: false,
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expectRadioValues(page, "size", illustratedMessageSizeOptions, "L");
    await expectRadioValues(
      page,
      "orientation",
      illustratedMessageOrientationOptions,
      "horizontal",
    );
    await expect(page.locator('input[name="withActions"]')).not.toBeChecked();
  });

  test("IllustratedMessage root contract matches React Spectrum across orientation and size", async ({
    page,
  }) => {
    for (const params of [
      { size: "S", orientation: "vertical", withActions: true },
      { size: "M", orientation: "vertical", withActions: false },
      { size: "L", orientation: "vertical", withActions: true },
      { size: "S", orientation: "horizontal", withActions: true },
      { size: "M", orientation: "horizontal", withActions: false },
      { size: "L", orientation: "horizontal", withActions: true },
    ] as const) {
      const fixtures = await illustratedMessageFixtures(page, params);

      await expect(illustratedMessageContract(fixtures.solidRoot)).resolves.toEqual(
        await illustratedMessageContract(fixtures.reactRoot),
      );
    }
  });

  test("IllustratedMessage horizontal L actions state is pixel-identical", async ({ page }) => {
    const fixtures = await illustratedMessageFixtures(page, {
      size: "L",
      orientation: "horizontal",
      withActions: true,
    });

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "IllustratedMessage horizontal L actions",
      async () => {},
      async () => {},
    );
  });
});
