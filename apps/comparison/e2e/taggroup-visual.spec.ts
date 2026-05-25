import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function tagGroupFixtures(page: Page, query = "") {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/taggroup/${query}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="taggroup"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="taggroup"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactPanel,
    solidPanel,
    reactCanvas: await frameworkCanvas(section, "React Spectrum stack"),
    solidCanvas: await frameworkCanvas(section, "Solidaria stack"),
    reactRoot,
    solidRoot,
  };
}

async function controlProps(root: Locator) {
  return JSON.parse((await root.getAttribute("data-comparison-control-props")) ?? "{}") as Record<
    string,
    string | boolean | number
  >;
}

async function tagGroupState(root: Locator) {
  return root.evaluate((element) => {
    const visibleText = (node: Element | null) => node?.textContent?.replace(/\s+/g, " ").trim();
    const rootRect = element.getBoundingClientRect();
    const list = element.querySelector<HTMLElement>('[role="grid"], [role="group"]');
    const options = Array.from(element.querySelectorAll<HTMLElement>('[role="row"]'));
    const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>("button"));
    const describedText =
      list
        ?.getAttribute("aria-describedby")
        ?.split(/\s+/)
        .map((id) => visibleText(element.ownerDocument.getElementById(id)))
        .filter(Boolean)
        .join(" ") || null;
    const tagOptions = options.map((option) => {
      const rect = option.getBoundingClientRect();
      const style = window.getComputedStyle(option);
      const text = (visibleText(option) ?? "").replace(/\s*Remove\s*$/, "");
      return {
        text,
        selected: option.getAttribute("aria-selected") === "true",
        disabled: option.getAttribute("aria-disabled") === "true",
        allowsRemoving: option.hasAttribute("data-allows-removing"),
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderRadius: style.borderRadius,
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
      };
    });
    const helpText =
      describedText ??
      visibleText(
        Array.from(element.querySelectorAll("p")).find((node) => visibleText(node)?.length),
      ) ??
      null;

    return {
      role: list?.getAttribute("role") ?? null,
      labelledBy: list?.getAttribute("aria-labelledby") ?? null,
      describedBy: list?.getAttribute("aria-describedby") ?? null,
      rootWidth: Number(rootRect.width.toFixed(2)),
      rootHeight: Number(rootRect.height.toFixed(2)),
      options: tagOptions,
      optionTexts: tagOptions.map((option) => option.text),
      selectedTexts: tagOptions.filter((option) => option.selected).map((option) => option.text),
      disabledTexts: tagOptions.filter((option) => option.disabled).map((option) => option.text),
      removeButtonCount: buttons.filter((button) => button.getAttribute("aria-label") === "Remove")
        .length,
      actionButtonText:
        buttons
          .map((button) => button.getAttribute("aria-label") ?? visibleText(button))
          .find((text) => text === "Add tag") ?? null,
      emptyText:
        options.length === 0 && element.textContent?.includes("No categories")
          ? "No categories"
          : null,
      helpText,
      svgCount: element.querySelectorAll("svg").length,
    };
  });
}

function expectTagGroupStateToMatch(
  solid: Awaited<ReturnType<typeof tagGroupState>>,
  react: Awaited<ReturnType<typeof tagGroupState>>,
) {
  expect(solid.role).toBe(react.role);
  expect(Boolean(solid.labelledBy)).toBe(Boolean(react.labelledBy));
  expect(Boolean(solid.describedBy)).toBe(Boolean(react.describedBy));
  expect(solid.optionTexts).toEqual(react.optionTexts);
  expect(solid.selectedTexts).toEqual(react.selectedTexts);
  expect(solid.disabledTexts).toEqual(react.disabledTexts);
  expect(solid.removeButtonCount).toBe(react.removeButtonCount);
  expect(solid.actionButtonText).toBe(react.actionButtonText);
  expect(solid.emptyText).toBe(react.emptyText);
  expect(solid.helpText).toBe(react.helpText);

  for (let index = 0; index < react.options.length; index += 1) {
    expect(solid.options[index].backgroundColor).toBe(react.options[index].backgroundColor);
    expect(solid.options[index].color).toBe(react.options[index].color);
    expect(solid.options[index].borderRadius).toBe(react.options[index].borderRadius);
    expect(Math.abs(solid.options[index].height - react.options[index].height)).toBeLessThanOrEqual(
      2,
    );
  }
}

