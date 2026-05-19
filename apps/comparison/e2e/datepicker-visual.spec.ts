import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, expectScreenshotPair, pinComparisonTheme } from "./visual-diff";

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

const datePickerFieldPairDiff = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 1,
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
  await card.scrollIntoViewIfNeeded();
  const trigger = card.getByRole("button", { name: /calendar|choose date/i });
  await expect(trigger).toBeVisible();
  await trigger.click();
}

async function closedDatePickerField(panel: Locator) {
  const root = panel.locator('[data-comparison-control-root="datepicker"]');
  await expect(root).toHaveCount(1);
  await expect(root).toBeVisible();

  const nestedField = root.locator(".comparison-datepicker-root").first();
  if ((await nestedField.count()) > 0) {
    await expect(nestedField).toBeVisible();
    return nestedField;
  }

  await expect(root.locator('[role="spinbutton"]')).toHaveCount(3);
  await expect(root.getByRole("button", { name: /calendar|choose date/i })).toBeVisible();
  return root;
}

async function pickFirstEnabledDate(popover: Locator) {
  const cellContent = popover
    .locator(
      [
        '[role="gridcell"] [role="button"]:not([data-disabled]):not([data-outside-month])',
        '[role="gridcell"] button:not([disabled])',
      ].join(", "),
    )
    .first();
  await expect(cellContent).toBeVisible();
  await cellContent.click();
}

