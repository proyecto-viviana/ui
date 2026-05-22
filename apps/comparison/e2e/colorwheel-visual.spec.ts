import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function colorWheelFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/colorwheel/${query}`);
  await waitForComparisonRouteReady(page);
  await page.waitForLoadState("networkidle");

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="colorwheel"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="colorwheel"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean
  >;
}

async function colorWheelContract(root: Locator) {
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

    const input = element.querySelector<HTMLInputElement>('input[type="range"]');
    const thumb = input?.closest<HTMLElement>("div") ?? null;
    const wheel = thumb?.parentElement ?? null;
    const wheelRect = wheel?.getBoundingClientRect() ?? null;
    const wheelChildren = wheel == null ? [] : (Array.from(wheel.children) as HTMLElement[]);
    const track =
      wheelChildren.find((child) => {
        if (child === thumb) return false;
        const rect = child.getBoundingClientRect();
        const style = window.getComputedStyle(child);
        return (
          `${style.backgroundImage} ${style.background}`.includes("conic-gradient") ||
          (wheelRect != null &&
            Math.abs(rect.width - wheelRect.width) <= 1 &&
            Math.abs(rect.height - wheelRect.height) <= 1)
        );
      }) ?? null;
    const innerBorder =
      wheelChildren.find(
        (child) =>
          child !== thumb &&
          child !== track &&
          (child.getAttribute("aria-hidden") === "true" ||
            window.getComputedStyle(child).pointerEvents === "none"),
      ) ?? null;
    if (!wheel || !wheelRect || !track || !innerBorder || !input || !thumb) {
      return { missing: true };
    }

    const trackRect = track.getBoundingClientRect();
    const innerBorderRect = innerBorder.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const wheelStyle = window.getComputedStyle(wheel);
    const trackStyle = window.getComputedStyle(track);
    const innerBorderStyle = window.getComputedStyle(innerBorder);
    const inputStyle = window.getComputedStyle(input);
    const thumbStyle = window.getComputedStyle(thumb);

    return {
      missing: false,
      root: {
        slot: wheel.getAttribute("slot"),
        dataDisabled: wheel.getAttribute("data-disabled"),
        dataDragging: wheel.getAttribute("data-dragging"),
        position: wheelStyle.position,
        width: numberOrNull(wheelRect.width),
        height: numberOrNull(wheelRect.height),
      },
      track: {
        role: track.getAttribute("role"),
        dataDisabled: track.getAttribute("data-disabled"),
        dataDragging: track.getAttribute("data-dragging"),
        position: trackStyle.position,
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
        clipPath: trackStyle.clipPath,
        forcedColorAdjust: trackStyle.forcedColorAdjust,
      },
      innerBorder: {
        rect: relativeRect(innerBorderRect, wheelRect),
        ariaHidden: innerBorder.getAttribute("aria-hidden"),
        pointerEvents: innerBorderStyle.pointerEvents,
        borderRadius: innerBorderStyle.borderRadius,
        outlineStyle: innerBorderStyle.outlineStyle,
        outlineWidth: innerBorderStyle.outlineWidth,
        outlineOffset: innerBorderStyle.outlineOffset,
        outlineColor: innerBorderStyle.outlineColor,
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
        opacity: inputStyle.opacity,
        width: inputStyle.width,
        height: inputStyle.height,
        pointerEvents: inputStyle.pointerEvents,
      },
      thumb: {
        rect: relativeRect(thumbRect, wheelRect),
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
        dataHovered: thumb.getAttribute("data-hovered"),
      },
    };
  });
}

type ColorWheelContract = Awaited<ReturnType<typeof colorWheelContract>>;

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

function expectColorWheelContractToMatch(solid: ColorWheelContract, react: ColorWheelContract) {
  expect(solid.missing).toBe(false);
  expect(react.missing).toBe(false);
  if (solid.missing || react.missing) return;

  expect({ ...solid.root, width: null, height: null }).toEqual({
    ...react.root,
    width: null,
    height: null,
  });
  expectNear(solid.root.width, react.root.width, 1, "ColorWheel root width");
  expectNear(solid.root.height, react.root.height, 1, "ColorWheel root height");

  expect({ ...solid.track, width: null, height: null }).toEqual({
    ...react.track,
    width: null,
    height: null,
  });
  expectNear(solid.track.width, react.track.width, 1, "ColorWheel track width");
  expectNear(solid.track.height, react.track.height, 1, "ColorWheel track height");

  expectNear(
    solid.innerBorder.rect?.x ?? null,
    react.innerBorder.rect?.x ?? null,
    1,
    "ColorWheel inner border x",
  );
  expectNear(
    solid.innerBorder.rect?.y ?? null,
    react.innerBorder.rect?.y ?? null,
    1,
    "ColorWheel inner border y",
  );
  expectNear(
    solid.innerBorder.rect?.width ?? null,
    react.innerBorder.rect?.width ?? null,
    1,
    "ColorWheel inner border width",
  );
  expectNear(
    solid.innerBorder.rect?.height ?? null,
    react.innerBorder.rect?.height ?? null,
    1,
    "ColorWheel inner border height",
  );
  expect({ ...solid.innerBorder, rect: null }).toEqual({ ...react.innerBorder, rect: null });

  expectIdToMatchOrBeGenerated(solid.input.id, react.input.id, "ColorWheel input id");
  expectReferenceIdsToMatchOrBeGenerated(
    solid.input.ariaLabelledBy,
    react.input.ariaLabelledBy,
    "ColorWheel input aria-labelledby",
  );
  expectReferenceIdsToMatchOrBeGenerated(
    solid.input.ariaDescribedBy,
    react.input.ariaDescribedBy,
    "ColorWheel input aria-describedby",
  );
  expect({ ...solid.input, id: null, ariaLabelledBy: null, ariaDescribedBy: null }).toEqual({
    ...react.input,
    id: null,
    ariaLabelledBy: null,
    ariaDescribedBy: null,
  });

  expectNear(solid.thumb.rect?.x ?? null, react.thumb.rect?.x ?? null, 1, "ColorWheel thumb x");
  expectNear(solid.thumb.rect?.y ?? null, react.thumb.rect?.y ?? null, 1, "ColorWheel thumb y");
  expectNear(
    solid.thumb.rect?.width ?? null,
    react.thumb.rect?.width ?? null,
    1,
    "ColorWheel thumb width",
  );
  expectNear(
    solid.thumb.rect?.height ?? null,
    react.thumb.rect?.height ?? null,
    1,
    "ColorWheel thumb height",
  );
  expect({ ...solid.thumb, rect: null }).toEqual({ ...react.thumb, rect: null });
}

async function rangeValue(root: Locator) {
  return Number(await root.locator('input[type="range"]').first().inputValue());
}

async function colorWheelTrackBox(root: Locator) {
  return root.evaluate((element) => {
    const input = element.querySelector<HTMLInputElement>('input[type="range"]');
    const thumb = input?.closest<HTMLElement>("div") ?? null;
    const wheel = thumb?.parentElement ?? null;
    const track =
      (wheel == null ? [] : (Array.from(wheel.children) as HTMLElement[])).find((child) => {
        if (child === thumb) return false;
        const style = window.getComputedStyle(child);
        return `${style.backgroundImage} ${style.background}`.includes("conic-gradient");
      }) ?? null;
    const rect = track?.getBoundingClientRect();
    return rect == null
      ? null
      : {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
  });
}

async function dragColorWheelRing(page: Page, root: Locator) {
  const box = await colorWheelTrackBox(root);
  expect(box).not.toBeNull();
  if (box == null) return;

  await page.mouse.move(box.x + box.width * 0.5, box.y + 8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + 10);
  await page.mouse.up();
}

test.describe("comparison ColorWheel visual parity", () => {
  test("default state matches current React Spectrum", async ({ page }) => {
    const fixtures = await colorWheelFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(page, fixtures.reactRoot, fixtures.solidRoot, "ColorWheel default", {
      maxMismatchRatio: 0.08,
      maxDimensionDelta: 8,
      pixelThreshold: 64,
    });

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      ariaLabel: "Hue",
      valueSource: "defaultValue",
      value: "hsl(0, 100%, 50%)",
      defaultValue: "hsl(0, 100%, 50%)",
      size: "192",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      ariaLabel: "Hue",
      valueSource: "defaultValue",
      value: "hsl(0, 100%, 50%)",
      defaultValue: "hsl(0, 100%, 50%)",
      size: "192",
    });

    const react = await colorWheelContract(fixtures.reactRoot);
    const solid = await colorWheelContract(fixtures.solidRoot);
    expectColorWheelContractToMatch(solid, react);
    if (!react.missing) {
      expect(react.root.width).toBe(192);
      expect(react.root.height).toBe(192);
      expect(react.track.backgroundImage).toContain("conic-gradient");
      expect(react.track.clipPath).toContain("path(");
      expect(react.input.value).toBe("0");
    }
  });

  test("form, labeling, size, and disabled props match React Spectrum", async ({ page }) => {
    const fixtures = await colorWheelFixtures(
      page,
      "?ariaLabel=Hue%20wheel&ariaDescribedBy=color-wheel-help&ariaDetails=color-wheel-details&id=hue-wheel&slot=color&name=hueWheel&form=colorForm&size=224&isDisabled=true",
    );

    expectColorWheelContractToMatch(
      await colorWheelContract(fixtures.solidRoot),
      await colorWheelContract(fixtures.reactRoot),
    );
    await expect(fixtures.reactRoot.locator('input[type="range"]').first()).toBeDisabled();
    await expect(fixtures.solidRoot.locator('input[type="range"]').first()).toBeDisabled();
    const react = await colorWheelContract(fixtures.reactRoot);
    if (!react.missing) {
      expect(react.root.width).toBe(224);
      expect(react.root.height).toBe(224);
      expect(react.input.id).toBe("hue-wheel");
      expect(react.input.name).toBe("hueWheel");
      expect(react.input.form).toBe("colorForm");
      expect(react.input.ariaDescribedBy).toBe("color-wheel-help");
      expect(react.input.ariaDetails).toBe("color-wheel-details");
    }
  });

  test("keyboard and ring pointer changes update both stacks", async ({ page }) => {
    const fixtures = await colorWheelFixtures(
      page,
      "?valueSource=value&value=hsl(0,%20100%,%2050%)&name=hueWheel&form=colorForm",
    );

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
    await dragColorWheelRing(page, fixtures.reactRoot);
    await dragColorWheelRing(page, fixtures.solidRoot);

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
});
