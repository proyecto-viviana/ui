import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function colorAreaFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/colorarea/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="colorarea"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="colorarea"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactArea: reactRoot.locator('[role="group"]').first(),
    solidArea: solidRoot.locator('[role="group"]').first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function colorAreaContract(root: Locator) {
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
    const area = element.querySelector<HTMLElement>('[role="group"]');
    if (!area) {
      return { missing: true };
    }

    const rootRect = area.getBoundingClientRect();
    const areaStyle = window.getComputedStyle(area);
    const inputs = Array.from(area.querySelectorAll<HTMLInputElement>('input[type="range"]'));
    const thumbCandidates = Array.from(area.querySelectorAll<HTMLElement>("div"))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return { node, rect, style };
      })
      .filter(
        ({ rect, style }) =>
          rect.width >= 8 &&
          rect.width <= 40 &&
          rect.height >= 8 &&
          rect.height <= 40 &&
          style.borderStyle !== "none" &&
          Number.parseFloat(style.borderWidth) > 0,
      )
      .sort(
        (left, right) => left.rect.width * left.rect.height - right.rect.width * right.rect.height,
      );
    const thumb = thumbCandidates[0] ?? null;
    const thumbStyle = thumb == null ? null : window.getComputedStyle(thumb.node);

    return {
      missing: false,
      role: area.getAttribute("role"),
      ariaLabel: area.getAttribute("aria-label"),
      ariaLabelledBy: area.getAttribute("aria-labelledby"),
      ariaDescribedBy: area.getAttribute("aria-describedby"),
      ariaDetails: area.getAttribute("aria-details"),
      ariaDisabled: area.getAttribute("aria-disabled"),
      id: area.getAttribute("id"),
      slot: area.getAttribute("slot"),
      dataDisabled: area.getAttribute("data-disabled"),
      direction: areaStyle.direction,
      touchAction: areaStyle.touchAction,
      width: numberOrNull(rootRect.width),
      height: numberOrNull(rootRect.height),
      borderRadius: areaStyle.borderRadius,
      outlineStyle: areaStyle.outlineStyle,
      outlineWidth: areaStyle.outlineWidth,
      outlineOffset: areaStyle.outlineOffset,
      outlineColor: areaStyle.outlineColor,
      backgroundColor: areaStyle.backgroundColor,
      backgroundImage: areaStyle.backgroundImage,
      backgroundBlendMode: areaStyle.backgroundBlendMode,
      inputs: inputs.map((input) => ({
        type: input.type,
        id: input.id,
        name: input.getAttribute("name"),
        form: input.getAttribute("form"),
        disabled: input.disabled,
        min: input.min,
        max: input.max,
        step: input.step,
        value: input.value,
        tabIndex: input.tabIndex,
        ariaLabel: input.getAttribute("aria-label"),
        ariaRoleDescription: input.getAttribute("aria-roledescription"),
        ariaValueText: input.getAttribute("aria-valuetext"),
        ariaOrientation: input.getAttribute("aria-orientation"),
        ariaDescribedBy: input.getAttribute("aria-describedby"),
        ariaDetails: input.getAttribute("aria-details"),
        ariaHidden: input.getAttribute("aria-hidden"),
      })),
      thumb:
        thumb == null
          ? null
          : {
              rect: relativeRect(thumb.rect, rootRect),
              borderColor: thumbStyle?.borderColor ?? null,
              borderWidth: thumbStyle?.borderWidth ?? null,
              borderRadius: thumbStyle?.borderRadius ?? null,
              outlineColor: thumbStyle?.outlineColor ?? null,
              outlineWidth: thumbStyle?.outlineWidth ?? null,
              backgroundColor: thumbStyle?.backgroundColor ?? null,
              backgroundImage: thumbStyle?.backgroundImage ?? null,
              dataDragging: thumb.node.getAttribute("data-dragging"),
              dataDisabled: thumb.node.getAttribute("data-disabled"),
            },
    };
  });
}

type ColorAreaContract = Awaited<ReturnType<typeof colorAreaContract>>;

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

function expectIdToMatchOrBeGenerated(
  solidId: string | null,
  reactId: string | null,
  label: string,
) {
  if (reactId == null) {
    expect(solidId, label).toBeNull();
    return;
  }

  if (reactId.startsWith("react-aria")) {
    expect(solidId, label).toEqual(expect.any(String));
    return;
  }

  expect(solidId, label).toBe(reactId);
}

