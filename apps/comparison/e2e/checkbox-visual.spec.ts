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

function checkboxInput(root: Locator) {
  return root.locator('input[type="checkbox"]').first();
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
    const rootStyle = window.getComputedStyle(element);
    const boxStyle = box == null ? null : window.getComputedStyle(box);
    const boxRect = box?.getBoundingClientRect();
    const iconRect = icon?.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const boxCenterY = boxRect == null ? null : boxRect.top + boxRect.height / 2;
    const iconCenterY = iconRect == null ? null : iconRect.top + iconRect.height / 2;

    return {
      checked: input?.checked ?? false,
      indeterminate: input?.indeterminate ?? false,
      ariaChecked: input?.getAttribute("aria-checked") ?? null,
      name: input?.getAttribute("name") ?? null,
      value: input?.getAttribute("value") ?? null,
      form: input?.getAttribute("form") ?? null,
      required: input?.required ?? false,
      ariaRequired: input?.getAttribute("aria-required") ?? null,
      ariaInvalid: input?.getAttribute("aria-invalid") ?? null,
      disabled: input?.disabled ?? false,
      readOnly: input?.getAttribute("aria-readonly") === "true",
      rootDataDisabled: element.getAttribute("data-disabled"),
      rootDataFocused: element.getAttribute("data-focused"),
      rootDataFocusVisible: element.getAttribute("data-focus-visible"),
      rootDataHovered: element.getAttribute("data-hovered"),
      rootDataInvalid: element.getAttribute("data-invalid"),
      rootDataIndeterminate: element.getAttribute("data-indeterminate"),
      rootDataPressed: element.getAttribute("data-pressed"),
      rootDataReadonly: element.getAttribute("data-readonly"),
      rootDataSelected: element.getAttribute("data-selected"),
      rootHeight: Number(rootRect.height.toFixed(4)),
      rootColor: rootStyle.color,
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
      boxBoxShadow: boxStyle?.boxShadow ?? null,
      boxOutlineColor: boxStyle?.outlineColor ?? null,
      boxOutlineOffset: boxStyle?.outlineOffset ?? null,
      boxOutlineStyle: boxStyle?.outlineStyle ?? null,
      boxOutlineWidth: boxStyle?.outlineWidth ?? null,
      boxTransform: boxStyle?.transform ?? null,
      boxWillChange: boxStyle?.willChange ?? null,
    };
  });
}

type CheckboxGeometry = Awaited<ReturnType<typeof checkboxGeometry>>;

async function waitForMatchingCheckboxGeometry(
  reactRoot: Locator,
  solidRoot: Locator,
  keys: Array<keyof CheckboxGeometry>,
) {
  let latest: { react: CheckboxGeometry; solid: CheckboxGeometry } | undefined;

  await expect
    .poll(
      async () => {
        const [react, solid] = await Promise.all([
          checkboxGeometry(reactRoot),
          checkboxGeometry(solidRoot),
        ]);
        latest = { react, solid };
        return keys.every((key) => react[key] === solid[key]);
      },
      { message: `Checkbox geometry should match for ${keys.join(", ")}` },
    )
    .toBe(true);

  return latest!;
}

async function waitForCheckboxGeometryValues(
  root: Locator,
  reference: CheckboxGeometry,
  keys: Array<keyof CheckboxGeometry>,
) {
  let latest: CheckboxGeometry | undefined;

  await expect
    .poll(
      async () => {
        latest = await checkboxGeometry(root);
        return keys
          .filter((key) => latest![key] !== reference[key])
          .map((key) => `${String(key)}: ${String(latest![key])} !== ${String(reference[key])}`)
          .join("\n");
      },
      { message: `Checkbox geometry should settle for ${keys.join(", ")}` },
    )
    .toBe("");

  return latest!;
}

async function waitForStableCheckboxGeometry(root: Locator, keys: Array<keyof CheckboxGeometry>) {
  let latest: CheckboxGeometry | undefined;
  let previousSignature: string | undefined;
  let stableSamples = 0;

  await expect
    .poll(
      async () => {
        latest = await checkboxGeometry(root);
        const signature = keys.map((key) => `${String(key)}:${String(latest![key])}`).join("|");

        if (signature === previousSignature) {
          stableSamples += 1;
        } else {
          previousSignature = signature;
          stableSamples = 0;
        }

        return stableSamples >= 2 ? "" : signature;
      },
      {
        intervals: [75, 75, 75, 75, 75, 75, 75, 75],
        message: `Checkbox geometry should become stable for ${keys.join(", ")}`,
        timeout: 1500,
      },
    )
    .toBe("");

  return latest!;
}

