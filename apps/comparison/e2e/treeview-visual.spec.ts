import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function treeViewFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/treeview/${query}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="treeview"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="treeview"]').first();
  const reactMarker = reactPanel.locator("[data-comparison-selected-keys]").first();
  const solidMarker = solidPanel.locator("[data-comparison-selected-keys]").first();
  const reactExpandedMarker = reactPanel.locator("[data-comparison-expanded-keys]").first();
  const solidExpandedMarker = solidPanel.locator("[data-comparison-expanded-keys]").first();

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
    reactExpandedMarker,
    solidExpandedMarker,
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean | number
  >;
}

async function treeViewState(root: Locator) {
  return root.evaluate((element) => {
    const text = (node: Element | null) => node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const treegrid = (
      element.getAttribute("role") === "treegrid"
        ? element
        : element.querySelector('[role="treegrid"]')
    ) as HTMLElement | null;
    const scope = (element.parentElement ?? element) as HTMLElement;
    const rows = Array.from(element.querySelectorAll<HTMLElement>('[role="row"]'));
    const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>("button"));
    const expandButtonLabels = buttons
      .map((button) => button.getAttribute("aria-label") ?? "")
      .filter((label) => label === "Expand" || label === "Collapse");
    const actionButtonLabels = buttons
      .map((button) => button.getAttribute("aria-label") ?? text(button))
      .filter((label) => label !== "Expand" && label !== "Collapse");
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
        ariaLabel: row.getAttribute("aria-label"),
        text: text(row),
        selected: row.getAttribute("aria-selected") === "true",
        disabled: row.getAttribute("aria-disabled") === "true",
        expanded: row.getAttribute("aria-expanded"),
        level: row.getAttribute("aria-level"),
        tagName: row.tagName,
        backgroundColor: style.backgroundColor,
        backgroundLayerColor: backgroundLayer
          ? window.getComputedStyle(backgroundLayer).backgroundColor
          : null,
        color: style.color,
        borderRadius: style.borderRadius,
        height: Number(rect.height.toFixed(2)),
        labelTextNodeCount:
          row.getAttribute("aria-label") == null
            ? 0
            : Array.from(row.querySelectorAll<HTMLElement>("*")).filter((candidate) => {
                const candidateText = candidate.textContent?.replace(/\s+/g, " ").trim() ?? "";
                const candidateStyle = window.getComputedStyle(candidate);
                const candidateRect = candidate.getBoundingClientRect();

                return (
                  candidate.childElementCount === 0 &&
                  candidateText === row.getAttribute("aria-label") &&
                  candidateStyle.display !== "none" &&
                  candidateStyle.visibility !== "hidden" &&
                  candidateRect.width > 0 &&
                  candidateRect.height > 0
                );
              }).length,
      };
    });

    return {
      role: treegrid?.getAttribute("role") ?? null,
      ariaLabel: treegrid?.getAttribute("aria-label") ?? null,
      rowTexts: rowStates.map((row) => row.text),
      selectedTexts: rowStates.filter((row) => row.selected).map((row) => row.text),
      disabledTexts: rowStates.filter((row) => row.disabled).map((row) => row.text),
      expandedTexts: rowStates.filter((row) => row.expanded === "true").map((row) => row.text),
      rows: rowStates,
      checkboxCount: element.querySelectorAll('input[type="checkbox"], [role="checkbox"]').length,
      buttonCount: buttons.length,
      expandButtonCount: expandButtonLabels.length,
      actionButtonLabels,
      svgCount: element.querySelectorAll("svg").length,
      linkedRowCount: element.querySelectorAll('a[href], [role="row"][data-href]').length,
      progressCount: element.querySelectorAll('[role="progressbar"]').length,
      actionBarVisible: scope.querySelector('[data-comparison-treeview-actionbar="true"]') != null,
      emptyText: element.textContent?.includes("No files") ? "No files" : null,
    };
  });
}

