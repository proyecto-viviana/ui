import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function searchFieldFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/searchfield/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="searchfield"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="searchfield"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactInput: reactPanel.getByRole("searchbox", { name: "Search" }).first(),
    solidInput: solidPanel.getByRole("searchbox", { name: "Search" }).first(),
    reactClear: reactPanel.getByRole("button", { name: /clear/i }).first(),
    solidClear: solidPanel.getByRole("button", { name: /clear/i }).first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function searchFieldGeometry(root: Locator) {
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
    const input = element.querySelector<HTMLInputElement>("input[type='search']");
    const fieldGroup = input?.parentElement ?? null;
    const label = element.querySelector("label");
    const helpTextLeaf = Array.from(element.querySelectorAll<HTMLElement>("*")).find(
      (candidate) =>
        candidate.children.length === 0 && candidate.textContent?.trim() === "Enter a search term.",
    );
    const helpTextParent = helpTextLeaf?.parentElement;
    const helpText =
      helpTextParent != null && window.getComputedStyle(helpTextParent).display === "flex"
        ? helpTextParent
        : helpTextLeaf;
    const searchIcon = fieldGroup?.querySelector<SVGElement>("div[slot='icon'] svg, svg");
    const clearButton = fieldGroup?.querySelector<HTMLButtonElement>("button");
    const clearIcon = clearButton?.querySelector<SVGElement>("svg");
    const groupStyle = fieldGroup == null ? null : window.getComputedStyle(fieldGroup);
    const inputStyle = input == null ? null : window.getComputedStyle(input);
    const clearButtonStyle = clearButton == null ? null : window.getComputedStyle(clearButton);
    const clearIconStyle = clearIcon == null ? null : window.getComputedStyle(clearIcon);
    const helpStyle = helpText == null ? null : window.getComputedStyle(helpText);
    const labelRect = label?.getBoundingClientRect();
    const groupRect = fieldGroup?.getBoundingClientRect();
    const inputRect = input?.getBoundingClientRect();
    const iconRect = searchIcon?.getBoundingClientRect();
    const buttonRect = clearButton?.getBoundingClientRect();
    const clearIconRect = clearIcon?.getBoundingClientRect();
    const helpRect = helpText?.getBoundingClientRect();
    const groupCenterY = groupRect == null ? null : groupRect.top + groupRect.height / 2;
    const inputCenterY = inputRect == null ? null : inputRect.top + inputRect.height / 2;
    const iconCenterY = iconRect == null ? null : iconRect.top + iconRect.height / 2;
    const buttonCenterY = buttonRect == null ? null : buttonRect.top + buttonRect.height / 2;

    return {
      value: input?.value ?? null,
      placeholder: input?.getAttribute("placeholder") ?? null,
      ariaInvalid: input?.getAttribute("aria-invalid") ?? null,
      ariaRequired: input?.getAttribute("aria-required") ?? null,
      required: input?.required ?? null,
      disabled: input?.disabled ?? null,
      readOnly: input?.readOnly ?? null,
      label: relativeRect(labelRect, rootRect),
      group: relativeRect(groupRect, rootRect),
      input: relativeRect(inputRect, rootRect),
      searchIcon: relativeRect(iconRect, rootRect),
      clearButton: relativeRect(buttonRect, rootRect),
      clearIcon: relativeRect(clearIconRect, rootRect),
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
      clearCenterDelta: numberOrNull(
        buttonCenterY == null || groupCenterY == null ? null : buttonCenterY - groupCenterY,
      ),
      groupBorderColor: groupStyle?.borderColor ?? null,
      groupBackground: groupStyle?.backgroundColor ?? null,
      inputColor: inputStyle?.color ?? null,
      clearButtonComputedWidth: clearButtonStyle?.width ?? null,
      clearButtonComputedHeight: clearButtonStyle?.height ?? null,
      clearButtonFontSize: clearButtonStyle?.fontSize ?? null,
      clearIconComputedWidth: clearIconStyle?.width ?? null,
      clearIconComputedHeight: clearIconStyle?.height ?? null,
      clearIconFontSize: clearIconStyle?.fontSize ?? null,
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

function cssPixelNumber(value: string | null) {
  return value == null ? null : Number.parseFloat(value);
}

test.describe("comparison SearchField visual parity", () => {
  test("invalid required XL state matches current React Spectrum", async ({ page }) => {
    const fixtures = await searchFieldFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "SearchField invalid required XL state",
      { maxMismatchRatio: 0.2, maxDimensionDelta: 24, pixelThreshold: 64 },
    );
  });

  test("invalid required XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await searchFieldFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: "status",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: "status",
    });

    const react = await searchFieldGeometry(fixtures.reactRoot);
    const solid = await searchFieldGeometry(fixtures.solidRoot);

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
    expect(solid.clearButtonFontSize).toBe(react.clearButtonFontSize);
    expect(solid.clearIconFontSize).toBe(react.clearIconFontSize);

    expectNear(
      solid.group?.width ?? null,
      react.group?.width ?? null,
      1,
      "SearchField group width",
    );
    expectNear(
      solid.group?.height ?? null,
      react.group?.height ?? null,
      1,
      "SearchField group height",
    );
    expectNear(
      solid.input?.height ?? null,
      react.input?.height ?? null,
      1,
      "SearchField input height",
    );
    expectNear(
      solid.searchIcon?.width ?? null,
      react.searchIcon?.width ?? null,
      1,
      "SearchField icon width",
    );
    expectNear(
      solid.searchIcon?.height ?? null,
      react.searchIcon?.height ?? null,
      1,
      "SearchField icon height",
    );
    expectNear(
      solid.clearButton?.width ?? null,
      react.clearButton?.width ?? null,
      1,
      "SearchField clear button width",
    );
    expectNear(
      solid.clearButton?.height ?? null,
      react.clearButton?.height ?? null,
      1,
      "SearchField clear button height",
    );
    expectNear(
      cssPixelNumber(solid.clearButtonComputedWidth),
      cssPixelNumber(react.clearButtonComputedWidth),
      1,
      "SearchField clear button computed width",
    );
    expectNear(
      cssPixelNumber(solid.clearButtonComputedHeight),
      cssPixelNumber(react.clearButtonComputedHeight),
      1,
      "SearchField clear button computed height",
    );
    expectNear(
      solid.clearIcon?.width ?? null,
      react.clearIcon?.width ?? null,
      1,
      "SearchField clear icon width",
    );
    expectNear(
      solid.clearIcon?.height ?? null,
      react.clearIcon?.height ?? null,
      1,
      "SearchField clear icon height",
    );
    expectNear(
      cssPixelNumber(solid.clearIconComputedWidth),
      cssPixelNumber(react.clearIconComputedWidth),
      1,
      "SearchField clear icon computed width",
    );
    expectNear(
      cssPixelNumber(solid.clearIconComputedHeight),
      cssPixelNumber(react.clearIconComputedHeight),
      1,
      "SearchField clear icon computed height",
    );
    expectNear(solid.labelToGroupGap, react.labelToGroupGap, 1, "SearchField label-to-group gap");
    expectNear(solid.groupToHelpGap, react.groupToHelpGap, 1, "SearchField group-to-help gap");
    expectNear(solid.inputCenterDelta, react.inputCenterDelta, 1, "SearchField input centerline");
    expectNear(solid.iconCenterDelta, react.iconCenterDelta, 1, "SearchField icon centerline");
    expectNear(
      solid.clearCenterDelta,
      react.clearCenterDelta,
      1,
      "SearchField clear button centerline",
    );
  });

  test("typing and clear update controlled value on both stacks", async ({ page }) => {
    const fixtures = await searchFieldFixtures(page);

    for (const item of [
      { panel: fixtures.reactPanel, input: fixtures.reactInput, clear: fixtures.reactClear },
      { panel: fixtures.solidPanel, input: fixtures.solidInput, clear: fixtures.solidClear },
    ]) {
      await expect(item.input).toHaveValue("status");
      await item.input.fill("status updated");
      await expect(item.input).toHaveValue("status updated");
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        "status updated",
      );

      await item.input.evaluate((input) => {
        input.setAttribute("data-focus-stability-marker", "search-clear");
      });
      await item.clear.click();
      const clearState = await item.panel.evaluate((panel) => {
        const markedInputs = panel.querySelectorAll<HTMLInputElement>(
          'input[data-focus-stability-marker="search-clear"]',
        );
        const input = markedInputs[0] ?? null;
        return {
          activeIsMarkedInput: input != null && document.activeElement === input,
          activeTag: document.activeElement?.tagName ?? null,
          inputValue: input?.value ?? null,
          markedInputCount: markedInputs.length,
          valueMarker:
            panel.querySelector("[data-comparison-value]")?.getAttribute("data-comparison-value") ??
            null,
        };
      });
      expect(clearState).toEqual({
        activeIsMarkedInput: true,
        activeTag: "INPUT",
        inputValue: "",
        markedInputCount: 1,
        valueMarker: "",
      });
      await expect(item.panel.locator("[data-comparison-clear-count]").first()).toHaveAttribute(
        "data-comparison-clear-count",
        "1",
      );
    }
  });
});
