import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function textAreaFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/textarea/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="textarea"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="textarea"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();
  await waitForTextAreaAutoHeight(page);

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactInput: reactPanel.getByRole("textbox", { name: "Notes" }).first(),
    solidInput: solidPanel.getByRole("textbox", { name: "Notes" }).first(),
  };
}

async function waitForTextAreaAutoHeight(page: Page) {
  await page.waitForFunction(() => {
    const roots = Array.from(
      document.querySelectorAll<HTMLElement>('[data-comparison-control-root="textarea"]'),
    );
    const textareas = roots
      .map((root) => root.querySelector<HTMLTextAreaElement>("textarea"))
      .filter((textarea): textarea is HTMLTextAreaElement => textarea != null);
    const heights = textareas.map((textarea) => textarea.offsetHeight);

    return (
      roots.length === 2 &&
      textareas.length === 2 &&
      textareas.every((textarea) => Math.abs(textarea.offsetHeight - textarea.scrollHeight) <= 1) &&
      Math.abs(heights[0] - heights[1]) <= 2
    );
  });
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function textAreaGeometry(root: Locator) {
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
    const textarea = element.querySelector<HTMLTextAreaElement>("textarea");
    const fieldGroup = textarea?.parentElement ?? null;
    const label = element.querySelector("label");
    const helpTextLeaf = Array.from(element.querySelectorAll<HTMLElement>("*")).find(
      (candidate) =>
        candidate.children.length === 0 && candidate.textContent?.trim() === "Notes are required.",
    );
    const helpTextParent = helpTextLeaf?.parentElement;
    const helpText =
      helpTextParent != null && window.getComputedStyle(helpTextParent).display === "flex"
        ? helpTextParent
        : helpTextLeaf;
    const invalidIcon = fieldGroup?.querySelector<SVGElement>("svg");
    const groupStyle = fieldGroup == null ? null : window.getComputedStyle(fieldGroup);
    const textareaStyle = textarea == null ? null : window.getComputedStyle(textarea);
    const helpStyle = helpText == null ? null : window.getComputedStyle(helpText);
    const labelRect = label?.getBoundingClientRect();
    const groupRect = fieldGroup?.getBoundingClientRect();
    const textareaRect = textarea?.getBoundingClientRect();
    const iconRect = invalidIcon?.getBoundingClientRect();
    const helpRect = helpText?.getBoundingClientRect();
    const groupCenterY = groupRect == null ? null : groupRect.top + groupRect.height / 2;
    const textareaCenterY =
      textareaRect == null ? null : textareaRect.top + textareaRect.height / 2;
    const iconCenterY = iconRect == null ? null : iconRect.top + iconRect.height / 2;

    return {
      value: textarea?.value ?? null,
      placeholder: textarea?.getAttribute("placeholder") ?? null,
      ariaInvalid: textarea?.getAttribute("aria-invalid") ?? null,
      ariaRequired: textarea?.getAttribute("aria-required") ?? null,
      required: textarea?.required ?? null,
      disabled: textarea?.disabled ?? null,
      readOnly: textarea?.readOnly ?? null,
      label: relativeRect(labelRect, rootRect),
      group: relativeRect(groupRect, rootRect),
      textarea: relativeRect(textareaRect, rootRect),
      invalidIcon: relativeRect(iconRect, rootRect),
      helpText: relativeRect(helpRect, rootRect),
      labelToGroupGap: numberOrNull(
        labelRect == null || groupRect == null ? null : groupRect.top - labelRect.bottom,
      ),
      groupToHelpGap: numberOrNull(
        groupRect == null || helpRect == null ? null : helpRect.top - groupRect.bottom,
      ),
      textareaCenterDelta: numberOrNull(
        textareaCenterY == null || groupCenterY == null ? null : textareaCenterY - groupCenterY,
      ),
      iconCenterDelta: numberOrNull(
        iconCenterY == null || groupCenterY == null ? null : iconCenterY - groupCenterY,
      ),
      groupBorderColor: groupStyle?.borderColor ?? null,
      groupBackground: groupStyle?.backgroundColor ?? null,
      textareaColor: textareaStyle?.color ?? null,
      textareaResize: textareaStyle?.resize ?? null,
      textareaOverflowX: textareaStyle?.overflowX ?? null,
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

test.describe("comparison TextArea visual parity", () => {
  test("invalid required XL state has committed pair screenshots", async ({ page }) => {
    const fixtures = await textAreaFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "TextArea invalid required XL state",
      "textarea-invalid-required-xl",
      { maxMismatchRatio: 0.22, maxDimensionDelta: 32, pixelThreshold: 64 },
    );
  });

  test("invalid required XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await textAreaFixtures(page, "?isInvalid=true&isRequired=true&size=XL");

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: "Quarterly planning notes\nFollow up with design.",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      isInvalid: true,
      isRequired: true,
      value: "Quarterly planning notes\nFollow up with design.",
    });

    const react = await textAreaGeometry(fixtures.reactRoot);
    const solid = await textAreaGeometry(fixtures.solidRoot);

    expect(solid.value).toBe(react.value);
    expect(solid.placeholder).toBe(react.placeholder);
    expect(solid.ariaInvalid).toBe(react.ariaInvalid);
    expect(solid.required).toBe(react.required);
    expect([react.ariaRequired, "true"]).toContain(solid.ariaRequired);
    expect(solid.disabled).toBe(react.disabled);
    expect(solid.readOnly).toBe(react.readOnly);
    expect(solid.groupBorderColor).toBe(react.groupBorderColor);
    expect(solid.groupBackground).toBe(react.groupBackground);
    expect(solid.textareaColor).toBe(react.textareaColor);
    expect(solid.textareaResize).toBe(react.textareaResize);
    expect(solid.textareaOverflowX).toBe(react.textareaOverflowX);
    expect(solid.helpColor).toBe(react.helpColor);

    expectNear(solid.group?.width ?? null, react.group?.width ?? null, 1, "TextArea group width");
    expectNear(
      solid.group?.height ?? null,
      react.group?.height ?? null,
      2,
      "TextArea group height",
    );
    expectNear(
      solid.textarea?.height ?? null,
      react.textarea?.height ?? null,
      2,
      "TextArea textarea height",
    );
    expectNear(
      solid.invalidIcon?.width ?? null,
      react.invalidIcon?.width ?? null,
      1,
      "TextArea invalid icon width",
    );
    expectNear(
      solid.invalidIcon?.height ?? null,
      react.invalidIcon?.height ?? null,
      1,
      "TextArea invalid icon height",
    );
    expectNear(solid.labelToGroupGap, react.labelToGroupGap, 1, "TextArea label-to-group gap");
    expectNear(solid.groupToHelpGap, react.groupToHelpGap, 1, "TextArea group-to-help gap");
    expectNear(
      solid.textareaCenterDelta,
      react.textareaCenterDelta,
      1,
      "TextArea textarea centerline",
    );
    expectNear(solid.iconCenterDelta, react.iconCenterDelta, 2, "TextArea invalid icon centerline");
  });

  test("typing updates controlled multiline value on both stacks", async ({ page }) => {
    const fixtures = await textAreaFixtures(page);
    const nextValue = "Quarterly planning notes updated\nFollow up with design.\nAdd QA owner.";

    for (const item of [
      { panel: fixtures.reactPanel, input: fixtures.reactInput },
      { panel: fixtures.solidPanel, input: fixtures.solidInput },
    ]) {
      const before = await item.input.boundingBox();
      await expect(item.input).toHaveValue("Quarterly planning notes\nFollow up with design.");
      await item.input.fill(nextValue);
      await expect(item.input).toHaveValue(nextValue);
      await expect
        .poll(() =>
          item.input.evaluate(
            (element) =>
              Math.abs(
                (element as HTMLTextAreaElement).offsetHeight -
                  (element as HTMLTextAreaElement).scrollHeight,
              ) <= 1,
          ),
        )
        .toBe(true);
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        nextValue,
      );
      const after = await item.input.boundingBox();
      expect(after?.height ?? 0).toBeGreaterThan(before?.height ?? 0);
    }
  });
});
