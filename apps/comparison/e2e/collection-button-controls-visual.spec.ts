import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

async function collectionFixtures(
  page: Page,
  slug: "segmentedcontrol" | "selectboxgroup",
  query: string,
) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/${slug}/${query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);
  await page.waitForTimeout(120);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator(`[data-comparison-control-root="${slug}"]`).first();
  const solidRoot = solidPanel.locator(`[data-comparison-control-root="${slug}"]`).first();

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
    string | boolean
  >;
}

async function segmentedControlGeometry(root: Locator) {
  return root.evaluate((element) => {
    const radios = Array.from(element.querySelectorAll<HTMLElement>('[role="radio"]'));
    const selected = radios.find((radio) => radio.getAttribute("aria-checked") === "true");
    const selectedRect = selected?.getBoundingClientRect();
    const indicator = selected
      ? Array.from(selected.querySelectorAll<HTMLElement>("*")).find((candidate) => {
          const style = window.getComputedStyle(candidate);
          const rect = candidate.getBoundingClientRect();
          return (
            style.position === "absolute" &&
            selectedRect != null &&
            rect.width >= selectedRect.width * 0.8 &&
            rect.height >= selectedRect.height * 0.8
          );
        })
      : null;
    const indicatorRect = indicator?.getBoundingClientRect();
    const itemWidths = radios.map((radio) =>
      Number(radio.getBoundingClientRect().width.toFixed(4)),
    );

    return {
      role: element.getAttribute("role"),
      rootBackground: window.getComputedStyle(element).backgroundColor,
      selectedName: selected?.textContent?.trim() ?? "",
      selectedWidth: selectedRect == null ? null : Number(selectedRect.width.toFixed(4)),
      indicatorWidth: indicatorRect == null ? null : Number(indicatorRect.width.toFixed(4)),
      indicatorHeight: indicatorRect == null ? null : Number(indicatorRect.height.toFixed(4)),
      indicatorLeftDelta:
        indicatorRect == null || selectedRect == null
          ? null
          : Number((indicatorRect.left - selectedRect.left).toFixed(4)),
      indicatorTopDelta:
        indicatorRect == null || selectedRect == null
          ? null
          : Number((indicatorRect.top - selectedRect.top).toFixed(4)),
      itemWidths,
    };
  });
}

async function selectBoxGeometry(root: Locator) {
  return root.evaluate((element) => {
    const options = Array.from(element.querySelectorAll<HTMLElement>('[role="option"]'));
    const selectedOptions = options.filter(
      (option) => option.getAttribute("aria-selected") === "true",
    );
    const firstSelected = selectedOptions[0];
    const rootRect = element.getBoundingClientRect();
    const rootStyle = window.getComputedStyle(element);
    const optionRect = firstSelected?.getBoundingClientRect();
    const label = firstSelected?.querySelector<HTMLElement>(
      '[slot="label"], [data-rsp-slot="label"]',
    );
    const description = firstSelected?.querySelector<HTMLElement>(
      '[slot="description"], [data-rsp-slot="description"]',
    );
    const checkboxIcon = firstSelected?.querySelector<SVGElement>("svg");
    const labelRect = label?.getBoundingClientRect();
    const descriptionRect = description?.getBoundingClientRect();
    const iconRect = checkboxIcon?.getBoundingClientRect();

    return {
      role: element.getAttribute("role"),
      rootWidth: Number(rootRect.width.toFixed(4)),
      rootMargin: rootStyle.margin,
      rootPadding: rootStyle.padding,
      rootListStyleType: rootStyle.listStyleType,
      selectedCount: selectedOptions.length,
      optionWidth: optionRect == null ? null : Number(optionRect.width.toFixed(4)),
      optionHeight: optionRect == null ? null : Number(optionRect.height.toFixed(4)),
      labelLeft:
        labelRect == null || optionRect == null
          ? null
          : Number((labelRect.left - optionRect.left).toFixed(4)),
      descriptionLeft:
        descriptionRect == null || optionRect == null
          ? null
          : Number((descriptionRect.left - optionRect.left).toFixed(4)),
      labelDescriptionLeftDelta:
        labelRect == null || descriptionRect == null
          ? null
          : Number((labelRect.left - descriptionRect.left).toFixed(4)),
      labelDescriptionGap:
        labelRect == null || descriptionRect == null
          ? null
          : Number((descriptionRect.top - labelRect.bottom).toFixed(4)),
      checkboxWidth: iconRect == null ? null : Number(iconRect.width.toFixed(4)),
      checkboxHeight: iconRect == null ? null : Number(iconRect.height.toFixed(4)),
      checkboxLeft:
        iconRect == null || optionRect == null
          ? null
          : Number((iconRect.left - optionRect.left).toFixed(4)),
      checkboxTop:
        iconRect == null || optionRect == null
          ? null
          : Number((iconRect.top - optionRect.top).toFixed(4)),
      optionLeftInRoot:
        optionRect == null ? null : Number((optionRect.left - rootRect.left).toFixed(4)),
    };
  });
}

