import { expect, type Locator, type Page } from "@playwright/test";
import type { PanelFramework } from "./drivers/scenario";

export type FrameworkName = "React Spectrum stack" | "Solidaria stack";

/** Milliseconds to wait for fonts + two rAFs after islands mount. */
export const defaultPaintBudgetMs = 2_000;

export interface RouteReadyOptions {
  /**
   * Cap for `document.fonts.ready` + two `requestAnimationFrame`s.
   * `0` skips paint settle (native-validity probes do not need a compositor
   * frame). Default `defaultPaintBudgetMs`.
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
  if (await input.isChecked()) {
    return;
  }
  await page.locator("label").filter({ has: input }).click();
  await expect(input).toBeChecked();
}
