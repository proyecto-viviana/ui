import { expect, type Locator, type Page } from "@playwright/test";

export type ComparisonColorScheme = "light" | "dark";

export type ScreenshotDiffResult = {
  reactWidth: number;
  reactHeight: number;
  solidWidth: number;
  solidHeight: number;
  comparedWidth: number;
  comparedHeight: number;
  widthDelta: number;
  heightDelta: number;
  mismatchedPixels: number;
  totalPixels: number;
  mismatchRatio: number;
  mismatchBounds: { left: number; top: number; right: number; bottom: number } | null;
  maxChannelDelta: number;
  pixelThreshold: number;
};

export type ScreenshotDiffThreshold = {
  maxMismatchRatio: number;
  maxDimensionDelta: number;
  pixelThreshold?: number;
};

export type ScreenshotPairCapture = {
  reactPng: Buffer;
  solidPng: Buffer;
};

export type ScreenshotPairResult = ScreenshotPairCapture & {
  diff: ScreenshotDiffResult;
};

export const exactPairDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 0,
};

export const currentButtonPairDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.001,
  maxDimensionDelta: 4,
  pixelThreshold: 64,
};

export async function pinComparisonTheme(page: Page, colorScheme: ComparisonColorScheme) {
  await page.addInitScript((theme) => {
    window.localStorage.setItem("solid-spectrum-theme", theme);
  }, colorScheme);
}

export async function clearPointer(page: Page) {
  await page.mouse.move(4, 4);
  await page.waitForTimeout(50);
}

async function waitForScreenshotFrame(target: Locator) {
  await target.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
}

export async function normalizedElementScreenshot(target: Locator) {
  await waitForScreenshotFrame(target);

  const previousState = await target.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    const state = {
      className: htmlElement.getAttribute("class"),
      style: htmlElement.getAttribute("style"),
      dataAttrs: Array.from(htmlElement.attributes)
        .filter((attribute) => attribute.name.startsWith("data-"))
        .map((attribute) => [attribute.name, attribute.value] as const),
    };

    htmlElement.style.position = "fixed";
    htmlElement.style.insetBlockStart = "64px";
    htmlElement.style.insetInlineStart = "64px";
    htmlElement.style.margin = "0";
    htmlElement.style.zIndex = "2147483647";

    return state;
  });

  try {
    await waitForScreenshotFrame(target);
    await target.evaluate((element, state) => {
      const htmlElement = element as HTMLElement;

      if (state.className === null) {
        htmlElement.removeAttribute("class");
      } else {
        htmlElement.setAttribute("class", state.className);
      }

      for (const [name, value] of state.dataAttrs) {
        htmlElement.setAttribute(name, value);
      }

      if (state.style === null) {
        htmlElement.removeAttribute("style");
      } else {
        htmlElement.setAttribute("style", state.style);
      }

      htmlElement.style.position = "fixed";
      htmlElement.style.insetBlockStart = "64px";
      htmlElement.style.insetInlineStart = "64px";
      htmlElement.style.margin = "0";
      htmlElement.style.zIndex = "2147483647";

      const freezeStyle = document.createElement("style");
      freezeStyle.setAttribute("data-comparison-screenshot-freeze", "progress-circle");
      freezeStyle.textContent = `
        [role="progressbar"] circle[stroke-dasharray] {
          animation: none !important;
          stroke-dashoffset: 0 !important;
          transform: none !important;
          transform-origin: center !important;
          transition: none !important;
        }
      `;
      htmlElement.append(freezeStyle);
    }, previousState);

    await waitForScreenshotFrame(target);
    return await target.screenshot({ animations: "disabled" });
  } finally {
    await target.evaluate((element, state) => {
      const htmlElement = element as HTMLElement;

      for (const freezeStyle of Array.from(
        htmlElement.querySelectorAll('style[data-comparison-screenshot-freeze="progress-circle"]'),
      )) {
        freezeStyle.remove();
      }

      if (state.className === null) {
        htmlElement.removeAttribute("class");
      } else {
        htmlElement.setAttribute("class", state.className);
      }

      for (const attribute of Array.from(htmlElement.attributes)) {
        if (attribute.name.startsWith("data-")) {
          htmlElement.removeAttribute(attribute.name);
        }
      }

      for (const [name, value] of state.dataAttrs) {
        htmlElement.setAttribute(name, value);
      }

      if (state.style === null) {
        htmlElement.removeAttribute("style");
        return;
      }

      htmlElement.setAttribute("style", state.style);
    }, previousState);
  }
}