function expectTreeViewStateToMatch(
  solid: Awaited<ReturnType<typeof treeViewState>>,
  react: Awaited<ReturnType<typeof treeViewState>>,
) {
  expect(solid.role).toBe(react.role);
  expect(solid.ariaLabel).toBe(react.ariaLabel);
  expect(solid.rowTexts).toEqual(react.rowTexts);
  expect(solid.selectedTexts).toEqual(react.selectedTexts);
  expect(solid.disabledTexts).toEqual(react.disabledTexts);
  expect(solid.expandedTexts).toEqual(react.expandedTexts);
  expect(solid.checkboxCount).toBe(react.checkboxCount);
  expect(solid.buttonCount).toBe(react.buttonCount);
  expect(solid.expandButtonCount).toBe(react.expandButtonCount);
  expect(solid.actionButtonLabels).toEqual(react.actionButtonLabels);
  expect(solid.svgCount).toBe(react.svgCount);
  expect(solid.linkedRowCount).toBe(react.linkedRowCount);
  expect(solid.progressCount).toBe(react.progressCount);
  expect(solid.actionBarVisible).toBe(react.actionBarVisible);
  expect(solid.emptyText).toBe(react.emptyText);

  for (let index = 0; index < react.rows.length; index += 1) {
    expect(solid.rows[index].level).toBe(react.rows[index].level);
    expect(solid.rows[index].expanded).toBe(react.rows[index].expanded);
    expect(solid.rows[index].tagName).toBe(react.rows[index].tagName);
    expect(solid.rows[index].backgroundColor).toBe(react.rows[index].backgroundColor);
    expect(solid.rows[index].backgroundLayerColor).toBe(react.rows[index].backgroundLayerColor);
    expect(solid.rows[index].color).toBe(react.rows[index].color);
    expect(solid.rows[index].borderRadius).toBe(react.rows[index].borderRadius);
    expect(Math.abs(solid.rows[index].height - react.rows[index].height)).toBeLessThanOrEqual(2);
    expect(react.rows[index].labelTextNodeCount).toBe(react.rows[index].ariaLabel ? 1 : 0);
    expect(solid.rows[index].labelTextNodeCount).toBe(solid.rows[index].ariaLabel ? 1 : 0);
  }
}

