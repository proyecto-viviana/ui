import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  compareScreenshots,
  pinComparisonTheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

const tooltipSurfaceDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.08,
  maxDimensionDelta: 14,
  pixelThreshold: 48,
};

type TooltipSetup = {
  reactPanel: Locator;
  solidPanel: Locator;
  reactButton: Locator;
  solidButton: Locator;
  reactRoot: Locator;
  solidRoot: Locator;
};

function tooltipQuery(params: Record<string, string | boolean | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

function idSelector(id: string) {
  return `#${id.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1")}`;
}

async function setupTooltipRoute(
  page: Page,
  params: Record<string, string | boolean | number | undefined> = {},
  options: { clearInitialPointer?: boolean } = {},
): Promise<TooltipSetup> {
  await pinComparisonTheme(page, "dark");
  if (options.clearInitialPointer === false) {
    await page.mouse.move(4, 4);
  }
  await page.goto(`/components/tooltip/${tooltipQuery(params)}`);
  await page.addStyleTag({
    content: ".s2-topbar, astro-dev-toolbar { visibility: hidden !important; }",
  });
  await waitForComparisonRouteReady(page);
  if (options.clearInitialPointer ?? true) {
    await clearPointer(page);
  }

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const actionLabel = String(params.actionLabel ?? "Inspect");
  const reactButton = reactPanel.getByRole("button", { name: actionLabel }).first();
  const solidButton = solidPanel.getByRole("button", { name: actionLabel }).first();
  const reactRoot = reactPanel.locator('[data-comparison-control-root="tooltip"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="tooltip"]').first();

  await expect(reactRoot).toHaveCount(1);
  await expect(solidRoot).toHaveCount(1);
  await expect(reactButton).toBeVisible();
  await expect(solidButton).toBeVisible();

  return { reactPanel, solidPanel, reactButton, solidButton, reactRoot, solidRoot };
}

async function tooltipForTrigger(trigger: Locator) {
  await expect.poll(() => trigger.getAttribute("aria-describedby")).toBeTruthy();
  const id = await trigger.getAttribute("aria-describedby");
  expect(id).toBeTruthy();
  const tooltip = trigger.page().locator(idSelector(id!));
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute("role", "tooltip");
  return tooltip;
}

async function tooltipStyleContract(tooltip: Locator) {
  return tooltip.evaluate((element) => {
    const node = element as HTMLElement;
    const styles = window.getComputedStyle(node);
    const svg = node.querySelector("svg");
    const svgRect = svg?.getBoundingClientRect();

    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      color: styles.color,
      fontSize: styles.fontSize,
      maxWidth: styles.maxWidth,
      minHeight: styles.minHeight,
      arrowHeight: Math.round(svgRect?.height ?? 0),
      arrowViewBox: svg?.getAttribute("viewBox"),
      dir: node.dir,
      lang: node.lang,
      text: node.textContent?.trim(),
    };
  });
}

async function expectTooltipHidden(page: Page) {
  await expect(page.getByRole("tooltip")).toHaveCount(0);
}

async function centerDelta(tooltip: Locator, trigger: Locator, axis: "x" | "y") {
  const [tooltipBox, triggerBox] = await Promise.all([
    tooltip.boundingBox(),
    trigger.boundingBox(),
  ]);
  expect(tooltipBox).toBeTruthy();
  expect(triggerBox).toBeTruthy();

  if (axis === "x") {
    return tooltipBox!.x + tooltipBox!.width / 2 - (triggerBox!.x + triggerBox!.width / 2);
  }

  return tooltipBox!.y + tooltipBox!.height / 2 - (triggerBox!.y + triggerBox!.height / 2);
}

async function topEdge(tooltip: Locator) {
  const box = await tooltip.boundingBox();
  expect(box).toBeTruthy();
  return box!.y;
}

async function leftEdge(tooltip: Locator) {
  const box = await tooltip.boundingBox();
  expect(box).toBeTruthy();
  return box!.x;
}

async function leftDelta(tooltip: Locator, trigger: Locator) {
  const [tooltipBox, triggerBox] = await Promise.all([
    tooltip.boundingBox(),
    trigger.boundingBox(),
  ]);
  expect(tooltipBox).toBeTruthy();
  expect(triggerBox).toBeTruthy();
  return tooltipBox!.x - triggerBox!.x;
}

