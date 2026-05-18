import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  expectExactPreparedScreenshotPair,
  expectExactScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";

function menuQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function menuFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/menu/${menuQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactTrigger = reactPanel.getByRole("button", { name: "Layer actions" });
  const solidTrigger = solidPanel.getByRole("button", { name: "Layer actions" });

  await expect(reactTrigger).toBeVisible();
  await expect(solidTrigger).toBeVisible();

  return { reactTrigger, solidTrigger };
}

async function openMenuSettled(page: Page, trigger: Locator) {
  await trigger.click();
  await expect.poll(() => trigger.getAttribute("aria-controls")).toBeTruthy();

  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();

  const menu = page.locator(`[id="${menuId}"]`);
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("role", "menu");
  await expect(menu.getByRole("menuitem", { name: /Copy/ })).toBeVisible();
  await expect(menu).toContainText("Copy the selected layer");
  await expect(menu).toContainText("Cmd+C");
  await page.waitForTimeout(300);

  return menu;
}

async function menuTriggerContract(trigger: Locator) {
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

    const text = element.querySelector('[data-rsp-slot="text"]') ?? element;

    return {
      tag: element.tagName,
      ariaExpanded: element.getAttribute("aria-expanded"),
      disabled: element.hasAttribute("disabled"),
      text: text.textContent,
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
      ]),
      rect: rect(element),
      textStyle: styleMap(text, ["font-size", "line-height", "color"]),
      textRect: rect(text),
    };
  });
}

async function menuOpenMenuContract(menu: Locator) {
  return menu.evaluate((element) => {
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

    const item = element.querySelector('[role="menuitem"]');
    const iconWrapper = item?.querySelector('[slot="icon"]') ?? null;
    const icon = iconWrapper?.querySelector("svg") ?? null;
    const label = item?.querySelector('[slot="label"]') ?? null;
    const description = item?.querySelector('[slot="description"]') ?? null;
    const keyboard = item?.querySelector("kbd") ?? null;

    return {
      role: element.getAttribute("role"),
      itemCount: element.querySelectorAll('[role="menuitem"]').length,
      text: element.textContent,
      placement: element.closest("[data-placement]")?.getAttribute("data-placement") ?? null,
      style: styleMap(element, [
        "display",
        "box-sizing",
        "width",
        "min-width",
        "max-width",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "border-radius",
        "background-color",
        "color",
        "font-family",
        "font-size",
        "line-height",
      ]),
      rect: rect(element),
      item: {
        role: item?.getAttribute("role") ?? null,
        label: label?.textContent ?? null,
        description: description?.textContent ?? null,
        keyboard: keyboard?.textContent ?? null,
        style: styleMap(item, [
          "display",
          "box-sizing",
          "grid-template-areas",
          "grid-template-columns",
          "column-gap",
          "min-height",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
          "background-color",
          "color",
          "font-size",
          "line-height",
        ]),
        rect: rect(item),
      },
      iconWrapper: {
        slot: iconWrapper?.getAttribute("slot") ?? null,
        style: styleMap(iconWrapper, ["display", "grid-area", "width", "height"]),
        rect: rect(iconWrapper),
      },
      icon: {
        tag: icon?.tagName ?? null,
        style: styleMap(icon, ["display", "width", "height", "color", "fill"]),
        rect: rect(icon),
      },
      label: {
        slot: label?.getAttribute("slot") ?? null,
        style: styleMap(label, ["display", "grid-area", "color", "font-size", "line-height"]),
        rect: rect(label),
      },
      description: {
        slot: description?.getAttribute("slot") ?? null,
        style: styleMap(description, ["display", "grid-area", "color", "font-size", "line-height"]),
        rect: rect(description),
      },
      keyboard: {
        tag: keyboard?.tagName ?? null,
        style: styleMap(keyboard, ["display", "grid-area", "color", "font-size", "line-height"]),
        rect: rect(keyboard),
      },
    };
  });
}

test.describe("comparison Menu visual parity", () => {
  test("Menu default trigger is pixel-identical", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await menuFixtures(page);

    await expectExactScreenshotPair(page, reactTrigger, solidTrigger, "Menu default trigger");
  });

  test("Menu trigger computed styles match React Spectrum across viewer axes", async ({ page }) => {
    for (const params of [{}, { triggerSize: "XS" }, { triggerSize: "XL" }, { isDisabled: true }]) {
      const { reactTrigger, solidTrigger } = await menuFixtures(page, params);

      await expect(menuTriggerContract(solidTrigger)).resolves.toEqual(
        await menuTriggerContract(reactTrigger),
      );
    }
  });

  test("Menu open menu is pixel-identical", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await menuFixtures(page);
    const activePopover = page.locator('[data-placement]:has([role="menu"])');

    await expectExactPreparedScreenshotPair(
      page,
      activePopover,
      activePopover,
      "Menu open menu",
      async () => {
        await openMenuSettled(page, reactTrigger);
      },
      async () => {
        await page.keyboard.press("Escape");
        await expect(page.getByRole("menu")).toHaveCount(0);
        await openMenuSettled(page, solidTrigger);
      },
    );
  });

  test("Menu open menu computed styles match React Spectrum", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await menuFixtures(page);

    const reactMenu = await openMenuSettled(page, reactTrigger);
    const reactContract = await menuOpenMenuContract(reactMenu);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);

    const solidMenu = await openMenuSettled(page, solidTrigger);
    await expect(menuOpenMenuContract(solidMenu)).resolves.toEqual(reactContract);
  });
});