test.describe("comparison TreeView visual parity", () => {
  test("default checkbox hierarchy matches current React Spectrum", async ({ page }) => {
    const fixtures = await treeViewFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "TreeView default checkbox hierarchy",
      { maxMismatchRatio: 0.42, maxDimensionDelta: 48, pixelThreshold: 64 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      overflowMode: "truncate",
      selectionSource: "defaultSelectedKeys",
      expandedSource: "defaultExpandedKeys",
      itemCount: "3",
      defaultSelectedKeys: "weekly-report",
      defaultExpandedKeys: "documents,project",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectionMode: "multiple",
      selectionStyle: "checkbox",
      overflowMode: "truncate",
      selectionSource: "defaultSelectedKeys",
      expandedSource: "defaultExpandedKeys",
      itemCount: "3",
      defaultSelectedKeys: "weekly-report",
      defaultExpandedKeys: "documents,project",
    });

    await expect(fixtures.reactPanel.getByRole("treegrid", { name: "Files" })).toBeVisible();
    await expect(fixtures.solidPanel.getByRole("treegrid", { name: "Files" })).toBeVisible();
    await expect(fixtures.reactMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "weekly-report",
    );
    await expect(fixtures.solidMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "weekly-report",
    );
    await expect(fixtures.reactExpandedMarker).toHaveAttribute(
      "data-comparison-expanded-keys",
      "documents,project",
    );
    await expect(fixtures.solidExpandedMarker).toHaveAttribute(
      "data-comparison-expanded-keys",
      "documents,project",
    );

    expectTreeViewStateToMatch(
      await treeViewState(fixtures.solidRoot),
      await treeViewState(fixtures.reactRoot),
    );
  });

  test("highlight slots links and load more match current React Spectrum", async ({ page }) => {
    const fixtures = await treeViewFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=budget&selectionStyle=highlight&overflowMode=wrap&showIcons=true&itemActionSlot=buttonGroup&linkItem=documents&disabledItem=image-1&expandedSource=expandedKeys&expandedKeys=documents,project,photos&showLoadMore=true&loadingState=loadingMore",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "TreeView highlight icon action link load more",
      { maxMismatchRatio: 0.48, maxDimensionDelta: 56, pixelThreshold: 64 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectionStyle: "highlight",
      overflowMode: "wrap",
      showIcons: true,
      itemActionSlot: "buttonGroup",
      linkItem: "documents",
      disabledItem: "image-1",
      showLoadMore: true,
      loadingState: "loadingMore",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectionStyle: "highlight",
      overflowMode: "wrap",
      showIcons: true,
      itemActionSlot: "buttonGroup",
      linkItem: "documents",
      disabledItem: "image-1",
      showLoadMore: true,
      loadingState: "loadingMore",
    });

    const reactState = await treeViewState(fixtures.reactRoot);
    const solidState = await treeViewState(fixtures.solidRoot);
    expect(reactState.svgCount).toBeGreaterThanOrEqual(3);
    expect(solidState.svgCount).toBeGreaterThanOrEqual(3);
    expect(reactState.buttonCount).toBeGreaterThanOrEqual(3);
    expect(solidState.buttonCount).toBeGreaterThanOrEqual(3);
    expect(reactState.linkedRowCount).toBe(1);
    expect(solidState.linkedRowCount).toBe(1);
    expect(reactState.progressCount).toBe(1);
    expect(solidState.progressCount).toBe(1);
    expectTreeViewStateToMatch(solidState, reactState);
  });

  test("empty state and ActionBar are wired on both stacks", async ({ page }) => {
    const empty = await treeViewFixtures(page, "?itemCount=0");

    expect(await controlProps(empty.reactRoot)).toMatchObject({ itemCount: "0" });
    expect(await controlProps(empty.solidRoot)).toMatchObject({ itemCount: "0" });
    expectTreeViewStateToMatch(
      await treeViewState(empty.solidRoot),
      await treeViewState(empty.reactRoot),
    );
    await expect(empty.reactRoot.getByText("No files")).toBeVisible();
    await expect(empty.solidRoot.getByText("No files")).toBeVisible();
    await expect(empty.reactRoot.getByRole("row")).toHaveCount(1);
    await expect(empty.solidRoot.getByRole("row")).toHaveCount(1);
    await expect(empty.reactRoot.getByRole("gridcell")).toContainText("No files");
    await expect(empty.solidRoot.getByRole("gridcell")).toContainText("No files");

    const actionBar = await treeViewFixtures(
      page,
      "?showActionBar=true&selectionSource=selectedKeys&selectedKeys=weekly-report",
    );

    await expect(
      actionBar.reactPanel.locator('[data-comparison-treeview-actionbar="true"]'),
    ).toBeVisible();
    await expect(
      actionBar.solidPanel.locator('[data-comparison-treeview-actionbar="true"]'),
    ).toBeVisible();
    expectTreeViewStateToMatch(
      await treeViewState(actionBar.solidRoot),
      await treeViewState(actionBar.reactRoot),
    );

    await actionBar.reactPanel.getByRole("button", { name: "Clear selection" }).click();
    await actionBar.solidPanel.getByRole("button", { name: "Clear selection" }).click();
    await expect(actionBar.reactMarker).toHaveAttribute("data-comparison-selected-keys", "");
    await expect(actionBar.solidMarker).toHaveAttribute("data-comparison-selected-keys", "");
  });

  test("controlled selection expansion and item actions update both stacks", async ({ page }) => {
    const expansion = await treeViewFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=weekly-report&expandedSource=expandedKeys&expandedKeys=documents,project",
    );

    await expansion.reactPanel
      .getByRole("row", { name: /Photos/ })
      .getByRole("button")
      .first()
      .click();
    await expansion.solidPanel
      .getByRole("row", { name: /Photos/ })
      .getByRole("button")
      .first()
      .click();
    await expect(expansion.reactExpandedMarker).toHaveAttribute(
      "data-comparison-expanded-keys",
      "documents,project,photos",
    );
    await expect(expansion.solidExpandedMarker).toHaveAttribute(
      "data-comparison-expanded-keys",
      "documents,project,photos",
    );

    const selection = await treeViewFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=weekly-report&expandedSource=expandedKeys&expandedKeys=documents,project",
    );
    await selection.reactPanel.getByRole("row", { name: /Budget/ }).click();
    await selection.solidPanel.getByRole("row", { name: /Budget/ }).click();
    await expect(selection.reactMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "weekly-report,budget",
    );
    await expect(selection.solidMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "weekly-report,budget",
    );

    const action = await treeViewFixtures(
      page,
      "?selectionMode=none&selectionStyle=highlight&expandedSource=expandedKeys&expandedKeys=documents,project",
    );
    await action.reactPanel.getByRole("row", { name: /Budget/ }).click();
    await action.solidPanel.getByRole("row", { name: /Budget/ }).click();
    await expect(action.reactMarker).toHaveAttribute("data-comparison-action-key", "budget");
    await expect(action.solidMarker).toHaveAttribute("data-comparison-action-key", "budget");
  });
});