async function inPlaceElementScreenshot(target: Locator) {
  await waitForScreenshotFrame(target);
  return target.screenshot({ animations: "disabled" });
}

async function withFixedScreenshotTarget<T>(target: Locator, action: () => Promise<T>) {
  const previousStyle = await target.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    const style = htmlElement.getAttribute("style");

    htmlElement.style.position = "fixed";
    htmlElement.style.insetBlockStart = "64px";
    htmlElement.style.insetInlineStart = "64px";
    htmlElement.style.margin = "0";
    htmlElement.style.zIndex = "2147483647";

    return style;
  });

  try {
    await waitForScreenshotFrame(target);
    return await action();
  } finally {
    await target.evaluate((element, style) => {
      const htmlElement = element as HTMLElement;
      if (style === null) {
        htmlElement.removeAttribute("style");
      } else {
        htmlElement.setAttribute("style", style);
      }
    }, previousStyle);
  }
}

export async function captureScreenshotPair(
  reactTarget: Locator,
  solidTarget: Locator,
): Promise<ScreenshotPairCapture> {
  return {
    reactPng: await normalizedElementScreenshot(reactTarget),
    solidPng: await normalizedElementScreenshot(solidTarget),
  };
}

export async function expectExactScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
): Promise<ScreenshotPairResult> {
  const pair = await captureScreenshotPair(reactTarget, solidTarget);
  const diff = await compareScreenshots(page, pair.reactPng, pair.solidPng, label, exactPairDiff);

  return { ...pair, diff };
}

export async function capturePreparedScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
): Promise<ScreenshotPairCapture> {
  await clearPointer(page);
  await prepareReact();
  await page.waitForTimeout(220);
  const reactPng = await normalizedElementScreenshot(reactTarget);

  await page.mouse.up();
  await clearPointer(page);
  await prepareSolid();
  await page.waitForTimeout(220);
  const solidPng = await normalizedElementScreenshot(solidTarget);

  await page.mouse.up();
  return { reactPng, solidPng };
}

export async function capturePreparedFixedScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
): Promise<ScreenshotPairCapture> {
  await clearPointer(page);
  const reactPng = await withFixedScreenshotTarget(reactTarget, async () => {
    await prepareReact();
    await page.waitForTimeout(220);
    return inPlaceElementScreenshot(reactTarget);
  });

  await page.mouse.up();
  await clearPointer(page);
  const solidPng = await withFixedScreenshotTarget(solidTarget, async () => {
    await prepareSolid();
    await page.waitForTimeout(220);
    return inPlaceElementScreenshot(solidTarget);
  });

  await page.mouse.up();
  return { reactPng, solidPng };
}

export async function capturePreparedInPlaceScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
): Promise<ScreenshotPairCapture> {
  await clearPointer(page);
  await prepareReact();
  await page.waitForTimeout(220);
  const reactPng = await inPlaceElementScreenshot(reactTarget);

  await page.mouse.up();
  await clearPointer(page);
  await prepareSolid();
  await page.waitForTimeout(220);
  const solidPng = await inPlaceElementScreenshot(solidTarget);

  await page.mouse.up();
  return { reactPng, solidPng };
}

