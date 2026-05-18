import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  expectScreenshotPair,
  pinComparisonTheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

const breadcrumbsDefaultPairDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.015,
  maxDimensionDelta: 0,
  pixelThreshold: 0,
};

function breadcrumbsQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function breadcrumbsFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/breadcrumbs/${breadcrumbsQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="breadcrumbs"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="breadcrumbs"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function openOverflowMenu(page: Page, panel: Locator) {
  const trigger = panel.getByRole("button", { name: "More items" });
  await trigger.click();
  await expect.poll(() => trigger.getAttribute("aria-controls")).toBeTruthy();
  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();

  const menu = page.locator(`[id="${menuId}"]`);
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("role", "menu");
  await expect(menu.getByRole("menuitem", { name: "Files" })).toBeVisible();
  await page.waitForTimeout(300);
  return menu;
}

function breadcrumbsContract(root: Locator) {
  return root
    .locator('[aria-label="Project location"]')
    .first()
    .evaluate((element) => {
      function round(value: number | undefined | null) {
        return value == null ? null : Number(value.toFixed(4));
      }

      function styleMap(node: Element | null, keys: readonly string[]) {
        if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) {
          return null;
        }

        const styles = window.getComputedStyle(node);
        return Object.fromEntries(keys.map((key) => [key, styles.getPropertyValue(key)]));
      }

      function rect(node: Element | null) {
        if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) {
          return null;
        }

        const box = node.getBoundingClientRect();
        return {
          width: round(box.width),
          height: round(box.height),
        };
      }

      const first = element.querySelector("a, [role='link']");
      const last = element.querySelector("li:last-child");

      return {
        ariaLabel: element.getAttribute("aria-label"),
        listItemCount: element.querySelectorAll("li").length,
        lastText: last?.textContent?.trim() ?? null,
        style: styleMap(element, [
          "display",
          "align-items",
          "gap",
          "margin-left",
          "padding-left",
          "font-family",
          "font-size",
          "line-height",
          "color",
        ]),
        rect: rect(element),
        first: {
          text: first?.textContent ?? null,
          style: styleMap(first, ["display", "height", "font-size", "line-height", "color"]),
          rect: rect(first),
        },
      };
    });
}

test.describe("comparison Breadcrumbs visual parity", () => {
  test("Breadcrumbs default path matches within the S2 structural threshold", async ({ page }) => {
    const { reactRoot, solidRoot } = await breadcrumbsFixtures(page);

    await expectScreenshotPair(
      page,
      reactRoot,
      solidRoot,
      "Breadcrumbs default path",
      breadcrumbsDefaultPairDiff,
    );
  });

  test("Breadcrumbs computed styles match React Spectrum across viewer axes", async ({ page }) => {
    for (const params of [{}, { size: "L" }, { isDisabled: true }]) {
      const { reactRoot, solidRoot } = await breadcrumbsFixtures(page, params);

      await expect(breadcrumbsContract(solidRoot)).resolves.toEqual(
        await breadcrumbsContract(reactRoot),
      );
    }
  });

  test("Breadcrumbs overflow menu exposes collapsed items", async ({ page }) => {
    const { reactPanel, solidPanel } = await breadcrumbsFixtures(page, { itemSet: "overflow" });

    await openOverflowMenu(page, reactPanel);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await openOverflowMenu(page, solidPanel);
  });
});
