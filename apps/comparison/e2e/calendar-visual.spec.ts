import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import {
  clearPointer,
  compareScreenshots,
  exactPairDiff,
  pinComparisonTheme,
  type ComparisonColorScheme,
} from "./visual-diff";

function calendarQuery(params: Record<string, string> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function calendarFixtures(
  page: Page,
  theme: ComparisonColorScheme = "dark",
  params: Record<string, string> = {},
) {
  await pinComparisonTheme(page, theme);
  await page.goto(`/components/calendar/${calendarQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="calendar"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="calendar"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, reactRoot, solidCanvas, solidRoot };
}

async function waitForCalendarScreenshotFrame(target: Locator) {
  await target.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
}

async function fixedCalendarRootScreenshot(target: Locator) {
  await waitForCalendarScreenshotFrame(target);

  const previousStyle = await target.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    const style = htmlElement.getAttribute("style");

    htmlElement.style.position = "fixed";
    htmlElement.style.insetBlockStart = "128px";
    htmlElement.style.insetInlineStart = "384px";
    htmlElement.style.margin = "0";
    htmlElement.style.zIndex = "2147483647";

    return style;
  });

  try {
    await waitForCalendarScreenshotFrame(target);
    return await target.screenshot({ animations: "disabled" });
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

async function expectExactCalendarRootPair(
  page: Page,
  reactRoot: Locator,
  solidRoot: Locator,
  label: string,
) {
  const previousScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));

  try {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });

    const reactPng = await fixedCalendarRootScreenshot(reactRoot);
    const solidPng = await fixedCalendarRootScreenshot(solidRoot);
    const diff = await compareScreenshots(page, reactPng, solidPng, label, exactPairDiff);

    return { reactPng, solidPng, diff };
  } finally {
    await page.evaluate(({ x, y }) => window.scrollTo(x, y), previousScroll);
  }
}

async function calendarVisualContract(root: Locator) {
  return root
    .locator('[role="grid"]')
    .first()
    .evaluate((grid) => {
      const root = grid.closest('[data-comparison-control-root="calendar"]') as HTMLElement | null;
      const selectedRoot = root?.querySelector(
        '[data-selected], [aria-selected="true"]',
      ) as HTMLElement | null;
      const selectedPaintElement = selectedRoot
        ? ([selectedRoot, ...Array.from(selectedRoot.querySelectorAll("*"))] as HTMLElement[]).find(
            (element) => {
              const rect = element.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                window.getComputedStyle(element).backgroundColor !== "rgba(0, 0, 0, 0)"
              );
            },
          )
        : null;
      const heading = root?.querySelector("h2");
      const grids = Array.from(root?.querySelectorAll('[role="grid"]') ?? []) as HTMLElement[];
      const gridRect = grid.getBoundingClientRect();
      const firstGridRect = grids[0]?.getBoundingClientRect() ?? gridRect;
      const lastGridRect = grids[grids.length - 1]?.getBoundingClientRect() ?? gridRect;
      const selectedRect = selectedRoot?.getBoundingClientRect();
      const selectedStyles = selectedPaintElement
        ? window.getComputedStyle(selectedPaintElement)
        : null;
      const calendarRoot = root?.querySelector(".comparison-calendar-root") as HTMLElement | null;
      const calendarRect = calendarRoot?.getBoundingClientRect();
      const visibleHeading =
        Array.from(root?.querySelectorAll("h2") ?? []).find((element) => {
          const ariaHidden = element.getAttribute("aria-hidden");
          const ariaLive = element.getAttribute("aria-live");
          return ariaHidden === "true" || ariaLive === "polite";
        }) ?? heading;
      const titleElement =
        Array.from(visibleHeading?.querySelectorAll("div") ?? []).find((element) =>
          /\d{4}/.test(element.textContent ?? ""),
        ) ?? visibleHeading;
      const headingRect = visibleHeading?.getBoundingClientRect();
      const titleStyles = titleElement ? window.getComputedStyle(titleElement) : null;

      return {
        headingText: heading?.textContent?.trim() ?? null,
        headingHeight: headingRect ? Math.round(headingRect.height) : null,
        titleColor: titleStyles?.color ?? null,
        titleFontWeight: titleStyles?.fontWeight ?? null,
        titleLineHeight: titleStyles?.lineHeight ?? null,
        gridColumnCount: grid.querySelectorAll("thead th").length,
        gridWidth: Math.round(gridRect.width),
        gridHeight: Math.round(gridRect.height),
        calendarWidth: calendarRect ? Math.round(calendarRect.width) : null,
        gridLeftOffset: calendarRect ? Math.round(firstGridRect.left - calendarRect.left) : null,
        gridRightGap: calendarRect ? Math.round(calendarRect.right - lastGridRect.right) : null,
        selectedText: selectedRoot?.textContent?.trim() ?? null,
        selectedWidth: selectedRect ? Math.round(selectedRect.width) : null,
        selectedHeight: selectedRect ? Math.round(selectedRect.height) : null,
        selectedBackground: selectedStyles?.backgroundColor ?? null,
        selectedColor: selectedStyles?.color ?? null,
      };
    });
}

async function calendarForcedColorsContract(root: Locator) {
  return root.evaluate((element) => {
    function isTransparent(value: string) {
      return value === "transparent" || /^rgba\(.+,\s*0\)$/.test(value);
    }

    function styleMap(node: Element | null, keys: readonly string[]) {
      if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) {
        return null;
      }

      const styles = window.getComputedStyle(node);
      return Object.fromEntries(
        keys.map((key) => {
          const value = styles.getPropertyValue(key);
          return [key, key.endsWith("color") && isTransparent(value) ? "transparent" : value];
        }),
      );
    }

    function buttonForDate(day: number) {
      return (
        Array.from(element.querySelectorAll('[role="button"]')).find((button) =>
          (button.getAttribute("aria-label") ?? "").includes(`February ${day}, 2025`),
        ) ?? null
      );
    }

    function selectedPaintElement(node: Element | null) {
      if (!node) return null;

      return (
        ([node, ...Array.from(node.querySelectorAll("*"))] as Element[]).find((candidate) => {
          if (!(candidate instanceof HTMLElement) && !(candidate instanceof SVGElement)) {
            return false;
          }

          const rect = candidate.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            !isTransparent(window.getComputedStyle(candidate).backgroundColor)
          );
        }) ?? node
      );
    }

    const selected = buttonForDate(3);
    const defaultCell = buttonForDate(4);
    const unavailable = buttonForDate(10);
    const error = Array.from(element.querySelectorAll("*")).find(
      (node) => node.textContent?.trim() === "Date is unavailable.",
    );

    return {
      mediaMatches: window.matchMedia("(forced-colors: active)").matches,
      selected: styleMap(selectedPaintElement(selected), ["background-color", "color"]),
      defaultCell: styleMap(defaultCell, ["color"]),
      unavailable: styleMap(unavailable, ["color"]),
      error: styleMap(error ?? null, ["color", "forced-color-adjust"]),
    };
  });
}

test.describe("comparison Calendar visual coverage", () => {
  test("Calendar unselected grid is pixel-identical", async ({ page }) => {
    const { reactRoot, solidRoot } = await calendarFixtures(page, "dark", {
      focusedValue: "2025-02-15",
    });

    await expectExactCalendarRootPair(page, reactRoot, solidRoot, "Calendar unselected grid");
  });

  test("Calendar selected date is pixel-identical", async ({ page }) => {
    const { reactRoot, solidRoot } = await calendarFixtures(page, "dark", {
      value: "2025-02-03",
    });

    await expectExactCalendarRootPair(page, reactRoot, solidRoot, "Calendar selected date");
  });

  test("Calendar multi-month layout is pixel-identical", async ({ page }) => {
    const { reactRoot, solidRoot } = await calendarFixtures(page, "dark", {
      focusedValue: "2025-02-15",
      visibleMonths: "2",
    });

    await expectExactCalendarRootPair(page, reactRoot, solidRoot, "Calendar multi-month layout");
  });

  test("Calendar official default renders an unselected S2 grid in light and dark themes", async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      const { reactRoot, solidRoot } = await calendarFixtures(page, theme);

      const react = await calendarVisualContract(reactRoot);
      const solid = await calendarVisualContract(solidRoot);

      expect(react.gridColumnCount).toBe(7);
      expect(solid.gridColumnCount).toBe(7);
      expect(react.selectedText).toBeNull();
      expect(solid.selectedText).toBeNull();
      expect(react.calendarWidth).toBe(react.gridWidth);
      expect(solid.calendarWidth).toBe(solid.gridWidth);
      expect(react.gridLeftOffset).toBe(0);
      expect(solid.gridLeftOffset).toBe(0);
      expect(react.gridRightGap).toBe(0);
      expect(solid.gridRightGap).toBe(0);
      expect(solid.titleColor).toBe(react.titleColor);
      expect(solid.titleFontWeight).toBe(react.titleFontWeight);
      expect(solid.titleLineHeight).toBe(react.titleLineHeight);
      expect(react.gridWidth).toBeGreaterThan(180);
      expect(solid.gridWidth).toBeGreaterThan(180);
      expect(react.gridHeight).toBeGreaterThan(150);
      expect(solid.gridHeight).toBeGreaterThan(150);
    }
  });

  test("Calendar controlled selected state paints the selected date in light and dark themes", async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      const { reactRoot, solidRoot } = await calendarFixtures(page, theme, {
        value: "2025-02-03",
      });

      const react = await calendarVisualContract(reactRoot);
      const solid = await calendarVisualContract(solidRoot);

      expect(react.headingText).toContain("February 2025");
      expect(solid.headingText).toContain("February 2025");
      expect(react.selectedText).toBe("3");
      expect(solid.selectedText).toBe("3");
      expect(react.selectedBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(solid.selectedBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(react.selectedColor).not.toBe(react.selectedBackground);
      expect(solid.selectedColor).not.toBe(solid.selectedBackground);
    }
  });

  test("Calendar multi-month layout keeps the heading compact and grids flush", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await calendarFixtures(page, "dark", {
      visibleMonths: "2",
    });

    const react = await calendarVisualContract(reactRoot);
    const solid = await calendarVisualContract(solidRoot);

    expect(react.gridLeftOffset).toBe(0);
    expect(solid.gridLeftOffset).toBe(0);
    expect(react.gridRightGap).toBe(0);
    expect(solid.gridRightGap).toBe(0);
    expect(react.headingHeight).toBeLessThanOrEqual(32);
    expect(solid.headingHeight).toBeLessThanOrEqual(32);
  });

  test("Calendar forced-colors branch matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(
      true,
    );

    const { reactRoot, solidRoot } = await calendarFixtures(page, "dark", {
      value: "2025-02-03",
      unavailableDates: "true",
      isInvalid: "true",
      errorMessage: "Date is unavailable.",
    });

    const react = await calendarForcedColorsContract(reactRoot);
    const solid = await calendarForcedColorsContract(solidRoot);

    expect(solid).toEqual(react);
    expect(solid.mediaMatches).toBe(true);
    expect(solid.selected?.["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
    expect(solid.selected?.["background-color"]).not.toBe("transparent");
    expect(solid.selected?.color).not.toBe(solid.selected?.["background-color"]);
    expect(solid.defaultCell?.color).toBeTruthy();
    expect(solid.unavailable?.color).toBeTruthy();
    expect(solid.error?.color).not.toBe(solid.defaultCell?.color);
  });
});
