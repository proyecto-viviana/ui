import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection } from "./comparison-page";
import { pinComparisonTheme } from "./visual-diff";

async function checkboxGroupFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/checkboxgroup/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="checkboxgroup"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="checkboxgroup"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactRoot,
    solidRoot,
    reactEmail: reactPanel.getByRole("checkbox", { name: "Email" }).first(),
    solidEmail: solidPanel.getByRole("checkbox", { name: "Email" }).first(),
    reactSms: reactPanel.getByRole("checkbox", { name: "SMS" }).first(),
    solidSms: solidPanel.getByRole("checkbox", { name: "SMS" }).first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function checkboxGroupGeometry(root: Locator) {
  return root.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const group = element.querySelector<HTMLElement>('[role="group"]');
    const checkedInputs = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'),
    );
    const firstCheckedLabel = checkedInputs[0]?.closest("label") as HTMLElement | null;
    const box = firstCheckedLabel
      ? Array.from(firstCheckedLabel.querySelectorAll<HTMLElement>("div, span")).find(
          (candidate) => {
            const style = window.getComputedStyle(candidate);
            const rect = candidate.getBoundingClientRect();
            return (
              style.borderStyle !== "none" &&
              Number.parseFloat(style.borderWidth) > 0 &&
              Math.abs(rect.width - rect.height) <= 2 &&
              rect.width >= 12 &&
              rect.width <= 32
            );
          },
        )
      : null;
    const icon = box?.querySelector<SVGElement>("svg");
    const itemContainer = firstCheckedLabel?.parentElement as HTMLElement | null;
    const itemContainerStyle =
      itemContainer == null ? null : window.getComputedStyle(itemContainer);
    const labelStyle =
      firstCheckedLabel == null ? null : window.getComputedStyle(firstCheckedLabel);
    const boxStyle = box == null ? null : window.getComputedStyle(box);
    const boxRect = box?.getBoundingClientRect();
    const iconRect = icon?.getBoundingClientRect();
    const helpText = Array.from(element.querySelectorAll<HTMLElement>("div")).find((candidate) =>
      candidate.textContent?.includes("Select at least one channel"),
    );

    return {
      selectedValues: checkedInputs.map((input) => input.value).join(","),
      checkedCount: checkedInputs.length,
      role: group?.getAttribute("role") ?? null,
      itemFlexDirection: itemContainerStyle?.flexDirection ?? null,
      labelColor: labelStyle?.color ?? null,
      boxWidth: numberOrNull(boxRect?.width),
      boxHeight: numberOrNull(boxRect?.height),
      iconWidth: numberOrNull(iconRect?.width),
      iconHeight: numberOrNull(iconRect?.height),
      boxBorderColor: boxStyle?.borderColor ?? null,
      boxBackground: boxStyle?.backgroundColor ?? null,
      boxTransform: boxStyle?.transform ?? null,
      boxWillChange: boxStyle?.willChange ?? null,
      helpText: helpText?.textContent?.trim() ?? null,
      invalid: group?.getAttribute("data-invalid") === "true",
    };
  });
}

function expectNear(
  received: number | null,
  expected: number | null,
  tolerance: number,
  label: string,
) {
  expect(received, `${label} should be present`).not.toBeNull();
  expect(expected, `${label} reference should be present`).not.toBeNull();
  expect(Math.abs((received ?? 0) - (expected ?? 0)), label).toBeLessThanOrEqual(tolerance);
}

test.describe("comparison CheckboxGroup visual parity", () => {
  test("selected emphasized XL invalid horizontal state matches React Spectrum geometry", async ({
    page,
  }) => {
    const fixtures = await checkboxGroupFixtures(
      page,
      "?selectedValues=email,sms&isEmphasized=true&isInvalid=true&orientation=horizontal&size=XL",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectedValues: "email,sms",
      isEmphasized: true,
      isInvalid: true,
      orientation: "horizontal",
      size: "XL",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectedValues: "email,sms",
      isEmphasized: true,
      isInvalid: true,
      orientation: "horizontal",
      size: "XL",
    });
    await expect(fixtures.reactEmail).toBeChecked();
    await expect(fixtures.solidEmail).toBeChecked();
    await expect(fixtures.reactSms).toBeChecked();
    await expect(fixtures.solidSms).toBeChecked();

    const react = await checkboxGroupGeometry(fixtures.reactRoot);
    const solid = await checkboxGroupGeometry(fixtures.solidRoot);

    expect(solid.selectedValues).toBe(react.selectedValues);
    expect(solid.checkedCount).toBe(react.checkedCount);
    expect(solid.role).toBe(react.role);
    expect(solid.itemFlexDirection).toBe(react.itemFlexDirection);
    expect(solid.labelColor).toBe(react.labelColor);
    expect(solid.boxBorderColor).toBe(react.boxBorderColor);
    expect(solid.boxBackground).toBe(react.boxBackground);
    expect(solid.boxTransform).toBe(react.boxTransform);
    expect(solid.boxWillChange).toBe(react.boxWillChange);
    expect(solid.helpText).toBe(react.helpText);
    expect(solid.invalid).toBe(react.invalid);
    expectNear(solid.boxWidth, react.boxWidth, 0.75, "CheckboxGroup child box width");
    expectNear(solid.boxHeight, react.boxHeight, 0.75, "CheckboxGroup child box height");
    expectNear(solid.iconWidth, react.iconWidth, 0.75, "CheckboxGroup child icon width");
    expectNear(solid.iconHeight, react.iconHeight, 0.75, "CheckboxGroup child icon height");
  });
});
