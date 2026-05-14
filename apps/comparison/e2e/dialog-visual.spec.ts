import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

type DialogGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  position: string;
  visibleInViewport: boolean;
};

const dialogText = "Dialog focus and dismissal are compared from this island.";
const strictPairDiff = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 0,
};

async function frameworkCard(
  section: Locator,
  framework: "React Spectrum stack" | "Solidaria stack",
) {
  const card = section.locator(".framework-card").filter({ hasText: framework });
  await expect(card).toHaveCount(1);
  return card;
}

async function openDialog(card: Locator) {
  const trigger = card.getByRole("button", { name: "Open Dialog" });
  await expect(trigger).toBeVisible();
  await trigger.click();
}

async function closeButton(dialog: Locator) {
  const button = dialog.getByRole("button", { name: /dismiss|close/i }).first();
  await expect(button).toBeVisible();
  return button;
}

async function compareElementScreenshots(
  page: Page,
  reactElement: Locator,
  solidElement: Locator,
  label: string,
  maxMismatchRatio: number = strictPairDiff.maxMismatchRatio,
  maxDimensionDelta: number = strictPairDiff.maxDimensionDelta,
  pixelThreshold: number = strictPairDiff.pixelThreshold,
) {
  const [reactPng, solidPng] = await Promise.all([
    reactElement.screenshot({ animations: "disabled" }),
    solidElement.screenshot({ animations: "disabled" }),
  ]);

  await compareScreenshots(
    page,
    reactPng,
    solidPng,
    label,
    maxMismatchRatio,
    maxDimensionDelta,
    pixelThreshold,
  );
}

async function compareScreenshots(
  page: Page,
  reactPng: Buffer,
  solidPng: Buffer,
  label: string,
  maxMismatchRatio: number = strictPairDiff.maxMismatchRatio,
  maxDimensionDelta: number = strictPairDiff.maxDimensionDelta,
  pixelThreshold: number = strictPairDiff.pixelThreshold,
) {
  const result = await page.evaluate(
    async ({ reactBase64, solidBase64, pixelThreshold }) => {
      async function loadImage(base64: string) {
        const response = await fetch(`data:image/png;base64,${base64}`);
        return createImageBitmap(await response.blob());
      }

      const [reactImage, solidImage] = await Promise.all([
        loadImage(reactBase64),
        loadImage(solidBase64),
      ]);

      const width = Math.min(reactImage.width, solidImage.width);
      const height = Math.min(reactImage.height, solidImage.height);

      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("Could not create canvas context for screenshot comparison");
      }

      context.drawImage(reactImage, 0, 0, width, height);
      context.drawImage(solidImage, width, 0, width, height);

      const reactPixels = context.getImageData(0, 0, width, height).data;
      const solidPixels = context.getImageData(width, 0, width, height).data;
      let mismatched = 0;
      let maxChannelDelta = 0;

      for (let i = 0; i < reactPixels.length; i += 4) {
        const r = Math.abs(reactPixels[i] - solidPixels[i]);
        const g = Math.abs(reactPixels[i + 1] - solidPixels[i + 1]);
        const b = Math.abs(reactPixels[i + 2] - solidPixels[i + 2]);
        const a = Math.abs(reactPixels[i + 3] - solidPixels[i + 3]);
        const delta = Math.max(r, g, b, a);
        maxChannelDelta = Math.max(maxChannelDelta, delta);

        if (delta > pixelThreshold) {
          mismatched += 1;
        }
      }

      return {
        width: reactImage.width,
        height: reactImage.height,
        comparedWidth: solidImage.width,
        comparedHeight: solidImage.height,
        mismatchRatio: mismatched / (width * height),
        maxChannelDelta,
      };
    },
    {
      reactBase64: reactPng.toString("base64"),
      solidBase64: solidPng.toString("base64"),
      pixelThreshold,
    },
  );

  expect(Math.abs(result.width - result.comparedWidth), `${label} width delta`).toBeLessThanOrEqual(
    maxDimensionDelta,
  );
  expect(
    Math.abs(result.height - result.comparedHeight),
    `${label} height delta`,
  ).toBeLessThanOrEqual(maxDimensionDelta);
  expect(
    result.mismatchRatio,
    `${label} screenshot mismatch ratio ${result.mismatchRatio} exceeded ${maxMismatchRatio}`,
  ).toBeLessThanOrEqual(maxMismatchRatio);
}

