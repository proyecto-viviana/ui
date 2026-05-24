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
});
