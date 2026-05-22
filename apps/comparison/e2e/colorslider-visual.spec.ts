import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function colorSliderFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/colorslider/${query}`);
  await waitForComparisonRouteReady(page);
  await page.waitForLoadState("networkidle");

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="colorslider"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="colorslider"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactTrack: reactRoot.locator('[role="group"]').first(),
    solidTrack: solidRoot.locator('[role="group"]').first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function colorSliderContract(root: Locator) {
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

    const slider = element.querySelector<HTMLElement>("[data-orientation]");
    const track = slider?.querySelector<HTMLElement>('[role="group"]') ?? null;
    const input = track?.querySelector<HTMLInputElement>('input[type="range"]') ?? null;
    const thumb = input?.closest<HTMLElement>("div") ?? null;
    const label = slider?.querySelector<HTMLLabelElement>("label") ?? null;
    const output = slider?.querySelector<HTMLOutputElement>("output") ?? null;
    if (!slider || !track || !input || !thumb) {
      return { missing: true };
    }

    const rootRect = slider.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const rootStyle = window.getComputedStyle(slider);
    const trackStyle = window.getComputedStyle(track);
    const inputStyle = window.getComputedStyle(input);
    const thumbStyle = window.getComputedStyle(thumb);

    return {
      missing: false,
      root: {
        id: slider.getAttribute("id"),
        slot: slider.getAttribute("slot"),
        dataOrientation: slider.getAttribute("data-orientation"),
        dataDisabled: slider.getAttribute("data-disabled"),
        dataChannel: slider.getAttribute("data-channel"),
        display: rootStyle.display,
        gridTemplateAreas: rootStyle.gridTemplateAreas,
        gridTemplateColumns: rootStyle.gridTemplateColumns,
        rowGap: rootStyle.rowGap,
        width: numberOrNull(rootRect.width),
        height: numberOrNull(rootRect.height),
      },
      label: label
        ? {
            id: label.id || null,
            forAttribute: label.getAttribute("for"),
            text: label.textContent?.trim() ?? "",
          }
        : null,
      output: output
        ? {
            id: output.id || null,
            forAttribute: output.getAttribute("for"),
            text: output.textContent?.trim() ?? "",
          }
        : null,
      track: {
        role: track.getAttribute("role"),
        id: track.getAttribute("id"),
        ariaLabel: track.getAttribute("aria-label"),
        ariaLabelledBy: track.getAttribute("aria-labelledby"),
        ariaDescribedBy: track.getAttribute("aria-describedby"),
        ariaDetails: track.getAttribute("aria-details"),
        ariaDisabled: track.getAttribute("aria-disabled"),
        dataDisabled: track.getAttribute("data-disabled"),
        dataDragging: track.getAttribute("data-dragging"),
        dataOrientation: track.getAttribute("data-orientation"),
        direction: trackStyle.direction,
        touchAction: trackStyle.touchAction,
        width: numberOrNull(trackRect.width),
        height: numberOrNull(trackRect.height),
        borderRadius: trackStyle.borderRadius,
        outlineStyle: trackStyle.outlineStyle,
        outlineWidth: trackStyle.outlineWidth,
        outlineOffset: trackStyle.outlineOffset,
        outlineColor: trackStyle.outlineColor,
        backgroundColor: trackStyle.backgroundColor,
        backgroundImage: trackStyle.backgroundImage,
      },
      input: {
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
        ariaLabelledBy: input.getAttribute("aria-labelledby"),
        ariaDescribedBy: input.getAttribute("aria-describedby"),
        ariaDetails: input.getAttribute("aria-details"),
        ariaValueText: input.getAttribute("aria-valuetext"),
        ariaOrientation: input.getAttribute("aria-orientation"),
        opacity: inputStyle.opacity,
        width: inputStyle.width,
        height: inputStyle.height,
        pointerEvents: inputStyle.pointerEvents,
      },
      thumb: {
        rect: relativeRect(thumbRect, trackRect),
        borderColor: thumbStyle.borderColor,
        borderWidth: thumbStyle.borderWidth,
        borderRadius: thumbStyle.borderRadius,
        outlineColor: thumbStyle.outlineColor,
        outlineWidth: thumbStyle.outlineWidth,
        backgroundColor: thumbStyle.backgroundColor,
        backgroundImage: thumbStyle.backgroundImage,
        dataDragging: thumb.getAttribute("data-dragging"),
        dataDisabled: thumb.getAttribute("data-disabled"),
        dataFocused: thumb.getAttribute("data-focused"),
        dataFocusVisible: thumb.getAttribute("data-focus-visible"),
      },
    };
  });
}

type ColorSliderContract = Awaited<ReturnType<typeof colorSliderContract>>;

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

function expectReferenceIdsToMatchOrBeGenerated(
  solidIds: string | null,
  reactIds: string | null,
  label: string,
) {
  if (reactIds == null) {
    expect(solidIds, label).toBeNull();
    return;
  }

  const reactParts = reactIds.split(/\s+/).filter(Boolean);
  const solidParts = solidIds?.split(/\s+/).filter(Boolean) ?? [];
  if (reactParts.some((id) => id.startsWith("react-aria"))) {
    expect(solidParts, label).toHaveLength(reactParts.length);
    solidParts.forEach((id) => expect(id, label).toEqual(expect.any(String)));
    return;
  }

  expect(solidIds, label).toBe(reactIds);
}

function expectColorSliderContractToMatch(solid: ColorSliderContract, react: ColorSliderContract) {
  expect(solid.missing).toBe(false);
  expect(react.missing).toBe(false);
  if (solid.missing || react.missing) return;

  expectIdToMatchOrBeGenerated(solid.root.id, react.root.id, "ColorSlider root id");
  expect({ ...solid.root, id: null, width: null, height: null }).toEqual({
    ...react.root,
    id: null,
    width: null,
    height: null,
  });
  expectNear(solid.root.width, react.root.width, 1, "ColorSlider root width");
  expectNear(solid.root.height, react.root.height, 1, "ColorSlider root height");

  if (react.label == null) {
    expect(solid.label).toBeNull();
  } else {
    expect(solid.label).not.toBeNull();
    if (solid.label) {
      expectIdToMatchOrBeGenerated(solid.label.id, react.label.id, "ColorSlider label id");
      expect({ ...solid.label, id: null }).toEqual({ ...react.label, id: null });
    }
  }

  if (react.output == null) {
    expect(solid.output).toBeNull();
  } else {
    expect(solid.output).not.toBeNull();
    if (solid.output) {
      expectIdToMatchOrBeGenerated(solid.output.id, react.output.id, "ColorSlider output id");
      expectIdToMatchOrBeGenerated(
        solid.output.forAttribute,
        react.output.forAttribute,
        "ColorSlider output for",
      );
      expect(solid.output.forAttribute).toBe(solid.input.id);
      expect(react.output.forAttribute).toBe(react.input.id);
      expect({ ...solid.output, id: null, forAttribute: null }).toEqual({
        ...react.output,
        id: null,
        forAttribute: null,
      });
    }
  }

  expectIdToMatchOrBeGenerated(solid.track.id, react.track.id, "ColorSlider track id");
  expectReferenceIdsToMatchOrBeGenerated(
    solid.track.ariaLabelledBy,
    react.track.ariaLabelledBy,
    "ColorSlider track aria-labelledby",
  );
  expectReferenceIdsToMatchOrBeGenerated(
    solid.track.ariaDescribedBy,
    react.track.ariaDescribedBy,
    "ColorSlider track aria-describedby",
  );
  expect({
    ...solid.track,
    id: null,
    ariaLabelledBy: null,
    ariaDescribedBy: null,
    width: null,
    height: null,
  }).toEqual({
    ...react.track,
    id: null,
    ariaLabelledBy: null,
    ariaDescribedBy: null,
    width: null,
    height: null,
  });
  expectNear(solid.track.width, react.track.width, 1, "ColorSlider track width");
  expectNear(solid.track.height, react.track.height, 1, "ColorSlider track height");

  expectIdToMatchOrBeGenerated(solid.input.id, react.input.id, "ColorSlider input id");
  expectReferenceIdsToMatchOrBeGenerated(
    solid.input.ariaLabelledBy,
    react.input.ariaLabelledBy,
    "ColorSlider input aria-labelledby",
  );
  expectReferenceIdsToMatchOrBeGenerated(
    solid.input.ariaDescribedBy,
    react.input.ariaDescribedBy,
    "ColorSlider input aria-describedby",
  );
  expect({ ...solid.input, id: null, ariaLabelledBy: null, ariaDescribedBy: null }).toEqual({
    ...react.input,
    id: null,
    ariaLabelledBy: null,
    ariaDescribedBy: null,
  });

  expectNear(solid.thumb.rect.x, react.thumb.rect.x, 1, "ColorSlider thumb x");
  expectNear(solid.thumb.rect.y, react.thumb.rect.y, 1, "ColorSlider thumb y");
  expectNear(solid.thumb.rect.width, react.thumb.rect.width, 1, "ColorSlider thumb width");
  expectNear(solid.thumb.rect.height, react.thumb.rect.height, 1, "ColorSlider thumb height");
  expect({ ...solid.thumb, rect: null }).toEqual({ ...react.thumb, rect: null });
}

async function rangeValue(root: Locator) {
  return Number(await root.locator('input[type="range"]').first().inputValue());
}

async function dragColorSlider(page: Page, track: Locator, xRatio: number, yRatio: number) {
  await track.scrollIntoViewIfNeeded();
  const box = await track.boundingBox();
  expect(box).not.toBeNull();
  if (box == null) return;

  await page.mouse.move(box.x + box.width * xRatio, box.y + box.height * yRatio);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * (xRatio + 0.04), box.y + box.height * yRatio);
  await page.mouse.up();
}

test.describe("comparison ColorSlider visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await colorSliderFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "ColorSlider default",
      {
        maxMismatchRatio: 0.08,
        maxDimensionDelta: 8,
        pixelThreshold: 64,
      },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      label: "",
      valueSource: "value",
      value: "hsl(50, 100%, 50%)",
      defaultValue: "hsl(50, 100%, 50%)",
      channel: "hue",
      colorSpace: "",
      orientation: "horizontal",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      label: "",
      valueSource: "value",
      value: "hsl(50, 100%, 50%)",
      defaultValue: "hsl(50, 100%, 50%)",
      channel: "hue",
      colorSpace: "",
      orientation: "horizontal",
    });
    const react = await colorSliderContract(fixtures.reactRoot);
    const solid = await colorSliderContract(fixtures.solidRoot);
    expectColorSliderContractToMatch(solid, react);
    if (!react.missing) {
      expect(react.label?.text).toBe("Hue");
      expect(react.root.width).toBe(192);
      expect(react.track.height).toBe(24);
    }
  });

  test("form, labeling, and disabled props match React Spectrum", async ({ page }) => {
    const fixtures = await colorSliderFixtures(
      page,
      "?label=Hue%20channel&ariaDescribedBy=color-slider-help&ariaDetails=color-slider-details&id=hue-slider&slot=color&name=hueChannel&form=colorForm&isDisabled=true",
    );

    expectColorSliderContractToMatch(
      await colorSliderContract(fixtures.solidRoot),
      await colorSliderContract(fixtures.reactRoot),
    );
    await expect(fixtures.reactRoot.locator('input[type="range"]').first()).toBeDisabled();
    await expect(fixtures.solidRoot.locator('input[type="range"]').first()).toBeDisabled();
  });

  test("keyboard and pointer changes update both stacks", async ({ page }) => {
    const fixtures = await colorSliderFixtures(page, "?name=hueChannel&form=colorForm");

    const reactInput = fixtures.reactRoot.locator('input[type="range"]').first();
    const solidInput = fixtures.solidRoot.locator('input[type="range"]').first();
    const reactBefore = Number(await reactInput.inputValue());
    const solidBefore = Number(await solidInput.inputValue());

    await reactInput.focus();
    await page.keyboard.press("ArrowRight");
    await solidInput.focus();
    await page.keyboard.press("ArrowRight");

    await expect.poll(() => rangeValue(fixtures.reactRoot)).toBeGreaterThan(reactBefore);
    await expect.poll(() => rangeValue(fixtures.solidRoot)).toBeGreaterThan(solidBefore);
    expect(await rangeValue(fixtures.solidRoot)).toBe(await rangeValue(fixtures.reactRoot));

    const reactValueBefore = await fixtures.reactRoot.getAttribute("data-comparison-value");
    const solidValueBefore = await fixtures.solidRoot.getAttribute("data-comparison-value");
    await dragColorSlider(page, fixtures.reactTrack, 0.75, 0.5);
    await dragColorSlider(page, fixtures.solidTrack, 0.75, 0.5);

    await expect
      .poll(() => fixtures.reactRoot.getAttribute("data-comparison-value"))
      .not.toBe(reactValueBefore);
    await expect
      .poll(() => fixtures.solidRoot.getAttribute("data-comparison-value"))
      .not.toBe(solidValueBefore);
    expect(
      Math.abs((await rangeValue(fixtures.solidRoot)) - (await rangeValue(fixtures.reactRoot))),
    ).toBeLessThanOrEqual(2);
  });

  test("vertical orientation hides visible label/output and matches track geometry", async ({
    page,
  }) => {
    const fixtures = await colorSliderFixtures(page, "?orientation=vertical&label=Hue%20channel");
    const react = await colorSliderContract(fixtures.reactRoot);
    const solid = await colorSliderContract(fixtures.solidRoot);

    expectColorSliderContractToMatch(solid, react);
    if (!react.missing) {
      expect(react.label).toBeNull();
      expect(react.output).toBeNull();
      expect(react.input.ariaOrientation).toBe("vertical");
      expect(react.track.width).toBe(24);
      expect(react.track.height).toBe(192);
    }
  });

  test("RTL locale mirrors thumb geometry and gradient direction", async ({ page }) => {
    const fixtures = await colorSliderFixtures(page, "?locale=ar-AE");
    const react = await colorSliderContract(fixtures.reactRoot);
    const solid = await colorSliderContract(fixtures.solidRoot);

    expectColorSliderContractToMatch(solid, react);
  });
});
