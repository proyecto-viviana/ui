import { expect, type Locator, type Page } from "@playwright/test";
import type { PanelFramework } from "./drivers/scenario";

export type FrameworkName = "React Spectrum stack" | "Solidaria stack";

/** Milliseconds to wait for fonts + two rAFs after islands mount. */
export const defaultPaintBudgetMs = 2_000;

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RouteReadyOptions {
  /**
   * Cap for `document.fonts.ready` + two `requestAnimationFrame`s.
   * `0` skips paint settle (JSON oracles and D3 CDP captures do not need a
   * compositor frame). Default `defaultPaintBudgetMs`.
   */
  paintBudgetMs?: number;
}

export async function waitForComparisonRouteReady(
  page: Page,
  frameworks: readonly PanelFramework[] = ["react", "solid"],
  options?: RouteReadyOptions,
) {
  await expect(page.locator("astro-island")).toHaveCount(0);

  const section = page.locator("#example").filter({
    has: page.locator("h2", { hasText: "Example" }),
  });
  await expect(section).toHaveCount(1);
  if (frameworks.includes("react")) {
    await expect(
      section.locator('.s2-framework-panel[data-framework="react"] .comparison-reference-canvas'),
    ).toBeVisible();
  }
  if (frameworks.includes("solid")) {
    await expect(
      section.locator('.s2-framework-panel[data-framework="solid"] .comparison-reference-canvas'),
    ).toBeVisible();
  }
  await expect(
    page.locator('.js-component-example-section-mount[data-islands-mounted="true"]'),
  ).toHaveCount(1);
  await expect(
    page.locator('.js-component-example-section-mount[data-controls-mounted="true"]'),
  ).toHaveCount(1);

  await waitForPaintSettle(page, options?.paintBudgetMs ?? defaultPaintBudgetMs);
}

/**
 * Race `document.fonts.ready` + two rAFs against a budget. WSL Chromium 151
 * (Playwright 1.62 / SwiftShader) can fail to issue a compositor frame, so
 * those promises never resolve. CI still waits for paint when frames fire;
 * a stuck compositor does not take the test timeout. `0` skips settle.
 */
export async function waitForPaintSettle(page: Page, paintBudgetMs = defaultPaintBudgetMs) {
  if (paintBudgetMs <= 0) {
    return;
  }

  await page.evaluate(async (budgetMs) => {
    await Promise.race([
      (async () => {
        if ("fonts" in document) {
          await document.fonts.ready;
        }
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
      })(),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, budgetMs);
      }),
    ]);
  }, paintBudgetMs);
}

/**
 * Playwright's `scrollIntoViewIfNeeded` waits for two compositor-stable frames.
 * WSL Chromium 151 never issues those frames through SwiftShader, so the
 * action deadlocks. DOM `scrollIntoView` does not need a frame.
 */
export async function scrollLocatorIntoView(target: Locator) {
  await target.evaluate((element) => {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

/**
 * Layout box via `getBoundingClientRect`. Playwright's `locator.boundingBox()`
 * waits for two compositor-stable frames and deadlocks on this WSL Chromium.
 */
export async function layoutBox(target: Locator): Promise<LayoutBox> {
  const box = await target.evaluate((element) => {
    const rect = (element as HTMLElement).getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  if (box.width <= 0 || box.height <= 0) {
    throw new Error("Locator has an empty layout box");
  }
  return box;
}

export async function layoutBoxCenter(target: Locator): Promise<{ x: number; y: number }> {
  const box = await layoutBox(target);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Hover without Playwright actionability. `locator.hover()` waits for the
 * element to be stable; mouse-move at the layout center does not. WSL
 * Chromium 151 also fails compositor hit-testing, so CDP mouse-move never
 * delivers `pointerenter`. Dispatching on the element sets RAC/solidaria
 * `data-hovered` the same way D14 clicks without a frame.
 */
export async function hoverLocator(target: Locator) {
  await scrollLocatorIntoView(target);
  const { x, y } = await layoutBoxCenter(target);
  await target.page().mouse.move(x, y);
  await target.evaluate(
    (element, point) => {
      const el = element as HTMLElement;
      const pointerInit: PointerEventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        clientX: point.x,
        clientY: point.y,
      };
      el.dispatchEvent(new PointerEvent("pointerover", pointerInit));
      el.dispatchEvent(new PointerEvent("pointerenter", pointerInit));
      el.dispatchEvent(
        new MouseEvent("mouseover", {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
        }),
      );
      el.dispatchEvent(
        new MouseEvent("mouseenter", {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
        }),
      );
    },
    { x, y },
  );
}

/**
 * Pressed state without compositor hit-testing. `page.mouse.down()` still
 * runs for painting machines; the element `pointerdown` is what sets
 * `data-pressed` when hit-testing never fires.
 */
export async function pressLocator(target: Locator) {
  await hoverLocator(target);
  const { x, y } = await layoutBoxCenter(target);
  await target.page().mouse.down();
  await target.evaluate(
    (element, point) => {
      const el = element as HTMLElement;
      el.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          buttons: 1,
          button: 0,
          clientX: point.x,
          clientY: point.y,
        }),
      );
    },
    { x, y },
  );
}

/**
 * Touch tap without Playwright's `touchscreen.tap` stability wait.
 * Element pointer events with `pointerType: "touch"` — CDP `Input.dispatchTouchEvent`
 * closed the page on this box and took the preview down with it.
 */
export async function tapLocator(target: Locator) {
  await scrollLocatorIntoView(target);
  const { x, y } = await layoutBoxCenter(target);
  await target.evaluate(
    (element, point) => {
      const el = element as HTMLElement;
      const pointerInit: PointerEventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: "touch",
        isPrimary: true,
        clientX: point.x,
        clientY: point.y,
      };
      el.dispatchEvent(new PointerEvent("pointerdown", { ...pointerInit, buttons: 1, button: 0 }));
      el.dispatchEvent(new PointerEvent("pointerup", pointerInit));
      el.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          clientX: point.x,
          clientY: point.y,
        }),
      );
    },
    { x, y },
  );
}