async function pinTooltipRootNearTop(root: Locator, left: number) {
  await root.evaluate((element, nextLeft) => {
    Object.assign((element as HTMLElement).style, {
      left: `${nextLeft}px`,
      position: "fixed",
      top: "24px",
      zIndex: "1000",
    });
  }, left);
}

async function pinTooltipRootNearBottom(root: Locator, left: number) {
  await root.evaluate((element, nextLeft) => {
    Object.assign((element as HTMLElement).style, {
      left: `${nextLeft}px`,
      position: "fixed",
      top: `${Math.max(120, window.innerHeight - 54)}px`,
      zIndex: "1000",
    });
  }, left);
}

async function touchHover(trigger: Locator) {
  await trigger.evaluate((element) => {
    const pointerInit = {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "touch",
      clientX: 8,
      clientY: 8,
    };

    element.dispatchEvent(new PointerEvent("pointerenter", pointerInit));
    element.dispatchEvent(new PointerEvent("pointerover", pointerInit));
  });
}

test.describe("comparison Tooltip visual parity", () => {
  test("controlled open state renders S2 surface, arrow, and trigger ARIA on both stacks", async ({
    page,
  }) => {
    const { reactButton, solidButton, reactRoot, solidRoot } = await setupTooltipRoute(page, {
      isOpen: true,
    });

    await expect
      .poll(() => reactRoot.getAttribute("data-comparison-control-props"))
      .toContain('"isOpen":true');
    await expect
      .poll(() => solidRoot.getAttribute("data-comparison-control-props"))
      .toContain('"isOpen":true');
    await expect
      .poll(() => reactRoot.getAttribute("data-comparison-control-props"))
      .toContain('"delay":1500');
    await expect
      .poll(() => solidRoot.getAttribute("data-comparison-control-props"))
      .toContain('"containerPadding":12');

    const reactTooltip = await tooltipForTrigger(reactButton);
    const solidTooltip = await tooltipForTrigger(solidButton);
    await expect(reactTooltip).toHaveText("Tooltip content");
    await expect(solidTooltip).toHaveText("Tooltip content");
    await expect(reactTooltip).toHaveAttribute("data-placement", "top");
    await expect(solidTooltip).toHaveAttribute("data-placement", "top");

    const [reactContract, solidContract] = await Promise.all([
      tooltipStyleContract(reactTooltip),
      tooltipStyleContract(solidTooltip),
    ]);
    expect(solidContract).toMatchObject({
      backgroundColor: reactContract.backgroundColor,
      borderRadius: reactContract.borderRadius,
      color: reactContract.color,
      fontSize: reactContract.fontSize,
      maxWidth: reactContract.maxWidth,
      minHeight: reactContract.minHeight,
      arrowViewBox: "0 0 10 5",
      text: "Tooltip content",
    });
    expect(solidContract.arrowHeight).toBeGreaterThanOrEqual(4);
    expect(solidContract.dir).toBe(reactContract.dir);
    expect(solidContract.lang).toBe(reactContract.lang);

    const reactPng = await reactTooltip.screenshot({ animations: "disabled" });
    const solidPng = await solidTooltip.screenshot({ animations: "disabled" });
    await compareScreenshots(page, reactPng, solidPng, "Tooltip open surface", tooltipSurfaceDiff);
  });

  test("route controls cover placement axes and disabled suppression", async ({ page }) => {
    const placements = ["top", "bottom", "left", "right", "start", "end"] as const;

    for (const placement of placements) {
      const { reactButton, solidButton } = await setupTooltipRoute(page, {
        isOpen: true,
        placement,
        children: `Placement ${placement}`,
        shouldFlip: false,
      });
      const expected = placement === "start" ? "left" : placement === "end" ? "right" : placement;

      await expect(await tooltipForTrigger(reactButton)).toHaveAttribute(
        "data-placement",
        expected,
      );
      await expect(await tooltipForTrigger(solidButton)).toHaveAttribute(
        "data-placement",
        expected,
      );
    }

    const { reactButton, solidButton } = await setupTooltipRoute(page, {
      isDisabled: true,
      isOpen: true,
      delay: 0,
    });
    await reactButton.hover();
    await solidButton.hover();
    await page.waitForTimeout(150);
    await expect(reactButton).not.toHaveAttribute("aria-describedby", /.+/);
    await expect(solidButton).not.toHaveAttribute("aria-describedby", /.+/);
    await expectTooltipHidden(page);
  });

  test("defaultOpen, crossOffset, and containerPadding geometry match documented trigger props", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "dark");
    await page.mouse.move(4, 4);
    await page.goto(`/components/tooltip/${tooltipQuery({ defaultOpen: true })}`);
    await page.addStyleTag({
      content: ".s2-topbar, astro-dev-toolbar { visibility: hidden !important; }",
    });
    await waitForComparisonRouteReady(page);

    const defaultOpenSection = page.locator("#example").filter({
      has: page.locator("h2", { hasText: "Example" }),
    });
    const defaultOpenReactPanel = await frameworkPanel(defaultOpenSection, "React Spectrum stack");
    const defaultOpenSolidPanel = await frameworkPanel(defaultOpenSection, "Solidaria stack");
    const defaultOpenReactButton = defaultOpenReactPanel
      .getByRole("button", { name: "Inspect" })
      .first();
    const defaultOpenSolidButton = defaultOpenSolidPanel
      .getByRole("button", { name: "Inspect" })
      .first();

    await expect(await tooltipForTrigger(defaultOpenReactButton)).toBeVisible();
    await expect(await tooltipForTrigger(defaultOpenSolidButton)).toBeVisible();
    await defaultOpenSection.scrollIntoViewIfNeeded();
    await expect(defaultOpenReactButton).not.toHaveAttribute("aria-describedby", /.+/);
    await expect(defaultOpenSolidButton).not.toHaveAttribute("aria-describedby", /.+/);
    await expectTooltipHidden(page);
    await clearPointer(page);

    let setup = await setupTooltipRoute(page, {
      containerPadding: 0,
      crossOffset: 24,
      delay: 0,
      isOpen: true,
      placement: "bottom",
    });
    let reactTooltip = await tooltipForTrigger(setup.reactButton);
    let solidTooltip = await tooltipForTrigger(setup.solidButton);
    const [reactDelta, solidDelta] = await Promise.all([
      centerDelta(reactTooltip, setup.reactButton, "x"),
      centerDelta(solidTooltip, setup.solidButton, "x"),
    ]);
    expect(reactDelta).toBeGreaterThan(12);
    expect(reactDelta).toBeLessThan(38);
    expect(solidDelta).toBeGreaterThan(12);
    expect(solidDelta).toBeLessThan(38);
    expect(Math.abs(reactDelta - solidDelta)).toBeLessThanOrEqual(10);

    setup = await setupTooltipRoute(page, {
      delay: 0,
      placement: "bottom",
      shouldFlip: true,
    });
    await pinTooltipRootNearBottom(setup.reactRoot, 240);
    await pinTooltipRootNearBottom(setup.solidRoot, 620);
    await setup.reactButton.hover();
    reactTooltip = await tooltipForTrigger(setup.reactButton);
    await expect(reactTooltip).toHaveAttribute("data-placement", "top");

    await clearPointer(page);
    await expect(reactTooltip).toHaveCount(0);
    await setup.solidButton.hover();
    solidTooltip = await tooltipForTrigger(setup.solidButton);
    await expect(solidTooltip).toHaveAttribute("data-placement", "top");

    setup = await setupTooltipRoute(page, {
      containerPadding: 80,
      crossOffset: -800,
      delay: 0,
      placement: "bottom",
      shouldFlip: false,
    });
    await pinTooltipRootNearTop(setup.reactRoot, 240);
    await pinTooltipRootNearTop(setup.solidRoot, 620);
    await setup.reactButton.hover();
    reactTooltip = await tooltipForTrigger(setup.reactButton);
    const reactArrowClampDelta = await leftDelta(reactTooltip, setup.reactButton);
    expect(reactArrowClampDelta).toBeGreaterThanOrEqual(-90);
    expect(reactArrowClampDelta).toBeLessThanOrEqual(-50);

    await clearPointer(page);
    await expect(reactTooltip).toHaveCount(0);
    await setup.solidButton.hover();
    solidTooltip = await tooltipForTrigger(setup.solidButton);
    const solidArrowClampDelta = await leftDelta(solidTooltip, setup.solidButton);
    expect(solidArrowClampDelta).toBeGreaterThanOrEqual(-90);
    expect(solidArrowClampDelta).toBeLessThanOrEqual(-50);
    expect(Math.abs(reactArrowClampDelta - solidArrowClampDelta)).toBeLessThanOrEqual(12);

    setup = await setupTooltipRoute(page, {
      containerPadding: 80,
      crossOffset: -800,
      delay: 0,
      placement: "bottom",
      shouldFlip: false,
    });
    await pinTooltipRootNearTop(setup.reactRoot, 20);
    await pinTooltipRootNearTop(setup.solidRoot, 620);
    await setup.reactButton.hover();
    reactTooltip = await tooltipForTrigger(setup.reactButton);
    const reactLeft = await leftEdge(reactTooltip);
    expect(reactLeft).toBeGreaterThanOrEqual(76);
    expect(reactLeft).toBeLessThanOrEqual(100);

    setup = await setupTooltipRoute(page, {
      containerPadding: 80,
      crossOffset: -800,
      delay: 0,
      placement: "bottom",
      shouldFlip: false,
    });
    await pinTooltipRootNearTop(setup.reactRoot, 240);
    await pinTooltipRootNearTop(setup.solidRoot, 20);
    await setup.solidButton.hover();
    solidTooltip = await tooltipForTrigger(setup.solidButton);
    const solidLeft = await leftEdge(solidTooltip);
    expect(solidLeft).toBeGreaterThanOrEqual(76);
    expect(solidLeft).toBeLessThanOrEqual(100);
    expect(Math.abs(reactLeft - solidLeft)).toBeLessThanOrEqual(10);

    setup = await setupTooltipRoute(page, {
      containerPadding: 80,
      delay: 0,
      placement: "top",
      shouldFlip: false,
    });
    await pinTooltipRootNearTop(setup.reactRoot, 240);
    await pinTooltipRootNearTop(setup.solidRoot, 620);
    await setup.reactButton.hover();
    reactTooltip = await tooltipForTrigger(setup.reactButton);
    const reactTop = await topEdge(reactTooltip);
    expect(reactTop).toBeLessThan(0);

    await clearPointer(page);
    await expect(reactTooltip).toHaveCount(0);
    await setup.solidButton.hover();
    solidTooltip = await tooltipForTrigger(setup.solidButton);
    const solidTop = await topEdge(solidTooltip);
    expect(solidTop).toBeLessThan(0);
    expect(Math.abs(reactTop - solidTop)).toBeLessThanOrEqual(12);
  });

  test("focus trigger, hover trigger, Escape, and press cleanup match", async ({ page }) => {
    let setup = await setupTooltipRoute(page, { trigger: "focus", delay: 0 });
    await setup.reactButton.hover();
    await page.waitForTimeout(150);
    await expectTooltipHidden(page);

    await page.keyboard.press("Tab");
    await setup.reactButton.focus();
    let tooltip = await tooltipForTrigger(setup.reactButton);
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toHaveCount(0);

    await page.keyboard.press("Tab");
    await setup.solidButton.focus();
    tooltip = await tooltipForTrigger(setup.solidButton);
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toHaveCount(0);

    setup = await setupTooltipRoute(page, { delay: 0, shouldCloseOnPress: true });
    await setup.reactButton.hover();
    tooltip = await tooltipForTrigger(setup.reactButton);
    await setup.reactButton.click();
    await expect(tooltip).toHaveCount(0);

    await setup.solidButton.hover();
    tooltip = await tooltipForTrigger(setup.solidButton);
    await setup.solidButton.click();
    await expect(tooltip).toHaveCount(0);
  });

  test("touch pointer hover does not show Tooltip on either stack", async ({ page }) => {
    const { reactButton, solidButton } = await setupTooltipRoute(page, { delay: 0 });

    await touchHover(reactButton);
    await touchHover(solidButton);
    await page.waitForTimeout(150);

    await expect(reactButton).not.toHaveAttribute("aria-describedby", /.+/);
    await expect(solidButton).not.toHaveAttribute("aria-describedby", /.+/);
    await expectTooltipHidden(page);
  });
});