function expectColorAreaContractToMatch(solid: ColorAreaContract, react: ColorAreaContract) {
  expect(solid.missing).toBe(false);
  expect(react.missing).toBe(false);
  if (solid.missing || react.missing) return;

  expect(solid.role).toBe(react.role);
  expect(solid.ariaLabel).toBe(react.ariaLabel);
  expect(solid.ariaLabelledBy).toBe(react.ariaLabelledBy);
  expect(solid.ariaDescribedBy).toBe(react.ariaDescribedBy);
  expect(solid.ariaDetails).toBe(react.ariaDetails);
  expect(solid.ariaDisabled).toBe(react.ariaDisabled);
  expectIdToMatchOrBeGenerated(solid.id, react.id, "ColorArea group id");
  expect(solid.slot).toBe(react.slot);
  expect(solid.dataDisabled).toBe(react.dataDisabled);
  expect(solid.direction).toBe(react.direction);
  expect(solid.touchAction).toBe(react.touchAction);
  expect(solid.borderRadius).toBe(react.borderRadius);
  expect(solid.outlineStyle).toBe(react.outlineStyle);
  expect(solid.outlineWidth).toBe(react.outlineWidth);
  expect(solid.outlineOffset).toBe(react.outlineOffset);
  expect(solid.outlineColor).toBe(react.outlineColor);
  expect(solid.backgroundColor).toBe(react.backgroundColor);
  expect(solid.backgroundImage).toBe(react.backgroundImage);
  expect(solid.backgroundBlendMode).toBe(react.backgroundBlendMode);
  expectNear(solid.width, react.width, 1, "ColorArea width");
  expectNear(solid.height, react.height, 1, "ColorArea height");
  expect(react.width).toBe(192);
  expect(react.height).toBe(192);

  expect(solid.inputs).toHaveLength(2);
  expect(react.inputs).toHaveLength(2);
  for (let index = 0; index < solid.inputs.length; index += 1) {
    expectIdToMatchOrBeGenerated(
      solid.inputs[index]?.id ?? null,
      react.inputs[index]?.id ?? null,
      `ColorArea input ${index} id`,
    );
    expect({ ...solid.inputs[index], id: null }).toEqual({ ...react.inputs[index], id: null });
  }
  expect(solid.inputs[0]).toMatchObject({
    min: "0",
    max: "255",
    tabIndex: 0,
    ariaRoleDescription: "2D slider",
    ariaOrientation: "horizontal",
  });
  expect(solid.inputs[1]).toMatchObject({
    min: "0",
    max: "255",
    tabIndex: -1,
    ariaRoleDescription: "2D slider",
    ariaOrientation: "vertical",
    ariaHidden: "true",
  });

  expect(solid.thumb).not.toBeNull();
  expect(react.thumb).not.toBeNull();
  if (solid.thumb == null || react.thumb == null) return;
  expectNear(solid.thumb.rect?.x ?? null, react.thumb.rect?.x ?? null, 1, "ColorArea thumb x");
  expectNear(solid.thumb.rect?.y ?? null, react.thumb.rect?.y ?? null, 1, "ColorArea thumb y");
  expectNear(
    solid.thumb.rect?.width ?? null,
    react.thumb.rect?.width ?? null,
    1,
    "ColorArea thumb width",
  );
  expectNear(
    solid.thumb.rect?.height ?? null,
    react.thumb.rect?.height ?? null,
    1,
    "ColorArea thumb height",
  );
  expect(solid.thumb.borderColor).toBe(react.thumb.borderColor);
  expect(solid.thumb.borderWidth).toBe(react.thumb.borderWidth);
  expect(solid.thumb.borderRadius).toBe(react.thumb.borderRadius);
  expect(solid.thumb.outlineColor).toBe(react.thumb.outlineColor);
  expect(solid.thumb.outlineWidth).toBe(react.thumb.outlineWidth);
  expect(solid.thumb.backgroundColor).toBe(react.thumb.backgroundColor);
  expect(solid.thumb.backgroundImage).toBe(react.thumb.backgroundImage);
  expect(solid.thumb.dataDisabled).toBe(react.thumb.dataDisabled);
}

