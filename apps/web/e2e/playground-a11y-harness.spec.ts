/**
 * Playground a11y harness smoke tests
 *
 * Validates the reusable a11y harness works on 5 representative components:
 * - Tabs (ARIA ID linking)
 * - Menu (focus management + aria-controls)
 * - Dialog (focus trap + aria-labelledby)
 * - Toast (live region)
 * - ComboBox (aria-activedescendant + aria-controls)
 */

import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";
import {
  ensureSectionVisible,
  runA11yHarness,
  scanSectionAxe,
  checkSectionAriaIds,
} from "./helpers/a11y-harness";

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("show-all-sections")).toBeVisible();
}

test.describe("A11y harness smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.playground);
    await waitForPageReady(page);
  });

  test("Tabs section: axe scan + ARIA ID integrity", async ({ page }) => {
    const result = await runA11yHarness(page, "styled-tabs");

    expect(result.axe.violations).toHaveLength(0);
    expect(result.ariaIds.ok).toBe(true);
    expect(result.ariaIds.totalRefsChecked).toBeGreaterThan(0);
  });

  test("Menu section: axe scan + ARIA ID integrity", async ({ page }) => {
    const section = await ensureSectionVisible(page, "menu");

    // Open a menu to generate aria-controls
    const trigger = section.getByRole("button").first();
    if (await trigger.count()) {
      await trigger.click();
      // Give menu time to open
      await page.waitForTimeout(300);
    }

    const axe = await scanSectionAxe(page, section);
    const ariaIds = await checkSectionAriaIds(page, section);

    expect(axe.violations).toHaveLength(0);
    expect(ariaIds.ok).toBe(true);
  });

  test("Dialog section: axe scan + ARIA ID integrity", async ({ page }) => {
    const result = await runA11yHarness(page, "dialog");

    expect(result.axe.violations).toHaveLength(0);
    expect(result.ariaIds.ok).toBe(true);
  });

  test("Toast section: axe scan + ARIA ID integrity", async ({ page }) => {
    const result = await runA11yHarness(page, "toast");

    expect(result.axe.violations).toHaveLength(0);
    expect(result.ariaIds.ok).toBe(true);
  });

  test("ComboBox section: axe scan + ARIA ID integrity", async ({ page }) => {
    const section = await ensureSectionVisible(page, "styled-combobox");

    // Open combobox to generate aria-controls + aria-activedescendant
    const input = section.getByRole("combobox").first();
    if (await input.count()) {
      await input.click();
      await page.waitForTimeout(300);
    }

    const axe = await scanSectionAxe(page, section);
    const ariaIds = await checkSectionAriaIds(page, section);

    expect(axe.violations).toHaveLength(0);
    expect(ariaIds.ok).toBe(true);
  });
});
