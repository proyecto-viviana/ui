import { expect, type Locator, type Page } from "@playwright/test";
import type { PanelFramework } from "./drivers/scenario";

export type FrameworkName = "React Spectrum stack" | "Solidaria stack";

export async function waitForComparisonRouteReady(
  page: Page,
  frameworks: readonly PanelFramework[] = ["react", "solid"],
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

  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
}

export async function styledSection(page: Page) {
  const section = page.locator("#example").filter({
    has: page.locator("h2", { hasText: "Example" }),
  });
  await expect(section).toHaveCount(1);
  await section.scrollIntoViewIfNeeded();
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
