import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection } from "./comparison-page";
import { pinComparisonTheme } from "./visual-diff";

async function radioGroupFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/radiogroup/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="radiogroup"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="radiogroup"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactRoot,
    solidRoot,
    reactStarter: reactPanel.getByRole("radio", { name: "Starter" }).first(),
    reactPro: reactPanel.getByRole("radio", { name: "Pro" }).first(),
    reactEnterprise: reactPanel.getByRole("radio", { name: "Enterprise" }).first(),
    solidStarter: solidPanel.getByRole("radio", { name: "Starter" }).first(),
    solidPro: solidPanel.getByRole("radio", { name: "Pro" }).first(),
    solidEnterprise: solidPanel.getByRole("radio", { name: "Enterprise" }).first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function radioGroupGeometry(root: Locator) {
  return root.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const group = element.querySelector<HTMLElement>('[role="radiogroup"]');
    const selectedInput = element.querySelector<HTMLInputElement>('input[type="radio"]:checked');
    const selectedLabel = selectedInput?.closest("label") as HTMLElement | null;
    const circle = selectedLabel
      ? Array.from(selectedLabel.querySelectorAll<HTMLElement>("div")).find((candidate) => {
          const style = window.getComputedStyle(candidate);
          const rect = candidate.getBoundingClientRect();
          return (
            style.borderStyle !== "none" &&
            Number.parseFloat(style.borderWidth) > 0 &&
            Math.abs(rect.width - rect.height) <= 2 &&
            rect.width >= 12 &&
            rect.width <= 32
          );
        })
      : null;
    const labelText = selectedLabel == null ? null : window.getComputedStyle(selectedLabel);
    const circleStyle = circle == null ? null : window.getComputedStyle(circle);
    const circleRect = circle?.getBoundingClientRect();
    const helpText = Array.from(element.querySelectorAll<HTMLElement>("div")).find((candidate) => {
      const text = candidate.textContent ?? "";
      return text.includes("Choose a plan") || text.includes("Select one plan");
    });
    const itemContainer = group?.querySelector<HTMLElement>(':scope > div[class*="sd13"]');
    const itemContainerStyle =
      itemContainer == null ? null : window.getComputedStyle(itemContainer);

    return {
      selectedValue: selectedInput?.value ?? null,
      selectedChecked: selectedInput?.checked ?? false,
      groupOrientation: group?.getAttribute("aria-orientation") ?? null,
      itemFlexDirection: itemContainerStyle?.flexDirection ?? null,
      labelColor: labelText?.color ?? null,
      circleWidth: numberOrNull(circleRect?.width),
      circleHeight: numberOrNull(circleRect?.height),
      circleBorderWidth: circleStyle?.borderWidth ?? null,
      circleBorderColor: circleStyle?.borderColor ?? null,
      circleBackground: circleStyle?.backgroundColor ?? null,
      circleTransform: circleStyle?.transform ?? null,
      circleWillChange: circleStyle?.willChange ?? null,
      helpText: helpText?.textContent?.trim() ?? null,
      invalid: group?.getAttribute("data-invalid") === "true",
    };
  });
}

