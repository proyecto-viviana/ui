import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  expectExactPreparedInPlaceScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";
import {
  inlineAlertFillStyleOptions,
  inlineAlertVariantOptions,
} from "../src/data/inlinealert-demo";

function inlineAlertQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function inlineAlertFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/inlinealert/${inlineAlertQuery(params)}`);
  await page.addStyleTag({
    content: ".s2-topbar, astro-dev-toolbar { visibility: hidden !important; }",
  });
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="inlinealert"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="inlinealert"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function inlineAlertContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const icon = element.querySelector("svg");
    const iconStyles = icon ? window.getComputedStyle(icon) : null;
    const heading = Array.from(element.children).find((child) => /^H[1-6]$/.test(child.tagName)) as
      | HTMLElement
      | undefined;
    const headingStyles = heading ? window.getComputedStyle(heading) : null;
    const content = Array.from(element.children).find(
      (child) =>
        child.tagName === "DIV" &&
        (child.textContent?.includes("Enter your billing") ||
          child.textContent?.includes("There was an error")),
    ) as HTMLElement | undefined;
    const contentStyles = content ? window.getComputedStyle(content) : null;

    return {
      tagName: element.tagName,
      id: element.getAttribute("id"),
      role: element.getAttribute("role"),
      ariaLabel: element.getAttribute("aria-label"),
      ariaDescribedBy: element.getAttribute("aria-describedby"),
      ariaDetails: element.getAttribute("aria-details"),
      tabIndex: element.getAttribute("tabindex"),
      dataComparisonRoot: element.getAttribute("data-comparison-control-root"),
      dataComparisonProps: element.getAttribute("data-comparison-control-props"),
      text: element.textContent?.replace(/\s+/g, " ").trim() ?? "",
      display: styles.display,
      position: styles.position,
      boxSizing: styles.boxSizing,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      borderTopLeftRadius: styles.borderTopLeftRadius,
      borderTopStyle: styles.borderTopStyle,
      borderTopWidth: styles.borderTopWidth,
      borderTopColor: styles.borderTopColor,
      backgroundColor: styles.backgroundColor,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
      outlineOffset: styles.outlineOffset,
      outlineColor: styles.outlineColor,
      iconRole: icon?.getAttribute("role") ?? null,
      iconName: icon?.getAttribute("aria-label") ?? null,
      iconAriaHidden: icon?.getAttribute("aria-hidden") ?? null,
      iconDataSlot: icon?.getAttribute("data-slot") ?? null,
      iconFloat: iconStyles?.float ?? null,
      iconWidth: iconStyles?.width ?? null,
      iconHeight: iconStyles?.height ?? null,
      iconPrimary: iconStyles?.getPropertyValue("--iconPrimary") ?? null,
      headingTag: heading?.tagName ?? null,
      headingText: heading?.textContent?.trim() ?? null,
      headingMarginTop: headingStyles?.marginTop ?? null,
      headingFontFamily: headingStyles?.fontFamily ?? null,
      headingFontSize: headingStyles?.fontSize ?? null,
      headingLineHeight: headingStyles?.lineHeight ?? null,
      headingColor: headingStyles?.color ?? null,
      contentText: content?.textContent?.trim() ?? null,
      contentFontFamily: contentStyles?.fontFamily ?? null,
      contentFontSize: contentStyles?.fontSize ?? null,
      contentLineHeight: contentStyles?.lineHeight ?? null,
      contentColor: contentStyles?.color ?? null,
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

test.describe("comparison InlineAlert visual parity", () => {
  test("InlineAlert default docs composition is pixel-identical", async ({ page }) => {
    const fixtures = await inlineAlertFixtures(page);

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "InlineAlert default",
      async () => {},
      async () => {},
    );
  });

  test("InlineAlert prop controls match the S2 viewer surface and drive both implementations", async ({
    page,
  }) => {
    await inlineAlertFixtures(page);

    await expectRadioValues(page, "variant", inlineAlertVariantOptions, "neutral");
    await expectRadioValues(page, "fillStyle", inlineAlertFillStyleOptions, "border");
    await expect(page.locator('input[name="autoFocus"]')).not.toBeChecked();

    const fixtures = await inlineAlertFixtures(page, {
      variant: "negative",
      fillStyle: "boldFill",
      autoFocus: true,
    });

    const expectedProps = JSON.stringify({
      variant: "negative",
      fillStyle: "boldFill",
      autoFocus: true,
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expectRadioValues(page, "variant", inlineAlertVariantOptions, "negative");
    await expectRadioValues(page, "fillStyle", inlineAlertFillStyleOptions, "boldFill");
    await expect(page.locator('input[name="autoFocus"]')).toBeChecked();
  });

  test("InlineAlert root contract matches React Spectrum across variant and fill style", async ({
    page,
  }) => {
    for (const params of [
      { variant: "neutral", fillStyle: "border", autoFocus: false },
      { variant: "informative", fillStyle: "subtleFill", autoFocus: false },
      { variant: "positive", fillStyle: "border", autoFocus: false },
      { variant: "notice", fillStyle: "boldFill", autoFocus: false },
      { variant: "negative", fillStyle: "boldFill", autoFocus: false },
    ] as const) {
      const fixtures = await inlineAlertFixtures(page, params);

      await expect(inlineAlertContract(fixtures.solidRoot)).resolves.toEqual(
        await inlineAlertContract(fixtures.reactRoot),
      );
    }
  });

  test("InlineAlert autoFocus makes alert roots programmatically focusable", async ({ page }) => {
    const fixtures = await inlineAlertFixtures(page, {
      variant: "negative",
      fillStyle: "border",
      autoFocus: true,
    });

    await expect(fixtures.reactRoot).toHaveAttribute("tabindex", "-1");
    await expect(fixtures.solidRoot).toHaveAttribute("tabindex", "-1");
    await expect(
      page.evaluate(() => {
        const active = document.activeElement;

        return active?.getAttribute("data-comparison-control-root") === "inlinealert";
      }),
    ).resolves.toBe(true);
  });

  test("InlineAlert negative boldFill state is pixel-identical", async ({ page }) => {
    const fixtures = await inlineAlertFixtures(page, {
      variant: "negative",
      fillStyle: "boldFill",
      autoFocus: false,
    });

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "InlineAlert negative boldFill",
      async () => {},
      async () => {},
    );
  });
});
