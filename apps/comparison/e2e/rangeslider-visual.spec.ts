import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function rangeSliderFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/rangeslider/${query}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="rangeslider"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="rangeslider"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactStartThumb: reactPanel.getByRole("slider", { name: "Minimum" }).first(),
    reactEndThumb: reactPanel.getByRole("slider", { name: "Maximum" }).first(),
    solidStartThumb: solidPanel.getByRole("slider", { name: "Minimum" }).first(),
    solidEndThumb: solidPanel.getByRole("slider", { name: "Maximum" }).first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean | number
  >;
}

async function rangeThumbValue(thumb: Locator) {
  return thumb.evaluate((element) =>
    element instanceof HTMLInputElement ? element.value : element.getAttribute("aria-valuenow"),
  );
}

function namedInput(root: Locator, name: string) {
  return root.locator(`input[name="${name}"]`).first();
}

async function rangeSliderGeometry(root: Locator) {
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
    const area = (rect: DOMRect) => rect.width * rect.height;
    const transparentColors = new Set(["rgba(0, 0, 0, 0)", "transparent"]);

    const rootRect = element.getBoundingClientRect();
    const explicitSliders = Array.from(element.querySelectorAll<HTMLElement>('[role="slider"]'));
    const implicitSliders = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[type="range"]'),
    ).filter((candidate) => !explicitSliders.includes(candidate));
    const sliders = [...explicitSliders, ...implicitSliders].filter((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const label =
      Array.from(element.querySelectorAll<HTMLElement>("*")).find(
        (candidate) => candidate.children.length === 0 && candidate.textContent?.trim() === "Range",
      ) ?? null;
    const output =
      element.querySelector<HTMLElement>("output") ??
      Array.from(element.querySelectorAll<HTMLElement>("[role='status']")).find(
        (candidate) => candidate.children.length === 0,
      ) ??
      null;
    const divs = Array.from(element.querySelectorAll<HTMLElement>("div"));
    const thumbCandidates = divs
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return { node, rect, style };
      })
      .filter(
        ({ rect, style }) =>
          rect.width >= 4 &&
          rect.width <= 32 &&
          rect.height >= 16 &&
          rect.height <= 32 &&
          style.borderStyle !== "none" &&
          Number.parseFloat(style.borderWidth) > 0,
      )
      .sort((left, right) => area(left.rect) - area(right.rect));
    const visibleThumbs = thumbCandidates.slice(0, 2).sort((left, right) => {
      const leftCenter = left.rect.left + left.rect.width / 2;
      const rightCenter = right.rect.left + right.rect.width / 2;
      return leftCenter - rightCenter;
    });
    const wideTrackCandidates = divs
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return { node, rect, style };
      })
      .filter(
        ({ rect, style }) =>
          rect.width >= 80 &&
          rect.height >= 3 &&
          rect.height <= 20 &&
          !transparentColors.has(style.backgroundColor),
      )
      .sort((left, right) => area(right.rect) - area(left.rect));
    const track = wideTrackCandidates[0] ?? null;
    const fill =
      wideTrackCandidates.find(
        (candidate) =>
          track != null &&
          candidate.node !== track.node &&
          candidate.style.backgroundColor !== track.style.backgroundColor &&
          Math.abs(candidate.rect.height - track.rect.height) <= 1,
      ) ?? null;
    const thumbRects =
      visibleThumbs.length >= 2
        ? visibleThumbs.map((candidate) => candidate.rect)
        : sliders.map((slider) => slider.getBoundingClientRect()).slice(0, 2);
    const thumbStyles =
      visibleThumbs.length >= 2
        ? visibleThumbs.map((candidate) => candidate.style)
        : sliders.slice(0, 2).map((slider) => window.getComputedStyle(slider));
    const labelStyle = label == null ? null : window.getComputedStyle(label);
    const outputStyle = output == null ? null : window.getComputedStyle(output);
    const trackCenterY = track == null ? null : track.rect.top + track.rect.height / 2;
    const thumbCenterDeltas = thumbRects.map((rect) =>
      numberOrNull(trackCenterY == null ? null : rect.top + rect.height / 2 - trackCenterY),
    );

    return {
      sliderCount: sliders.length,
      values: sliders.map(
        (slider) =>
          slider.getAttribute("aria-valuenow") ??
          (slider instanceof HTMLInputElement ? slider.value : null),
      ),
      valueMins: sliders.map(
        (slider) =>
          slider.getAttribute("aria-valuemin") ??
          (slider instanceof HTMLInputElement ? slider.min : null),
      ),
      valueMaxes: sliders.map(
        (slider) =>
          slider.getAttribute("aria-valuemax") ??
          (slider instanceof HTMLInputElement ? slider.max : null),
      ),
      valueTexts: sliders.map((slider) => slider.getAttribute("aria-valuetext") ?? null),
      disabled: sliders.map((slider) => slider.getAttribute("aria-disabled") === "true"),
      labelText: label?.textContent?.trim() ?? null,
      outputText: output?.textContent?.trim() ?? null,
      thumbs: thumbRects.map((rect) => relativeRect(rect, rootRect)),
      track: track == null ? null : relativeRect(track.rect, rootRect),
      fill: fill == null ? null : relativeRect(fill.rect, rootRect),
      thumbCenterDeltas,
      thumbBackgrounds: thumbStyles.map((style) => style.backgroundColor),
      thumbBorderColors: thumbStyles.map((style) => style.borderColor),
      labelColor: labelStyle?.color ?? null,
      outputColor: outputStyle?.color ?? null,
      trackBackground: track?.style.backgroundColor ?? null,
      fillBackground: fill?.style.backgroundColor ?? null,
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

function expectRangeSliderGeometryToMatch(
  solid: Awaited<ReturnType<typeof rangeSliderGeometry>>,
  react: Awaited<ReturnType<typeof rangeSliderGeometry>>,
) {
  expect(solid.sliderCount).toBe(2);
  expect(react.sliderCount).toBe(2);
  expect(solid.values).toEqual(react.values);
  expect(solid.valueMins).toEqual(react.valueMins);
  expect(solid.valueMaxes).toEqual(react.valueMaxes);
  expect(solid.valueTexts).toEqual(react.valueTexts);
  expect(solid.disabled).toEqual(react.disabled);
  expect(solid.labelText).toBe(react.labelText);
  expect(solid.outputText).toBe(react.outputText);
  expect(solid.labelColor).toBe(react.labelColor);
  expect(solid.outputColor).toBe(react.outputColor);
  expect(solid.thumbBackgrounds).toEqual(react.thumbBackgrounds);
  expect(solid.thumbBorderColors).toEqual(react.thumbBorderColors);
  expect(solid.trackBackground).toBe(react.trackBackground);
  expect(solid.fillBackground).toBe(react.fillBackground);

  expect(solid.thumbs).toHaveLength(2);
  expect(react.thumbs).toHaveLength(2);
  for (const index of [0, 1]) {
    expectNear(
      solid.thumbs[index]?.width ?? null,
      react.thumbs[index]?.width ?? null,
      1,
      `RangeSlider thumb ${index} width`,
    );
    expectNear(
      solid.thumbs[index]?.height ?? null,
      react.thumbs[index]?.height ?? null,
      1,
      `RangeSlider thumb ${index} height`,
    );
    expectNear(
      solid.thumbCenterDeltas[index] ?? null,
      react.thumbCenterDeltas[index] ?? null,
      1,
      `RangeSlider thumb ${index} centerline`,
    );
  }
  expectNear(solid.track?.width ?? null, react.track?.width ?? null, 2, "RangeSlider track width");
  expectNear(
    solid.track?.height ?? null,
    react.track?.height ?? null,
    1,
    "RangeSlider track height",
  );
  expectNear(solid.fill?.width ?? null, react.fill?.width ?? null, 2, "RangeSlider fill width");
  expectNear(solid.fill?.height ?? null, react.fill?.height ?? null, 1, "RangeSlider fill height");
}

test.describe("comparison RangeSlider visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await rangeSliderFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "RangeSlider default",
      {
        maxMismatchRatio: 0.24,
        maxDimensionDelta: 24,
        pixelThreshold: 64,
      },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      label: "Range",
      valueSource: "defaultValue",
      defaultStartValue: 30,
      defaultEndValue: 60,
      minValue: 0,
      maxValue: 100,
      step: 1,
      size: "M",
      trackStyle: "thin",
      thumbStyle: "default",
      labelPosition: "top",
      labelAlign: "start",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      label: "Range",
      valueSource: "defaultValue",
      defaultStartValue: 30,
      defaultEndValue: 60,
      minValue: 0,
      maxValue: 100,
      step: 1,
      size: "M",
      trackStyle: "thin",
      thumbStyle: "default",
      labelPosition: "top",
      labelAlign: "start",
    });

    expectRangeSliderGeometryToMatch(
      await rangeSliderGeometry(fixtures.solidRoot),
      await rangeSliderGeometry(fixtures.reactRoot),
    );
  });

  test("emphasized XL thick precise state matches current React Spectrum", async ({ page }) => {
    const fixtures = await rangeSliderFixtures(
      page,
      "?valueSource=value&startValue=20&endValue=80&isEmphasized=true&size=XL&trackStyle=thick&thumbStyle=precise",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "RangeSlider emphasized XL thick precise state",
      { maxMismatchRatio: 0.24, maxDimensionDelta: 24, pixelThreshold: 64 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      valueSource: "value",
      startValue: 20,
      endValue: 80,
      size: "XL",
      trackStyle: "thick",
      thumbStyle: "precise",
      isEmphasized: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      valueSource: "value",
      startValue: 20,
      endValue: 80,
      size: "XL",
      trackStyle: "thick",
      thumbStyle: "precise",
      isEmphasized: true,
    });
    await expect(fixtures.reactPanel.getByRole("slider", { name: "Minimum" })).toHaveCount(1);
    await expect(fixtures.reactPanel.getByRole("slider", { name: "Maximum" })).toHaveCount(1);
    await expect(fixtures.solidPanel.getByRole("slider", { name: "Minimum" })).toHaveCount(1);
    await expect(fixtures.solidPanel.getByRole("slider", { name: "Maximum" })).toHaveCount(1);

    expectRangeSliderGeometryToMatch(
      await rangeSliderGeometry(fixtures.solidRoot),
      await rangeSliderGeometry(fixtures.reactRoot),
    );
  });

  test("defaultValue initializes uncontrolled values and forwards form names", async ({ page }) => {
    const fixtures = await rangeSliderFixtures(
      page,
      "?valueSource=defaultValue&defaultStartValue=25&defaultEndValue=75&startName=minPrice&endName=maxPrice&form=filterForm",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      valueSource: "defaultValue",
      defaultStartValue: 25,
      defaultEndValue: 75,
      startName: "minPrice",
      endName: "maxPrice",
      form: "filterForm",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      valueSource: "defaultValue",
      defaultStartValue: 25,
      defaultEndValue: 75,
      startName: "minPrice",
      endName: "maxPrice",
      form: "filterForm",
    });

    await expect.poll(async () => rangeThumbValue(fixtures.reactStartThumb)).toBe("25");
    await expect.poll(async () => rangeThumbValue(fixtures.reactEndThumb)).toBe("75");
    await expect.poll(async () => rangeThumbValue(fixtures.solidStartThumb)).toBe("25");
    await expect.poll(async () => rangeThumbValue(fixtures.solidEndThumb)).toBe("75");
    await expect(namedInput(fixtures.reactRoot, "minPrice")).toHaveAttribute("form", "filterForm");
    await expect(namedInput(fixtures.reactRoot, "maxPrice")).toHaveAttribute("form", "filterForm");
    await expect(namedInput(fixtures.solidRoot, "minPrice")).toHaveAttribute("form", "filterForm");
    await expect(namedInput(fixtures.solidRoot, "maxPrice")).toHaveAttribute("form", "filterForm");
    await expect(namedInput(fixtures.reactRoot, "minPrice")).toHaveValue("25");
    await expect(namedInput(fixtures.reactRoot, "maxPrice")).toHaveValue("75");
    await expect(namedInput(fixtures.solidRoot, "minPrice")).toHaveValue("25");
    await expect(namedInput(fixtures.solidRoot, "maxPrice")).toHaveValue("75");

    expectRangeSliderGeometryToMatch(
      await rangeSliderGeometry(fixtures.solidRoot),
      await rangeSliderGeometry(fixtures.reactRoot),
    );
  });

  test("keyboard updates controlled start value and keeps focus on both stacks", async ({
    page,
  }) => {
    const fixtures = await rangeSliderFixtures(
      page,
      "?valueSource=value&startValue=30&endValue=70",
    );

    for (const item of [
      { root: fixtures.reactRoot, thumb: fixtures.reactStartThumb },
      { root: fixtures.solidRoot, thumb: fixtures.solidStartThumb },
    ]) {
      await expect.poll(async () => rangeThumbValue(item.thumb)).toBe("30");
      const before = await rangeSliderGeometry(item.root);
      await item.thumb.focus();
      await expect(item.thumb).toBeFocused();
      await item.thumb.press("ArrowRight");
      await expect.poll(async () => rangeThumbValue(item.thumb)).toBe("31");
      await expect(item.thumb).toBeFocused();
      const after = await rangeSliderGeometry(item.root);
      expect(
        after.thumbs[0]?.x,
        "RangeSlider start thumb x should be present after keyboard change",
      ).toBeDefined();
      expect(
        before.thumbs[0]?.x,
        "RangeSlider start thumb x should be present before keyboard change",
      ).toBeDefined();
      expect(after.thumbs[0]!.x).toBeGreaterThan(before.thumbs[0]!.x + 0.5);
      await expect(item.root).toHaveAttribute("data-comparison-value", "31:70");
    }
  });
});