async function setCheckboxControl(page: Page, name: string, checked: boolean) {
  const input = page.locator(
    `[data-comparison-controls="checkbox"] input[type="checkbox"][name="${name}"]`,
  );
  await expect(input).toHaveCount(1);
  if (checked) {
    await input.check();
  } else {
    await input.uncheck();
  }
}

async function checkboxBoxCenter(root: Locator) {
  return root.evaluate((element) => {
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
    if (!box) {
      throw new Error("Checkbox box not found");
    }

    const rect = box.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  });
}

async function pressCheckboxBox(page: Page, root: Locator) {
  const center = await checkboxBoxCenter(root);
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  await page.waitForTimeout(50);
  const geometry = await checkboxGeometry(root);
  await page.mouse.up();
  return geometry;
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

function matrixTranslateZ(transform: string | null) {
  if (transform == null || transform === "none") {
    return null;
  }

  const match = transform.match(/^matrix3d\((.+)\)$/);
  if (!match) {
    return null;
  }

  const values = match[1].split(",").map((value) => Number.parseFloat(value.trim()));
  return values.length >= 15 ? values[14] : null;
}

function expectCheckboxGeometryToMatch(
  solid: CheckboxGeometry,
  react: CheckboxGeometry,
  options: { icon?: boolean } = {},
) {
  expect(solid.checked).toBe(react.checked);
  expect(solid.indeterminate).toBe(react.indeterminate);
  expect(solid.ariaChecked).toBe(react.ariaChecked);
  expect(solid.name).toBe(react.name);
  expect(solid.value).toBe(react.value);
  expect(solid.form).toBe(react.form);
  expect(solid.required).toBe(react.required);
  expect(solid.ariaRequired).toBe(react.ariaRequired);
  expect(solid.ariaInvalid).toBe(react.ariaInvalid);
  expect(solid.disabled).toBe(react.disabled);
  expect(solid.readOnly).toBe(react.readOnly);
  expect(solid.rootDataFocused).toBe(react.rootDataFocused);
  expect(solid.rootDataFocusVisible).toBe(react.rootDataFocusVisible);
  expect(solid.rootDataHovered).toBe(react.rootDataHovered);
  expect(solid.rootDataIndeterminate).toBe(react.rootDataIndeterminate);
  expect(solid.rootDataSelected).toBe(react.rootDataSelected);
  expect(solid.boxBackground).toBe(react.boxBackground);
  expect(solid.boxBorderColor).toBe(react.boxBorderColor);
  expect(solid.boxBoxShadow).toBe(react.boxBoxShadow);
  expect(solid.boxOutlineColor).toBe(react.boxOutlineColor);
  expect(solid.boxOutlineOffset).toBe(react.boxOutlineOffset);
  expect(solid.boxOutlineStyle).toBe(react.boxOutlineStyle);
  expect(solid.boxOutlineWidth).toBe(react.boxOutlineWidth);
  expect(solid.rootColor).toBe(react.rootColor);
  expectNear(solid.rootHeight, react.rootHeight, 0.75, "Checkbox root height");
  expectNear(solid.boxWidth, react.boxWidth, 0.75, "Checkbox box width");
  expectNear(solid.boxHeight, react.boxHeight, 0.75, "Checkbox box height");
  expectNear(solid.boxCenterDelta, react.boxCenterDelta, 0.75, "Checkbox box centerline");

  if (options.icon) {
    expectNear(solid.iconWidth, react.iconWidth, 0.75, "Checkbox icon width");
    expectNear(solid.iconHeight, react.iconHeight, 0.75, "Checkbox icon height");
    expectNear(solid.iconCenterDelta, react.iconCenterDelta, 0.75, "Checkbox icon centerline");
  } else {
    expect(solid.iconWidth).toBe(react.iconWidth);
    expect(solid.iconHeight).toBe(react.iconHeight);
  }
}

test.describe("comparison Checkbox visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await checkboxFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Checkbox default",
      {
        maxMismatchRatio: 0.16,
        maxDimensionDelta: 16,
        pixelThreshold: 64,
      },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      children: "Enable alerts",
      size: "M",
      selectionSource: "isSelected",
      isSelected: false,
      defaultSelected: false,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      children: "Enable alerts",
      size: "M",
      selectionSource: "isSelected",
      isSelected: false,
      defaultSelected: false,
    });
    await expect(fixtures.reactCheckbox).not.toBeChecked();
    await expect(fixtures.solidCheckbox).not.toBeChecked();

    expectCheckboxGeometryToMatch(
      await checkboxGeometry(fixtures.solidRoot),
      await checkboxGeometry(fixtures.reactRoot),
    );
  });

  test("selected emphasized XL state matches current React Spectrum", async ({ page }) => {
    const fixtures = await checkboxFixtures(page, "?isSelected=true&isEmphasized=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Checkbox selected emphasized XL state",
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

    expectCheckboxGeometryToMatch(solid, react, { icon: true });
  });

  test("defaultSelected initializes uncontrolled value and form props", async ({ page }) => {
    const fixtures = await checkboxFixtures(
      page,
      "?selectionSource=defaultSelected&defaultSelected=true&name=alerts&value=email&form=settingsForm&isRequired=true&validationBehavior=aria",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectionSource: "defaultSelected",
      defaultSelected: true,
      name: "alerts",
      value: "email",
      form: "settingsForm",
      isRequired: true,
      validationBehavior: "aria",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectionSource: "defaultSelected",
      defaultSelected: true,
      name: "alerts",
      value: "email",
      form: "settingsForm",
      isRequired: true,
      validationBehavior: "aria",
    });
    await expect(fixtures.reactCheckbox).toBeChecked();
    await expect(fixtures.solidCheckbox).toBeChecked();
    await expect(checkboxInput(fixtures.reactRoot)).toHaveAttribute("name", "alerts");
    await expect(checkboxInput(fixtures.solidRoot)).toHaveAttribute("name", "alerts");
    await expect(checkboxInput(fixtures.reactRoot)).toHaveAttribute("value", "email");
    await expect(checkboxInput(fixtures.solidRoot)).toHaveAttribute("value", "email");
    await expect(checkboxInput(fixtures.reactRoot)).toHaveAttribute("form", "settingsForm");
    await expect(checkboxInput(fixtures.solidRoot)).toHaveAttribute("form", "settingsForm");
    await expect(checkboxInput(fixtures.reactRoot)).toHaveJSProperty("required", false);
    await expect(checkboxInput(fixtures.solidRoot)).toHaveJSProperty("required", false);
    await expect(checkboxInput(fixtures.reactRoot)).toHaveAttribute("aria-required", "true");
    await expect(checkboxInput(fixtures.solidRoot)).toHaveAttribute("aria-required", "true");

    expectCheckboxGeometryToMatch(
      await checkboxGeometry(fixtures.solidRoot),
      await checkboxGeometry(fixtures.reactRoot),
      { icon: true },
    );

    await fixtures.reactRoot.click();
    await fixtures.solidRoot.click();
    await expect(fixtures.reactCheckbox).not.toBeChecked();
    await expect(fixtures.solidCheckbox).not.toBeChecked();
    await expect(fixtures.reactPanel.locator("[data-comparison-checked]").first()).toHaveAttribute(
      "data-comparison-checked",
      "false",
    );
    await expect(fixtures.solidPanel.locator("[data-comparison-checked]").first()).toHaveAttribute(
      "data-comparison-checked",
      "false",
    );
  });

  test("required default and native validation match React Spectrum", async ({ page }) => {
    for (const query of [
      "?isRequired=true&name=alerts&value=email",
      "?isRequired=true&validationBehavior=native&name=alerts&value=email",
    ]) {
      const fixtures = await checkboxFixtures(page, query);

      expect(await controlProps(fixtures.reactRoot)).toMatchObject({
        isRequired: true,
        name: "alerts",
        value: "email",
      });
      expect(await controlProps(fixtures.solidRoot)).toMatchObject({
        isRequired: true,
        name: "alerts",
        value: "email",
      });

      const react = await checkboxGeometry(fixtures.reactRoot);
      const solid = await checkboxGeometry(fixtures.solidRoot);

      expect(react.required).toBe(true);
      expect(react.ariaRequired).toBeNull();
      expect(solid.required).toBe(true);
      expect(solid.ariaRequired).toBeNull();
      expectCheckboxGeometryToMatch(solid, react);
    }
  });

  test("indeterminate emphasized XL state matches React Spectrum", async ({ page }) => {
    const fixtures = await checkboxFixtures(
      page,
      "?isIndeterminate=true&isEmphasized=true&size=XL",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      isIndeterminate: true,
      isEmphasized: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      isIndeterminate: true,
      isEmphasized: true,
    });
    await expect(checkboxInput(fixtures.reactRoot)).toHaveJSProperty("indeterminate", true);
    await expect(checkboxInput(fixtures.solidRoot)).toHaveJSProperty("indeterminate", true);

    const react = await checkboxGeometry(fixtures.reactRoot);
    const solid = await checkboxGeometry(fixtures.solidRoot);

    expect(react.rootDataIndeterminate).toBe("true");
    expect(solid.rootDataIndeterminate).toBe("true");
    expectCheckboxGeometryToMatch(solid, react, { icon: true });
  });

  test("hover and focus-visible states match React Spectrum", async ({ page }) => {
    const fixtures = await checkboxFixtures(page);
    const settledStyleKeys: Array<keyof CheckboxGeometry> = [
      "rootColor",
      "boxBackground",
      "boxBorderColor",
      "boxBoxShadow",
      "boxOutlineColor",
      "boxOutlineOffset",
      "boxOutlineStyle",
      "boxOutlineWidth",
    ];

    await fixtures.reactRoot.hover();
    await expect(fixtures.reactRoot).toHaveAttribute("data-hovered", "true");
    const reactHover = await waitForStableCheckboxGeometry(fixtures.reactRoot, settledStyleKeys);

    await fixtures.solidRoot.hover();
    await expect(fixtures.solidRoot).toHaveAttribute("data-hovered", "true");
    const solidHover = await waitForCheckboxGeometryValues(
      fixtures.solidRoot,
      reactHover,
      settledStyleKeys,
    );

    expectCheckboxGeometryToMatch(solidHover, reactHover);

    await clearPointer(page);
    await fixtures.reactCheckbox.focus();
    await expect(fixtures.reactCheckbox).toBeFocused();
    await expect(fixtures.reactRoot).toHaveAttribute("data-focused", "true");
    await expect(fixtures.reactRoot).toHaveAttribute("data-focus-visible", "true");
    const reactFocus = await waitForStableCheckboxGeometry(fixtures.reactRoot, settledStyleKeys);

    await fixtures.solidCheckbox.focus();
    await expect(fixtures.solidCheckbox).toBeFocused();
    await expect(fixtures.solidRoot).toHaveAttribute("data-focused", "true");
    await expect(fixtures.solidRoot).toHaveAttribute("data-focus-visible", "true");
    const solidFocus = await waitForCheckboxGeometryValues(
      fixtures.solidRoot,
      reactFocus,
      settledStyleKeys,
    );

    expectCheckboxGeometryToMatch(solidFocus, reactFocus);
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

      await item.panel.getByText("Enable alerts", { exact: true }).click();
      await expect(item.checkbox).not.toBeChecked();
      await expect(item.panel.locator("[data-comparison-checked]").first()).toHaveAttribute(
        "data-comparison-checked",
        "false",
      );

      await item.root.click();
      await expect(item.checkbox).toBeChecked();
      await expect(item.panel.locator("[data-comparison-checked]").first()).toHaveAttribute(
        "data-comparison-checked",
        "true",
      );
    }
  });

  test("side-panel invalid, readonly, and disabled states match React Spectrum", async ({
    page,
  }) => {
    const fixtures = await checkboxFixtures(page);

    await setCheckboxControl(page, "isInvalid", true);
    await expect
      .poll(() => controlProps(fixtures.reactRoot))
      .toMatchObject({
        isInvalid: true,
      });
    await expect
      .poll(() => controlProps(fixtures.solidRoot))
      .toMatchObject({
        isInvalid: true,
      });

    let { react, solid } = await waitForMatchingCheckboxGeometry(
      fixtures.reactRoot,
      fixtures.solidRoot,
      ["boxBorderColor"],
    );
    expect(solid.ariaInvalid).toBe(react.ariaInvalid);
    expect(solid.rootDataInvalid).toBe("true");
    expect(solid.boxBorderColor).toBe(react.boxBorderColor);

    await setCheckboxControl(page, "isReadOnly", true);
    await expect
      .poll(() => controlProps(fixtures.reactRoot))
      .toMatchObject({
        isReadOnly: true,
      });
    await expect
      .poll(() => controlProps(fixtures.solidRoot))
      .toMatchObject({
        isReadOnly: true,
      });
    await fixtures.reactRoot.hover();
    react = await checkboxGeometry(fixtures.reactRoot);
    expect(react.rootDataHovered).toBeNull();
    await fixtures.solidRoot.hover();
    ({ react, solid } = await waitForMatchingCheckboxGeometry(
      fixtures.reactRoot,
      fixtures.solidRoot,
      ["rootColor"],
    ));
    expect(solid.readOnly).toBe(react.readOnly);
    expect(solid.rootDataReadonly).toBe("true");
    expect(solid.rootDataHovered).toBeNull();
    expect(solid.rootColor).toBe(react.rootColor);

    await setCheckboxControl(page, "isDisabled", true);
    await expect
      .poll(() => controlProps(fixtures.reactRoot))
      .toMatchObject({
        isDisabled: true,
      });
    await expect
      .poll(() => controlProps(fixtures.solidRoot))
      .toMatchObject({
        isDisabled: true,
      });
    await fixtures.reactRoot.hover({ force: true });
    react = await checkboxGeometry(fixtures.reactRoot);
    expect(react.rootDataHovered).toBeNull();
    await fixtures.solidRoot.hover({ force: true });
    ({ react, solid } = await waitForMatchingCheckboxGeometry(
      fixtures.reactRoot,
      fixtures.solidRoot,
      ["boxBackground", "boxBorderColor", "rootColor"],
    ));
    expect(solid.disabled).toBe(react.disabled);
    expect(solid.rootDataDisabled).toBe("true");
    expect(solid.rootDataHovered).toBeNull();
    expect(solid.boxBackground).toBe(react.boxBackground);
    expect(solid.boxBorderColor).toBe(react.boxBorderColor);
    expect(solid.rootColor).toBe(react.rootColor);
  });

  test("pressed transform matches React Spectrum and is suppressed when inactive", async ({
    page,
  }) => {
    const fixtures = await checkboxFixtures(page);

    const reactPressed = await pressCheckboxBox(page, fixtures.reactRoot);
    const solidPressed = await pressCheckboxBox(page, fixtures.solidRoot);
    expectNear(
      matrixTranslateZ(solidPressed.boxTransform),
      matrixTranslateZ(reactPressed.boxTransform),
      0.5,
      "Checkbox pressed translateZ",
    );
    expect(solidPressed.boxWillChange).toBe(reactPressed.boxWillChange);

    await setCheckboxControl(page, "isReadOnly", true);
    await expect
      .poll(() => controlProps(fixtures.reactRoot))
      .toMatchObject({
        isReadOnly: true,
      });
    await expect
      .poll(() => controlProps(fixtures.solidRoot))
      .toMatchObject({
        isReadOnly: true,
      });
    const reactReadonlyPressed = await pressCheckboxBox(page, fixtures.reactRoot);
    const solidReadonlyPressed = await pressCheckboxBox(page, fixtures.solidRoot);
    expect(reactReadonlyPressed.rootDataPressed).toBeNull();
    expect(reactReadonlyPressed.boxTransform).toBe("none");
    expect(solidReadonlyPressed.rootDataPressed).toBeNull();
    expect(solidReadonlyPressed.boxTransform).toBe("none");

    await setCheckboxControl(page, "isDisabled", true);
    await expect
      .poll(() => controlProps(fixtures.reactRoot))
      .toMatchObject({
        isDisabled: true,
      });
    await expect
      .poll(() => controlProps(fixtures.solidRoot))
      .toMatchObject({
        isDisabled: true,
      });
    const reactDisabledPressed = await pressCheckboxBox(page, fixtures.reactRoot);
    const solidDisabledPressed = await pressCheckboxBox(page, fixtures.solidRoot);
    expect(reactDisabledPressed.rootDataPressed).toBeNull();
    expect(reactDisabledPressed.boxTransform).toBe("none");
    expect(solidDisabledPressed.rootDataPressed).toBeNull();
    expect(solidDisabledPressed.boxTransform).toBe("none");
  });
});
