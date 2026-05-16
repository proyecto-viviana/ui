import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  expectExactPreparedInPlaceScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";

function accordionQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function accordionFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/accordion/${accordionQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="accordion"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="accordion"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function expectExactAccordionPair(
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

async function accordionStyleContract(root: Locator) {
  return root.evaluate((element) => {
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

    function buttonByName(name: string) {
      return Array.from(element.querySelectorAll("button")).find((button) => {
        const label = button.getAttribute("aria-label") ?? button.textContent ?? "";
        return label.trim() === name;
      });
    }

    function disclosurePart(name: string) {
      const button = buttonByName(name);
      const heading = button?.closest("h1,h2,h3,h4,h5,h6") ?? null;
      const header = heading?.parentElement ?? null;
      const item = header?.parentElement ?? null;
      const panelId = button?.getAttribute("aria-controls");
      const panel = panelId ? element.ownerDocument.getElementById(panelId) : null;
      const panelInner = panel?.firstElementChild ?? null;
      const chevron = button?.querySelector('svg[aria-hidden="true"]') ?? null;
      const chevronPath = chevron?.querySelector("path") ?? null;

      return {
        itemTag: item?.tagName ?? null,
        itemStyle: styleMap(item, [
          "border-top-width",
          "border-bottom-width",
          "border-left-width",
          "border-right-width",
          "border-style",
          "border-color",
          "color",
          "min-width",
        ]),
        headerTag: header?.tagName ?? null,
        headerStyle: styleMap(header, ["display", "align-items", "gap"]),
        headingTag: heading?.tagName ?? null,
        headingStyle: styleMap(heading, [
          "display",
          "flex-grow",
          "flex-shrink",
          "margin-top",
          "margin-right",
          "margin-bottom",
          "margin-left",
          "min-width",
        ]),
        buttonAttributes: {
          ariaExpanded: button?.getAttribute("aria-expanded") ?? null,
          disabled: button?.hasAttribute("disabled") ?? null,
        },
        buttonStyle: styleMap(button ?? null, [
          "display",
          "flex-grow",
          "align-items",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
          "gap",
          "min-height",
          "width",
          "background-color",
          "border-width",
          "border-radius",
          "text-align",
          "color",
          "font-family",
          "font-size",
          "font-weight",
          "line-height",
        ]),
        chevron: {
          tag: chevron?.tagName ?? null,
          viewBox: chevron?.getAttribute("viewBox") ?? null,
          path: chevronPath?.getAttribute("d") ?? null,
          fill: chevronPath?.getAttribute("fill") ?? null,
          style: styleMap(chevron, [
            "width",
            "height",
            "rotate",
            "transition-property",
            "transition-duration",
            "flex-shrink",
          ]),
          rect: rect(chevron),
        },
        panel: {
          tag: panel?.tagName ?? null,
          role: panel?.getAttribute("role") ?? null,
          hidden: panel?.getAttribute("hidden") ?? null,
          ariaHidden: panel?.getAttribute("aria-hidden") ?? null,
          style: styleMap(panel, [
            "height",
            "overflow-x",
            "overflow-y",
            "transition-property",
            "transition-duration",
            "font-family",
            "font-size",
            "line-height",
          ]),
        },
        panelInner: {
          tag: panelInner?.tagName ?? null,
          style: styleMap(panelInner, [
            "padding-top",
            "padding-right",
            "padding-bottom",
            "padding-left",
          ]),
        },
      };
    }

    const accordion = element.firstElementChild;
    const action = buttonByName("More billing actions");

    return {
      root: {
        tag: accordion?.tagName ?? null,
        providerDir: accordion?.closest("[dir]")?.getAttribute("dir") ?? null,
        childCount: accordion?.children.length ?? null,
        style: styleMap(accordion, ["display", "flex-direction", "width", "direction"]),
        rect: rect(accordion),
      },
      personal: disclosurePart("Personal Information"),
      billing: disclosurePart("Billing Address"),
      action: {
        tag: action?.tagName ?? null,
        ariaLabel: action?.getAttribute("aria-label") ?? null,
        style: styleMap(action ?? null, [
          "display",
          "align-items",
          "justify-content",
          "min-width",
          "width",
          "height",
          "padding-left",
          "padding-right",
          "border-radius",
          "color",
          "background-color",
        ]),
        rect: rect(action ?? null),
      },
    };
  });
}

test.describe("comparison Accordion visual parity", () => {
  test("Accordion key route states are pixel-identical", async ({ page }) => {
    for (const state of [
      { label: "Accordion default", params: {} },
      { label: "Accordion compact small", params: { size: "S", density: "compact" } },
      {
        label: "Accordion quiet spacious large",
        params: { size: "L", density: "spacious", isQuiet: true },
      },
      { label: "Accordion disabled", params: { size: "M", density: "regular", isDisabled: true } },
    ] as const) {
      const fixtures = await accordionFixtures(page, state.params);

      await expectExactAccordionPair(page, fixtures.reactRoot, fixtures.solidRoot, state.label);
    }
  });

  test("Accordion multiple expanded state is pixel-identical", async ({ page }) => {
    const fixtures = await accordionFixtures(page, { allowsMultipleExpanded: true });

    await fixtures.reactRoot.getByRole("button", { name: "Billing Address" }).click();
    await fixtures.solidRoot.getByRole("button", { name: "Billing Address" }).click();
    await page.waitForTimeout(250);

    await expectExactAccordionPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "Accordion multiple expanded",
    );
  });

  test("Accordion reduced-motion and RTL environment styles match React Spectrum", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedMotionFixtures = await accordionFixtures(page);
    const reducedMotionReact = await accordionStyleContract(reducedMotionFixtures.reactRoot);

    await expect(accordionStyleContract(reducedMotionFixtures.solidRoot)).resolves.toEqual(
      reducedMotionReact,
    );
    expect(reducedMotionReact.personal.panel.style).toMatchObject({
      "transition-property": "none",
    });

    await page.emulateMedia({ reducedMotion: "no-preference" });
    const rtlFixtures = await accordionFixtures(page, { locale: "ar-SA" });
    const rtlReact = await accordionStyleContract(rtlFixtures.reactRoot);

    await expect(accordionStyleContract(rtlFixtures.solidRoot)).resolves.toEqual(rtlReact);
    expect(rtlReact.root.providerDir).toBe("rtl");
    expect(rtlReact.root.style).toMatchObject({ direction: "rtl" });
    expect(rtlReact.billing.chevron.style).toMatchObject({ rotate: "180deg" });
    await expectExactAccordionPair(
      page,
      rtlFixtures.reactRoot,
      rtlFixtures.solidRoot,
      "Accordion RTL",
    );
  });

  test("Accordion computed styles match React Spectrum across size, density, quiet, and disabled axes", async ({
    page,
  }) => {
    for (const params of [
      {},
      { size: "S", density: "compact" },
      { size: "L", density: "spacious", isQuiet: true },
      { size: "XL", density: "compact", allowsMultipleExpanded: true },
      { size: "M", density: "regular", isDisabled: true },
    ] as const) {
      const fixtures = await accordionFixtures(page, params);

      await expect(accordionStyleContract(fixtures.solidRoot)).resolves.toEqual(
        await accordionStyleContract(fixtures.reactRoot),
      );
    }
  });

  test("Accordion expanded panel and header action geometry matches React Spectrum", async ({
    page,
  }) => {
    const fixtures = await accordionFixtures(page, { allowsMultipleExpanded: true });

    await fixtures.reactRoot.getByRole("button", { name: "Billing Address" }).click();
    await fixtures.solidRoot.getByRole("button", { name: "Billing Address" }).click();
    await page.waitForTimeout(250);

    await expect(accordionStyleContract(fixtures.solidRoot)).resolves.toEqual(
      await accordionStyleContract(fixtures.reactRoot),
    );
  });
});
