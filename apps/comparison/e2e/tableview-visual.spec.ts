import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function tableViewFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/tableview/${query}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="tableview"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="tableview"]').first();
  const reactMarker = reactPanel.locator("[data-comparison-selected-keys]").first();
  const solidMarker = solidPanel.locator("[data-comparison-selected-keys]").first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();
  await clearPointer(page);
  await Promise.all([waitForTableViewRender(reactRoot), waitForTableViewRender(solidRoot)]);

  return {
    reactPanel,
    solidPanel,
    reactRoot,
    solidRoot,
    reactMarker,
    solidMarker,
  };
}

async function waitForTableViewRender(root: Locator) {
  await root.evaluate(async (element) => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    const animations = element.getAnimations({ subtree: true });
    await Promise.race([
      Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))),
      new Promise((resolve) => window.setTimeout(resolve, 300)),
    ]);

    await new Promise(requestAnimationFrame);
  });
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean | number
  >;
}

async function sortMarker(root: Locator) {
  return (await root.getAttribute("data-comparison-sort-descriptor")) ?? "";
}

async function tableViewState(root: Locator) {
  return root.evaluate((element) => {
    const text = (node: Element | null) => node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const grid = (
      element.getAttribute("role") === "grid" ? element : element.querySelector('[role="grid"]')
    ) as HTMLElement | null;
    const visualRoot = (element.querySelector("[data-table-view-shell]") ??
      grid) as HTMLElement | null;
    const columnHeaders = Array.from(
      element.querySelectorAll<HTMLElement>('[role="columnheader"]'),
    );
    const rows = Array.from(element.querySelectorAll<HTMLElement>('[role="row"]'));
    const bodyRows = rows.filter(
      (row) =>
        row.querySelector('[role="gridcell"], [role="rowheader"]') &&
        !row.querySelector('[role="columnheader"]'),
    );
    const rowStates = bodyRows.map((row) => {
      const rect = row.getBoundingClientRect();
      const style = window.getComputedStyle(row);
      const cells = Array.from(
        row.querySelectorAll<HTMLElement>('[role="rowheader"], [role="gridcell"]'),
      );
      const contentCell = cells.find((cell) => text(cell)) ?? cells[0] ?? row;
      const contentStyle = window.getComputedStyle(contentCell);
      return {
        text: text(row),
        selected:
          row.getAttribute("aria-selected") === "true" ||
          row.getAttribute("data-selected") === "true",
        disabled:
          row.getAttribute("aria-disabled") === "true" ||
          row.getAttribute("data-disabled") === "true",
        backgroundColor: style.backgroundColor,
        color: contentStyle.color,
        height: Number(rect.height.toFixed(2)),
        isEmptyState: text(row).includes("No documents"),
      };
    });
    const gridStyle = visualRoot ? window.getComputedStyle(visualRoot) : null;

    return {
      role: grid?.getAttribute("role") ?? null,
      ariaLabel: grid?.getAttribute("aria-label") ?? null,
      headerTexts: columnHeaders.map((header) => text(header)).filter(Boolean),
      rowTexts: rowStates.map((row) => row.text),
      selectedTexts: rowStates.filter((row) => row.selected).map((row) => row.text),
      disabledTexts: rowStates.filter((row) => row.disabled).map((row) => row.text),
      rows: rowStates,
      checkboxCount: element.querySelectorAll('input[type="checkbox"], [role="checkbox"]').length,
      linkCount: element.querySelectorAll("a[href]").length,
      resizerCount: element.querySelectorAll('input[type="range"][aria-label="Resizer"]').length,
      emptyText: text(element).includes("No documents") ? "No documents" : null,
      backgroundColor: gridStyle?.backgroundColor ?? null,
      borderRadius: gridStyle?.borderRadius ?? null,
    };
  });
}

async function focusBodyRow(page: Page, root: Locator, name: RegExp) {
  const row = root.getByRole("row", { name }).first();
  await page.keyboard.press("Tab");
  await row.focus();
  await expect
    .poll(() => row.evaluate((element) => element.hasAttribute("data-focus-visible")))
    .toBe(true);
  return row;
}

async function focusBodyRowHeader(page: Page, root: Locator, name: RegExp) {
  const row = root.getByRole("row", { name }).first();
  const cell = row.getByRole("rowheader").first();
  await page.keyboard.press("Tab");
  await cell.focus();
  await expect
    .poll(() => cell.evaluate((element) => element.hasAttribute("data-focus-visible")))
    .toBe(true);
  return cell;
}

