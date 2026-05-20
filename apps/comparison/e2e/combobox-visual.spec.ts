import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection } from "./comparison-page";
import { expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function comboBoxFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/combobox/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  await styledSection(page);
  const section = page.locator("#example");
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="combobox"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="combobox"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    page,
    reactRoot,
    solidRoot,
    reactInput: reactRoot.locator('input[role="combobox"]').first(),
    solidInput: solidRoot.locator('input[role="combobox"]').first(),
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

async function comboBoxGeometry(root: Locator) {
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
    const input = element.querySelector<HTMLInputElement>('input[role="combobox"]');
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
    const fieldGroup = input?.parentElement ?? null;
    const label =
      Array.from(element.querySelectorAll<HTMLElement>("span, label, div")).find(
        (candidate) => candidate.children.length === 0 && candidate.textContent?.trim() === "Plan",
      ) ?? null;
    const helpText =
      Array.from(element.querySelectorAll<HTMLElement>("p, div, span")).find(
        (candidate) =>
          candidate.children.length === 0 && candidate.textContent?.trim() === "Select a plan.",
      ) ?? null;
    const icons = Array.from(fieldGroup?.querySelectorAll<SVGElement>("svg") ?? []).filter(
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
    const fieldStyle = fieldGroup == null ? null : window.getComputedStyle(fieldGroup);
    const inputStyle = input == null ? null : window.getComputedStyle(input);
    const buttonStyle = button == null ? null : window.getComputedStyle(button);
    const helpStyle = helpText == null ? null : window.getComputedStyle(helpText);

    return {
      inputValue: input?.value ?? null,
      ariaInvalid: input?.getAttribute("aria-invalid") ?? null,
      ariaRequired: input?.getAttribute("aria-required") ?? null,
      ariaExpanded: input?.getAttribute("aria-expanded") ?? null,
      disabled: input?.disabled ?? null,
      root: relativeRect(rootRect, rootRect),
      label: relativeRect(label?.getBoundingClientRect(), rootRect),
      fieldGroup: relativeRect(fieldGroup?.getBoundingClientRect(), rootRect),
      input: relativeRect(input?.getBoundingClientRect(), rootRect),
      button: relativeRect(button?.getBoundingClientRect(), rootRect),
      invalidIcon: relativeRect(invalidIcon?.rect, rootRect),
      chevronIcon: relativeRect(chevronIcon?.rect, rootRect),
      helpText: relativeRect(helpText?.getBoundingClientRect(), rootRect),
      fieldBackground: fieldStyle?.backgroundColor ?? null,
      fieldColor: fieldStyle?.color ?? null,
      fieldBorderColor: fieldStyle?.borderColor ?? null,
      inputColor: inputStyle?.color ?? null,
      buttonBackground: buttonStyle?.backgroundColor ?? null,
      buttonColor: buttonStyle?.color ?? null,
      helpColor: helpStyle?.color ?? null,
      invalidIconColor: invalidIcon?.style.color ?? null,
      chevronIconColor: chevronIcon?.style.color ?? null,
      iconCount: icons.length,
    };
  });
}