test.describe("comparison TagGroup visual parity", () => {
  test("default removable collection matches current React Spectrum", async ({ page }) => {
    const fixtures = await tagGroupFixtures(page);

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "TagGroup default removable collection",
      { maxMismatchRatio: 0.28, maxDimensionDelta: 24, pixelThreshold: 64 },
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      label: "Photo categories",
      size: "M",
      selectionMode: "multiple",
      selectionBehavior: "toggle",
      selectionSource: "defaultSelectedKeys",
      defaultSelectedKeys: "landscape",
      allowsRemoving: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      label: "Photo categories",
      size: "M",
      selectionMode: "multiple",
      selectionBehavior: "toggle",
      selectionSource: "defaultSelectedKeys",
      defaultSelectedKeys: "landscape",
      allowsRemoving: true,
    });

    await expect(fixtures.reactPanel.getByRole("grid", { name: "Photo categories" })).toBeVisible();
    await expect(fixtures.solidPanel.getByRole("grid", { name: "Photo categories" })).toBeVisible();
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-selected-keys", "landscape");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-selected-keys", "landscape");

    expectTagGroupStateToMatch(
      await tagGroupState(fixtures.solidRoot),
      await tagGroupState(fixtures.reactRoot),
    );
  });

  test("side label invalid icon state matches current React Spectrum", async ({ page }) => {
    const fixtures = await tagGroupFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=travel&labelPosition=side&labelAlign=end&size=L&contentMode=icon&isEmphasized=true&isInvalid=true&showDescription=true&showErrorMessage=true&disabledItem=portrait",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "TagGroup invalid side-label icon state",
      { maxMismatchRatio: 0.3, maxDimensionDelta: 28, pixelThreshold: 64 },
    );

    await expect(
      fixtures.reactPanel.getByRole("grid", { name: "Photo categories" }),
    ).toHaveAccessibleDescription("Choose at least one usable tag.");
    await expect(
      fixtures.solidPanel.getByRole("grid", { name: "Photo categories" }),
    ).toHaveAccessibleDescription("Choose at least one usable tag.");
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-selected-keys", "travel");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-selected-keys", "travel");

    const reactState = await tagGroupState(fixtures.reactRoot);
    const solidState = await tagGroupState(fixtures.solidRoot);
    expect(reactState.svgCount).toBeGreaterThanOrEqual(4);
    expect(solidState.svgCount).toBeGreaterThanOrEqual(4);
    expectTagGroupStateToMatch(solidState, reactState);
  });

  test("empty state matches current React Spectrum", async ({ page }) => {
    const fixtures = await tagGroupFixtures(
      page,
      "?itemCount=0&withGroupAction=true&allowsRemoving=false&showDescription=true",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      itemCount: "0",
      withGroupAction: true,
      allowsRemoving: false,
      showDescription: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      itemCount: "0",
      withGroupAction: true,
      allowsRemoving: false,
      showDescription: true,
    });
    expectTagGroupStateToMatch(
      await tagGroupState(fixtures.solidRoot),
      await tagGroupState(fixtures.reactRoot),
    );
    await expect(fixtures.reactRoot.getByRole("button", { name: "Add tag" })).toHaveCount(0);
    await expect(fixtures.solidRoot.getByRole("button", { name: "Add tag" })).toHaveCount(0);
  });

  test("group action is wired on both stacks", async ({ page }) => {
    const fixtures = await tagGroupFixtures(
      page,
      "?withGroupAction=true&allowsRemoving=false&showDescription=true",
    );

    expectTagGroupStateToMatch(
      await tagGroupState(fixtures.solidRoot),
      await tagGroupState(fixtures.reactRoot),
    );

    await fixtures.reactRoot.getByRole("button", { name: "Add tag" }).click();
    await fixtures.solidRoot.getByRole("button", { name: "Add tag" }).click();
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-action-count", "1");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-action-count", "1");
  });

  test("controlled selection and removal update both stacks", async ({ page }) => {
    const fixtures = await tagGroupFixtures(
      page,
      "?selectionSource=selectedKeys&selectedKeys=landscape&selectionMode=multiple",
    );

    await fixtures.reactPanel.getByRole("row", { name: /Portrait/ }).click();
    await fixtures.solidPanel.getByRole("row", { name: /Portrait/ }).click();
    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-selected-keys",
      "landscape,portrait",
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-selected-keys",
      "landscape,portrait",
    );

    await fixtures.reactRoot.getByRole("button", { name: "Remove Landscape" }).click();
    await fixtures.solidRoot.getByRole("button", { name: "Remove Landscape" }).click();
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-tag-count", "3");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-tag-count", "3");
    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-selected-keys", "portrait");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-selected-keys", "portrait");

    await clearPointer(page);
    expectTagGroupStateToMatch(
      await tagGroupState(fixtures.solidRoot),
      await tagGroupState(fixtures.reactRoot),
    );
  });
});
