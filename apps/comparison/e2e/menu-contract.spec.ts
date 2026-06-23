import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkPanel, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import {
  menuAlignOptions,
  menuDirectionOptions,
  menuSelectionModeOptions,
  menuSizeOptions,
  menuTriggerSizeOptions,
} from "../src/data/menu-demo";

function menuQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function menuFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/menu/${menuQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="menu"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="menu"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactPanel, solidPanel, reactRoot, solidRoot };
}

async function openMenu(page: Page, trigger: Locator) {
  await trigger.click();
  await expect.poll(() => trigger.getAttribute("aria-controls")).toBeTruthy();
  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();

  const menu = page.locator(`[id="${menuId}"]`);
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("role", "menu");
  return menu;
}

async function expectKeyboardContract(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Locator,
) {
  const trigger = panel.getByRole("button", { name: "Layer actions" });

  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect.poll(() => trigger.getAttribute("aria-haspopup")).toMatch(/^(menu|true)$/);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");

  await page.keyboard.press("ArrowDown");

  const menu = await openMenuFromAria(page, trigger);
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");
  await expect(menu.getByRole("menuitem", { name: /Copy/ })).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).not.toHaveAttribute("aria-controls");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "false");
  await expect(trigger).toBeFocused();
}

async function openMenuFromAria(page: Page, trigger: Locator) {
  await expect.poll(() => trigger.getAttribute("aria-controls")).toBeTruthy();
  const menuId = await trigger.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();
  const menu = page.locator(`[id="${menuId}"]`);
  await expect(menu).toBeVisible();
  return menu;
}

async function expectActionLifecycle(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Locator,
) {
  const trigger = panel.getByRole("button", { name: "Layer actions" });
  const menu = await openMenu(page, trigger);

  await menu.getByRole("menuitem", { name: /Duplicate/ }).click();

  await expect(root).toHaveAttribute("data-comparison-action-count", "1");
  await expect(root).toHaveAttribute("data-comparison-last-action", "duplicate");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
}

async function expectOutsidePointerCloses(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Locator,
) {
  const trigger = panel.getByRole("button", { name: "Layer actions" });
  await openMenu(page, trigger);
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "true");

  await page.mouse.click(8, 8);

  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(root).toHaveAttribute("data-comparison-last-open-state", "false");
}

async function expectSelectionLifecycle(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Locator,
) {
  const trigger = panel.getByRole("button", { name: "Layer actions" });
  const menu = await openMenu(page, trigger);

  const deleteItem = menu.getByRole("menuitemcheckbox", { name: /Delete/ });
  await expect(deleteItem).toHaveAttribute("aria-checked", "false");
  await deleteItem.click();

  await expect(root).toHaveAttribute("data-comparison-selection-change-count", "1");
  await expect(root).toHaveAttribute("data-comparison-selected-keys", "copy,delete,duplicate");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
}

async function mouseDownThenReleaseOn(page: Page, pressStart: Locator, pressEnd: Locator) {
  const startBox = await pressStart.boundingBox();
  const endBox = await pressEnd.boundingBox();

  if (!startBox || !endBox) {
    throw new Error("Menu items must be visible before testing different-origin press release.");
  }

  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(endBox.x + endBox.width / 2, endBox.y + endBox.height / 2);
  await page.mouse.up();
}

async function differentOriginPressReleaseState(
  page: Page,
  panel: Awaited<ReturnType<typeof frameworkPanel>>,
  root: Locator,
) {
  const trigger = panel.getByRole("button", { name: "Layer actions" });
  const menu = await openMenu(page, trigger);
  const copyItem = menu.getByRole("menuitemcheckbox", { name: /Copy/ });
  const deleteItem = menu.getByRole("menuitemcheckbox", { name: /Delete/ });

  await expect(copyItem).toHaveAttribute("aria-checked", "true");
  await expect(deleteItem).toHaveAttribute("aria-checked", "false");

  await mouseDownThenReleaseOn(page, copyItem, deleteItem);

  await expect(root).toHaveAttribute("data-comparison-selected-keys", "copy,delete,duplicate");
  await expect(copyItem).toHaveAttribute("aria-checked", "true");
  await expect(deleteItem).toHaveAttribute("aria-checked", "true");

  const state = {
    actionCount: await root.getAttribute("data-comparison-action-count"),
    lastAction: await root.getAttribute("data-comparison-last-action"),
    lastOpenState: await root.getAttribute("data-comparison-last-open-state"),
    selectionChangeCount: await root.getAttribute("data-comparison-selection-change-count"),
    selectedKeys: await root.getAttribute("data-comparison-selected-keys"),
    copyChecked: await copyItem.getAttribute("aria-checked"),
    deleteChecked: await deleteItem.getAttribute("aria-checked"),
  };

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);

  return state;
}