async function rowFocusRingContract(row: Locator) {
  return row.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const after = window.getComputedStyle(element, "::after");

    return {
      focusVisible: element.hasAttribute("data-focus-visible"),
      topFocusRing: style.getPropertyValue("--topFocusRing").trim(),
      bottomPosition: style.getPropertyValue("--bottomPosition").trim(),
      focusRingColor: style.getPropertyValue("--focusRingColor").trim(),
      afterContent: after.content,
      afterPosition: after.position,
      afterTop: after.top,
      afterBottom: after.bottom,
      afterZIndex: after.zIndex,
      afterOutlineStyle: after.outlineStyle,
      afterOutlineWidth: after.outlineWidth,
      afterOutlineOffset: after.outlineOffset,
      afterPointerEvents: after.pointerEvents,
    };
  });
}

async function cellFocusRingContract(cell: Locator) {
  return cell.evaluate((element) => {
    const row = element.closest<HTMLElement>('[role="row"]');
    const directPresentationChildren = Array.from(element.children).filter(
      (child) => child.getAttribute("role") === "presentation",
    );
    const ring =
      directPresentationChildren.find(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && window.getComputedStyle(child).position === "absolute",
      ) ?? null;
    const cellRect = element.getBoundingClientRect();
    const ringRect = ring?.getBoundingClientRect() ?? null;
    const ringStyle = ring ? window.getComputedStyle(ring) : null;
    const rowStyle = row ? window.getComputedStyle(row) : null;

    return {
      focusVisible: element.hasAttribute("data-focus-visible"),
      presentationChildCount: directPresentationChildren.length,
      topFocusRing: rowStyle?.getPropertyValue("--topFocusRing").trim() ?? "",
      bottomPosition: rowStyle?.getPropertyValue("--bottomPosition").trim() ?? "",
      ringPosition: ringStyle?.position ?? null,
      ringPointerEvents: ringStyle?.pointerEvents ?? null,
      ringOutlineStyle: ringStyle?.outlineStyle ?? null,
      ringOutlineWidth: ringStyle?.outlineWidth ?? null,
      ringOutlineOffset: ringStyle?.outlineOffset ?? null,
      ringTop: ringStyle?.top ?? null,
      ringBottom: ringStyle?.bottom ?? null,
      ringTopDelta: ringRect != null ? Number((ringRect.top - cellRect.top).toFixed(2)) : null,
      ringBottomDelta:
        ringRect != null ? Number((ringRect.bottom - cellRect.bottom).toFixed(2)) : null,
    };
  });
}

function expectTableViewStateToMatch(
  solid: Awaited<ReturnType<typeof tableViewState>>,
  react: Awaited<ReturnType<typeof tableViewState>>,
) {
  expect(solid.role).toBe(react.role);
  expect(solid.ariaLabel).toBe(react.ariaLabel);
  expect(solid.headerTexts).toEqual(react.headerTexts);
  expect(solid.rowTexts).toEqual(react.rowTexts);
  expect(solid.selectedTexts).toEqual(react.selectedTexts);
  expect(solid.disabledTexts).toEqual(react.disabledTexts);
  expect(solid.checkboxCount).toBe(react.checkboxCount);
  expect(solid.linkCount).toBe(react.linkCount);
  expect(solid.emptyText).toBe(react.emptyText);
  expect(solid.backgroundColor).toBe(react.backgroundColor);
  expect(solid.borderRadius).toBe(react.borderRadius);

  for (let index = 0; index < react.rows.length; index += 1) {
    expect(solid.rows[index].color).toBe(react.rows[index].color);
    if (!react.rows[index].isEmptyState && !solid.rows[index].isEmptyState) {
      expect(Math.abs(solid.rows[index].height - react.rows[index].height)).toBeLessThanOrEqual(3);
    }
  }
}

