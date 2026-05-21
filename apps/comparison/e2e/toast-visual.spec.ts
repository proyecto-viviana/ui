import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  toastDemoDefaults,
  toastPlacementOptions,
  toastVariantOptions,
} from "../src/data/toast-demo";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  expectScreenshotPair,
  pinComparisonTheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

const toastDefaultPairDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.01,
  maxDimensionDelta: 4,
  pixelThreshold: 48,
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

async function toastFixtures(
  page: Page,
  params: Record<string, string | boolean | number | undefined> = {},
) {
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
      `[data-react-aria-top-layer="true"][role="region"][aria-label="${toastDemoDefaults["aria-label"]}"]`,
    )
    .first();
  const solidRegion = solidRoot.getByRole("region", { name: toastDemoDefaults["aria-label"] });

  return {
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

test.describe("Toast comparison route", () => {
  test("mounts both styled stacks with the S2 default Toast contract", async ({ page }) => {
    const { react, solid } = await toastFixtures(page);
    const expectedProps = JSON.stringify(toastDemoDefaults);

    await expect(react.root).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solid.root).toHaveAttribute("data-comparison-control-props", expectedProps);

    for (const stack of [react, solid]) {
      await expect(stack.region).toBeVisible();
      await expect(alertToast(stack.region)).toContainText(toastDemoDefaults.children);
    }

    const reactStyle = await toastStyleContract(react.region);
    const solidStyle = await toastStyleContract(solid.region);

    expect(reactStyle.backgroundColor).toBe(solidStyle.backgroundColor);
    expect(reactStyle.color).toBe(solidStyle.color);
    expect(reactStyle.display).toBe("flex");
    expect(solidStyle.display).toBe("flex");
    expect(Number.parseFloat(reactStyle.borderRadius)).toBeGreaterThan(0);
    expect(Number.parseFloat(solidStyle.borderRadius)).toBeGreaterThan(0);
    expect(Number.parseFloat(reactStyle.minHeight)).toBeGreaterThanOrEqual(56);
    expect(Number.parseFloat(solidStyle.minHeight)).toBeGreaterThanOrEqual(56);

    await expectScreenshotPair(
      page,
      alertToast(react.region),
      alertToast(solid.region),
      "Toast default surface",
      toastDefaultPairDiff,
    );
  });

  test("routes ToastQueue variant methods and icon contracts", async ({ page }) => {
    for (const variant of toastVariantOptions) {
      const message = `${variant} toast`;
      const { react, solid } = await toastFixtures(page, { variant, children: message });

      for (const stack of [react, solid]) {
        await expect(alertToast(stack.region)).toContainText(message);
        const svgCount = await alertToast(stack.region).locator("svg").count();
        if (variant === "neutral") {
          expect(svgCount).toBe(1);
        } else {
          expect(svgCount).toBeGreaterThanOrEqual(2);
        }
      }

      await expect(solid.region.getByRole("alertdialog")).toHaveAttribute(
        "data-solid-spectrum-variant",
        variant,
      );
    }
  });

  test("routes ToastContainer placement values", async ({ page }) => {
    const placements = {
      react: new Map<string, Awaited<ReturnType<typeof regionPlacementContract>>>(),
      solid: new Map<string, Awaited<ReturnType<typeof regionPlacementContract>>>(),
    };

    for (const placement of toastPlacementOptions) {
      const { react, solid } = await toastFixtures(page, { placement });
      const reactPlacement = await regionPlacementContract(react.region);
      const solidPlacement = await regionPlacementContract(solid.region);
      placements.react.set(placement, reactPlacement);
      placements.solid.set(placement, solidPlacement);

      for (const contract of [reactPlacement, solidPlacement]) {
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

  test("renders the S2 collapsed stack and expansion controls", async ({ page }) => {
    const { react, solid } = await toastFixtures(page, {
      children: "Stack toast",
      count: 3,
    });

    for (const stack of [react, solid]) {
      await expect(alertToast(stack.region)).toContainText("Stack toast 3");
      await expect(stack.region.getByText("Stack toast 2")).toHaveCount(0);
      await expect(stack.region.getByRole("button", { name: /Show all/ })).toBeVisible();

      await stack.region.getByRole("button", { name: /Show all/ }).click();

      await expect(stack.region.getByText("Stack toast 2")).toBeVisible();
      await expect(stack.region.getByText("Stack toast 3")).toBeVisible();
      await expect(stack.region.getByRole("button", { name: "Clear all" })).toBeVisible();
      await expect(stack.region.getByRole("button", { name: "Collapse" })).toBeVisible();

      await stack.region.getByRole("button", { name: "Collapse" }).click();

      await expect(stack.region.getByText("Stack toast 2")).toHaveCount(0);

      await stack.region.getByRole("button", { name: /Show all/ }).click();
      await expect(stack.region.getByText("Stack toast 2")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(stack.region.getByText("Stack toast 2")).toHaveCount(0);

      await stack.region.getByRole("button", { name: /Show all/ }).click();
      await expect(stack.region.getByText("Stack toast 2")).toBeVisible();
      await stackOverlay(stack.region).click({ position: { x: 8, y: 8 } });
      await expect(stack.region.getByText("Stack toast 2")).toHaveCount(0);
    }
  });

  test("clears expanded stacks from ToastContainer controls", async ({ page }) => {
    const { react, solid } = await toastFixtures(page, {
      children: "Clearable toast",
      count: 2,
    });

    for (const stack of [react, solid]) {
      await expect(stack.root).toHaveAttribute("data-comparison-toast-close-count", "0");
      await stack.region.getByRole("button", { name: /Show all/ }).click();
      await stack.region.getByRole("button", { name: "Clear all" }).click();
      await expect(stack.region.getByText(/Clearable toast/)).toHaveCount(0);
      await expect(stack.root).toHaveAttribute("data-comparison-toast-close-count", "0");
    }
  });

  test("actionable toasts call onAction and close when requested", async ({ page }) => {
    const { react, solid } = await toastFixtures(page, {
      children: "File deleted",
      showAction: true,
      shouldCloseOnAction: true,
    });

    for (const stack of [react, solid]) {
      await expect(stack.region.getByRole("button", { name: "Undo" })).toBeVisible();
      await stack.region.getByRole("button", { name: "Undo" }).click();
      await expect(stack.root).toHaveAttribute("data-comparison-toast-action-count", "1");
      await expect(stack.root).toHaveAttribute("data-comparison-toast-close-count", "1");
      await expect(stack.region.getByText("File deleted")).toHaveCount(0);
    }
  });

  test("actionable toasts do not auto-dismiss even when timeout is routed", async ({ page }) => {
    const { react, solid } = await toastFixtures(page, {
      children: "Needs action",
      showAction: true,
      autoDismiss: true,
      timeout: 100,
    });

    await page.waitForTimeout(300);

    await expect(alertToast(react.region)).toContainText("Needs action");
    await expect(alertToast(solid.region)).toContainText("Needs action");
  });
});
