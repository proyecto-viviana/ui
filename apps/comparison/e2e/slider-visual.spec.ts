import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function sliderFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/slider/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="slider"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="slider"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactSlider: reactPanel.getByRole("slider", { name: "Volume" }).first(),
    solidSlider: solidPanel.getByRole("slider", { name: "Volume" }).first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean | number
  >;
}

async function sliderGeometry(root: Locator) {
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

    const rootRect = element.getBoundingClientRect();
    const explicitSliders = Array.from(element.querySelectorAll<HTMLElement>('[role="slider"]'));
    const implicitSliders = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[type="range"]'),
    ).filter((candidate) => !explicitSliders.includes(candidate));
    const sliders = [...explicitSliders, ...implicitSliders].filter(
      (candidate) => candidate.getBoundingClientRect().width > 0,
    );
    const slider = sliders[0] ?? null;
    const label =
      Array.from(element.querySelectorAll<HTMLElement>("*")).find(
        (candidate) =>
          candidate.children.length === 0 && candidate.textContent?.trim() === "Volume",
      ) ?? null;
    const output =
      Array.from(element.querySelectorAll<HTMLElement>("[role='status'],output,*")).find(
        (candidate) => candidate.children.length === 0 && candidate.textContent?.trim() === "72",
      ) ?? null;
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
          rect.width <= 30 &&
          rect.height >= 16 &&
          rect.height <= 30 &&
          style.borderStyle !== "none" &&
          Number.parseFloat(style.borderWidth) > 0,
      )
      .sort((a, b) => area(a.rect) - area(b.rect));
    const visibleThumb = thumbCandidates[0] ?? null;
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
          style.backgroundColor !== "rgba(0, 0, 0, 0)",
      )
      .sort((a, b) => area(b.rect) - area(a.rect));
    const track = wideTrackCandidates[0] ?? null;
    const fill =
      wideTrackCandidates.find(
        (candidate) =>
          track != null &&
          candidate.node !== track.node &&
          candidate.style.backgroundColor !== track.style.backgroundColor &&
          Math.abs(candidate.rect.height - track.rect.height) <= 1,
      ) ?? null;
    const sliderRect = visibleThumb?.rect ?? slider?.getBoundingClientRect();
    const thumbStyle =
      visibleThumb?.style ?? (slider == null ? null : window.getComputedStyle(slider));
    const labelStyle = label == null ? null : window.getComputedStyle(label);
    const outputStyle = output == null ? null : window.getComputedStyle(output);
    const trackCenterY = track == null ? null : track.rect.top + track.rect.height / 2;
    const thumbCenterY = sliderRect == null ? null : sliderRect.top + sliderRect.height / 2;

    return {
      sliderCount: sliders.length,
      valueNow:
        slider?.getAttribute("aria-valuenow") ??
        (slider instanceof HTMLInputElement ? slider.value : null),
      valueMin:
        slider?.getAttribute("aria-valuemin") ??
        (slider instanceof HTMLInputElement ? slider.min : null),
      valueMax:
        slider?.getAttribute("aria-valuemax") ??
        (slider instanceof HTMLInputElement ? slider.max : null),
      valueText: slider?.getAttribute("aria-valuetext") ?? null,
      disabled: slider?.getAttribute("aria-disabled") === "true",
      labelText: label?.textContent?.trim() ?? null,
      outputText: output?.textContent?.trim() ?? null,
      slider: relativeRect(sliderRect, rootRect),
      track: track == null ? null : relativeRect(track.rect, rootRect),
      fill: fill == null ? null : relativeRect(fill.rect, rootRect),
      thumbCenterDelta: numberOrNull(
        trackCenterY == null || thumbCenterY == null ? null : thumbCenterY - trackCenterY,
      ),
      thumbBackground: thumbStyle?.backgroundColor ?? null,
      thumbBorderColor: thumbStyle?.borderColor ?? null,
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

test.describe("comparison Slider visual parity", () => {
  test("emphasized XL thick precise state has committed pair screenshots", async ({ page }) => {
    const fixtures = await sliderFixtures(
      page,
      "?value=72&isEmphasized=true&size=XL&trackStyle=thick&thumbStyle=precise",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Slider emphasized XL thick precise state",
      "slider-emphasized-xl-thick-precise",
      { maxMismatchRatio: 0.22, maxDimensionDelta: 24, pixelThreshold: 64 },
    );
  });

  test("emphasized XL thick precise geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await sliderFixtures(
      page,
      "?value=72&isEmphasized=true&size=XL&trackStyle=thick&thumbStyle=precise",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      value: 72,
      size: "XL",
      trackStyle: "thick",
      thumbStyle: "precise",
      isEmphasized: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      value: 72,
      size: "XL",
      trackStyle: "thick",
      thumbStyle: "precise",
      isEmphasized: true,
    });
    await expect(fixtures.reactPanel.getByRole("slider", { name: "Volume" })).toHaveCount(1);
    await expect(fixtures.solidPanel.getByRole("slider", { name: "Volume" })).toHaveCount(1);

    const react = await sliderGeometry(fixtures.reactRoot);
    const solid = await sliderGeometry(fixtures.solidRoot);

    expect(solid.sliderCount).toBe(react.sliderCount);
    expect(solid.valueNow).toBe(react.valueNow);
    expect(solid.valueMin).toBe(react.valueMin);
    expect(solid.valueMax).toBe(react.valueMax);
    expect(solid.valueText).toBe(react.valueText);
    expect(solid.disabled).toBe(react.disabled);
    expect(solid.labelText).toBe(react.labelText);
    expect(solid.outputText).toBe(react.outputText);
    expect(solid.labelColor).toBe(react.labelColor);
    expect(solid.outputColor).toBe(react.outputColor);
    expect(solid.thumbBackground).toBe(react.thumbBackground);
    expect(solid.thumbBorderColor).toBe(react.thumbBorderColor);
    expect(solid.trackBackground).toBe(react.trackBackground);
    expect(solid.fillBackground).toBe(react.fillBackground);

    expectNear(solid.slider?.width ?? null, react.slider?.width ?? null, 1, "Slider thumb width");
    expectNear(
      solid.slider?.height ?? null,
      react.slider?.height ?? null,
      1,
      "Slider thumb height",
    );
    expectNear(solid.track?.width ?? null, react.track?.width ?? null, 2, "Slider track width");
    expectNear(solid.track?.height ?? null, react.track?.height ?? null, 1, "Slider track height");
    expectNear(solid.fill?.height ?? null, react.fill?.height ?? null, 1, "Slider fill height");
    expectNear(solid.thumbCenterDelta, react.thumbCenterDelta, 1, "Slider thumb centerline");
  });

  test("keyboard updates controlled value and keeps focus on both stacks", async ({ page }) => {
    const fixtures = await sliderFixtures(page);

    const sliderValue = (slider: Locator) =>
      slider.evaluate((element) =>
        element instanceof HTMLInputElement ? element.value : element.getAttribute("aria-valuenow"),
      );

    for (const item of [
      { panel: fixtures.reactPanel, slider: fixtures.reactSlider },
      { panel: fixtures.solidPanel, slider: fixtures.solidSlider },
    ]) {
      await expect.poll(async () => sliderValue(item.slider)).toBe("40");
      await item.slider.focus();
      await expect(item.slider).toBeFocused();
      await item.slider.press("ArrowRight");
      await expect.poll(async () => sliderValue(item.slider)).toBe("41");
      await expect(item.slider).toBeFocused();
      await expect(item.panel.locator("[data-comparison-value]").first()).toHaveAttribute(
        "data-comparison-value",
        "41",
      );
    }
  });
});
