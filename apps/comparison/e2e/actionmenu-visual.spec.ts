import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectExactScreenshotPair, pinComparisonTheme } from "./visual-diff";

function actionMenuQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function actionMenuFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/actionmenu/${actionMenuQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactTrigger = reactPanel.getByRole("button", { name: "More actions" });
  const solidTrigger = solidPanel.getByRole("button", { name: "More actions" });

  await expect(reactTrigger).toBeVisible();
  await expect(solidTrigger).toBeVisible();

  return { reactTrigger, solidTrigger };
}

async function actionMenuTriggerContract(trigger: Locator) {
  return trigger.evaluate((element) => {
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

    const icon = element.querySelector("svg");

    return {
      tag: element.tagName,
      ariaExpanded: element.getAttribute("aria-expanded"),
      disabled: element.hasAttribute("disabled"),
      style: styleMap(element, [
        "display",
        "align-items",
        "justify-content",
        "box-sizing",
        "width",
        "height",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "border-radius",
        "border-style",
        "background-color",
        "color",
        "font-family",
        "font-size",
        "line-height",
        "outline-color",
        "outline-style",
        "outline-width",
      ]),
      rect: rect(element),
      icon: {
        tag: icon?.tagName ?? null,
        style: styleMap(icon, ["display", "width", "height", "color", "fill"]),
        rect: rect(icon),
      },
    };
  });
}

test.describe("comparison ActionMenu visual parity", () => {
  test("ActionMenu default trigger is pixel-identical", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);

    await expectExactScreenshotPair(page, reactTrigger, solidTrigger, "ActionMenu default trigger");
  });

  test("ActionMenu trigger computed styles match React Spectrum across viewer axes", async ({
    page,
  }) => {
    for (const params of [
      {},
      { size: "XS" },
      { size: "XL" },
      { isQuiet: true },
      { isDisabled: true },
    ] as const) {
      const { reactTrigger, solidTrigger } = await actionMenuFixtures(page, params);

      await expect(actionMenuTriggerContract(solidTrigger)).resolves.toEqual(
        await actionMenuTriggerContract(reactTrigger),
      );
    }
  });
});