/**
 * Dismiss a portaled overlay without Playwright actionability.
 * Bare `keyboard.press("Escape")` is a no-op when focus is on an
 * aria-hidden trigger behind the modal (clickLocator focused it).
 */
export async function dismissOverlay(overlay: Locator) {
  if ((await overlay.count()) === 0) {
    return;
  }
  await focusLocator(overlay.first());
  await overlay.page().keyboard.press("Escape");
}

/**
 * Activate without waiting for compositor-stable frames.
 * Playwright's `locator.click()` deadlocks on this box. Native
 * `HTMLElement.click()` is enough for form controls; RAC `usePress`
 * listens to pointerdown/up, so overlay triggers also need those.
 */
export async function clickLocator(target: Locator) {
  await scrollLocatorIntoView(target);
  const { x, y } = await layoutBoxCenter(target);
  await target.evaluate(
    (element, point) => {
      const el = element as HTMLElement;
      const pointerInit: PointerEventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        clientX: point.x,
        clientY: point.y,
      };
      el.dispatchEvent(new PointerEvent("pointerdown", { ...pointerInit, buttons: 1, button: 0 }));
      el.focus();
      el.dispatchEvent(new PointerEvent("pointerup", pointerInit));
      el.click();
    },
    { x, y },
  );
}

/**
 * Programmatic focus without Playwright's stable-frame wait.
 * `locator.focus()` is the same DOM `focus()` plus actionability.
 * RAC `pointermove` (including `clearPointer`'s mouse-move) sets pointer
 * modality and suppresses `data-focus-visible`; a Tab keydown restores
 * keyboard modality so the focus-visible walk still matches CI.
 */
export async function focusLocator(target: Locator) {
  await scrollLocatorIntoView(target);
  await target.page().evaluate(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }),
    );
  });
  await target.evaluate((element) => (element as HTMLElement).focus());
}

export async function styledSection(page: Page) {
  const section = page.locator("#example").filter({
    has: page.locator("h2", { hasText: "Example" }),
  });
  await expect(section).toHaveCount(1);
  await scrollLocatorIntoView(section);
  return section;
}

export async function frameworkPanel(section: Locator, framework: FrameworkName) {
  const card = section.locator(
    framework === "React Spectrum stack"
      ? '.s2-framework-panel[data-framework="react"]'
      : '.s2-framework-panel[data-framework="solid"]',
  );
  await expect(card).toHaveCount(1);
  return card;
}

export async function frameworkCanvas(section: Locator, framework: FrameworkName) {
  const card = await frameworkPanel(section, framework);
  const canvas = card.locator(".comparison-reference-canvas");
  await expect(canvas).toBeVisible();
  return canvas;
}

/**
 * Checks a radio/checkbox in the prop-control panel. The S2 controls wrap a
 * visually hidden input in a pressable label (upstream RAC structure), so
 * `input.check()` fails Playwright's hit-target check; click the label like a
 * user instead, then assert the input state.
 */
export async function checkControl(page: Page, name: string, value?: string) {
  const input = page.locator(
    value === undefined ? `input[name="${name}"]` : `input[name="${name}"][value="${value}"]`,
  );
  if (await input.evaluate((element) => (element as HTMLInputElement).checked)) {
    return;
  }
  await clickLocator(page.locator("label").filter({ has: input }));
  await expect
    .poll(async () => input.evaluate((element) => (element as HTMLInputElement).checked))
    .toBe(true);
}
