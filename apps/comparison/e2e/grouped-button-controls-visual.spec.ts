import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, frameworkPanel, styledSection } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

type GroupedControlCase = {
  slug: "actionbuttongroup" | "buttongroup" | "togglebuttongroup";
  title: string;
  id: string;
  query: string;
  controlRole: "button" | "radio";
  controlName: string;
  expectedProps: Record<string, string | boolean | number>;
  expectedRole?: string;
  expectedAriaOrientation?: "vertical";
  expectedFlexDirection: "row" | "column";
  expectedSelected?: string;
  threshold: {
    maxMismatchRatio: number;
    maxDimensionDelta: number;
    pixelThreshold: number;
  };
};

const groupedControlCases: GroupedControlCase[] = [
  {
    slug: "actionbuttongroup",
    title: "ActionButtonGroup compact vertical icon start",
    id: "actionbuttongroup-compact-vertical-icon-start",
    query:
      "?density=compact&orientation=vertical&size=XL&isQuiet=true&isJustified=true&iconPlacement=start&selectedKeys=italic",
    controlRole: "button",
    controlName: "Italic",
    expectedProps: {
      size: "XL",
      density: "compact",
      orientation: "vertical",
      isQuiet: true,
      isJustified: true,
      isDisabled: false,
      iconPlacement: "start",
    },
    expectedRole: "toolbar",
    expectedAriaOrientation: "vertical",
    expectedFlexDirection: "column",
    expectedSelected: "italic",
    threshold: { maxMismatchRatio: 0.22, maxDimensionDelta: 24, pixelThreshold: 64 },
  },
  {
    slug: "buttongroup",
    title: "ButtonGroup overflow vertical icon start",
    id: "buttongroup-overflow-icon-start",
    query: "?wrapWidth=96&size=XL&iconPlacement=start",
    controlRole: "button",
    controlName: "Save",
    expectedProps: {
      orientation: "horizontal",
      align: "start",
      size: "XL",
      isDisabled: false,
      wrapWidth: 96,
      iconPlacement: "start",
    },
    expectedFlexDirection: "column",
    threshold: { maxMismatchRatio: 0.2, maxDimensionDelta: 24, pixelThreshold: 64 },
  },
  {
    slug: "togglebuttongroup",
    title: "ToggleButtonGroup compact vertical selected icon start",
    id: "togglebuttongroup-compact-vertical-selected-icon-start",
    query:
      "?density=compact&orientation=vertical&size=XL&isQuiet=true&isEmphasized=true&isJustified=true&iconPlacement=start&selectedKeys=center",
    controlRole: "radio",
    controlName: "Center",
    expectedProps: {
      size: "XL",
      density: "compact",
      orientation: "vertical",
      isQuiet: true,
      isEmphasized: true,
      isJustified: true,
      isDisabled: false,
      iconPlacement: "start",
    },
    expectedRole: "radiogroup",
    expectedAriaOrientation: "vertical",
    expectedFlexDirection: "column",
    expectedSelected: "center",
    threshold: { maxMismatchRatio: 0.22, maxDimensionDelta: 24, pixelThreshold: 64 },
  },
];

async function groupedFixtures(page: Page, item: GroupedControlCase) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/${item.slug}/${item.query}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("astro-island")).toHaveCount(0);
  await page.waitForTimeout(100);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator(`[data-comparison-group-root="${item.slug}"]`).first();
  const solidRoot = solidPanel.locator(`[data-comparison-group-root="${item.slug}"]`).first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return {
    reactCanvas,
    solidCanvas,
    reactRoot,
    solidRoot,
    reactPanel,
    solidPanel,
    reactControl: reactPanel.getByRole(item.controlRole, { name: item.controlName }).first(),
    solidControl: solidPanel.getByRole(item.controlRole, { name: item.controlName }).first(),
  };
}

async function groupProps(root: Locator) {
  const value = await root.getAttribute("data-comparison-group-props");
  return JSON.parse(value ?? "{}") as Record<string, string | boolean | number>;
}

async function groupLayout(root: Locator) {
  return root.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      role: element.getAttribute("role"),
      ariaOrientation: element.getAttribute("aria-orientation"),
      flexDirection: style.flexDirection,
      gap: Number.parseFloat(style.gap || "0"),
      width: Number(rect.width.toFixed(4)),
      height: Number(rect.height.toFixed(4)),
      dataOrientation: element.getAttribute("data-orientation"),
    };
  });
}