async function dialogGeometry(dialog: Locator): Promise<DialogGeometry> {
  return dialog.evaluate((node) => {
    const element = node as HTMLElement;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      position: style.position,
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

async function clickOutsideDialog(page: Page, dialog: Locator) {
  const geometry = await dialogGeometry(dialog);
  const x = Math.max(8, Math.min(24, geometry.x - 24));
  const y = Math.max(8, Math.min(24, geometry.y - 24));
  await page.mouse.click(x, y);
}

async function expectTabFocusContained(page: Page, dialog: Locator) {
  await page.keyboard.press("Tab");
  const activeAfterFirstTab = dialog.page().locator(":focus");
  await expect(activeAfterFirstTab).toBeVisible();
  await expect(dialog).toContainText(dialogText);
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
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

function assertVisibleDialogGeometry(geometry: DialogGeometry) {
  expect(geometry.visibleInViewport).toBe(true);
  expect(geometry.width).toBeGreaterThan(240);
  expect(geometry.width).toBeLessThanOrEqual(720);
  expect(geometry.height).toBeGreaterThan(90);
  expect(geometry.height).toBeLessThanOrEqual(320);
  expect(geometry.x).toBeGreaterThan(0);
  expect(geometry.y).toBeGreaterThan(40);
}

test.describe("comparison Dialog visual parity", () => {
  test("React and Solid dialogs open visibly, stay in viewport, and dismiss", async ({
    page,
  }, testInfo: TestInfo) => {
    await page.goto("/components/dialog/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("astro-island")).toHaveCount(0);

    const styledSection = page.locator(".layer-block").filter({
      has: page.getByRole("heading", { name: "Styled Layer" }),
    });
    await expect(styledSection).toHaveCount(1);
    await styledSection.scrollIntoViewIfNeeded();

    const reactCard = await frameworkCard(styledSection, "React Spectrum stack");
    const solidCard = await frameworkCard(styledSection, "Solidaria stack");
    const solidRoot = page.locator(".comparison-stack[data-comparison-open]").first();
    const reactTrigger = reactCard.getByRole("button", { name: "Open Dialog" });
    const solidTrigger = solidCard.getByRole("button", { name: "Open Dialog" });

    await page.screenshot({
      animations: "disabled",
      path: testInfo.outputPath("dialog-before-react-click.png"),
    });

    await expect(solidRoot).toHaveAttribute("data-comparison-open", "false");
    await compareElementScreenshots(page, reactTrigger, solidTrigger, "Dialog trigger");

    await reactTrigger.hover();
    const solidTriggerBorderBeforeHover = await solidTrigger.evaluate(
      (node) => window.getComputedStyle(node as HTMLElement).borderColor,
    );
    await solidTrigger.hover();
    await expect(solidTrigger).toHaveAttribute("data-hovered", "true");
    await expect
      .poll(() =>
        solidTrigger.evaluate((node) => window.getComputedStyle(node as HTMLElement).borderColor),
      )
      .not.toBe(solidTriggerBorderBeforeHover);

    await openDialog(reactCard);
    const reactDialog = page.getByRole("dialog", { name: "Review Changes" });
    await expect(reactDialog).toBeVisible();
    await expect(reactDialog.getByRole("heading", { name: "Review Changes" })).toBeVisible();
    await expect(reactDialog.getByText(dialogText)).toBeVisible();
    const reactCloseButton = await closeButton(reactDialog);

    const reactGeometry = await dialogGeometry(reactDialog);
    assertVisibleDialogGeometry(reactGeometry);
    await expectDialogViewportUnoccluded(reactDialog);
    await page.screenshot({
      animations: "disabled",
      path: testInfo.outputPath("dialog-after-react-click.png"),
    });
    const reactDialogPng = await reactDialog.screenshot({ animations: "disabled" });
    await expectTabFocusContained(page, reactDialog);

    await clickOutsideDialog(page, reactDialog);
    await expect(reactDialog).toHaveCount(0);

    await openDialog(reactCard);
    await expect(reactDialog).toBeVisible();
    await reactCloseButton.click();
    await expect(reactDialog).toHaveCount(0);

    await openDialog(solidCard);
    await expect(solidRoot).toHaveAttribute("data-comparison-open", "true");

    const solidDialog = page.getByRole("dialog", { name: "Review Changes" });
    await expect(solidDialog).toBeVisible();
    await expect(solidDialog).toHaveClass(/comparison-spectrum-Dialog/);
    await expect(solidDialog.getByRole("heading", { name: "Review Changes" })).toBeVisible();
    await expect(solidDialog.getByText(dialogText)).toBeVisible();
    await closeButton(solidDialog);

    const solidGeometry = await dialogGeometry(solidDialog);
    assertVisibleDialogGeometry(solidGeometry);
    expect(solidGeometry.position).not.toBe("static");
    const solidDialogPng = await solidDialog.screenshot({ animations: "disabled" });
    await compareScreenshots(page, reactDialogPng, solidDialogPng, "Dialog surface");
    await expectTabFocusContained(page, solidDialog);

    expect(Math.abs(solidGeometry.x - reactGeometry.x)).toBeLessThanOrEqual(40);
    expect(Math.abs(solidGeometry.y - reactGeometry.y)).toBeLessThanOrEqual(80);
    expect(Math.abs(solidGeometry.width - reactGeometry.width)).toBeLessThanOrEqual(60);

    await clickOutsideDialog(page, solidDialog);
    await expect(solidDialog).toHaveCount(0);
    await expect(solidRoot).toHaveAttribute("data-comparison-open", "false");

    await openDialog(solidCard);
    await expect(solidRoot).toHaveAttribute("data-comparison-open", "true");
    const solidDialogAfterOutsideDismiss = page.getByRole("dialog", { name: "Review Changes" });
    await expect(solidDialogAfterOutsideDismiss).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(solidDialogAfterOutsideDismiss).toHaveCount(0);
    await expect(solidRoot).toHaveAttribute("data-comparison-open", "false");
    await expect(solidRoot).toHaveAttribute("data-comparison-focus-returned", "true");
  });
});
