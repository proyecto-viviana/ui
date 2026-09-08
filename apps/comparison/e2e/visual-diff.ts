import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Locator, type Page } from "@playwright/test";
import { layoutBox, scrollLocatorIntoView } from "./comparison-page";
import { comparisonThemeRequestEvent, type ComparisonThemeChoice } from "../src/data/theme";

/**
 * Cap for CDP `Page.captureScreenshot`. Painting machines finish in
 * milliseconds. Playwright's `locator.screenshot` waits for two
 * compositor-stable frames after scroll-into-view; WSL Chromium 151 never
 * issues those, so that path is not used. A stuck CDP call fails here
 * instead of taking the 180s D3 test timeout.
 */
export const screenshotTimeoutMs = 2_000;

const paintLatchEnv = "VIVIANA_COMPARISON_COMPOSITOR_PAINT";
const compositorPaintFailure =
  "Compositor never produced a screenshot (CDP Page.captureScreenshot timed out or returned a uniform fill). D3 does not skip; this is a pixel-gate failure, not a postcard.";
const comparisonRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
export const compositorPaintLatchPath = path.join(
  comparisonRoot,
  "test-results",
  ".compositor-paint-unavailable",
);

function paintUnavailable(): string | null {
  if (process.env[paintLatchEnv]) {
    return process.env[paintLatchEnv];
  }
  try {
    if (existsSync(compositorPaintLatchPath)) {
      return readFileSync(compositorPaintLatchPath, "utf8").trim() || compositorPaintFailure;
    }
  } catch {
    // worker can still fail-fast via env
  }
  return null;
}

function rememberPaintUnavailable(reason: string) {
  process.env[paintLatchEnv] = reason;
  try {
    mkdirSync(path.dirname(compositorPaintLatchPath), { recursive: true });
    writeFileSync(compositorPaintLatchPath, reason);
  } catch {
    // env latch still covers this worker
  }
}

/** Drop the cross-worker paint latch at the start of a Playwright run. */
export function clearCompositorPaintLatch() {
  delete process.env[paintLatchEnv];
  try {
    unlinkSync(compositorPaintLatchPath);
  } catch {
    // no latch from a previous run
  }
}

/** Fail closed immediately once this box has already proven it cannot paint. */
export function assertCompositorPaintAvailable() {
  const reason = paintUnavailable();
  if (reason) {
    throw new Error(reason);
  }
}

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

export async function requestComparisonTheme(page: Page, theme: ComparisonThemeChoice) {
  await page.evaluate(
    ({ eventName, nextTheme }) => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { theme: nextTheme },
        }),
      );
    },
    { eventName: comparisonThemeRequestEvent, nextTheme: theme },
  );
}

export async function clearPointer(page: Page) {
  await page.mouse.move(4, 4);
  await page.waitForTimeout(50);
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

async function assertPngPainted(page: Page, png: Buffer, label: string) {
  const stats = await page.evaluate(async (base64) => {
    const response = await fetch(`data:image/png;base64,${base64}`);
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Could not create canvas context to inspect screenshot pixels");
    }
    context.drawImage(bitmap, 0, 0);
    const data = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    const seen = new Set<string>();
    for (let i = 0; i < data.length; i += 4) {
      seen.add(`${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`);
      if (seen.size > 1) {
        break;
      }
    }
    return { width: bitmap.width, height: bitmap.height, uniqueColors: seen.size };
  }, png.toString("base64"));

  if (stats.width <= 0 || stats.height <= 0) {
    throw new Error(`${label}: screenshot is empty (${stats.width}x${stats.height})`);
  }
  if (stats.uniqueColors <= 1) {
    throw new Error(
      `${label}: screenshot is a uniform fill (${stats.uniqueColors} color); compositor did not paint the element`,
    );
  }
}

/**
 * Screenshot without Playwright's stable-frame wait. `locator.screenshot`
 * scrolls-into-view then waits for two compositor frames; that is the D3
 * 15s "element to be stable" deadlock. CDP `Page.captureScreenshot` reads
 * the backing store after a DOM scroll. A blank or timed-out capture fails
 * the pixel gate; it is never turned into a skip.
 */
