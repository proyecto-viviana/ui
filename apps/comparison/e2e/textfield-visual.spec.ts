import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function textFieldFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/textfield/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="textfield"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="textfield"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactInput: reactPanel.getByRole("textbox", { name: "Name" }).first(),
    solidInput: solidPanel.getByRole("textbox", { name: "Name" }).first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function textFieldGeometry(root: Locator) {
  return root.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const relativeRect = (rect: DOMRect | undefined, rootRect: DOMRect) =>
      rect == null
        ? null
        : {
            x: Number((rect.left - rootRect.left).toFixed(4)),
            y: Number((rect.top - rootRect.top).toFixed(4)),
            width: Number(rect.width.toFixed(4)),
            height: Number(rect.height.toFixed(4)),
          };

    const rootRect = element.getBoundingClientRect();
    const input = element.querySelector<HTMLInputElement>("input");
    const fieldGroup = input?.parentElement ?? null;
    const label = element.querySelector("label");
    const helpTextLeaf = Array.from(element.querySelectorAll<HTMLElement>("*")).find(
      (candidate) =>
        candidate.children.length === 0 && candidate.textContent?.trim() === "Name is required.",
    );
    const helpTextParent = helpTextLeaf?.parentElement;
    const helpText =
      helpTextParent != null && window.getComputedStyle(helpTextParent).display === "flex"
        ? helpTextParent
        : helpTextLeaf;
    const invalidIcon = fieldGroup?.querySelector<SVGElement>("svg");
    const groupStyle = fieldGroup == null ? null : window.getComputedStyle(fieldGroup);
    const inputStyle = input == null ? null : window.getComputedStyle(input);
    const helpStyle = helpText == null ? null : window.getComputedStyle(helpText);
    const labelRect = label?.getBoundingClientRect();
    const groupRect = fieldGroup?.getBoundingClientRect();
    const inputRect = input?.getBoundingClientRect();
    const iconRect = invalidIcon?.getBoundingClientRect();
    const helpRect = helpText?.getBoundingClientRect();
    const groupCenterY = groupRect == null ? null : groupRect.top + groupRect.height / 2;
    const inputCenterY = inputRect == null ? null : inputRect.top + inputRect.height / 2;
    const iconCenterY = iconRect == null ? null : iconRect.top + iconRect.height / 2;

    return {
      value: input?.value ?? null,
      placeholder: input?.getAttribute("placeholder") ?? null,
      ariaInvalid: input?.getAttribute("aria-invalid") ?? null,
      ariaRequired: input?.getAttribute("aria-required") ?? null,
      required: input?.required ?? null,
      disabled: input?.disabled ?? null,
      readOnly: input?.readOnly ?? null,
      root: relativeRect(rootRect, rootRect),
      label: relativeRect(labelRect, rootRect),
      group: relativeRect(groupRect, rootRect),
      input: relativeRect(inputRect, rootRect),
      invalidIcon: relativeRect(iconRect, rootRect),
      helpText: relativeRect(helpRect, rootRect),
      labelToGroupGap: numberOrNull(
        labelRect == null || groupRect == null ? null : groupRect.top - labelRect.bottom,
      ),
      groupToHelpGap: numberOrNull(
        groupRect == null || helpRect == null ? null : helpRect.top - groupRect.bottom,
      ),
      inputCenterDelta: numberOrNull(
        inputCenterY == null || groupCenterY == null ? null : inputCenterY - groupCenterY,
      ),
      iconCenterDelta: numberOrNull(
        iconCenterY == null || groupCenterY == null ? null : iconCenterY - groupCenterY,
      ),
      groupBorderColor: groupStyle?.borderColor ?? null,
      groupBackground: groupStyle?.backgroundColor ?? null,
      inputColor: inputStyle?.color ?? null,
      helpColor: helpStyle?.color ?? null,
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

test.describe("comparison TextField visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await textFieldFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "TextField default state",
      { maxMismatchRatio: 0.16, maxDimensionDelta: 24, pixelThreshold: 64 },
    );
  });

  test("invalid required XL state matches current React Spectrum", async ({ page }) => {
    const fixtures = await textFieldFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "TextField invalid required XL state",
      { maxMismatchRatio: 0.16, maxDimensionDelta: 24, pixelThreshold: 64 },
    );
  });

  test("invalid required XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await textFieldFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: "Quarterly report",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: "Quarterly report",
    });

    const react = await textFieldGeometry(fixtures.reactRoot);
    const solid = await textFieldGeometry(fixtures.solidRoot);

    expect(solid.value).toBe(react.value);
    expect(solid.placeholder).toBe(react.placeholder);
    expect(solid.ariaInvalid).toBe(react.ariaInvalid);
    expect(solid.required).toBe(react.required);
    expect([react.ariaRequired, "true"]).toContain(solid.ariaRequired);
    expect(solid.disabled).toBe(react.disabled);
    expect(solid.readOnly).toBe(react.readOnly);
    expect(solid.groupBorderColor).toBe(react.groupBorderColor);
    expect(solid.groupBackground).toBe(react.groupBackground);
    expect(solid.inputColor).toBe(react.inputColor);
    expect(solid.helpColor).toBe(react.helpColor);

    expectNear(solid.group?.width ?? null, react.group?.width ?? null, 1, "TextField group width");
    expectNear(
      solid.group?.height ?? null,
      react.group?.height ?? null,
      1,
      "TextField group height",
    );
    expectNear(
      solid.input?.height ?? null,
      react.input?.height ?? null,
      1,
      "TextField input height",
    );
    expectNear(
      solid.invalidIcon?.width ?? null,
      react.invalidIcon?.width ?? null,
      1,
      "TextField invalid icon width",
    );
    expectNear(
      solid.invalidIcon?.height ?? null,
      react.invalidIcon?.height ?? null,
      1,
      "TextField invalid icon height",
    );
    expectNear(solid.labelToGroupGap, react.labelToGroupGap, 1, "TextField label-to-group gap");
    expectNear(solid.groupToHelpGap, react.groupToHelpGap, 1, "TextField group-to-help gap");
    expectNear(solid.inputCenterDelta, react.inputCenterDelta, 1, "TextField input centerline");
    expectNear(
      solid.iconCenterDelta,
      react.iconCenterDelta,
      1,
      "TextField invalid icon centerline",
    );
  });

  test("typing updates controlled value on both stacks", async ({ page }) => {
    const fixtures = await textFieldFixtures(page);

    for (const item of [
      { panel: fixtures.reactPanel, input: fixtures.reactInput },
      { panel: fixtures.solidPanel, input: fixtures.solidInput },
    ]) {
      await expect(item.input).toHaveValue("Quarterly report");
      await item.input.fill("Quarterly report updated");
      await expect(item.input).toHaveValue("Quarterly report updated");
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        "Quarterly report updated",
      );
    }
  });
});
