import { test, expect, type Page } from "@playwright/test";
import { routes } from "./helpers/routes";

/**
 * Roving-tabindex focus contract for the Solidaria Menu.
 *
 * Arrow/Home/End keys must move REAL DOM focus onto the focused menu item, not
 * just flip its tabIndex. Without real focus moving, the screen-reader cursor
 * never follows keyboard navigation and the menu is unusable with assistive
 * technology. This mirrors React Aria's `useSelectableItem`, which focuses the
 * item element whenever it becomes the collection's `focusedKey`.
 */

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
}

test.describe("Menu roving focus", () => {
  test("arrow/Home/End move real DOM focus to the focused menu item", async ({ page }) => {
    await page.goto(routes.docsComponent("menu"));
    await waitForPageReady(page);

    // The "Basic Usage" example: trigger labelled "Actions" with three items.
    const trigger = page.getByRole("button", { name: "Actions" }).first();
    await expect(trigger).toBeVisible();

    await trigger.click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    const newFile = menu.getByRole("menuitem", { name: "New file" });
    const open = menu.getByRole("menuitem", { name: "Open" });
    const save = menu.getByRole("menuitem", { name: "Save" });

    // ArrowDown from the freshly-opened menu lands real focus on the first item.
    await page.keyboard.press("ArrowDown");
    await expect(newFile).toBeFocused();

    // Continuing down moves focus to the next item.
    await page.keyboard.press("ArrowDown");
    await expect(open).toBeFocused();

    // ArrowUp moves focus back up.
    await page.keyboard.press("ArrowUp");
    await expect(newFile).toBeFocused();

    // End jumps focus to the last item; Home back to the first.
    await page.keyboard.press("End");
    await expect(save).toBeFocused();

    await page.keyboard.press("Home");
    await expect(newFile).toBeFocused();

    // The focused item is the active element, and it is the tabbable one.
    await expect(newFile).toHaveAttribute("tabindex", "0");

    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
});