async function calendarPopup(page: Page) {
  await expect(page.locator('[role="grid"]').first()).toBeVisible();

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

async function calendarSurface(page: Page) {
  const surface = page
    .locator("[data-placement]")
    .filter({ has: page.locator('[role="grid"]') })
    .first();
  await expect(surface).toBeVisible();
  return surface;
}

async function expectNoCalendarPopup(page: Page) {
  await expect(page.locator('[role="grid"]')).toHaveCount(0);
}

async function datePickerColors(page: Page, framework: "React Spectrum stack" | "Solidaria stack") {
  return page.evaluate((frameworkName) => {
    const isSolid = frameworkName === "Solidaria stack";
    const card = Array.from(document.querySelectorAll("article.s2-framework-panel")).find(
      (element) => element.textContent?.includes(isSolid ? "solid-spectrum" : "React Spectrum S2"),
    );
    if (!card) {
      throw new Error(`Could not find ${frameworkName} DatePicker comparison card`);
    }

    const root = card.querySelector('[data-comparison-control-root="datepicker"]');
    if (!root) {
      throw new Error(`Could not find ${frameworkName} DatePicker root`);
    }

    const fieldGroup = Array.from(root.querySelectorAll("div")).find(
      (element) =>
        element.textContent === "mm/dd/yyyy" &&
        getComputedStyle(element).backgroundColor !== "rgba(0, 0, 0, 0)",
    );
    if (!fieldGroup) {
      throw new Error(`Could not find styled ${frameworkName} DatePicker field group`);
    }

    const rootStyle = getComputedStyle(root);
    const fieldStyle = getComputedStyle(fieldGroup);

    return {
      colorScheme: rootStyle.colorScheme,
      rootColor: rootStyle.color,
      fieldColor: fieldStyle.color,
      fieldBackground: fieldStyle.backgroundColor,
      fieldBorderColor: fieldStyle.borderColor,
      descriptionVisible: root.textContent?.includes("Choose the project due date.") ?? false,
      errorVisible: root.textContent?.includes("Select a due date.") ?? false,
    };
  }, framework);
}

async function datePickerDisabledComputed(
  page: Page,
  framework: "React Spectrum stack" | "Solidaria stack",
) {
  return page.evaluate((frameworkName) => {
    const isSolid = frameworkName === "Solidaria stack";
    const card = Array.from(document.querySelectorAll("article.s2-framework-panel")).find(
      (element) => element.textContent?.includes(isSolid ? "solid-spectrum" : "React Spectrum S2"),
    );
    const root = card?.querySelector('[data-comparison-control-root="datepicker"]');
    const fieldGroup = Array.from(root?.querySelectorAll("div") ?? []).find(
      (element) =>
        element.textContent === "mm/dd/yyyy" &&
        getComputedStyle(element).backgroundColor !== "rgba(0, 0, 0, 0)",
    );
    const button = root?.querySelector("button");
    const segment = root?.querySelector('[role="spinbutton"]');
    if (!fieldGroup || !button || !segment) {
      throw new Error(`Could not find disabled ${frameworkName} DatePicker elements`);
    }

    const style = (element: Element) => {
      const computed = getComputedStyle(element);
      return {
        color: computed.color,
        background: computed.backgroundColor,
        border: computed.borderColor,
        opacity: computed.opacity,
        cursor: computed.cursor,
      };
    };

    return {
      field: style(fieldGroup),
      button: style(button),
      segment: style(segment),
    };
  }, framework);
}

async function solidCalendarPopoverColors(page: Page) {
  return page.evaluate(() => {
    const popover = Array.from(
      document.querySelectorAll(".comparison-popover, [role='dialog']"),
    ).find((element) => element.querySelector('[role="grid"]'));
    if (!popover) {
      throw new Error("Could not find open Solid DatePicker calendar popover");
    }

    const firstCell = popover.querySelector('[role="gridcell"]');
    const popoverStyle = getComputedStyle(popover);
    const cellStyle = firstCell ? getComputedStyle(firstCell) : null;

    return {
      colorScheme: popoverStyle.colorScheme,
      background: popoverStyle.backgroundColor,
      color: popoverStyle.color,
      outlineColor: popoverStyle.outlineColor,
      cellColor: cellStyle?.color ?? null,
    };
  });
}

async function clickSolidDatePickerBlankFieldArea(page: Page) {
  const point = await page.evaluate(() => {
    const solidCard = Array.from(document.querySelectorAll("article.s2-framework-panel")).find(
      (element) => element.textContent?.includes("solid-spectrum"),
    );
    const root = solidCard?.querySelector('[data-comparison-control-root="datepicker"]');
    const fieldGroup = Array.from(root?.querySelectorAll("div") ?? []).find(
      (element) =>
        element.textContent === "mm/dd/yyyy" &&
        getComputedStyle(element).backgroundColor !== "rgba(0, 0, 0, 0)",
    );
    const button = fieldGroup?.querySelector("button");
    if (!fieldGroup || !button) {
      throw new Error("Could not find Solid DatePicker field blank click target");
    }

    fieldGroup.scrollIntoView({ block: "center", inline: "nearest" });
    const fieldRect = fieldGroup.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return {
      x: Math.max(fieldRect.left + 8, buttonRect.left - 10),
      y: fieldRect.top + fieldRect.height / 2,
    };
  });

  await page.mouse.click(point.x, point.y);
}

async function datePickerIconGeometry(
  page: Page,
  framework: "React Spectrum stack" | "Solidaria stack",
) {
  return page.evaluate((frameworkName) => {
    const isSolid = frameworkName === "Solidaria stack";
    const card = Array.from(document.querySelectorAll("article.s2-framework-panel")).find(
      (element) => element.textContent?.includes(isSolid ? "solid-spectrum" : "React Spectrum S2"),
    );
    const root = card?.querySelector('[data-comparison-control-root="datepicker"]');
    const button = root?.querySelector("button");
    const icon = button?.querySelector("svg");
    if (!button || !icon) {
      throw new Error(`Could not find ${frameworkName} DatePicker calendar icon`);
    }

    const buttonRect = button.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const iconPath = icon.querySelector("path");
    const iconPathRect = iconPath?.getBoundingClientRect();
    const field = Array.from(root?.querySelectorAll("div") ?? []).find(
      (element) =>
        element.textContent === "mm/dd/yyyy" &&
        getComputedStyle(element).backgroundColor !== "rgba(0, 0, 0, 0)",
    );
    const fieldRect = field?.getBoundingClientRect();
    return {
      fieldWidth: fieldRect?.width ?? null,
      buttonWidth: buttonRect.width,
      buttonHeight: buttonRect.height,
      iconWidth: iconRect.width,
      iconHeight: iconRect.height,
      iconPathWidth: iconPathRect?.width ?? null,
      iconPathHeight: iconPathRect?.height ?? null,
      ratio: iconRect.width / buttonRect.width,
      trailingGap: fieldRect ? fieldRect.right - buttonRect.right : null,
    };
  }, framework);
}

async function solidCalendarAlignment(page: Page) {
  return page.evaluate(() => {
    const popover = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).find(
      (element) => element.querySelector('[role="grid"]'),
    );
    if (!popover) {
      throw new Error("Could not find open Solid DatePicker calendar popover");
    }

    const grid = popover.querySelector<HTMLElement>('[role="grid"]');
    const headerCells = Array.from(popover.querySelectorAll<HTMLElement>("th"));
    const cells = Array.from(popover.querySelectorAll<HTMLElement>('[role="gridcell"]'))
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .slice(0, 7);
    const cellButtons = Array.from(
      popover.querySelectorAll<HTMLElement>('[role="gridcell"] [role="button"]'),
    )
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .slice(0, 7);
    const rect = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };

    return {
      grid: grid ? rect(grid) : null,
      headerText: headerCells.map((element) => element.textContent ?? ""),
      headerRects: headerCells.map(rect),
      cellRects: cells.map(rect),
      cellButtonRects: cellButtons.map(rect),
    };
  });
}