async function selectBoxIllustrationAndDisabledState(root: Locator) {
  return root.evaluate((element) => {
    const starter = Array.from(element.querySelectorAll<HTMLElement>('[role="option"]')).find(
      (option) => option.textContent?.includes("Starter"),
    );
    const pro = Array.from(element.querySelectorAll<HTMLElement>('[role="option"]')).find(
      (option) => option.textContent?.includes("Pro"),
    );
    const starterRect = starter?.getBoundingClientRect();
    const illustration =
      starter?.querySelector<HTMLElement>(
        '[slot="illustration"], [data-slot="illustration"], [data-rsp-slot="illustration"], img',
      ) ??
      Array.from(starter?.querySelectorAll<SVGElement>("svg") ?? []).find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return rect.width >= 18 && rect.height >= 18;
      });
    const illustrationRect = illustration?.getBoundingClientRect();
    const proLabel = pro?.querySelector<HTMLElement>('[slot="label"], [data-rsp-slot="label"]');

    return {
      starterHasIllustration: !!illustration,
      illustrationWidth:
        illustrationRect == null ? null : Number(illustrationRect.width.toFixed(4)),
      illustrationHeight:
        illustrationRect == null ? null : Number(illustrationRect.height.toFixed(4)),
      illustrationLeft:
        illustrationRect == null || starterRect == null
          ? null
          : Number((illustrationRect.left - starterRect.left).toFixed(4)),
      illustrationTop:
        illustrationRect == null || starterRect == null
          ? null
          : Number((illustrationRect.top - starterRect.top).toFixed(4)),
      proDisabled: pro?.getAttribute("aria-disabled"),
      proSelected: pro?.getAttribute("aria-selected"),
      proLabelColor: proLabel == null ? null : window.getComputedStyle(proLabel).color,
    };
  });
}

async function selectBoxHoverColors(page: Page, root: Locator) {
  const option = root.locator('[role="option"]').filter({ hasText: "Pro" }).first();
  const label = option.locator('[slot="label"], [data-rsp-slot="label"]').first();
  const before = await label.evaluate((element) => window.getComputedStyle(element).color);
  await option.hover();
  await page.waitForTimeout(80);
  const after = await label.evaluate((element) => window.getComputedStyle(element).color);
  await clearPointer(page);

  return { before, after };
}

function expectNear(
  received: number | null,
  expected: number | null,
  tolerance: number,
  label: string,
) {
  expect(received, `${label} should be present`).not.toBeNull();
  expect(expected, `${label} reference should be present`).not.toBeNull();
  expect(Math.abs((received ?? 0) - (expected ?? 0)), label).toBeLessThanOrEqual(tolerance);
}

