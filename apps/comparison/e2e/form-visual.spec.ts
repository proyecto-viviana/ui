import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

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
  });

  test("Form computed styles match React Spectrum across layout and inherited states", async ({
    page,
  }) => {
    for (const params of [
      { size: "M", labelPosition: "top" },
      { size: "S", labelPosition: "side", labelAlign: "start" },
      { size: "XL", labelPosition: "side", labelAlign: "end", isRequired: true },
      {
        size: "L",
        validationBehavior: "aria",
        isRequired: true,
        isDisabled: true,
        necessityIndicator: "label",
      },
    ] as const) {
      const fixtures = await formFixtures(page, params);

      await expect(formContract(fixtures.solidRoot)).resolves.toEqual(
        await formContract(fixtures.reactRoot),
      );
    }
  });
});