async function solidVisibleCalendarButtonTexts(page: Page) {
  return page.evaluate(() => {
    const popover = Array.from(document.querySelectorAll<HTMLElement>("[role='dialog']")).find(
      (element) => element.querySelector('[role="grid"]'),
    );
    if (!popover) {
      throw new Error("Could not find open Solid DatePicker calendar popover");
    }

    return Array.from(popover.querySelectorAll<HTMLElement>('[role="gridcell"] [role="button"]'))
      .filter((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return box.width > 0 && box.height > 0 && style.display !== "none";
      })
      .map((element) => element.textContent?.trim() ?? "");
  });
}

async function solidVisibleCalendarButtonMetrics(page: Page) {
  return page.evaluate(() => {
    const popover = Array.from(document.querySelectorAll<HTMLElement>("[role='dialog']")).find(
      (element) => element.querySelector('[role="grid"]'),
    );
    const grid = popover?.querySelector<HTMLElement>('[role="grid"]');
    if (!popover || !grid) {
      throw new Error("Could not find open Solid DatePicker calendar grid");
    }

    const gridBox = grid.getBoundingClientRect();
    return Array.from(popover.querySelectorAll<HTMLElement>('[role="gridcell"] [role="button"]'))
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          text: element.textContent?.trim() ?? "",
          columnOffset: Math.round(box.x - gridBox.x),
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
        };
      });
  });
}

async function solidCalendarHoverState(page: Page) {
  return page.evaluate(() => {
    const hovered = document.querySelector<HTMLElement>('[role="dialog"] [data-hovered]');
    if (!hovered) {
      throw new Error("Expected hovered Solid calendar cell");
    }

    const paint =
      ([hovered, ...Array.from(hovered.querySelectorAll("*"))] as HTMLElement[]).find((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return box.width > 0 && box.height > 0 && style.backgroundColor !== "rgba(0, 0, 0, 0)";
      }) ?? hovered;

    const box = hovered.getBoundingClientRect();
    const style = getComputedStyle(paint);
    return {
      width: box.width,
      height: box.height,
      background: style.backgroundColor,
      transition: style.transition,
    };
  });
}

async function hoverSolidCalendarDate(page: Page) {
  const point = await page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('[role="dialog"] [role="gridcell"] [role="button"]'),
    );
    const target = candidates.find((element) => {
      const box = element.getBoundingClientRect();
      return !element.hasAttribute("data-outside-month") && box.width > 0 && box.height > 0;
    });
    if (!target) {
      throw new Error("Expected a visible in-month Solid calendar date");
    }

    const box = target.getBoundingClientRect();
    return {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
    };
  });

  await page.mouse.move(point.x, point.y);
  await page.waitForTimeout(150);
}

async function datePickerCalendarContract(dialog: Locator) {
  return dialog.evaluate((element) => {
    const grids = Array.from(element.querySelectorAll('[role="grid"]')) as HTMLElement[];
    const buttons = Array.from(element.querySelectorAll('[role="button"]'));
    const isDisabled = (label: string) => {
      const button = buttons.find((candidate) =>
        (candidate.getAttribute("aria-label") ?? "").includes(label),
      );
      return (
        button?.getAttribute("aria-disabled") === "true" ||
        button?.hasAttribute("data-disabled") ||
        false
      );
    };

    return {
      gridCount: grids.length,
      columnCounts: grids.map((grid) => grid.querySelectorAll("thead th").length),
      weekdayLabels: grids.map((grid) =>
        Array.from(grid.querySelectorAll("thead th")).map((cell) => cell.textContent?.trim() ?? ""),
      ),
      rowCellCounts: grids.map((grid) =>
        Array.from(grid.querySelectorAll("tbody tr")).map((row) => row.children.length),
      ),
      minDisabled: isDisabled("February 2, 2025"),
      maxDisabled: isDisabled("February 21, 2025"),
      unavailableDisabled: isDisabled("February 10, 2025"),
    };
  });
}

async function datePickerSpinbuttonTexts(root: Locator) {
  return root
    .getByRole("spinbutton")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? "").filter(Boolean));
}

async function datePickerNamedInputValues(root: Locator, name: string) {
  return root
    .locator(`input[name="${name}"]`)
    .evaluateAll((inputs) =>
      inputs.map((input) => (input as HTMLInputElement).value.replace(/(\d{2}:\d{2}):00$/, "$1")),
    );
}

async function datePickerNamedInputAttributes(root: Locator, name: string, attribute: string) {
  return root
    .locator(`input[name="${name}"]`)
    .evaluateAll(
      (inputs, attr) => inputs.map((input) => input.getAttribute(attr)).filter(Boolean) as string[],
      attribute,
    );
}