test.describe("comparison collection button controls visual parity", () => {
  test("SegmentedControl justified selected state has committed pair screenshots", async ({
    page,
  }) => {
    const fixtures = await collectionFixtures(
      page,
      "segmentedcontrol",
      "?selectedKey=grid&isJustified=true",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "SegmentedControl justified selected state",
      "segmentedcontrol-justified-selected",
      { maxMismatchRatio: 0.24, maxDimensionDelta: 32, pixelThreshold: 64 },
    );
  });

  test("SegmentedControl exposes selected indicator geometry like React Spectrum", async ({
    page,
  }) => {
    const fixtures = await collectionFixtures(
      page,
      "segmentedcontrol",
      "?selectedKey=grid&isJustified=true",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectedKey: "grid",
      isJustified: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectedKey: "grid",
      isJustified: true,
    });

    await expect(
      fixtures.reactPanel.locator("[data-comparison-selected-key]").first(),
    ).toHaveAttribute("data-comparison-selected-key", "grid");
    await expect(
      fixtures.solidPanel.locator("[data-comparison-selected-key]").first(),
    ).toHaveAttribute("data-comparison-selected-key", "grid");

    const react = await segmentedControlGeometry(fixtures.reactRoot);
    const solid = await segmentedControlGeometry(fixtures.solidRoot);

    expect(react.role).toBe("radiogroup");
    expect(solid.role).toBe("radiogroup");
    expect(solid.rootBackground).toBe(react.rootBackground);
    expect(react.selectedName).toBe("Grid");
    expect(solid.selectedName).toBe("Grid");
    expectNear(solid.selectedWidth, react.selectedWidth, 1, "SegmentedControl selected item width");
    expectNear(solid.indicatorWidth, react.indicatorWidth, 1, "SegmentedControl indicator width");
    expectNear(
      solid.indicatorHeight,
      react.indicatorHeight,
      1,
      "SegmentedControl indicator height",
    );
    expectNear(
      solid.indicatorLeftDelta,
      react.indicatorLeftDelta,
      1,
      "SegmentedControl indicator left",
    );
    expectNear(
      solid.indicatorTopDelta,
      react.indicatorTopDelta,
      1,
      "SegmentedControl indicator top",
    );
    expect(Math.max(...solid.itemWidths) - Math.min(...solid.itemWidths)).toBeLessThanOrEqual(1);
  });

  test("SelectBoxGroup horizontal multiple state has committed pair screenshots", async ({
    page,
  }) => {
    const fixtures = await collectionFixtures(
      page,
      "selectboxgroup",
      "?selectionMode=multiple&selectedKeys=starter,pro&orientation=horizontal",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "SelectBoxGroup horizontal multiple state",
      "selectboxgroup-horizontal-multiple",
      { maxMismatchRatio: 0.18, maxDimensionDelta: 48, pixelThreshold: 64 },
    );
  });

  test("SelectBoxGroup renders multi-select indicators and slots like React Spectrum", async ({
    page,
  }) => {
    const fixtures = await collectionFixtures(
      page,
      "selectboxgroup",
      "?selectionMode=multiple&selectedKeys=starter,pro&orientation=horizontal",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectionMode: "multiple",
      orientation: "horizontal",
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectionMode: "multiple",
      orientation: "horizontal",
    });

    await expect(
      fixtures.reactPanel.locator("[data-comparison-selected-keys]").first(),
    ).toHaveAttribute("data-comparison-selected-keys", "starter,pro");
    await expect(
      fixtures.solidPanel.locator("[data-comparison-selected-keys]").first(),
    ).toHaveAttribute("data-comparison-selected-keys", "starter,pro");

    const react = await selectBoxGeometry(fixtures.reactRoot);
    const solid = await selectBoxGeometry(fixtures.solidRoot);

    expect(react.role).toBe("listbox");
    expect(solid.role).toBe("listbox");
    expect(react.selectedCount).toBe(2);
    expect(solid.selectedCount).toBe(2);
    expectNear(solid.rootWidth, react.rootWidth, 1, "SelectBoxGroup root width");
    expect(solid.rootMargin).toBe("0px");
    expect(solid.rootPadding).toBe("0px");
    expect(solid.rootListStyleType).toBe("none");
    expectNear(solid.optionLeftInRoot, react.optionLeftInRoot, 1, "SelectBox option root offset");
    expectNear(solid.optionWidth, react.optionWidth, 4, "SelectBox option width");
    expectNear(solid.optionHeight, react.optionHeight, 4, "SelectBox option height");
    expectNear(solid.checkboxWidth, react.checkboxWidth, 1, "SelectBox checkbox icon width");
    expectNear(solid.checkboxHeight, react.checkboxHeight, 1, "SelectBox checkbox icon height");
    expectNear(solid.checkboxLeft, react.checkboxLeft, 2, "SelectBox checkbox icon left");
    expectNear(solid.checkboxTop, react.checkboxTop, 2, "SelectBox checkbox icon top");
    expectNear(
      solid.labelDescriptionLeftDelta,
      react.labelDescriptionLeftDelta,
      1,
      "SelectBox text left alignment",
    );
    expectNear(
      solid.labelDescriptionGap,
      react.labelDescriptionGap,
      2,
      "SelectBox label description gap",
    );
  });

  test("SelectBoxGroup hover text color follows React Spectrum state ramp", async ({ page }) => {
    const fixtures = await collectionFixtures(
      page,
      "selectboxgroup",
      "?selectionMode=single&selectedKeys=starter&orientation=horizontal",
    );

    const react = await selectBoxHoverColors(page, fixtures.reactRoot);
    const solid = await selectBoxHoverColors(page, fixtures.solidRoot);

    expect(react.after).not.toBe(react.before);
    expect(solid.before).toBe(react.before);
    expect(solid.after).toBe(react.after);
  });

  test("SelectBoxGroup illustrated disabled option state has committed pair screenshots", async ({
    page,
  }) => {
    const fixtures = await collectionFixtures(
      page,
      "selectboxgroup",
      "?selectionMode=multiple&selectedKeys=starter&orientation=horizontal&withIllustrations=true&disablePro=true",
    );

    await clearPointer(page);
    await expectScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "SelectBoxGroup illustrated disabled option state",
      "selectboxgroup-illustrated-disabled",
      { maxMismatchRatio: 0.12, maxDimensionDelta: 48, pixelThreshold: 64 },
    );
  });

  test("SelectBoxGroup disabled item and illustration slot match React Spectrum", async ({
    page,
  }) => {
    const fixtures = await collectionFixtures(
      page,
      "selectboxgroup",
      "?selectionMode=multiple&selectedKeys=starter&orientation=horizontal&withIllustrations=true&disablePro=true",
    );

    expect(await controlProps(fixtures.reactRoot)).toMatchObject({
      selectionMode: "multiple",
      orientation: "horizontal",
      selectedKeys: "starter",
      withIllustrations: true,
      disablePro: true,
    });
    expect(await controlProps(fixtures.solidRoot)).toMatchObject({
      selectionMode: "multiple",
      orientation: "horizontal",
      selectedKeys: "starter",
      withIllustrations: true,
      disablePro: true,
    });

    const react = await selectBoxIllustrationAndDisabledState(fixtures.reactRoot);
    const solid = await selectBoxIllustrationAndDisabledState(fixtures.solidRoot);

    expect(react.starterHasIllustration).toBe(true);
    expect(solid.starterHasIllustration).toBe(true);
    expectNear(solid.illustrationWidth, react.illustrationWidth, 1, "SelectBox illustration width");
    expectNear(
      solid.illustrationHeight,
      react.illustrationHeight,
      1,
      "SelectBox illustration height",
    );
    expectNear(solid.illustrationLeft, react.illustrationLeft, 2, "SelectBox illustration left");
    expectNear(solid.illustrationTop, react.illustrationTop, 2, "SelectBox illustration top");
    expect(react.proDisabled).toBe("true");
    expect(solid.proDisabled).toBe("true");
    expect(react.proSelected).toBe("false");
    expect(solid.proSelected).toBe("false");
    expect(solid.proLabelColor).toBe(react.proLabelColor);

    const reactPro = fixtures.reactRoot
      .locator('[role="option"]')
      .filter({ hasText: "Pro" })
      .first();
    const solidPro = fixtures.solidRoot
      .locator('[role="option"]')
      .filter({ hasText: "Pro" })
      .first();

    await reactPro.click({ force: true });
    await solidPro.click({ force: true });

    await expect(
      fixtures.reactPanel.locator("[data-comparison-selected-keys]").first(),
    ).toHaveAttribute("data-comparison-selected-keys", "starter");
    await expect(
      fixtures.solidPanel.locator("[data-comparison-selected-keys]").first(),
    ).toHaveAttribute("data-comparison-selected-keys", "starter");
    await expect(reactPro).toHaveAttribute("aria-selected", "false");
    await expect(solidPro).toHaveAttribute("aria-selected", "false");
  });

  test("SegmentedControl interactive prop controls drive both stacks", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto("/components/segmentedcontrol/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const form = page.locator('[data-comparison-controls="segmentedcontrol"]').first();
    await expect(form).toHaveAttribute("data-control-coverage", "modeled");
    await form.locator('input[name="selectedKey"][value="grid"]').check();
    await form.locator('input[name="isJustified"]').check();
    await form.locator('input[name="isDisabled"]').check();

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactPanel
      .locator('[data-comparison-control-root="segmentedcontrol"]')
      .first();
    const solidRoot = solidPanel
      .locator('[data-comparison-control-root="segmentedcontrol"]')
      .first();

    await expect(reactPanel.locator("[data-comparison-selected-key]").first()).toHaveAttribute(
      "data-comparison-selected-key",
      "grid",
    );
    await expect(solidPanel.locator("[data-comparison-selected-key]").first()).toHaveAttribute(
      "data-comparison-selected-key",
      "grid",
    );
    expect(await controlProps(reactRoot)).toMatchObject({
      selectedKey: "grid",
      isJustified: true,
      isDisabled: true,
    });
    expect(await controlProps(solidRoot)).toMatchObject({
      selectedKey: "grid",
      isJustified: true,
      isDisabled: true,
    });
    await expect(reactRoot.getByRole("radio", { name: "Grid" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(solidRoot.getByRole("radio", { name: "Grid" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(solidRoot).toHaveAttribute("data-justified", "true");
    await expect(reactRoot).toHaveAttribute("data-disabled", "true");
    await expect(solidRoot).toHaveAttribute("data-disabled", "true");
    await expect(reactRoot.getByRole("radio", { name: "Grid" })).toBeDisabled();
    await expect(solidRoot.getByRole("radio", { name: "Grid" })).toBeDisabled();

    const reactGeometry = await segmentedControlGeometry(reactRoot);
    const solidGeometry = await segmentedControlGeometry(solidRoot);
    expect(
      Math.max(...reactGeometry.itemWidths) - Math.min(...reactGeometry.itemWidths),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.max(...solidGeometry.itemWidths) - Math.min(...solidGeometry.itemWidths),
    ).toBeLessThanOrEqual(1);
  });

  test("SegmentedControl keyboard selection matches React Spectrum", async ({ page }) => {
    const fixtures = await collectionFixtures(
      page,
      "segmentedcontrol",
      "?selectedKey=list&isJustified=true",
    );

    const reactGrid = fixtures.reactRoot.getByRole("radio", { name: "Grid" });
    await reactGrid.focus();
    await page.keyboard.press("Space");

    await expect(
      fixtures.reactPanel.locator("[data-comparison-selected-key]").first(),
    ).toHaveAttribute("data-comparison-selected-key", "grid");
    await expect(reactGrid).toHaveAttribute("aria-checked", "true");

    const solidGrid = fixtures.solidRoot.getByRole("radio", { name: "Grid" });
    await solidGrid.focus();
    await page.keyboard.press("Space");

    await expect(
      fixtures.solidPanel.locator("[data-comparison-selected-key]").first(),
    ).toHaveAttribute("data-comparison-selected-key", "grid");
    await expect(solidGrid).toHaveAttribute("aria-checked", "true");
  });

  test("SelectBoxGroup interactive prop controls drive both stacks", async ({ page }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto("/components/selectboxgroup/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const form = page.locator('[data-comparison-controls="selectboxgroup"]').first();
    await expect(form).toHaveAttribute("data-control-coverage", "modeled");
    await form.locator('input[name="selectionMode"][value="multiple"]').check();
    await form.locator('input[name="selectedKeys"]').fill("starter,pro");

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactPanel.locator('[data-comparison-control-root="selectboxgroup"]').first();
    const solidRoot = solidPanel.locator('[data-comparison-control-root="selectboxgroup"]').first();

    await expect(reactPanel.locator("[data-comparison-selected-keys]").first()).toHaveAttribute(
      "data-comparison-selected-keys",
      "starter,pro",
    );
    await expect(solidPanel.locator("[data-comparison-selected-keys]").first()).toHaveAttribute(
      "data-comparison-selected-keys",
      "starter,pro",
    );
    expect(await controlProps(reactRoot)).toMatchObject({
      selectionMode: "multiple",
      selectedKeys: "starter,pro",
      withIllustrations: true,
    });
    expect(await controlProps(solidRoot)).toMatchObject({
      selectionMode: "multiple",
      selectedKeys: "starter,pro",
      withIllustrations: true,
    });
    await expect(reactRoot.locator('[data-slot="illustration"]').first()).toBeVisible();
    await expect(solidRoot.locator('[data-slot="illustration"]').first()).toBeVisible();
  });

  test("SelectBoxGroup keyboard selection matches React Spectrum", async ({ page }) => {
    const fixtures = await collectionFixtures(
      page,
      "selectboxgroup",
      "?selectionMode=multiple&selectedKeys=starter&orientation=horizontal",
    );

    const reactPro = fixtures.reactRoot
      .locator('[role="option"]')
      .filter({ hasText: "Pro" })
      .first();
    await reactPro.focus();
    await page.keyboard.press("Space");

    await expect(
      fixtures.reactPanel.locator("[data-comparison-selected-keys]").first(),
    ).toHaveAttribute("data-comparison-selected-keys", "starter,pro");
    await expect(reactPro).toHaveAttribute("aria-selected", "true");

    const solidPro = fixtures.solidRoot
      .locator('[role="option"]')
      .filter({ hasText: "Pro" })
      .first();
    await solidPro.focus();
    await page.keyboard.press("Space");

    await expect(
      fixtures.solidPanel.locator("[data-comparison-selected-keys]").first(),
    ).toHaveAttribute("data-comparison-selected-keys", "starter,pro");
    await expect(solidPro).toHaveAttribute("aria-selected", "true");
  });
});