async function radioGroupFieldSurface(root: Locator) {
  return root.evaluate((element) => {
    const group = element.querySelector<HTMLElement>('[role="radiogroup"]');
    const labelId = group?.getAttribute("aria-labelledby") ?? "";
    const label = labelId ? element.ownerDocument.getElementById(labelId) : null;
    const input = element.querySelector<HTMLInputElement>('input[type="radio"]');
    const contextualHelpButtonCount = element.querySelectorAll("button").length;

    return {
      labelText: label?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      groupRequired: group?.getAttribute("aria-required") ?? null,
      inputName: input?.getAttribute("name") ?? null,
      inputForm: input?.getAttribute("form") ?? null,
      inputRequired: input?.hasAttribute("required") ?? false,
      inputAriaRequired: input?.getAttribute("aria-required") ?? null,
      contextualHelpButtonCount,
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

test.describe("comparison RadioGroup visual parity", () => {
  test("label clicks can select multiple values in sequence on both stacks", async ({ page }) => {
    const fixtures = await radioGroupFixtures(page);

    for (const item of [
      {
        panel: fixtures.reactPanel,
        root: fixtures.reactRoot,
        starter: fixtures.reactStarter,
        pro: fixtures.reactPro,
        enterprise: fixtures.reactEnterprise,
      },
      {
        panel: fixtures.solidPanel,
        root: fixtures.solidRoot,
        starter: fixtures.solidStarter,
        pro: fixtures.solidPro,
        enterprise: fixtures.solidEnterprise,
      },
    ]) {
      await expect(item.starter).toBeChecked();
      await expect(item.pro).not.toBeChecked();
      await expect(item.enterprise).not.toBeChecked();

      await item.panel.getByText("Pro", { exact: true }).click();
      await expect(item.root).toHaveAttribute("data-comparison-selected-value", "pro");
      await expect(item.pro).toBeChecked();
      await expect(item.starter).not.toBeChecked();
      await expect(item.enterprise).not.toBeChecked();

      await item.panel.getByText("Enterprise", { exact: true }).click();
      await expect(item.root).toHaveAttribute("data-comparison-selected-value", "enterprise");
      await expect(item.enterprise).toBeChecked();
      await expect(item.pro).not.toBeChecked();
      await expect(item.starter).not.toBeChecked();

      await item.panel.getByText("Starter", { exact: true }).click();
      await expect(item.root).toHaveAttribute("data-comparison-selected-value", "starter");
      await expect(item.starter).toBeChecked();
      await expect(item.pro).not.toBeChecked();
      await expect(item.enterprise).not.toBeChecked();
    }
  });

  test("default state matches React Spectrum geometry", async ({ page }) => {
    const fixtures = await radioGroupFixtures(page);

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectedValue: "starter",
      orientation: "vertical",
      size: "M",
      labelPosition: "top",
      labelAlign: "start",
      necessityIndicator: "icon",
      isInvalid: false,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectedValue: "starter",
      orientation: "vertical",
      size: "M",
      labelPosition: "top",
      labelAlign: "start",
      necessityIndicator: "icon",
      isInvalid: false,
    });

    const react = await radioGroupGeometry(fixtures.reactRoot);
    const solid = await radioGroupGeometry(fixtures.solidRoot);

    expect(solid.selectedValue).toBe(react.selectedValue);
    expect(solid.selectedChecked).toBe(react.selectedChecked);
    expect(solid.groupOrientation).toBe(react.groupOrientation);
    expect(solid.itemFlexDirection).toBe(react.itemFlexDirection);
    expect(solid.labelColor).toBe(react.labelColor);
    expect(solid.circleBorderWidth).toBe(react.circleBorderWidth);
    expect(solid.circleBorderColor).toBe(react.circleBorderColor);
    expect(solid.circleBackground).toBe(react.circleBackground);
    expect(solid.circleTransform).toBe(react.circleTransform);
    expect(solid.circleWillChange).toBe(react.circleWillChange);
    expect(solid.helpText).toBe(react.helpText);
    expect(solid.invalid).toBe(react.invalid);
    expectNear(solid.circleWidth, react.circleWidth, 0.75, "Default radio circle width");
    expectNear(solid.circleHeight, react.circleHeight, 0.75, "Default radio circle height");
  });

  test("selected emphasized XL invalid horizontal state matches React Spectrum geometry", async ({
    page,
  }) => {
    const fixtures = await radioGroupFixtures(
      page,
      "?selectedValue=pro&isEmphasized=true&isInvalid=true&orientation=horizontal&size=XL",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectedValue: "pro",
      isEmphasized: true,
      isInvalid: true,
      orientation: "horizontal",
      size: "XL",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectedValue: "pro",
      isEmphasized: true,
      isInvalid: true,
      orientation: "horizontal",
      size: "XL",
    });
    await expect(fixtures.reactPro).toBeChecked();
    await expect(fixtures.solidPro).toBeChecked();

    const react = await radioGroupGeometry(fixtures.reactRoot);
    const solid = await radioGroupGeometry(fixtures.solidRoot);

    expect(solid.selectedValue).toBe(react.selectedValue);
    expect(solid.selectedChecked).toBe(react.selectedChecked);
    expect(solid.groupOrientation).toBe(react.groupOrientation);
    expect(solid.itemFlexDirection).toBe(react.itemFlexDirection);
    expect(solid.labelColor).toBe(react.labelColor);
    expect(solid.circleBorderWidth).toBe(react.circleBorderWidth);
    expect(solid.circleBorderColor).toBe(react.circleBorderColor);
    expect(solid.circleBackground).toBe(react.circleBackground);
    expect(solid.circleTransform).toBe(react.circleTransform);
    expect(solid.circleWillChange).toBe(react.circleWillChange);
    expect(solid.helpText).toBe(react.helpText);
    expect(solid.invalid).toBe(react.invalid);
    expectNear(solid.circleWidth, react.circleWidth, 0.75, "Radio circle width");
    expectNear(solid.circleHeight, react.circleHeight, 0.75, "Radio circle height");
  });

  test("side label, required label, form props, and aria validation match React Spectrum", async ({
    page,
  }) => {
    const fixtures = await radioGroupFixtures(
      page,
      "?labelPosition=side&labelAlign=end&necessityIndicator=label&isRequired=true&name=plan&form=checkout&validationBehavior=aria&withContextualHelp=true",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      labelPosition: "side",
      labelAlign: "end",
      necessityIndicator: "label",
      isRequired: true,
      name: "plan",
      form: "checkout",
      validationBehavior: "aria",
      withContextualHelp: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      labelPosition: "side",
      labelAlign: "end",
      necessityIndicator: "label",
      isRequired: true,
      name: "plan",
      form: "checkout",
      validationBehavior: "aria",
      withContextualHelp: true,
    });

    const react = await radioGroupFieldSurface(fixtures.reactRoot);
    const solid = await radioGroupFieldSurface(fixtures.solidRoot);

    expect(solid.labelText).toBe(react.labelText);
    expect(solid.labelText).toContain("(required)");
    expect(solid.groupRequired).toBe(react.groupRequired);
    expect(solid.inputName).toBe(react.inputName);
    expect(solid.inputForm).toBe(react.inputForm);
    expect(solid.inputRequired).toBe(react.inputRequired);
    expect(solid.inputAriaRequired).toBe(react.inputAriaRequired);
    expect(solid.contextualHelpButtonCount).toBe(react.contextualHelpButtonCount);
    expect(solid.contextualHelpButtonCount).toBeGreaterThan(0);
  });
});
