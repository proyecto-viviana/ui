import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";
import {
  formLabelAlignOptions,
  formLabelPositionOptions,
  formNecessityIndicatorOptions,
  formSizeOptions,
  formValidationBehaviorOptions,
} from "../src/data/form-demo";

function formQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function formFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/form/${formQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="form"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="form"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function formContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const field = element.querySelector('[data-comparison-form-field="name"]') as HTMLElement;
    const fieldStyles = window.getComputedStyle(field);
    const input = field.querySelector("input") as HTMLInputElement;
    const inputStyles = window.getComputedStyle(input);
    const label = field.querySelector("label") as HTMLElement;
    const labelStyles = window.getComputedStyle(label);
    const button = element.querySelector('[data-comparison-form-submit="true"]') as HTMLElement;
    const buttonStyles = window.getComputedStyle(button);

    return {
      tagName: element.tagName,
      noValidate: (element as HTMLFormElement).noValidate,
      display: styles.display,
      gridTemplateColumns: styles.gridTemplateColumns,
      rowGap: styles.rowGap,
      columnGap: styles.columnGap,
      fieldDisplay: fieldStyles.display,
      fieldGridColumnStart: fieldStyles.gridColumnStart,
      fieldGridColumnEnd: fieldStyles.gridColumnEnd,
      fieldGridTemplateColumns: fieldStyles.gridTemplateColumns,
      fieldGridTemplateAreas: fieldStyles.gridTemplateAreas,
      labelText: label.textContent?.trim(),
      labelTextAlign: label.parentElement
        ? window.getComputedStyle(label.parentElement).textAlign
        : null,
      labelFontSize: labelStyles.fontSize,
      labelLineHeight: labelStyles.lineHeight,
      inputDisabled: input.disabled,
      inputRequired: input.required,
      inputHeight: inputStyles.height,
      inputFontSize: inputStyles.fontSize,
      buttonText: button.textContent?.trim(),
      buttonDisabled: (button as HTMLButtonElement).disabled,
      buttonMinHeight: buttonStyles.minHeight,
      buttonFontSize: buttonStyles.fontSize,
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

test.describe("comparison Form visual parity", () => {
  test("Form default state is pixel-identical", async ({ page }) => {
    const fixtures = await formFixtures(page);

    await expectExactScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Form default",
    );
  });

  test("Form prop controls drive both implementations", async ({ page }) => {
    await formFixtures(page);

    await expect(page.locator('input[name="label"]')).toHaveValue("Project name");
    await expect(page.locator('input[name="value"]')).toHaveValue("Quarterly report");
    await expect(page.locator('input[name="actionLabel"]')).toHaveValue("Submit");
    await expectRadioValues(page, "size", formSizeOptions, "M");
    await expectRadioValues(page, "labelPosition", formLabelPositionOptions, "top");
    await expectRadioValues(page, "labelAlign", formLabelAlignOptions, "start");
    await expectRadioValues(page, "necessityIndicator", formNecessityIndicatorOptions, "icon");
    await expectRadioValues(page, "validationBehavior", formValidationBehaviorOptions, "native");
    await expect(page.locator('input[name="isRequired"]')).not.toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();
    await expect(page.locator('input[name="isEmphasized"]')).not.toBeChecked();

    const fixtures = await formFixtures(page, {
      label: "Workspace",
      value: "Design systems",
      actionLabel: "Create",
      size: "XL",
      labelPosition: "side",
      labelAlign: "end",
      necessityIndicator: "label",
      validationBehavior: "aria",
      isRequired: true,
      isDisabled: true,
      isEmphasized: true,
    });

    const expectedProps = JSON.stringify({
      label: "Workspace",
      value: "Design systems",
      actionLabel: "Create",
      size: "XL",
      labelPosition: "side",
      labelAlign: "end",
      necessityIndicator: "label",
      validationBehavior: "aria",
      isRequired: true,
      isDisabled: true,
      isEmphasized: true,
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(page.locator('input[name="label"]')).toHaveValue("Workspace");
    await expect(page.locator('input[name="value"]')).toHaveValue("Design systems");
    await expect(page.locator('input[name="actionLabel"]')).toHaveValue("Create");
    await expectRadioValues(page, "size", formSizeOptions, "XL");
    await expectRadioValues(page, "labelPosition", formLabelPositionOptions, "side");
    await expectRadioValues(page, "labelAlign", formLabelAlignOptions, "end");
    await expectRadioValues(page, "necessityIndicator", formNecessityIndicatorOptions, "label");
    await expectRadioValues(page, "validationBehavior", formValidationBehaviorOptions, "aria");
    await expect(page.locator('input[name="isRequired"]')).toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).toBeChecked();
    await expect(page.locator('input[name="isEmphasized"]')).toBeChecked();
  });

  test("Form computed styles match React Spectrum across layout and inherited states", async ({
    page,
  }) => {
    for (const params of [
      ...formSizeOptions.map((size) => ({ size })),
      ...formLabelPositionOptions.map((labelPosition) => ({ labelPosition })),
      ...formLabelAlignOptions.map((labelAlign) => ({ labelPosition: "side", labelAlign })),
      ...formNecessityIndicatorOptions.map((necessityIndicator) => ({
        isRequired: true,
        necessityIndicator,
      })),
      ...formValidationBehaviorOptions.map((validationBehavior) => ({
        isRequired: true,
        validationBehavior,
      })),
      { isDisabled: true },
      { isEmphasized: true },
      {
        size: "XL",
        labelPosition: "side",
        labelAlign: "end",
        isRequired: true,
        isDisabled: true,
        isEmphasized: true,
        necessityIndicator: "label",
        validationBehavior: "aria",
      },
    ] as const) {
      const fixtures = await formFixtures(page, params);

      await expect(formContract(fixtures.solidRoot)).resolves.toEqual(
        await formContract(fixtures.reactRoot),
      );
    }
  });

  test("Form forced-colors environment matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    const fixtures = await formFixtures(page, {
      size: "XL",
      labelPosition: "side",
      labelAlign: "end",
      isRequired: true,
      isDisabled: true,
      isEmphasized: true,
      necessityIndicator: "label",
      validationBehavior: "aria",
    });

    await expect(formContract(fixtures.solidRoot)).resolves.toEqual(
      await formContract(fixtures.reactRoot),
    );
  });
});