export async function expectExactPreparedScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
): Promise<ScreenshotPairResult> {
  const pair = await capturePreparedScreenshotPair(
    page,
    reactTarget,
    solidTarget,
    prepareReact,
    prepareSolid,
  );
  const diff = await compareScreenshots(page, pair.reactPng, pair.solidPng, label, exactPairDiff);

  return { ...pair, diff };
}

export async function expectExactPreparedFixedScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
): Promise<ScreenshotPairResult> {
  const pair = await capturePreparedFixedScreenshotPair(
    page,
    reactTarget,
    solidTarget,
    prepareReact,
    prepareSolid,
  );
  const diff = await compareScreenshots(page, pair.reactPng, pair.solidPng, label, exactPairDiff);

  return { ...pair, diff };
}

export async function expectExactPreparedInPlaceScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
): Promise<ScreenshotPairResult> {
  const pair = await capturePreparedInPlaceScreenshotPair(
    page,
    reactTarget,
    solidTarget,
    prepareReact,
    prepareSolid,
  );
  const diff = await compareScreenshots(page, pair.reactPng, pair.solidPng, label, exactPairDiff);

  return { ...pair, diff };
}

export async function expectScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  threshold: ScreenshotDiffThreshold = exactPairDiff,
): Promise<ScreenshotPairResult> {
  const pair = await captureScreenshotPair(reactTarget, solidTarget);
  const diff = await compareScreenshots(page, pair.reactPng, pair.solidPng, label, threshold);

  return { ...pair, diff };
}

export async function expectPreparedScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
  threshold: ScreenshotDiffThreshold = exactPairDiff,
): Promise<ScreenshotPairResult> {
  const pair = await capturePreparedScreenshotPair(
    page,
    reactTarget,
    solidTarget,
    prepareReact,
    prepareSolid,
  );
  const diff = await compareScreenshots(page, pair.reactPng, pair.solidPng, label, threshold);

  return { ...pair, diff };
}

export async function diffScreenshots(
  page: Page,
  reactPng: Buffer,
  solidPng: Buffer,
  pixelThreshold: number = 0,
): Promise<ScreenshotDiffResult> {
  return page.evaluate(
    async ({ reactBase64, solidBase64, pixelThreshold }) => {
      async function loadImage(base64: string) {
        const response = await fetch(`data:image/png;base64,${base64}`);
        return createImageBitmap(await response.blob());
      }

      const [reactImage, solidImage] = await Promise.all([
        loadImage(reactBase64),
        loadImage(solidBase64),
      ]);

      const comparedWidth = Math.min(reactImage.width, solidImage.width);
      const comparedHeight = Math.min(reactImage.height, solidImage.height);
      const canvas = document.createElement("canvas");
      canvas.width = comparedWidth * 2;
      canvas.height = comparedHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("Could not create canvas context for screenshot comparison");
      }

      context.drawImage(reactImage, 0, 0, comparedWidth, comparedHeight);
      context.drawImage(solidImage, comparedWidth, 0, comparedWidth, comparedHeight);

      const reactPixels = context.getImageData(0, 0, comparedWidth, comparedHeight).data;
      const solidPixels = context.getImageData(
        comparedWidth,
        0,
        comparedWidth,
        comparedHeight,
      ).data;
      let mismatchedPixels = 0;
      let mismatchLeft = Number.POSITIVE_INFINITY;
      let mismatchTop = Number.POSITIVE_INFINITY;
      let mismatchRight = Number.NEGATIVE_INFINITY;
      let mismatchBottom = Number.NEGATIVE_INFINITY;
      let maxChannelDelta = 0;

      for (let i = 0; i < reactPixels.length; i += 4) {
        const r = Math.abs(reactPixels[i] - solidPixels[i]);
        const g = Math.abs(reactPixels[i + 1] - solidPixels[i + 1]);
        const b = Math.abs(reactPixels[i + 2] - solidPixels[i + 2]);
        const a = Math.abs(reactPixels[i + 3] - solidPixels[i + 3]);
        const delta = Math.max(r, g, b, a);
        maxChannelDelta = Math.max(maxChannelDelta, delta);

        if (delta > pixelThreshold) {
          const pixelIndex = i / 4;
          const x = pixelIndex % comparedWidth;
          const y = Math.floor(pixelIndex / comparedWidth);

          mismatchedPixels += 1;
          mismatchLeft = Math.min(mismatchLeft, x);
          mismatchTop = Math.min(mismatchTop, y);
          mismatchRight = Math.max(mismatchRight, x);
          mismatchBottom = Math.max(mismatchBottom, y);
        }
      }

      const totalPixels = comparedWidth * comparedHeight;
      const mismatchBounds =
        mismatchedPixels === 0
          ? null
          : {
              left: mismatchLeft,
              top: mismatchTop,
              right: mismatchRight,
              bottom: mismatchBottom,
            };

      return {
        reactWidth: reactImage.width,
        reactHeight: reactImage.height,
        solidWidth: solidImage.width,
        solidHeight: solidImage.height,
        comparedWidth,
        comparedHeight,
        widthDelta: Math.abs(reactImage.width - solidImage.width),
        heightDelta: Math.abs(reactImage.height - solidImage.height),
        mismatchedPixels,
        totalPixels,
        mismatchRatio: totalPixels === 0 ? 1 : mismatchedPixels / totalPixels,
        mismatchBounds,
        maxChannelDelta,
        pixelThreshold,
      };
    },
    {
      reactBase64: reactPng.toString("base64"),
      solidBase64: solidPng.toString("base64"),
      pixelThreshold,
    },
  );
}

