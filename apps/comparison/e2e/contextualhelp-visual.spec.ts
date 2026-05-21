import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  compareScreenshots,
  pinComparisonTheme,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

const contextualHelpSurfaceDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0.1,
  maxDimensionDelta: 18,
  pixelThreshold: 48,
};

type ContextualHelpSetup = {
  reactPanel: Locator;
  solidPanel: Locator;
  reactButton: Locator;
  solidButton: Locator;
  reactRoot: Locator;
  solidRoot: Locator;
};

type ContextualHelpStack = "react" | "solid";

function contextualHelpQuery(params: Record<string, string | boolean | number | undefined>) {
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function setupContextualHelpRoute(
  page: Page,
  params: Record<string, string | boolean | number | undefined> = {},
): Promise<ContextualHelpSetup> {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/contextualhelp/${contextualHelpQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const triggerLabel = String(params.triggerLabel ?? "Contextual help");
  const triggerName = new RegExp(`^${escapeRegExp(triggerLabel)}(?: Help| Information)?$`);
  const reactButton = reactPanel.getByRole("button", { name: triggerName }).first();
  const solidButton = solidPanel.getByRole("button", { name: triggerName }).first();
  const reactRoot = reactPanel.locator('[data-comparison-control-root="contextualhelp"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="contextualhelp"]').first();

  await expect(reactRoot).toHaveCount(1);
  await expect(solidRoot).toHaveCount(1);
  await expect(reactButton).toBeVisible();
  await expect(solidButton).toBeVisible();

  return { reactPanel, solidPanel, reactButton, solidButton, reactRoot, solidRoot };
}

async function dispatchContextualHelpControls(
  page: Page,
  props: Record<string, string | boolean | number | undefined>,
) {
  await page.evaluate((nextProps) => {
    const form = document.querySelector<HTMLFormElement>(
      '[data-comparison-controls="contextualhelp"]',
    );
    if (form) {
      for (const [key, value] of Object.entries(nextProps)) {
        const fields = Array.from(form.elements)
          .filter(
            (field): field is HTMLInputElement | HTMLSelectElement =>
              field instanceof HTMLInputElement || field instanceof HTMLSelectElement,
          )
          .filter((field) => field.name === key);
        for (const field of fields) {
          if (field instanceof HTMLInputElement && field.type === "checkbox") {
            field.checked = Boolean(value);
          } else if (field instanceof HTMLInputElement && field.type === "radio") {
            field.checked = field.value === String(value);
          } else {
            field.value = String(value ?? "");
          }
        }
      }
    }

    window.dispatchEvent(
      new CustomEvent("comparison:controls-change", {
        detail: {
          component: "contextualhelp",
          props: nextProps,
        },
      }),
    );
  }, props);
}

async function bringTriggerIntoViewport(trigger: Locator) {
  await trigger.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      trigger.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      }),
    )
    .toBe(true);
}

async function setupControlledOpenContextualHelpRoute(
  page: Page,
  params: Record<string, string | boolean | number | undefined>,
  stack: ContextualHelpStack,
) {
  const setup = await setupContextualHelpRoute(page, { ...params, isOpen: false });
  const targetButton = stack === "react" ? setup.reactButton : setup.solidButton;
  const targetRoot = stack === "react" ? setup.reactRoot : setup.solidRoot;

  await bringTriggerIntoViewport(targetButton);
  await clearPointer(page);
  await dispatchContextualHelpControls(page, { ...params, isOpen: true });
  await expect
    .poll(() => targetRoot.getAttribute("data-comparison-control-props"))
    .toContain('"isOpen":true');

  return setup;
}

async function dialogForTrigger(trigger: Locator, text: string) {
  await expect.poll(() => trigger.getAttribute("aria-controls")).toBeTruthy();
  const id = await trigger.getAttribute("aria-controls");
  expect(id).toBeTruthy();
  const dialog = trigger.page().locator(idSelector(id!));
  if ((await dialog.count()) > 0) {
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("role", "dialog");
    return dialog;
  }

  const reactDialog = trigger.page().locator('[role="dialog"][data-rac]').filter({ hasText: text });
  await expect(reactDialog).toBeVisible();
  return reactDialog;
}

