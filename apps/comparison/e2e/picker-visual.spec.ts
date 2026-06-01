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
    reactButton: reactRoot.locator("button[aria-haspopup='listbox']").first(),
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
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
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

async function openListMetrics(root: Locator) {
  return root.evaluate((element) => {
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
    const listboxId = button?.getAttribute("aria-controls");
    const listbox =
      (listboxId ? document.getElementById(listboxId) : null) ??
      Array.from(document.querySelectorAll<HTMLElement>("[role='listbox']")).find((candidate) =>
        candidate.textContent?.includes("Enterprise"),
      ) ??
      null;
    const dialog = listbox?.closest<HTMLElement>("[role='dialog']") ?? null;
    const options = Array.from(listbox?.querySelectorAll<HTMLElement>("[role='option']") ?? []);
    const selectedOption = options.find(
      (option) => option.getAttribute("aria-selected") === "true",
    );
    const focusedOption = options.find((option) => option.hasAttribute("data-focused"));
    const firstOption = options[0] ?? null;
    const enterpriseOption =
      options.find((option) => option.textContent?.trim() === "Enterprise") ?? null;
    const checkmark = firstOption?.querySelector<SVGElement>("svg") ?? null;
    const listboxStyle = listbox == null ? null : window.getComputedStyle(listbox);
    const dialogStyle = dialog == null ? null : window.getComputedStyle(dialog);
    const optionStyle = firstOption == null ? null : window.getComputedStyle(firstOption);
    const label =
      firstOption?.querySelector<HTMLElement>(
        "[slot='label'], [data-slot='label'], [data-rsp-slot='text'], span",
      ) ?? null;
    const labelStyle = label == null ? null : window.getComputedStyle(label);
    const listboxRect = listbox?.getBoundingClientRect();
    const dialogRect = dialog?.getBoundingClientRect();
    const optionRect = firstOption?.getBoundingClientRect();
    const checkmarkRect = checkmark?.getBoundingClientRect();

    return {
      activeRole: document.activeElement?.getAttribute("role") ?? null,
      activeText: document.activeElement?.textContent?.trim() ?? null,
      activeIsFocusedOption: document.activeElement === focusedOption,
      activeInDialog: dialog?.contains(document.activeElement) ?? false,
      selectedText: selectedOption?.textContent?.trim() ?? null,
      focusedText: focusedOption?.textContent?.trim() ?? null,
      comparisonValue: element.getAttribute("data-comparison-value"),
      ariaExpanded: button?.getAttribute("aria-expanded") ?? null,
      rootListboxCount: element.querySelectorAll("[role='listbox']").length,
      hasListbox: listbox != null,
      hasPopover: dialog != null,
      popoverBackground: dialogStyle?.backgroundColor ?? null,
      popoverShadow: dialogStyle?.boxShadow ?? null,
      popoverPadding: dialogStyle?.padding ?? null,
      listboxPadding: listboxStyle?.padding ?? null,
      listboxMargin: listboxStyle?.margin ?? null,
      listboxWidth: listboxRect == null ? null : Number(listboxRect.width.toFixed(4)),
      popoverWidth: dialogRect == null ? null : Number(dialogRect.width.toFixed(4)),
      optionGridAreas: optionStyle?.gridTemplateAreas ?? null,
      optionGridColumns: optionStyle?.gridTemplateColumns ?? null,
      firstOptionDataFocused: firstOption?.hasAttribute("data-focused") ?? false,
      firstOptionDataFocusVisible: firstOption?.hasAttribute("data-focus-visible") ?? false,
      firstOptionDataHovered: firstOption?.hasAttribute("data-hovered") ?? false,
      enterpriseDisabled:
        enterpriseOption?.getAttribute("aria-disabled") === "true" ||
        enterpriseOption?.hasAttribute("data-disabled") ||
        false,
      firstOptionBackground: optionStyle?.backgroundColor ?? null,
      firstOptionColor: optionStyle?.color ?? null,
      optionLeftInset:
        listboxRect == null || optionRect == null
          ? null
          : Number((optionRect.left - listboxRect.left).toFixed(4)),
      optionTopInset:
        listboxRect == null || optionRect == null
          ? null
          : Number((optionRect.top - listboxRect.top).toFixed(4)),
      optionWidth: optionRect == null ? null : Number(optionRect.width.toFixed(4)),
      optionHeight: optionRect == null ? null : Number(optionRect.height.toFixed(4)),
      labelGridArea: labelStyle?.gridArea ?? null,
      labelFontWeight: labelStyle?.fontWeight ?? null,
      labelMarginTop: labelStyle?.marginTop ?? null,
      checkmarkWidth: checkmarkRect == null ? null : Number(checkmarkRect.width.toFixed(4)),
      checkmarkHeight: checkmarkRect == null ? null : Number(checkmarkRect.height.toFixed(4)),
    };
  });
}

async function waitForOpenListMetrics(root: Locator, label: string) {
  await expect
    .poll(() => openListMetrics(root), label)
    .toMatchObject({ ariaExpanded: "true", hasListbox: true, hasPopover: true });
  return openListMetrics(root);
}

