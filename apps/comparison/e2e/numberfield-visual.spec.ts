import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function numberFieldFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/numberfield/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="numberfield"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="numberfield"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactInput: reactRoot.locator("input").first(),
    solidInput: solidRoot.locator("input").first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean | number
  >;
}

async function numberFieldGeometry(root: Locator) {
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
    const label =
      element.querySelector("label") ??
      Array.from(element.querySelectorAll<HTMLElement>("*")).find(
        (candidate) =>
          candidate.children.length === 0 && candidate.textContent?.trim() === "Quantity",
      ) ??
      null;
    const helpTextLeaf = Array.from(element.querySelectorAll<HTMLElement>("*")).find(
      (candidate) =>
        candidate.children.length === 0 &&
        candidate.textContent?.trim() === "Quantity is required.",
    );
    const helpTextParent = helpTextLeaf?.parentElement;
    const helpText =
      helpTextParent != null && window.getComputedStyle(helpTextParent).display === "flex"
        ? helpTextParent
        : helpTextLeaf;
    const allButtons = Array.from(
      element.querySelectorAll<HTMLElement>("button,[role='button']"),
    ).filter((candidate) => candidate.getBoundingClientRect().width > 0);
    const decrementButton = allButtons[0] ?? null;
    const incrementButton = allButtons[1] ?? null;
    const decrementIcon = decrementButton?.querySelector<SVGElement>("svg") ?? null;
    const incrementIcon = incrementButton?.querySelector<SVGElement>("svg") ?? null;
    const invalidIcon =
      Array.from(fieldGroup?.querySelectorAll<SVGElement>("svg") ?? []).find(
        (icon) => icon.closest("button,[role='button']") == null,
      ) ?? null;
    const groupStyle = fieldGroup == null ? null : window.getComputedStyle(fieldGroup);
    const inputStyle = input == null ? null : window.getComputedStyle(input);
    const decrementButtonStyle =
      decrementButton == null ? null : window.getComputedStyle(decrementButton);
    const decrementIconStyle =
      decrementIcon == null ? null : window.getComputedStyle(decrementIcon);
    const helpStyle = helpText == null ? null : window.getComputedStyle(helpText);
    const labelRect = label?.getBoundingClientRect();
    const groupRect = fieldGroup?.getBoundingClientRect();
    const inputRect = input?.getBoundingClientRect();
    const decrementButtonRect = decrementButton?.getBoundingClientRect();
    const incrementButtonRect = incrementButton?.getBoundingClientRect();
    const decrementIconRect = decrementIcon?.getBoundingClientRect();
    const incrementIconRect = incrementIcon?.getBoundingClientRect();
    const invalidIconRect = invalidIcon?.getBoundingClientRect();
    const helpRect = helpText?.getBoundingClientRect();
    const groupCenterY = groupRect == null ? null : groupRect.top + groupRect.height / 2;
    const inputCenterY = inputRect == null ? null : inputRect.top + inputRect.height / 2;
    const invalidIconCenterY =
      invalidIconRect == null ? null : invalidIconRect.top + invalidIconRect.height / 2;

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
      decrementButton: relativeRect(decrementButtonRect, rootRect),
      incrementButton: relativeRect(incrementButtonRect, rootRect),
      decrementIcon: relativeRect(decrementIconRect, rootRect),
      incrementIcon: relativeRect(incrementIconRect, rootRect),
      invalidIcon: relativeRect(invalidIconRect, rootRect),
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
      invalidIconCenterDelta: numberOrNull(
        invalidIconCenterY == null || groupCenterY == null
          ? null
          : invalidIconCenterY - groupCenterY,
      ),
      groupBorderColor: groupStyle?.borderColor ?? null,
      groupBackground: groupStyle?.backgroundColor ?? null,
      inputColor: inputStyle?.color ?? null,
      stepperButtonCount: allButtons.length,
      stepperButtonComputedWidth: decrementButtonStyle?.width ?? null,
      stepperButtonComputedHeight: decrementButtonStyle?.height ?? null,
      stepperButtonFontSize: decrementButtonStyle?.fontSize ?? null,
      stepperIconComputedWidth: decrementIconStyle?.width ?? null,
      stepperIconComputedHeight: decrementIconStyle?.height ?? null,
      stepperIconFontSize: decrementIconStyle?.fontSize ?? null,
      helpColor: helpStyle?.color ?? null,
    };
  });
}

