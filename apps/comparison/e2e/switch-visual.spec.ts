import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function switchFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/switch/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="switch"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="switch"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactSwitch: reactPanel.getByRole("switch", { name: "Wi-Fi" }).first(),
    solidSwitch: solidPanel.getByRole("switch", { name: "Wi-Fi" }).first(),
    reactLabel: reactPanel.getByText("Wi-Fi").first(),
    solidLabel: solidPanel.getByText("Wi-Fi").first(),
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function switchGeometry(root: Locator) {
  return root.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const input = element.querySelector<HTMLInputElement>('input[type="checkbox"]');
    const track = Array.from(element.querySelectorAll<HTMLElement>("div")).find((candidate) => {
      const style = window.getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();
      return (
        style.borderStyle !== "none" &&
        Number.parseFloat(style.borderWidth) > 0 &&
        rect.width > rect.height &&
        rect.width >= 20 &&
        rect.width <= 80 &&
        rect.height >= 12 &&
        rect.height <= 32
      );
    });
    const handle = track?.querySelector<HTMLElement>("div");
    const label = Array.from(element.querySelectorAll<HTMLElement>("*")).find(
      (candidate) => candidate.children.length === 0 && candidate.textContent?.trim() === "Wi-Fi",
    );
    const rootStyle = window.getComputedStyle(element);
    const labelStyle = label == null ? null : window.getComputedStyle(label);
    const trackStyle = track == null ? null : window.getComputedStyle(track);
    const handleStyle = handle == null ? null : window.getComputedStyle(handle);
    const trackRect = track?.getBoundingClientRect();
    const handleRect = handle?.getBoundingClientRect();
    const trackCenterY = trackRect == null ? null : trackRect.top + trackRect.height / 2;
    const handleCenterY = handleRect == null ? null : handleRect.top + handleRect.height / 2;

    return {
      checked: input?.checked ?? false,
      disabled: input?.disabled ?? false,
      readOnly: input?.getAttribute("aria-readonly") === "true",
      trackWidth: numberOrNull(trackRect?.width),
      trackHeight: numberOrNull(trackRect?.height),
      handleWidth: numberOrNull(handleRect?.width),
      handleHeight: numberOrNull(handleRect?.height),
      handleOffsetX: numberOrNull(
        trackRect == null || handleRect == null ? null : handleRect.left - trackRect.left,
      ),
      handleCenterDelta: numberOrNull(
        trackCenterY == null || handleCenterY == null ? null : handleCenterY - trackCenterY,
      ),
      rootColor: rootStyle.color,
      labelColor: labelStyle?.color ?? null,
      trackBackground: trackStyle?.backgroundColor ?? null,
      trackBorderColor: trackStyle?.borderColor ?? null,
      handleBackground: handleStyle?.backgroundColor ?? null,
      handleTransform: handleStyle?.transform ?? null,
      handleWillChange: handleStyle?.willChange ?? null,
    };
  });
}

async function markSwitchMotionNodes(root: Locator, marker: string) {
  return root.evaluate((element, id) => {
    const track = Array.from(element.querySelectorAll<HTMLElement>("div")).find((candidate) => {
      const style = window.getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();
      return (
        style.borderStyle !== "none" &&
        Number.parseFloat(style.borderWidth) > 0 &&
        rect.width > rect.height &&
        rect.width >= 20 &&
        rect.width <= 80 &&
        rect.height >= 12 &&
        rect.height <= 32
      );
    });
    const thumb = track?.querySelector<HTMLElement>(":scope > div");

    track?.setAttribute("data-comparison-track-probe", id);
    thumb?.setAttribute("data-comparison-thumb-probe", id);

    const style = thumb == null ? null : window.getComputedStyle(thumb);
    return {
      transform: style?.transform ?? null,
      transitionDuration: style?.transitionDuration ?? null,
    };
  }, marker);
}