async function openListMetrics(root: Locator) {
  return root.evaluate((element) => {
    const input = element.querySelector<HTMLInputElement>('input[role="combobox"]');
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
    const listboxId = input?.getAttribute("aria-controls") ?? button?.getAttribute("aria-controls");
    const activeDescendant = input?.getAttribute("aria-activedescendant") ?? null;
    const listbox =
      (listboxId ? document.getElementById(listboxId) : null) ??
      Array.from(document.querySelectorAll<HTMLElement>("[role='listbox']")).find((candidate) =>
        candidate.textContent?.includes("Enterprise"),
      ) ??
      null;
    const isTransparent = (color: string) =>
      color === "transparent" || color === "rgba(0, 0, 0, 0)";
    const popupSurface = (() => {
      if (listbox == null) return null;
      let fallback: HTMLElement | null = null;
      let current: HTMLElement | null = listbox;

      while (current != null && current !== document.body) {
        const style = window.getComputedStyle(current);
        const rect = current.getBoundingClientRect();
        const hasSize = rect.width > 0 && rect.height > 0;

        if (hasSize && !isTransparent(style.backgroundColor) && fallback == null) {
          fallback = current;
        }

        if (hasSize && style.boxShadow !== "none") {
          return current;
        }

        current = current.parentElement;
      }

      return fallback ?? listbox;
    })();
    const options = Array.from(listbox?.querySelectorAll<HTMLElement>("[role='option']") ?? []);
    const selectedOption = options.find(
      (option) => option.getAttribute("aria-selected") === "true",
    );
    const activeOption =
      activeDescendant == null
        ? null
        : (options.find((option) => option.id === activeDescendant) ?? null);
    const firstOption = options[0] ?? null;
    const enterpriseOption =
      options.find((option) => option.textContent?.trim() === "Enterprise") ?? null;
    const checkmark = firstOption?.querySelector<SVGElement>("svg") ?? null;
    const listboxStyle = listbox == null ? null : window.getComputedStyle(listbox);
    const popupStyle = popupSurface == null ? null : window.getComputedStyle(popupSurface);
    const optionStyle = firstOption == null ? null : window.getComputedStyle(firstOption);
    const label =
      firstOption?.querySelector<HTMLElement>(
        "[slot='label'], [data-slot='label'], [data-rsp-slot='text'], span",
      ) ?? null;
    const labelStyle = label == null ? null : window.getComputedStyle(label);
    const listboxRect = listbox?.getBoundingClientRect();
    const popupRect = popupSurface?.getBoundingClientRect();
    const optionRect = firstOption?.getBoundingClientRect();
    const checkmarkRect = checkmark?.getBoundingClientRect();

    return {
      activeIsInput: document.activeElement === input,
      activeDescendant,
      activeText: activeOption?.textContent?.trim() ?? null,
      selectedText: selectedOption?.textContent?.trim() ?? null,
      comparisonValue: element.getAttribute("data-comparison-value"),
      inputValue: element.getAttribute("data-comparison-input-value"),
      ariaExpanded: input?.getAttribute("aria-expanded") ?? null,
      rootListboxCount: element.querySelectorAll("[role='listbox']").length,
      hasListbox: listbox != null,
      hasPopover: popupSurface != null,
      popoverBackground: popupStyle?.backgroundColor ?? null,
      popoverShadow: popupStyle?.boxShadow ?? null,
      popoverPadding: popupStyle?.padding ?? null,
      listboxPadding: listboxStyle?.padding ?? null,
      listboxMargin: listboxStyle?.margin ?? null,
      listboxWidth: listboxRect == null ? null : Number(listboxRect.width.toFixed(4)),
      popoverWidth: popupRect == null ? null : Number(popupRect.width.toFixed(4)),
      optionGridAreas: optionStyle?.gridTemplateAreas ?? null,
      optionGridColumns: optionStyle?.gridTemplateColumns ?? null,
      firstOptionDataFocused: firstOption?.hasAttribute("data-focused") ?? false,
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
    const input = element.querySelector<HTMLInputElement>('input[role="combobox"]');
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
    const listboxId = input?.getAttribute("aria-controls") ?? button?.getAttribute("aria-controls");
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

async function clickOpenOption(page: Page, root: Locator, optionText: string, label: string) {
  const point = await root.evaluate((element, targetText) => {
    const input = element.querySelector<HTMLInputElement>('input[role="combobox"]');
    const button = element.querySelector<HTMLButtonElement>("button[aria-haspopup='listbox']");
    const listboxId = input?.getAttribute("aria-controls") ?? button?.getAttribute("aria-controls");
    const listbox =
      (listboxId ? document.getElementById(listboxId) : null) ??
      Array.from(document.querySelectorAll<HTMLElement>("[role='listbox']")).find((candidate) =>
        candidate.textContent?.includes(String(targetText)),
      ) ??
      null;
    const option = Array.from(listbox?.querySelectorAll<HTMLElement>("[role='option']") ?? []).find(
      (candidate) => candidate.textContent?.trim() === targetText,
    );
    const rect = option?.getBoundingClientRect();

    return rect == null ? null : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, optionText);

  expect(point, `${label} option should be measurable`).not.toBeNull();
  await page.mouse.click(point!.x, point!.y);
}

async function tabUntilActive(page: Page, root: Locator, label: string) {
  for (let index = 0; index < 80; index += 1) {
    await page.keyboard.press("Tab");
    if (await root.evaluate((element) => element.contains(document.activeElement))) {
      return;
    }
  }

  throw new Error(`${label} did not receive keyboard focus`);
}

async function comboBoxFocusRingMetrics(root: Locator) {
  return root.evaluate((element) => {
    const input = element.querySelector<HTMLInputElement>('input[role="combobox"]');
    const fieldGroup = input?.parentElement ?? null;
    const fieldStyle = fieldGroup == null ? null : window.getComputedStyle(fieldGroup);

    return {
      activeIsInput: document.activeElement === input,
      inputFocusVisible: input?.hasAttribute("data-focus-visible") ?? false,
      fieldGroupFocusVisible: fieldGroup?.hasAttribute("data-focus-visible") ?? false,
      fieldGroupOutlineStyle: fieldStyle?.outlineStyle ?? null,
      fieldGroupOutlineWidth: fieldStyle?.outlineWidth ?? null,
      fieldGroupOutlineColor: fieldStyle?.outlineColor ?? null,
      fieldGroupOutlineOffset: fieldStyle?.outlineOffset ?? null,
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

test.describe("comparison ComboBox visual parity", () => {
  test("default field screenshot pair stays within current ComboBox threshold", async ({
    page,
  }) => {
    const fixtures = await comboBoxFixtures(page);

    const result = await expectScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "ComboBox default field",
      {
        maxMismatchRatio: 0.08,
        maxDimensionDelta: 4,
        pixelThreshold: 64,
      },
    );

    expect(result.diff.comparedWidth).toBeGreaterThan(0);
    expect(result.diff.comparedHeight).toBeGreaterThan(0);
  });

  test("invalid required XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await comboBoxFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      selectedKey: "pro",
      inputValue: "Pro",
      isInvalid: true,
      isRequired: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      selectedKey: "pro",
      inputValue: "Pro",
      isInvalid: true,
      isRequired: true,
    });

    const react = await comboBoxGeometry(fixtures.reactRoot);
    const solid = await comboBoxGeometry(fixtures.solidRoot);

    expect(solid.inputValue).toBe(react.inputValue);
    expect(solid.ariaInvalid).toBe(react.ariaInvalid);
    expect([react.ariaRequired, "true"]).toContain(solid.ariaRequired);
    expect(solid.ariaExpanded).toBe(react.ariaExpanded);
    expect(solid.disabled).toBe(react.disabled);
    expect(solid.fieldBackground).toBe(react.fieldBackground);
    expect(solid.fieldColor).toBe(react.fieldColor);
    expect(solid.inputColor).toBe(react.inputColor);
    expect(solid.helpColor).toBe(react.helpColor);
    expect(solid.invalidIconColor).toBe(react.invalidIconColor);
    expect(solid.chevronIconColor).toBe(react.chevronIconColor);
    expect(solid.iconCount).toBe(react.iconCount);

    expectNear(
      solid.fieldGroup?.width ?? null,
      react.fieldGroup?.width ?? null,
      1,
      "ComboBox field group width",
    );
    expectNear(
      solid.fieldGroup?.height ?? null,
      react.fieldGroup?.height ?? null,
      1,
      "ComboBox field group height",
    );
    expectNear(
      solid.button?.width ?? null,
      react.button?.width ?? null,
      1,
      "ComboBox button width",
    );
    expectNear(
      solid.button?.height ?? null,
      react.button?.height ?? null,
      1,
      "ComboBox button height",
    );
    expectNear(
      solid.invalidIcon?.width ?? null,
      react.invalidIcon?.width ?? null,
      1,
      "ComboBox invalid icon width",
    );
    expectNear(
      solid.invalidIcon?.height ?? null,
      react.invalidIcon?.height ?? null,
      1,
      "ComboBox invalid icon height",
    );
    expectNear(
      solid.chevronIcon?.width ?? null,
      react.chevronIcon?.width ?? null,
      1,
      "ComboBox chevron icon width",
    );
    expectNear(
      solid.chevronIcon?.height ?? null,
      react.chevronIcon?.height ?? null,
      1,
      "ComboBox chevron icon height",
    );
  });

  test("typing keeps focus and updates controlled input marker", async ({ page }) => {
    const fixtures = await comboBoxFixtures(page, "?size=XL");

    for (const item of [
      { stack: "react", root: fixtures.reactRoot, input: fixtures.reactInput },
      { stack: "solid", root: fixtures.solidRoot, input: fixtures.solidInput },
    ]) {
      await item.input.click();
      await item.input.fill("Ent");
      await expect(item.input, `${item.stack} input keeps typed text`).toHaveValue("Ent");
      await expect(item.root, `${item.stack} input marker updates`).toHaveAttribute(
        "data-comparison-input-value",
        "Ent",
      );
      await expect
        .poll(() => item.input.evaluate((element) => document.activeElement === element))
        .toBe(true);
    }
  });

  test("keyboard focus ring covers the field group", async ({ page }) => {
    const fixtures = await comboBoxFixtures(page, "?size=XL");

    await tabUntilActive(page, fixtures.reactRoot, "React ComboBox");
    const react = await comboBoxFocusRingMetrics(fixtures.reactRoot);

    await tabUntilActive(page, fixtures.solidRoot, "Solid ComboBox");
    const solid = await comboBoxFocusRingMetrics(fixtures.solidRoot);

    expect(solid.activeIsInput).toBe(react.activeIsInput);
    expect(solid.inputFocusVisible).toBe(react.inputFocusVisible);
    expect(solid.fieldGroupFocusVisible).toBe(react.fieldGroupFocusVisible);
    expect(solid.fieldGroupOutlineStyle).toBe(react.fieldGroupOutlineStyle);
    expect(solid.fieldGroupOutlineWidth).toBe(react.fieldGroupOutlineWidth);
    expect(solid.fieldGroupOutlineColor).toBe(react.fieldGroupOutlineColor);
    expect(solid.fieldGroupOutlineOffset).toBe(react.fieldGroupOutlineOffset);
  });

  test("Enter on the focused input follows React Spectrum closed behavior", async ({ page }) => {
    const fixtures = await comboBoxFixtures(page, "?size=XL");

    for (const item of [
      { stack: "react", root: fixtures.reactRoot, input: fixtures.reactInput },
      { stack: "solid", root: fixtures.solidRoot, input: fixtures.solidInput },
    ]) {
      await item.input.focus();
      await page.keyboard.press("Enter");
      await expect(item.input, `${item.stack} input remains collapsed`).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await expect(item.root, `${item.stack} committed key remains stable`).toHaveAttribute(
        "data-comparison-value",
        "pro",
      );
      await expect
        .poll(() => item.input.evaluate((element) => document.activeElement === element))
        .toBe(true);
    }
  });

  test("first pointer selection commits and closes the list", async ({ page }) => {
    const focusAfterSelection: Record<string, boolean> = {};

    for (const stack of ["react", "solid"] as const) {
      const fixtures = await comboBoxFixtures(page, "?size=XL");
      const item =
        stack === "react"
          ? {
              stack,
              root: fixtures.reactRoot,
              input: fixtures.reactInput,
              button: fixtures.reactButton,
            }
          : {
              stack,
              root: fixtures.solidRoot,
              input: fixtures.solidInput,
              button: fixtures.solidButton,
            };

      await expect(item.root, `${item.stack} initial key`).toHaveAttribute(
        "data-comparison-value",
        "pro",
      );
      await item.button.click();
      await expect(item.input, `${item.stack} opens on first pointer trigger`).toHaveAttribute(
        "aria-expanded",
        "true",
      );

      await expect
        .poll(() => openListMetrics(item.root), `${item.stack} first pointer list opens`)
        .toMatchObject({ hasListbox: true, ariaExpanded: "true" });
      await clickOpenOption(page, item.root, "Enterprise", `${item.stack} Enterprise`);

      await expect(item.root, `${item.stack} first pointer selection commits`).toHaveAttribute(
        "data-comparison-value",
        "enterprise",
      );
      await expect(item.root, `${item.stack} first pointer input marker updates`).toHaveAttribute(
        "data-comparison-input-value",
        "Enterprise",
      );
      await expect(item.input, `${item.stack} input shows selected option`).toHaveValue(
        "Enterprise",
      );
      await expect(
        item.input,
        `${item.stack} list closes after first pointer selection`,
      ).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("[role='listbox']")).toHaveCount(0);
      focusAfterSelection[item.stack] = await item.input.evaluate(
        (element) => document.activeElement === element,
      );
    }

    expect(focusAfterSelection.solid).toBe(focusAfterSelection.react);
  });

  test("selection and open list layout match React Spectrum", async ({ page }) => {
    const focusAfterKeyboardSelection: Record<string, boolean> = {};

    for (const stack of ["react", "solid"] as const) {
      const fixtures = await comboBoxFixtures(page, "?size=XL");
      const item =
        stack === "react"
          ? { stack, root: fixtures.reactRoot, input: fixtures.reactInput }
          : { stack, root: fixtures.solidRoot, input: fixtures.solidInput };

      await item.input.focus();
      await item.input.press("ArrowDown");
      await expect
        .poll(() => openListMetrics(item.root), `${item.stack} opens on ArrowDown`)
        .toMatchObject({
          activeIsInput: true,
          selectedText: "Pro",
          comparisonValue: "pro",
          inputValue: "Pro",
          ariaExpanded: "true",
        });

      await page.keyboard.press("ArrowDown");
      await expect
        .poll(() => openListMetrics(item.root), `${item.stack} previews active descendant`)
        .toMatchObject({
          activeIsInput: true,
          activeText: "Enterprise",
          selectedText: "Pro",
          comparisonValue: "pro",
          inputValue: "Pro",
          ariaExpanded: "true",
        });

      await page.keyboard.press("Enter");
      await expect(item.root).toHaveAttribute("data-comparison-value", "enterprise");
      await expect(item.root).toHaveAttribute("data-comparison-input-value", "Enterprise");
      await expect(item.input).toHaveValue("Enterprise");
      await expect(item.input).toHaveAttribute("aria-expanded", "false");
      focusAfterKeyboardSelection[item.stack] = await item.input.evaluate(
        (element) => document.activeElement === element,
      );
    }

    expect(focusAfterKeyboardSelection.solid).toBe(focusAfterKeyboardSelection.react);

    const layoutFixtures = await comboBoxFixtures(page, "?size=XL");

    await layoutFixtures.reactButton.click();
    const react = await waitForOpenListMetrics(
      layoutFixtures.reactRoot,
      "React ComboBox open list metrics",
    );
    const reactHover = await hoverFirstOpenOption(
      page,
      layoutFixtures.reactRoot,
      "React ComboBox hovered option",
    );
    await page.keyboard.press("Escape");
    await expect(layoutFixtures.reactInput).toHaveAttribute("aria-expanded", "false");

    await layoutFixtures.solidButton.click();
    const solid = await waitForOpenListMetrics(
      layoutFixtures.solidRoot,
      "Solid ComboBox open list metrics",
    );
    const solidHover = await hoverFirstOpenOption(
      page,
      layoutFixtures.solidRoot,
      "Solid ComboBox hovered option",
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
    expect(solidHover.firstOptionDataHovered).toBe(reactHover.firstOptionDataHovered);
    expect(solidHover.firstOptionBackground).toBe(reactHover.firstOptionBackground);
    expect(solidHover.firstOptionColor).toBe(reactHover.firstOptionColor);
    expect(solid.labelGridArea).toBe(react.labelGridArea);
    expect(solid.labelFontWeight).toBe(react.labelFontWeight);
    expect(solid.labelMarginTop).toBe(react.labelMarginTop);
    expectNear(solid.optionLeftInset, react.optionLeftInset, 1, "ComboBox option left inset");
    expectNear(solid.optionTopInset, react.optionTopInset, 1, "ComboBox option top inset");
    expectNear(solid.optionWidth, react.optionWidth, 1, "ComboBox option width");
    expectNear(solid.optionHeight, react.optionHeight, 1, "ComboBox option height");
    expectNear(solid.checkmarkWidth, react.checkmarkWidth, 1, "ComboBox list checkmark width");
    expectNear(solid.checkmarkHeight, react.checkmarkHeight, 1, "ComboBox list checkmark height");
  });

  test("advanced controls drive form, label, validation, and popover props", async ({ page }) => {
    const query =
      "?labelPosition=side&labelAlign=end&necessityIndicator=label&isRequired=true&withContextualHelp=true&name=planField&form=comboForm&formValue=text&validationBehavior=aria&menuTrigger=manual&direction=top&align=end&menuWidth=360&allowsCustomValue=true&disableEnterprise=true&shouldFlip=false";

    for (const stack of ["react", "solid"] as const) {
      const fixtures = await comboBoxFixtures(page, query);
      const item =
        stack === "react"
          ? {
              stack,
              root: fixtures.reactRoot,
              input: fixtures.reactInput,
              button: fixtures.reactButton,
            }
          : {
              stack,
              root: fixtures.solidRoot,
              input: fixtures.solidInput,
              button: fixtures.solidButton,
            };

      expect(await controlProps(item.root)).toMatchObject({
        labelPosition: "side",
        labelAlign: "end",
        necessityIndicator: "label",
        name: "planField",
        form: "comboForm",
        formValue: "text",
        validationBehavior: "aria",
        menuTrigger: "manual",
        direction: "top",
        align: "end",
        menuWidth: "360",
        allowsCustomValue: true,
        disableEnterprise: true,
        shouldFlip: false,
        withContextualHelp: true,
      });

      await expect(item.input, `${item.stack} text form name`).toHaveAttribute("name", "planField");
      await expect(item.input, `${item.stack} external form id`).toHaveAttribute(
        "form",
        "comboForm",
      );
      await expect(item.root.getByRole("button", { name: /help/i }).first()).toBeVisible();

      await item.button.click();
      const metrics = await waitForOpenListMetrics(item.root, `${item.stack} manual popover`);
      expectNear(metrics.popoverWidth, 360, 2, `${item.stack} menuWidth popover`);
      expect(metrics.enterpriseDisabled, `${item.stack} Enterprise option disabled`).toBe(true);
      await page.keyboard.press("Escape");
      await expect(item.input).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("read-only disables the trigger while keeping the input readonly", async ({ page }) => {
    const fixtures = await comboBoxFixtures(page, "?isReadOnly=true");

    for (const item of [
      {
        stack: "react",
        input: fixtures.reactInput,
        button: fixtures.reactButton,
      },
      {
        stack: "solid",
        input: fixtures.solidInput,
        button: fixtures.solidButton,
      },
    ]) {
      await expect(item.input, `${item.stack} read-only input`).toHaveAttribute("readonly", "");
      await expect(item.button, `${item.stack} read-only trigger`).toBeDisabled();
      await expect(item.input, `${item.stack} read-only list stays collapsed`).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
  });
});
