import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";

type ContextualHelpSetup = {
  reactPanel: Locator;
  solidPanel: Locator;
  reactButton: Locator;
  solidButton: Locator;
  reactRoot: Locator;
  solidRoot: Locator;
};

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

test.describe("comparison ContextualHelp parity", () => {
  test("controlled open state renders a dialog popover on both stacks", async ({ page }) => {
    const { reactButton, solidButton, reactRoot, solidRoot } = await setupContextualHelpRoute(
      page,
      {
        isOpen: true,
      },
    );

    await expect
      .poll(() => reactRoot.getAttribute("data-comparison-control-props"))
      .toContain('"isOpen":true');
    await expect
      .poll(() => solidRoot.getAttribute("data-comparison-control-props"))
      .toContain('"isOpen":true');

    const reactDialog = await dialogForTrigger(reactButton, "Permission required");
    const solidDialog = await dialogForTrigger(solidButton, "Permission required");
    await expect(reactDialog).toContainText("Permission required");
    await expect(solidDialog).toContainText("Permission required");
    await expect(reactDialog).toContainText("Your admin must grant permission");
    await expect(solidDialog).toContainText("Your admin must grant permission");
    await expect(reactButton).toHaveAttribute("aria-expanded", "true");
    await expect(solidButton).toHaveAttribute("aria-expanded", "true");
  });

  test("route controls cover variant, size, placement, and geometry props", async ({ page }) => {
    const { reactButton, solidButton, reactRoot, solidRoot } = await setupContextualHelpRoute(
      page,
      {
        triggerLabel: "More details",
        heading: "Why unavailable?",
        content: "This action requires elevated access.",
        variant: "info",
        size: "S",
        placement: "top end",
        offset: 10,
        crossOffset: 2,
        containerPadding: 14,
        isOpen: true,
        shouldFlip: false,
      },
    );

    for (const root of [reactRoot, solidRoot]) {
      const props = await root.getAttribute("data-comparison-control-props");
      expect(props).toContain('"variant":"info"');
      expect(props).toContain('"size":"S"');
      expect(props).toContain('"placement":"top end"');
      expect(props).toContain('"offset":10');
      expect(props).toContain('"crossOffset":2');
      expect(props).toContain('"containerPadding":14');
      expect(props).toContain('"shouldFlip":false');
    }

    await expect(reactButton).toBeVisible();
    await expect(solidButton).toBeVisible();
    await expect(await dialogForTrigger(reactButton, "Why unavailable?")).toContainText(
      "Why unavailable?",
    );
    await expect(await dialogForTrigger(solidButton, "Why unavailable?")).toContainText(
      "Why unavailable?",
    );
  });

  test("touch-like press opens ContextualHelp instead of relying on Tooltip", async ({ page }) => {
    let setup = await setupContextualHelpRoute(page, { triggerLabel: "Touch help" });
    await touchActivate(setup.reactButton);
    await expect(await dialogForTrigger(setup.reactButton, "Permission required")).toContainText(
      "Permission required",
    );
    await expect(page.getByRole("tooltip")).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect.poll(() => setup.reactButton.getAttribute("aria-expanded")).toBe("false");

    setup = await setupContextualHelpRoute(page, { triggerLabel: "Touch help" });
    await touchActivate(setup.solidButton);
    await expect(await dialogForTrigger(setup.solidButton, "Permission required")).toContainText(
      "Permission required",
    );
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
});
