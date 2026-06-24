import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  normalizeToastDemoProps,
  serializeToastDemoProps,
  type ToastDemoActiveSide,
  type ToastDemoProps,
  type ToastDemoVariant,
  toastDemoDefaults,
  toastPlacementOptions,
  toastVariantOptions,
} from "../src/data/toast-demo";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  diffScreenshots,
  normalizedElementScreenshot,
  pinComparisonTheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

const toastDefaultPairDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.01,
  maxDimensionDelta: 4,
  pixelThreshold: 48,
};

const toastSides = ["react", "solid"] as const satisfies readonly ToastDemoActiveSide[];

const toastTriggerLabels: Record<ToastDemoVariant, string> = {
  neutral: "Show Neutral Toast",
  positive: "Show Positive Toast",
  negative: "Show Negative Toast",
  info: "Show Info Toast",
};

const toastVariantMessages: Record<ToastDemoVariant, string> = {
  neutral: toastDemoDefaults.children,
  positive: "Toast is done!",
  negative: "Toast is burned!",
  info: "Toasting…",
};

function toastQuery(params: Record<string, string | boolean | number | undefined> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

function normalizedToastProps(params: Record<string, string | boolean | number | undefined> = {}) {
  return normalizeToastDemoProps(params as Partial<Record<keyof ToastDemoProps, unknown>>);
}

async function toastFixtures(
  page: Page,
  params: Record<string, string | boolean | number | undefined> = {},
) {
  const demoProps = normalizedToastProps(params);
  await pinComparisonTheme(page, "light");
  await page.goto(`/components/toast/${toastQuery(params)}`);
  await waitForComparisonRouteReady(page);
  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="toast"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="toast"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  const reactRegion = page
    .locator(
      `[data-react-aria-top-layer="true"][role="region"][aria-label="${demoProps["aria-label"]}"]`,
    )
    .first();
  const solidRegion = page
    .locator(
      `[data-solidaria-top-layer="true"][role="region"][aria-label="${demoProps["aria-label"]}"]`,
    )
    .first();

  return {
    activeSide: demoProps.activeSide,
    props: demoProps,
    react: { root: reactRoot, region: reactRegion },
    solid: { root: solidRoot, region: solidRegion },
  };
}

function alertToast(region: Locator) {
  return region.getByRole("alertdialog").first();
}

function stackOverlay(region: Locator) {
  return region
    .locator('[data-solid-spectrum-toast-background], [class*="toast-background"]')
    .first();
}

async function toastStyleContract(region: Locator) {
  return alertToast(region).evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      color: style.color,
      display: style.display,
      fontSize: style.fontSize,
      minHeight: style.minHeight,
      width: Math.round(rect.width),
    };
  });
}

async function regionPlacementContract(region: Locator) {
  return region.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: Math.round(rect.bottom),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      width: Math.round(rect.width),
    };
  });
}

function stackFor(fixtures: Awaited<ReturnType<typeof toastFixtures>>, side: ToastDemoActiveSide) {
  return side === "react" ? fixtures.react : fixtures.solid;
}

function inactiveSide(side: ToastDemoActiveSide): ToastDemoActiveSide {
  return side === "react" ? "solid" : "react";
}

function toastTriggerButton(stack: { root: Locator }, variant: ToastDemoVariant) {
  return stack.root.getByRole("button", { name: toastTriggerLabels[variant] });
}

async function triggerToast(
  stack: { root: Locator; region: Locator },
  variant: ToastDemoVariant,
  expectedText = toastVariantMessages[variant],
) {
  await toastTriggerButton(stack, variant).click();
  await expect(stack.region).toBeVisible();
  await expect(alertToast(stack.region)).toContainText(expectedText);
}