async function numberFieldStepperState(root: Locator, index: number) {
  return root.evaluate((element, buttonIndex) => {
    const input = element.querySelector<HTMLInputElement>("input");
    const fieldGroup = input?.parentElement ?? null;
    const buttons = Array.from(
      element.querySelectorAll<HTMLElement>("button,[role='button']"),
    ).filter((candidate) => candidate.getBoundingClientRect().width > 0);
    const button = buttons[buttonIndex] ?? null;
    const icon = button?.querySelector<SVGElement>("svg") ?? null;
    const groupStyle = fieldGroup == null ? null : window.getComputedStyle(fieldGroup);
    const buttonStyle = button == null ? null : window.getComputedStyle(button);
    const iconStyle = icon == null ? null : window.getComputedStyle(icon);

    return {
      activeIsInput: input != null && document.activeElement === input,
      groupFocused: fieldGroup?.getAttribute("data-focused") ?? null,
      inputFocused: input?.getAttribute("data-focused") ?? null,
      groupBorderColor: groupStyle?.borderColor ?? null,
      groupBoxShadow: groupStyle?.boxShadow ?? null,
      buttonBackground: buttonStyle?.backgroundColor ?? null,
      buttonColor: buttonStyle?.color ?? null,
      buttonCursor: buttonStyle?.cursor ?? null,
      iconWidth: iconStyle?.width ?? null,
      iconHeight: iconStyle?.height ?? null,
    };
  }, index);
}

async function resetNumberFieldFocusEvents(root: Locator) {
  await root.evaluate((element) => {
    const input = element.querySelector<HTMLInputElement>("input");
    const fieldGroup = input?.parentElement ?? null;
    const events: Array<{
      type: string;
      target: string;
      active: string;
      inputConnected: boolean;
      currentInputIsOriginal: boolean;
    }> = [];
    const record = (event: FocusEvent) => {
      events.push({
        type: event.type,
        target: event.target instanceof HTMLElement ? event.target.tagName : "",
        active: document.activeElement instanceof HTMLElement ? document.activeElement.tagName : "",
        inputConnected: input?.isConnected ?? false,
        currentInputIsOriginal: element.querySelector<HTMLInputElement>("input") === input,
      });
    };

    input?.addEventListener("blur", record, true);
    input?.addEventListener("focusout", record, true);
    fieldGroup?.addEventListener("focusout", record, true);

    (
      element as HTMLElement & {
        __numberFieldFocusEvents?: typeof events;
      }
    ).__numberFieldFocusEvents = events;
  });
}