export async function captureLocatorPng(
  target: Locator,
  options: { animations?: "disabled" | "allow" } = {},
): Promise<Buffer> {
  if (paintUnavailable()) {
    throw new Error(paintUnavailable()!);
  }

  await scrollLocatorIntoView(target);
  const box = await layoutBox(target);
  const page = target.page();
  const animations = options.animations ?? "disabled";

  if (animations === "disabled") {
    await page.evaluate(() => {
      if (document.querySelector("[data-comparison-screenshot-animations]")) {
        return;
      }
      const style = document.createElement("style");
      style.setAttribute("data-comparison-screenshot-animations", "disabled");
      style.textContent = `
        *, *::before, *::after {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          animation-play-state: paused !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.documentElement.append(style);
    });
  }

  const session = await page.context().newCDPSession(page);
  try {
    const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
    const clip = {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      scale: dpr,
    };
    const result = await withTimeout(
      session.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: true,
        clip,
      }),
      screenshotTimeoutMs,
      compositorPaintFailure,
    );
    const png = Buffer.from(result.data, "base64");
    try {
      await assertPngPainted(page, png, "D3 pixel capture");
    } catch (error) {
      rememberPaintUnavailable(compositorPaintFailure);
      throw error;
    }
    return png;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Compositor never produced") || message.includes("uniform fill")) {
      rememberPaintUnavailable(compositorPaintFailure);
    }
    throw error;
  } finally {
    await withTimeout(session.detach(), 250, "CDP session detach timed out").catch(() => {});
  }
}

export async function normalizedElementScreenshot(target: Locator) {
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

    return await captureLocatorPng(target);
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
  return captureLocatorPng(target);
}

export type ClonedScreenshotOptions = {
  /** CSS px kept around the element so outline rings and shadows are certified. */
  padding?: number;
};

/**
 * Pixel-evidence capture for the pair drivers: screenshots an inert clone of
 * the target inside a top-layer frame pinned at an integer viewport position
 * over a uniform backdrop.
 *
 * Why a clone instead of repositioning the element itself
 * (`normalizedElementScreenshot`): the frameworks own the live element, so
 * re-pinned interaction attributes (data-hovered, data-pressed) can be
 * cleared by a re-render racing the capture — moving the element out from
 * under a held pointer fires real pointer events. The clone sits outside both
 * frameworks' ownership, so the driven state is frozen for as long as the
 * shot takes, and the live element never moves. The clone is shown from a
 * `document.body` popover frame (not a sibling of the overlay) so a lower
 * ComboBox portal cannot contain or clip the probe. Theme tokens still
 * resolve from `:root`; inherited `color` / `color-scheme` are copied onto
 * the frame.
 *
 * Why the frame is a `popover="manual"` element shown into the top layer:
 * no z-index inside the page can guarantee the probe paints on top. The
 * canvas ancestor `.comparison-reference-frame { isolation: isolate }` traps
 * any descendant z-index inside a stacking context that itself sits at
 * z-auto, so the sticky `.s2-topbar { z-index: 50 }` painted straight over an
 * earlier fixed-backdrop probe; the dialog's container-type wrapper likewise
 * re-anchored it. The top layer escapes both hazards by spec: it paints
 * above every z-index and positions against the viewport regardless of
 * ancestor containment or transforms. `popover="manual"` (rather than
 * `showModal()`) moves no focus, makes nothing inert, and ignores Escape and
 * light dismiss, so the driven gesture state on the live element survives.
 * The frame normalizes the UA popover styles (margin/border/padding/
 * overflow/background) and copies the original's computed `color` /
 * `color-scheme` onto the frame so UA `CanvasText` does not replace ink.
 *
 * The frame doubles as the backdrop, padded so outline rings and drop
 * shadows stay in the certified area (a screenshot of the element itself
 * would clip them at the border box). It is painted with the body background
 * — deliberately NOT the panel frame background, which is panel-specific —
 * so both panels composite over the same neutral color. Screenshotting the
 * frame element sidesteps page-coordinate clip math
 * (`page.screenshot({ clip })` is document-relative while the frame is
 * viewport-fixed on a scrolled page).
 *
 * Blind spots, by design: styles keyed on real :hover/:focus-visible
 * pseudo-classes (rather than data attributes) don't apply to the clone —
 * equally for both panels, and the D1 computed-style driver covers those.
 * Scroll positions, input values, and canvas contents are not cloned.
 */
export async function clonedElementScreenshot(
  target: Locator,
  options: ClonedScreenshotOptions = {},
): Promise<Buffer> {
  const padding = options.padding ?? 32;

  await target.evaluate((element, pad) => {
    const original = element as HTMLElement;
    const rect = original.getBoundingClientRect();

    let backdropColor = "rgb(255, 255, 255)";
    for (const surface of [document.body, document.documentElement]) {
      const color = getComputedStyle(surface).backgroundColor;
      if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") {
        backdropColor = color;
        break;
      }
    }

    const frame = document.createElement("div");
    frame.setAttribute("data-comparison-pixel-frame", "true");
    frame.setAttribute("popover", "manual");
    frame.style.position = "fixed";
    frame.style.insetBlockStart = "0px";
    frame.style.insetInlineStart = "0px";
    frame.style.insetBlockEnd = "auto";
    frame.style.insetInlineEnd = "auto";
    frame.style.width = `${Math.ceil(rect.width) + pad * 2}px`;
    frame.style.height = `${Math.ceil(rect.height) + pad * 2}px`;
    frame.style.margin = "0";
    frame.style.border = "0";
    frame.style.padding = "0";
    frame.style.overflow = "visible";
    frame.style.background = backdropColor;

    const clone = original.cloneNode(true) as HTMLElement;
    clone.setAttribute("data-comparison-pixel-clone", "true");
    clone.removeAttribute("id");
    for (const descendant of Array.from(clone.querySelectorAll("[id]"))) {
      descendant.removeAttribute("id");
    }
    clone.style.position = "absolute";
    clone.style.insetBlockStart = `${pad}px`;
    clone.style.insetInlineStart = `${pad}px`;
    clone.style.margin = "0";
    // Pin the in-flow size so out-of-flow positioning cannot shrink-to-fit
    // and rewrap the content (e.g. the dialog surface keeps its modal-given
    // width).
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.boxSizing = "border-box";

    frame.appendChild(clone);
    // Pin inherited ink/scheme onto the frame: it mounts on `document.body`
    // (not as a sibling of the overlay) so ComboBox's lower overlay
    // (`isolation: isolate` + listbox `overflow`) cannot contain or clip
    // the top-layer probe. Theme tokens still resolve from `:root`.
    frame.style.color = getComputedStyle(original).color;
    frame.style.colorScheme = getComputedStyle(original).colorScheme;
    document.body.appendChild(frame);
    frame.showPopover();
  }, padding);

  // From here on, only the (unique) frame is resolved: the clone duplicates
  // the target's classes and ARIA identity, so re-resolving the target
  // locator while the clone exists is a strict-mode violation.
  const frame = target.page().locator("[data-comparison-pixel-frame]");
  try {
    return await captureLocatorPng(frame);
  } finally {
    await target.page().evaluate(() => {
      for (const node of Array.from(document.querySelectorAll("[data-comparison-pixel-frame]"))) {
        node.remove();
      }
    });
  }
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

async function preparedClonedElementScreenshot(
  page: Page,
  target: Locator,
  prepare: () => Promise<void>,
) {
  await page.mouse.move(4, 4);
  try {
    await prepare();
    return await clonedElementScreenshot(target);
  } finally {
    await page.mouse.up();
    await page.mouse.move(4, 4);
  }
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

export async function expectExactPreparedClonedScreenshotPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
): Promise<ScreenshotPairResult> {
  const pair = {
    reactPng: await preparedClonedElementScreenshot(page, reactTarget, prepareReact),
    solidPng: await preparedClonedElementScreenshot(page, solidTarget, prepareSolid),
  };
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
  const reactPng = await captureLocatorPng(reactElement);
  const solidPng = await captureLocatorPng(solidElement);

  return diffScreenshots(page, reactPng, solidPng, pixelThreshold);
}