test.describe("comparison Menu route contract", () => {
  test("Menu route mounts the React and Solid styled references", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await menuFixtures(page);

    const expectedProps = JSON.stringify({
      triggerSize: "M",
      size: "M",
      align: "start",
      direction: "bottom",
      shouldFlip: true,
      selectionMode: "none",
      isDisabled: false,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactPanel.getByRole("button", { name: "Layer actions" })).toBeVisible();
    await expect(solidPanel.getByRole("button", { name: "Layer actions" })).toBeVisible();
  });

  test("Menu controls match the S2 trigger, size, and selection axes", async ({ page }) => {
    const { reactPanel, solidPanel, reactRoot, solidRoot } = await menuFixtures(page, {
      triggerSize: "XL",
      size: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      selectionMode: "multiple",
      isDisabled: true,
    });

    await expect(
      page
        .locator('input[name="triggerSize"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...menuTriggerSizeOptions]);
    await expect(page.locator('input[name="triggerSize"]:checked')).toHaveValue("XL");
    await expect(
      page
        .locator('input[name="size"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...menuSizeOptions]);
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("L");
    await expect(
      page
        .locator('input[name="align"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...menuAlignOptions]);
    await expect(page.locator('input[name="align"]:checked')).toHaveValue("end");
    await expect(
      page
        .locator('select[name="direction"] option')
        .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
    ).resolves.toEqual([...menuDirectionOptions]);
    await expect(page.locator('select[name="direction"]')).toHaveValue("top");
    await expect(
      page
        .locator('input[name="selectionMode"]')
        .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
    ).resolves.toEqual([...menuSelectionModeOptions]);
    await expect(page.locator('input[name="selectionMode"]:checked')).toHaveValue("multiple");
    await expect(page.locator('input[name="shouldFlip"]')).not.toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).toBeChecked();

    const expectedProps = JSON.stringify({
      triggerSize: "XL",
      size: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      selectionMode: "multiple",
      isDisabled: true,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(solidRoot).toHaveAttribute("data-comparison-control-props", expectedProps);
    await expect(reactPanel.getByRole("button", { name: "Layer actions" })).toBeDisabled();
    await expect(solidPanel.getByRole("button", { name: "Layer actions" })).toBeDisabled();
  });

  test("Menu omitted viewer props reset to default branch values", async ({ page }) => {
    const custom = await menuFixtures(page, {
      triggerSize: "XL",
      size: "L",
      align: "end",
      direction: "top",
      shouldFlip: false,
      selectionMode: "multiple",
      isDisabled: true,
    });
    await expect(custom.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      JSON.stringify({
        triggerSize: "XL",
        size: "L",
        align: "end",
        direction: "top",
        shouldFlip: false,
        selectionMode: "multiple",
        isDisabled: true,
      }),
    );

    const defaults = await menuFixtures(page);
    const defaultProps = JSON.stringify({
      triggerSize: "M",
      size: "M",
      align: "start",
      direction: "bottom",
      shouldFlip: true,
      selectionMode: "none",
      isDisabled: false,
    });

    await expect(defaults.reactRoot).toHaveAttribute("data-comparison-control-props", defaultProps);
    await expect(defaults.solidRoot).toHaveAttribute("data-comparison-control-props", defaultProps);
    await expect(page.locator('input[name="triggerSize"]:checked')).toHaveValue("M");
    await expect(page.locator('input[name="size"]:checked')).toHaveValue("M");
    await expect(page.locator('input[name="align"]:checked')).toHaveValue("start");
    await expect(page.locator('select[name="direction"]')).toHaveValue("bottom");
    await expect(page.locator('input[name="selectionMode"]:checked')).toHaveValue("none");
    await expect(page.locator('input[name="shouldFlip"]')).toBeChecked();
    await expect(page.locator('input[name="isDisabled"]')).not.toBeChecked();
  });

  test("Menu action, keyboard, outside-close, and selection lifecycles match", async ({ page }) => {
    const defaults = await menuFixtures(page);

    await expectActionLifecycle(page, defaults.reactPanel, defaults.reactRoot);
    await expectActionLifecycle(page, defaults.solidPanel, defaults.solidRoot);
    await expectKeyboardContract(page, defaults.reactPanel, defaults.reactRoot);
    await expectKeyboardContract(page, defaults.solidPanel, defaults.solidRoot);
    await expectOutsidePointerCloses(page, defaults.reactPanel, defaults.reactRoot);
    await expectOutsidePointerCloses(page, defaults.solidPanel, defaults.solidRoot);

    const selection = await menuFixtures(page, { selectionMode: "multiple" });

    await expectSelectionLifecycle(page, selection.reactPanel, selection.reactRoot);
    await expectSelectionLifecycle(page, selection.solidPanel, selection.solidRoot);
  });

  test("Menu selects the item under mouse release when press starts elsewhere", async ({ page }) => {
    const selection = await menuFixtures(page, { selectionMode: "multiple" });

    const reactState = await differentOriginPressReleaseState(
      page,
      selection.reactPanel,
      selection.reactRoot,
    );
    const solidState = await differentOriginPressReleaseState(
      page,
      selection.solidPanel,
      selection.solidRoot,
    );

    expect(reactState).toMatchObject({
      lastAction: "delete",
      selectedKeys: "copy,delete,duplicate",
      copyChecked: "true",
      deleteChecked: "true",
    });
    expect(solidState).toEqual(reactState);
  });
});
