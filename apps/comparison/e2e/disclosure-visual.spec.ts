import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectExactPreparedScreenshotPair, pinComparisonTheme } from "./visual-diff";
import {
  disclosureDensityOptions,
  disclosurePanelRoleOptions,
  disclosureSizeOptions,
  disclosureTitleLevelOptions,
} from "../src/data/disclosure-demo";

function disclosureQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function disclosureFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/disclosure/${disclosureQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="disclosure"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="disclosure"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function expectExactDisclosurePair(
  page: Page,
  reactRoot: Locator,
  solidRoot: Locator,
  label: string,
) {
  await expectExactPreparedScreenshotPair(
    page,
    disclosureVisualTarget(reactRoot),
    disclosureVisualTarget(solidRoot),
    label,
    async () => undefined,
    async () => undefined,
  );
}

async function disclosureStyleContract(root: Locator) {
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

    const disclosure = element.firstElementChild;
    const button = buttonByName("System Requirements");
    const heading = button?.closest("h1,h2,h3,h4,h5,h6") ?? null;
    const header = heading?.parentElement ?? null;
    const panelId = button?.getAttribute("aria-controls");
    const panel = panelId ? element.ownerDocument.getElementById(panelId) : null;
    const panelInner = panel?.firstElementChild ?? null;
    const chevron = button?.querySelector('svg[aria-hidden="true"]') ?? null;
    const chevronPath = chevron?.querySelector("path") ?? null;
    const action = buttonByName("Edit system requirements");

    return {
      root: {
        tag: disclosure?.tagName ?? null,
        providerDir: disclosure?.closest("[dir]")?.getAttribute("dir") ?? null,
        style: styleMap(disclosure, [
          "background-color",
          "border-top-width",
          "border-bottom-width",
          "border-left-width",
          "border-right-width",
          "border-style",
          "border-color",
          "color",
          "min-width",
          "width",
          "direction",
        ]),
        rect: rect(disclosure),
      },
      header: {
        tag: header?.tagName ?? null,
        style: styleMap(header, ["display", "align-items", "gap"]),
      },
      heading: {
        tag: heading?.tagName ?? null,
        style: styleMap(heading, [
          "display",
          "flex-grow",
          "flex-shrink",
          "margin-top",
          "margin-right",
          "margin-bottom",
          "margin-left",
          "min-width",
        ]),
      },
      button: {
        tag: button?.tagName ?? null,
        ariaExpanded: button?.getAttribute("aria-expanded") ?? null,
        disabled: button?.hasAttribute("disabled") ?? null,
        dataHovered: button?.hasAttribute("data-hovered") ?? null,
        dataPressed: button?.hasAttribute("data-pressed") ?? null,
        style: styleMap(button ?? null, [
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
          "outline-style",
          "outline-width",
          "outline-color",
          "outline-offset",
        ]),
      },
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

async function disclosureA11yContract(root: Locator) {
  return root.evaluate((element) => {
    const button = Array.from(element.querySelectorAll("button")).find((candidate) =>
      (candidate.textContent ?? "").trim().includes("System Requirements"),
    );
    const panelId = button?.getAttribute("aria-controls") ?? "";
    const panel = panelId ? element.ownerDocument.getElementById(panelId) : null;
    const action = Array.from(element.querySelectorAll("button")).find(
      (candidate) => candidate.getAttribute("aria-label") === "Edit system requirements",
    );

    return {
      buttonTag: button?.tagName ?? null,
      panelTag: panel?.tagName ?? null,
      buttonHasId: Boolean(button?.id),
      panelHasId: Boolean(panel?.id),
      buttonType: button?.getAttribute("type") ?? null,
      ariaExpanded: button?.getAttribute("aria-expanded") ?? null,
      controlsResolvesToPanel: Boolean(panel && panel.id === panelId),
      panelRole: panel?.getAttribute("role") ?? null,
      panelLabelledByButton: panel?.getAttribute("aria-labelledby") === button?.id,
      panelHidden: panel?.getAttribute("hidden") ?? null,
      panelAriaHidden: panel?.getAttribute("aria-hidden") ?? null,
      actionNestedInTrigger: Boolean(action?.parentElement?.closest("button") === button),
    };
  });
}

async function interactionStyle(button: Locator) {
  return button.evaluate((element) => {
    const styles = window.getComputedStyle(element);

    return {
      active: element.ownerDocument.activeElement === element,
      matchesFocusVisible: element.matches(":focus-visible"),
      dataHovered: element.hasAttribute("data-hovered"),
      dataPressed: element.hasAttribute("data-pressed"),
      dataFocusVisible: element.hasAttribute("data-focus-visible"),
      style: {
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        outlineOffset: styles.outlineOffset,
      },
    };
  });
}

async function expectDisclosureCallbackState(
  root: Locator,
  expected: {
    expanded: boolean;
    changeCount: number;
    lastChangeValue: string;
  },
) {
  await expect(root).toHaveAttribute("data-comparison-expanded", String(expected.expanded));
  await expect(root).toHaveAttribute(
    "data-comparison-expanded-change-count",
    String(expected.changeCount),
  );
  await expect(root).toHaveAttribute(
    "data-comparison-expanded-change-value",
    expected.lastChangeValue,
  );
}

function disclosureTitleButton(root: Locator) {
  return root.getByRole("button", { name: "System Requirements", exact: true });
}

function disclosureActionButton(root: Locator) {
  return root.getByRole("button", { name: "Edit system requirements", exact: true });
}

function disclosureVisualTarget(root: Locator) {
  return root.locator(":scope > div").first();
}

test.describe("comparison Disclosure visual parity", () => {
  test("Disclosure key route states are pixel-identical", async ({ page }) => {
    for (const state of [
      { label: "Disclosure default", params: {} },
      { label: "Disclosure compact small", params: { size: "S", density: "compact" } },
      {
        label: "Disclosure quiet spacious large",
        params: { size: "L", density: "spacious", isQuiet: true },
      },
      { label: "Disclosure disabled", params: { size: "M", density: "regular", isDisabled: true } },
      { label: "Disclosure collapsed", params: { isExpanded: false } },
    ] as const) {
      const fixtures = await disclosureFixtures(page, state.params);

      await expectExactDisclosurePair(page, fixtures.reactRoot, fixtures.solidRoot, state.label);
    }
  });

  test("Disclosure controls match the S2 viewer axes and drive both implementations", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await disclosureFixtures(page, {
      size: "XL",
      density: "compact",
      isQuiet: true,
      isExpanded: false,
      panelRole: "region",
      titleLevel: "4",
    });

    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...disclosureSizeOptions]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("XL");
    await expect(
      page
        .locator('input[name="density"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...disclosureDensityOptions]);
    await expect(page.locator('input[name="density"]:checked')).toHaveValue("compact");
    await expect(
      page
        .locator('input[name="panelRole"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...disclosurePanelRoleOptions]);
    await expect(page.locator('input[name="panelRole"]:checked')).toHaveValue("region");
    await expect(
      page
        .locator('input[name="titleLevel"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...disclosureTitleLevelOptions]);
    await expect(page.locator('input[name="titleLevel"]:checked')).toHaveValue("4");
    await expect(page.locator('input[name="isQuiet"]')).toBeChecked();
    await expect(page.locator('input[name="isExpanded"]')).not.toBeChecked();
    await expect(page.locator('input[name="withHeaderAction"]')).toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();

    const expectedProps = JSON.stringify({
      size: "XL",
      density: "compact",
      isQuiet: true,
      isDisabled: false,
      isExpanded: false,
      withHeaderAction: true,
      panelRole: "region",
      titleLevel: "4",
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
  });

  test("Disclosure computed styles match React Spectrum across size, density, quiet, disabled, and content axes", async ({
    page,
  }) => {
    for (const params of [
      {},
      { size: "S", density: "compact" },
      { size: "L", density: "spacious", isQuiet: true },
      { size: "XL", density: "compact", panelRole: "region", titleLevel: "4" },
      { size: "M", density: "regular", isDisabled: true },
      { withHeaderAction: false },
    ] as const) {
      const fixtures = await disclosureFixtures(page, params);

      await expect(disclosureStyleContract(fixtures.solidRoot)).resolves.toEqual(
        await disclosureStyleContract(fixtures.reactRoot),
      );
    }
  });

  test("Disclosure hover, pressed, and focus-visible trigger styles match React Spectrum", async ({
    page,
  }) => {
    const { reactRoot, solidRoot } = await disclosureFixtures(page);
    const reactButton = disclosureTitleButton(reactRoot);
    const solidButton = disclosureTitleButton(solidRoot);
    const reactDefault = await interactionStyle(reactButton);

    await reactButton.hover();
    await page.waitForTimeout(220);
    const reactHover = await interactionStyle(reactButton);
    await clearPointer(page);
    await solidButton.hover();
    await page.waitForTimeout(220);
    await expect(interactionStyle(solidButton)).resolves.toEqual(reactHover);
    expect(reactHover.style.backgroundColor).not.toBe(reactDefault.style.backgroundColor);

    await page.mouse.down();
    await page.waitForTimeout(220);
    const solidPressed = await interactionStyle(solidButton);
    await page.mouse.up();
    await clearPointer(page);
    await reactButton.hover();
    await page.mouse.down();
    await page.waitForTimeout(220);
    const reactPressed = await interactionStyle(reactButton);
    await page.mouse.up();
    await clearPointer(page);

    expect(solidPressed).toEqual(reactPressed);
    expect(reactPressed.style.backgroundColor).not.toBe(reactHover.style.backgroundColor);

    await page.keyboard.press("Tab");
    await reactButton.focus();
    await page.waitForTimeout(220);
    const reactFocusVisible = await interactionStyle(reactButton);
    await solidButton.focus();
    await page.waitForTimeout(220);
    await expect(interactionStyle(solidButton)).resolves.toEqual(reactFocusVisible);
  });

  test("Disclosure semantics, callbacks, header action, and disabled suppression match", async ({
    page,
  }) => {
    const defaultFixtures = await disclosureFixtures(page);
    for (const root of [defaultFixtures.reactRoot, defaultFixtures.solidRoot]) {
      await expect(disclosureTitleButton(root)).toHaveAttribute("aria-expanded", "true");
      await expect(root.getByText("macOS 14 or later")).toBeVisible();
      await disclosureActionButton(root).click();
      await expectDisclosureCallbackState(root, {
        expanded: true,
        changeCount: 0,
        lastChangeValue: "",
      });
    }
    await expect(disclosureA11yContract(defaultFixtures.solidRoot)).resolves.toEqual(
      await disclosureA11yContract(defaultFixtures.reactRoot),
    );

    for (const root of [defaultFixtures.reactRoot, defaultFixtures.solidRoot]) {
      await disclosureTitleButton(root).click();
    }
    for (const root of [defaultFixtures.reactRoot, defaultFixtures.solidRoot]) {
      await expect(disclosureTitleButton(root)).toHaveAttribute("aria-expanded", "false");
      await expectDisclosureCallbackState(root, {
        expanded: false,
        changeCount: 1,
        lastChangeValue: "false",
      });
    }

    const disabledFixtures = await disclosureFixtures(page, { isDisabled: true });
    for (const root of [disabledFixtures.reactRoot, disabledFixtures.solidRoot]) {
      await expect(disclosureTitleButton(root)).toBeDisabled();
      await disclosureTitleButton(root).click({ force: true });
      await expectDisclosureCallbackState(root, {
        expanded: true,
        changeCount: 0,
        lastChangeValue: "",
      });
    }
  });

  test("Disclosure reduced-motion, RTL, and forced-colors environment styles match React Spectrum", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedMotionFixtures = await disclosureFixtures(page);
    const reducedMotionReact = await disclosureStyleContract(reducedMotionFixtures.reactRoot);

    await expect(disclosureStyleContract(reducedMotionFixtures.solidRoot)).resolves.toEqual(
      reducedMotionReact,
    );
    expect(reducedMotionReact.panel.style).toMatchObject({
      "transition-property": "none",
    });

    await page.emulateMedia({ reducedMotion: "no-preference" });
    const rtlFixtures = await disclosureFixtures(page, { locale: "ar-SA" });
    const rtlReact = await disclosureStyleContract(rtlFixtures.reactRoot);

    await expect(disclosureStyleContract(rtlFixtures.solidRoot)).resolves.toEqual(rtlReact);
    expect(rtlReact.root.providerDir).toBe("rtl");
    expect(rtlReact.root.style).toMatchObject({ direction: "rtl" });
    expect(rtlReact.chevron.style).toMatchObject({ rotate: "90deg" });
    await expectExactDisclosurePair(
      page,
      rtlFixtures.reactRoot,
      rtlFixtures.solidRoot,
      "Disclosure RTL",
    );

    await page.emulateMedia({ forcedColors: "active" });
    await expect(page.evaluate(() => matchMedia("(forced-colors: active)").matches)).resolves.toBe(
      true,
    );
    const forcedColorsDefault = await disclosureFixtures(page);
    const forcedColorsReact = await disclosureStyleContract(forcedColorsDefault.reactRoot);

    await expect(disclosureStyleContract(forcedColorsDefault.solidRoot)).resolves.toEqual(
      forcedColorsReact,
    );

    const forcedColorsDisabled = await disclosureFixtures(page, { isDisabled: true });
    const disabledReact = await disclosureStyleContract(forcedColorsDisabled.reactRoot);

    await expect(disclosureStyleContract(forcedColorsDisabled.solidRoot)).resolves.toEqual(
      disabledReact,
    );
    expect(disabledReact.button.disabled).toBe(true);
    expect(disabledReact.button.style?.color).not.toBe(forcedColorsReact.button.style?.color);
  });
});
