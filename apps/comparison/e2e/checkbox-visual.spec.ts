import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function checkboxFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/checkbox/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="checkbox"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="checkbox"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactCheckbox: reactPanel.getByRole("checkbox", { name: "Enable alerts" }).first(),
    solidCheckbox: solidPanel.getByRole("checkbox", { name: "Enable alerts" }).first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function checkboxGeometry(root: Locator) {
  return root.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const input = element.querySelector<HTMLInputElement>('input[type="checkbox"]');
    const box = Array.from(element.querySelectorAll<HTMLElement>("div, span")).find((candidate) => {
      const style = window.getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();
      return (
        style.borderStyle !== "none" &&
        Number.parseFloat(style.borderWidth) > 0 &&
        Math.abs(rect.width - rect.height) <= 2 &&
        rect.width >= 12 &&
        rect.width <= 32
      );
    });
    const icon = box?.querySelector<SVGElement>("svg");
    const boxStyle = box == null ? null : window.getComputedStyle(box);
    const boxRect = box?.getBoundingClientRect();
    const iconRect = icon?.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const boxCenterY = boxRect == null ? null : boxRect.top + boxRect.height / 2;
    const iconCenterY = iconRect == null ? null : iconRect.top + iconRect.height / 2;

    return {
      checked: input?.checked ?? false,
      ariaInvalid: input?.getAttribute("aria-invalid") ?? null,
      disabled: input?.disabled ?? false,
      readOnly: input?.getAttribute("aria-readonly") === "true",
      rootHeight: Number(rootRect.height.toFixed(4)),
      boxWidth: numberOrNull(boxRect?.width),
      boxHeight: numberOrNull(boxRect?.height),
      boxCenterDelta: numberOrNull(boxCenterY == null ? null : boxCenterY - rootCenterY),
      iconWidth: numberOrNull(iconRect?.width),
      iconHeight: numberOrNull(iconRect?.height),
      iconCenterDelta: numberOrNull(
        iconCenterY == null || boxCenterY == null ? null : iconCenterY - boxCenterY,
      ),
      boxBackground: boxStyle?.backgroundColor ?? null,
      boxBorderColor: boxStyle?.borderColor ?? null,
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

test.describe("comparison Checkbox visual parity", () => {
  test("selected emphasized XL state has committed pair screenshots", async ({ page }) => {
    const fixtures = await checkboxFixtures(page, "?isSelected=true&isEmphasized=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Checkbox selected emphasized XL state",
      "checkbox-selected-emphasized-xl",
      { maxMismatchRatio: 0.16, maxDimensionDelta: 16, pixelThreshold: 64 },
    );
  });

  test("selected emphasized XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await checkboxFixtures(page, "?isSelected=true&isEmphasized=true&size=XL");

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      isSelected: true,
      isEmphasized: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      isSelected: true,
      isEmphasized: true,
    });
    await expect(fixtures.reactCheckbox).toBeChecked();
    await expect(fixtures.solidCheckbox).toBeChecked();

    const react = await checkboxGeometry(fixtures.reactRoot);
    const solid = await checkboxGeometry(fixtures.solidRoot);

    expect(solid.checked).toBe(react.checked);
    expect(solid.boxBackground).toBe(react.boxBackground);
    expect(solid.boxBorderColor).toBe(react.boxBorderColor);
    expectNear(solid.rootHeight, react.rootHeight, 0.75, "Checkbox root height");
    expectNear(solid.boxWidth, react.boxWidth, 0.75, "Checkbox box width");
    expectNear(solid.boxHeight, react.boxHeight, 0.75, "Checkbox box height");
    expectNear(solid.boxCenterDelta, react.boxCenterDelta, 0.75, "Checkbox box centerline");
    expectNear(solid.iconWidth, react.iconWidth, 0.75, "Checkbox icon width");
    expectNear(solid.iconHeight, react.iconHeight, 0.75, "Checkbox icon height");
    expectNear(solid.iconCenterDelta, react.iconCenterDelta, 0.75, "Checkbox icon centerline");
  });

  test("click toggles selected state on both stacks", async ({ page }) => {
    const fixtures = await checkboxFixtures(page);

    for (const item of [
      { panel: fixtures.reactPanel, root: fixtures.reactRoot, checkbox: fixtures.reactCheckbox },
      { panel: fixtures.solidPanel, root: fixtures.solidRoot, checkbox: fixtures.solidCheckbox },
    ]) {
      await expect(item.checkbox).not.toBeChecked();
      await item.root.click();
      await expect(item.checkbox).toBeChecked();
      await expect(item.panel.locator("[data-comparison-checked]").first()).toHaveAttribute(
        "data-comparison-checked",
        "true",
      );
    }
  });
});
