import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  compareScreenshots,
  pinComparisonTheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

type DialogGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  visibleInViewport: boolean;
};

const dialogTitle = "Review Changes";
const dialogText = "Dialog focus and dismissal are compared from this island.";

const dialogSurfaceDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.04,
  maxDimensionDelta: 12,
  pixelThreshold: 32,
};

async function setupDialogRoute(page: Page, path = "/components/dialog/") {
  await pinComparisonTheme(page, "dark");
  await page.goto(path);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = page
    .locator('.s2-framework-panel[data-framework="react"] [data-comparison-control-root="dialog"]')
    .first();
  const solidRoot = page
    .locator('.s2-framework-panel[data-framework="solid"] [data-comparison-control-root="dialog"]')
    .first();

  await expect(reactRoot).toHaveCount(1);
  await expect(solidRoot).toHaveCount(1);
  await expect(reactRoot).toHaveAttribute("data-comparison-open", "false");
  await expect(solidRoot).toHaveAttribute("data-comparison-open", "false");

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

function triggerFor(panel: Locator, label = "Open Dialog") {
  return panel.getByRole("button", { name: label }).first();
}

async function openDialog(panel: Locator, title = dialogTitle) {
  const trigger = triggerFor(panel);
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = panel.page().getByRole("dialog", { name: title });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function closeButton(dialog: Locator) {
  const button = dialog.getByRole("button", { name: /dismiss|close/i }).first();
  await expect(button).toBeVisible();
  return button;
}

async function dialogGeometry(dialog: Locator): Promise<DialogGeometry> {
  return dialog.evaluate((node) => {
    const rect = (node as HTMLElement).getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      visibleInViewport:
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth,
    };
  });
}

function assertDefaultDialogGeometry(geometry: DialogGeometry) {
  expect(geometry.visibleInViewport).toBe(true);
  expect(geometry.width).toBeGreaterThanOrEqual(420);
  expect(geometry.width).toBeLessThanOrEqual(520);
  expect(geometry.height).toBeGreaterThan(100);
  expect(geometry.height).toBeLessThanOrEqual(360);
  expect(geometry.x).toBeGreaterThan(0);
  expect(geometry.y).toBeGreaterThan(40);
}

async function expectDialogViewportUnoccluded(dialog: Locator) {
  const occludedPoints = await dialog.evaluate((node) => {
    const element = node as HTMLElement;
    const rect = element.getBoundingClientRect();
    const points = [
      [rect.left + rect.width / 2, rect.top + rect.height / 2],
      [rect.left + 24, rect.top + 24],
      [rect.right - 24, rect.top + 24],
      [rect.left + 24, rect.bottom - 24],
      [rect.right - 24, rect.bottom - 24],
    ];

    return points.filter(([x, y]) => {
      const topElement = document.elementFromPoint(x, y);
      return !topElement || !element.contains(topElement);
    });
  });

  expect(occludedPoints, "dialog should be topmost at sampled viewport points").toHaveLength(0);
}

async function expectTabFocusContained(page: Page, dialog: Locator) {
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
}

async function clickOutsideDialog(page: Page, dialog: Locator) {
  const geometry = await dialogGeometry(dialog);
  const x = Math.max(12, Math.min(36, geometry.x - 24));
  const y = Math.max(12, Math.min(36, geometry.y - 24));
  await page.mouse.click(x, y);
}

async function expectTriggerGeometryParity(reactTrigger: Locator, solidTrigger: Locator) {
  const [reactBox, solidBox] = await Promise.all([
    reactTrigger.boundingBox(),
    solidTrigger.boundingBox(),
  ]);

  expect(reactBox, "React Dialog trigger should have a measurable box").toBeTruthy();
  expect(solidBox, "Solid Dialog trigger should have a measurable box").toBeTruthy();
  expect(Math.abs((reactBox?.width ?? 0) - (solidBox?.width ?? 0))).toBeLessThanOrEqual(8);
  expect(Math.abs((reactBox?.height ?? 0) - (solidBox?.height ?? 0))).toBeLessThanOrEqual(4);
}

test.describe("comparison Dialog visual parity", () => {
  test("React and Solid triggers and dialog surfaces match the modeled default route", async ({
    page,
  }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await setupDialogRoute(page);
    const reactTrigger = triggerFor(reactPanel);
    const solidTrigger = triggerFor(solidPanel);

    await expect(reactTrigger).toHaveText("Open Dialog");
    await expect(solidTrigger).toHaveText("Open Dialog");
    await expectTriggerGeometryParity(reactTrigger, solidTrigger);

    const reactDialog = await openDialog(reactPanel);
    await expect(reactRoot).toHaveAttribute("data-comparison-open", "true");
    await expect(reactDialog.getByRole("heading", { name: dialogTitle })).toBeVisible();
    await expect(reactDialog.getByText(dialogText)).toBeVisible();
    await closeButton(reactDialog);
    const reactGeometry = await dialogGeometry(reactDialog);
    assertDefaultDialogGeometry(reactGeometry);
    await expectDialogViewportUnoccluded(reactDialog);
    await expectTabFocusContained(page, reactDialog);
    const reactDialogPng = await reactDialog.screenshot({ animations: "disabled" });

    await clickOutsideDialog(page, reactDialog);
    await expect(reactDialog).toHaveCount(0);
    await expect(reactRoot).toHaveAttribute("data-comparison-open", "false");

    const solidDialog = await openDialog(solidPanel);
    await expect(solidRoot).toHaveAttribute("data-comparison-open", "true");
    await expect(solidDialog).toHaveClass(/comparison-spectrum-Dialog/);
    await expect(solidDialog).toHaveAttribute("data-size", "M");
    await expect(solidDialog.getByRole("heading", { name: dialogTitle })).toBeVisible();
    await expect(solidDialog.getByText(dialogText)).toBeVisible();
    await closeButton(solidDialog);
    const solidGeometry = await dialogGeometry(solidDialog);
    assertDefaultDialogGeometry(solidGeometry);
    await expectDialogViewportUnoccluded(solidDialog);
    await expectTabFocusContained(page, solidDialog);
    const solidDialogPng = await solidDialog.screenshot({ animations: "disabled" });

    expect(Math.abs(solidGeometry.x - reactGeometry.x)).toBeLessThanOrEqual(24);
    expect(Math.abs(solidGeometry.y - reactGeometry.y)).toBeLessThanOrEqual(48);
    expect(Math.abs(solidGeometry.width - reactGeometry.width)).toBeLessThanOrEqual(12);

    await compareScreenshots(
      page,
      reactDialogPng,
      solidDialogPng,
      "Dialog surface default",
      dialogSurfaceDiff,
    );

    await page.keyboard.press("Escape");
    await expect(solidDialog).toHaveCount(0);
    await expect(solidRoot).toHaveAttribute("data-comparison-open", "false");
    await expect(solidTrigger).toBeFocused();
  });

  test("route controls cover role, size, and keyboard dismissal behavior", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await setupDialogRoute(
      page,
      "/components/dialog/?role=alertdialog&size=XL&isKeyboardDismissDisabled=true&title=Alert%20Review",
    );

    await expect
      .poll(() => reactRoot.getAttribute("data-comparison-control-props"))
      .toContain('"role":"alertdialog"');
    await expect
      .poll(() => solidRoot.getAttribute("data-comparison-control-props"))
      .toContain('"role":"alertdialog"');

    await triggerFor(reactPanel).click();
    const reactAlert = page.getByRole("alertdialog", { name: "Alert Review" });
    await expect(reactAlert).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(reactAlert).toBeVisible();
    await (await closeButton(reactAlert)).click();
    await expect(reactAlert).toHaveCount(0);

    await triggerFor(solidPanel).click();
    const solidAlert = page.getByRole("alertdialog", { name: "Alert Review" });
    await expect(solidAlert).toBeVisible();
    await expect(solidAlert).toHaveAttribute("data-size", "XL");
    const geometry = await dialogGeometry(solidAlert);
    expect(geometry.width).toBeGreaterThanOrEqual(900);
    expect(geometry.visibleInViewport, JSON.stringify(geometry)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(solidAlert).toBeVisible();
    await (await closeButton(solidAlert)).click();
    await expect(solidAlert).toHaveCount(0);
  });
});