test.describe("comparison TableView visual parity", () => {
  test("default collection matches current React Spectrum", async ({ page }) => {
    const fixtures = await tableViewFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "TableView default collection",
      { maxMismatchRatio: 0.42, maxDimensionDelta: 48, pixelThreshold: 72 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      density: "regular",
      overflowMode: "truncate",
      selectionMode: "multiple",
      selectionSource: "defaultSelectedKeys",
      itemCount: "3",
      columnSet: "all",
      extraRow: false,
      defaultSelectedKeys: "project-brief",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      density: "regular",
      overflowMode: "truncate",
      selectionMode: "multiple",
      selectionSource: "defaultSelectedKeys",
      itemCount: "3",
      columnSet: "all",
      extraRow: false,
      defaultSelectedKeys: "project-brief",
    });

    await expect(
      fixtures.reactPanel.getByRole("grid", { name: "Project documents" }),
    ).toBeVisible();
    await expect(
      fixtures.solidPanel.getByRole("grid", { name: "Project documents" }),
    ).toBeVisible();
    await expect(fixtures.reactMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "project-brief",
    );
    await expect(fixtures.solidMarker).toHaveAttribute(
      "data-comparison-selected-keys",
      "project-brief",
    );

    expectTableViewStateToMatch(
      await tableViewState(fixtures.solidRoot),
      await tableViewState(fixtures.reactRoot),
    );
  });

  test("quiet wrap sorting resizing and cell options match current React Spectrum", async ({
    page,
  }) => {
    const fixtures = await tableViewFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=project-brief&density=spacious&overflowMode=wrap&isQuiet=true&columnSet=withoutOwner&extraRow=true&sortColumn=status&sortDirection=descending&allowsResizing=true&showDividers=true&disabledItem=quarterly-report",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "TableView quiet sorting resizing dividers",
      { maxMismatchRatio: 0.48, maxDimensionDelta: 56, pixelThreshold: 72 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      density: "spacious",
      overflowMode: "wrap",
      isQuiet: true,
      columnSet: "withoutOwner",
      extraRow: true,
      sortColumn: "status",
      sortDirection: "descending",
      allowsResizing: true,
      showDividers: true,
      disabledItem: "quarterly-report",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      density: "spacious",
      overflowMode: "wrap",
      isQuiet: true,
      columnSet: "withoutOwner",
      extraRow: true,
      sortColumn: "status",
      sortDirection: "descending",
      allowsResizing: true,
      showDividers: true,
      disabledItem: "quarterly-report",
    });
    expect(await sortMarker(fixtures.reactRoot)).toBe("status:descending");
    expect(await sortMarker(fixtures.solidRoot)).toBe("status:descending");

    const reactState = await tableViewState(fixtures.reactRoot);
    const solidState = await tableViewState(fixtures.solidRoot);
    expect(solidState.resizerCount).toBe(reactState.resizerCount);
    expectTableViewStateToMatch(solidState, reactState);
  });

  test("focus ring overlay geometry follows the vendored upstream branch", async ({ page }) => {
    const fixtures = await tableViewFixtures(page, "?selectionMode=none&showDividers=true");
    const budgetRow = /Budget\.xlsx/;

    // The vendored upstream source for this port is S2 1.5. The comparison app
    // still installs S2 1.3, which has CellFocusRing but not row focusIndicator
    // vars, so this guards the fixture drift instead of claiming false equality.
    const reactRow = await focusBodyRow(page, fixtures.reactRoot, budgetRow);
    const reactRowFocusRing = await rowFocusRingContract(reactRow);
    await reactRow.evaluate((element) => element.blur());

    const solidRow = await focusBodyRow(page, fixtures.solidRoot, budgetRow);
    const solidRowFocusRing = await rowFocusRingContract(solidRow);
    await solidRow.evaluate((element) => element.blur());

    expect(reactRowFocusRing.focusVisible).toBe(true);
    expect(reactRowFocusRing.topFocusRing).toBe("");
    expect(reactRowFocusRing.bottomPosition).toBe("");
    expect(reactRowFocusRing.afterContent).toBe("none");
    expect(reactRowFocusRing.afterPosition).toBe("static");

    expect(solidRowFocusRing.focusVisible).toBe(true);
    expect(solidRowFocusRing.topFocusRing).toBe("-1px");
    expect(solidRowFocusRing.bottomPosition).toBe("-1px");
    expect(solidRowFocusRing.afterContent).not.toBe("none");
    expect(solidRowFocusRing.afterPosition).toBe("absolute");
    expect(solidRowFocusRing.afterTop).toBe("-1px");
    expect(solidRowFocusRing.afterBottom).toBe("-1px");
    expect(solidRowFocusRing.afterZIndex).toBe("3");
    expect(solidRowFocusRing.afterOutlineWidth).toBe("2px");
    expect(solidRowFocusRing.afterOutlineOffset).toBe("-2px");
    expect(solidRowFocusRing.afterPointerEvents).toBe("none");

    const reactCell = await focusBodyRowHeader(page, fixtures.reactRoot, budgetRow);
    const reactCellFocusRing = await cellFocusRingContract(reactCell);
    await reactCell.evaluate((element) => element.blur());

    const solidCell = await focusBodyRowHeader(page, fixtures.solidRoot, budgetRow);
    const solidCellFocusRing = await cellFocusRingContract(solidCell);

    expect(reactCellFocusRing.focusVisible).toBe(true);
    expect(reactCellFocusRing.presentationChildCount).toBe(1);
    expect(reactCellFocusRing.topFocusRing).toBe("");
    expect(reactCellFocusRing.bottomPosition).toBe("");
    expect(reactCellFocusRing.ringTop).toBe("0px");
    expect(reactCellFocusRing.ringTopDelta).toBe(0);

    expect(solidCellFocusRing.focusVisible).toBe(reactCellFocusRing.focusVisible);
    expect(solidCellFocusRing.presentationChildCount).toBe(
      reactCellFocusRing.presentationChildCount,
    );
    expect(solidCellFocusRing.ringPosition).toBe(reactCellFocusRing.ringPosition);
    expect(solidCellFocusRing.ringPointerEvents).toBe(reactCellFocusRing.ringPointerEvents);
    expect(solidCellFocusRing.ringOutlineStyle).toBe(reactCellFocusRing.ringOutlineStyle);
    expect(solidCellFocusRing.ringOutlineWidth).toBe(reactCellFocusRing.ringOutlineWidth);
    expect(solidCellFocusRing.ringOutlineOffset).toBe(reactCellFocusRing.ringOutlineOffset);
    expect(solidCellFocusRing.ringBottom).toBe(reactCellFocusRing.ringBottom);
    expect(solidCellFocusRing.ringBottomDelta).toBe(reactCellFocusRing.ringBottomDelta);
    expect(solidCellFocusRing.topFocusRing).toBe("-1px");
    expect(solidCellFocusRing.bottomPosition).toBe("-1px");
    expect(solidCellFocusRing.ringTop).toBe("-1px");
    expect(solidCellFocusRing.ringPosition).toBe("absolute");
    expect(solidCellFocusRing.ringOutlineWidth).toBe("2px");
    expect(solidCellFocusRing.ringOutlineOffset).toBe("-2px");
    expect(solidCellFocusRing.ringTopDelta).toBe(-1);
  });

  test("empty state and ActionBar are wired on both stacks", async ({ page }) => {
    const empty = await tableViewFixtures(page, "?itemCount=0");

    expect(await controlProps(empty.reactRoot)).toMatchObject({ itemCount: "0" });
    expect(await controlProps(empty.solidRoot)).toMatchObject({ itemCount: "0" });
    await expect(empty.reactRoot.getByText("No documents")).toBeVisible();
    await expect(empty.solidRoot.getByText("No documents")).toBeVisible();
    expectTableViewStateToMatch(
      await tableViewState(empty.solidRoot),
      await tableViewState(empty.reactRoot),
    );

    const actionBar = await tableViewFixtures(
      page,
      "?showActionBar=true&selectionSource=selectedKeys&selectedKeys=project-brief",
    );

    await expect(
      actionBar.reactPanel.locator('[data-comparison-tableview-actionbar="true"]'),
    ).toBeVisible();
    await expect(
      actionBar.solidPanel.locator('[data-comparison-tableview-actionbar="true"]'),
    ).toBeVisible();
    expectTableViewStateToMatch(
      await tableViewState(actionBar.solidRoot),
      await tableViewState(actionBar.reactRoot),
    );

    await actionBar.reactPanel.getByRole("button", { name: "Clear selection" }).click();
    await actionBar.solidPanel.getByRole("button", { name: "Clear selection" }).click();
    await expect(actionBar.reactMarker).toHaveAttribute("data-comparison-selected-keys", "");
    await expect(actionBar.solidMarker).toHaveAttribute("data-comparison-selected-keys", "");
  });

  test("controlled selection row actions sorting interaction and links update both stacks", async ({
    page,
  }) => {
    const selection = await tableViewFixtures(
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

    const action = await tableViewFixtures(page, "?selectionMode=none&rowLinks=true");
    await expect(action.reactMarker).toHaveAttribute("data-comparison-selected-keys", "");
    await expect(action.solidMarker).toHaveAttribute("data-comparison-selected-keys", "");
    expectTableViewStateToMatch(
      await tableViewState(action.solidRoot),
      await tableViewState(action.reactRoot),
    );
    await action.reactPanel.getByRole("row", { name: /Budget/ }).click();
    await action.solidPanel.getByRole("row", { name: /Budget/ }).click();
    await expect(action.reactRoot).toHaveAttribute("data-comparison-action-key", "budget");
    await expect(action.solidRoot).toHaveAttribute("data-comparison-action-key", "budget");

    const sorting = await tableViewFixtures(
      page,
      "?sortColumn=name&sortDirection=ascending&selectionMode=none",
    );
    await sorting.reactPanel.getByRole("columnheader", { name: /Name/ }).click();
    await sorting.solidPanel.getByRole("columnheader", { name: /Name/ }).click();
    await expect(sorting.reactRoot).toHaveAttribute(
      "data-comparison-sort-descriptor",
      "name:descending",
    );
    await expect(sorting.solidRoot).toHaveAttribute(
      "data-comparison-sort-descriptor",
      "name:descending",
    );
  });
});
