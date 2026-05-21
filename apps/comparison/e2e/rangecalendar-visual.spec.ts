import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  compareScreenshots,
  exactPairDiff,
  expectExactScreenshotPair,
  pinComparisonTheme,
  type ComparisonColorScheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";
import {
  rangeCalendarDemoDefaults,
  rangeCalendarFirstDayOfWeekOptions,
  rangeCalendarPageBehaviorOptions,
  rangeCalendarSelectionAlignmentOptions,
  rangeCalendarVisibleMonthsOptions,
} from "../src/data/rangecalendar-demo";

const visualRouteParams = {
  visibleMonths: "2",
  firstDayOfWeek: "mon",
  isInvalid: true,
  unavailableDates: true,
  allowsNonContiguousRanges: true,
  constrainRange: true,
};

const rangeCalendarRootPairDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 16,
};

async function rangeCalendarRoot(panel: Locator) {
  const root = panel.locator('[data-comparison-control-root="rangecalendar"]');
  await expect(root).toHaveCount(1);
  await expect(root).toBeVisible();
  return root;
}

function rangeCalendarQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function rangeCalendarFixtures(
  page: Page,
  params: Record<string, string | boolean> = visualRouteParams,
  theme: ComparisonColorScheme = "dark",
) {
  await pinComparisonTheme(page, theme);
  await page.goto(`/components/rangecalendar/${rangeCalendarQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = await rangeCalendarRoot(reactPanel);
  const solidRoot = await rangeCalendarRoot(solidPanel);

  return { reactRoot, solidRoot };
}

async function rangeCalendarInnerRoot(root: Locator) {
  const innerRoot = root.locator(".comparison-rangecalendar-root").first();
  await expect(innerRoot).toBeVisible();
  return innerRoot;
}

async function waitForRangeCalendarScreenshotFrame(target: Locator) {
  await target.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
}

async function fixedRangeCalendarRootScreenshot(target: Locator) {
  await waitForRangeCalendarScreenshotFrame(target);

  const previousStyle = await target.evaluate((element) => {
    const htmlElement = element as HTMLElement;
    const style = htmlElement.getAttribute("style");
    let surfaceColor = window.getComputedStyle(htmlElement).backgroundColor;
    let parent = htmlElement.parentElement;

    while (parent && (surfaceColor === "transparent" || /^rgba\(.+,\s*0\)$/.test(surfaceColor))) {
      surfaceColor = window.getComputedStyle(parent).backgroundColor;
      parent = parent.parentElement;
    }

    htmlElement.style.position = "fixed";
    htmlElement.style.insetBlockStart = "128px";
    htmlElement.style.insetInlineStart = "384px";
    htmlElement.style.margin = "0";
    htmlElement.style.backgroundColor = surfaceColor;
    htmlElement.style.zIndex = "2147483647";

    return style;
  });

  try {
    await waitForRangeCalendarScreenshotFrame(target);
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

async function expectStableRangeCalendarRootPair(
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

    const reactPng = await fixedRangeCalendarRootScreenshot(
      await rangeCalendarInnerRoot(reactRoot),
    );
    const solidPng = await fixedRangeCalendarRootScreenshot(
      await rangeCalendarInnerRoot(solidRoot),
    );

    return compareScreenshots(page, reactPng, solidPng, label, rangeCalendarRootPairDiff);
  } finally {
    await page.evaluate(({ x, y }) => window.scrollTo(x, y), previousScroll);
  }
}

async function rangeCalendarContract(root: Locator) {
  return root.evaluate((element) => {
    const calendarRoot = element.querySelector(".comparison-rangecalendar-root") ?? element;
    const rootRect = calendarRoot.getBoundingClientRect();
    const grids = Array.from(element.querySelectorAll('[role="grid"]')) as HTMLElement[];
    const gridRects = grids.map((grid) => grid.getBoundingClientRect());
    const lastGridRect = gridRects[gridRects.length - 1] ?? rootRect;
    const selectedButtons = Array.from(
      element.querySelectorAll('[data-selected], [aria-selected="true"]'),
    ) as HTMLElement[];
    const unavailable = Array.from(element.querySelectorAll('[role="button"]')).find((button) =>
      (button.getAttribute("aria-label") ?? "").includes("February 10, 2025"),
    );
    const error = Array.from(element.querySelectorAll("*")).find(
      (node) => node.textContent?.trim() === "Choose a valid date range.",
    );

    return {
      gridCount: grids.length,
      columnCounts: grids.map((grid) => grid.querySelectorAll("thead th").length),
      rowCellCounts: grids.map((grid) =>
        Array.from(grid.querySelectorAll("tbody tr")).map((row) => row.children.length),
      ),
      gridWidths: gridRects.map((rect) => Math.round(rect.width)),
      gridGap: gridRects.length > 1 ? Math.round(gridRects[1].left - gridRects[0].right) : null,
      rootRightGap: Math.round(rootRect.right - lastGridRect.right),
      selectedCount: selectedButtons.length,
      unavailableDisabled:
        unavailable?.getAttribute("aria-disabled") === "true" ||
        unavailable?.hasAttribute("data-disabled") ||
        false,
      errorVisible: error instanceof HTMLElement && error.offsetParent !== null,
    };
  });
}

async function rangeCalendarHeadingText(root: Locator) {
  return ((await root.getByRole("heading").first().textContent()) ?? "").replace(
    /^Trip dates,\s*/,
    "",
  );
}

async function weekHeaderText(root: Locator) {
  return root
    .getByRole("grid")
    .first()
    .locator("thead th")
    .evaluateAll((headers) => headers.map((header) => header.textContent?.trim() ?? ""));
}

async function providerDirection(root: Locator) {
  return root.evaluate((element) => element.closest("[dir]")?.getAttribute("dir") ?? null);
}

async function expectMonths(root: Locator, months: string[]) {
  for (const month of months) {
    await expect(root.getByText(month, { exact: true }).first()).toBeVisible();
  }
}

async function selectedStartButton(root: Locator) {
  const button = root
    .locator(
      '[data-selection-start][role="button"], [data-selection-start] [role="button"], [aria-selected="true"] [role="button"]',
    )
    .first();
  await expect(button).toBeVisible();
  return button;
}

async function selectedStartLabel(root: Locator) {
  return (await selectedStartButton(root)).getAttribute("aria-label");
}

async function rangeCalendarForcedColorsContract(root: Locator) {
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

    function presentationSibling(
      node: Element | null,
      predicate: (styles: CSSStyleDeclaration) => boolean,
    ) {
      const frame = node?.parentElement;
      if (!frame) return null;

      return (
        Array.from(frame.querySelectorAll('[role="presentation"]')).find((candidate) => {
          if (!(candidate instanceof HTMLElement) && !(candidate instanceof SVGElement)) {
            return false;
          }

          return predicate(window.getComputedStyle(candidate));
        }) ?? null
      );
    }

    function unavailableStrikeElement(node: Element | null) {
      if (!node) return null;

      return (
        Array.from(node.querySelectorAll('[role="presentation"]')).find((candidate) => {
          if (!(candidate instanceof HTMLElement) && !(candidate instanceof SVGElement)) {
            return false;
          }

          const styles = window.getComputedStyle(candidate);
          return (
            styles.position === "absolute" && styles.height === "2px" && styles.transform !== "none"
          );
        }) ?? null
      );
    }

    const selectedStart = buttonForDate(3);
    const selectedMiddle = buttonForDate(4);
    const unavailable = buttonForDate(10);
    const error = Array.from(element.querySelectorAll("*")).find(
      (node) => node.textContent?.trim() === "Choose a valid date range.",
    );

    return {
      mediaMatches: window.matchMedia("(forced-colors: active)").matches,
      selectedStart: styleMap(selectedPaintElement(selectedStart), ["background-color", "color"]),
      rangeBackground: styleMap(
        presentationSibling(selectedMiddle, (styles) => styles.zIndex === "-1"),
        ["background-color", "forced-color-adjust"],
      ),
      rangeBorder: styleMap(
        presentationSibling(selectedMiddle, (styles) => styles.borderTopWidth === "1px"),
        ["border-top-color", "border-top-width", "border-top-style"],
      ),
      unavailable: styleMap(unavailable, ["color"]),
      unavailableStrike: styleMap(unavailableStrikeElement(unavailable), [
        "background-color",
        "border-radius",
        "height",
        "transform",
      ]),
      error: styleMap(error ?? null, ["color", "forced-color-adjust"]),
    };
  });
}

test.describe("comparison RangeCalendar visual coverage", () => {
  test("RangeCalendar selected range root matches within antialias threshold", async ({ page }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page);

    await expectStableRangeCalendarRootPair(
      page,
      reactRoot,
      solidRoot,
      "RangeCalendar selected range root",
    );
  });

  test("RangeCalendar month grids are pixel-identical", async ({ page }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page);
    const reactGrids = reactRoot.locator('[role="grid"]');
    const solidGrids = solidRoot.locator('[role="grid"]');

    await expect(reactGrids).toHaveCount(2);
    await expect(solidGrids).toHaveCount(2);

    await expectExactScreenshotPair(
      page,
      reactGrids.nth(0),
      solidGrids.nth(0),
      "RangeCalendar constrained leading month grid",
    );
    await expectExactScreenshotPair(
      page,
      reactGrids.nth(1),
      solidGrids.nth(1),
      "RangeCalendar selected range month grid",
    );
  });

  test("route mounts both styled stacks with S2 range calendar gates", async ({ page }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page);

    for (const root of [reactRoot, solidRoot]) {
      await expect
        .poll(async () =>
          JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}"),
        )
        .toMatchObject({
          visibleMonths: "2",
          firstDayOfWeek: "mon",
          isInvalid: true,
          unavailableDates: true,
          allowsNonContiguousRanges: true,
          constrainRange: true,
        });

      await expect(root.locator('[role="grid"]')).toHaveCount(2);
      await expect(root.getByText("Choose a valid date range.")).toBeVisible();
    }

    const reactContract = await rangeCalendarContract(reactRoot);
    const solidContract = await rangeCalendarContract(solidRoot);

    for (const contract of [reactContract, solidContract]) {
      expect(contract.gridCount).toBe(2);
      expect(contract.columnCounts).toEqual([7, 7]);
      for (const rowCounts of contract.rowCellCounts) {
        expect(rowCounts.every((count) => count === 7)).toBe(true);
      }
      expect(contract.gridWidths).toEqual([224, 224]);
      expect(contract.gridGap).toBe(24);
      expect(Math.abs(contract.rootRightGap)).toBeLessThanOrEqual(1);
      expect(contract.selectedCount).toBeGreaterThan(0);
      expect(contract.unavailableDisabled).toBe(true);
      expect(contract.errorVisible).toBe(true);
    }
  });

  test("RangeCalendar side panel exposes the modeled docs and source controls", async ({
    page,
  }) => {
    await rangeCalendarFixtures(page, {
      visibleMonths: "2",
      firstDayOfWeek: "mon",
      pageBehavior: "single",
      selectionAlignment: "end",
    });

    await expect(
      page
        .locator('select[name="visibleMonths"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...rangeCalendarVisibleMonthsOptions]);
    await expect(page.locator('select[name="visibleMonths"]')).toHaveValue("2");
    await expect(
      page
        .locator('select[name="firstDayOfWeek"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...rangeCalendarFirstDayOfWeekOptions]);
    await expect(page.locator('select[name="firstDayOfWeek"]')).toHaveValue("mon");
    await expect(
      page
        .locator('select[name="pageBehavior"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...rangeCalendarPageBehaviorOptions]);
    await expect(page.locator('select[name="pageBehavior"]')).toHaveValue("single");
    await expect(
      page
        .locator('select[name="selectionAlignment"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...rangeCalendarSelectionAlignmentOptions]);
    await expect(page.locator('select[name="selectionAlignment"]')).toHaveValue("end");
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();
    await expect(page.locator('input[name="isReadOnly"]')).not.toBeChecked();
    await expect(page.locator('input[name="isInvalid"]')).not.toBeChecked();
  });

  test("RangeCalendar inherits Provider locale for month titles and week starts", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page, {
      locale: "fr-FR",
      focusedValue: "2025-02-15",
    });

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute(
        "data-comparison-control-props",
        JSON.stringify({
          ...rangeCalendarDemoDefaults,
          locale: "fr-FR",
          focusedValue: "2025-02-15",
        }),
      );
      await expectMonths(root, ["février 2025"]);
      await expect(
        root.getByRole("button", { name: /samedi 15 février 2025/i }).first(),
      ).toBeVisible();
      await expect(weekHeaderText(root)).resolves.toEqual(["L", "M", "M", "J", "V", "S", "D"]);
    }
  });

  test("RangeCalendar inherits RTL direction for keyboard day movement", async ({ page }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page, {
      locale: "ar-AE",
      startValue: "2025-02-03",
      endValue: "2025-02-07",
    });

    await expect(providerDirection(reactRoot)).resolves.toBe("rtl");
    await expect(providerDirection(solidRoot)).resolves.toBe("rtl");

    await (await selectedStartButton(reactRoot)).focus();
    await page.keyboard.press("ArrowRight");
    await expect(reactRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-02");

    await (await selectedStartButton(solidRoot)).focus();
    await page.keyboard.press("ArrowRight");
    await expect(solidRoot).toHaveAttribute("data-comparison-focused-value", "2025-02-02");
  });

  test("RangeCalendar supports Unicode calendar-system locale display", async ({ page }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page, {
      locale: "hi-IN-u-ca-indian",
      startValue: "2025-02-03",
      endValue: "2025-02-07",
      focusedValue: "2025-02-03",
    });

    const reactTitle = await rangeCalendarHeadingText(reactRoot);
    const solidTitle = await rangeCalendarHeadingText(solidRoot);
    expect(reactTitle).toBe(solidTitle);
    expect(reactTitle).toContain("1946");

    const reactLabel = await selectedStartLabel(reactRoot);
    const solidLabel = await selectedStartLabel(solidRoot);
    expect(reactLabel).toBe(solidLabel);
    expect(reactLabel ?? "").toContain("1946");

    await expect(reactRoot).toHaveAttribute("data-comparison-value", "2025-02-03/2025-02-07");
    await expect(solidRoot).toHaveAttribute("data-comparison-value", "2025-02-03/2025-02-07");
  });

  test("RangeCalendar routes custom createCalendar display through both stacks", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page, {
      calendarSystem: "custom454",
      focusedValue: "2025-03-01",
    });

    const reactTitle = await rangeCalendarHeadingText(reactRoot);
    const solidTitle = await rangeCalendarHeadingText(solidRoot);

    expect(reactTitle).toBe(solidTitle);
    expect(reactTitle).toBe("February 2025");
  });

  test("RangeCalendar forced-colors branch matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(
      true,
    );

    const { reactRoot, solidRoot } = await rangeCalendarFixtures(page);

    const react = await rangeCalendarForcedColorsContract(reactRoot);
    const solid = await rangeCalendarForcedColorsContract(solidRoot);

    expect(solid).toEqual(react);
    expect(solid.mediaMatches).toBe(true);
    expect(solid.selectedStart?.["background-color"]).not.toBe("rgba(0, 0, 0, 0)");
    expect(solid.selectedStart?.["background-color"]).not.toBe("transparent");
    expect(solid.rangeBackground?.["background-color"]).toBeTruthy();
    expect(solid.rangeBorder?.["border-top-width"]).toBe("1px");
    expect(solid.unavailableStrike).toEqual(react.unavailableStrike);
    expect(solid.unavailableStrike?.height).toBe("2px");
    expect(solid.unavailableStrike?.transform).not.toBe("none");
    expect(solid.error?.color).not.toBe(solid.unavailable?.color);
  });
});