async function rangeValues(root: Locator) {
  return root
    .locator('input[type="range"]')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
}

async function dragColorArea(page: Page, area: Locator, xRatio: number, yRatio: number) {
  await area.scrollIntoViewIfNeeded();
  const box = await area.boundingBox();
  expect(box).not.toBeNull();
  if (box == null) return;

  await page.mouse.move(box.x + box.width * xRatio, box.y + box.height * yRatio);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * (xRatio + 0.04), box.y + box.height * yRatio);
  await page.mouse.up();
}

test.describe("comparison ColorArea visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await colorAreaFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(page, fixtures.reactRoot, fixtures.solidRoot, "ColorArea default", {
      maxMismatchRatio: 0.08,
      maxDimensionDelta: 8,
      pixelThreshold: 64,
    });

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      ariaLabel: "Color",
      valueSource: "value",
      value: "#9B80FF",
      defaultValue: "#9B80FF",
      colorSpace: "",
      xChannel: "red",
      yChannel: "green",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      ariaLabel: "Color",
      valueSource: "value",
      value: "#9B80FF",
      defaultValue: "#9B80FF",
      colorSpace: "",
      xChannel: "red",
      yChannel: "green",
    });
    expectColorAreaContractToMatch(
      await colorAreaContract(fixtures.solidRoot),
      await colorAreaContract(fixtures.reactRoot),
    );
  });

  test("form, labeling, and disabled props match React Spectrum", async ({ page }) => {
    const fixtures = await colorAreaFixtures(
      page,
      "?ariaLabel=Disabled%20color&ariaDescribedBy=color-help&ariaDetails=color-details&id=swatch-area&slot=color&xName=redChannel&yName=greenChannel&form=colorForm&isDisabled=true",
    );

    expectColorAreaContractToMatch(
      await colorAreaContract(fixtures.solidRoot),
      await colorAreaContract(fixtures.reactRoot),
    );
    await expect(fixtures.reactArea).toHaveAttribute("data-disabled", "true");
    await expect(fixtures.solidArea).toHaveAttribute("data-disabled", "true");
  });

  test("keyboard and pointer changes update both stacks", async ({ page }) => {
    const fixtures = await colorAreaFixtures(
      page,
      "?xName=redChannel&yName=greenChannel&form=colorForm",
    );

    const reactXInput = fixtures.reactRoot.locator('input[type="range"]').first();
    const solidXInput = fixtures.solidRoot.locator('input[type="range"]').first();
    const reactBefore = Number(await reactXInput.inputValue());
    const solidBefore = Number(await solidXInput.inputValue());

    await reactXInput.focus();
    await page.keyboard.press("ArrowRight");
    await solidXInput.focus();
    await page.keyboard.press("ArrowRight");

    await expect
      .poll(async () => Number(await reactXInput.inputValue()))
      .toBeGreaterThan(reactBefore);
    await expect
      .poll(async () => Number(await solidXInput.inputValue()))
      .toBeGreaterThan(solidBefore);
    expect(await rangeValues(fixtures.solidRoot)).toEqual(await rangeValues(fixtures.reactRoot));

    const reactValueBefore = await fixtures.reactRoot.getAttribute("data-comparison-value");
    const solidValueBefore = await fixtures.solidRoot.getAttribute("data-comparison-value");
    await dragColorArea(page, fixtures.reactArea, 0.75, 0.25);
    await dragColorArea(page, fixtures.solidArea, 0.75, 0.25);

    await expect
      .poll(() => fixtures.reactRoot.getAttribute("data-comparison-value"))
      .not.toBe(reactValueBefore);
    await expect
      .poll(() => fixtures.solidRoot.getAttribute("data-comparison-value"))
      .not.toBe(solidValueBefore);
    expect(await rangeValues(fixtures.solidRoot)).toEqual(await rangeValues(fixtures.reactRoot));
  });

  test("RTL locale mirrors thumb geometry and gradient direction", async ({ page }) => {
    const fixtures = await colorAreaFixtures(page, "?locale=ar-AE");
    const react = await colorAreaContract(fixtures.reactRoot);
    const solid = await colorAreaContract(fixtures.solidRoot);

    expectColorAreaContractToMatch(solid, react);
  });
});