async function associatedFormValues(page: Page, formId: string, name: string) {
  return page.evaluate(
    ({ formId, name }) => {
      document.getElementById(formId)?.remove();
      const form = document.createElement("form");
      form.id = formId;
      document.body.append(form);

      const values = new FormData(form).getAll(name).map(String);
      form.remove();
      return values;
    },
    { formId, name },
  );
}

test.describe("comparison DatePicker visual parity", () => {
  test("closed segmented field is pixel-identical for the deterministic date route", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "dark");
    await page.goto("/components/datepicker/?size=XL&value=2025-02-03&name=dueDate");
    await waitForComparisonRouteReady(page);
    await clearPointer(page);

    const section = await styledSection(page);
    const reactPanel = await frameworkPanel(section, "React Spectrum stack");
    const solidPanel = await frameworkPanel(section, "Solidaria stack");

    for (const panel of [reactPanel, solidPanel]) {
      await expect(panel.locator('[role="spinbutton"]')).toHaveCount(3);
      await expect(panel.getByRole("spinbutton", { name: /month/i }).first()).toBeVisible();
      await expect(panel.getByRole("spinbutton", { name: /day/i }).first()).toBeVisible();
      await expect(panel.getByRole("spinbutton", { name: /year/i }).first()).toBeVisible();
    }

    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    const reactField = await closedDatePickerField(reactPanel);
    const solidField = await closedDatePickerField(solidPanel);
    await clearPointer(page);
    await expectScreenshotPair(
      page,
      reactField,
      solidField,
      "DatePicker closed segmented field",
      datePickerFieldPairDiff,
    );
  });

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

    await reactField.scrollIntoViewIfNeeded();
    const reactFieldGeometry = await geometry(reactField);
    assertVisibleFieldGeometry(reactFieldGeometry);

    await solidField.scrollIntoViewIfNeeded();
    const solidFieldGeometry = await geometry(solidField);
    assertVisibleFieldGeometry(solidFieldGeometry);
    expect(Math.abs(solidFieldGeometry.width - reactFieldGeometry.width)).toBeLessThanOrEqual(96);

    await reactField.scrollIntoViewIfNeeded();
    const reactFieldPng = await reactField.screenshot({ animations: "disabled" });
    await solidField.scrollIntoViewIfNeeded();
    const solidFieldPng = await solidField.screenshot({ animations: "disabled" });
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
    const reactSurface = await calendarSurface(page);
    await expect(reactDialog.getByRole("grid")).toBeVisible();
    await page.waitForTimeout(250);
    const reactPopoverGeometry = await geometry(reactSurface);
    assertVisiblePopoverGeometry(reactPopoverGeometry);
    await page.mouse.move(4, 4);
    const reactSurfacePng = await reactSurface.screenshot({ animations: "disabled" });

    await page.keyboard.press("Escape");
    await expectNoCalendarPopup(page);
    await expect(reactCard.getByRole("button", { name: /calendar|choose date/i })).toBeFocused();

    await openCalendar(solidCard);
    const solidDialog = await calendarPopup(page);
    const solidSurface = await calendarSurface(page);
    await expect(solidDialog.getByRole("grid")).toBeVisible();
    await page.waitForTimeout(250);
    const solidPopoverGeometry = await geometry(solidSurface);
    assertVisiblePopoverGeometry(solidPopoverGeometry);
    expect(solidPopoverGeometry.position).not.toBe("static");
    await page.mouse.move(4, 4);
    const solidSurfacePng = await solidSurface.screenshot({ animations: "disabled" });

    expect(Math.abs(solidPopoverGeometry.width - reactPopoverGeometry.width)).toBeLessThanOrEqual(
      48,
    );
    expect(Math.abs(solidPopoverGeometry.height - reactPopoverGeometry.height)).toBeLessThanOrEqual(
      48,
    );
    await compareScreenshots(
      page,
      reactSurfacePng,
      solidSurfacePng,
      "DatePicker popup surface",
      0.16,
      2,
      16,
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
    await expect(reactRoot.locator("svg")).toHaveCount(3);
    await expect(solidRoot.locator("svg")).toHaveCount(3);
    await expect(reactCard.getByText("Select a due date.")).toBeVisible();
    await expect(solidCard.getByText("Select a due date.")).toBeVisible();

    await reactRoot.scrollIntoViewIfNeeded();
    const reactGeometry = await geometry(reactRoot);
    assertVisibleFieldGeometry(reactGeometry);

    await solidRoot.scrollIntoViewIfNeeded();
    const solidGeometry = await geometry(solidRoot);
    assertVisibleFieldGeometry(solidGeometry);
    expect(solidGeometry.height).toBeGreaterThan(reactGeometry.height * 0.5);
  });

  test("route controls drive calendar constraints and form input parity", async ({ page }) => {
    await page.goto(
      "/components/datepicker/?size=XL&value=2025-02-14&maxVisibleMonths=2&firstDayOfWeek=mon&pageBehavior=single&constrainRange=true&unavailableDates=true&name=dueDate&isRequired=true&isInvalid=true",
    );
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const section = await styledSection(page);
    const reactCard = await frameworkPanel(section, "React Spectrum stack");
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactCard.locator('[data-comparison-control-root="datepicker"]');
    const solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-control-props", /"value":"2025-02-14"/);
      await expect(root).toHaveAttribute("data-comparison-control-props", /"maxVisibleMonths":"2"/);
      await expect(root).toHaveAttribute("data-comparison-control-props", /"firstDayOfWeek":"mon"/);
      await expect(root).toHaveAttribute(
        "data-comparison-control-props",
        /"pageBehavior":"single"/,
      );
      await expect(root).toHaveAttribute("data-comparison-control-props", /"constrainRange":true/);
      await expect(root).toHaveAttribute(
        "data-comparison-control-props",
        /"unavailableDates":true/,
      );
      await expect(root).toHaveAttribute("data-comparison-control-props", /"name":"dueDate"/);
      await expect(root.locator('input[name="dueDate"]')).toHaveValue("2025-02-14");
    }

    await expect(reactCard.locator("[data-comparison-value]")).toHaveAttribute(
      "data-comparison-value",
      "2025-02-14",
    );
    await expect(solidCard.locator("[data-comparison-value]")).toHaveAttribute(
      "data-comparison-value",
      "2025-02-14",
    );

    await openCalendar(reactCard);
    const reactDialog = await calendarPopup(page);
    const reactContract = await datePickerCalendarContract(reactDialog);
    await page.keyboard.press("Escape");
    await expectNoCalendarPopup(page);

    await openCalendar(solidCard);
    const solidDialog = await calendarPopup(page);
    const solidContract = await datePickerCalendarContract(solidDialog);

    for (const contract of [reactContract, solidContract]) {
      expect(contract.gridCount).toBe(2);
      expect(contract.columnCounts).toEqual([7, 7]);
      expect(contract.weekdayLabels).toEqual([
        ["M", "T", "W", "T", "F", "S", "S"],
        ["M", "T", "W", "T", "F", "S", "S"],
      ]);
      for (const rowCounts of contract.rowCellCounts) {
        expect(rowCounts.every((count) => count === 7)).toBe(true);
      }
      expect(contract.minDisabled).toBe(true);
      expect(contract.maxDisabled).toBe(true);
      expect(contract.unavailableDisabled).toBe(true);
    }
  });

  test("date-time route drives time field, hidden input, and shared popup time state", async ({
    page,
  }) => {
    const value = "2025-02-03T08:45:30-05:00[America/New_York]";
    await page.goto(
      `/components/datepicker/?value=${encodeURIComponent(value)}&granularity=minute&hourCycle=24&hideTimeZone=true&name=dueDate&form=projectForm&validationBehavior=aria`,
    );
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const section = await styledSection(page);
    const reactCard = await frameworkPanel(section, "React Spectrum stack");
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactCard.locator('[data-comparison-control-root="datepicker"]');
    const solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute("data-comparison-control-props", /"granularity":"minute"/);
      await expect(root).toHaveAttribute("data-comparison-control-props", /"hourCycle":"24"/);
      await expect(root).toHaveAttribute("data-comparison-control-props", /"hideTimeZone":true/);
      await expect(root).toHaveAttribute("data-comparison-control-props", /"form":"projectForm"/);
      await expect(root).toHaveAttribute(
        "data-comparison-control-props",
        /"validationBehavior":"aria"/,
      );
      await expect(root.getByRole("spinbutton", { name: /hour/i }).first()).toBeVisible();
      await expect(root.getByRole("spinbutton", { name: /minute/i }).first()).toBeVisible();
      expect(await datePickerNamedInputValues(root, "dueDate")).toContain(value);
      expect(await datePickerNamedInputAttributes(root, "dueDate", "form")).toContain(
        "projectForm",
      );
    }

    await expect
      .poll(() => associatedFormValues(page, "projectForm", "dueDate"))
      .toEqual([value, value]);

    await expect(reactCard.locator("[data-comparison-value]")).toHaveAttribute(
      "data-comparison-value",
      value,
    );
    await expect(solidCard.locator("[data-comparison-value]")).toHaveAttribute(
      "data-comparison-value",
      value,
    );

    await openCalendar(reactCard);
    const reactDialog = await calendarPopup(page);
    await expect(reactDialog.getByText("Time").first()).toBeVisible();
    await expect(reactDialog.getByRole("spinbutton", { name: /hour/i }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expectNoCalendarPopup(page);

    await openCalendar(solidCard);
    const solidDialog = await calendarPopup(page);
    await expect(solidDialog.getByText("Time").first()).toBeVisible();
    const solidPopupHour = solidDialog.getByRole("spinbutton", { name: /hour/i }).first();
    await expect(solidPopupHour).toBeVisible();
    await solidPopupHour.focus();
    await page.keyboard.press("ArrowUp");
    await expect(solidCard.locator("[data-comparison-value]")).toHaveAttribute(
      "data-comparison-value",
      /2025-02-03T09:45/,
    );
  });

  test("Provider locale and custom calendar-system routes stay in parity", async ({ page }) => {
    await page.goto("/components/datepicker/?locale=hi-IN-u-ca-indian&value=2025-02-03");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    let section = await styledSection(page);
    let reactCard = await frameworkPanel(section, "React Spectrum stack");
    let solidCard = await frameworkPanel(section, "Solidaria stack");
    let reactRoot = reactCard.locator('[data-comparison-control-root="datepicker"]');
    let solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');

    await expect(reactCard.locator("[data-comparison-locale]")).toHaveAttribute(
      "data-comparison-locale",
      "hi-IN-u-ca-indian",
    );
    await expect(solidCard.locator("[data-comparison-locale]")).toHaveAttribute(
      "data-comparison-locale",
      "hi-IN-u-ca-indian",
    );
    const reactTexts = await datePickerSpinbuttonTexts(reactRoot);
    await expect.poll(() => datePickerSpinbuttonTexts(solidRoot)).toEqual(reactTexts);

    await page.goto("/components/datepicker/?calendarSystem=custom454&value=2025-02-03");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    section = await styledSection(page);
    reactCard = await frameworkPanel(section, "React Spectrum stack");
    solidCard = await frameworkPanel(section, "Solidaria stack");
    reactRoot = reactCard.locator('[data-comparison-control-root="datepicker"]');
    solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');

    for (const root of [reactRoot, solidRoot]) {
      await expect(root).toHaveAttribute(
        "data-comparison-control-props",
        /"calendarSystem":"custom454"/,
      );
    }
    await expect(reactCard.locator("[data-comparison-calendar-system]")).toHaveAttribute(
      "data-comparison-calendar-system",
      "custom454",
    );
    await expect(solidCard.locator("[data-comparison-calendar-system]")).toHaveAttribute(
      "data-comparison-calendar-system",
      "custom454",
    );

    await openCalendar(reactCard);
    let dialog = await calendarPopup(page);
    let contract = await datePickerCalendarContract(dialog);
    expect(contract.columnCounts).toEqual([7]);
    expect(contract.rowCellCounts.every((row) => row.every((count) => count === 7))).toBe(true);
    await page.keyboard.press("Escape");
    await expectNoCalendarPopup(page);

    await openCalendar(solidCard);
    dialog = await calendarPopup(page);
    contract = await datePickerCalendarContract(dialog);
    expect(contract.columnCounts).toEqual([7]);
    expect(contract.rowCellCounts.every((row) => row.every((count) => count === 7))).toBe(true);
  });

  test("opening Solid DatePicker does not scroll the comparison page", async ({ page }) => {
    await page.goto("/components/datepicker/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const section = await styledSection(page);
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    const beforeScrollY = await page.evaluate(() => window.scrollY);

    await openCalendar(solidCard);
    await expect(await calendarPopup(page)).toBeVisible();
    const afterScrollY = await page.evaluate(() => window.scrollY);

    expect(Math.abs(afterScrollY - beforeScrollY)).toBeLessThanOrEqual(4);
  });

  test("blank field clicks focus the first editable Solid DatePicker segment", async ({ page }) => {
    await page.goto("/components/datepicker/");
    await page.waitForLoadState("networkidle");

    await clickSolidDatePickerBlankFieldArea(page);

    const section = await styledSection(page);
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    await expect(solidCard.getByRole("spinbutton", { name: /month/i })).toBeFocused();
  });

  test("Solid DatePicker calendar exposes styled month navigation", async ({ page }) => {
    await page.goto("/components/datepicker/");
    await page.waitForLoadState("networkidle");

    const section = await styledSection(page);
    const solidCard = await frameworkPanel(section, "Solidaria stack");

    await openCalendar(solidCard);
    const popover = await calendarPopup(page);
    const heading = popover.getByRole("heading").first();
    const initialTitle = await heading.textContent();
    const navButtons = popover.locator("header").getByRole("button");

    await expect(navButtons).toHaveCount(2);
    await expect(navButtons.nth(0)).toBeVisible();
    await expect(navButtons.nth(1)).toBeVisible();
    await navButtons.nth(1).click();
    await expect(heading).not.toHaveText(initialTitle ?? "");
    await expect(heading).toHaveText("June 2026");
    await page.waitForTimeout(200);
    expect(await solidVisibleCalendarButtonTexts(page)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
    ]);
    const nextMonthButtonMetrics = await solidVisibleCalendarButtonMetrics(page);
    expect(nextMonthButtonMetrics[0]).toMatchObject({
      text: "1",
      columnOffset: 32,
      paddingLeft: "4px",
    });

    const alignment = await solidCalendarAlignment(page);
    expect(alignment.headerText).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
    expect(alignment.grid?.width).toBeLessThanOrEqual(230);
    expect(alignment.headerRects.map((rect) => Math.round(rect.width))).toEqual([
      32, 32, 32, 32, 32, 32, 32,
    ]);
    expect(alignment.cellRects.map((rect) => Math.round(rect.width))).toEqual([
      32, 32, 32, 32, 32, 32, 32,
    ]);
    expect(alignment.cellRects.map((rect) => Math.round(rect.height))).toEqual([
      32, 32, 32, 32, 32, 32, 32,
    ]);
    expect(alignment.cellButtonRects.map((rect) => Math.round(rect.height))).toEqual([
      32, 32, 32, 32, 32, 32, 32,
    ]);

    const animation = await popover.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        animationDuration: style.animationDuration,
      };
    });
    expect(animation.animationName).toContain("s2-datepicker-popover-in");
    expect(animation.animationDuration).toBe("0.2s");

    await hoverSolidCalendarDate(page);
    const hoverState = await solidCalendarHoverState(page);
    expect(Math.round(hoverState.width)).toBe(32);
    expect(Math.round(hoverState.height)).toBe(32);
    expect(hoverState.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(hoverState.transition).toContain("background-color");
  });

  test("calendar trigger icon scales with DatePicker size", async ({ page }) => {
    for (const size of ["S", "M", "L", "XL"]) {
      await page.goto(`/components/datepicker/?size=${size}`);
      await page.waitForLoadState("networkidle");

      const reactIcon = await datePickerIconGeometry(page, "React Spectrum stack");
      const solidIcon = await datePickerIconGeometry(page, "Solidaria stack");

      expect(Math.abs(solidIcon.iconWidth - reactIcon.iconWidth), size).toBeLessThanOrEqual(1);
      expect(Math.abs(solidIcon.iconHeight - reactIcon.iconHeight), size).toBeLessThanOrEqual(1);
      expect(
        Math.abs((solidIcon.iconPathWidth ?? 0) - (reactIcon.iconPathWidth ?? 0)),
        size,
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs((solidIcon.iconPathHeight ?? 0) - (reactIcon.iconPathHeight ?? 0)),
        size,
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs((solidIcon.fieldWidth ?? 0) - (reactIcon.fieldWidth ?? 0)),
        size,
      ).toBeLessThanOrEqual(1);
      expect(Math.abs(solidIcon.ratio - reactIcon.ratio), size).toBeLessThanOrEqual(0.06);
      expect(
        Math.abs((solidIcon.trailingGap ?? 0) - (reactIcon.trailingGap ?? 0)),
        size,
      ).toBeLessThanOrEqual(1);

      const section = await styledSection(page);
      const reactCard = await frameworkPanel(section, "React Spectrum stack");
      const solidCard = await frameworkPanel(section, "Solidaria stack");

      await openCalendar(reactCard);
      const reactSurface = await calendarSurface(page);
      await page.waitForTimeout(250);
      const reactPopoverGeometry = await geometry(reactSurface);
      await page.keyboard.press("Escape");
      await expectNoCalendarPopup(page);

      await openCalendar(solidCard);
      const solidSurface = await calendarSurface(page);
      await page.waitForTimeout(250);
      const solidPopoverGeometry = await geometry(solidSurface);
      await page.keyboard.press("Escape");
      await expectNoCalendarPopup(page);

      expect(Math.round(solidPopoverGeometry.width), size).toBe(
        Math.round(reactPopoverGeometry.width),
      );
      expect(solidPopoverGeometry.height, size).toBeGreaterThanOrEqual(
        reactPopoverGeometry.height - 12,
      );
      expect(solidPopoverGeometry.height, size).toBeLessThanOrEqual(
        reactPopoverGeometry.height + 2,
      );
    }
  });

  test("disabled query state disables and restyles the Solid DatePicker", async ({ page }) => {
    await page.goto("/components/datepicker/");
    await page.waitForLoadState("networkidle");
    const enabledSolidField = await datePickerColors(page, "Solidaria stack");

    await page.goto("/components/datepicker/?isDisabled=true");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("astro-island")).toHaveCount(0);

    const section = await styledSection(page);
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    const reactCard = await frameworkPanel(section, "React Spectrum stack");
    const solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');
    const disabledSolidField = await datePickerColors(page, "Solidaria stack");
    const disabledReactComputed = await datePickerDisabledComputed(page, "React Spectrum stack");
    const disabledSolidComputed = await datePickerDisabledComputed(page, "Solidaria stack");

    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", /"isDisabled":true/);
    await expect(
      solidRoot.getByRole("button", { name: /calendar|open calendar|choose date/i }),
    ).toBeDisabled();
    await expect(solidRoot.getByRole("spinbutton").first()).toBeDisabled();
    await expect(
      reactCard.getByRole("button", { name: /calendar|open calendar|choose date/i }),
    ).toBeDisabled();
    expect(disabledSolidComputed).toEqual(disabledReactComputed);
    expect(disabledSolidField.fieldColor).not.toBe(enabledSolidField.fieldColor);
  });

  test("DatePicker fields and portaled calendar respond to light and dark themes", async ({
    page,
  }) => {
    await pinComparisonTheme(page, "light");
    await page.goto("/components/datepicker/");
    await page.waitForLoadState("networkidle");

    const section = await styledSection(page);
    const reactCard = await frameworkPanel(section, "React Spectrum stack");
    const solidCard = await frameworkPanel(section, "Solidaria stack");
    const reactRoot = reactCard.locator("[data-comparison-color-scheme]");
    const solidRoot = solidCard.locator('[data-comparison-control-root="datepicker"]');
    const lightReactField = await datePickerColors(page, "React Spectrum stack");
    const lightSolidField = await datePickerColors(page, "Solidaria stack");

    await expect(reactRoot).toHaveAttribute("data-comparison-color-scheme", "light");
    await expect(solidRoot).toHaveAttribute("data-comparison-color-scheme", "light");
    expect(lightReactField.colorScheme).toContain("light");
    expect(lightReactField.descriptionVisible).toBe(true);
    expect(lightReactField.errorVisible).toBe(false);
    expect(lightReactField.fieldBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(lightSolidField.colorScheme).toContain("light");
    expect(lightSolidField.descriptionVisible).toBe(true);
    expect(lightSolidField.errorVisible).toBe(false);
    expect(lightSolidField.fieldBackground).not.toBe("rgba(0, 0, 0, 0)");

    await openCalendar(solidCard);
    await calendarPopup(page);
    const lightPopover = await solidCalendarPopoverColors(page);
    expect(lightPopover.colorScheme).toContain("light");
    expect(lightPopover.background).not.toBe("rgba(0, 0, 0, 0)");

    await page.keyboard.press("Escape");
    await expectNoCalendarPopup(page);

    await page.getByRole("radio", { name: "dark" }).click();
    await expect(reactRoot).toHaveAttribute("data-comparison-color-scheme", "dark");
    await expect(solidRoot).toHaveAttribute("data-comparison-color-scheme", "dark");
    await expect
      .poll(async () => (await datePickerColors(page, "React Spectrum stack")).fieldBackground, {
        message: "React DatePicker field background should update after switching to dark theme",
      })
      .not.toBe(lightReactField.fieldBackground);
    await expect
      .poll(async () => (await datePickerColors(page, "Solidaria stack")).fieldBackground, {
        message: "Solid DatePicker field background should update after switching to dark theme",
      })
      .not.toBe(lightSolidField.fieldBackground);
    const darkReactField = await datePickerColors(page, "React Spectrum stack");
    const darkSolidField = await datePickerColors(page, "Solidaria stack");

    expect(darkReactField.colorScheme).toContain("dark");
    expect(darkReactField.descriptionVisible).toBe(true);
    expect(darkReactField.errorVisible).toBe(false);
    expect(darkReactField.rootColor).not.toBe(lightReactField.rootColor);
    expect(darkReactField.fieldBackground).not.toBe(lightReactField.fieldBackground);
    expect(darkReactField.fieldBorderColor).not.toBe(lightReactField.fieldBorderColor);
    expect(darkSolidField.colorScheme).toContain("dark");
    expect(darkSolidField.descriptionVisible).toBe(true);
    expect(darkSolidField.errorVisible).toBe(false);
    expect(darkSolidField.rootColor).not.toBe(lightSolidField.rootColor);
    expect(darkSolidField.fieldBackground).not.toBe(lightSolidField.fieldBackground);
    expect(darkSolidField.fieldBorderColor).not.toBe(lightSolidField.fieldBorderColor);

    await openCalendar(solidCard);
    await calendarPopup(page);
    const darkPopover = await solidCalendarPopoverColors(page);

    expect(darkPopover.colorScheme).toContain("dark");
    expect(darkPopover.background).not.toBe(lightPopover.background);
    expect(darkPopover.color).not.toBe(lightPopover.color);
    expect(darkPopover.cellColor).not.toBe(lightPopover.cellColor);
  });
});
