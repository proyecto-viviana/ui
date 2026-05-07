import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection } from "./comparison-page";

type ElementGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  position: string;
  visibleInViewport: boolean;
};

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

async function geometry(locator: Locator): Promise<ElementGeometry> {
  return locator.evaluate((node) => {
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

function assertVisibleFieldGeometry(value: ElementGeometry) {
  expect(value.visibleInViewport).toBe(true);
  expect(value.width).toBeGreaterThan(120);
  expect(value.width).toBeLessThanOrEqual(560);
  expect(value.height).toBeGreaterThan(45);
  expect(value.height).toBeLessThanOrEqual(180);
}

function assertVisiblePopoverGeometry(value: ElementGeometry) {
  expect(value.visibleInViewport).toBe(true);
  expect(value.width).toBeGreaterThan(220);
  expect(value.width).toBeLessThanOrEqual(420);
  expect(value.height).toBeGreaterThan(180);
  expect(value.height).toBeLessThanOrEqual(700);
}

async function clickOutsidePopup(page: Page, popup: Locator) {
  const box = await geometry(popup);
  const x = Math.max(8, Math.min(20, box.x - 24));
  const y = Math.max(8, Math.min(20, box.y - 24));
  await page.mouse.click(x, y);
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

      for (let i = 0; i < reactPixels.length; i += 4) {
        const r = Math.abs(reactPixels[i] - solidPixels[i]);
        const g = Math.abs(reactPixels[i + 1] - solidPixels[i + 1]);
        const b = Math.abs(reactPixels[i + 2] - solidPixels[i + 2]);
        const a = Math.abs(reactPixels[i + 3] - solidPixels[i + 3]);
        const delta = Math.max(r, g, b, a);
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

async function openCalendar(card: Locator) {
  const trigger = card.getByRole("button", { name: /calendar|choose date/i });
  await expect(trigger).toBeVisible();
  await trigger.click();
}

async function pickFirstEnabledDate(popover: Locator) {
  const cell = popover.locator('[role="gridcell"]:not([aria-disabled="true"])').first();
  await expect(cell).toBeVisible();
  await cell.click();
}

async function calendarPopup(page: Page) {
  const popover = page
    .locator(".comparison-popover")
    .filter({ has: page.locator('[role="grid"]') })
    .first();
  if (await popover.count()) {
    await expect(popover).toBeVisible();
    return popover;
  }

  const roleDialog = page
    .getByRole("dialog")
    .filter({ has: page.locator('[role="grid"]') })
    .first();
  if (await roleDialog.count()) {
    await expect(roleDialog).toBeVisible();
    return roleDialog;
  }

  throw new Error("Expected an open calendar popup");
}

async function expectNoCalendarPopup(page: Page) {
  await expect(page.locator('[role="grid"]')).toHaveCount(0);
}

test.describe("comparison DatePicker visual parity", () => {
  test("React and Solid DatePickers are visually comparable when closed and open", async ({
    page,
  }) => {
    await page.goto("/components/datepicker/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const section = await styledSection(page);
    const reactCard = await frameworkPanel(section, "React Spectrum stack");
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactCard.locator('[data-comparison-control-root="datepicker"]');
    const solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');

    await expect(reactRoot).toHaveCount(1);
    await expect(solidRoot).toHaveCount(1);
    await expect(reactRoot).toBeVisible();
    await expect(solidRoot).toBeVisible();
    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", /"size":"M"/);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", /"size":"M"/);
    await expect(reactCard.getByText("Due date").first()).toBeVisible();
    await expect(solidCard.getByText("Due date").first()).toBeVisible();

    const reactField = reactRoot;
    const solidField = solidRoot;
    await expect(reactField).toBeVisible();
    await expect(solidField).toBeVisible();

    const reactFieldGeometry = await geometry(reactField);
    const solidFieldGeometry = await geometry(solidField);
    assertVisibleFieldGeometry(reactFieldGeometry);
    assertVisibleFieldGeometry(solidFieldGeometry);
    expect(Math.abs(solidFieldGeometry.width - reactFieldGeometry.width)).toBeLessThanOrEqual(96);

    await expect(reactField).toHaveScreenshot("datepicker-field-react.png", {
      animations: "disabled",
    });
    await expect(solidField).toHaveScreenshot("datepicker-field-solid.png", {
      animations: "disabled",
    });
    const [reactFieldPng, solidFieldPng] = await Promise.all([
      reactField.screenshot({ animations: "disabled" }),
      solidField.screenshot({ animations: "disabled" }),
    ]);
    await compareScreenshots(
      page,
      reactFieldPng,
      solidFieldPng,
      "DatePicker field",
      0.75,
      240,
      128,
    );

    await openCalendar(reactCard);
    const reactDialog = await calendarPopup(page);
    await expect(reactDialog.getByRole("grid")).toBeVisible();
    const reactPopoverGeometry = await geometry(reactDialog);
    assertVisiblePopoverGeometry(reactPopoverGeometry);
    await page.mouse.move(4, 4);
    await expect(reactDialog).toHaveScreenshot("datepicker-popover-react.png", {
      animations: "disabled",
    });
    await reactDialog.screenshot({ animations: "disabled" });

    await page.keyboard.press("Escape");
    await expectNoCalendarPopup(page);
    await expect(reactCard.getByRole("button", { name: /calendar|choose date/i })).toBeFocused();

    await openCalendar(solidCard);
    const solidDialog = await calendarPopup(page);
    await expect(solidDialog.getByRole("grid")).toBeVisible();
    const solidPopoverGeometry = await geometry(solidDialog);
    assertVisiblePopoverGeometry(solidPopoverGeometry);
    expect(solidPopoverGeometry.position).not.toBe("static");
    await page.mouse.move(4, 4);
    await expect(solidDialog).toHaveScreenshot("datepicker-popover-solid.png", {
      animations: "disabled",
    });

    expect(Math.abs(solidPopoverGeometry.width - reactPopoverGeometry.width)).toBeLessThanOrEqual(
      96,
    );
    expect(Math.abs(solidPopoverGeometry.height - reactPopoverGeometry.height)).toBeLessThanOrEqual(
      140,
    );

    await page.keyboard.press("Escape");
    await expectNoCalendarPopup(page);
    await expect(solidCard.getByRole("button", { name: /calendar|choose date/i })).toBeFocused();

    await openCalendar(solidCard);
    const solidDialogForSelect = await calendarPopup(page);
    await pickFirstEnabledDate(solidDialogForSelect);
    await expectNoCalendarPopup(page);
    await expect(solidCard.locator("[data-comparison-value]")).not.toHaveAttribute(
      "data-comparison-value",
      "",
    );

    await openCalendar(reactCard);
    const reactPopoverForSelect = await calendarPopup(page);
    await pickFirstEnabledDate(reactPopoverForSelect);
    await expectNoCalendarPopup(page);
    await expect(reactCard.locator("[data-comparison-value]")).not.toHaveAttribute(
      "data-comparison-value",
      "",
    );

    await openCalendar(reactCard);
    const reactPopoverForOutside = await calendarPopup(page);
    await clickOutsidePopup(page, reactPopoverForOutside);
    await expectNoCalendarPopup(page);

    await openCalendar(solidCard);
    const solidPopoverForOutside = await calendarPopup(page);
    await clickOutsidePopup(page, solidPopoverForOutside);
    await expectNoCalendarPopup(page);
  });

  test("size and validation query state renders both styled stacks", async ({ page }) => {
    await page.goto("/components/datepicker/?size=XL&isInvalid=true&isRequired=true");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const section = await styledSection(page);
    const reactCard = await frameworkPanel(section, "React Spectrum stack");
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactCard.locator('[data-comparison-control-root="datepicker"]');
    const solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", /"size":"XL"/);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", /"size":"XL"/);
    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", /"isInvalid":true/);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", /"isInvalid":true/);
    await expect(reactCard.getByText("Select a due date.")).toBeVisible();
    await expect(solidCard.getByText("Select a due date.")).toBeVisible();

    const reactGeometry = await geometry(reactRoot);
    const solidGeometry = await geometry(solidRoot);
    assertVisibleFieldGeometry(reactGeometry);
    assertVisibleFieldGeometry(solidGeometry);
    expect(solidGeometry.height).toBeGreaterThan(reactGeometry.height * 0.5);
  });
});