async function hoverFirstOpenOption(page: Page, root: Locator, label: string) {
  const point = await root.evaluate((element) => {
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
    const listboxId = button?.getAttribute("aria-controls");
    const listbox =
      (listboxId ? document.getElementById(listboxId) : null) ??
      Array.from(document.querySelectorAll<HTMLElement>("[role='listbox']")).find((candidate) =>
        candidate.textContent?.includes("Enterprise"),
      ) ??
      null;
    const firstOption = listbox?.querySelector<HTMLElement>("[role='option']");
    const rect = firstOption?.getBoundingClientRect();

    return rect == null ? null : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });

  expect(point, `${label} first option should be measurable`).not.toBeNull();
  await page.mouse.move(point!.x, point!.y);
  await expect
    .poll(() => openListMetrics(root), label)
    .toMatchObject({ firstOptionDataFocused: true });
  return openListMetrics(root);
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
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await pickerFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Picker default state",
      { maxMismatchRatio: 0.2, maxDimensionDelta: 24, pixelThreshold: 64 },
    );
  });

  test("invalid required XL state matches current React Spectrum", async ({ page }) => {
    const fixtures = await pickerFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Picker invalid required XL state",
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

  test("first pointer open does not scroll the page to the portal", async ({ page }) => {
    const fixtures = await pickerFixtures(page, "?size=XL");

    await fixtures.solidButton.evaluate((element) => {
      element.scrollIntoView({ block: "center", inline: "nearest" });
    });
    const beforeScrollY = await page.evaluate(() => window.scrollY);

    await fixtures.solidButton.click();
    await expect
      .poll(() => openListMetrics(fixtures.solidRoot), "Solid Picker opens in place")
      .toMatchObject({
        activeRole: "option",
        activeText: "Pro",
        activeIsFocusedOption: true,
        ariaExpanded: "true",
      });

    const scrollY = await page.evaluate(() => window.scrollY);
    const bottomScrollY = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    expect(
      Math.abs(scrollY - beforeScrollY),
      "opening the portaled listbox should keep the page anchored",
    ).toBeLessThan(20);
    if (bottomScrollY > 0) {
      expect(scrollY, "opening should not jump to the document bottom").toBeLessThan(bottomScrollY);
    } else {
      expect(scrollY, "non-scrollable pages should stay at the top").toBe(0);
    }
  });

  test("keyboard navigation moves focus before committing selection", async ({ page }) => {
    const fixtures = await pickerFixtures(page, "?size=XL");

    for (const item of [
      { stack: "react", root: fixtures.reactRoot, button: fixtures.reactButton },
      { stack: "solid", root: fixtures.solidRoot, button: fixtures.solidButton },
    ]) {
      await expect(item.root).toHaveAttribute("data-comparison-value", "pro");
      await item.button.focus();
      await item.button.press("ArrowDown");

      await expect
        .poll(() => openListMetrics(item.root), `${item.stack} opens on ArrowDown`)
        .toMatchObject({
          activeRole: "option",
          activeText: "Pro",
          activeIsFocusedOption: true,
          activeInDialog: true,
          selectedText: "Pro",
          focusedText: "Pro",
          comparisonValue: "pro",
          ariaExpanded: "true",
        });

      await page.keyboard.press("ArrowDown");
      await expect
        .poll(() => openListMetrics(item.root), `${item.stack} previews focused option`)
        .toMatchObject({
          activeRole: "option",
          activeText: "Enterprise",
          activeIsFocusedOption: true,
          selectedText: "Pro",
          focusedText: "Enterprise",
          comparisonValue: "pro",
          ariaExpanded: "true",
        });

      await page.keyboard.press("Enter");
      await expect(item.root).toHaveAttribute("data-comparison-value", "enterprise");
      await expect(item.button).toContainText("Enterprise");
      await expect(item.button).toHaveAttribute("aria-expanded", "false");
      await expect
        .poll(async () => triggerStability(item.root))
        .toMatchObject({
          activeIsButton: true,
          buttonText: "Enterprise",
          ariaExpanded: "false",
        });
    }
  });

  test("Enter opens the trigger menu without committing selection", async ({ page }) => {
    const fixtures = await pickerFixtures(page, "?size=XL");

    for (const item of [
      { stack: "react", root: fixtures.reactRoot, button: fixtures.reactButton },
      { stack: "solid", root: fixtures.solidRoot, button: fixtures.solidButton },
    ]) {
      await item.button.focus();
      await page.keyboard.press("Enter");
      await expect
        .poll(() => openListMetrics(item.root), `${item.stack} opens on Enter`)
        .toMatchObject({
          activeRole: "option",
          activeText: "Pro",
          activeIsFocusedOption: true,
          selectedText: "Pro",
          focusedText: "Pro",
          comparisonValue: "pro",
          ariaExpanded: "true",
        });

      await page.keyboard.press("Escape");
      await expect(item.button).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("open list popover and option layout match React Spectrum", async ({ page }) => {
    const fixtures = await pickerFixtures(page, "?size=XL");

    await fixtures.reactButton.click();
    const react = await waitForOpenListMetrics(
      fixtures.reactRoot,
      "React Picker open list metrics",
    );
    const reactHover = await hoverFirstOpenOption(
      page,
      fixtures.reactRoot,
      "React Picker hovered option",
    );
    await page.keyboard.press("Escape");
    await expect(fixtures.reactButton).toHaveAttribute("aria-expanded", "false");

    await fixtures.solidButton.click();
    const solid = await waitForOpenListMetrics(
      fixtures.solidRoot,
      "Solid Picker open list metrics",
    );
    const solidHover = await hoverFirstOpenOption(
      page,
      fixtures.solidRoot,
      "Solid Picker hovered option",
    );

    expect(solid.rootListboxCount).toBe(0);
    expect(solid.popoverBackground).toBe(react.popoverBackground);
    expect(solid.popoverShadow).toBe(react.popoverShadow);
    expect(solid.popoverPadding).toBe(react.popoverPadding);
    expect(solid.listboxMargin).toBe(react.listboxMargin);
    expect(solid.optionGridAreas).toBe(react.optionGridAreas);
    expect(solid.optionGridAreas).not.toBe("none");
    expect(solid.optionGridColumns).toBe(react.optionGridColumns);
    expect(solidHover.firstOptionDataFocused).toBe(reactHover.firstOptionDataFocused);
    expect(solidHover.firstOptionDataFocusVisible).toBe(reactHover.firstOptionDataFocusVisible);
    expect(solidHover.firstOptionDataHovered).toBe(reactHover.firstOptionDataHovered);
    expect(solidHover.firstOptionBackground).toBe(reactHover.firstOptionBackground);
    expect(solidHover.firstOptionColor).toBe(reactHover.firstOptionColor);
    expect(solid.labelGridArea).toBe(react.labelGridArea);
    expect(solid.labelFontWeight).toBe(react.labelFontWeight);
    expect(solid.labelMarginTop).toBe(react.labelMarginTop);
    expectNear(solid.optionLeftInset, react.optionLeftInset, 1, "Picker option left inset");
    expectNear(solid.optionTopInset, react.optionTopInset, 1, "Picker option top inset");
    expectNear(solid.optionWidth, react.optionWidth, 1, "Picker option width");
    expectNear(solid.optionHeight, react.optionHeight, 1, "Picker option height");
    expectNear(solid.checkmarkWidth, react.checkmarkWidth, 1, "Picker list checkmark width");
    expectNear(solid.checkmarkHeight, react.checkmarkHeight, 1, "Picker list checkmark height");
  });

  test("advanced controls drive selection source, form, label, validation, and popover props", async ({
    page,
  }) => {
    const query =
      "?selectionSource=defaultValue&selectedKey=starter&labelPosition=side&labelAlign=end&necessityIndicator=label&isRequired=true&withContextualHelp=true&withRenderValue=true&name=planField&form=pickerForm&validationBehavior=aria&direction=top&align=end&menuWidth=360&loadingState=loadingMore&disableEnterprise=true&shouldFlip=false";

    for (const stack of ["react", "solid"] as const) {
      const fixtures = await pickerFixtures(page, query);
      const item =
        stack === "react"
          ? { stack, root: fixtures.reactRoot, button: fixtures.reactButton }
          : { stack, root: fixtures.solidRoot, button: fixtures.solidButton };

      expect(await controlProps(item.root)).toMatchObject({
        selectedKey: "starter",
        selectionSource: "defaultValue",
        labelPosition: "side",
        labelAlign: "end",
        necessityIndicator: "label",
        name: "planField",
        form: "pickerForm",
        validationBehavior: "aria",
        direction: "top",
        align: "end",
        menuWidth: "360",
        disableEnterprise: true,
        shouldFlip: false,
        withContextualHelp: true,
        withRenderValue: true,
        loadingState: "loadingMore",
      });

      await expect(item.root).toHaveAttribute("data-comparison-value", "starter");
      await expect(item.button).toContainText("Starter plan");
      await expect(item.root.locator('[name="planField"]').first()).toHaveAttribute(
        "form",
        "pickerForm",
      );
      await expect(item.root.getByRole("button", { name: /help/i }).first()).toBeVisible();

      await item.button.click();
      const metrics = await waitForOpenListMetrics(item.root, `${item.stack} advanced popover`);
      expectNear(metrics.popoverWidth, 360, 2, `${item.stack} menuWidth popover`);
      expect(metrics.enterpriseDisabled, `${item.stack} Enterprise option disabled`).toBe(true);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");

      await expect(item.root).toHaveAttribute("data-comparison-value", "pro");
      await expect(item.button).toContainText("Pro plan");
      expect(await controlProps(item.root)).toMatchObject({
        selectedKey: "starter",
        selectionSource: "defaultValue",
      });
      await expect(item.button).toHaveAttribute("aria-expanded", "false");
    }
  });
});