async function expectActiveStack(
  fixtures: Awaited<ReturnType<typeof toastFixtures>>,
  side: ToastDemoActiveSide,
) {
  const activeStack = stackFor(fixtures, side);
  const inactiveStack = stackFor(fixtures, inactiveSide(side));

  await expect(activeStack.root).toHaveAttribute("data-comparison-toast-active-side", side);
  await expect(activeStack.root).toHaveAttribute("data-comparison-toast-is-active", "true");
  await expect(inactiveStack.root).toHaveAttribute("data-comparison-toast-active-side", side);
  await expect(inactiveStack.root).toHaveAttribute("data-comparison-toast-is-active", "false");

  for (const variant of toastVariantOptions) {
    await expect(toastTriggerButton(activeStack, variant)).toBeVisible();
    await expect(toastTriggerButton(inactiveStack, variant)).toHaveCount(0);
  }
  await expect(activeStack.region).toHaveCount(0);
  await expect(inactiveStack.region).toHaveCount(0);
}

async function expectScreenshotDiffWithin(
  page: Page,
  reactPng: Buffer,
  solidPng: Buffer,
  threshold: ScreenshotDiffThreshold,
) {
  const diff = await diffScreenshots(page, reactPng, solidPng, threshold.pixelThreshold ?? 0);
  expect(diff.widthDelta).toBeLessThanOrEqual(threshold.maxDimensionDelta);
  expect(diff.heightDelta).toBeLessThanOrEqual(threshold.maxDimensionDelta);
  expect(diff.mismatchRatio).toBeLessThanOrEqual(threshold.maxMismatchRatio);
}

