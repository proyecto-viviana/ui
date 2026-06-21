import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

/**
 * Playground component tests focused on stable contracts:
 * - No hydration/runtime errors.
 * - Section visibility controls behave deterministically.
 * - Core interaction patterns still work in representative sections.
 */

const SECTION_SELECTOR = 'section[data-testid^="section-"]';

async function setupErrorCapture(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  return errors;
}

async function checkNoHydrationErrors(errors: string[]) {
  const hydrationErrors = errors.filter((e) => /template2|hydration|Hydration/.test(e));
  expect(hydrationErrors).toHaveLength(0);
}

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("show-all-sections")).toBeVisible();
}

async function ensureSectionVisible(page: Page, sectionId: string) {
  const section = page.locator(`section[data-testid="section-${sectionId}"]`);
  if (await section.count()) {
    await expect(section.first()).toBeVisible();
    return section.first();
  }

  const toggle = page.getByTestId(`section-toggle-${sectionId}`);
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(section.first()).toBeVisible();
  return section.first();
}

test.describe("Playground Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.playground);
    await waitForPageReady(page);
  });

  test("loads without hydration errors", async ({ page }) => {
    const errors = await setupErrorCapture(page);

    await expect(page.getByRole("heading", { name: /component playground/i })).toBeVisible();
    await expect(page.getByTestId("show-all-sections")).toBeVisible();
    await expect(page.getByTestId("hide-all-sections")).toBeVisible();

    await checkNoHydrationErrors(errors);
  });

  test("show all / hide all section controls are deterministic", async ({ page }) => {
    const errors = await setupErrorCapture(page);

    await page.getByTestId("show-all-sections").click();
    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length > 50,
      SECTION_SELECTOR,
    );
    await expect(page.locator(SECTION_SELECTOR).first()).toBeVisible();

    await page.getByTestId("hide-all-sections").click();
    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length === 0,
      SECTION_SELECTOR,
    );
    await expect(page.locator(SECTION_SELECTOR)).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("switch section toggle updates aria-checked", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "switch");

    const toggle = section.getByRole("switch", { name: "Toggle demo switch" }).first();
    await expect(toggle).toBeVisible();

    const initial = await toggle.isChecked();
    await toggle.evaluate((input) => {
      (input as HTMLInputElement).click();
    });
    const next = await toggle.isChecked();
    expect(next).not.toBe(initial);

    await checkNoHydrationErrors(errors);
  });

  test("styled tabs keep tab-to-panel ARIA linkage valid", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "styled-tabs");

    const tablist = section.locator('[role="tablist"]').first();
    await expect(tablist).toBeVisible();

    const tabs = tablist.locator('[role="tab"]');
    await expect(tabs.first()).toBeVisible();
    expect(await tabs.count()).toBeGreaterThan(1);

    const selectedTabBefore = tablist.getByRole("tab", { selected: true }).first();
    await expect(selectedTabBefore).toBeVisible();

    const controlsBefore = await selectedTabBefore.getAttribute("aria-controls");
    expect(controlsBefore).toBeTruthy();
    if (!controlsBefore) {
      throw new Error("Selected tab is missing aria-controls before interaction");
    }
    await expect(section.locator(`#${controlsBefore}`)).toHaveCount(1);

    await tabs.nth(1).click();
    const selectedTabAfter = tablist.getByRole("tab", { selected: true }).first();
    const controlsAfter = await selectedTabAfter.getAttribute("aria-controls");
    expect(controlsAfter).toBeTruthy();
    if (!controlsAfter) {
      throw new Error("Selected tab is missing aria-controls after interaction");
    }
    await expect(section.locator(`#${controlsAfter}`)).toHaveCount(1);

    await checkNoHydrationErrors(errors);
  });

  test("styled tabs arrow keys move focus to the next tab", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "styled-tabs");

    const tablist = section.locator('[role="tablist"]').first();
    await expect(tablist).toBeVisible();

    const tabs = tablist.locator('[role="tab"]');
    const firstTab = tabs.first();
    const secondTab = tabs.nth(1);

    await firstTab.focus();
    await page.keyboard.press("ArrowRight");

    await expect(secondTab).toBeFocused();
    await expect(secondTab).toHaveAttribute("aria-selected", "true");

    await checkNoHydrationErrors(errors);
  });

  test("styled breadcrumbs expose current item semantics", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "styled-breadcrumbs");

    const nav = section.getByRole("navigation", { name: /default breadcrumbs demo/i }).first();
    await expect(nav).toBeVisible();

    const currentItem = nav.locator('[aria-current="page"]').first();
    await expect(currentItem).toBeVisible();

    const beforeUrl = page.url();
    const products = nav.getByRole("link", { name: "Products" }).first();
    await products.click();

    await expect(nav.locator('[aria-current="page"]').first()).toBeVisible();
    expect(page.url()).toBe(beforeUrl);

    await checkNoHydrationErrors(errors);
  });

  test("taggroup section exposes labeled grid keyboard navigation", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "taggroup");

    // RAC TagGroup is a selection grid, not a listbox: the container is
    // role="grid" and each tag is a role="row" (with a role="gridcell" inside).
    const grid = section.getByRole("grid", { name: "Languages" }).first();
    await expect(grid).toBeVisible();

    const tags = grid.locator('[role="row"]');
    await expect(tags.first()).toBeVisible();
    expect(await tags.count()).toBeGreaterThan(1);

    const first = tags.first();
    const second = tags.nth(1);

    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(second).toBeFocused();

    await page.keyboard.press("Home");
    await expect(first).toBeFocused();

    await checkNoHydrationErrors(errors);
  });

  test("actiongroup section exposes role + keyboard behavior", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "actiongroup");

    const group = section.getByRole("radiogroup", { name: "Editor actions" }).first();
    await expect(group).toBeVisible();

    const cut = group.getByRole("radio", { name: "Cut" }).first();
    const copy = group.getByRole("radio", { name: "Copy" }).first();

    await cut.focus();
    await page.keyboard.press("ArrowRight");
    await expect(copy).toBeFocused();

    await checkNoHydrationErrors(errors);
  });

  test("toolbar section keeps arrow/Home/End navigation working", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "toolbar");

    const toolbar = section.getByRole("toolbar", { name: "Text formatting toolbar" }).first();
    await expect(toolbar).toBeVisible();

    const bold = toolbar.getByRole("button", { name: "Bold" }).first();
    const italic = toolbar.getByRole("button", { name: "Italic" }).first();
    const underline = toolbar.getByRole("button", { name: "Underline" }).first();

    await bold.focus();
    await page.keyboard.press("ArrowRight");
    await expect(italic).toBeFocused();

    await page.keyboard.press("End");
    await expect(underline).toBeFocused();

    await page.keyboard.press("Home");
    await expect(bold).toBeFocused();

    await checkNoHydrationErrors(errors);
  });

  test("actionbar section supports keyboard navigation and escape clear", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "actionbar");

    const toolbar = section.getByRole("toolbar", { name: "Bulk actions toolbar" }).first();
    await expect(toolbar).toBeVisible();

    const clear = toolbar.getByRole("button", { name: "Clear selection" }).first();
    const archive = toolbar.getByRole("button", { name: "Archive" }).first();
    const del = toolbar.getByRole("button", { name: "Delete" }).first();

    await archive.focus();
    await page.keyboard.press("ArrowRight");
    await expect(del).toBeFocused();

    await page.keyboard.press("Home");
    await expect(clear).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(section.getByRole("toolbar", { name: "Bulk actions toolbar" })).toHaveCount(0);

    await section.getByRole("button", { name: "+1 selected" }).click();
    await expect(
      section.getByRole("toolbar", { name: "Bulk actions toolbar" }).first(),
    ).toBeVisible();

    await checkNoHydrationErrors(errors);
  });

  test("menu section opens and exposes menuitems", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "menu");

    const trigger = section.getByRole("button", { name: /actions/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const menu = page.locator('ul[role="menu"]').first();
    await expect(menu).toBeVisible();
    await expect(menu.locator('[role="menuitem"]').first()).toBeVisible();

    await checkNoHydrationErrors(errors);
  });

  test("table section exposes tabbable grid and keyboard row selection", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "table");

    const grid = section.getByRole("grid", { name: "Team members" }).first();
    await expect(grid).toBeVisible();
    await expect(grid).toHaveAttribute("tabindex", "0");

    await grid.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");

    const selectedSummary = section.locator("p", { hasText: "Selected:" }).first();
    await expect(selectedSummary).toBeVisible();
    await expect(selectedSummary).not.toContainText("None");

    await checkNoHydrationErrors(errors);
  });

  test("gridlist section supports keyboard selection from focused grid", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "gridlist");

    const grid = section.getByRole("grid", { name: "File categories" }).first();
    await expect(grid).toBeVisible();
    await expect(grid).toHaveAttribute("tabindex", "0");

    await grid.focus();
    // Selection lives on the row hook (matching upstream useSelectableCollection,
    // which has no Space/Enter case), so ArrowDown first carries real DOM focus
    // onto a row before Space toggles it.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");

    const selectedSummary = section.locator("p", { hasText: "Selected:" }).first();
    await expect(selectedSummary).toBeVisible();
    await expect(selectedSummary).not.toContainText("None");

    await checkNoHydrationErrors(errors);
  });

  test("tree section supports keyboard selection from focused treegrid", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "tree");

    const tree = section.getByRole("treegrid", { name: "Project structure" }).first();
    await expect(tree).toBeVisible();
    await expect(tree).toHaveAttribute("tabindex", "0");

    await tree.focus();
    await page.keyboard.press("Space");

    const selectedSummary = section.locator("p", { hasText: "Selected:" }).first();
    await expect(selectedSummary).toBeVisible();
    await expect(selectedSummary).not.toContainText("None");

    await checkNoHydrationErrors(errors);
  });

  test("tree section expands and collapses nested branches from expand buttons", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "tree");

    const getUtilsRow = () => section.locator('[role="row"]').filter({ hasText: "utils" }).first();

    await expect(getUtilsRow()).toBeVisible();
    await expect(getUtilsRow().getByRole("button")).toHaveAttribute("aria-label", "Expand");

    await getUtilsRow().getByRole("button").click();
    await expect(section.getByText("helpers.ts")).toBeVisible();
    await expect(getUtilsRow().getByRole("button")).toHaveAttribute("aria-label", "Collapse");

    await getUtilsRow().getByRole("button").click();
    await expect(section.getByText("helpers.ts")).toHaveCount(0);
    await expect(getUtilsRow().getByRole("button")).toHaveAttribute("aria-label", "Expand");

    await checkNoHydrationErrors(errors);
  });

  test("calendar section supports month navigation and updates selection text", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "calendar");

    const heading = section.locator("header h2").first();
    await expect(heading).toBeVisible();
    const beforeHeading = await heading.textContent();

    await section.getByRole("button", { name: "Next month" }).first().click();
    const afterHeading = await heading.textContent();
    expect(afterHeading).toBeTruthy();
    expect(afterHeading).not.toBe(beforeHeading);

    const dayButton = section.locator('div[role="button"]').filter({ hasText: /^15$/ }).first();
    await expect(dayButton).toBeVisible();
    await dayButton.click();

    const selectedText = section.locator("p", { hasText: "Selected:" }).first();
    await expect(selectedText).toBeVisible();
    await expect(selectedText).not.toContainText("None");

    await checkNoHydrationErrors(errors);
  });

  test("alert section exposes alert role and supports dismissible alerts", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "alert");

    await expect(section.getByRole("alert")).toHaveCount(4);
    await expect(section).toContainText("Something went wrong.");

    await section.getByRole("button", { name: "Dismiss" }).first().click();
    await expect(section.getByRole("alert")).toHaveCount(4);
    await expect(page.getByText("Last action: Alert dismissed")).toBeVisible();

    await checkNoHydrationErrors(errors);
  });

  test("dropzone section exposes drop target semantics and handles drop callbacks", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "dropzone");

    const activeZone = section.getByTestId("dropzone-active");
    const disabledZone = section.getByTestId("dropzone-disabled");
    await expect(activeZone).toBeVisible();
    await expect(disabledZone).toBeVisible();

    await expect(section.getByRole("button", { name: "Upload files drop zone" })).toHaveCount(1);
    await expect(section.getByRole("button", { name: "Disabled drop zone" })).toBeDisabled();

    await activeZone.evaluate((element) => {
      const dataTransfer = new DataTransfer();
      const event = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer });
      element.dispatchEvent(event);
    });
    await expect(page.getByText("Last action: DropZone: drop event")).toBeVisible();

    await expect(disabledZone).toHaveAttribute("data-disabled", "true");

    await checkNoHydrationErrors(errors);
  });

  test("filetrigger section forwards file selection and keeps disabled trigger inert", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "filetrigger");

    const input = section.locator('input[type="file"]').first();
    await input.setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from("file-content"),
    });

    await expect(page.getByText("Last action: File selected: avatar.png")).toBeVisible();
    await expect(section.locator('input[type="file"]').nth(1)).toBeDisabled();

    await checkNoHydrationErrors(errors);
  });

  test("disclosure section supports keyboard toggle on headless disclosure", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "disclosure");

    const trigger = section.getByRole("button", { name: "Headless Toggle" }).first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await checkNoHydrationErrors(errors);
  });

  test("disclosure accordion section keeps single-expand behavior", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "disclosure");

    const section1 = section.getByRole("button", { name: "Section 1: Introduction" }).first();
    const section2 = section.getByRole("button", { name: "Section 2: Features" }).first();

    await section1.click();
    await expect(section1).toHaveAttribute("aria-expanded", "true");

    await section2.click();
    await expect(section2).toHaveAttribute("aria-expanded", "true");
    await expect(section1).toHaveAttribute("aria-expanded", "false");

    await checkNoHydrationErrors(errors);
  });

  test("contextualhelp section opens dialog with trigger linkage and closes on Escape", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "contextualhelp");

    const trigger = section.getByRole("button", { name: "What is this?" }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page
      .getByRole("dialog")
      .filter({ hasText: "This setting controls the behavior of the feature." })
      .first();
    await expect(dialog).toBeVisible();

    const triggerId = await trigger.getAttribute("id");
    expect(triggerId).toBeTruthy();
    if (!triggerId) {
      throw new Error("ContextualHelp trigger missing id");
    }
    await expect(dialog).toHaveAttribute("aria-labelledby", triggerId);

    const dialogId = await dialog.getAttribute("id");
    expect(dialogId).toBeTruthy();
    if (!dialogId) {
      throw new Error("ContextualHelp dialog missing id");
    }
    await expect(trigger).toHaveAttribute("aria-controls", dialogId);

    await page.keyboard.press("Escape");
    await expect(
      page
        .getByRole("dialog")
        .filter({ hasText: "This setting controls the behavior of the feature." }),
    ).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("contextualhelp section closes on outside interaction", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "contextualhelp");

    const trigger = section.getByRole("button", { name: "Advanced Configuration" }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page
      .getByRole("dialog")
      .filter({ hasText: "This option is for advanced users." })
      .first();
    await expect(dialog).toBeVisible();

    await page.locator("body").click({ position: { x: 1, y: 1 } });
    await expect(
      page.getByRole("dialog").filter({ hasText: "This option is for advanced users." }),
    ).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("toast section renders notification region and toasts from trigger buttons", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "toast");

    await section.getByRole("button", { name: "Success Toast" }).first().click();

    const region = page.getByRole("region", { name: "Notifications" }).first();
    await expect(region).toBeVisible();

    // The first toast shows on its own. Wait for it to render before queuing the
    // next so both register (one click per animation frame, as a user would).
    await expect(region.getByRole("alertdialog")).toHaveCount(1);
    await expect(region).toContainText("Changes saved successfully!");

    // Adding a second toast collapses the stack: S2 keeps only the front (most
    // recent) toast as a live alertdialog and tucks the rest behind it as
    // presentational slivers until the front toast's "Show all" control expands
    // them.
    await section.getByRole("button", { name: "Error Toast" }).first().click();
    await expect(region.getByRole("alertdialog")).toHaveCount(1);
    await expect(region).toContainText("Something went wrong. Please try again.");

    await region.getByRole("button", { name: "Show all" }).click();
    await expect(region.getByRole("alertdialog")).toHaveCount(2);
    await expect(region).toContainText("Changes saved successfully!");

    await checkNoHydrationErrors(errors);
  });

  test("toast section links title/description ids and supports dismiss", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "toast");

    await section.getByRole("button", { name: "With Description" }).first().click();

    const toast = page.getByRole("alertdialog").filter({ hasText: "Custom Toast" }).first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(
      "This toast has both title and description with a longer timeout.",
    );

    const labelledBy = await toast.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    if (!labelledBy) {
      throw new Error("Toast missing aria-labelledby");
    }
    await expect(toast.locator(`#${labelledBy}`)).toHaveCount(1);

    const describedBy = await toast.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (!describedBy) {
      throw new Error("Toast missing aria-describedby");
    }
    await expect(toast.locator(`#${describedBy}`)).toHaveCount(1);

    await toast.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("alertdialog").filter({ hasText: "Custom Toast" })).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("tooltip section opens with role=tooltip and stays open on non-press keys", async ({
    page,
  }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "tooltip");

    const trigger = section.getByRole("button", { name: "Delayed tooltip" }).first();
    await expect(trigger).toBeVisible();
    await trigger.hover();

    const tooltip = page
      .locator('[role="tooltip"]', { hasText: "This tooltip has a 500ms delay" })
      .first();
    await expect(tooltip).toBeVisible();

    await trigger.focus();
    await page.keyboard.press("ArrowRight");
    await expect(tooltip).toBeVisible();

    await checkNoHydrationErrors(errors);
  });

  test("tooltip section closes on Escape", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "tooltip");

    const trigger = section.getByRole("button", { name: "Delayed tooltip" }).first();
    await expect(trigger).toBeVisible();
    await trigger.hover();

    const tooltip = page
      .locator('[role="tooltip"]', { hasText: "This tooltip has a 500ms delay" })
      .first();
    await expect(tooltip).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.locator('[role="tooltip"]', { hasText: "This tooltip has a 500ms delay" }),
    ).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("popover section opens with dialog semantics and closes on Escape", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "popover");

    const trigger = section.getByTestId("popover-bottom-trigger").first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const popover = page.getByTestId("popover-bottom").first();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveAttribute("role", "dialog");
    await expect(popover.getByRole("heading", { name: "Bottom Popover" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("popover-bottom")).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("popover section closes on outside interaction", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "popover");

    const trigger = section.getByTestId("popover-actions-trigger").first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const popover = page.getByTestId("popover-actions").first();
    await expect(popover).toBeVisible();

    await page.evaluate(() => {
      const eventInit = {
        bubbles: true,
        composed: true,
        button: 0,
        buttons: 1,
        clientX: 8,
        clientY: 8,
      };

      document.body.dispatchEvent(
        new PointerEvent("pointerdown", {
          ...eventInit,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
      document.body.dispatchEvent(new MouseEvent("click", eventInit));
    });
    await expect(page.getByTestId("popover-actions")).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("dialog section opens with modal semantics and closes on Escape", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "dialog");

    await section.getByRole("button", { name: "Open Dialog" }).first().click();
    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Welcome!" }).first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });

  test("alertdialog section exposes alertdialog role and action buttons", async ({ page }) => {
    const errors = await setupErrorCapture(page);
    const section = await ensureSectionVisible(page, "alertdialog");

    await section.getByRole("button", { name: "Delete Item" }).first().click();
    const alertDialog = page.getByRole("alertdialog").first();
    await expect(alertDialog).toBeVisible();
    await expect(alertDialog.getByRole("heading", { name: "Delete Item" })).toBeVisible();
    await expect(alertDialog.getByRole("button", { name: "Delete" })).toBeVisible();
    await expect(alertDialog.getByRole("button", { name: "Cancel" })).toBeVisible();

    await alertDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);

    await checkNoHydrationErrors(errors);
  });
});
