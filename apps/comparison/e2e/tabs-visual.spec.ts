import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import {
  normalizeTabsDemoProps,
  tabsDemoCompositionOptions,
  tabsDemoDensityOptions,
  tabsDemoDisabledKeyOptions,
  tabsDemoKeyboardActivationOptions,
  tabsDemoLabelBehaviorOptions,
  tabsDemoOrientationOptions,
  tabsDemoSelectionSourceOptions,
  type TabsDemoProps,
} from "../src/data/tabs-demo";
import { comparisonTabItems } from "../src/data/comparison-contract";

function tabsQuery(params: Partial<TabsDemoProps> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function tabsFixtures(page: Page, params: Partial<TabsDemoProps> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/tabs/${tabsQuery(params)}`);
  await page.addStyleTag({
    content: ".s2-topbar, astro-dev-toolbar { visibility: hidden !important; }",
  });
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="tabs"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="tabs"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function expectRadioValues(
  page: Page,
  name: string,
  values: readonly string[],
  checked: string,
) {
  await expect(
    page
      .locator(`input[name="${name}"]`)
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
  ).resolves.toEqual([...values]);
  await expect(page.locator(`input[name="${name}"]:checked`)).toHaveValue(checked);
}

async function tabsLabelHiddenContract(root: Locator) {
  return root.getByRole("tab").evaluateAll((tabs) =>
    tabs.map((tab) => {
      const labelledBy = tab.getAttribute("aria-labelledby") ?? "";
      const labelElements = labelledBy
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element instanceof HTMLElement);

      return {
        labelledBy,
        labelledText: labelElements.map((element) => element.textContent?.trim() ?? ""),
        labelledDisplay: labelElements.map((element) => window.getComputedStyle(element).display),
        iconCount: tab.querySelectorAll("svg").length,
      };
    }),
  );
}

type TabsComputedStyleContract = {
  tabList: Record<string, string>;
  selectedTab: Record<string, string>;
  idleTab: Record<string, string>;
  selectedIndicator: Record<string, string>;
  selectedPanel: Record<string, string>;
};

type TabsPanelExposureContract = {
  text: string;
  role: string | null;
  hidden: boolean;
  inert: boolean;
  dataInert: string | null;
  dataSelected: string | null;
  display: string;
  hasId: boolean;
  hasAriaLabelledBy: boolean;
  tabIndex: string | null;
};

async function tabsComputedStyleContract(root: Locator): Promise<TabsComputedStyleContract> {
  return root.evaluate((element) => {
    function requiredElement(selector: string, scope: ParentNode = element) {
      const node = scope.querySelector(selector);
      if (!(node instanceof HTMLElement)) {
        throw new Error(`Missing Tabs style contract element: ${selector}`);
      }

      return node;
    }

    function styleSubset(node: HTMLElement, properties: string[]) {
      const computed = window.getComputedStyle(node);
      return Object.fromEntries(
        properties.map((property) => [property, computed.getPropertyValue(property)]),
      );
    }

    const tabList = requiredElement('[role="tablist"]');
    const selectedTab = requiredElement('[role="tab"][aria-selected="true"]');
    const idleTab = requiredElement('[role="tab"][aria-selected="false"]');
    const selectedIndicator = Array.from(selectedTab.children).find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && window.getComputedStyle(child).position === "absolute",
    );
    const selectedPanel =
      element.querySelector<HTMLElement>('[role="tabpanel"][data-selected]') ??
      element.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])') ??
      requiredElement('[role="tabpanel"]');

    if (!selectedIndicator) {
      throw new Error("Missing Tabs selected indicator");
    }

    return {
      tabList: styleSubset(tabList, [
        "display",
        "flex-direction",
        "gap",
        "margin-inline-start",
        "margin-inline-end",
        "min-width",
      ]),
      selectedTab: styleSubset(selectedTab, [
        "display",
        "color",
        "height",
        "min-height",
        "padding-inline-start",
        "padding-inline-end",
        "border-radius",
        "position",
        "flex-shrink",
        "transition-property",
      ]),
      idleTab: styleSubset(idleTab, ["color", "cursor"]),
      selectedIndicator: styleSubset(selectedIndicator, [
        "position",
        "background-color",
        "border-radius",
        "height",
        "width",
        "bottom",
        "top",
        "left",
        "contain",
        "transition-property",
      ]),
      selectedPanel: styleSubset(selectedPanel, [
        "display",
        "color",
        "flex-grow",
        "margin-top",
        "min-height",
      ]),
    };
  });
}

async function tabsPanelExposureContract(root: Locator): Promise<TabsPanelExposureContract[]> {
  const panelTexts = comparisonTabItems.map((item) => item.content);

  return root.evaluate((element, texts) => {
    return texts.map((text) => {
      const panel = Array.from(element.querySelectorAll<HTMLElement>("div")).find(
        (node) => node.textContent?.trim() === text,
      );

      if (!panel) {
        throw new Error(`Missing force-mounted Tabs panel: ${text}`);
      }

      return {
        text,
        role: panel.getAttribute("role"),
        hidden: panel.hasAttribute("hidden"),
        inert: panel.hasAttribute("inert"),
        dataInert: panel.getAttribute("data-inert"),
        dataSelected: panel.getAttribute("data-selected"),
        display: window.getComputedStyle(panel).display,
        hasId: panel.hasAttribute("id"),
        hasAriaLabelledBy: panel.hasAttribute("aria-labelledby"),
        tabIndex: panel.getAttribute("tabindex"),
      };
    });
  }, panelTexts);
}

async function expectManualActivation(root: Locator, page: Page) {
  const tabs = root.getByRole("tab");

  await expect(root).toHaveAttribute("data-comparison-selected-key", "overview");
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(root).toHaveAttribute("data-comparison-selected-key", "overview");
  await expect(tabs.nth(1)).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(root).toHaveAttribute("data-comparison-selected-key", "parity");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
}

async function forceTabsOverflow(page: Page) {
  await page.addStyleTag({
    content: `
      [data-comparison-control-root="tabs"] {
        inline-size: 176px !important;
        max-inline-size: 176px !important;
      }

      [data-comparison-control-root="tabs"] .solidaria-Tabs,
      [data-comparison-control-root="tabs"] .react-aria-Tabs {
        inline-size: 100% !important;
      }
    `,
  });
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
}

async function collapsedTabsPicker(root: Locator) {
  await expect(root.getByRole("tablist")).toHaveCount(0);
  const picker = root.getByRole("button").first();
  await expect(picker).toBeVisible();
  await expect(picker).toContainText("Overview");
  return picker;
}

test.describe("comparison Tabs visual parity", () => {
  test("Tabs controls match the S2 viewer surface and drive both implementations", async ({
    page,
  }) => {
    await tabsFixtures(page);

    await expect(page.locator('input[name="ariaLabel"]')).toHaveValue("Project tabs");
    await expectRadioValues(page, "selectionSource", tabsDemoSelectionSourceOptions, "selectedKey");
    await expectRadioValues(page, "selectedKey", ["overview", "parity", "testing"], "overview");
    await expectRadioValues(
      page,
      "defaultSelectedKey",
      ["overview", "parity", "testing"],
      "parity",
    );
    await expectRadioValues(page, "disabledKey", tabsDemoDisabledKeyOptions, "none");
    await expectRadioValues(page, "orientation", tabsDemoOrientationOptions, "horizontal");
    await expectRadioValues(page, "density", tabsDemoDensityOptions, "regular");
    await expectRadioValues(page, "labelBehavior", tabsDemoLabelBehaviorOptions, "show");
    await expectRadioValues(
      page,
      "keyboardActivation",
      tabsDemoKeyboardActivationOptions,
      "automatic",
    );
    await expectRadioValues(page, "composition", tabsDemoCompositionOptions, "dynamic");
    await expect(page.locator('input[name="withIcons"]')).not.toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();
    await expect(page.locator('input[name="shouldForceMount"]')).not.toBeChecked();

    const routeProps = normalizeTabsDemoProps({
      ariaLabel: "Milestone tabs",
      selectedKey: "parity",
      disabledKey: "testing",
      orientation: "vertical",
      density: "compact",
      labelBehavior: "hide",
      keyboardActivation: "manual",
      composition: "static",
      withIcons: true,
      shouldForceMount: true,
    });
    const fixtures = await tabsFixtures(page, routeProps);
    const expectedProps = JSON.stringify(routeProps);

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-selected-key", "parity");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-selected-key", "parity");
    await expect(
      fixtures.reactRoot.getByRole("tablist", { name: "Milestone tabs" }),
    ).toHaveAttribute("aria-orientation", "vertical");
    await expect(
      fixtures.solidRoot.getByRole("tablist", { name: "Milestone tabs" }),
    ).toHaveAttribute("aria-orientation", "vertical");
  });

  test("Tabs labelBehavior=hide keeps icon-only tabs accessible and visually hidden", async ({
    page,
  }) => {
    const fixtures = await tabsFixtures(page, {
      selectedKey: "parity",
      disabledKey: "testing",
      orientation: "vertical",
      density: "compact",
      labelBehavior: "hide",
      composition: "static",
      withIcons: true,
      shouldForceMount: true,
    });

    for (const root of [fixtures.reactRoot, fixtures.solidRoot]) {
      await expect(root.getByRole("tab", { name: "Parity" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(root.getByRole("tab", { name: "Testing" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      await expect(root.getByRole("tabpanel")).toContainText(
        "Static and dynamic collection composition",
      );

      const labels = await tabsLabelHiddenContract(root);
      expect(labels).toHaveLength(3);
      for (const label of labels) {
        expect(label.labelledBy).not.toBe("");
        expect(label.labelledDisplay).toContain("none");
        expect(label.iconCount).toBeGreaterThan(0);
      }
    }
  });

  test("Tabs shouldForceMount keeps inactive panels inert and out of tabpanel semantics", async ({
    page,
  }) => {
    const fixtures = await tabsFixtures(page, {
      selectedKey: "parity",
      orientation: "vertical",
      density: "compact",
      labelBehavior: "hide",
      composition: "static",
      withIcons: true,
      shouldForceMount: true,
    });

    const expectedPanels: TabsPanelExposureContract[] = [
      {
        text: comparisonTabItems[0].content,
        role: null,
        hidden: false,
        inert: true,
        dataInert: "true",
        dataSelected: null,
        display: "none",
        hasId: false,
        hasAriaLabelledBy: false,
        tabIndex: null,
      },
      {
        text: comparisonTabItems[1].content,
        role: "tabpanel",
        hidden: false,
        inert: false,
        dataInert: null,
        dataSelected: null,
        display: "block",
        hasId: true,
        hasAriaLabelledBy: true,
        tabIndex: "0",
      },
      {
        text: comparisonTabItems[2].content,
        role: null,
        hidden: false,
        inert: true,
        dataInert: "true",
        dataSelected: null,
        display: "none",
        hasId: false,
        hasAriaLabelledBy: false,
        tabIndex: null,
      },
    ];

    const reactPanels = await tabsPanelExposureContract(fixtures.reactRoot);
    const solidPanels = await tabsPanelExposureContract(fixtures.solidRoot);

    expect(reactPanels).toEqual(expectedPanels);
    expect(solidPanels).toEqual(expectedPanels);
  });

  test("Tabs non-overflow S2 style contract matches React Spectrum", async ({ page }) => {
    let fixtures = await tabsFixtures(page, { selectedKey: "parity" });
    let reactStyles = await tabsComputedStyleContract(fixtures.reactRoot);
    let solidStyles = await tabsComputedStyleContract(fixtures.solidRoot);
    expect(solidStyles).toEqual(reactStyles);

    fixtures = await tabsFixtures(page, {
      selectedKey: "parity",
      orientation: "vertical",
      density: "compact",
      labelBehavior: "hide",
      composition: "static",
      withIcons: true,
      shouldForceMount: true,
    });
    reactStyles = await tabsComputedStyleContract(fixtures.reactRoot);
    solidStyles = await tabsComputedStyleContract(fixtures.solidRoot);
    expect(solidStyles).toEqual(reactStyles);

    await page.emulateMedia({ forcedColors: "active" });
    fixtures = await tabsFixtures(page, {
      selectedKey: "parity",
      disabledKey: "testing",
      isDisabled: true,
    });
    reactStyles = await tabsComputedStyleContract(fixtures.reactRoot);
    solidStyles = await tabsComputedStyleContract(fixtures.solidRoot);
    expect(solidStyles).toEqual(reactStyles);
    await page.emulateMedia({ forcedColors: "none" });
  });

  test("Tabs selectedKey and manual keyboard activation stay in parity", async ({ page }) => {
    let fixtures = await tabsFixtures(page, {
      selectionSource: "selectedKey",
      selectedKey: "overview",
      keyboardActivation: "automatic",
    });

    await fixtures.reactRoot.getByRole("tab", { name: "Parity" }).click();
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-selected-key", "parity");
    await expect(fixtures.reactRoot.getByRole("tabpanel")).toContainText(
      "Static and dynamic collection composition",
    );

    await fixtures.solidRoot.getByRole("tab", { name: "Parity" }).click();
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-selected-key", "parity");
    await expect(fixtures.solidRoot.getByRole("tabpanel")).toContainText(
      "Static and dynamic collection composition",
    );

    fixtures = await tabsFixtures(page, {
      selectionSource: "selectedKey",
      selectedKey: "overview",
      keyboardActivation: "manual",
    });

    await expectManualActivation(fixtures.reactRoot, page);
    await expectManualActivation(fixtures.solidRoot, page);
  });

  test("Tabs horizontal overflow collapses into a picker", async ({ page }) => {
    const fixtures = await tabsFixtures(page, {
      selectedKey: "overview",
      orientation: "horizontal",
      density: "regular",
      labelBehavior: "show",
      composition: "dynamic",
    });

    await forceTabsOverflow(page);

    const reactPicker = await collapsedTabsPicker(fixtures.reactRoot);
    const solidPicker = await collapsedTabsPicker(fixtures.solidRoot);

    await expect(fixtures.reactRoot.getByRole("group")).toContainText(
      "Tabs organize related sections behind one labelled tab list.",
    );
    await expect(fixtures.solidRoot.getByRole("group")).toContainText(
      "Tabs organize related sections behind one labelled tab list.",
    );

    await solidPicker.click();
    await page.getByRole("option", { name: "Parity" }).click();
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-selected-key", "parity");
    await expect(fixtures.solidRoot.getByRole("group")).toContainText(
      "Static and dynamic collection composition",
    );

    await reactPicker.click();
    await page.getByRole("option", { name: "Parity" }).click();
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-selected-key", "parity");
    await expect(fixtures.reactRoot.getByRole("group")).toContainText(
      "Static and dynamic collection composition",
    );
  });
});
