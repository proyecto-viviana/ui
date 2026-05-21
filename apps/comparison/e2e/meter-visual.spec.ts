import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";
import {
  meterLabelPositionOptions,
  meterSizeOptions,
  meterStaticColorOptions,
  meterVariantOptions,
} from "../src/data/meter-demo";

function meterQuery(params: Record<string, string | number | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function meterFixtures(page: Page, params: Record<string, string | number | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/meter/${meterQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="meter"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="meter"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function meterContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const value = element.querySelector('[data-rsp-slot="text"]');
    const valueStyles = value ? window.getComputedStyle(value) : null;
    const track = element.lastElementChild as HTMLElement | null;
    const trackStyles = track ? window.getComputedStyle(track) : null;
    const fill = track?.firstElementChild as HTMLElement | null;
    const fillStyles = fill ? window.getComputedStyle(fill) : null;
    const label = element.querySelector("[id]");
    const labelStyles = label ? window.getComputedStyle(label) : null;

    return {
      tagName: element.tagName,
      role: element.getAttribute("role"),
      dataComparisonRoot: element.getAttribute("data-comparison-control-root"),
      dataComparisonProps: element.getAttribute("data-comparison-control-props"),
      ariaValueNow: element.getAttribute("aria-valuenow"),
      ariaValueMin: element.getAttribute("aria-valuemin"),
      ariaValueMax: element.getAttribute("aria-valuemax"),
      ariaValueText: element.getAttribute("aria-valuetext"),
      labelText: label?.textContent?.trim() ?? null,
      valueText: value?.textContent?.trim() ?? null,
      display: styles.display,
      gridTemplateColumns: styles.gridTemplateColumns,
      gridTemplateAreas: styles.gridTemplateAreas,
      alignItems: styles.alignItems,
      columnGap: styles.columnGap,
      minWidth: styles.minWidth,
      maxWidth: styles.maxWidth,
      labelFontFamily: labelStyles?.fontFamily ?? null,
      labelFontSize: labelStyles?.fontSize ?? null,
      labelLineHeight: labelStyles?.lineHeight ?? null,
      labelColor: labelStyles?.color ?? null,
      valueFontFamily: valueStyles?.fontFamily ?? null,
      valueFontSize: valueStyles?.fontSize ?? null,
      valueLineHeight: valueStyles?.lineHeight ?? null,
      valueColor: valueStyles?.color ?? null,
      trackWidth: trackStyles?.width ?? null,
      trackHeight: trackStyles?.height ?? null,
      trackBackgroundColor: trackStyles?.backgroundColor ?? null,
      trackBorderRadius: trackStyles?.borderRadius ?? null,
      trackOverflow: trackStyles?.overflow ?? null,
      trackOutlineWidth: trackStyles?.outlineWidth ?? null,
      trackOutlineStyle: trackStyles?.outlineStyle ?? null,
      trackOutlineColor: trackStyles?.outlineColor ?? null,
      fillWidth: fillStyles?.width ?? null,
      fillHeight: fillStyles?.height ?? null,
      fillBackgroundColor: fillStyles?.backgroundColor ?? null,
      fillBorderRadius: fillStyles?.borderRadius ?? null,
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

test.describe("comparison Meter visual parity", () => {
  test("Meter default state is pixel-identical", async ({ page }) => {
    const fixtures = await meterFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Meter default",
    );
  });

  test("Meter prop controls drive both implementations", async ({ page }) => {
    await meterFixtures(page);

    await expect(page.locator('input[name="label"]')).toHaveValue("Storage");
    await expect(page.locator('input[name="value"]')).toHaveValue("72");
    await expect(page.locator('input[name="minValue"]')).toHaveValue("0");
    await expect(page.locator('input[name="maxValue"]')).toHaveValue("100");
    await expect(page.locator('input[name="valueLabel"]')).toHaveValue("");
    await expectRadioValues(page, "variant", meterVariantOptions, "informative");
    await expectRadioValues(page, "size", meterSizeOptions, "M");
    await expectRadioValues(page, "staticColor", meterStaticColorOptions, "");
    await expect(page.locator('input[name="staticColor"] + span')).toHaveText([
      "default",
      "white",
      "black",
      "auto",
    ]);
    await expectRadioValues(page, "labelPosition", meterLabelPositionOptions, "top");

    const fixtures = await meterFixtures(page, {
      label: "Quota",
      value: 45,
      minValue: 0,
      maxValue: 120,
      valueLabel: "45 of 120 GB",
      variant: "notice",
      size: "XL",
      staticColor: "white",
      labelPosition: "side",
    });

    const expectedProps = JSON.stringify({
      label: "Quota",
      value: 45,
      minValue: 0,
      maxValue: 120,
      valueLabel: "45 of 120 GB",
      variant: "notice",
      size: "XL",
      staticColor: "white",
      labelPosition: "side",
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(page.locator('input[name="label"]')).toHaveValue("Quota");
    await expect(page.locator('input[name="value"]')).toHaveValue("45");
    await expect(page.locator('input[name="minValue"]')).toHaveValue("0");
    await expect(page.locator('input[name="maxValue"]')).toHaveValue("120");
    await expect(page.locator('input[name="valueLabel"]')).toHaveValue("45 of 120 GB");
    await expectRadioValues(page, "variant", meterVariantOptions, "notice");
    await expectRadioValues(page, "size", meterSizeOptions, "XL");
    await expectRadioValues(page, "staticColor", meterStaticColorOptions, "white");
    await expectRadioValues(page, "labelPosition", meterLabelPositionOptions, "side");
  });

  test("Meter computed styles match React Spectrum across range, variant, and static color states", async ({
    page,
  }) => {
    for (const params of [
      ...meterVariantOptions.map((variant) => ({ variant, value: 65 })),
      ...meterSizeOptions.map((size) => ({ size, value: 65 })),
      ...meterStaticColorOptions.map((staticColor) => ({ staticColor, value: 50 })),
      ...meterLabelPositionOptions.map((labelPosition) => ({ labelPosition, value: 65 })),
      { value: 35, valueLabel: "35%" },
      { value: 85, minValue: 0, maxValue: 200 },
    ] as const) {
      const fixtures = await meterFixtures(page, params);

      await expect(meterContract(fixtures.solidRoot)).resolves.toEqual(
        await meterContract(fixtures.reactRoot),
      );
    }
  });

  test("Meter forced-colors branch matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const fixtures = await meterFixtures(page, {
      variant: "negative",
      size: "XL",
      staticColor: "white",
      labelPosition: "side",
      value: 85,
    });

    await expect(meterContract(fixtures.solidRoot)).resolves.toEqual(
      await meterContract(fixtures.reactRoot),
    );
  });
});
