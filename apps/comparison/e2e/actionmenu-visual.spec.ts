import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  compareScreenshots,
  exactPairDiff,
  expectExactPreparedScreenshotPair,
  expectExactScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";

const transformedTriggerPairDiff = {
  ...exactPairDiff,
  pixelThreshold: 4,
};

function actionMenuQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
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

async function actionMenuOpenMenus(page: Page, reactTrigger: Locator, solidTrigger: Locator) {
  const reactTriggerId = await reactTrigger.evaluate((element) => element.id);
  const reactMenu = page.locator(`[role="menu"][aria-labelledby="${reactTriggerId}"]`);
  const solidMenu = page.locator('[role="menu"][aria-label="More actions"]');

  return { reactMenu, solidMenu };
}

async function openActionMenu(trigger: Locator, menu: Locator) {
  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Copy" })).toBeVisible();
  await expect(menu).toContainText("Copy the selected text");
  await expect(menu).toContainText("Cmd+C");
}

async function openActionMenuSettled(page: Page, trigger: Locator, menu: Locator) {
  await openActionMenu(trigger, menu);
  // React S2 popovers have a 200ms entrance transform; compare settled geometry.
  await page.waitForTimeout(300);
}

async function waitForActionMenuTriggerTransition(page: Page) {
  await page.waitForTimeout(300);
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

async function fixedPaddedElementScreenshot(
  target: Locator,
  prepare: () => Promise<void>,
  padding = 4,
) {
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
    await prepare();
    await waitForActionMenuTriggerTransition(target.page());
    await waitForScreenshotFrame(target);

    const box = await target.boundingBox();
    if (!box) {
      throw new Error("ActionMenu trigger screenshot requires a mounted element.");
    }

    return target.page().screenshot({
      animations: "disabled",
      clip: {
        x: Math.floor(Math.max(0, box.x - padding)),
        y: Math.floor(Math.max(0, box.y - padding)),
        width: Math.ceil(box.width + padding * 2),
        height: Math.ceil(box.height + padding * 2),
      },
    });
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

async function expectPreparedPaddedTriggerPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
  threshold = exactPairDiff,
) {
  await clearPointer(page);
  const reactPng = await fixedPaddedElementScreenshot(reactTarget, prepareReact);

  await page.mouse.up();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await clearPointer(page);
  const solidPng = await fixedPaddedElementScreenshot(solidTarget, prepareSolid);

  await page.mouse.up();
  const diff = await compareScreenshots(page, reactPng, solidPng, label, threshold);
  return { reactPng, solidPng, diff };
}

async function actionMenuOpenMenuContract(menu: Locator) {
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
        "outline-style",
        "outline-width",
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

async function actionMenuPlacementContract(trigger: Locator, menu: Locator) {
  const triggerElement = await trigger.elementHandle();
  const menuElement = await menu.elementHandle();

  if (!triggerElement || !menuElement) {
    throw new Error("ActionMenu placement contract requires mounted trigger and menu elements.");
  }

  return trigger.page().evaluate(
    ([triggerNode, menuNode]) => {
      function round(value: number) {
        return Number(value.toFixed(3));
      }

      const triggerRect = triggerNode.getBoundingClientRect();
      const menuRect = menuNode.getBoundingClientRect();
      const popover = menuNode.closest("[data-placement]");

      return {
        placement: popover?.getAttribute("data-placement") ?? null,
        trigger: {
          width: round(triggerRect.width),
          height: round(triggerRect.height),
        },
        menu: {
          width: round(menuRect.width),
          height: round(menuRect.height),
        },
        gaps: {
          bottom: round(menuRect.top - triggerRect.bottom),
          top: round(triggerRect.top - menuRect.bottom),
          left: round(triggerRect.left - menuRect.right),
          right: round(menuRect.left - triggerRect.right),
        },
        align: {
          left: round(menuRect.left - triggerRect.left),
          right: round(menuRect.right - triggerRect.right),
          top: round(menuRect.top - triggerRect.top),
          bottom: round(menuRect.bottom - triggerRect.bottom),
        },
      };
    },
    [triggerElement, menuElement],
  );
}

type ActionMenuPlacementContract = Awaited<ReturnType<typeof actionMenuPlacementContract>>;

function expectPlacementContractToMatch(
  actual: ActionMenuPlacementContract,
  expected: ActionMenuPlacementContract,
) {
  expect(actual.placement).toBe(expected.placement);
  expect(actual.trigger).toEqual(expected.trigger);
  expect(actual.menu).toEqual(expected.menu);

  for (const group of ["gaps", "align"] as const) {
    for (const key of Object.keys(expected[group]) as Array<
      keyof ActionMenuPlacementContract[typeof group]
    >) {
      expect(
        Math.abs(actual[group][key] - expected[group][key]),
        `${group}.${String(key)} should stay within subpixel layout rounding`,
      ).toBeLessThanOrEqual(1);
    }
  }
}

test.describe("comparison ActionMenu visual parity", () => {
  test("ActionMenu default trigger is pixel-identical", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);

    await expectExactScreenshotPair(page, reactTrigger, solidTrigger, "ActionMenu default trigger");
  });

  test("ActionMenu trigger hover state is pixel-identical", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);

    await expectPreparedPaddedTriggerPair(
      page,
      reactTrigger,
      solidTrigger,
      "ActionMenu trigger hover",
      async () => {
        await reactTrigger.hover();
        await expect(reactTrigger).toHaveAttribute("data-hovered", "true");
      },
      async () => {
        await solidTrigger.hover();
        await expect(solidTrigger).toHaveAttribute("data-hovered", "true");
      },
    );
  });

  test("ActionMenu trigger focus-visible state is pixel-identical", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);

    await expectPreparedPaddedTriggerPair(
      page,
      reactTrigger,
      solidTrigger,
      "ActionMenu trigger focus-visible",
      async () => {
        await reactTrigger.focus();
        await expect(reactTrigger).toHaveAttribute("data-focus-visible", "true");
      },
      async () => {
        await solidTrigger.focus();
        await expect(solidTrigger).toHaveAttribute("data-focus-visible", "true");
      },
    );
  });

  test("ActionMenu trigger pressed state matches current React Spectrum", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);

    await expectPreparedPaddedTriggerPair(
      page,
      reactTrigger,
      solidTrigger,
      "ActionMenu trigger pressed",
      async () => {
        await reactTrigger.hover();
        await page.mouse.down();
        await expect(reactTrigger).toHaveAttribute("data-pressed", "true");
      },
      async () => {
        await solidTrigger.hover();
        await page.mouse.down();
        await expect(solidTrigger).toHaveAttribute("data-pressed", "true");
      },
      transformedTriggerPairDiff,
    );
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

  test("ActionMenu open menu is pixel-identical", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);
    const { reactMenu, solidMenu } = await actionMenuOpenMenus(page, reactTrigger, solidTrigger);

    await expectExactPreparedScreenshotPair(
      page,
      reactMenu,
      solidMenu,
      "ActionMenu open menu",
      async () => {
        await openActionMenu(reactTrigger, reactMenu);
      },
      async () => {
        await page.keyboard.press("Escape");
        await openActionMenu(solidTrigger, solidMenu);
      },
    );
  });

  test("ActionMenu open menu computed styles match React Spectrum", async ({ page }) => {
    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);
    const { reactMenu, solidMenu } = await actionMenuOpenMenus(page, reactTrigger, solidTrigger);

    await openActionMenu(reactTrigger, reactMenu);
    const reactContract = await actionMenuOpenMenuContract(reactMenu);

    await page.keyboard.press("Escape");
    await openActionMenu(solidTrigger, solidMenu);

    await expect(actionMenuOpenMenuContract(solidMenu)).resolves.toEqual(reactContract);
  });

  test("ActionMenu forced-colors trigger is pixel-identical", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(
      true,
    );

    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);

    await expectExactScreenshotPair(
      page,
      reactTrigger,
      solidTrigger,
      "ActionMenu forced-colors trigger",
    );
  });

  test("ActionMenu forced-colors open menu is pixel-identical", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(
      true,
    );

    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page);
    const { reactMenu, solidMenu } = await actionMenuOpenMenus(page, reactTrigger, solidTrigger);

    await expectExactPreparedScreenshotPair(
      page,
      reactMenu,
      solidMenu,
      "ActionMenu forced-colors open menu",
      async () => {
        await openActionMenu(reactTrigger, reactMenu);
      },
      async () => {
        await page.keyboard.press("Escape");
        await openActionMenu(solidTrigger, solidMenu);
      },
    );
  });

  test("ActionMenu accessibility media environments match React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(
      true,
    );

    for (const params of [{}, { isQuiet: true }, { isDisabled: true }] as const) {
      const { reactTrigger, solidTrigger } = await actionMenuFixtures(page, params);

      await expect(actionMenuTriggerContract(solidTrigger)).resolves.toEqual(
        await actionMenuTriggerContract(reactTrigger),
      );
    }

    const forcedColorFixtures = await actionMenuFixtures(page);
    const forcedColorMenus = await actionMenuOpenMenus(
      page,
      forcedColorFixtures.reactTrigger,
      forcedColorFixtures.solidTrigger,
    );

    await openActionMenu(forcedColorFixtures.reactTrigger, forcedColorMenus.reactMenu);
    const forcedColorReactMenu = await actionMenuOpenMenuContract(forcedColorMenus.reactMenu);

    await page.keyboard.press("Escape");
    await openActionMenu(forcedColorFixtures.solidTrigger, forcedColorMenus.solidMenu);

    await expect(actionMenuOpenMenuContract(forcedColorMenus.solidMenu)).resolves.toEqual(
      forcedColorReactMenu,
    );

    await page.keyboard.press("Escape");
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
    await expect(
      page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
    ).resolves.toBe(true);

    const reducedMotionFixtures = await actionMenuFixtures(page);
    await expect(actionMenuTriggerContract(reducedMotionFixtures.solidTrigger)).resolves.toEqual(
      await actionMenuTriggerContract(reducedMotionFixtures.reactTrigger),
    );

    const reducedMotionMenus = await actionMenuOpenMenus(
      page,
      reducedMotionFixtures.reactTrigger,
      reducedMotionFixtures.solidTrigger,
    );

    await openActionMenuSettled(
      page,
      reducedMotionFixtures.reactTrigger,
      reducedMotionMenus.reactMenu,
    );
    const reducedMotionReactMenu = await actionMenuOpenMenuContract(reducedMotionMenus.reactMenu);

    await page.keyboard.press("Escape");
    await openActionMenuSettled(
      page,
      reducedMotionFixtures.solidTrigger,
      reducedMotionMenus.solidMenu,
    );

    await expect(actionMenuOpenMenuContract(reducedMotionMenus.solidMenu)).resolves.toEqual(
      reducedMotionReactMenu,
    );
  });

  test("ActionMenu placement axes match React Spectrum", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1800 });

    for (const params of [
      {},
      { align: "end" },
      { direction: "top" },
      { direction: "top", align: "end" },
      { direction: "left" },
      { direction: "left", align: "end" },
      { direction: "right" },
      { direction: "right", align: "end" },
      { direction: "start" },
      { direction: "end" },
    ] as const) {
      const { reactTrigger, solidTrigger } = await actionMenuFixtures(page, params);
      const { reactMenu, solidMenu } = await actionMenuOpenMenus(page, reactTrigger, solidTrigger);

      await openActionMenuSettled(page, reactTrigger, reactMenu);
      const reactContract = await actionMenuPlacementContract(reactTrigger, reactMenu);

      await page.keyboard.press("Escape");
      await openActionMenuSettled(page, solidTrigger, solidMenu);

      expectPlacementContractToMatch(
        await actionMenuPlacementContract(solidTrigger, solidMenu),
        reactContract,
      );
      await page.keyboard.press("Escape");
    }
  });

  test("ActionMenu shouldFlip=false keeps the requested placement", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const { reactTrigger, solidTrigger } = await actionMenuFixtures(page, {
      direction: "bottom",
      shouldFlip: false,
    });
    const { reactMenu, solidMenu } = await actionMenuOpenMenus(page, reactTrigger, solidTrigger);

    await openActionMenuSettled(page, reactTrigger, reactMenu);
    const reactContract = await actionMenuPlacementContract(reactTrigger, reactMenu);
    expect(reactContract.placement).toBe("bottom");

    await page.keyboard.press("Escape");
    await openActionMenuSettled(page, solidTrigger, solidMenu);
    const solidContract = await actionMenuPlacementContract(solidTrigger, solidMenu);

    expect(solidContract.placement).toBe("bottom");
    expectPlacementContractToMatch(solidContract, reactContract);
  });
});
