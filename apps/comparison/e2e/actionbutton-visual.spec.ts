import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import {
  expectExactPreparedInPlaceScreenshotPair,
  clearPointer,
  expectExactPreparedScreenshotPair,
  expectExactScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";

type ActionButtonCase = {
  id: string;
  params: Record<string, string | boolean>;
};

const actionButtonCases: ActionButtonCase[] = [
  { id: "default", params: {} },
  { id: "size-xs", params: { size: "XS" } },
  { id: "size-s", params: { size: "S" } },
  { id: "size-m", params: { size: "M" } },
  { id: "size-l", params: { size: "L" } },
  { id: "size-xl", params: { size: "XL" } },
  { id: "quiet", params: { isQuiet: true } },
  { id: "static-white", params: { staticColor: "white" } },
  { id: "static-black", params: { staticColor: "black" } },
  { id: "static-auto", params: { staticColor: "auto" } },
  { id: "disabled", params: { isDisabled: true } },
  { id: "pending", params: { isPending: true } },
  { id: "icon-start", params: { iconPlacement: "start" } },
  { id: "icon-only", params: { iconPlacement: "only" } },
  { id: "icon-start-xl", params: { iconPlacement: "start", size: "XL" } },
  { id: "icon-only-xl", params: { iconPlacement: "only", size: "XL" } },
];

const actionButtonIconAlignmentCases = [
  { iconPlacement: "start", size: "XS" },
  { iconPlacement: "start", size: "M" },
  { iconPlacement: "start", size: "XL" },
  { iconPlacement: "only", size: "M" },
  { iconPlacement: "only", size: "XL" },
] as const;

function actionButtonQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function actionButtonFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/actionbutton/${actionButtonQuery(params)}`);
  await waitForComparisonRouteReady(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");

  return {
    reactCanvas,
    solidCanvas,
    reactRoot: reactPanel.locator("[data-comparison-actionbutton-props]").first(),
    solidRoot: solidPanel.locator("[data-comparison-actionbutton-props]").first(),
    reactButton: reactPanel.getByRole("button").first(),
    solidButton: solidPanel.getByRole("button").first(),
  };
}

async function setComparisonTheme(page: Page, theme: "light" | "dark") {
  await page.locator(`input[name="comparisonTheme"][value="${theme}"]`).check();
}

async function serializedControlProps(root: Locator) {
  return root.getAttribute("data-comparison-control-props");
}

async function actionButtonComputedContract(button: Locator) {
  return button.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const label = element.querySelector<HTMLElement>("[data-rsp-slot='text'], [data-slot='label']");
    const labelRange = document.createRange();
    if (label) {
      labelRange.selectNodeContents(label);
    }
    return {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      borderRadius: styles.borderRadius,
      borderWidth: styles.borderWidth,
      color: styles.color,
      cursor: styles.cursor,
      fontSize: styles.fontSize,
      height: styles.height,
      lineHeight: styles.lineHeight,
      padding: styles.padding,
      width: element.getBoundingClientRect().width,
      labelWidth: label?.getBoundingClientRect().width ?? null,
      labelTextWidth: label ? labelRange.getBoundingClientRect().width : null,
    };
  });
}

async function actionButtonIconAlignmentContract(button: Locator) {
  return button.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const svgs = Array.from(element.querySelectorAll("svg"));
    const icon = svgs.find((svg) => {
      const styles = window.getComputedStyle(svg);
      return svg.closest('[role="progressbar"]') == null && styles.visibility !== "hidden";
    });
    const label = element.querySelector<HTMLElement>('[data-rsp-slot="text"], [data-slot="label"]');
    const iconRect = icon?.getBoundingClientRect();
    const labelRect = label?.getBoundingClientRect();
    const iconCenterY = iconRect ? iconRect.top + iconRect.height / 2 : null;
    const labelCenterY = labelRect ? labelRect.top + labelRect.height / 2 : null;
    const gap = iconRect && labelRect ? labelRect.left - iconRect.right : null;

    return {
      rootHeight: Number(rootRect.height.toFixed(4)),
      rootWidth: Number(rootRect.width.toFixed(4)),
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

async function actionButtonPendingIconContract(button: Locator) {
  return button.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const progress = element.querySelector<HTMLElement>('[role="progressbar"]');
    const progressRect = progress?.getBoundingClientRect();
    const progressCenterY = progressRect ? progressRect.top + progressRect.height / 2 : null;
    const icon = Array.from(element.querySelectorAll("svg")).find(
      (svg) => svg.closest('[role="progressbar"]') == null,
    );
    const label = element.querySelector<HTMLElement>('[data-rsp-slot="text"], [data-slot="label"]');

    return {
      rootHeight: Number(rootRect.height.toFixed(4)),
      progressWidth: numberOrNull(progressRect?.width),
      progressHeight: numberOrNull(progressRect?.height),
      progressCenterDelta: numberOrNull(
        progressCenterY == null ? null : progressCenterY - rootCenterY,
      ),
      iconVisibility: icon ? window.getComputedStyle(icon).visibility : null,
      labelVisibility: label ? window.getComputedStyle(label).visibility : null,
    };
  });
}

async function actionButtonPendingProgressCircleContract(button: Locator) {
  return button.evaluate((element) => {
    const progress = element.querySelector<HTMLElement>('[role="progressbar"]');
    const progressStyles = progress ? window.getComputedStyle(progress) : null;
    const circles = progress ? Array.from(progress.querySelectorAll("circle")) : [];
    const circleStyles = circles.map((circle) => window.getComputedStyle(circle));

    return {
      containerBackground: progressStyles?.getPropertyValue("--s2-container-bg").trim() ?? null,
      hcmStroke: circleStyles[0]?.stroke ?? null,
      hcmStrokeWidth: circleStyles[0]?.strokeWidth ?? null,
      trackStroke: circleStyles[1]?.stroke ?? null,
      trackStrokeWidth: circleStyles[1]?.strokeWidth ?? null,
      fillStroke: circleStyles[2]?.stroke ?? null,
      fillStrokeWidth: circleStyles[2]?.strokeWidth ?? null,
      fillRotate: circleStyles[2]?.rotate ?? null,
      fillTransformOrigin: circleStyles[2]?.transformOrigin ?? null,
      fillStrokeLinecap: circles[2]?.getAttribute("stroke-linecap") ?? null,
      fillStrokeDasharray: circles[2]?.getAttribute("stroke-dasharray") ?? null,
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

test.describe("comparison ActionButton visual parity", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const matrixCase of actionButtonCases) {
      test(`ActionButton ${matrixCase.id} computed styles match React Spectrum in ${colorScheme}`, async ({
        page,
      }) => {
        const fixtures = await actionButtonFixtures(page, matrixCase.params);

        await setComparisonTheme(page, colorScheme);
        await expect
          .poll(async () => {
            const react = await actionButtonComputedContract(fixtures.reactButton);
            const solid = await actionButtonComputedContract(fixtures.solidButton);
            return JSON.stringify({
              react,
              solid,
              matches: JSON.stringify(react) === JSON.stringify(solid),
            });
          })
          .toContain('"matches":true');
      });
    }
  }

  test("ActionButton pending state is exposed on both implementations", async ({ page }) => {
    const fixtures = await actionButtonFixtures(page, { isPending: true });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-actionbutton-pending",
      "true",
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-actionbutton-pending",
      "true",
    );
    await expect(fixtures.reactButton).toHaveAttribute("data-pending", "true");
  });

  test("ActionButton pending ProgressCircle colors match React Spectrum across quiet and staticColor", async ({
    page,
  }) => {
    const staticColors = [undefined, "white", "black", "auto"] as const;
    const quietStates = [false, true] as const;

    for (const staticColor of staticColors) {
      for (const isQuiet of quietStates) {
        const fixtures = await actionButtonFixtures(page, {
          isPending: true,
          ...(staticColor ? { staticColor } : {}),
          ...(isQuiet ? { isQuiet } : {}),
        });

        await expect(
          fixtures.reactButton.getByRole("progressbar", { name: "pending" }),
        ).toBeVisible();
        await expect(
          fixtures.solidButton.getByRole("progressbar", { name: "pending" }),
        ).toBeVisible();
        await expect(
          actionButtonPendingProgressCircleContract(fixtures.solidButton),
        ).resolves.toEqual(await actionButtonPendingProgressCircleContract(fixtures.reactButton));
      }
    }
  });

  test("ActionButton icon geometry is aligned with React Spectrum", async ({ page }) => {
    for (const item of actionButtonIconAlignmentCases) {
      await test.step(`${item.iconPlacement} ${item.size}`, async () => {
        const fixtures = await actionButtonFixtures(page, item);
        const react = await actionButtonIconAlignmentContract(fixtures.reactButton);
        const solid = await actionButtonIconAlignmentContract(fixtures.solidButton);

        expectNear(solid.rootHeight, react.rootHeight, 0.5, "ActionButton root height");
        expectNear(solid.iconWidth, react.iconWidth, 0.5, "ActionButton icon width");
        expectNear(solid.iconHeight, react.iconHeight, 0.5, "ActionButton icon height");
        expectNear(
          solid.iconCenterDelta,
          react.iconCenterDelta,
          0.75,
          "ActionButton icon vertical centerline",
        );
        expect(
          Math.abs(solid.iconCenterDelta ?? 0),
          "solid icon root centerline",
        ).toBeLessThanOrEqual(1);

        if (item.iconPlacement === "only") {
          expect(solid.hasLabel).toBe(false);
        } else {
          expect(solid.hasLabel).toBe(true);
          expectNear(
            solid.labelCenterDelta,
            react.labelCenterDelta,
            0.75,
            "ActionButton text vertical centerline",
          );
          expectNear(
            solid.iconLabelCenterDelta,
            react.iconLabelCenterDelta,
            0.75,
            "ActionButton icon-to-text centerline",
          );
          expectNear(solid.gap, react.gap, 1, "ActionButton icon text gap");
        }
      });
    }
  });

  test("ActionButton pending indicator remains centered when icon content is present", async ({
    page,
  }) => {
    const fixtures = await actionButtonFixtures(page, {
      iconPlacement: "start",
      isPending: true,
    });
    await expect(fixtures.reactButton.getByRole("progressbar", { name: "pending" })).toBeVisible();
    await expect(fixtures.solidButton.getByRole("progressbar", { name: "pending" })).toBeVisible();

    const react = await actionButtonPendingIconContract(fixtures.reactButton);
    const solid = await actionButtonPendingIconContract(fixtures.solidButton);

    expectNear(solid.rootHeight, react.rootHeight, 0.5, "pending ActionButton root height");
    expectNear(solid.progressWidth, react.progressWidth, 0.5, "pending progress width");
    expectNear(solid.progressHeight, react.progressHeight, 0.5, "pending progress height");
    expectNear(
      solid.progressCenterDelta,
      react.progressCenterDelta,
      0.75,
      "pending progress vertical centerline",
    );
    expect(
      Math.abs(solid.progressCenterDelta ?? 0),
      "solid pending progress root centerline",
    ).toBeLessThanOrEqual(1);
    expect(solid.iconVisibility).toBe(react.iconVisibility);
    expect(solid.labelVisibility).toBe(react.labelVisibility);
  });

  test("ActionButton prop controls drive both implementations", async ({ page }) => {
    const fixtures = await actionButtonFixtures(page);
    const form = page.locator('[data-comparison-controls="actionbutton"]').first();
    await expect(form).toHaveAttribute("data-control-coverage", "modeled");

    await form.locator('input[name="children"]').fill("Archive");
    await form.locator('input[name="size"][value="XL"]').check();
    await form.locator('input[name="staticColor"][value="black"]').check();
    await form.locator('input[name="iconPlacement"][value="start"]').check();
    await form.locator('input[name="isQuiet"]').check();

    const expected = JSON.stringify({
      children: "Archive",
      size: "XL",
      staticColor: "black",
      iconPlacement: "start",
      isQuiet: true,
      isDisabled: false,
      isPending: false,
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-actionbutton-props",
      expected,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-actionbutton-props",
      expected,
    );
    await expect
      .poll(() =>
        serializedControlProps(
          fixtures.reactCanvas.locator('[data-comparison-control-root="actionbutton"]').first(),
        ),
      )
      .toBe(expected);
    await expect
      .poll(() =>
        serializedControlProps(
          fixtures.solidCanvas.locator('[data-comparison-control-root="actionbutton"]').first(),
        ),
      )
      .toBe(expected);
    await expect(fixtures.reactCanvas.getByRole("button", { name: "Archive" })).toBeVisible();
    await expect(fixtures.solidCanvas.getByRole("button", { name: "Archive" })).toHaveAttribute(
      "data-size",
      "XL",
    );
  });

  for (const item of actionButtonCases) {
    test(`ActionButton ${item.id} matches current React Spectrum`, async ({ page }) => {
      const fixtures = await actionButtonFixtures(page, item.params);

      await clearPointer(page);
      if (item.params.isPending) {
        await expect(
          fixtures.reactCanvas.getByRole("progressbar", { name: "pending" }),
        ).toBeVisible();
        await expect(
          fixtures.solidCanvas.getByRole("progressbar", { name: "pending" }),
        ).toBeVisible();
      }

      await expectExactScreenshotPair(
        page,
        fixtures.reactCanvas,
        fixtures.solidCanvas,
        `ActionButton ${item.id}`,
      );
    });
  }

  test("ActionButton hover state matches current React Spectrum", async ({ page }) => {
    const fixtures = await actionButtonFixtures(page);

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "ActionButton hover",
      async () => {
        await fixtures.reactButton.hover();
        await expect(fixtures.reactButton).toHaveAttribute("data-hovered", "true");
      },
      async () => {
        await fixtures.solidButton.hover();
        await expect(fixtures.solidButton).toHaveAttribute("data-hovered", "true");
      },
    );
  });

  test("ActionButton focus-visible state matches current React Spectrum", async ({ page }) => {
    const fixtures = await actionButtonFixtures(page);

    await expectExactPreparedScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "ActionButton focus-visible",
      async () => {
        await fixtures.reactButton.focus();
        await expect(fixtures.reactButton).toHaveAttribute("data-focus-visible", "true");
      },
      async () => {
        await fixtures.solidButton.focus();
        await expect(fixtures.solidButton).toHaveAttribute("data-focus-visible", "true");
      },
    );
  });

  test("ActionButton pressed state matches current React Spectrum", async ({ page }) => {
    const fixtures = await actionButtonFixtures(page);

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "ActionButton pressed",
      async () => {
        await fixtures.reactButton.hover();
        await page.mouse.down();
        await expect(fixtures.reactButton).toHaveAttribute("data-pressed", "true");
      },
      async () => {
        await fixtures.solidButton.hover();
        await page.mouse.down();
        await expect(fixtures.solidButton).toHaveAttribute("data-pressed", "true");
      },
    );
  });
});