async function numberFieldFocusEvents(root: Locator) {
  return root.evaluate((element) => {
    return (
      (
        element as HTMLElement & {
          __numberFieldFocusEvents?: Array<{
            type: string;
            target: string;
            active: string;
            inputConnected: boolean;
            currentInputIsOriginal: boolean;
          }>;
        }
      ).__numberFieldFocusEvents ?? []
    );
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

function rgbChannels(value: string | null) {
  const match = value?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match == null ? null : match.slice(1, 4).map(Number);
}

function expectRgbNear(
  received: string | null,
  expected: string | null,
  tolerance: number,
  label: string,
) {
  const receivedChannels = rgbChannels(received);
  const expectedChannels = rgbChannels(expected);
  expect(receivedChannels, `${label} should be an rgb color`).not.toBeNull();
  expect(expectedChannels, `${label} reference should be an rgb color`).not.toBeNull();
  for (let index = 0; index < 3; index += 1) {
    expect(
      Math.abs((receivedChannels?.[index] ?? 0) - (expectedChannels?.[index] ?? 0)),
      `${label} channel ${index}`,
    ).toBeLessThanOrEqual(tolerance);
  }
}

test.describe("comparison NumberField visual parity", () => {
  test("invalid required XL state has committed pair screenshots", async ({ page }) => {
    const fixtures = await numberFieldFixtures(
      page,
      "?value=8&isInvalid=true&isRequired=true&size=XL",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "NumberField invalid required XL state",
      "numberfield-invalid-required-xl",
      { maxMismatchRatio: 0.24, maxDimensionDelta: 24, pixelThreshold: 64 },
    );
  });

  test("invalid required XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await numberFieldFixtures(
      page,
      "?value=8&isInvalid=true&isRequired=true&size=XL",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: 8,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: 8,
    });

    const react = await numberFieldGeometry(fixtures.reactRoot);
    const solid = await numberFieldGeometry(fixtures.solidRoot);

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
    expect(solid.stepperButtonCount).toBe(react.stepperButtonCount);
    expect(solid.stepperButtonFontSize).toBe(react.stepperButtonFontSize);
    expect(solid.stepperIconFontSize).toBe(react.stepperIconFontSize);

    expectNear(
      solid.group?.width ?? null,
      react.group?.width ?? null,
      1,
      "NumberField group width",
    );
    expectNear(
      solid.group?.height ?? null,
      react.group?.height ?? null,
      1,
      "NumberField group height",
    );
    expectNear(
      solid.input?.height ?? null,
      react.input?.height ?? null,
      1,
      "NumberField input height",
    );
    expectNear(
      solid.decrementButton?.width ?? null,
      react.decrementButton?.width ?? null,
      1,
      "NumberField decrement button width",
    );
    expectNear(
      solid.decrementButton?.height ?? null,
      react.decrementButton?.height ?? null,
      1,
      "NumberField decrement button height",
    );
    expectNear(
      cssPixelNumber(solid.stepperButtonComputedWidth),
      cssPixelNumber(react.stepperButtonComputedWidth),
      1,
      "NumberField stepper button computed width",
    );
    expectNear(
      cssPixelNumber(solid.stepperButtonComputedHeight),
      cssPixelNumber(react.stepperButtonComputedHeight),
      1,
      "NumberField stepper button computed height",
    );
    expectNear(
      solid.decrementIcon?.width ?? null,
      react.decrementIcon?.width ?? null,
      1,
      "NumberField decrement icon width",
    );
    expectNear(
      solid.decrementIcon?.height ?? null,
      react.decrementIcon?.height ?? null,
      1,
      "NumberField decrement icon height",
    );
    expectNear(
      cssPixelNumber(solid.stepperIconComputedWidth),
      cssPixelNumber(react.stepperIconComputedWidth),
      1,
      "NumberField stepper icon computed width",
    );
    expectNear(
      cssPixelNumber(solid.stepperIconComputedHeight),
      cssPixelNumber(react.stepperIconComputedHeight),
      1,
      "NumberField stepper icon computed height",
    );
    expectNear(
      solid.invalidIcon?.width ?? null,
      react.invalidIcon?.width ?? null,
      1,
      "NumberField invalid icon width",
    );
    expectNear(
      solid.invalidIcon?.height ?? null,
      react.invalidIcon?.height ?? null,
      1,
      "NumberField invalid icon height",
    );
    expectNear(solid.groupToHelpGap, react.groupToHelpGap, 1, "NumberField group-to-help gap");
    expectNear(solid.inputCenterDelta, react.inputCenterDelta, 1, "NumberField input centerline");
    expectNear(
      solid.invalidIconCenterDelta,
      react.invalidIconCenterDelta,
      1,
      "NumberField invalid icon centerline",
    );
  });

  test("typing and steppers update controlled value on both stacks", async ({ page }) => {
    const fixtures = await numberFieldFixtures(page);

    for (const item of [
      { panel: fixtures.reactPanel, input: fixtures.reactInput, root: fixtures.reactRoot },
      { panel: fixtures.solidPanel, input: fixtures.solidInput, root: fixtures.solidRoot },
    ]) {
      await expect(item.input).toHaveValue("5");
      await item.input.fill("8");
      await expect(item.input).toHaveValue("8");
      await item.input.blur();
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        "8",
      );

      const buttons = item.root.locator("button,[role='button']");
      await expect(buttons).toHaveCount(2);
      await item.input.evaluate((input) => {
        input.setAttribute("data-focus-stability-marker", "number-stepper");
      });
      await buttons.nth(1).click();
      await expect(item.input).toHaveValue("9");
      await expect
        .poll(async () =>
          item.root.evaluate((root) => {
            const input = root.querySelector<HTMLInputElement>("input");
            return input != null && document.activeElement === input;
          }),
        )
        .toBe(true);
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        "9",
      );
    }
  });

  test("both steppers hover consistently and return focus to the input", async ({ page }) => {
    const fixtures = await numberFieldFixtures(page);

    const pairs = [
      {
        stack: "react",
        panel: fixtures.reactPanel,
        input: fixtures.reactInput,
        root: fixtures.reactRoot,
      },
      {
        stack: "solid",
        panel: fixtures.solidPanel,
        input: fixtures.solidInput,
        root: fixtures.solidRoot,
      },
    ];

    for (const buttonIndex of [0, 1]) {
      await clearPointer(page);
      await fixtures.reactRoot.locator("button,[role='button']").nth(buttonIndex).hover();
      const reactHover = await numberFieldStepperState(fixtures.reactRoot, buttonIndex);
      await clearPointer(page);
      await fixtures.solidRoot.locator("button,[role='button']").nth(buttonIndex).hover();
      const solidHover = await numberFieldStepperState(fixtures.solidRoot, buttonIndex);

      expect(solidHover.buttonBackground).toBe(reactHover.buttonBackground);
      expectRgbNear(solidHover.buttonColor, reactHover.buttonColor, 1, "NumberField stepper color");
      expect(solidHover.buttonCursor).toBe(reactHover.buttonCursor);
      expect(solidHover.iconWidth).toBe(reactHover.iconWidth);
      expect(solidHover.iconHeight).toBe(reactHover.iconHeight);
    }

    for (const item of pairs) {
      const buttons = item.root.locator("button,[role='button']");
      await expect(buttons).toHaveCount(2);
      await item.input.fill("8");
      await item.input.focus();
      await expect(item.input).toBeFocused();

      const decrementBox = await buttons.nth(0).boundingBox();
      expect(decrementBox, `${item.stack} decrement button should have a box`).not.toBeNull();
      await resetNumberFieldFocusEvents(item.root);
      await page.mouse.move(
        (decrementBox?.x ?? 0) + (decrementBox?.width ?? 0) / 2,
        (decrementBox?.y ?? 0) + (decrementBox?.height ?? 0) / 2,
      );
      await page.mouse.down();
      await expect
        .poll(async () => numberFieldStepperState(item.root, 0))
        .toMatchObject(
          item.stack === "solid"
            ? {
                activeIsInput: true,
                groupFocused: "true",
              }
            : { activeIsInput: true },
        );
      await page.mouse.up();
      await expect(item.input).toHaveValue("7");
      await expect
        .poll(async () => numberFieldStepperState(item.root, 0))
        .toMatchObject(
          item.stack === "solid"
            ? {
                activeIsInput: true,
                groupFocused: "true",
              }
            : { activeIsInput: true },
        );
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        "7",
      );
      expect(
        await numberFieldFocusEvents(item.root),
        `${item.stack} decrement stepper should not emit transient input blur/focusout`,
      ).toEqual([]);

      const incrementBox = await buttons.nth(1).boundingBox();
      expect(incrementBox, `${item.stack} increment button should have a box`).not.toBeNull();
      await resetNumberFieldFocusEvents(item.root);
      await page.mouse.move(
        (incrementBox?.x ?? 0) + (incrementBox?.width ?? 0) / 2,
        (incrementBox?.y ?? 0) + (incrementBox?.height ?? 0) / 2,
      );
      await page.mouse.down();
      await expect
        .poll(async () => numberFieldStepperState(item.root, 1))
        .toMatchObject(
          item.stack === "solid"
            ? {
                activeIsInput: true,
                groupFocused: "true",
              }
            : { activeIsInput: true },
        );
      await page.mouse.up();
      await expect(item.input).toHaveValue("8");
      await expect
        .poll(async () => numberFieldStepperState(item.root, 1))
        .toMatchObject(
          item.stack === "solid"
            ? {
                activeIsInput: true,
                groupFocused: "true",
              }
            : { activeIsInput: true },
        );
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        "8",
      );
      expect(
        await numberFieldFocusEvents(item.root),
        `${item.stack} increment stepper should not emit transient input blur/focusout`,
      ).toEqual([]);
    }
  });
});