async function switchMotionProbe(root: Locator, marker: string) {
  return root.evaluate((element, id) => {
    const track = element.ownerDocument.querySelector<HTMLElement>(
      `[data-comparison-track-probe="${id}"]`,
    );
    const thumb = element.ownerDocument.querySelector<HTMLElement>(
      `[data-comparison-thumb-probe="${id}"]`,
    );
    const style = thumb == null ? null : window.getComputedStyle(thumb);

    return {
      sameTrackNode: track != null,
      sameThumbNode: thumb != null,
      transform: style?.transform ?? null,
      transitionDuration: style?.transitionDuration ?? null,
    };
  }, marker);
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

async function setSwitchControl(page: Page, name: string, checked: boolean) {
  const input = page.locator(
    `[data-comparison-controls="switch"] input[type="checkbox"][name="${name}"]`,
  );
  await expect(input).toHaveCount(1);
  if (checked) {
    await input.check();
  } else {
    await input.uncheck();
  }
}

test.describe("comparison Switch visual parity", () => {
  test("selected emphasized XL state has committed pair screenshots", async ({ page }) => {
    const fixtures = await switchFixtures(page, "?isSelected=true&isEmphasized=true&size=XL");

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Switch selected emphasized XL state",
      "switch-selected-emphasized-xl",
      { maxMismatchRatio: 0.16, maxDimensionDelta: 16, pixelThreshold: 64 },
    );
  });

  test("selected emphasized XL geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await switchFixtures(page, "?isSelected=true&isEmphasized=true&size=XL");

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      size: "XL",
      isSelected: true,
      isEmphasized: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      size: "XL",
      isSelected: true,
      isEmphasized: true,
    });
    await expect(fixtures.reactSwitch).toBeChecked();
    await expect(fixtures.solidSwitch).toBeChecked();

    const react = await switchGeometry(fixtures.reactRoot);
    const solid = await switchGeometry(fixtures.solidRoot);

    expect(solid.checked).toBe(react.checked);
    expect(solid.disabled).toBe(react.disabled);
    expect(solid.readOnly).toBe(react.readOnly);
    expect(solid.rootColor).toBe(react.rootColor);
    expect(solid.labelColor).toBe(react.labelColor);
    expect(solid.trackBackground).toBe(react.trackBackground);
    expect(solid.trackBorderColor).toBe(react.trackBorderColor);
    expect(solid.handleBackground).toBe(react.handleBackground);
    expect(solid.handleWillChange).toBe(react.handleWillChange);
    expect(solid.handleTransform).toBe(react.handleTransform);

    expectNear(solid.trackWidth, react.trackWidth, 0.75, "Switch track width");
    expectNear(solid.trackHeight, react.trackHeight, 0.75, "Switch track height");
    expectNear(solid.handleWidth, react.handleWidth, 0.75, "Switch handle width");
    expectNear(solid.handleHeight, react.handleHeight, 0.75, "Switch handle height");
    expectNear(solid.handleOffsetX, react.handleOffsetX, 0.75, "Switch handle offset");
    expectNear(solid.handleCenterDelta, react.handleCenterDelta, 0.75, "Switch handle centerline");
  });

  test("click toggles selected state on both stacks", async ({ page }) => {
    const fixtures = await switchFixtures(page);

    for (const item of [
      { panel: fixtures.reactPanel, label: fixtures.reactLabel, control: fixtures.reactSwitch },
      { panel: fixtures.solidPanel, label: fixtures.solidLabel, control: fixtures.solidSwitch },
    ]) {
      await expect(item.control).not.toBeChecked();
      await item.label.click();
      await expect(item.control).toBeChecked();
      await expect(item.panel.locator("[data-comparison-selected]").first()).toHaveAttribute(
        "data-comparison-selected",
        "true",
      );
    }
  });

  test("toggle preserves the transitioning thumb node on both stacks", async ({ page }) => {
    const fixtures = await switchFixtures(page);

    const reactBefore = await markSwitchMotionNodes(fixtures.reactRoot, "react");
    const solidBefore = await markSwitchMotionNodes(fixtures.solidRoot, "solid");

    expect(reactBefore.transitionDuration).not.toBe("0s");
    expect(solidBefore.transitionDuration).not.toBe("0s");

    await fixtures.reactLabel.click();
    await fixtures.solidLabel.click();

    await expect(fixtures.reactSwitch).toBeChecked();
    await expect(fixtures.solidSwitch).toBeChecked();

    const reactAfter = await switchMotionProbe(fixtures.reactRoot, "react");
    const solidAfter = await switchMotionProbe(fixtures.solidRoot, "solid");

    expect(reactAfter.sameTrackNode).toBe(true);
    expect(reactAfter.sameThumbNode).toBe(true);
    expect(reactAfter.transform).not.toBe(reactBefore.transform);

    expect(solidAfter.sameTrackNode).toBe(true);
    expect(solidAfter.sameThumbNode).toBe(true);
    expect(solidAfter.transform).not.toBe(solidBefore.transform);
  });

  test("side-panel selected, disabled, and readonly states drive actual DOM on both stacks", async ({
    page,
  }) => {
    const fixtures = await switchFixtures(page);

    await setSwitchControl(page, "isSelected", true);
    await expect.poll(() => controlProps(fixtures.reactRoot)).toMatchObject({ isSelected: true });
    await expect.poll(() => controlProps(fixtures.solidRoot)).toMatchObject({ isSelected: true });
    await expect(fixtures.reactSwitch).toBeChecked();
    await expect(fixtures.solidSwitch).toBeChecked();

    await setSwitchControl(page, "isDisabled", true);
    await expect.poll(() => controlProps(fixtures.reactRoot)).toMatchObject({ isDisabled: true });
    await expect.poll(() => controlProps(fixtures.solidRoot)).toMatchObject({ isDisabled: true });
    await expect(fixtures.reactSwitch).toBeDisabled();
    await expect(fixtures.solidSwitch).toBeDisabled();

    let react = await switchGeometry(fixtures.reactRoot);
    let solid = await switchGeometry(fixtures.solidRoot);
    expect(solid.checked).toBe(react.checked);
    expect(solid.disabled).toBe(react.disabled);

    await setSwitchControl(page, "isDisabled", false);
    await setSwitchControl(page, "isReadOnly", true);
    await setSwitchControl(page, "isSelected", false);
    await expect
      .poll(() => controlProps(fixtures.reactRoot))
      .toMatchObject({ isDisabled: false, isReadOnly: true, isSelected: false });
    await expect
      .poll(() => controlProps(fixtures.solidRoot))
      .toMatchObject({ isDisabled: false, isReadOnly: true, isSelected: false });
    await expect(fixtures.reactSwitch).not.toBeChecked();
    await expect(fixtures.solidSwitch).not.toBeChecked();

    react = await switchGeometry(fixtures.reactRoot);
    solid = await switchGeometry(fixtures.solidRoot);
    expect(solid.checked).toBe(react.checked);
    expect(solid.readOnly).toBe(react.readOnly);

    await fixtures.reactLabel.click();
    await fixtures.solidLabel.click();
    await expect(fixtures.reactSwitch).not.toBeChecked();
    await expect(fixtures.solidSwitch).not.toBeChecked();
    await expect(fixtures.reactPanel.locator("[data-comparison-selected]").first()).toHaveAttribute(
      "data-comparison-selected",
      "false",
    );
    await expect(fixtures.solidPanel.locator("[data-comparison-selected]").first()).toHaveAttribute(
      "data-comparison-selected",
      "false",
    );
  });
});
