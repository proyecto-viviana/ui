import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function listViewFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/listview/${query}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="listview"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="listview"]').first();
  const reactMarker = reactPanel.locator("[data-comparison-selected-keys]").first();
  const solidMarker = solidPanel.locator("[data-comparison-selected-keys]").first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
    reactMarker,
    solidMarker,
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean | number
  >;
}

async function listViewState(root: Locator) {
  return root.evaluate((element) => {
    const text = (node: Element | null) => node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const grid = (
      element.getAttribute("role") === "grid" ? element : element.querySelector('[role="grid"]')
    ) as HTMLElement | null;
    const scope = (element.parentElement ?? element) as HTMLElement;
    const rows = Array.from(element.querySelectorAll<HTMLElement>('[role="row"]'));
    const rowStates = rows.map((row) => {
      const rect = row.getBoundingClientRect();
      const style = window.getComputedStyle(row);
      const backgroundLayer = Array.from(row.querySelectorAll<HTMLElement>("div")).find(
        (candidate) => {
          const candidateStyle = window.getComputedStyle(candidate);
          return candidateStyle.position === "absolute" && candidateStyle.zIndex === "-1";
        },
      );
      return {
        text: text(row),
        selected: row.getAttribute("aria-selected") === "true",
        disabled: row.getAttribute("aria-disabled") === "true",
        backgroundColor: style.backgroundColor,
        backgroundLayerColor: backgroundLayer
          ? window.getComputedStyle(backgroundLayer).backgroundColor
          : null,
        color: style.color,
        borderRadius: style.borderRadius,
        height: Number(rect.height.toFixed(2)),
      };
    });

    return {
      role: grid?.getAttribute("role") ?? null,
      ariaLabel: grid?.getAttribute("aria-label") ?? null,
      rowTexts: rowStates.map((row) => row.text),
      selectedTexts: rowStates.filter((row) => row.selected).map((row) => row.text),
      disabledTexts: rowStates.filter((row) => row.disabled).map((row) => row.text),
      rows: rowStates,
      checkboxCount: element.querySelectorAll('input[type="checkbox"], [role="checkbox"]').length,
      buttonCount: element.querySelectorAll("button").length,
      svgCount: element.querySelectorAll("svg").length,
      linkCount: element.querySelectorAll("a[href]").length,
      actionBarVisible: scope.querySelector('[data-comparison-listview-actionbar="true"]') != null,
      emptyText:
        rows.length === 0 && element.textContent?.includes("No documents") ? "No documents" : null,
    };
  });
}

function expectListViewStateToMatch(
  solid: Awaited<ReturnType<typeof listViewState>>,
  react: Awaited<ReturnType<typeof listViewState>>,
) {
  expect(solid.role).toBe(react.role);
  expect(solid.ariaLabel).toBe(react.ariaLabel);
  expect(solid.rowTexts).toEqual(react.rowTexts);
  expect(solid.selectedTexts).toEqual(react.selectedTexts);
  expect(solid.disabledTexts).toEqual(react.disabledTexts);
  expect(solid.checkboxCount).toBe(react.checkboxCount);
  expect(solid.buttonCount).toBe(react.buttonCount);
  expect(solid.svgCount).toBe(react.svgCount);
  expect(solid.linkCount).toBe(react.linkCount);
  expect(solid.actionBarVisible).toBe(react.actionBarVisible);
  expect(solid.emptyText).toBe(react.emptyText);

  for (let index = 0; index < react.rows.length; index += 1) {
    expect(solid.rows[index].backgroundColor).toBe(react.rows[index].backgroundColor);
    expect(solid.rows[index].backgroundLayerColor).toBe(react.rows[index].backgroundLayerColor);
    expect(solid.rows[index].color).toBe(react.rows[index].color);
    expect(solid.rows[index].borderRadius).toBe(react.rows[index].borderRadius);
    expect(Math.abs(solid.rows[index].height - react.rows[index].height)).toBeLessThanOrEqual(2);
  }
}