test.describe("Toast comparison route", () => {
  test("renders docs-style triggers on one active stack with the S2 default Toast contract", async ({
    page,
  }) => {
    const reactFixtures = await toastFixtures(page, { activeSide: "react" });
    const expectedReactProps = serializeToastDemoProps(
      normalizedToastProps({ activeSide: "react" }),
    );

    await expect(reactFixtures.react.root).toHaveAttribute(
      "data-comparison-control-props",
      expectedReactProps,
    );
    await expect(reactFixtures.solid.root).toHaveAttribute(
      "data-comparison-control-props",
      expectedReactProps,
    );
    await expectActiveStack(reactFixtures, "react");

    await triggerToast(reactFixtures.react, "neutral");
    await expect(alertToast(reactFixtures.react.region)).toContainText(toastDemoDefaults.children);
    await expect(reactFixtures.react.region).toHaveAttribute("data-react-aria-top-layer", "true");
    await expect(reactFixtures.solid.region).toHaveCount(0);

    const reactStyle = await toastStyleContract(reactFixtures.react.region);
    const reactPng = await normalizedElementScreenshot(alertToast(reactFixtures.react.region));

    const solidFixtures = await toastFixtures(page, { activeSide: "solid" });
    const expectedSolidProps = serializeToastDemoProps(
      normalizedToastProps({ activeSide: "solid" }),
    );

    await expect(solidFixtures.react.root).toHaveAttribute(
      "data-comparison-control-props",
      expectedSolidProps,
    );
    await expect(solidFixtures.solid.root).toHaveAttribute(
      "data-comparison-control-props",
      expectedSolidProps,
    );
    await expectActiveStack(solidFixtures, "solid");

    await triggerToast(solidFixtures.solid, "neutral");
    await expect(alertToast(solidFixtures.solid.region)).toContainText(toastDemoDefaults.children);
    await expect(solidFixtures.solid.region).toHaveAttribute("data-solidaria-top-layer", "true");
    await expect(solidFixtures.react.region).toHaveCount(0);

    const solidStyle = await toastStyleContract(solidFixtures.solid.region);
    const solidPng = await normalizedElementScreenshot(alertToast(solidFixtures.solid.region));

    expect(reactStyle.backgroundColor).toBe(solidStyle.backgroundColor);
    expect(reactStyle.color).toBe(solidStyle.color);
    expect(reactStyle.display).toBe("flex");
    expect(solidStyle.display).toBe("flex");
    expect(Number.parseFloat(reactStyle.borderRadius)).toBeGreaterThan(0);
    expect(Number.parseFloat(solidStyle.borderRadius)).toBeGreaterThan(0);
    expect(Number.parseFloat(reactStyle.minHeight)).toBeGreaterThanOrEqual(56);
    expect(Number.parseFloat(solidStyle.minHeight)).toBeGreaterThanOrEqual(56);

    await expectScreenshotDiffWithin(page, reactPng, solidPng, toastDefaultPairDiff);
  });

  test("routes ToastQueue variant trigger buttons and icon contracts", async ({ page }) => {
    for (const side of toastSides) {
      for (const variant of toastVariantOptions) {
        const fixtures = await toastFixtures(page, { activeSide: side });
        const stack = stackFor(fixtures, side);

        await triggerToast(stack, variant);
        await expect(alertToast(stack.region)).toContainText(toastVariantMessages[variant]);

        const svgCount = await alertToast(stack.region).locator("svg").count();
        if (variant === "neutral") {
          expect(svgCount).toBe(1);
        } else {
          expect(svgCount).toBeGreaterThanOrEqual(2);
        }

        if (side === "solid") {
          await expect(stack.region.getByRole("alertdialog")).toHaveAttribute(
            "data-solid-spectrum-variant",
            variant,
          );
        }
      }
    }
  });

  test("routes ToastContainer placement values", async ({ page }) => {
    const placements = {
      react: new Map<string, Awaited<ReturnType<typeof regionPlacementContract>>>(),
      solid: new Map<string, Awaited<ReturnType<typeof regionPlacementContract>>>(),
    };

    for (const side of toastSides) {
      for (const placement of toastPlacementOptions) {
        const fixtures = await toastFixtures(page, { activeSide: side, placement });
        const stack = stackFor(fixtures, side);

        await triggerToast(stack, "neutral");
        const contract = await regionPlacementContract(stack.region);
        placements[side].set(placement, contract);

        if (placement.startsWith("top")) {
          expect(contract.top).toBeLessThan(contract.viewportHeight / 2);
        } else {
          expect(contract.bottom).toBeGreaterThan(contract.viewportHeight / 2);
        }
      }
    }

    for (const contracts of [placements.react, placements.solid]) {
      const top = contracts.get("top");
      const topEnd = contracts.get("top end");
      const bottom = contracts.get("bottom");
      const bottomEnd = contracts.get("bottom end");

      expect(top).toBeDefined();
      expect(topEnd).toBeDefined();
      expect(bottom).toBeDefined();
      expect(bottomEnd).toBeDefined();

      expect(Math.abs(top!.left - bottom!.left)).toBeLessThan(8);
      expect(Math.abs(topEnd!.left - bottomEnd!.left)).toBeLessThan(8);
      expect(topEnd!.left).toBeGreaterThan(top!.left);
      expect(bottomEnd!.left).toBeGreaterThan(bottom!.left);
    }
  });

  test("stacks trigger clicks and dismisses one toast at a time", async ({ page }) => {
    for (const side of toastSides) {
      const fixtures = await toastFixtures(page, { activeSide: side });
      const stack = stackFor(fixtures, side);

      await triggerToast(stack, "neutral");
      await triggerToast(stack, "positive");
      await triggerToast(stack, "negative");

      await expect(alertToast(stack.region)).toContainText(toastVariantMessages.negative);
      await expect(stack.region.getByText(toastVariantMessages.positive)).toHaveCount(0);
      await expect(stack.region.getByRole("button", { name: /Show all/ })).toBeVisible();

      await stack.region.getByRole("button", { name: /Show all/ }).click();

      await expect(stack.region.getByText(toastVariantMessages.neutral)).toBeVisible();
      await expect(stack.region.getByText(toastVariantMessages.positive)).toBeVisible();
      await expect(stack.region.getByText(toastVariantMessages.negative)).toBeVisible();
      await expect(stack.region.getByRole("button", { name: "Clear all" })).toBeVisible();
      await expect(stack.region.getByRole("button", { name: "Collapse" })).toBeVisible();

      await stack.region
        .getByRole("alertdialog")
        .filter({ hasText: toastVariantMessages.positive })
        .getByRole("button", { name: "Dismiss" })
        .click();

      await expect(stack.region.getByText(toastVariantMessages.positive)).toHaveCount(0);
      await expect(stack.region.getByText(toastVariantMessages.neutral)).toBeVisible();
      await expect(stack.region.getByText(toastVariantMessages.negative)).toBeVisible();
      await expect(stack.root).toHaveAttribute("data-comparison-toast-close-count", "1");

      await stack.region.getByRole("button", { name: "Collapse" }).click();
      await expect(stack.region.getByText(toastVariantMessages.neutral)).toHaveCount(0);

      await stack.region.getByRole("button", { name: /Show all/ }).click();
      await expect(stack.region.getByText(toastVariantMessages.neutral)).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(stack.region.getByText(toastVariantMessages.neutral)).toHaveCount(0);

      await stack.region.getByRole("button", { name: /Show all/ }).click();
      await expect(stack.region.getByText(toastVariantMessages.neutral)).toBeVisible();
      await stackOverlay(stack.region).click({ position: { x: 8, y: 8 } });
      await expect(stack.region.getByText(toastVariantMessages.neutral)).toHaveCount(0);
    }
  });

  test("clears expanded stacks from ToastContainer controls", async ({ page }) => {
    for (const side of toastSides) {
      const fixtures = await toastFixtures(page, { activeSide: side });
      const stack = stackFor(fixtures, side);

      await triggerToast(stack, "neutral");
      await triggerToast(stack, "positive");
      await expect(stack.root).toHaveAttribute("data-comparison-toast-close-count", "0");
      await stack.region.getByRole("button", { name: /Show all/ }).click();
      await stack.region.getByRole("button", { name: "Clear all" }).click();
      await expect(stack.region.getByText(toastVariantMessages.neutral)).toHaveCount(0);
      await expect(stack.region.getByText(toastVariantMessages.positive)).toHaveCount(0);
      await expect(stack.root).toHaveAttribute("data-comparison-toast-close-count", "0");
    }
  });

  test("actionable toasts call onAction and close when requested", async ({ page }) => {
    for (const side of toastSides) {
      const fixtures = await toastFixtures(page, {
        activeSide: side,
        children: "File deleted",
        showAction: true,
        shouldCloseOnAction: true,
      });
      const stack = stackFor(fixtures, side);

      await triggerToast(stack, "neutral", "File deleted");
      await expect(stack.region.getByRole("button", { name: "Undo" })).toBeVisible();
      await stack.region.getByRole("button", { name: "Undo" }).click();
      await expect(stack.root).toHaveAttribute("data-comparison-toast-action-count", "1");
      await expect(stack.root).toHaveAttribute("data-comparison-toast-close-count", "1");
      await expect(stack.region.getByText("File deleted")).toHaveCount(0);
    }
  });

  test("actionable toasts do not auto-dismiss even when timeout is routed", async ({ page }) => {
    for (const side of toastSides) {
      const fixtures = await toastFixtures(page, {
        activeSide: side,
        children: "Needs action",
        showAction: true,
        autoDismiss: true,
        timeout: 100,
      });
      const stack = stackFor(fixtures, side);

      await triggerToast(stack, "neutral", "Needs action");
      await page.waitForTimeout(300);

      await expect(alertToast(stack.region)).toContainText("Needs action");
    }
  });

  test("switches the live stack from the active-side control", async ({ page }) => {
    const fixtures = await toastFixtures(page, { activeSide: "react" });
    await expectActiveStack(fixtures, "react");
    await triggerToast(fixtures.react, "neutral");
    await expect(alertToast(fixtures.react.region)).toContainText(toastVariantMessages.neutral);

    const form = page.locator('[data-comparison-controls="toast"]');
    const solidRadio = form.locator('input[type="radio"][name="activeSide"][value="solid"]');
    await solidRadio.locator("xpath=ancestor::label[1]").click();
    await expect(solidRadio).toBeChecked();

    await expect(fixtures.react.root).toHaveAttribute("data-comparison-toast-is-active", "false");
    await expect(fixtures.solid.root).toHaveAttribute("data-comparison-toast-is-active", "true");
    await expect(toastTriggerButton(fixtures.react, "neutral")).toHaveCount(0);
    await expect(fixtures.react.region).toHaveCount(0);

    await triggerToast(fixtures.solid, "neutral");
    await expect(alertToast(fixtures.solid.region)).toContainText(toastVariantMessages.neutral);
    await expect(fixtures.react.region).toHaveCount(0);
  });
});
