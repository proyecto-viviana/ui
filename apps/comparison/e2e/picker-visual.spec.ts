import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function pickerFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/picker/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="picker"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="picker"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    page,
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactButton: reactRoot.locator("button").first(),
    solidButton: solidRoot.locator("button[aria-haspopup='listbox']").first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function pickerGeometry(root: Locator) {
  return root.evaluate((element) => {
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
    const button = element.querySelector<HTMLButtonElement>("button");
    const value = button?.querySelector<HTMLElement>("span[id$='value'], span") ?? null;
    const label =
      Array.from(element.querySelectorAll<HTMLElement>("span, label, div")).find(
        (candidate) => candidate.children.length === 0 && candidate.textContent?.trim() === "Plan",
      ) ?? null;
    const helpText =
      Array.from(element.querySelectorAll<HTMLElement>("p, div, span")).find(
        (candidate) =>
          candidate.children.length === 0 && candidate.textContent?.trim() === "Select a plan.",
      ) ?? null;
    const icons = Array.from(button?.querySelectorAll<SVGElement>("svg") ?? []).filter(
      (icon) => icon.getBoundingClientRect().width > 0,
    );
    const sortedIcons = icons
      .map((icon) => ({
        icon,
        rect: icon.getBoundingClientRect(),
        style: window.getComputedStyle(icon),
      }))
      .sort((a, b) => b.rect.width - a.rect.width);
    const invalidIcon = sortedIcons[0] ?? null;
    const chevronIcon = sortedIcons[sortedIcons.length - 1] ?? null;
    const buttonStyle = button == null ? null : window.getComputedStyle(button);
    const valueStyle = value == null ? null : window.getComputedStyle(value);
    const helpStyle = helpText == null ? null : window.getComputedStyle(helpText);

    return {
      valueText: value?.textContent?.trim() ?? null,
      buttonName:
        button?.getAttribute("aria-label") ??
        button?.getAttribute("aria-labelledby") ??
        button?.textContent?.trim() ??
        null,
      ariaInvalid: button?.getAttribute("aria-invalid") ?? null,
      ariaRequired: button?.getAttribute("aria-required") ?? null,
      ariaExpanded: button?.getAttribute("aria-expanded") ?? null,
      disabled: button?.disabled ?? null,
      root: relativeRect(rootRect, rootRect),
      label: relativeRect(label?.getBoundingClientRect(), rootRect),
      button: relativeRect(button?.getBoundingClientRect(), rootRect),
      value: relativeRect(value?.getBoundingClientRect(), rootRect),
      invalidIcon: relativeRect(invalidIcon?.rect, rootRect),
      chevronIcon: relativeRect(chevronIcon?.rect, rootRect),
      helpText: relativeRect(helpText?.getBoundingClientRect(), rootRect),
      buttonBackground: buttonStyle?.backgroundColor ?? null,
      buttonColor: buttonStyle?.color ?? null,
      buttonBorderColor: buttonStyle?.borderColor ?? null,
      valueColor: valueStyle?.color ?? null,
      helpColor: helpStyle?.color ?? null,
      invalidIconColor: invalidIcon?.style.color ?? null,
      chevronIconColor: chevronIcon?.style.color ?? null,
      iconCount: icons.length,
    };
  });
}

async function markCurrentButton(button: Locator) {
  await button.evaluate((element) => {
    element.setAttribute("data-focus-stability-marker", "picker-trigger");
  });
}