test.describe("comparison ListView visual parity", () => {
  test("default checkbox collection matches current React Spectrum", async ({ page }) => {
    const fixtures = await listViewFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "ListView default checkbox collection",
      { maxMismatchRatio: 0.34, maxDimensionDelta: 32, pixelThreshold: 64 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      overflowMode: "truncate",
      selectionSource: "defaultSelectedKeys",
      itemCount: "3",
      defaultSelectedKeys: "project-brief",
      showDescriptions: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      overflowMode: "truncate",
      selectionSource: "defaultSelectedKeys",
      itemCount: "3",
      defaultSelectedKeys: "project-brief",
      showDescriptions: true,
    });

    await expect(fixtures.reactPanel.getByRole("grid", { name: "Documents" })).toBeVisible();
    await expect(fixtures.solidPanel.getByRole("grid", { name: "Documents" })).toBeVisible();
    await expect(fixtures.reactMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "project-brief",
    );
    await expect(fixtures.solidMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "project-brief",
    );

    expectListViewStateToMatch(
      await listViewState(fixtures.solidRoot),
      await listViewState(fixtures.reactRoot),
    );
  });

  test("quiet highlight item slots match current React Spectrum", async ({ page }) => {
    const fixtures = await listViewFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=project-brief&selectionStyle=highlight&overflowMode=wrap&isQuiet=true&showIcons=true&itemActionSlot=buttonGroup&trailingIcon=child&disabledItem=quarterly-report",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "ListView quiet highlight icon action slots",
      { maxMismatchRatio: 0.38, maxDimensionDelta: 40, pixelThreshold: 64 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectionStyle: "highlight",
      overflowMode: "wrap",
      isQuiet: true,
      showIcons: true,
      itemActionSlot: "buttonGroup",
      trailingIcon: "child",
      disabledItem: "quarterly-report",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectionStyle: "highlight",
      overflowMode: "wrap",
      isQuiet: true,
      showIcons: true,
      itemActionSlot: "buttonGroup",
      trailingIcon: "child",
      disabledItem: "quarterly-report",
    });

    const reactState = await listViewState(fixtures.reactRoot);
    const solidState = await listViewState(fixtures.solidRoot);
    expect(reactState.svgCount).toBeGreaterThanOrEqual(3);
    expect(solidState.svgCount).toBeGreaterThanOrEqual(3);
    expect(reactState.buttonCount).toBeGreaterThanOrEqual(3);
    expect(solidState.buttonCount).toBeGreaterThanOrEqual(3);
    expectListViewStateToMatch(solidState, reactState);
  });

  test("empty state and ActionBar are wired on both stacks", async ({ page }) => {
    const empty = await listViewFixtures(page, "?itemCount=0&showDescriptions=true");

    expect(await controlProps(empty.reactRoot)).toMatchObject({ itemCount: "0" });
    expect(await controlProps(empty.solidRoot)).toMatchObject({ itemCount: "0" });
    expectListViewStateToMatch(
      await listViewState(empty.solidRoot),
      await listViewState(empty.reactRoot),
    );
    await expect(empty.reactRoot.getByText("No documents")).toBeVisible();
    await expect(empty.solidRoot.getByText("No documents")).toBeVisible();
    await expect(empty.reactRoot.getByRole("row")).toHaveCount(1);
    await expect(empty.solidRoot.getByRole("row")).toHaveCount(1);
    await expect(empty.reactRoot.getByRole("gridcell")).toContainText("No documents");
    await expect(empty.solidRoot.getByRole("gridcell")).toContainText("No documents");

    const actionBar = await listViewFixtures(
      page,
      "?showActionBar=true&selectionSource=selectedKeys&selectedKeys=project-brief",
    );

    await expect(
      actionBar.reactPanel.locator('[data-comparison-listview-actionbar="true"]'),
    ).toBeVisible();
    await expect(
      actionBar.solidPanel.locator('[data-comparison-listview-actionbar="true"]'),
    ).toBeVisible();
    expectListViewStateToMatch(
      await listViewState(actionBar.solidRoot),
      await listViewState(actionBar.reactRoot),
    );

    await actionBar.reactPanel.getByRole("button", { name: "Clear selection" }).click();
    await actionBar.solidPanel.getByRole("button", { name: "Clear selection" }).click();
    await expect(actionBar.reactMarker).toHaveAttribute("data-comparison-selected-keys", "");
    await expect(actionBar.solidMarker).toHaveAttribute("data-comparison-selected-keys", "");
  });

  test("controlled selection and item actions update both stacks", async ({ page }) => {
    const selection = await listViewFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=project-brief&selectionMode=multiple",
    );

    await selection.reactPanel.getByRole("row", { name: /Budget/ }).click();
    await selection.solidPanel.getByRole("row", { name: /Budget/ }).click();
    await expect(selection.reactMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "project-brief,budget",
    );
    await expect(selection.solidMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "project-brief,budget",
    );

    const action = await listViewFixtures(page, "?selectionMode=none&selectionStyle=highlight");
    await action.reactPanel.getByRole("row", { name: /Budget/ }).click();
    await action.solidPanel.getByRole("row", { name: /Budget/ }).click();
    await expect(action.reactMarker).toHaveAttribute("data-comparison-action-key", "budget");
    await expect(action.solidMarker).toHaveAttribute("data-comparison-action-key", "budget");
  });
});
