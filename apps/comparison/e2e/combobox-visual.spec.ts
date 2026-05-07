import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection } from "./comparison-page";
import { pinComparisonTheme } from "./visual-diff";

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
      optionGridAreas: optionStyle?.gridTemplateAreas ?? null,
      optionGridColumns: optionStyle?.gridTemplateColumns ?? null,
      firstOptionDataFocused: firstOption?.hasAttribute("data-focused") ?? false,
      firstOptionDataHovered: firstOption?.hasAttribute("data-hovered") ?? false,
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
      await item.input.focus();
      await item.input.fill("");
      await page.keyboard.type("Ent");
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

  test("selection and open list layout match React Spectrum", async ({ page }) => {
    const fixtures = await comboBoxFixtures(page, "?size=XL");

    for (const item of [
      { stack: "react", root: fixtures.reactRoot, input: fixtures.reactInput },
      { stack: "solid", root: fixtures.solidRoot, input: fixtures.solidInput },
    ]) {
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
      await expect
        .poll(() => item.input.evaluate((element) => document.activeElement === element))
        .toBe(true);
    }

    await fixtures.reactButton.click();
    const react = await waitForOpenListMetrics(
      fixtures.reactRoot,
      "React ComboBox open list metrics",
    );
    const reactHover = await hoverFirstOpenOption(
      page,
      fixtures.reactRoot,
      "React ComboBox hovered option",
    );
    await page.keyboard.press("Escape");
    await expect(fixtures.reactInput).toHaveAttribute("aria-expanded", "false");

    await fixtures.solidButton.click();
    const solid = await waitForOpenListMetrics(
      fixtures.solidRoot,
      "Solid ComboBox open list metrics",
    );
    const solidHover = await hoverFirstOpenOption(
      page,
      fixtures.solidRoot,
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
});
