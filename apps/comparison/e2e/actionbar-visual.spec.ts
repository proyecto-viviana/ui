import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  expectExactPreparedInPlaceScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";

function actionBarQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function actionBarFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/actionbar/${actionBarQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);
  await page.waitForTimeout(250);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="actionbar"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="actionbar"]').first();
  const reactActionBar = reactRoot.locator('[data-comparison-actionbar-root="true"]').first();
  const solidActionBar = solidRoot.locator('[data-comparison-actionbar-root="true"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();
  await expect(reactActionBar).toBeVisible();
  await expect(solidActionBar).toBeVisible();

  return { reactRoot, solidRoot, reactActionBar, solidActionBar };
}

type ActionBarStyleContractOptions = {
  includeActionBarPositioning?: boolean;
};

async function expectExactActionBarPair(
  page: Page,
  reactRoot: Locator,
  solidRoot: Locator,
  label: string,
) {
  await expectExactPreparedInPlaceScreenshotPair(
    page,
    reactRoot,
    solidRoot,
    label,
    async () => undefined,
    async () => undefined,
  );
}

async function actionBarStyleContract(root: Locator, options: ActionBarStyleContractOptions = {}) {
  return root.evaluate(
    (element, contractOptions) => {
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

      const clearButton = element.querySelector('button[aria-label="Clear selection"]');
      let actionBarRoot: Element | null = element.querySelector(
        '[data-comparison-actionbar-root="true"]',
      );
      let ancestor = clearButton?.parentElement ?? null;

      while (!actionBarRoot && ancestor && ancestor !== element) {
        if (
          ancestor.querySelector("[data-density][data-orientation]") &&
          /\bselected\b/i.test(ancestor.textContent ?? "")
        ) {
          actionBarRoot = ancestor;
          break;
        }
        ancestor = ancestor.parentElement;
      }

      const actionGroup =
        actionBarRoot?.querySelector('[aria-label="Actions"][data-orientation]') ??
        actionBarRoot?.querySelector("[data-density][data-orientation]") ??
        null;
      const actionButtons = Array.from(actionGroup?.querySelectorAll("button") ?? []);
      const firstActionButton = actionButtons[0] ?? null;
      const firstActionIcon = firstActionButton?.querySelector("svg") ?? null;
      const selection =
        Array.from(actionBarRoot?.querySelectorAll("span") ?? []).find((node) =>
          /\bselected\b/i.test(node.textContent ?? ""),
        ) ?? null;
      const scrollShell = element.querySelector(
        '[data-comparison-actionbar-scroll-shell="true"]',
      ) as HTMLElement | null;
      const actionBarBaseStyleKeys = [
        "display",
        "align-items",
        "gap",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "border-radius",
        "background-color",
        "box-shadow",
        "outline-color",
        "outline-style",
        "outline-width",
      ] as const;
      const actionBarPositioningStyleKeys = [
        "position",
        "bottom",
        "inset-inline-start",
        "inset-inline-end",
        "width",
        "max-width",
        "translate",
      ] as const;
      const actionBarStyleKeys = contractOptions.includeActionBarPositioning
        ? [...actionBarBaseStyleKeys, ...actionBarPositioningStyleKeys]
        : actionBarBaseStyleKeys;

      return {
        root: {
          selectedCount: element.getAttribute("data-comparison-selected-count"),
          emphasized: element
            .getAttribute("data-comparison-actionbar-props")
            ?.includes('"isEmphasized":true'),
          scrollRef: element.getAttribute("data-comparison-actionbar-scroll-ref"),
          style: styleMap(element, ["display", "padding-top", "padding-right", "width"]),
          rect: rect(element),
        },
        actionBar: {
          tag: actionBarRoot?.tagName ?? null,
          style: styleMap(actionBarRoot ?? null, actionBarStyleKeys),
          rect: contractOptions.includeActionBarPositioning ? rect(actionBarRoot ?? null) : null,
        },
        scrollShell: scrollShell
          ? {
              style: styleMap(scrollShell, [
                "position",
                "overflow-y",
                "padding-top",
                "padding-right",
                "border-radius",
              ]),
              scrollbarWidth: scrollShell.offsetWidth - scrollShell.clientWidth,
              rect: rect(scrollShell),
            }
          : null,
        selection: {
          text: selection?.textContent ?? null,
          style: styleMap(selection, ["color", "font-family", "font-size", "line-height"]),
        },
        clearButton: {
          tag: clearButton?.tagName ?? null,
          ariaLabel: clearButton?.getAttribute("aria-label") ?? null,
          style: styleMap(clearButton ?? null, [
            "display",
            "align-items",
            "justify-content",
            "width",
            "height",
            "padding-top",
            "padding-right",
            "border-radius",
            "background-color",
            "border-style",
            "color",
            "outline-color",
          ]),
          rect: rect(clearButton ?? null),
        },
        actionGroup: {
          tag: actionGroup?.tagName ?? null,
          ariaLabel: actionGroup?.getAttribute("aria-label") ?? null,
          orientation: actionGroup?.getAttribute("data-orientation") ?? null,
          childCount: actionButtons.length,
          style: styleMap(actionGroup ?? null, ["display", "gap", "margin-inline-start", "order"]),
        },
        firstActionButton: {
          tag: firstActionButton?.tagName ?? null,
          style: styleMap(firstActionButton ?? null, [
            "display",
            "height",
            "padding-left",
            "padding-right",
            "border-radius",
            "background-color",
            "color",
          ]),
          icon: {
            tag: firstActionIcon?.tagName ?? null,
            rect: rect(firstActionIcon),
            style: styleMap(firstActionIcon, ["width", "height"]),
          },
        },
      };
    },
    { includeActionBarPositioning: options.includeActionBarPositioning ?? true },
  );
}

test.describe("comparison ActionBar visual parity", () => {
  test("ActionBar key route states are pixel-identical", async ({ page }) => {
    for (const state of [
      { label: "ActionBar default", params: {} },
      { label: "ActionBar single selection", params: { selectedItemCount: "1" } },
      { label: "ActionBar all selected", params: { selectedItemCount: "all" } },
      { label: "ActionBar emphasized", params: { isEmphasized: true } },
    ] as const) {
      const fixtures = await actionBarFixtures(page, state.params);

      await expectExactActionBarPair(page, fixtures.reactRoot, fixtures.solidRoot, state.label);
    }
  });

  test("ActionBar computed styles match React Spectrum across visual axes", async ({ page }) => {
    for (const params of [
      {},
      { selectedItemCount: "1" },
      { selectedItemCount: "all" },
      { isEmphasized: true },
      { useCollection: true },
    ] as const) {
      const fixtures = await actionBarFixtures(page, params);
      const includeActionBarPositioning = !("useCollection" in params && params.useCollection);

      await expect(
        actionBarStyleContract(fixtures.solidRoot, { includeActionBarPositioning }),
      ).resolves.toEqual(
        await actionBarStyleContract(fixtures.reactRoot, { includeActionBarPositioning }),
      );
    }
  });

  test("ActionBar forced-colors environment matches React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(
      true,
    );

    for (const state of [
      { label: "ActionBar forced colors default", params: {} },
      { label: "ActionBar forced colors emphasized", params: { isEmphasized: true } },
    ] as const) {
      const fixtures = await actionBarFixtures(page, state.params);

      await expect(actionBarStyleContract(fixtures.solidRoot)).resolves.toEqual(
        await actionBarStyleContract(fixtures.reactRoot),
      );
    }
  });
});