async function iconAlignmentContract(control: Locator) {
  return control.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const icon = Array.from(element.querySelectorAll("svg")).find(
      (svg) => window.getComputedStyle(svg).visibility !== "hidden",
    );
    const label = element.querySelector<HTMLElement>('[data-rsp-slot="text"], [data-slot="label"]');
    const iconRect = icon?.getBoundingClientRect();
    const labelRect = label?.getBoundingClientRect();
    const iconCenterY = iconRect ? iconRect.top + iconRect.height / 2 : null;
    const labelCenterY = labelRect ? labelRect.top + labelRect.height / 2 : null;
    const gap = iconRect && labelRect ? labelRect.left - iconRect.right : null;

    return {
      rootHeight: Number(rootRect.height.toFixed(4)),
      iconWidth: numberOrNull(iconRect?.width),
      iconHeight: numberOrNull(iconRect?.height),
      iconCenterDelta: numberOrNull(iconCenterY == null ? null : iconCenterY - rootCenterY),
      labelCenterDelta: numberOrNull(labelCenterY == null ? null : labelCenterY - rootCenterY),
      iconLabelCenterDelta: numberOrNull(
        iconCenterY == null || labelCenterY == null ? null : iconCenterY - labelCenterY,
      ),
      gap: numberOrNull(gap),
      hasLabel: !!labelRect,
    };
  });
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

test.describe("comparison grouped button controls visual parity", () => {
  for (const item of groupedControlCases) {
    test(`${item.title} has committed pair screenshots`, async ({ page }) => {
      const fixtures = await groupedFixtures(page, item);

      await clearPointer(page);
      await expectScreenshotPair(
        page,
        fixtures.reactCanvas,
        fixtures.solidCanvas,
        item.title,
        item.id,
        item.threshold,
      );
    });

    test(`${item.title} applies planned group props and semantics`, async ({ page }) => {
      const fixtures = await groupedFixtures(page, item);
      expect(await groupProps(fixtures.reactRoot)).toMatchObject(item.expectedProps);
      expect(await groupProps(fixtures.solidRoot)).toMatchObject(item.expectedProps);

      await expect
        .poll(async () => (await groupLayout(fixtures.reactRoot)).flexDirection)
        .toBe(item.expectedFlexDirection);
      await expect
        .poll(async () => (await groupLayout(fixtures.solidRoot)).flexDirection)
        .toBe(item.expectedFlexDirection);

      const react = await groupLayout(fixtures.reactRoot);
      const solid = await groupLayout(fixtures.solidRoot);
      expect(solid.role).toBe(item.expectedRole ?? null);
      expect(react.role).toBe(item.expectedRole ?? null);
      expect(solid.ariaOrientation).toBe(item.expectedAriaOrientation ?? null);
      expect(react.ariaOrientation).toBe(item.expectedAriaOrientation ?? null);
      expectNear(solid.gap, react.gap, 1, `${item.title} group gap`);

      if (item.slug === "buttongroup") {
        expect(solid.dataOrientation).toBe("vertical");
        expectNear(solid.width, react.width, 1, `${item.title} wrapped group width`);
      }

      if (item.expectedSelected) {
        await expect(
          fixtures.reactPanel.locator("[data-comparison-selected-keys]").first(),
        ).toHaveAttribute("data-comparison-selected-keys", item.expectedSelected);
        await expect(
          fixtures.solidPanel.locator("[data-comparison-selected-keys]").first(),
        ).toHaveAttribute("data-comparison-selected-keys", item.expectedSelected);
      }
    });

    test(`${item.title} icon geometry matches React Spectrum`, async ({ page }) => {
      const fixtures = await groupedFixtures(page, item);
      const react = await iconAlignmentContract(fixtures.reactControl);
      const solid = await iconAlignmentContract(fixtures.solidControl);

      expectNear(solid.rootHeight, react.rootHeight, 0.5, `${item.title} root height`);
      expectNear(solid.iconWidth, react.iconWidth, 0.5, `${item.title} icon width`);
      expectNear(solid.iconHeight, react.iconHeight, 0.5, `${item.title} icon height`);
      expectNear(
        solid.iconCenterDelta,
        react.iconCenterDelta,
        0.75,
        `${item.title} icon vertical centerline`,
      );
      expect(
        Math.abs(solid.iconCenterDelta ?? 0),
        `${item.title} solid icon root centerline`,
      ).toBeLessThanOrEqual(1);
      expect(solid.hasLabel).toBe(true);
      expectNear(
        solid.labelCenterDelta,
        react.labelCenterDelta,
        0.75,
        `${item.title} text vertical centerline`,
      );
      expectNear(
        solid.iconLabelCenterDelta,
        react.iconLabelCenterDelta,
        0.75,
        `${item.title} icon-to-text centerline`,
      );
      expectNear(solid.gap, react.gap, 1, `${item.title} icon text gap`);
    });
  }
});