async function triggerStability(root: Locator) {
  return root.evaluate((element) => {
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
    return {
      markerStillOnButton: button?.getAttribute("data-focus-stability-marker") === "picker-trigger",
      activeIsButton: document.activeElement === button,
      buttonText: button?.textContent?.trim() ?? null,
      ariaExpanded: button?.getAttribute("aria-expanded") ?? null,
      rootOpen: element.firstElementChild?.getAttribute("data-open") ?? null,
      listboxCount: element.querySelectorAll("[role='listbox']").length,
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

test.describe("comparison Picker visual parity", () => {
  test("invalid required XL state has committed pair screenshots", async ({ page }) => {
    const fixtures = await pickerFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Picker invalid required XL state",
      "picker-invalid-required-xl",
      { maxMismatchRatio: 0.2, maxDimensionDelta: 24, pixelThreshold: 64 },
    );
  });

  test("invalid required XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await pickerFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      selectedKey: "pro",
      isInvalid: true,
      isRequired: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      selectedKey: "pro",
      isInvalid: true,
      isRequired: true,
    });

    const react = await pickerGeometry(fixtures.reactRoot);
    const solid = await pickerGeometry(fixtures.solidRoot);

    expect(solid.valueText).toBe(react.valueText);
    expect(solid.ariaInvalid).toBe(react.ariaInvalid);
    expect([react.ariaRequired, "true"]).toContain(solid.ariaRequired);
    expect(solid.ariaExpanded).toBe(react.ariaExpanded);
    expect(solid.disabled).toBe(react.disabled);
    expect(solid.buttonBackground).toBe(react.buttonBackground);
    expect(solid.buttonColor).toBe(react.buttonColor);
    expect(solid.valueColor).toBe(react.valueColor);
    expect(solid.helpColor).toBe(react.helpColor);
    expect(solid.invalidIconColor).toBe(react.invalidIconColor);
    expect(solid.chevronIconColor).toBe(react.chevronIconColor);
    expect(solid.iconCount).toBe(react.iconCount);

    expectNear(solid.root?.width ?? null, react.root?.width ?? null, 1, "Picker root width");
    expectNear(solid.button?.width ?? null, react.button?.width ?? null, 1, "Picker button width");
    expectNear(
      solid.button?.height ?? null,
      react.button?.height ?? null,
      1,
      "Picker button height",
    );
    expectNear(solid.value?.height ?? null, react.value?.height ?? null, 1, "Picker value height");
    expectNear(
      solid.invalidIcon?.width ?? null,
      react.invalidIcon?.width ?? null,
      1,
      "Picker invalid icon width",
    );
    expectNear(
      solid.invalidIcon?.height ?? null,
      react.invalidIcon?.height ?? null,
      1,
      "Picker invalid icon height",
    );
    expectNear(
      solid.chevronIcon?.width ?? null,
      react.chevronIcon?.width ?? null,
      1,
      "Picker chevron icon width",
    );
    expectNear(
      solid.chevronIcon?.height ?? null,
      react.chevronIcon?.height ?? null,
      1,
      "Picker chevron icon height",
    );
  });

  test("opening and selecting another item keeps the trigger stable", async ({ page }) => {
    const fixtures = await pickerFixtures(page);

    for (const item of [
      { stack: "react", root: fixtures.reactRoot, button: fixtures.reactButton },
      { stack: "solid", root: fixtures.solidRoot, button: fixtures.solidButton },
    ]) {
      await expect(item.root).toHaveAttribute("data-comparison-value", "pro");
      await expect(item.button).toContainText("Pro");
      await markCurrentButton(item.button);

      await item.button.click();
      await expect(item.button).toHaveAttribute("aria-expanded", "true");
      await expect
        .poll(async () => triggerStability(item.root))
        .toMatchObject({
          markerStillOnButton: true,
          ariaExpanded: "true",
        });

      const option = page.getByRole("option", { name: "Enterprise" });
      await expect(option, `${item.stack} Enterprise option should be visible`).toBeVisible();
      await option.click();

      await expect(item.root).toHaveAttribute("data-comparison-value", "enterprise");
      await expect(item.button).toContainText("Enterprise");
      await expect(item.button).toHaveAttribute("aria-expanded", "false");
      await expect
        .poll(async () => triggerStability(item.root))
        .toMatchObject({
          markerStillOnButton: true,
          activeIsButton: true,
          buttonText: "Enterprise",
          ariaExpanded: "false",
        });
    }
  });
});