export async function compareScreenshots(
  page: Page,
  reactPng: Buffer,
  solidPng: Buffer,
  label: string,
  threshold: ScreenshotDiffThreshold,
) {
  const result = await diffScreenshots(page, reactPng, solidPng, threshold.pixelThreshold);

  expect(result.widthDelta, `${label} width delta`).toBeLessThanOrEqual(
    threshold.maxDimensionDelta,
  );
  expect(result.heightDelta, `${label} height delta`).toBeLessThanOrEqual(
    threshold.maxDimensionDelta,
  );
  expect(
    result.mismatchRatio,
    `${label} screenshot mismatch ratio ${result.mismatchRatio} exceeded ${threshold.maxMismatchRatio} (${result.mismatchedPixels}/${result.totalPixels} pixels, bounds ${JSON.stringify(result.mismatchBounds)})`,
  ).toBeLessThanOrEqual(threshold.maxMismatchRatio);

  return result;
}

export async function compareLocatorScreenshots(
  page: Page,
  reactElement: Locator,
  solidElement: Locator,
  label: string,
  threshold: ScreenshotDiffThreshold,
) {
  const result = await diffLocatorScreenshots(
    page,
    reactElement,
    solidElement,
    threshold.pixelThreshold,
  );

  expect(result.widthDelta, `${label} width delta`).toBeLessThanOrEqual(
    threshold.maxDimensionDelta,
  );
  expect(result.heightDelta, `${label} height delta`).toBeLessThanOrEqual(
    threshold.maxDimensionDelta,
  );
  expect(
    result.mismatchRatio,
    `${label} screenshot mismatch ratio ${result.mismatchRatio} exceeded ${threshold.maxMismatchRatio}`,
  ).toBeLessThanOrEqual(threshold.maxMismatchRatio);

  return result;
}

export async function diffLocatorScreenshots(
  page: Page,
  reactElement: Locator,
  solidElement: Locator,
  pixelThreshold: number = 0,
) {
  const reactPng = await reactElement.screenshot({ animations: "disabled" });
  const solidPng = await solidElement.screenshot({ animations: "disabled" });

  return diffScreenshots(page, reactPng, solidPng, pixelThreshold);
}