async function touchActivate(trigger: Locator) {
  await trigger.evaluate((element) => {
    const pointerInit = {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "touch",
      clientX: 8,
      clientY: 8,
    };
    element.dispatchEvent(new PointerEvent("pointerdown", pointerInit));
    element.dispatchEvent(new PointerEvent("pointerup", pointerInit));
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

async function popoverGeometry(trigger: Locator, dialog: Locator) {
  const triggerBox = await trigger.boundingBox();
  const dialogBox = await dialog.boundingBox();
  expect(triggerBox).toBeTruthy();
  expect(dialogBox).toBeTruthy();

  return {
    mainGap: Math.round(dialogBox!.y - (triggerBox!.y + triggerBox!.height)),
    startDelta: Math.round(dialogBox!.x - triggerBox!.x),
  };
}

test.describe("comparison ContextualHelp parity", () => {
  test("controlled open state renders a dialog popover on both stacks", async ({ page }) => {
    const reactSetup = await setupControlledOpenContextualHelpRoute(page, {}, "react");

    await expect
      .poll(() => reactSetup.reactRoot.getAttribute("data-comparison-control-props"))
      .toContain('"isOpen":true');
    await expect
      .poll(() => reactSetup.solidRoot.getAttribute("data-comparison-control-props"))
      .toContain('"isOpen":true');

    const reactDialog = await dialogForTrigger(reactSetup.reactButton, "Permission required");
    await expect(reactDialog).toContainText("Permission required");
    await expect(reactDialog).toContainText("Your admin must grant permission");
    await expect(reactDialog).toContainText("Learn more about segments");
    await expect(reactSetup.reactButton).toHaveAttribute("aria-expanded", "true");

    const reactPng = await reactDialog.screenshot({ animations: "disabled" });

    const solidSetup = await setupControlledOpenContextualHelpRoute(page, {}, "solid");
    const solidDialog = await dialogForTrigger(solidSetup.solidButton, "Permission required");
    await expect(solidDialog).toContainText("Permission required");
    await expect(solidDialog).toContainText("Your admin must grant permission");
    await expect(solidDialog).toContainText("Learn more about segments");
    await expect(solidSetup.solidButton).toHaveAttribute("aria-expanded", "true");

    const solidPng = await solidDialog.screenshot({ animations: "disabled" });

    await compareScreenshots(
      page,
      reactPng,
      solidPng,
      "ContextualHelp open surface",
      contextualHelpSurfaceDiff,
    );
  });

  test("route controls cover variant, size, placement, and React-pinned offset geometry", async ({
    page,
  }) => {
    const routeProps = {
      triggerLabel: "More details",
      heading: "Why unavailable?",
      content: "This action requires elevated access.",
      variant: "info",
      size: "S",
      placement: "bottom start",
      offset: 32,
      crossOffset: 0,
      containerPadding: 14,
      shouldFlip: false,
    };
    const reactSetup = await setupControlledOpenContextualHelpRoute(page, routeProps, "react");

    for (const root of [reactSetup.reactRoot, reactSetup.solidRoot]) {
      const props = await root.getAttribute("data-comparison-control-props");
      expect(props).toContain('"variant":"info"');
      expect(props).toContain('"size":"S"');
      expect(props).toContain('"placement":"bottom start"');
      expect(props).toContain('"offset":32');
      expect(props).toContain('"crossOffset":0');
      expect(props).toContain('"containerPadding":14');
      expect(props).toContain('"shouldFlip":false');
    }

    await expect(reactSetup.reactButton).toBeVisible();
    const reactDialog = await dialogForTrigger(reactSetup.reactButton, "Why unavailable?");
    await expect(reactDialog).toContainText("Why unavailable?");
    const reactGeometry = await popoverGeometry(reactSetup.reactButton, reactDialog);

    const solidSetup = await setupControlledOpenContextualHelpRoute(page, routeProps, "solid");
    await expect(solidSetup.solidButton).toBeVisible();
    const solidDialog = await dialogForTrigger(solidSetup.solidButton, "Why unavailable?");
    await expect(solidDialog).toContainText("Why unavailable?");
    const solidGeometry = await popoverGeometry(solidSetup.solidButton, solidDialog);

    expect(reactGeometry.mainGap, "React S2 pins ContextualHelp offset near 8px").toBeLessThan(18);
    expect(solidGeometry.mainGap, "Solid follows React S2's pinned offset").toBeLessThan(18);
    expect(
      Math.abs(solidGeometry.mainGap - reactGeometry.mainGap),
      "Solid and React ContextualHelp main-axis gap",
    ).toBeLessThanOrEqual(3);
    expect(
      Math.abs(solidGeometry.startDelta - reactGeometry.startDelta),
      "Solid and React ContextualHelp start alignment",
    ).toBeLessThanOrEqual(6);
  });

  test("touch-like press opens ContextualHelp instead of relying on Tooltip", async ({ page }) => {
    let setup = await setupContextualHelpRoute(page, { triggerLabel: "Touch help" });
    await bringTriggerIntoViewport(setup.reactButton);
    await touchActivate(setup.reactButton);
    await expect(await dialogForTrigger(setup.reactButton, "Permission required")).toContainText(
      "Permission required",
    );
    await expect(page.getByRole("tooltip")).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect.poll(() => setup.reactButton.getAttribute("aria-expanded")).toBe("false");

    setup = await setupContextualHelpRoute(page, { triggerLabel: "Touch help" });
    await bringTriggerIntoViewport(setup.solidButton);
    await touchActivate(setup.solidButton);
    await expect(await dialogForTrigger(setup.solidButton, "Permission required")).toContainText(
      "Permission required",
    );
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
});
